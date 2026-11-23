import * as taskService from '../service/taskService.js';

export const getTasks = async (req, res) => {
    const tasks = await taskService.getAllTasks(req.query);

    res.status(200).json(tasks);
};

export const getTasksById = async (req, res) => {
    const id = req.params.id;
    const task = await taskService.getTasksById(id);

    res.status(200).json(task);

}

export const createTask = async (req, res) => {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
}

export const updateTask = async (req, res) => {
    const id = req.params.id;
    const task = await taskService.updateTask(id, req.body)
    res.status(200).json(task);
}

export const patchTask = async (req, res) => {
    const id = req.params.id;
    const task = await taskService.patchTask(id, req.body);
    res.status(200).json(task);
}

export const deleteTask = async (req, res) => {
    const id = req.params.id;
    const task = await taskService.deleteTask(id);
    res.status(204).json(task);
}

export const deleteCompletedTasks = async (req, res) => {
    const tasks = await taskService.deleteCompletedTasks();
    res.status(204).json(tasks);

}

export const getDeletedTasks = async (req, res) => {
    const tasks = await taskService.getDeletedTasks();
    res.status(200).json(tasks)
}
export const restoreTask = async (req, res) => {
    const task = await taskService.restoreTask(req.params.id)
    res.status(200).json(task);
}
9
export const permanentlyDeleteTask = async (req, res) => {
    const id = req.params.id;
    const tasks = await taskService.permanentlyDeleteTask(id);
    res.status(204).json(tasks);
}

export const getSubTasks = async (req, res) => {
    const id = req.params.id;
    const subTasks = await taskService.getSubTasks(id);
    res.status(200).json(subTasks);
}

export const addSubTasks = async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const subTasks = await taskService.addSubTasks(id, body);
    res.status(201).json(subTasks);
}

export const updateSubTasks = async (req, res) => {
    const { id, subtaskId } = req.params;
    const body = req.body;
    const subTask = await taskService.updateSubTask(id, subtaskId, body);
    res.status(201).json(subTask);
}

export const deleteSubTask = async (req, res) => {
    const { id, subtaskId } = req.params;
    const subTask = await taskService.deleteSubTask(id, subtaskId);
    res.status(202).json(subTask);
}