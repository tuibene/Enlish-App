const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    updateUserRole,
} = require('../controllers/authController');
const { protect, admin, root } = require('../middleware/authMiddleware');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const multer = require('multer');

// Use memory storage - avatars will be uploaded to Cloudinary in the controller
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5000000 } // 5MB limit
});

router.route('/')
    .post(registerUser)
    .get(protect, admin, getUsers);

router.route('/:id/role').put(protect, root, updateUserRole);

router.post('/login', authUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.any(), updateUserProfile);

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        const token = generateToken(req.user._id);
        // Redirect to frontend dashboard with token in URL or cookie 
        // For simplicity, returning via redirect query or setting cookie. 
        // Best approach is a frontend route that grabs token from query and saves it.
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    }
);

module.exports = router;
