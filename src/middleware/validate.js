import { AppError } from '../errors/AppError.js';

// turns zod issues into [{ field, message }]
const toDetails = (issues, source) =>
    issues.flatMap((issue) => {
        if (issue.code === 'unrecognized_keys') {
            return issue.keys.map((key) => ({
                field: key,
                message: source === 'query' ? 'Unknown parameter' : 'Unknown field',
            }));
        }
        return [{ field: issue.path.join('.') || source, message: issue.message }];
    });


export const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
        const isQuery = source === 'query';
        return next(
            new AppError(
                isQuery ? 400 : 422,
                isQuery ? 'Invalid query parameters' : 'Validation failed',
                toDetails(result.error.issues, source)
            )
        );
    }

    req.validated = { ...req.validated, [source]: result.data };
    next();
};