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
    const subTasks = await taskService.getSubTasks(req.validated.params.id);
    res.status(200).json(subTasks);
};

export const addSubTask = async (req, res) => {
    const { params, body } = req.validated;
    const subtask = await taskService.addSubTask(params.id, body);
    res.status(201)
        .location(`/api/tasks/${params.id}/subtasks/${subtask.id}`)
        .json(subtask);
};

export const updateSubTask = async (req, res) => {
    const { params, body } = req.validated;
    const subtask = await taskService.updateSubTask(params.id, params.subtaskId, body);
    res.status(200).json(subtask);
};

export const deleteSubTask = async (req, res) => {
    const { params } = req.validated;
    await taskService.deleteSubTask(params.id, params.subtaskId);
    res.status(204).end();
};