import express from 'express';
import router from './src/routes/taskRoutes.js'
import { errorHandler } from './src/middleware/errorHandler.js';
import { requireJson } from './src/middleware/requireJson.js';
import systemRoutes from './src/routes/system.js';
import { start } from './src/jobs/reminderJob.js';
import AppError from './src/errors/AppError.js';
const app = express()
const port = 3000

start();
app.use(requireJson);
app.use(express.json({ limit: '10kb' }));
app.use("/api/tasks", router);


app.use('/api', systemRoutes);

app.use((req, res, next) => {
    const path = req.path;
    let allowed;
    if (path === '/api/tasks') allowed = ['GET', 'POST', 'DELETE'];
    else if (/^\/api\/tasks\/[^/]+$/.test(path)) allowed = ['GET', 'PUT', 'PATCH', 'DELETE'];
    else if (/^\/api\/tasks\/[^/]+\/restore$/.test(path)) allowed = ['POST'];
    else if (/^\/api\/tasks\/[^/]+\/subtasks$/.test(path)) allowed = ['GET', 'POST'];
    else if (/^\/api\/tasks\/[^/]+\/subtasks\/[^/]+$/.test(path)) allowed = ['PATCH', 'DELETE'];
    else if (/^\/api\/tasks\/[^/]+\/snooze$/.test(path)) allowed = ['POST'];
    else if (path === '/api/agenda') allowed = ['GET'];
    else if (path === '/api/notifications') allowed = ['GET'];
    else if (/^\/api\/notifications\/[^/]+$/.test(path)) allowed = ['PATCH'];

    if (allowed) {
        res.set('Allow', allowed.join(', '));
        return next(new AppError('Method not allowed', 405));
    }
    next(new AppError('Route not found', 404));
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
