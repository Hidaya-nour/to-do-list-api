import express from 'express';
import router from './src/routes/taskRoutes.js'
import { errorHandler } from './src/middleware/errorHandler.js';
import { requireJson } from './src/middleware/requireJson.js';
import systemRoutes from './src/routes/system.js';
import { start } from './src/jobs/reminderJob.js';
const app = express()
const port = 3000

start();
app.use(requireJson);
app.use(express.json({ limit: '10kb' }));
app.use("/api/tasks", router);


app.use('/api', systemRoutes);

app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    next(error);
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})