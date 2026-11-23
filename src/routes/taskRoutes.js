import express from 'express';

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
    getDeletedTasks,
    restoreTask,
    permanentlyDeleteTask
} from "../controller/taskController.js";

import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getTasks));
router.get("/deleted", asyncHandler(getDeletedTasks));
router.get("/:id", asyncHandler(getTasksById));

router.post("/", asyncHandler(createTask));
router.put("/:id", asyncHandler(updateTask));
router.patch("/:id", asyncHandler(patchTask));

router.delete("/completed", asyncHandler(deleteCompletedTasks));
router.delete("/:id", asyncHandler(deleteTask));
router.patch("/restore/:id", asyncHandler(restoreTask));
router.delete("/trash/:id", asyncHandler(permanentlyDeleteTask));

router.post("/subtasks/:id", asyncHandler(addSubTasks));
router.get("/subtasks/:id", asyncHandler(getSubTasks));
router.put("/subtasks/:id/:subtaskId", asyncHandler(updateSubTasks));
router.delete("/:id/subtasks/:subtaskId", asyncHandler(deleteSubTask));

export default router;  