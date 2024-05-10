const express = require('express');
const router = express.Router();
const { generateToken, authenticateUser, authenticateToken, verifyToken } = require('../Utils/jwtUtils.js');
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { sendVerificationEmail } = require('../Utils/mailVerify')

/* POST /secure/register
	description: Register a new user
	Params: email, password, username
	Success: 201, User registered successfully. Please check your email to verify the account.
	Error: 409, User Already Exists. Please Login
*/
router.post('/register', async (req, res) 	=> {
	try {
		const { email, password, username} = req.body;

		// Check if user already exists
		const oldUser = await User.findOne({ email: email.toLowerCase() }).exec();

		if (oldUser) {
				return res.status(409).json({ message: 'User Already Exists. Please Login' });
		}
		//Encrypt user password
		const encryptedPassword = await bcrypt.hash(password, 10);

		// Create user in your database
		const user = await User.create({
				userName: username,
				email: email.toLowerCase(), // convert email to lowercase
				passwordHash: encryptedPassword,
				userRole:	'customer', // Default to 'customer' role
				verifyed: false, // Default to false
				active: true // Default to active user
		});

		// Generate token
		const token = generateToken({ email: user.email, action: 'verify-email' });

		// Send email verification
		await sendVerificationEmail(token, user);

		// saveuser
		await user.save();

		// return message to user
		res.status(201).send('User registered successfully. Please check your email to verify the account.');

	} catch (err) {
		console.log(err);
	}
});

/* GET /secure/verify?token=1234567890
	description: Verify a new user
	Params: token
	Success: 200, Email verified successfully!
	Error: 400, Invalid or expired verification token
*/
router.get('/verify-email', async (req, res) => {
	const token = req.query.token;
	try {
			const decoded = verifyToken(token);
			const user = await User.findOne({ email: decoded.email }).exec();

			if(decoded.action === 'verify-email') {
				if (user) {
						user.verified = true;
						await user.save();
						res.send('Email verified successfully!');
				} else {
						res.status(400).send('Invalid or expired verification token');
				}
			} else{
				res.status(400).send('Invalid or expired verification token');
			
			}
	} catch (error) {
			res.status(400).send('Invalid or expired verification token');
	}
});

router.get('/verify',  async (req, res) => {
	// verify user status
	const userId = req.user.userId;
	const user = await User.findOneById({ userId }).exec();
	if (!user.active) {
		res.status(401).json({ message: 'User is deactived' });
	} else if (!user.verified) {
		res.status(401).json({ message: 'User email not verified' });
	} else if (!user.action === 'logged-in') {
		res.status(401).json({ message: 'User not logged in' });
	} else {
		res.status(200).json({ message: 'User logged in' });
	}
});
/* POST /secure/login
	description: Login a user
	Params: email, password
	Success: 200, { token }
	Error: 401, Invalid username or password
*/

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Authenticate user
        const user = await authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
				// Check if user is verified
				if (!user.verified) {
					return res.status(401).json({ message: 'User email not verified. Please check your email!' });
				}
				// Check if user is active
				if (!user.active) {
					return res.status(401).json({ message: 'User is deactived. Please contact the administrator!' });
				}
        // Generate JWT
        const token = generateToken({userName:user.userName, userId: user._id, email: user.email, action: 'logged-in', userRole: user.userRole });
        res.status(200).json({ token: token, userRole: user.userRole });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

// GET /secure/profile
router.get('/profile', authenticateToken, (req, res) => {
    // get user profile
});

module.exports = router;