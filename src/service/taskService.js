import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const filePath = new URL('../../data/tasks.json', import.meta.url);

export const getAllTasks = async () => {
    const data = await readFile(
        filePath, 'utf-8'
    );
    console.log(data);
    // data.filter(tasks, () => task.deletedAt == null)
    return JSON.parse(data);
};

export const getTasksById = async (id) => {

    const data = await getAllTasks();

    return data.find(task => task.id === id);
}

export const createTask = async (body) => {
    const tasks = await getAllTasks();
    const newTAsk = {
        id: randomUUID(),
        title: body.title,
        completed: false
    };

    tasks.push(newTAsk);
    await writeFile(filePath, JSON.stringify(tasks, null, 2), 'utf-8')

    return newTAsk;
}