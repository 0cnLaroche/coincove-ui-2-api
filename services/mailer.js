const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
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

handlebars.registerHelper('numberFormat', function (value, options) {
    // Helper parameters
    var dl = options.hash['decimalLength'] || 2;
    var ts = options.hash['thousandsSep'] || ',';
    var ds = options.hash['decimalSep'] || '.';

    // Parse to float
    var value = parseFloat(value);

    // The regex
    var re = '\\d(?=(\\d{3})+' + (dl > 0 ? '\\D' : '$') + ')';

    // Formats the number with the decimals
    var num = value.toFixed(Math.max(0, ~~dl));

    // Returns the formatted number
    return (ds ? num.replace('.', ds) : num).replace(new RegExp(re, 'g'), '$&' + ts);
});

/**
 * Send email using smtp credentials
 * @param {*} to destination email(s). Can be a string or an array of emails
 * @param {String} subject email subject
 * @param {*} body email body as plain text or html
 * @returns {Promise}
 */
const send = (to, subject, body) => {
    if (to instanceof Array) {
        to = to.join(', ');
    }
    return transporter.sendMail({
        from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USERNAME}>`,
        to,
        subject,
        html: body
    });
}

/**
 * Send email using smtp credentials
 * @param {*} to destination email(s). Can be a string or an array of emails
 * @param {any} onBehalfOf name and email that appears as from and to be replied to
 * @param {String} subject email subject
 * @param {*} body email body as plain text or html
 * @returns {Promise}
 */
const sendOnBehalfOf = (to, onBehalfOf, subject, body) => {
    if (to instanceof Array) {
        to = to.join(', ');
    }
    return transporter.sendMail({
        //from: onBehalfOf, // Doesn't seem to be working
        //sender: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USERNAME}>`,
        from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USERNAME}>`,
        to,
        replyTo: onBehalfOf,
        subject,
        html: body
    });
}

const sendOrderConfirmation = async (order) => {
    const to = order.email;
    order.company = process.env.COMPANY_NAME;
    const filePath = path.join(__dirname, 'orderConfirmation.html.hbs');
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(error);
                reject({
                    msg: "Error occured reading orderConfirmation.html.hbs",
                    error
                })
            }
            const template = handlebars.compile(data.toString());
            transporter.sendMail({
                from: {name: process.env.COMPANY_NAME, address: process.env.SMTP_USERNAME},
                to,
                bcc: process.env.CONTACT_EMAIL,
                replyTo: {name: "Sales", address: process.env.SMTP_USERNAME},
                subject: "Order Confirmation",
                html: template(order)
            }).then(data => {
                resolve(data);
            }).catch(error => {
                reject({
                    msg: "An error occured while sending email",
                    error
                })
            })
        })
    })

}

exports.send = send;
exports.sendOrderConfirmation = sendOrderConfirmation;
exports.sendOnBehalfOf = sendOnBehalfOf;