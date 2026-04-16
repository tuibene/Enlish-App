const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');

const tracks = [
    {
        filename: 'coffee-chat.mp3',
        text: "Welcome to StarBrew. What can I get for you today? Hi, I'd like a medium iced caramel macchiato, please. Can I get that with almond milk instead of regular milk? Absolutely. Would you like whipped cream on top? It comes included with the caramel macchiato. No whipped cream, thank you. Oh, and can I also have one of those chocolate chip muffins? Sure thing. That'll be eight dollars and fifty cents."
    },
    {
        filename: 'airport-announcement.mp3',
        text: "Attention all passengers traveling on Flight 8 1 2 to New York. This is a gate change announcement. Your departure gate has been changed from Gate B 4 to Gate C 12. Once again, passengers on Flight 8 1 2 to New York, please proceed immediately to Gate C 12. Boarding will commence in approximately ten minutes. We apologize for any inconvenience this may cause and thank you for flying with us."
    }
];

async function createAudios() {
    for (const track of tracks) {
        try {
            console.log(`Generating audio for ${track.filename}...`);
            const base64AudioList = await googleTTS.getAllAudioBase64(track.text, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
                timeout: 10000,
            });

            const buffers = base64AudioList.map(item => Buffer.from(item.base64, 'base64'));
            const buffer = Buffer.concat(buffers);
            const outputPath = path.join(__dirname, '../frontend/public/', track.filename);
            fs.writeFileSync(outputPath, buffer);
            console.log('Saved audio to', outputPath);
        } catch (e) {
            console.error('Error generating audio:', e);
        }
    }
}

createAudios();
