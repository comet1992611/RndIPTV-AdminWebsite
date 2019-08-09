'use strict';

const Joi = require('joi');

module.exports = {
  V3: {
    encrypt: Joi.object().keys({
      key: Joi.string().alphanum().min(1).required(),
      params: Joi.string().required(),
      verbose: Joi.boolean()
    }),
    decrypt: Joi.object().keys({
      key: Joi.string().alphanum().min(1).required(),
      token: Joi.string().max(512).required(),
      verbose: Joi.boolean()
    })
  }
}