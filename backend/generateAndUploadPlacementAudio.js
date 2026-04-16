const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PlacementConfig = require('./src/models/PlacementConfig');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// The listening passage text matching the question about AI and workforce
const listeningText = `Good morning everyone. In today's presentation, we will explore the profound impact of Artificial Intelligence on the modern workforce. While media often highlights the fear of job displacement, recent economic data paints a different picture. According to the World Economic Forum, by 2025, AI is expected to displace 85 million jobs globally, but it will simultaneously create 97 million new roles. This net positive growth strongly suggests that the central theme of our technological future is not unemployment, but rather an urgent need for workforce reskilling. The key evidence lies in the rising demand for data analysts and AI specialists across all major industries. Furthermore, sectors such as healthcare, renewable energy, and cybersecurity are showing unprecedented growth in job openings that require a blend of human creativity and technical expertise. In conclusion, rather than fearing AI, we should embrace it as a catalyst for professional development and lifelong learning.`;

async function main() {
    try {
        // Step 1: Generate audio using Google TTS
        console.log('📢 Step 1: Generating audio with Google TTS...');
        const base64AudioList = await googleTTS.getAllAudioBase64(listeningText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        const buffers = base64AudioList.map(item => Buffer.from(item.base64, 'base64'));
        const audioBuffer = Buffer.concat(buffers);

        const tempAudioPath = path.join(__dirname, 'temp-placement-audio.mp3');
        fs.writeFileSync(tempAudioPath, audioBuffer);
        console.log(`✅ Audio generated successfully (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

        // Step 2: Upload to Cloudinary
        console.log('\n☁️  Step 2: Uploading to Cloudinary...');
        const uploadResult = await cloudinary.uploader.upload(tempAudioPath, {
            resource_type: 'video', // Cloudinary treats audio as "video" type
            public_id: 'placement-listening-audio',
            folder: 'english-learning/placement',
            overwrite: true,
        });

        const audioUrl = uploadResult.secure_url;
        console.log(`✅ Upload successful!`);
        console.log(`   URL: ${audioUrl}`);

        // Step 3: Update MongoDB PlacementConfig
        console.log('\n🗄️  Step 3: Updating database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('   MongoDB connected.');

        // Update existing config or create new one
        const existingConfig = await PlacementConfig.findOne();
        if (existingConfig) {
            existingConfig.listeningAudioUrl = audioUrl;
            await existingConfig.save();
            console.log('✅ Updated existing PlacementConfig with new audio URL.');
        } else {
            await PlacementConfig.create({ listeningAudioUrl: audioUrl });
            console.log('✅ Created new PlacementConfig with audio URL.');
        }

        // Cleanup temp file
        fs.unlinkSync(tempAudioPath);
        console.log('\n🧹 Temp file cleaned up.');

        console.log('\n🎉 All done! The placement test audio is now live.');
        console.log(`   Cloudinary URL: ${audioUrl}`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        // Cleanup temp file if it exists
        const tempPath = path.join(__dirname, 'temp-placement-audio.mp3');
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        process.exit(1);
    }
}

main();
