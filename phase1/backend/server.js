require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const vibeRoutes = require('./routes/vibe');
const playlistRoutes = require('./routes/playlist');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend domain only
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/vibe', vibeRoutes);
app.use('/api/playlist', playlistRoutes);

// Centralized error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
