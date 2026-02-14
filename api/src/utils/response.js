// Standardized response helpers (success / error / 201 / 204)

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

const errorResponse = (res, message, statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    });
};

const createdResponse = (res, data, message = 'Created successfully') => {
    return successResponse(res, data, message, 201);
};

const noContentResponse = (res) => {
    return res.status(204).send();
};

module.exports = {
    successResponse,
    errorResponse,
    createdResponse,
    noContentResponse
};
