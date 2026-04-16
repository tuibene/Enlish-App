const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure avatars directory exists
const avatarsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, avatarsDir);
    },
    filename(req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 } // 5MB limit
});

router.route('/')
    .post(registerUser)
    .get(protect, admin, getUsers);

router.post('/login', authUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('avatar'), updateUserProfile);

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
