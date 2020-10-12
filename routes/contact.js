require('dotenv').config();
var express = require('express');
var multer = require('multer');
var fs = require('fs');
var logger = require('../logger');
const mailer = require('../services/mailer');
var router = express.Router();

router.post('/', (req, res) => {
    const { message, email, name } = req.body;
    const emailBody = `From : ${name} \n email: ${email} \n Message: ${message}`;
    mailer.send(process.env.CONTACT_EMAIL, "Information Request", emailBody)
    .then(info => {
        res.sendStatus(201);
    })
});

module.exports = router;