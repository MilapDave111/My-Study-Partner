const express = require('express');
const router = express.Router();
const db = require('../db');

// ---------------------------------------------
// BASIC TODO ROUTES
// ---------------------------------------------

router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, tp.title AS topic_title
       FROM todos t
       LEFT JOIN topics tp ON t.topic_id = tp.id
       WHERE t.user_id = ?`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch todos', error: err.message });
  }
});

// Add new TODO
router.post('/', async (req, res) => {
  const { user_id, topic_id, title, due_date } = req.body;
  try {
    await db.query(
      `INSERT INTO todos (user_id, topic_id, title, due_date) VALUES (?, ?, ?, ?)`,
      [user_id, topic_id, title, due_date]
    );
    res.json({ message: 'Task added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding todo', error: err.message });
  }
});

// Mark as complete/incomplete
router.put('/complete/:id', async (req, res) => {
  const { completed } = req.body;
  try {
    console.log(`PUT /complete/${req.params.id} - completed:`, completed); 
    await db.query(
      `UPDATE todos SET completed = ? WHERE id = ?`,
      [completed ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('Complete update error:', err);
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
});

// Delete TODO
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting task:', req.params.id);
    await db.query(`DELETE FROM todos WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
});

// ---------------------------------------------
// EXTRA FEATURE ROUTES
// ---------------------------------------------

// ------------------ GET TODAY'S TASKS ------------------
router.get('/today/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, tp.title AS topic_title
       FROM todos t
       LEFT JOIN topics tp ON t.topic_id = tp.id
       WHERE t.user_id = ? AND DATE(t.due_date) = CURDATE()
       ORDER BY t.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Today\'s tasks error:', err);
    res.status(500).json({ message: 'Failed to fetch today\'s tasks', error: err.message });
  }
});

// ------------------ GET MISSED TASKS ------------------
router.get('/missed/:userId', async (req, res) => {
  try {
    const [missed] = await db.query(
      `SELECT t.*, tp.title AS topic_title
       FROM todos t
       LEFT JOIN topics tp ON t.topic_id = tp.id
       WHERE t.user_id = ? AND t.completed = 0 AND t.due_date < CURDATE()`,
      [req.params.userId]
    );
    res.json(missed);
  } catch (err) {
    console.error('Missed tasks error:', err);
    res.status(500).json({ message: 'Failed to fetch missed tasks', error: err.message });
  }
});

// --------- CALCULATE TODAY'S PERFORMANCE ACCURACY ---------
router.post('/calculate/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [todos] = await db.query(
      `SELECT * FROM todos WHERE user_id = ? AND DATE(due_date) = CURDATE()`,
      [userId]
    );

    if (todos.length === 0) {
      return res.status(200).json({ message: 'No TODOs today', accuracy: 0 });
    }

    const completed = todos.filter(t => t.completed === 1).length;
    const accuracy = Math.round((completed / todos.length) * 100);

    await db.query(
      `INSERT INTO performance (user_id, date, accuracy)
       VALUES (?, CURDATE(), ?)
       ON DUPLICATE KEY UPDATE accuracy = ?`,
      [userId, accuracy, accuracy]
    );

    res.json({ message: 'Accuracy updated', accuracy });
  } catch (err) {
    console.error('Accuracy calculation error:', err);
    res.status(500).json({ message: 'Calculation failed', error: err.message });
  }
});

// ------------------ GET PERFORMANCE GRAPH DATA ------------------
router.get('/performance/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM performance
       WHERE user_id = ?
       ORDER BY date ASC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Performance fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch performance data', error: err.message });
  }
});

// ------------------ GET STREAK ------------------
router.get('/streak/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query(
      `SELECT date FROM performance
       WHERE user_id = ? AND accuracy = 100
       ORDER BY date DESC`,
      [userId]
    );

    let streak = 0;
    
    // ✅ FIX: Force the "Current Date" to be India Time (Asia/Kolkata)
    // This creates a Date object that matches your timezone, not UTC.
    let currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

    for (let row of rows) {
      const perfDate = new Date(row.date);
      // Compare only YYYY-MM-DD to avoid hour mismatch
      if (perfDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]) {
        streak++;
        // Move back one day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (err) {
    console.error('Streak fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch streak', error: err.message });
  }
});

module.exports = router;