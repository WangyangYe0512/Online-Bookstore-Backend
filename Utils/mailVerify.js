const nodemailer = require('nodemailer');

const FRONT_END_URL = process.env.FRONT_END_URL;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Email configuration
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});

async function sendVerificationEmail(token,user) {

// verification url
const verificationUrl = FRONT_END_URL + `verify?token=${token}`;

// send email
await transporter.sendMail({
    from: EMAIL_USER,
    to: user.email,
    subject: 'Email Verification',
    html: `Please click on the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`
});
};

module.exports = { sendVerificationEmail };