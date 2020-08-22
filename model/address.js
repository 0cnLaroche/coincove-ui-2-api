var mongoose = require('mongoose');
var Joi = require('@hapi/joi');

const AddressSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    address1: { type: String, required: true, minlength: 5, maxlength: 256 },
    address2: { type: String, maxlength: 256 },
    city: { type: String, required: true, minlength: 2, maxlength: 256 },
    state: { type: String, required: true, minlength: 2, maxlength: 256 },
    country: { type: String, required: true, minlength: 2, maxlength: 256 },
    postalCode: { type: String, required: true, minlength: 5, maxlength: 10 }
});

const validationSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    address1: Joi.string().required().min(5).max(256),
    address2: Joi.string().max(256),
    city: Joi.string().required().min(2).max(256),
    state: Joi.string().required().min(2).max(256),
    country: Joi.string().required().min(2).max(256),
    postalCode: Joi.string().required().min(5).max(10)
});

const Address = {
    validationSchema: validationSchema,
    schema: AddressSchema
 }

//function to validate Item 
function validate(address) {
    return validationSchema.validate(address);
}

exports.Address = Address;
exports.validateAddress = validate;