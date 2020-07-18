var mongoose = require('mongoose');
var Joi = require('@hapi/joi');

//simple schema
const ImageSchema = new mongoose.Schema({
    contentType: {
      type: String,
      required: true
    },
    fileName: {
        type: String
    },
    file: {
        type: Buffer,
        required: true,
    },
    url: {
      type: String
    }
  });

const Image = mongoose.model('Image', ImageSchema);

/** Validate Image object against schema */
function validate(image) {
    const schema = Joi.object({
      contentType: Joi.string().required(),
      fileName: Joi.string().max(255),
      file: Joi.binary().max(2e6).required(), // max size 2mb
      url: Joi.string().uri()

    });
    return schema.validate(image);
  }
  
exports.Image = Image; 
exports.validateImage = validate;