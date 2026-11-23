import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const filePath = new URL('../../data/tasks.json', import.meta.url);

const saveTasks = async (tasks) => {
    await writeFile(filePath, JSON.stringify(tasks, null, 2));
};

const readTasks = async () => {
    const data = await readFile(
        filePath, 'utf-8'
    );
}
export const getAllTasks = async (query) => {
    const priority = query?.priority;
    const dueDate = query?.dueDate;
    const completed = query?.completed === "true";
    const search = query?.search?.trim().toLowerCase();
    const tasks = await readTasks()

    let filteredTasks = JSON.parse(data).filter(task => task.deletedAt === null);

    priority && (filteredTasks = tasks.filter(task => task.priority === priority));
    dueDate && (filteredTasks = tasks.filter(task => task.dueDate === dueDate));
    completed && (filteredTasks = tasks.filter(task => task.completed == completed));
    search && (filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search)));

    const sort = query?.sort;
    const order = query?.order || "asc";
    const allawedSortFiedls = ["dueDate", "priority", "createdAt", "title"]; const allawedOrders = ["asc", "desc"];

    if (sort && !allawedSortFiedls.includes(sort) || order && !allawedOrders.includes(order)) {
        return "Invalid sort filed"

    }

    if (sort) {
        filteredTasks.sort((a, b) => {
            let comparison;
            if (sort === "title")
                comparison = a.title.localCompare(b.title);
            else if (sort === "priority") {
                const priorityValues = {
                    low: 1,
                    medium: 2,
                    high: 3
                };

                comparison = priorityValues[a.priority] - priorityValues[b.priority];
            }
            else {
                comparison = new Date(a[sort]) - new Date(b[sort]);
            }
            return order === "desc" ? -comparison : comparison;
        });
    };
    return filteredTasks;
};

export const getTasksById = async (id) => {

    const data = await readTasks();

    return data.find(task => task.id === id);
}

export const createTask = async (body) => {
    const tasks = await readTasks();
    const now = new Date().toISOString();

    const newTAsk = {
        id: randomUUID(),
        title: body.title,
        description: body.description || " ",
        priority: body.priority || "medium",
        dueDate: body.dueDate || null,
        remindAt: body.remindAt || null,
        repeat: body.repeat || "none",
        subtasks: body.subtasks || [],
        reminderSent: body.reminderSent || false,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        deletedAt: null,
        completed: false
    };

    tasks.push(newTAsk);
    await saveTasks(tasks);

    return newTAsk;
}

export const updateTask = async (id, body) => {

    let tasks = await readTasks();
    const now = new Date().toISOString();
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return "task not found";
    }
    const existingTask = tasks[index];
    const updatedTask = {
        id: id,
        title: body.title,
        description: body.description || " ",
        priority: body.priority || "medium",
        dueDate: body.dueDate || null,
        remindAt: body.remindAt || null,
        repeat: body.repeat || "none",
        subtasks: body.subtasks || [],
        reminderSent: body.reminderSent || false,
        updatedAt: now,
        completedAt: body.completedAt,
        deletedAt: existingTask.deletedAt,
        completed: body.completed ?? false
    };

    tasks[index] = updatedTask;
    await saveTasks(tasks);
    return updatedTask;
}

export const patchTask = async (id, body) => {
    const tasks = await readTasks();
    const task = tasks.find(task => task.id === id);
    const now = new Date().toISOString();

    if (!task) {
        return "Task not found"
    }

    Object.assign(task, body);
    await saveTasks(tasks);
    return task
}

export const deleteTask = async (id) => {
    const tasks = await readTasks();
    const now = new Date().toISOString();

    const task = tasks.find(task => task.id === id);
    if (!task || task.deletedAt) {
        return "task not found";
    }
    task.deletedAt = now;
    await saveTasks(tasks);
    return task;
}

export const deleteCompletedTasks = async () => {
    const tasks = await readTasks();
    const now = new Date().toISOString();

    tasks.forEach(task => {
        if (task.completed && !task.deletedAt)
            task.deletedAt = now;
    })

    await saveTasks(tasks);
    return tasks;
}