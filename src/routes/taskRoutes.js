import express from 'express'
import { getTasks, getTasksById, createTask, updateTask, patchTask, deleteTask, deleteCompletedTasks } from "../controller/taskController.js"

const router = express.Router();

router.use(express.json());

router.get("/", getTasks);
router.get("/:id", getTasksById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id", patchTask);
router.delete("/completed", deleteCompletedTasks);
router.delete("/:id", deleteTask);


export default router;