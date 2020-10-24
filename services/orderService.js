const { Order, validateOrder, status } = require('../model/order');
const { Item } = require('../model/item');
const paypalService = require('./paypalService');
const assert = require('assert');
const logger = require('../logger');
const dotenv = require('dotenv');
const OrderError = require('../error/orderError');

/* Load environment variables */
dotenv.config();

/**
 * Process an order
 * @param {Order} order 
 */
const processOrder = async (order) => {
    let invoiceLines;
    let subtotal;
    let payment;
    try {
        invoiceLines = await createInvoiceLines(order.orderLines);
        subtotal = invoiceLines.reduce((a,b)=> {return a + b}, 0);
        if(subtotal !== order.subtotal) {
            throw new OrderError("Subtotal doesn't match");
        }
        
        // TODO : verify shipping, taxes etc
        payment = await verifyPayment(order.total, order.paymentId);
        
    } catch (error) {
        logger.error(error);
        order.status = status.FAILED;
        throw error;
    }
    order.status = status.APPROVED;
    updateInventory(order.orderLines);
    return order;
}

/**
 * Verify order lines amounts and add invoice line amt
 * @param {Order.orderLines} orderLines 
 * @throws OrderError
 */
const createInvoiceLines = async (orderLines) => {

    var orderLines = await Promise.all(
            orderLines.map(async (ol) => {

                try {

                    const item = await Item.findById(ol.itemId).exec();
                    assert.ok(item, "Item must exist");
                    assert.strictEqual(item.price, ol.price, "Item price not equal to order line");
                    let discount = (item.discount === undefined) ? 0 : item.discount;
                    const invoiceLineAmount = Number(((ol.units * ((item.price - discount) * 100)) / 100).toFixed(2));
                    assert.ok(invoiceLineAmount >= 0, "Invoice line amount cannot be under 0")
                    return invoiceLineAmount;

                } catch (error) {
                    if (error instanceof assert.AssertionError) {
                        throw new OrderError(error.message);
                    } else {
                        console.error(error);
                        return null;
                    }
                }
            }));

    return orderLines;
}

/**
 * Query paypal api for payment and verify amount
 * @param {Number} paymentAmount 
 * @param {*} paymentId 
 */
const verifyPayment = async (paymentAmount, autorizationId) => {
    const payment = await paypalService.getPayment(autorizationId);
    if (payment.amount.value == paymentAmount) {
        return payment;
    } else {
        throw new OrderError(
            `Payment amount doesn't match. Order amount is ${paymentAmount}, payment amount is ${payment.amount.value}`);
    }
}

/**
 * Decrement item inventory from order lines
 * @param {*} orderLines 
 * @returns {Promise<Item>} 
 */
const updateInventory = (orderLines) => {
    let promises = [];
    orderLines.forEach(line => {
        promises.push(Item.update({_id: line.itemId}, {$inc: {inventory: -line.units}}));
    });
    return Promise.all(promises);
}

const orderService = {
    processOrder,
    updateInventory
}

module.exports = orderService;