const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { Address } = require('./address');

const status = {
    DRAFT: 'Draft',
    APPROVED: 'Approved', // Payment received, pending packaging
    READY_TO_SHIP: 'Ready to ship', // Packed
    PENDING_PAYMENT: 'Pending payment',
    SHIPPED: 'Shipped',
    ON_HOLD: 'On hold',
    FAILED: 'Failed', // Error while treating order
    REFUND: 'Refund', // Client was refunded
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed' // Package received by client

}

const OrderLineSchema = new mongoose.Schema({
    description: { type: String, required: true },
    itemId: { type: String, required: true },
    units: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, 
    discount: { type: Number, max: 0 }
})

const OrderSchema = new mongoose.Schema({
    billingAddress: { type: Address.schema, required: true },
    shippingAddress: { type: Address.schema, required: true },
    orderLines: [OrderLineSchema],
    taxes: [{tax: String, amount: Number}],
    shipping: { type: Number, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentId: { type: String },
    paypalOrderId: { type: String },
    email: { type: String, required:true },
    status: { type: String, required: true, enum: Object.values(status) },
    trackingId: { type: String },
    created: { type: Date, default: Date.now(), required: true },
    updated: { type: Date }
});

const Order = mongoose.model('Order', OrderSchema);

/**
 * Validates an Order object against schema
 * @param {Order} order 
 */
const validate = (order) => {
    const schema = Joi.object({
        billingAddress: Address.validationSchema,
        shippingAddress: Address.validationSchema,
        orderLines: Joi.array().items(
            Joi.object({
                description: Joi.string().required(),
                itemId: Joi.string().alphanum().required(),
                units: Joi.number().min(1).required(),
                price: Joi.number().required().min(0),
                discount: Joi.number().max(0)
        })).required(),
        taxes: Joi.array().items(
            Joi.object({
                tax: Joi.string().required(), 
                amount: Joi.number().required()
        })),
        shipping: Joi.number().min(0),
        subtotal: Joi.number().min(0).required(),
        total: Joi.number().min(0).required(),
        paymentId: Joi.string(),
        paypalOrderId: Joi.string(),
        email: Joi.string().email().required(),
        status: Joi.any().valid(...Object.values(status)).required(),
        trackingId: Joi.string().optional(),
        created: Joi.date().required()
    })
    return schema.validate(order);
}

exports.Order = Order;
exports.validateOrder = validate;
exports.status = status;