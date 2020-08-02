var mongoose = require('mongoose');
var Joi = require('@hapi/joi');

//simple schema
const ItemSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100
    },
    producer: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
      },
    description: {
      type: String
    },
    tags: {
      type: Array
    },
    section: {
      type: String,
      minlength: 3,
      maxlength: 100
    },
    imageUrl: {
      type: String,
      required: true,
      minlength: 3,
    },
    price: {
      type: Number,
      min: 0,
      required: false
    },
    discount: {
      type: Number,
      min: 0
    },
    inventory: {
      type: Number,
      min: 0,
      required: true
    }
  });

const Item = mongoose.model('Item', ItemSchema);

/** Validates Item object against Joi schema */
function validate(item) {
    const schema = Joi.object({
      name: Joi.string().min(3).max(100).required(),
      producer: Joi.string().min(3).max(100).required(),
      description: Joi.string(),
      tags: Joi.array(),
      section: Joi.string(),
      imageUrl: Joi.string().min(3).required(),
      price: Joi.number().min(0).required(),
      discount: Joi.number().min(0).optional(),
      inventory: Joi.number().min(0).required()
    });
  
    return schema.validate(item);
  }
  
  exports.Item = Item; 
  exports.validateItem = validate;