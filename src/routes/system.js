import { Router } from 'express';
import { getAgenda, getNotifications, patchNotification } from '../controller/taskController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import {
    listNotificationsQuerySchema,
    notificationIdParamsSchema,
    patchNotificationSchema,
} from '../validators/taskSchemas.js';

const router = Router();

router.get('/agenda', asyncHandler(getAgenda));
router.get('/notifications', validate(listNotificationsQuerySchema, 'query'), asyncHandler(getNotifications));
router.patch('/notifications/:id',
    validate(notificationIdParamsSchema, 'params'),
    validate(patchNotificationSchema),
    asyncHandler(patchNotification));

export default router;
