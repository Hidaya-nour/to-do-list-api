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
    return JSON.parse(data);
}
export const getAllTasks = async (query = {}) => {
    const { priority, dueDate, completed, search, sort, order = 'asc' } = query;
    const tasks = await readTasks();

    let filteredTasks = tasks.filter(task => task.deletedAt === null);

    if (priority) (filteredTasks = filteredTasks.filter(task => task.priority === priority));
    if (dueDate) (filteredTasks = filteredTasks.filter(task => task.dueDate === dueDate));
    if (completed !== undefined) (filteredTasks = filteredTasks.filter(task => task.completed == completed));
    if (search) {
        const text = search.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(text)
            || task.description.toLowerCase().includes(text));
    }

    if (sort) {
        filteredTasks.sort((a, b) => {
            let comparison;
            if (sort === "title")
                comparison = a.title.localeCompare(b.title);
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

    const tasks = await readTasks();

    const task = tasks.find(task => task.id === id);
    return task;
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

export const getDeletedTasks = async () => {
    const tasks = await readTasks()
    const filteredTasks = tasks.filter(task => task.deletedAt);
    return filteredTasks;

}

export const restoreTask = async (id) => {
    const tasks = await readTasks();
    const task = tasks.find(task => task.id === id);
    if (!task) {
        return "task not found";
    }
    task.deletedAt = null;
    await saveTasks(tasks);
    return task;

}

export const permanentlyDeleteTask = async (id) => {
    const tasks = await readTasks();
    const task = tasks.find(task => task.id === id);
    if (!task) {
        return "Task not found";
    }

    if (!task.deletedAt) {
        return "Task is not in the trash";
    }
    const updatedTasks = tasks.filter(task => task.id !== id);
    await saveTasks(updatedTasks);
    return updatedTasks;
}

export const getSubTasks = async (id) => {
    const tasks = await readTasks();
    const task = tasks.find(task => task.id === id);
    if (!task) return "task not found"
    return task.subtasks || [];
}
export const addSubTasks = async (id, body) => {
    const tasks = await getAllTasks();
    console.log(tasks);
    const task = tasks.find(task => task.id === id);
    if (!task) return "trask not found";


    if (!Array.isArray(body.subtasks) || body.subtasks.length === 0) {
        return "Subtasks must be a non-empty array";
    }

    if (body.subtasks.some(subtask => !subtask.title?.trim())) {
        return "Every subtask must have a title";
    }

    const newSubtasks = body.subtasks.map(subtask => ({
        id: randomUUID(),
        title: subtask.title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    }));

    task.subtasks ??= [];
    task.subtasks.push(...newSubtasks);
    await saveTasks(tasks);

    return newSubtasks;
}

export const updateSubTask = async (id, subtaskid, body) => {
    const tasks = await getAllTasks();
    const task = tasks.find(task => task.id === id);
    const subtask = task.subtasks.find(subtask => subtask.id === subtaskid)
    if (!task) return "task not found";
    if (!subtask) return "subtask not found";

    if (body.title) subtask.title = body.title.trim;
    if (body.completed) subtask.completed = body.completed || false;

    await saveTasks(tasks);
    return subtask;

}
export const deleteSubTask = async (id, subtaskId) => {
    const tasks = await getAllTasks();
    const task = tasks.find(task => task.id === id);
    if (!task) return "task not found";

    task.subtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
    await saveTasks(tasks);
    return task.subtasks;
}