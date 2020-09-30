const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
var logger = require('../logger');

dotenv.config();

const USER = process.env.SMTP_USERNAME;
const PWD = process.env.SMTP_PASSWORD;
const HOST = process.env.SMTP_HOST;

// Create transport from options
const transporter = nodemailer.createTransport({
    host: HOST,
    port: 587,
    pool: true,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: USER,
        pass: PWD
    }
});

// verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        logger.error("SMTP connection failure");
        logger.debug(error);
    } else {
        logger.info("SMTP connection success. Server ready to send mail")
    }
});

/**
 * Send email using smtp credentials
 * @param {*} to destination email(s). Can be a string or an array of emails
 * @param {String} subject email subject
 * @param {*} body email body as plain text or html
 */
const send = (to, subject, body) => {
    if (to instanceof Array) {
        to = to.join(', ');
    }
    return transporter.sendMail({
        from: `"${process.env.HOST}" <${process.env.SMTP_USERNAME}>`,
        to,
        subject,
        html: body
    });
}

exports.send = send;