const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const vnpayService = require('../services/vnpayService');

// @desc    Create VNPay payment URL for purchasing a course
// @route   POST /api/payment/create_payment_url
// @access  Private
const createPaymentUrl = asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    
    if (!courseId) {
        res.status(400);
        throw new Error('Course ID is required');
    }

    const course = await Course.findById(courseId);
    const user = await User.findById(req.user._id);

    if (!course || !user) {
        res.status(404);
        throw new Error('Course or User not found');
    }

    if (!course.isPremium) {
        res.status(400);
        throw new Error('This course is free and does not require purchase.');
    }

    if (user.purchasedCourses && user.purchasedCourses.includes(course._id)) {
        res.status(400);
        throw new Error('You already own this course.');
    }

    let ipAddr = req.headers['x-forwarded-for'] ||
                   req.connection?.remoteAddress ||
                   req.socket?.remoteAddress ||
                   req.connection?.socket?.remoteAddress || '127.0.0.1';
    
    // VNPay does not like IPv6 loopback or might have issues, fallback to a safe local IP
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
        ipAddr = '127.0.0.1';
    }

    // Generate unique TxnRef (e.g., combination of timestamp and random number)
    const vnpTxnRef = Date.now().toString() + Math.floor(Math.random() * 1000).toString();

    // Create a pending order
    const order = await Order.create({
        user: user._id,
        course: course._id,
        amount: Math.round(course.price),
        status: 'pending',
        vnpTxnRef: vnpTxnRef
    });

    const orderInfo = `Pay for course ID ${course._id}`;
    
    try {
        const paymentUrl = vnpayService.createPaymentUrl(orderInfo, course.price, ipAddr, vnpTxnRef);
        res.json({ paymentUrl });
    } catch (error) {
        console.error("Error creating VNPay URL:", error);
        res.status(500);
        throw new Error('Failed to create payment URL. Please check VNPay configuration.');
    }
});

// @desc    VNPay IPN URL (Server-to-Server callback)
// @route   GET /api/payment/vnpay_ipn
// @access  Public
const vnpayIPN = asyncHandler(async (req, res) => {
    let vnpParams = req.query;
    const secureHash = vnpParams['vnp_SecureHash'];

    const isValid = vnpayService.verifyReturnUrl(req.query);
    
    if (isValid) {
        const orderId = vnpParams['vnp_TxnRef'];
        const rspCode = vnpParams['vnp_ResponseCode'];

        // Find the pending order
        const order = await Order.findOne({ vnpTxnRef: orderId });
        
        if (order) {
            // Check amount
            if (order.amount * 100 === Number(vnpParams['vnp_Amount'])) {
                if (order.status === 'pending') {
                    if (rspCode === '00') {
                        // Payment successful
                        order.status = 'paid';
                        order.vnpayData = vnpParams;
                        await order.save();

                        // Add course to user's purchased courses
                        const user = await User.findById(order.user);
                        if (user && !user.purchasedCourses.includes(order.course)) {
                            user.purchasedCourses.push(order.course);
                            await user.save();
                        }
                        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    } else {
                        // Payment failed
                        order.status = 'failed';
                        order.vnpayData = vnpParams;
                        await order.save();
                        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    }
                } else {
                    return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
                }
            } else {
                return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
            }
        } else {
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
    } else {
        return res.status(200).json({ RspCode: '97', Message: 'Invalid checksum' });
    }
});

// @desc    VNPay Return URL (Redirect from VNPay to frontend)
// @route   GET /api/payment/vnpay_return
// @access  Public
const vnpayReturn = asyncHandler(async (req, res) => {
    const isValid = vnpayService.verifyReturnUrl(req.query);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (isValid) {
        const rspCode = req.query['vnp_ResponseCode'];
        const courseIdMatch = req.query['vnp_OrderInfo'] ? req.query['vnp_OrderInfo'].match(/ID ([a-f0-9]{24})/) : null;
        const courseId = courseIdMatch ? courseIdMatch[1] : '';

        if (rspCode === '00') {
            // Success
            // LOCALHOST FALLBACK: Since VNPay server cannot reach localhost IPN, 
            // we process the order update here when the user is redirected back.
            const orderId = req.query['vnp_TxnRef'];
            const order = await Order.findOne({ vnpTxnRef: orderId });
            
            if (order && order.status === 'pending') {
                order.status = 'paid';
                order.vnpayData = req.query;
                await order.save();

                const userToUpdate = await User.findById(order.user);
                if (userToUpdate && !userToUpdate.purchasedCourses.includes(order.course)) {
                    userToUpdate.purchasedCourses.push(order.course);
                    await userToUpdate.save();
                }
            }

            res.redirect(`${frontendUrl}/payment/result?status=success&courseId=${courseId}&amount=${req.query['vnp_Amount']}`);
        } else {
            // Failed
            res.redirect(`${frontendUrl}/payment/result?status=failed&code=${rspCode}`);
        }
    } else {
        // Invalid checksum
        res.redirect(`${frontendUrl}/payment/result?status=failed&code=97`);
    }
});

module.exports = {
    createPaymentUrl,
    vnpayIPN,
    vnpayReturn
};
