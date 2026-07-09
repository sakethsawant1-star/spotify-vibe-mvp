const express = require('express');
const router = express.Router();
const { extractIntent } = require('../services/groq');
const { fetchTracks } = require('../services/spotify');

/**
 * POST /api/vibe
 * Receives a vibe prompt and access token, returns AI-extracted intent + matching tracks.
 * Body: { prompt: string, accessToken: string }
 * Returns: { intent: object, tracks: Array }
 */
router.post('/', async (req, res, next) => {
  const { prompt, accessToken } = req.body;

  if (!prompt || !accessToken) {
    return res.status(400).json({ error: 'Missing prompt or accessToken' });
  }

  try {
    // Step 1: Extract structured intent from the vibe prompt using Groq
    const intentJSON = await extractIntent(prompt);

    // Step 2: Fetch matching tracks from Spotify using the extracted intent
    const tracks = await fetchTracks(intentJSON, accessToken);

    // Return both the AI-extracted intent and the matching tracks
    res.json({
      intent: intentJSON,
      tracks: tracks,
    });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
});

module.exports = router;
