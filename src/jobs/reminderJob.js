import {
    findDueReminders,
    markReminderSent
} from '../service/taskService.js';

const checkReminders = async () => {
    try {
        const due = await findDueReminders();


        for (const task of due) {
            console.log(`[reminder] ${task.title}`);

            await markReminderSent(task.id);

            console.log(`[reminder] ${task.title} marked as sent`);
        }

    } catch (err) {
        console.error('[reminder] Reminder check failed:', err.message);
    }
};

export const start = () => {
    const seconds = Number(process.env.REMINDER_CHECK_SECONDS) || 30;
    checkReminders();

    setInterval(checkReminders, seconds * 1000);
};