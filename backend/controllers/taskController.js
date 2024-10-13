const Task = require("../models/Task");

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const addTask = async (req, res) => {
  const { taskName, dueDate } = req.body;
  try {
    const task = await Task.create({
      user: req.user._id,
      taskName,
      dueDate,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const editTask = async (req, res) => {
  const { taskName, dueDate } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });
    task.taskName = taskName || task.taskName;
    task.dueDate = dueDate || task.dueDate;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    console.log("Attempting to delete task with ID:", req.params.id);
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this task" });
    }
    await Task.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const toggleTaskComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskComplete,
};
