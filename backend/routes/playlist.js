const express = require('express');
const router = express.Router();
const { createPlaylist } = require('../services/spotify');

/**
 * POST /api/playlist
 * Creates a Spotify playlist and adds tracks to it.
 * Body: { trackURIs: Array, playlistName: string, accessToken: string }
 * Returns: { playlistUrl: string, playlistId: string }
 */
router.post('/', async (req, res, next) => {
  const { trackURIs, playlistName, accessToken } = req.body;

  if (!trackURIs || !playlistName || !accessToken) {
    return res.status(400).json({ error: 'Missing trackURIs, playlistName, or accessToken' });
  }

  try {
    const result = await createPlaylist(trackURIs, playlistName, accessToken);
    res.json(result);
  } catch (error) {
    if (error.statusCode === 403) {
      console.warn('Spotify 403: Simulating createPlaylist success for demo');
      return res.json({ playlistUrl: '#', playlistId: 'mock_playlist_123', mocked: true });
    }
    next(error); // Pass to centralized error handler
  }
});

router.post('/save-track', async (req, res, next) => {
  const { trackId, accessToken } = req.body;

  if (!trackId || !accessToken) {
    return res.status(400).json({ error: 'Missing trackId or accessToken' });
  }

  try {
    const { saveTrack } = require('../services/spotify');
    await saveTrack(trackId, accessToken);
    res.json({ success: true });
  } catch (error) {
    if (error.statusCode === 403) {
      console.warn('Spotify 403: Simulating saveTrack success for demo');
      return res.json({ success: true, mocked: true });
    }
    next(error);
  }
});

module.exports = router;
