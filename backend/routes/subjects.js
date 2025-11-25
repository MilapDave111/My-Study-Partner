const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Route 1: Subject dropdown for topic creation
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [subjects] = await db.query(
      'SELECT id, name FROM subjects WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(subjects);
  } catch (err) {
    console.error('❌ Error fetching subjects for dropdown:', err);
    res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
  }
});

// ✅ Route 2: Subject-wise analytics
router.get('/analytics/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [subjects] = await db.query(
      `SELECT s.id AS subject_id, s.name AS subject_name,
              COUNT(DISTINCT t.id) AS total_topics,
              COUNT(DISTINCT CASE WHEN td.completed = 1 THEN td.id END) AS completed_todos,
              ROUND(AVG(p.accuracy), 2) AS avg_accuracy,
              ROUND(AVG(t.rating), 1) AS avg_rating
       FROM subjects s
       LEFT JOIN topics t ON s.id = t.subject_id AND t.user_id = ?
       LEFT JOIN todos td ON t.id = td.topic_id AND td.user_id = ?
       LEFT JOIN performance p ON t.id = p.topic_id AND p.user_id = ?
       WHERE s.user_id = ?
       GROUP BY s.id, s.name
       ORDER BY s.name ASC`,
      [userId, userId, userId, userId]
    );

    res.json(subjects);
  } catch (err) {
    console.error('🔥 Subject analytics error:', err);
    res.status(500).json({ message: 'Error loading subject analytics' });
  }
});

// ✅ Optional: Route for adding new subject
router.post('/add', async (req, res) => {
  const { user_id, name } = req.body;
  try {
    await db.query('INSERT INTO subjects (user_id, name) VALUES (?, ?)', [user_id, name]);
    res.json({ message: 'Subject added' });
  } catch (err) {
    console.error('Error adding subject:', err);
    res.status(500).json({ message: 'Error adding subject' });
  }
});

module.exports = router;
