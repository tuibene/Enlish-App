const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper: detect resource_type for Cloudinary
function getResourceType(mimetype) {
    if (mimetype.startsWith('image/') || mimetype === 'application/pdf') return 'image';
    if (mimetype.startsWith('video/') || mimetype.startsWith('audio/')) return 'video';
    return 'raw'; // Word docs, etc.
}

router.post('/', protect, admin, upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const resourceType = getResourceType(req.file.mimetype);
        const ext = path.extname(req.file.originalname);

        // Upload buffer to Cloudinary via stream
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: 'english-learning/uploads',
                    // Always append extension for raw files to ensure proper format (important for PDFs)
                    public_id: resourceType === 'raw'
                        ? `${req.file.fieldname}-${Date.now()}${ext}`
                        : `${req.file.fieldname}-${Date.now()}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        // Return the Cloudinary secure URL
        res.json(result.secure_url);
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Failed to upload file to cloud storage.' });
    }
});

router.post('/base64', protect, admin, async (req, res) => {
    const { file, fileName } = req.body;

    if (!file) {
        return res.status(400).json({ message: 'No file data provided.' });
    }

    try {
        console.log(`Uploading base64 file: ${fileName || 'unnamed'}`);
        
        // Upload base64 string to Cloudinary
        const result = await cloudinary.uploader.upload(file, {
            resource_type: 'auto',
            folder: 'english-learning/uploads',
            public_id: fileName 
                ? `${path.parse(fileName).name}-${Date.now()}` 
                : `upload-${Date.now()}`
        });

        console.log('Base64 upload success:', result.secure_url);
        res.json(result.secure_url);
    } catch (error) {
        console.error('Cloudinary base64 upload error:', error);
        res.status(500).json({ 
            message: 'Failed to upload base64 to cloud storage.',
            error: error.message 
        });
    }
});

module.exports = router;
