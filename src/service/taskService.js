import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import AppError from '../errors/AppError.js';

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

const findActiveTask = (tasks, id) => {
    const task = tasks.find(t => t.id === id && t.deletedAt === null);
    if (!task) throw new AppError('Task not found', 404);
    return task;
};

const assertTitleAvailable = (tasks, title, ignoreId) => {
    const taken = tasks.some(t => t.id !== ignoreId && t.deletedAt === null &&
        !t.completed && t.title.toLowerCase() === title.toLowerCase());
    if (taken) throw new AppError('An active task with this title already exists', 409);
};

const assertRepeatHasDueDate = (task) => {
    if (task.repeat !== 'none' && !task.dueDate) {
        throw new AppError('Validation failed', 422,
            [{ field: 'repeat', message: 'A due date is required when repeat is not "none"' }]);
    }
};


export const getAllTasks = async (query = {}) => {
    const { priority, dueDate, completed, search, sort, order = 'asc', deleted = false } = query;
    const tasks = await readTasks();

    let filteredTasks = tasks.filter(task => deleted ? task.deletedAt !== null : task.deletedAt === null);

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

    const task = tasks.find(task => task.id === id && task.deletedAt === null);

    if (!task) throw new AppError("task not found", 404)
    return task;
}

export const createTask = async (body) => {
    const tasks = await readTasks();
    assertTitleAvailable(tasks, body.title);
    const now = new Date().toISOString();

    const newTask = {
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
    assertRepeatHasDueDate(newTask);

    tasks.push(newTask);
    await saveTasks(tasks);

    return newTask;
}

const changeTask = async (id, changes) => {
    const tasks = await readTasks();
    const task = findActiveTask(tasks, id);

    const updated = { ...task, ...changes, updatedAt: new Date().toISOString() };

    if (changes.completed !== undefined && changes.completed !== task.completed) {
        updated.completedAt = changes.completed ? updated.updatedAt : null;
    }
    if (changes.remindAt !== undefined && changes.remindAt !== task.remindAt) {
        updated.reminderSent = false;
    }

    assertRepeatHasDueDate(updated);
    if (!updated.completed) assertTitleAvailable(tasks, updated.title, id);

    tasks[tasks.indexOf(task)] = updated;
    await saveTasks(tasks);
    return updated;
};
export const updateTask = changeTask;
export const patchTask = changeTask;


export const deleteTask = async (id) => {
    const tasks = await readTasks();
    const task = findActiveTask(tasks, id);

    task.deletedAt = new Date().toISOString();
    task.updatedAt = task.deletedAt
    await saveTasks(tasks);
}

export const deleteCompletedTasks = async () => {
    const tasks = await readTasks();
    const now = new Date().toISOString();

    const toDelete = tasks.filter(task => task.completed && task.deletedAt === null);
    toDelete.forEach(task => {
        task.deletedAt = now; task.updatedAt = now;
    });

    if (toDelete.length > 0) await saveTasks(tasks);
    return toDelete.length;
}

export const restoreTask = async (id) => {
    const tasks = await readTasks();
    const task = tasks.find(task => task.id === id);
    if (!task) throw new AppError('Task not found', 404);
    if (!task.deletedAt) throw new AppError('Task is not in the trash', 409);
    if (!task.completed) assertTitleAvailable(tasks, task.title, id);

    task.deletedAt = null;
    task.updatedAt = new Date().toISOString();
    await saveTasks(tasks);
    return task;

}

export const permanentlyDeleteTask = async (id) => {
    const tasks = await readTasks();
    const task = tasks.find(task => task.id === id);
    if (!task) throw new AppError('Task not found', 404);
    if (!task.deletedAt) {
        throw new AppError('Task must be in the trash before it can be permanently deleted', 409);
    }

    const updatedTasks = tasks.filter(task => task.id !== id);
    await saveTasks(updatedTasks);
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