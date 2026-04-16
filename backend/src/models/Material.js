const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    pdfUrl: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        required: [true, 'Please add the markdown content']
    },
    type: {
        type: String,
        enum: ['VOCABULARY', 'GRAMMAR', 'READING', 'GENERAL'],
        default: 'GENERAL',
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
