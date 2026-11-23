import AppError from "../utils/AppError.js";

const validateId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName];

        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(id)) {
            return next(
                new AppError(`Invalid ${paramName}`, 400)
            );
        }

        next();
    };
};

export default validateId;