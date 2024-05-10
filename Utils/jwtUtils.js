const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const bcrypt = require('bcrypt');

const TOKEN_KEY=process.env.TOKEN_KEY;
const TOKEN_EXPIRATION = 60 * 60 * 24 // 24h
// Generate JWT
function generateToken(payload) {
    return jwt.sign(payload, TOKEN_KEY, { expiresIn: TOKEN_EXPIRATION });
}

// Verify JWT
function verifyToken(token) {
    try {
        return jwt.verify(token, TOKEN_KEY);
    } catch (error) {
        return null;
    }
}

// Authenticate user
async function authenticateUser(email, password) {
	// Find the user in the database
	const user = await User.findOne({ email: email }).exec();
	if (user) {
			// Compare passwords
			const isMatch = await bcrypt.compare(password, user.passwordHash);
			if (isMatch) {
					// Passwords match
					return user;
			}
	}
	// Passwords do not match
	return null;
}


// Authenticate JWT
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(401); // No token found

	const user = verifyToken(token);
	if (!user) return res.sendStatus(403); // Token verification failed

	req.user = user;
	next();
}

module.exports = { generateToken, verifyToken, authenticateToken, authenticateUser };