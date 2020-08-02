const express = require('express');
const { Order, validateOrder, status } = require('../model/order');
const { ValidationError, OrderError } = require('../error');
const orderService = require('../services/orderService');
const { authenticateToken } = require('../jwt');
const logger = require('../logger');
const { Item } = require('../model/item');
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
            logger.error('Could not save order %O', order)
        }
        logger.debug('Order %s saved!', order._id);
        return res.status(httpStatus ? httpStatus : 201).send(order);
    })

})

/**
 * GET order by id
 */
router.get('/:id', authenticateToken, (req, res) => {
    if (!req.user.isAdmin) {
        let msg = "User need admin access to get order details";
        logger.debug(msg);
        return res.status(401).send(msg);
    }
    Item.findById(req.params.id, (err, order) => {
        if(err) {
            return res.sendStatus(404);
        }
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
        return res.status(401).send(msg);
    }
    Order.find({}).exec()
    .then( data => {
        return res.send(data);
    })
    .catch( error => {
        logger.error(error.message);
        return res.status(500).send("Could not query orders");
    })
})

module.exports = router;