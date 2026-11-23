import express from 'express'
import { deleteSubTask, updateSubTasks, addSubTasks, getSubTasks, getTasks, getTasksById, createTask, updateTask, patchTask, deleteTask, deleteCompletedTasks, getDeletedTasks, restoreTask, permanentlyDeleteTask } from "../controller/taskController.js"

const router = express.Router();

router.use(express.json());

router.get("/", getTasks);
router.get("/deleted", getDeletedTasks);
router.get("/:id", getTasksById);

router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id", patchTask);

router.delete("/completed", deleteCompletedTasks);
router.delete("/:id", deleteTask);
router.patch("/restore/:id", restoreTask);
router.delete("/trash/:id", permanentlyDeleteTask);

router.post("/subtasks/:id", addSubTasks);
router.get("/subtasks/:id", getSubTasks);
router.put("/subtasks/:id/:subtaskId", updateSubTasks);
router.delete("/:id/subtasks/:subtaskId", deleteSubTask);

export default router;