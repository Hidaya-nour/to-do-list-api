import { Router } from 'express';
import { getAgenda } from '../controller/taskController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/agenda', asyncHandler(getAgenda));

export default router;