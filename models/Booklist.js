const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    hidden: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
    }
  });

const booklistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    booklistId: {
        type: String,
        required: true,
        ref: 'Booklist',
        unique: true
    },
    totalItems: {
        type: Number,
        default: 0
    },
    items: [{
        type: mongoose.Schema.Types.Mixed
    }],
    reviews: [reviewSchema]
});

const Booklist = mongoose.model('Booklist', booklistSchema, 'Booklists');

module.exports = Booklist;