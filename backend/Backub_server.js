const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);


const todoRoutes = require('./routes/todos');
app.use('/api/todos', todoRoutes);

const noteRoutes = require('./routes/notes');
app.use('/api/notes', noteRoutes);

const topicRoutes = require('./routes/topics');
app.use('/api/topics', topicRoutes);

const materialRoutes = require('./routes/studyMaterials');
app.use('/api/materials', materialRoutes);

const performanceRoutes = require('./routes/performance');
app.use('/api/performance', performanceRoutes); // ✅ Correct







const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));