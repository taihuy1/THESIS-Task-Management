const Joi = require('joi');

const idSchema = Joi.object({
    id: Joi.string().uuid().required()
});

module.exports = { idSchema };
