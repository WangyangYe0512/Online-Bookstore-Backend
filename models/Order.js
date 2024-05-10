const mongoose = require('mongoose');

// create order item schema
const orderItemSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1  // quantity must be at least 1
    },
    price: {
        type: Number,
        required: true
    }
});

// create order schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    items: [orderItemSchema],  // items in the order
    totalPrice: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['paid', 'shipped', 'pending', 'delivered', 'cancelled', 'returned', 'refunded', 'completed'],
        default: 'pending'
    }
});

// create order model
const Order = mongoose.model('Order', orderSchema, 'Orders');

module.exports = Order;