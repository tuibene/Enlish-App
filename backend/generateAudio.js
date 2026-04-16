const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');

const text = "Good morning everyone. In today's presentation, we will explore the profound impact of Artificial Intelligence on the modern workforce. While media often highlights the fear of job displacement, recent economic data paints a different picture. According to the World Economic Forum, by 2025, AI is expected to displace 85 million jobs globally, but it will simultaneously create 97 million new roles. This net positive growth strongly suggests that the central theme of our technological future is not unemployment, but rather an urgent need for workforce reskilling. The key evidence lies in the rising demand for data analysts and AI specialists across all major industries.";

async function createAudio() {
    try {
        console.log('Generating audio...');
        const base64AudioList = await googleTTS.getAllAudioBase64(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        const buffers = base64AudioList.map(item => Buffer.from(item.base64, 'base64'));
        const buffer = Buffer.concat(buffers);
        const outputPath = path.join(__dirname, '../frontend/public/placement-audio.mp3');
        fs.writeFileSync(outputPath, buffer);
        console.log('Saved audio to', outputPath);
    } catch (e) {
        console.error('Error generating audio:', e);
    }
}

createAudio();
