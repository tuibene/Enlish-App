require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadAudio = async () => {
    try {
        const audioPath = path.join(__dirname, '../frontend/public/placement-audio.mp3');
        console.log('Uploading audio to Cloudinary from:', audioPath);
        
        const result = await cloudinary.uploader.upload(audioPath, {
            resource_type: "video", // Audio is counted as video in cloudinary
            public_id: "placement-audio",
            folder: "english-learning/audios"
        });
        
        console.log('Upload successful!');
        console.log('Secure URL:', result.secure_url);
    } catch (error) {
        console.error('Upload failed:', error);
    }
};

uploadAudio();
