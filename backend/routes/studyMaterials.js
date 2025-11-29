const express = require('express');
const router = express.Router();
const db = require('../db');
require('dotenv').config(); // Load env vars

// 1. IMPORT CLOUDINARY MODULES
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 2. CONFIGURE CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. SET UP STORAGE ENGINE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'study-materials', // The folder name in your Cloudinary dashboard
    resource_type: 'auto',     // CRITICAL: Allows uploading PDFs, Images, and Videos
    // format: async (req, file) => 'png', // keep commented to keep original format
  },
});

const upload = multer({ storage: storage });

// 4. POST ROUTE (UPLOAD)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Check if file is missing
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📥 Cloudinary File Info:', req.file);

    const { user_id, topic_id, title, file_type, description } = req.body;
    
    // THIS IS THE FIX: Cloudinary gives you a hosted URL directly.
    const fileUrl = req.file.path; 

    // Insert into Database
    await db.query(`
      INSERT INTO study_materials (user_id, topic_id, title, fileUrl, file_type, description)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, topic_id, title, fileUrl, file_type, description]
    );

    res.json({ message: 'File uploaded successfully', url: fileUrl });

  } catch (err) {
    console.error('🔥 Upload Error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// 5. GET ROUTE (Fetch)
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        sm.id, 
        sm.user_id, 
        sm.topic_id, 
        sm.title, 
        sm.file_url AS file_link,  -- RENAME HERE using AS
        sm.file_type, 
        sm.description, 
        sm.uploaded_at,
        t.title AS topic_title
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

// 6. DELETE ROUTE
router.delete('/:id', async (req, res) => {
  try {
    // Note: This deletes the record from MySQL, but keeps the file in Cloudinary.
    // To delete from Cloudinary, you would need the 'public_id' stored in DB.
    await db.query('DELETE FROM study_materials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;