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

export const updateTask= async (req,res)=>{
    
}