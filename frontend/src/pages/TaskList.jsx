import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await axios.get("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error("Unauthorized! Please log in.");
        } else {
          toast.error("Error fetching tasks.");
        }
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    socket.on("task-reminder", (task) => {
      toast.info(
        `Reminder: Task "${
          task.taskName
        }" is due in the next few hours at ${new Date(
          task.dueDate
        ).toLocaleString()}`
      );
    });

    socket.on("due-now", (task) => {
      toast.warn(`Task "${task.taskName}" is due NOW!`);
    });
    return () => {
      socket.off("task-reminder");
      socket.off("due-now");
    };
  }, []);

  const addTask = async () => {
    if (!taskName || !dueDate) {
      toast.error("Please provide task name and due date");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/tasks",
        { taskName, dueDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks([...tasks, data]);
      setTaskName("");
      setDueDate("");
      toast.success("Task added successfully");
    } catch (error) {
      toast.error("Error adding task.");
    }
  };

  const toggleTaskComplete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/tasks/${id}/complete`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(tasks.map((task) => (task._id === id ? data : task)));
      toast.success(
        data.completed
          ? "Task marked as completed!"
          : "Task marked as incomplete!"
      );
    } catch (error) {
      toast.error("Error toggling task completion.");
    }
  };

  const editTask = async () => {
    if (!taskName || !dueDate) {
      toast.error("Please provide task name and due date");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/tasks/${editingTaskId}`,
        { taskName, dueDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(tasks.map((task) => (task._id === editingTaskId ? data : task)));
      setTaskName("");
      setDueDate("");
      setEditingTaskId(null);
      toast.success("Task edited successfully");
    } catch (error) {
      toast.error("Error editing task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.filter((task) => task._id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Error deleting task.");
    }
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url('/path/to/cool-bg-image.jpg')" }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-5xl font-bold text-center text-gray-600 mb-6 drop-shadow-lg">
          To-Do List
        </h1>
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6 drop-shadow-lg">
          Add Tasks Here
        </h1>

        {/* Task Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 max-w-md mx-auto ">
          <input
            type="text"
            placeholder="Task Name"
            className="w-full mb-4 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full mb-4 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            onClick={editingTaskId ? editTask : addTask}
            className="w-full bg-blue-500 text-white py-2 rounded shadow-lg transition hover:bg-blue-600 hover:shadow-xl"
          >
            {editingTaskId ? "Edit Task" : "Add Task"}
          </button>
        </div>

        {/* Task List */}
        <div className="bg-gray-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-red-600 mb-6 drop-shadow-lg">
            List of Tasks
          </h1>
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No tasks to show. Please try adding tasks!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center mb-4 p-4 rounded-lg bg-gray-100 transition duration-200 hover:bg-gray-200"
              >
                <div
                  className={`flex-1 ${
                    task.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-4"
                    checked={task.completed}
                    onChange={() => toggleTaskComplete(task._id)}
                  />
                  {task.taskName} - {new Date(task.dueDate).toLocaleString()}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    className="text-blue-500 hover:text-blue-700 transition"
                    onClick={() => {
                      setEditingTaskId(task._id);
                      setTaskName(task.taskName);
                      setDueDate(task.dueDate);
                    }}
                  >
                    <AiFillEdit size={20} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 transition"
                    onClick={() => deleteTask(task._id)}
                  >
                    <AiFillDelete size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
