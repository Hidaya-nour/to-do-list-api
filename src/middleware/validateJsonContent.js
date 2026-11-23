import AppError from "../utils/AppError.js";

const validateJsonContent = (req, res, next) => {
    const methodsWithBody = ["POST", "PUT", "PATCH"];

    if (!methodsWithBody.includes(req.method)) {
        return next();
    }

    // Allow empty bodies to proceed to the validation layer
    if (!req.headers["content-type"] && !req.body) {
        return next();
    }

    if (
        req.headers["content-type"] &&
        !req.headers["content-type"].includes("application/json")
    ) {
        return next(
            new AppError("Content-Type must be application/json", 415)
        );
    }

    next();
};

export default validateJsonContent;