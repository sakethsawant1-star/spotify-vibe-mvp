require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const vibeRoutes = require('./routes/vibe');
const playlistRoutes = require('./routes/playlist');
const homeRoutes = require('./routes/home');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for local development
app.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());

// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/vibe', vibeRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/home', homeRoutes);

// Centralized error handling middleware
app.use(errorHandler);

// Start server on PORT (default 3000) when running locally (skipped on Vercel Serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server is running on http://127.0.0.1:${PORT}`);
  });

  // Also listen on port 8080 to match registered Spotify redirect URI and Live Server
  if (PORT !== 8080) {
    try {
      const secondaryServer = app.listen(8080, '0.0.0.0', () => {
        console.log(`Frontend and Spotify OAuth callback also accessible at http://127.0.0.1:8080`);
      });
      secondaryServer.on('error', (err) => {
        console.log(`Port 8080 not available (${err.message}), continuing on port ${PORT}`);
      });
    } catch (e) {
      console.log(`Could not bind secondary port 8080: ${e.message}`);
    }
  }
}

module.exports = app;
