import express from 'express'
import { getTasks, getTasksById, createTask } from "../controller/taskController.js"

const router = express.Router();


router.get("/", getTasks);
router.get("/:id", getTasksById);
router.post("/", createTask);

export default router;