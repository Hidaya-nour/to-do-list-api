import * as taskService from '../service/taskService.js';

export const getTasks = async (req, res) => {
    const tasks = await taskService.getAllTasks(req.validated.query);

    res.status(200).json(tasks);
};

export const getTasksById = async (req, res) => {
    const id = req.params.id;
    const task = await taskService.getTasksById(id);

    res.status(200).json(task);

}

export const createTask = async (req, res) => {
    const task = await taskService.createTask(req.validated.body);
    res.status(201).location(`/api/tasks/${task.id}`).json(task);
}

export const updateTask = async (req, res) => {
    const id = req.validated.params.id;
    const task = await taskService.updateTask(id, req.validated.body)
    res.status(200).json(task);
}

export const patchTask = async (req, res) => {
    const id = req.validated.params.id;
    const task = await taskService.patchTask(id, req.validated.body);
    res.status(200).json(task);
}

export const deleteTask = async (req, res) => {
    const { params, query } = req.validated;

    if (query.permanent) await taskService.permanentlyDeleteTask(params.id);
    else await taskService.deleteTask(params.id);

    res.status(204).end();
};

export const deleteCompletedTasks = async (req, res) => {
    const deleteCount = await taskService.deleteCompletedTasks();
    res.status(200).json({ deleteCount });

}

export const restoreTask = async (req, res) => {
    const task = await taskService.restoreTask(req.validated.params.id)
    res.status(200).json(task);
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