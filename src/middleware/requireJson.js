import AppError from '../errors/AppError.js';

const BODY_METHODS = ['POST', 'PUT', 'PATCH'];

export const requireJson = (req, res, next) => {
    const hasBody =
        Number(req.headers['content-length']) > 0 || Boolean(req.headers['transfer-encoding']);

    if (BODY_METHODS.includes(req.method) && hasBody && !req.is('application/json')) {
        return next(new AppError('Content-Type must be application/json', 415));
    }
    next();
};