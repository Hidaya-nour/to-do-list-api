import express from 'express';
import router from './src/routes/taskRoutes.js'
import { errorHandler } from './src/middleware/errorHandler.js';
import { requireJson } from './src/middleware/requireJson.js';

const app = express()
const port = 3000


app.use(requireJson);
app.use(express.json({ limit: '10kb' }));
app.use("/api/tasks", router);

app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    next(error);
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})