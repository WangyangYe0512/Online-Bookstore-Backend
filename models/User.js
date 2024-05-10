const mongoose = require('mongoose');
// User model
const userSchema = new mongoose.Schema({
	userName: String,
	firstName: String,
	lastName: String,
	email: String,
	passwordHash: String,
	address: {
		street: String,
		Apt: String,
		city: String,
		province: String,
		zip: String
	},
	phone: String,
	token: String,
	userRole: {
		type: String,
		enum: ['customer', 'admin'],
		default: 'customer'
	},
	active: {
		type: Boolean,
		default: true
	},
	verified: {
		type: Boolean,
		default: false
	},
	});

const User = mongoose.model('User', userSchema, 'Users');

module.exports = User;