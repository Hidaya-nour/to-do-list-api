import { Router } from 'express';

import * as ctrl from '../controller/taskController.js'; // adjust the path/name to your controller
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    listTasksQuerySchema,
    taskIdParamsSchema,
    createTaskSchema,
    updateTaskSchema,
    patchTaskSchema,
    deleteTaskQuerySchema,
    deleteCompletedQuerySchema,
    subtaskParamsSchema,
    createSubtaskSchema,
    patchSubtaskSchema,
    snoozeSchema,
} from '../validators/taskSchemas.js';

const router = Router();

router.get('/', validate(listTasksQuerySchema, 'query'), asyncHandler(ctrl.getTasks));
router.post('/', validate(createTaskSchema), asyncHandler(ctrl.createTask));
router.delete('/', validate(deleteCompletedQuerySchema, 'query'), asyncHandler(ctrl.deleteCompletedTasks));


router.get('/:id', validate(taskIdParamsSchema, 'params'), asyncHandler(ctrl.getTasksById));

router.put('/:id',
    validate(taskIdParamsSchema, 'params'),
    validate(updateTaskSchema),
    asyncHandler(ctrl.updateTask));

router.patch('/:id',
    validate(taskIdParamsSchema, 'params'),
    validate(patchTaskSchema),
    asyncHandler(ctrl.patchTask));


router.delete('/:id',
    validate(taskIdParamsSchema, 'params'),
    validate(deleteTaskQuerySchema, 'query'),
    asyncHandler(ctrl.deleteTask));

router.post('/:id/restore', validate(taskIdParamsSchema, 'params'), asyncHandler(ctrl.restoreTask));

router.get('/:id/subtasks', validate(taskIdParamsSchema, 'params'), asyncHandler(ctrl.getSubTasks));

router.post('/:id/subtasks',
    validate(taskIdParamsSchema, 'params'),
    validate(createSubtaskSchema),
    asyncHandler(ctrl.addSubTask));

router.patch('/:id/subtasks/:subtaskId',
    validate(subtaskParamsSchema, 'params'),
    validate(patchSubtaskSchema),
    asyncHandler(ctrl.updateSubTask));

router.delete('/:id/subtasks/:subtaskId',
    validate(subtaskParamsSchema, 'params'),
    asyncHandler(ctrl.deleteSubTask));

router.post('/:id/snooze',
    validate(taskIdParamsSchema, 'params'),
    validate(snoozeSchema),
    asyncHandler(ctrl.snoozeTask));

export default router;
