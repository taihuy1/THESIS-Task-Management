const Joi = require('joi');
const { ROLES } = require('../utils/constants');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required()
});

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid(ROLES.AUTHOR, ROLES.SOLVER).required()
});

module.exports = { loginSchema, registerSchema };
