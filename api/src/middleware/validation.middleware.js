const { fail } = require('../utils/response');

// just grab the message strings, no need to reshape them
function _mapErrors(details) {
    return details.map(d => d.message.replace(/"/g, ''));
}

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return fail(res, 'validation failed', 422, _mapErrors(error.details));
    req.body = value;
    next();
};

function validateParams(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, { abortEarly: false });
        if (error) return fail(res, 'bad params', 400, _mapErrors(error.details));
        req.params = value;
        next();
    };
}

module.exports = { validate, validateParams };
