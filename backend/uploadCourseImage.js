const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected.');

        const course = await Course.findOne({ isPremium: true });
        if (!course) {
            console.log('Premium course not found!');
            process.exit(1);
        }

        console.log(`☁️  Uploading to Cloudinary...`);
        const uploadResult = await cloudinary.uploader.upload(
            path.resolve(__dirname, '../frontend/public/images/bg-dark.png'), 
            {
                public_id: `premium-course-cover`,
                folder: 'english-learning/courses',
                overwrite: true,
            }
        );

        course.image = uploadResult.secure_url;
        course.cloudinaryPublicId = uploadResult.public_id; // Need to ensure the schema has this on root
        await course.save();

        console.log(`✅ Upload successful: \${uploadResult.secure_url}`);
        console.log('\\n🎉 Successfully updated course cover image on Cloudinary!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
