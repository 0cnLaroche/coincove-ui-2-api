const express = require('express');
const { Order, validateOrder, status } = require('../model/order');
const { ValidationError, OrderError } = require('../error');
const orderService = require('../services/orderService');
const paypalService = require('../services/paypalService');
const mailer = require('../services/mailer');
const { authenticateToken } = require('../jwt');
const logger = require('../logger');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');
const router = express.Router();

/** POST new order. Validates order before accepting it */
router.post('/', async (req, res) => {
    // Once an order is created, create an invoice?
    let order = req.body;
    order.status = status.DRAFT;
    order.created = Date.now();
    let httpStatus;
    let data;
    try {
        validateOrder(order);
        await orderService.processOrder(order);
        mailer.sendOrderConfirmation(order.toObject())
        .then(info => {
            logger.debug("Confirmation email sent");
        })
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.error('%O', error.details.message);
            // BAD REQUEST
            // Send error directly, do not save order
            return res.status(400).send(error.details.message);
        } else if (error instanceof OrderError) {
            logger.error('%O', error.message);
            // FORBIDDEN
            httpStatus = 403;
            data = error.message;
        } else {
            logger.error("Unknown error: \n %O ", error);
            httpStatus = 500;
            data = error.message;
        }   
    }
    order = new Order(order);
    order.save((err, order) => {
        if(err) {
            logger.error('Could not save order %O', order);
        } else {
            logger.debug('Order %s saved!', order._id);
        }
        return res.status(httpStatus ? httpStatus : 201).send(order.toObject());
    })
});

router.patch('/:id', authenticateToken, (req, res) => {
    if (!req.user.isAdmin) {
        let msg = "User need admin access to get order details";
        logger.debug(msg);
        return res.status(401).json({error: msg});
    }
    if (req.body._id && req.body._id != req.params.id) {
        return res.status(400).json({error: "ID in body doesn't match url"})
    }
    delete req.body._id;
    Order.findOneAndUpdate({_id: req.params.id}, req.body, 
        {returnOriginal: false, useFindAndModify: false}, (err, result) => {
        if (err) {
            logger.error("Could not update order %s", req.params.id);
            logger.error(err.message);
            return res.status(500).json({error: `Could not update order ${req.params.id}`});
        }
        if (result === null) {
            return res.status(404).json({error: "No order found for patching"});
        }
        if (req.body.status && req.body.status === status.SHIPPED && req.body.trackingId) {
            //TODO paypalService.postTrackingId()
            logger.warn("Shipping information should be updated to paypal transaction for order %s", req.params.id)
        }
        return res.status(200).json(result);
    });
});

/**
 * GET order by id
 */
router.get('/:id', authenticateToken, (req, res) => {
    if (!req.user.isAdmin) {
        let msg = "User need admin access to get order details";
        logger.debug(msg);
        return res.status(401).json({error: msg});
    }
    Order.findById(req.params.id, (err, order) => {
        if(err) {
            let msg = `Did not find order for id ${req.params.id}`;
            logger.debug(msg);
            return res.status(404).json({error: msg});
        }
        logger.debug("Found order %s", order._id);
        return res.send(order);
    })
})

/**
 * GET all orders. Must be admin
 */
router.get('/', authenticateToken, (req, res) => {
    if (!req.user.isAdmin) {
        let msg = "User need admin access to get order list";
        logger.debug(msg);
        return res.status(401).json({error: msg});
    }
    Order.find({}).exec()
    .then( data => {
        return res.send(data);
    })
    .catch( error => {
        logger.error(error.message);
        return res.status(500).json({error: "Could not query orders"});
    })
})

module.exports = router;