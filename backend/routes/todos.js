const express = require('express');
const router = express.Router();
const db = require('../db');

// ------------------------------------------------------
// AUTO-FILL MISSING PERFORMANCE ENTRIES (INTELLIGENT)
// ------------------------------------------------------
async function fillMissingPerformance(userId) {
  try {
    // Fetch last performance date
    const [last] = await db.query(
      "SELECT date FROM performance WHERE user_id=? ORDER BY date DESC LIMIT 1",
      [userId]
    );

    // today's date in Indian timezone
    let today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    today.setHours(0, 0, 0, 0);

    // If user has no performance history, do nothing
    if (last.length === 0) return;

    let lastDate = new Date(last[0].date);
    lastDate.setHours(0, 0, 0, 0);

    // Loop through each missing day
    while (lastDate < today) {
      lastDate.setDate(lastDate.getDate() + 1);

      // Format missingDate as YYYY-MM-DD for SQL
      let missingDate = lastDate.toISOString().split("T")[0];

      // Fetch todos of this missed day
      const [todos] = await db.query(
        `SELECT * FROM todos 
         WHERE user_id = ? AND DATE(due_date) = ?`,
        [userId, missingDate]
      );

      const totalTasks = todos.length;
      const completedTasks = 0;
      const accuracy = 0;

      // Insert intelligent performance entry
      await db.query(
        `INSERT INTO performance 
          (user_id, topic_id, date, accuracy, time_spent_minutes, total_tasks, completed_tasks, extra_completed)
         VALUES (?, NULL, ?, ?, 0, ?, ?, 0)
         ON DUPLICATE KEY UPDATE accuracy = accuracy`,
        [userId, missingDate, accuracy, totalTasks, completedTasks]
      );
    }
  } catch (err) {
    console.error("Error filling missing performance:", err);
  }
}

// ------------------------------------------------------
// BASIC TODO ROUTES
// ------------------------------------------------------

router.get('/:userId', async (req, res) => {
  try {
    await fillMissingPerformance(req.params.userId);

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

// ------------------------------------------------------
// EXTRA FEATURE ROUTES
// ------------------------------------------------------

// GET TODAY'S TASKS
router.get('/today/:userId', async (req, res) => {
  try {
    await fillMissingPerformance(req.params.userId);

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
    console.error("Today's tasks error:", err);
    res.status(500).json({ message: "Failed to fetch today tasks", error: err.message });
  }
});

// GET MISSED TASKS
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

// CALCULATE TODAY PERFORMANCE
router.post('/calculate/:userId', async (req, res) => {
  const userId = req.params.userId;

  await fillMissingPerformance(userId);

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
      `INSERT INTO performance 
        (user_id, date, accuracy, total_tasks, completed_tasks)
       VALUES (?, CURDATE(), ?, ?, ?)
       ON DUPLICATE KEY UPDATE accuracy = ?, total_tasks=?, completed_tasks=?`,
      [userId, accuracy, todos.length, completed, accuracy, todos.length, completed]
    );

    res.json({ message: 'Accuracy updated', accuracy });
  } catch (err) {
    console.error('Accuracy calculation error:', err);
    res.status(500).json({ message: 'Calculation failed', error: err.message });
  }
});

// GET PERFORMANCE GRAPH
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

router.get('/streak/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
      `
      SELECT DISTINCT DATE(date) AS study_date
      FROM performance
      WHERE user_id = ?
        AND accuracy = 100
      ORDER BY study_date DESC
      `,
      [userId]
    );

    let streak = 0;

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let row of rows) {
      const dbDate = new Date(row.study_date);
      dbDate.setHours(0, 0, 0, 0);

      if (dbDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (err) {
    console.error('Streak fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch streak' });
  }
});


// // GET STREAK
// router.get('/streak/:userId', async (req, res) => {
//   const userId = req.params.userId;
//   try {
//     const [rows] = await db.query(
//       `SELECT date FROM performance
//        WHERE user_id = ? AND accuracy = 100
//        ORDER BY date DESC`,
//       [userId]
//     );

//     let streak = 0;
    
//     let currentDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
//     currentDate.setHours(0,0,0,0);

//     for (let row of rows) {
//       const perfDate = new Date(row.date);
//       perfDate.setHours(0,0,0,0);

//       if (perfDate.getTime() === currentDate.getTime()) {
//         streak++;
//         currentDate.setDate(currentDate.getDate() - 1);
//       } else {
//         break;
//       }
//     }

//     res.json({ streak });
//   } catch (err) {
//     console.error('Streak fetch error:', err);
//     res.status(500).json({ message: 'Failed to fetch streak', error: err.message });
//   }
// });

module.exports = router;
