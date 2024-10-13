const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cron = require('node-cron');
const Task = require('./models/Task');
const { Server } = require('socket.io'); 
const http = require('http'); 

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes'); 

dotenv.config();


connectDB();

const app = express();
const server = http.createServer(app); 

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

cron.schedule('*/30 * * * *', async () => {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60000);
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60000);

    // Fetch tasks due between 2 and 3 hours from now that are not completed
    const tasks = await Task.find({
      dueDate: { $gte: twoHoursFromNow, $lte: threeHoursFromNow },
      completed: false,
    });

    // Emit notifications for tasks due in 2 to 3 hours
    tasks.forEach((task) => {
      const timeLeft = (new Date(task.dueDate).getTime() - now.getTime()) / (60 * 1000); // time left in minutes
      console.log(`Reminder: Task "${task.taskName}" is due in ${timeLeft.toFixed(0)} minutes at ${task.dueDate}`);

      // Emit a notification to all connected clients for upcoming tasks
      io.emit('task-reminder', {
        taskName: task.taskName,
        dueDate: task.dueDate,
        message: `Reminder: Task "${task.taskName}" is due in ${Math.floor(timeLeft / 60)} hours and ${timeLeft % 60} minutes.`,
      });
    });

    // Fetch tasks that are exactly due now
    const tasksDueNow = await Task.find({
      dueDate: { $lte: now },
      completed: false,
    });

    // Emit notification for tasks that are due now
    tasksDueNow.forEach((task) => {
      console.log(`Reminder: Task "${task.taskName}" is due NOW at ${task.dueDate}`);

      // Emit a notification for tasks that are due right now
      io.emit('due-now', {
        taskName: task.taskName,
        dueDate: task.dueDate,
        message: `Task "${task.taskName}" is due right now!`,
      });
    });

  } catch (error) {
    console.error('Error fetching upcoming tasks: ', error);
  }
});



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
