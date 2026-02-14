// Shared validators
const Joi = require('joi');

const idSchema = Joi.object({
    id: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'ID must be a valid UUID',
            'any.required': 'ID is required'
        })
});

module.exports = {
    idSchema
};
