const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

// Serve Frontend Static Files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Any route that is not an API should serve the frontend's index.html (for client-side routing consistency)
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  // If the request is not for the API, serve the requested HTML file if it exists, otherwise fallback to index.html
  res.sendFile(path.join(__dirname, '../frontend', req.path === '/' ? 'index.html' : req.path), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
