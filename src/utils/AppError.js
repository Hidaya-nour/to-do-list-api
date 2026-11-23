class AppError extends Error {
    constructor(message, status, details = undefined) {
        super(message);

        this.status = status;
        this.details = details;
    }
}

export default AppError;