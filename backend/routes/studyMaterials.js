const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../db');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
router.use('/files', express.static(path.join(__dirname, '..', 'uploads')));

// Upload material (with file)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Received file:', req.file);
    console.log('📥 Body:', req.body);

    const { user_id, topic_id, title, file_type, description } = req.body;
    const file_link = `https://my-study-partner.onrender.com/api/materials/files/${req.file.filename}`;

    await db.query(`
      INSERT INTO study_materials (user_id, topic_id, title, file_link, file_type, description)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, topic_id, title, file_link, file_type, description]
    );

    res.json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error('🔥 Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});


// Get all materials
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sm.*, t.title AS topic_title
      FROM study_materials sm
      JOIN topics t ON sm.topic_id = t.id
      WHERE sm.user_id = ?
      ORDER BY sm.uploaded_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch materials', error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM study_materials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
