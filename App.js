require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

const TaskSchema = new Schema({
  title: String,
  description: String,
  dueDate: Date,
  category: String,
  priority: String,
  status: { type: String, default: 'pending' }
});

const Task = mongoose.model('Task', TaskSchema);

app.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    try {
        const newTask = await task.save();
        res.status(201).send(newTask);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.patch('/tasks/:taskId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        task.status = req.body.status;
        await task.save();
        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/tasks', async (req, res) => {
    const { category, priority, status } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    try {
        const tasks = await Task.find(filter).sort({ dueDate: 1 });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
