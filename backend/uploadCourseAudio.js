const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
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

        for (let i = 0; i < course.days.length; i++) {
            const day = course.days[i];
            if (day.tasks && day.tasks.listening && day.tasks.listening.transcript) {
                console.log(`\n📢 Processing Day ${day.dayNumber} Audio...`);
                
                // Truncate transcript to 200 chars for TTS to stay within google-tts limits
                const shortTranscript = day.tasks.listening.transcript.substring(0, 200) + '...';
                
                const base64AudioList = await googleTTS.getAllAudioBase64(shortTranscript, {
                    lang: 'en',
                    slow: false,
                    host: 'https://translate.google.com',
                    timeout: 10000,
                });

                const buffers = base64AudioList.map(item => Buffer.from(item.base64, 'base64'));
                const audioBuffer = Buffer.concat(buffers);

                const tempAudioPath = path.join(__dirname, `temp-course-audio-day${day.dayNumber}.mp3`);
                fs.writeFileSync(tempAudioPath, audioBuffer);
                
                console.log(`☁️  Uploading to Cloudinary...`);
                const uploadResult = await cloudinary.uploader.upload(tempAudioPath, {
                    resource_type: 'video', // Cloudinary treats audio as video
                    public_id: `premium-course-day${day.dayNumber}-audio`,
                    folder: 'english-learning/courses/premium',
                    overwrite: true,
                });

                course.days[i].tasks.listening.audioUrl = uploadResult.secure_url;
                course.days[i].tasks.listening.cloudinaryPublicId = uploadResult.public_id;
                
                console.log(`✅ Upload successful: ${uploadResult.secure_url}`);

                // Clean up
                fs.unlinkSync(tempAudioPath);
            }
        }
        
        await course.save();
        console.log('\n🎉 Successfully updated all days with Cloudinary audio!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
