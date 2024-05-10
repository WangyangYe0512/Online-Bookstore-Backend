const mongoose = require('mongoose');

const bookshelfSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    access: {
        type: String,
        enum: ['PUBLIC', 'PRIVATE'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },
    volumeCount: {
        type: Number,
        required: true
    },
    volumesLastUpdated: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userName: {
        type: String,
        required: true,
        ref: 'User'
    }
});

const Bookshelf = mongoose.model('Bookshelf', bookshelfSchema,'Bookshelves');

module.exports = Bookshelf;