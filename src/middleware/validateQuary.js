import AppError from "../utils/AppError.js";

const validateQuery = (req, res, next) => {
    const { completed, priority, dueDate, search, sort, order } = req.query;

    if (completed !== undefined &&
        completed !== "true" &&
        completed !== "false") {
        return next(
            new AppError("completed must be true or false", 400)
        );
    }

    if (sort !== undefined) {
        const allowedSortFields = [
            "dueDate",
            "priority",
            "createdAt",
            "title"
        ];

        if (!allowedSortFields.includes(sort)) {
            return next(
                new AppError("Invalid sort field", 400)
            );
        }
    }

    if (order !== undefined &&
        order !== "asc" &&
        order !== "desc") {
        return next(
            new AppError("order must be asc or desc", 400)
        );
    }

    if (priority !== undefined && priority.trim() === "") {
        return next(
            new AppError("priority cannot be empty", 400)
        );
    }

    if (dueDate !== undefined && isNaN(Date.parse(dueDate))) {
        return next(
            new AppError("Invalid dueDate", 400)
        );
    }

    if (search !== undefined && typeof search !== "string") {
        return next(
            new AppError("Invalid search parameter", 400)
        );
    }

    next();
};

export default validateQuery;