import express from 'express'
import { getTasks, getTasksById, createTask, updateTask } from "../controller/taskController.js"

const router = express.Router();

router.get("/", getTasks);
router.get("/:id", getTasksById);

router.use(express.json());
router.post("/", createTask);
router.put("/:id", updateTask);

export default router;