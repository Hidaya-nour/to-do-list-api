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

const findSubtask = (task, subtaskId) => {
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) throw new AppError('Subtask not found', 404);
    return subtask;
};

const isTitleTaken = (tasks, title, ignoreId) => tasks.some(t => t.id !== ignoreId && t.deletedAt === null &&
    !t.completed && t.title.toLowerCase() === title.toLowerCase());

const assertTitleAvailable = (tasks, title, ignoreId) => {
    if (isTitleTaken(tasks, title, ignoreId)) {
        throw new AppError('An active task with this title already exists', 409);
    }
};

const assertRepeatHasDueDate = (task) => {
    if (task.repeat !== 'none' && !task.dueDate) {
        throw new AppError('Validation failed', 422,
            [{ field: 'repeat', message: 'A due date is required when repeat is not "none"' }]);
    }
};


const today = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};


const parseDate = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
};
const formatDate = (date) => date.toISOString().slice(0, 10);


const stepDate = (dateStr, repeat) => {
    const date = parseDate(dateStr);
    if (repeat === 'daily') date.setUTCDate(date.getUTCDate() + 1);
    else if (repeat === 'weekly') date.setUTCDate(date.getUTCDate() + 7);
    else {
        const day = date.getUTCDate();
        date.setUTCDate(1);                                  // avoid overflowing into the next month
        date.setUTCMonth(date.getUTCMonth() + 1);
        const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
        date.setUTCDate(Math.min(day, lastDay));
    }
    return formatDate(date);
};

const nextDueDate = (dueDate, repeat) => {
    const todayStr = today();
    let next = stepDate(dueDate, repeat);
    while (next < todayStr) next = stepDate(next, repeat);
    return next;
};
const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };


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
    const justCompleted = changes.completed === true && !task.completed;     // NEW

    if (changes.completed !== undefined && changes.completed !== task.completed) {
        updated.completedAt = changes.completed ? updated.updatedAt : null;
    }
    if (changes.remindAt !== undefined && changes.remindAt !== task.remindAt) {
        updated.reminderSent = false;
    }

    assertRepeatHasDueDate(updated);
    if (!updated.completed) assertTitleAvailable(tasks, updated.title, id);

    tasks[tasks.indexOf(task)] = updated;

    // NEW: completing a recurring task creates the next occurrence
    // (skipped if an unfinished task with the same title already exists)
    let nextTask = null;
    if (justCompleted && updated.repeat !== 'none' && !isTitleTaken(tasks, updated.title)) {
        nextTask = buildNextOccurrence(updated, updated.updatedAt);
        tasks.push(nextTask);
    }

    await saveTasks(tasks);
    return { task: updated, nextTask };                                      // CHANGED
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
    const task = findActiveTask(await readTasks(), id);
    return task.subtasks;
};

export const addSubTask = async (id, body) => {
    const tasks = await readTasks();
    const task = findActiveTask(tasks, id);

    const subtask = { id: randomUUID(), title: body.title, completed: false };
    task.subtasks.push(subtask);
    task.updatedAt = new Date().toISOString();

    await saveTasks(tasks);
    return subtask;
};

export const updateSubTask = async (id, subtaskId, changes) => {
    const tasks = await readTasks();
    const task = findActiveTask(tasks, id);
    const subtask = findSubtask(task, subtaskId);

    Object.assign(subtask, changes);   // safe: the schema only allows title and completed
    task.updatedAt = new Date().toISOString();

    await saveTasks(tasks);
    return subtask;
};

export const deleteSubTask = async (id, subtaskId) => {
    const tasks = await readTasks();
    const task = findActiveTask(tasks, id);
    findSubtask(task, subtaskId);      // throws 404 if it does not exist

    task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
    task.updatedAt = new Date().toISOString();

    await saveTasks(tasks);
};

export const getAgenda = async () => {
    const todayStr = today();
    const tasks = await readTasks();

    const open = tasks.filter(t => t.deletedAt === null && !t.completed && t.dueDate);

    const byPriorityThenDate = (a, b) =>
        PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || a.dueDate.localeCompare(b.dueDate);

    return {
        date: todayStr,
        overdue: open.filter(t => t.dueDate < todayStr).sort(byPriorityThenDate),
        dueToday: open.filter(t => t.dueDate === todayStr).sort(byPriorityThenDate),
    };
};

export const findDueReminders = async () => {
    const now = new Date();
    const tasks = await readTasks();

    return tasks.filter(t =>
        t.remindAt &&                    // has a reminder time
        !t.reminderSent &&               // not already sent
        !t.completed &&                  // still needs doing
        t.deletedAt === null &&          // not in the trash
        new Date(t.remindAt) <= now);    // the time has arrived
};

export const markReminderSent = async (id) => {

    const tasks = await readTasks();

    const task = tasks.find(t => t.id === id);

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    task.reminderSent = true;
    task.updatedAt = new Date().toISOString();

    await saveTasks(tasks);
    return task;
};

export const snoozeReminder = async (id, minutes = 10) => {
    const tasks = await readTasks();

    const task = findActiveTask(tasks, id);

    if (task.completed) {
        throw new AppError('Cannot snooze a completed task', 409);
    }

    if (task.remindAt === null) {
        throw new AppError('Task does not have a reminder', 400);
    }

    if (!Number.isInteger(minutes) || minutes <= 0) {
        throw new AppError('Snooze duration must be a positive integer', 400);
    }

    const newReminderTime = new Date(
        Date.now() + minutes * 60 * 1000
    ).toISOString();

    task.remindAt = newReminderTime;
    task.reminderSent = false;
    task.updatedAt = new Date().toISOString();

    await saveTasks(tasks);

    return task;
};

const buildNextOccurrence = (task, now) => {
    const dueDate = nextDueDate(task.dueDate, task.repeat);

    let remindAt = null;
    if (task.remindAt) {
        const days = (parseDate(dueDate) - parseDate(task.dueDate)) / 86400000;   // how far the due date moved
        remindAt = new Date(new Date(task.remindAt).getTime() + days * 86400000).toISOString();
    }

    return {
        id: randomUUID(),
        title: task.title,
        description: task.description,
        completed: false,
        priority: task.priority,
        dueDate,
        remindAt,
        repeat: task.repeat,
        subtasks: task.subtasks.map(s => ({ id: randomUUID(), title: s.title, completed: false })),
        reminderSent: false,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        deletedAt: null,
    };
};

