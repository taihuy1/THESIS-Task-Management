// got tired of writing status codes everywhere so made these
class AppError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
    }
}

// covers both 401 and 403 depending on what happened
class AccessError extends AppError {
    constructor(msg = 'access denied', statusCode = 401) {
        super(msg, statusCode);
        this.name = 'AccessError';
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'resource') {
        super(`${resource} not found`, 404);
        this.name = 'NotFoundError';
        this.resource = resource;
    }
}

class BadRequestError extends AppError {
    constructor(msg = 'bad request', details = null) {
        super(msg, 400);
        this.name = 'BadRequestError';
        if (details) this.details = details;
    }
}

module.exports = {
    AppError,
    AccessError,
    NotFoundError,
    BadRequestError
};
