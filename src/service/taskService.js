import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const filePath = new URL('../../data/tasks.json', import.meta.url);

export const getAllTasks = async (query) => {
    const priority = query.priority;
    const status = query.status;
    const dueDate = query.dueDate;
    const completed = query.completed;
    const text = query.text;

    const data = await readFile(
        filePath, 'utf-8'
    );
    let tasks = JSON.parse(data).filter(task => task.deletedAt === null);

    priority && (tasks = tasks.filter(task => task.priority === priority));
    status && (tasks = tasks.filter(task => task.status === status));
    dueDate && (tasks = tasks.filter(task => task.dueDate === dueDate));
    completed && (tasks = tasks.filter(task => task.completed === completed));
    text && (tasks = tasks.filter(task => task.title.includes(text) || task.description.includes(text)));
    
    return tasks;
};

export const getTasksById = async (id) => {

    const data = await getAllTasks();

    return data.find(task => task.id === id);
}

export const createTask = async (body) => {
    const tasks = await getAllTasks();
    const now = new Date().toISOString;
    const newTAsk = {
        id: randomUUID(),
        title: body.title,
        description: body.description || " ",
        priority:body.priority|| "medium",
        dueDate:body.dueDate|| null,
        remindAt: body.remindAt || null,
        repeat: body.repeat || "none",
        subtasks: body.subtasks ||[],
        reminderSent: body.reminderSent || false,
        createdAt: now,
        updatedAt: now,
        completedAt:null,
        deletedAt:null,
        completed: false
    };

    tasks.push(newTAsk);
    await writeFile(filePath, JSON.stringify(tasks, null, 2), 'utf-8')

    return newTAsk;
}