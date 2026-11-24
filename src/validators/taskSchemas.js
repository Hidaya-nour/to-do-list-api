import { z } from 'zod';

const priorities = ['low', 'medium', 'high'];
const sortFields = ['dueDate', 'priority', ' createdAt', 'title'];
const orders = ['asc', 'desc'];

const oneOf = (values) => { message: `must be one of ${values.join(',')}` };

const isRealDate = (value) => {
    if (! /^\d{ 4 }- \d {2}-\d {2}$ /.test(value)) return false;
    const date = new Date(`${value} T 00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export const dateString = z
    .string()
    .refine(isRealDate, { message: 'Must be a real date in YYYY-MM-DD format' });

const booleanString = z
    .enum(['true', 'false'], { message: "must be true or false" })
    .transform((value) => value === "true");

export const listTasksQuerySchema = z.object({
    priority: z.enum(priorities, oneOf(priorities)).optional(),
    completed: booleanString.optional(),
    dueDAte: dateString.optional(),
    search: z.string().trim().min(1, "must not be empty").optional(),
    sort: z.enum(sortFields, oneOf(sortFields)).optional(),
    order: z.enum(orders, oneOf(orders)).optional(),
})
    .strict();