const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk - files will be uploaded to Cloudinary
const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
    const filetypes = /pdf|doc|docx|mp3|wav|m4a|webm|mp4|jpg|jpeg|png|webp|svg|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: PDFs, Word, Audio, Video, and Image files Only!');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 50000000 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
