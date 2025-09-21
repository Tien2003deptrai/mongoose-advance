const express = require('express');
const { connect } = require('./mongoose');
const courseRoutes = require('./routes/courses');
const allRoutes = require('./routes/allRoute');
const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001

// Middleware
app.use(express.json());

// Connect to MongoDB
connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/all', allRoutes);

// Add a test route to verify routing is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Courses API: http://localhost:${PORT}/api/courses`);
  console.log(`Test API: http://localhost:${PORT}/api/test`);
});
