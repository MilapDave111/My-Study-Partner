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

// 3. SET UP STORAGE ENGINE (FIXED FOR PDF CORRUPTION)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Detect if the file is a PDF
    const isPdf = file.mimetype === 'application/pdf';
    
    return {
      folder: 'study-materials', // The folder name in your Cloudinary dashboard
      resource_type: 'auto',     // Allows uploading PDFs, Images, and Videos
      
      // CRITICAL FIX: Explicitly tell Cloudinary to keep it as 'pdf'
      // If we don't do this, Cloudinary sometimes corrupts the file structure.
      format: isPdf ? 'pdf' : file.mimetype.split('/')[1],
      
      // Optional: Add timestamp to filename to avoid duplicates overwriting each other
      public_id: file.originalname.split('.')[0] + '-' + Date.now(), 
    };
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
    
    // 1. Get the URL from Cloudinary
    const fileUrl = req.file.path; 

    // 2. Insert into DB using 'file_link' (Your correct column name)
    await db.query(`
      INSERT INTO study_materials (user_id, topic_id, title, file_link, file_type, description)
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
        sm.file_link,   -- CORRECTED: Select the actual column containing data
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
    console.error("Fetch error:", err);
    res.status(500).json({ message: 'Failed to fetch materials', error: err.message });
  }
});

// 6. DELETE ROUTE
router.delete('/:id', async (req, res) => {
  try {
    // Note: This deletes the record from MySQL, but keeps the file in Cloudinary.
    await db.query('DELETE FROM study_materials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;