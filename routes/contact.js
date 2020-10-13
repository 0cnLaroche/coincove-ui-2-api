require('dotenv').config();
const express = require('express');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const mailer = require('../services/mailer');
const router = express.Router();

router.post('/', (req, res) => {
    const { message, email, name } = req.body;
    const filePath = path.join(__dirname, 'contactUsMessage.html.hbs');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            logger.error(err);
        }
        const template = handlebars.compile(data.toString());
        mailer.sendOnBehalfOf(
            process.env.CONTACT_EMAIL,
            { name, address: email },
            "Information Request", 
            template({message, email, name}))
        .then(info => {
            logger.debug("Contact form sent");
            res.sendStatus(201);
        })
    })
});

module.exports = router;