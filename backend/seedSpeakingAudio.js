const googleTTS = require('google-tts-api');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const TEMP_DIR = path.join(__dirname, 'temp_audio');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

const downloadAudio = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(dest);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const processSpeakingTasks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        const masterclass = await Course.findOne({ isPremium: true });
        if (!masterclass) {
            console.log('Premium course not found!');
            process.exit(1);
        }

        let updatedCount = 0;

        for (const day of masterclass.days) {
            if (day.tasks && day.tasks.speaking && day.tasks.speaking.prompt) {
                const promptText = day.tasks.speaking.prompt;
                if (!day.tasks.speaking.audioUrl || !day.tasks.speaking.cloudinaryPublicId) {
                    console.log(`Processing Day \${day.dayNumber} Speaking: "\${promptText.substring(0, 30)}..."`);
                    
                    try {
                        const ttsUrl = googleTTS.getAudioUrl(promptText.substring(0, 199), {
                            lang: 'en',
                            slow: false,
                            host: 'https://translate.google.com',
                        });

                        const fileName = `speaking-prompt-day-\${day.dayNumber}-\${crypto.randomBytes(4).toString('hex')}.mp3`;
                        const destPath = path.join(TEMP_DIR, fileName);

                        await downloadAudio(ttsUrl, destPath);

                        const uploadResult = await cloudinary.uploader.upload(destPath, {
                            resource_type: 'video', // Audio uploads as video in Cloudinary technically
                            folder: 'english-learning/speaking-prompts',
                            public_id: `premium-speaking-day-\${day.dayNumber}`
                        });

                        day.tasks.speaking.audioUrl = uploadResult.secure_url;
                        day.tasks.speaking.cloudinaryPublicId = uploadResult.public_id;
                        updatedCount++;

                        fs.unlinkSync(destPath);
                        console.log(`✅ Uploaded Day \${day.dayNumber} Audio`);
                    } catch (err) {
                         console.error(`❌ Failed on Day \${day.dayNumber}:`, err.message);
                    }
                }
            }
        }

        if (updatedCount > 0) {
            await masterclass.save();
            console.log(`🎉 Successfully generated and uploaded \${updatedCount} speaking audio prompts.`);
        } else {
            console.log('No missing audio generating needed.');
        }

        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

processSpeakingTasks();
