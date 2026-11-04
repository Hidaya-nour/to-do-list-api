import express from 'express';
import router from './src/routes/taskRoutes.js'

const app = express()
const port = 3000

app.use("/api/tasks", router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})