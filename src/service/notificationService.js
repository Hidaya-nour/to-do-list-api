import { readFile, writeFile, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import AppError from '../errors/AppError.js';

const filePath = new URL('../../data/notifications.json', import.meta.url);
let pendingSave = Promise.resolve();

const readNotifications = async () => {
    try {
        return JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await saveNotifications([]);
        return [];
    }
};

const saveNotifications = async (notifications) => {
    const contents = JSON.stringify(notifications, null, 2);
    const save = pendingSave.then(async () => {
        const temporaryPath = new URL(`../../data/notifications.${randomUUID()}.tmp`, import.meta.url);
        await writeFile(temporaryPath, contents);
        await rename(temporaryPath, filePath);
    });
    pendingSave = save.catch(() => {});
    await save;
};

export const createReminderNotification = async (task) => {
    const notifications = await readNotifications();
    const notification = {
        id: randomUUID(),
        taskId: task.id,
        message: `Reminder: ${task.title}`,
        createdAt: new Date().toISOString(),
        read: false,
    };
    notifications.push(notification);
    await saveNotifications(notifications);
    return notification;
};

export const listNotifications = async ({ read } = {}) => {
    const notifications = await readNotifications();
    return notifications
        .filter(notification => read === undefined || notification.read === read)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const markNotificationRead = async (id, read) => {
    const notifications = await readNotifications();
    const notification = notifications.find(item => item.id === id);
    if (!notification) throw new AppError('Notification not found', 404);
    notification.read = read;
    await saveNotifications(notifications);
    return notification;
};

export const countUnreadNotifications = async () =>
    (await readNotifications()).filter(notification => !notification.read).length;
