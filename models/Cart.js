const mongoose = require('mongoose');

// Create book schema
const bookSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    thumbnail: {
        type: String,
        required: true
    }
});
// Create item schema
const itemSchema = new mongoose.Schema({
    book: bookSchema,
    quantity: {
        type: Number,
        required: true,
        min: 1  // quantity must be at least 1
    },
    price: {
        type: Number,
        required: true,
        min: 0  // price must be at least 0
    }
});

// Create cart schema
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    items: [itemSchema]  // quatities of books in the cart
});

// Create cart model
const Cart = mongoose.model('Cart', cartSchema, "Carts");

module.exports = Cart;