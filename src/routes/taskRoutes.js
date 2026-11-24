import express from 'express';
import { validate } from '../middleware/validate.js';
import {
    deleteSubTask,
    updateSubTasks,
    addSubTasks,
    getSubTasks,
    getTasks,
    getTasksById,
    createTask,
    updateTask,
    patchTask,
    deleteTask,
    deleteCompletedTasks,
    restoreTask,
} from "../controller/taskController.js";
import { deleteCompletedQuerySchema, deleteTaskQuerySchema, listTasksQuerySchema, taskIdParamsSchema, createTaskSchema, updateTaskSchema, patchTaskSchema } from '../validators/taskSchemas.js';

const router = express.Router();

router.get("/", validate(listTasksQuerySchema, 'query'), getTasks);
router.get("/:id", validate(taskIdParamsSchema, 'params'), getTasksById);

router.post("/", validate(createTaskSchema), createTask);
router.put("/:id", validate(taskIdParamsSchema, 'params'), validate(updateTaskSchema), updateTask);
router.patch("/:id", validate(taskIdParamsSchema, 'params'), validate(patchTaskSchema), patchTask);

router.delete('/', validate(deleteCompletedQuerySchema, 'query'), deleteCompletedTasks);
router.delete('/:id', validate(taskIdParamsSchema, 'params'),
    validate(deleteTaskQuerySchema, 'query'), deleteTask);
router.post('/:id/restore', validate(taskIdParamsSchema, 'params'), restoreTask);

router.post("/subtasks/:id", addSubTasks);
router.get("/subtasks/:id", getSubTasks);
router.put("/subtasks/:id/:subtaskId", updateSubTasks);
router.delete("/:id/subtasks/:subtaskId", deleteSubTask);

export default router;  