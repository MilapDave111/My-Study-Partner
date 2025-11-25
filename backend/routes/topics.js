const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET all topics for a user (with subject name)
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, s.name AS subject_name
       FROM topics t
       LEFT JOIN subjects s ON t.subject_id = s.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch topics', error: err.message });
  }
});

// ✅ POST: add new topic
router.post('/', async (req, res) => {
  const { user_id, subject_id, title, description, rating } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO topics (user_id, subject_id, title, description, rating) VALUES (?, ?, ?, ?, ?)',
      [user_id, subject_id, title, description, rating]
    );
    res.json({ message: 'Topic added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add topic', error: err.message });
  }
});

// ✅ PUT: update topic rating
router.put('/:id', async (req, res) => {
  const { rating } = req.body;
  try {
    await db.query('UPDATE topics SET rating = ? WHERE id = ?', [rating, req.params.id]);
    res.json({ message: 'Rating updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update topic', error: err.message });
  }
});

// ✅ DELETE: remove topic
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM topics WHERE id = ?', [req.params.id]);
    res.json({ message: 'Topic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete topic', error: err.message });
  }
});

module.exports = router;
