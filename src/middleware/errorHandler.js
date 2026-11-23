
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;

    const errorResponse = {
        error: {
            status,
            message: status === 500
                ? "Internal server error"
                : err.message
        }
    };

    if (err.details) {
        errorResponse.error.details = err.details;
    }

    res.status(status).json(errorResponse);
};

export default errorHandler;