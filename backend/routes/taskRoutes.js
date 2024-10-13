const express = require('express');
const { getTasks, addTask, editTask, deleteTask, toggleTaskComplete } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, addTask);
router.route('/:id').put(protect, editTask).delete(protect, deleteTask);
router.put('/:id/complete', protect, toggleTaskComplete);

module.exports = router;
