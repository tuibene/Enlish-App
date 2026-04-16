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
        const audioPath = path.join(__dirname, '../frontend/public/ielts-lecture.mp3');
        console.log('📢 Uploading IELTS Mock Listening audio to Cloudinary...');
        console.log('   Source:', audioPath);

        const result = await cloudinary.uploader.upload(audioPath, {
            resource_type: 'video', // Cloudinary treats audio as "video"
            public_id: 'ielts-mock-listening-lecture',
            folder: 'english-learning/ielts-mock',
            overwrite: true,
        });

        console.log('\n✅ Upload successful!');
        console.log('   Secure URL:', result.secure_url);
        console.log('   Public ID:', result.public_id);
        console.log('   Format:', result.format);
        console.log('   Size:', (result.bytes / 1024).toFixed(1), 'KB');
        console.log('\n📋 Copy this URL to update the frontend code:');
        console.log(`   ${result.secure_url}`);
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
    }
};

uploadAudio();
