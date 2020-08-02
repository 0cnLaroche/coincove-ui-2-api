var express = require('express');
var { Invoice, validateInvoice } = require('../model/invoice');
var { authenticateToken } = require('../jwt');
var logger = require('../logger');
var router = express.Router();

router.get('/:id', (req, res) => {
    // fetch invoice and return it
})