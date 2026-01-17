const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/api/materials/files', express.static(path.join(__dirname, 'uploads')));

// DB connection
const db = require('./db');

// Routes
const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics');
const notesRoutes = require('./routes/notes');
const todoRoutes = require('./routes/todos');
const studyMaterialRoutes = require('./routes/studyMaterials');
const subjectRoutes = require('./routes/subjects');

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/materials', studyMaterialRoutes);
app.use('/api/subjects', subjectRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
