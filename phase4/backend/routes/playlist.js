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
    next(error); // Pass to centralized error handler
  }
});

module.exports = router;
