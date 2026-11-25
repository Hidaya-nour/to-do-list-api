import { processDueReminders } from '../service/taskService.js';

let checking = false;

const checkReminders = async () => {
    if (checking) return;
    checking = true;
    try {
        const due = await processDueReminders();
        for (const task of due) {
            console.log(`[reminder] ${task.title}`);
        }
    } catch (err) {
        console.error('[reminder] Reminder check failed:', err.message);
    } finally {
        checking = false;
    }
};

export const start = () => {
    const seconds = Number(process.env.REMINDER_CHECK_SECONDS) || 30;
    checkReminders();

    setInterval(checkReminders, seconds * 1000);
};
