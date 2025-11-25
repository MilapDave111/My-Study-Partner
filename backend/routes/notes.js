const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all notes for a user
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT notes.*, topics.title AS topic_title FROM notes JOIN topics ON notes.topic_id = topics.id WHERE notes.user_id = ? ORDER BY notes.updated_at DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
});

// Add a new note
router.post('/', async (req, res) => {
  const { user_id, topic_id, content } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO notes (user_id, topic_id, content) VALUES (?, ?, ?)',
      [user_id, topic_id, content]
    );
    res.json({ message: 'Note added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add note', error: err.message });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  const { content } = req.body;
  try {
    await db.query('UPDATE notes SET content = ? WHERE id = ?', [content, req.params.id]);
    res.json({ message: 'Note updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update note', error: err.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM notes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note', error: err.message });
  }
});

module.exports = router;
