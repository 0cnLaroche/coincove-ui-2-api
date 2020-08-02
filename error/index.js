/**
 * error module contains all errors types. Types that can be throw in code 
 * should be exported here (and imported from here as well).
 */

const { ValidationError } = require('@hapi/joi');

exports.OrderError = require('./orderError');
exports.ValidationError = ValidationError;