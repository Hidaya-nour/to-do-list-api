import AppError from '../errors/AppError.js';
// Express recognizes an error handler by its (err, req, res, next) signature.
export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    // express.json() throws this when the body is not valid JSON
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: { message: 'Malformed JSON in request body', status: 400 },
        });
    }

    // Errors we throw on purpose
    if (err instanceof AppError) {
        const error = { message: err.message, status: err.status };
        if (err.details) error.details = err.details;
        return res.status(err.status).json({ error });
    }

    // Anything else is a bug: log it, but do not leak details to the client
    console.error(err);
    res.status(500).json({
        error: { message: 'Internal server error', status: 500 },
    });
};