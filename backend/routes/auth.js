const express = require('express');
const axios = require('axios');
const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8080/callback.html';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:8080';

// Step 1: Redirect user to Spotify authorization page
router.get('/login', (req, res) => {
  const scope = 'playlist-modify-public playlist-modify-private user-read-private user-read-email user-library-modify user-library-read user-top-read';
  const state = Math.random().toString(36).substring(7);

  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: 'true', // Forces the login screen to appear
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
});

// Step 2: Handle callback from Spotify and exchange code for access token
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        },
      }
    );

    // Redirect back to the frontend with the token in the URL hash
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    res.redirect(`${process.env.FRONTEND_URL}/#access_token=${accessToken}&refresh_token=${refreshToken}`);
  } catch (error) {
    console.error('Error in token exchange:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// Step 3: Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.refresh_token;
  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token provided' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        },
      }
    );

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;
