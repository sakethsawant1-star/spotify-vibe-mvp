const axios = require('axios');

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Fetch tracks from Spotify Search API based on Groq-curated track lists.
 * @param {object} intentJSON - Structured intent from Groq containing curated_tracks
 * @param {string} accessToken - Spotify OAuth access token
 * @returns {Array} Array of track objects
 */
const fetchTracks = async (intentJSON, accessToken) => {
  const curated = intentJSON.curated_tracks || [];
  console.log(`Extracting ${curated.length} exact tracks from Vibe Curator AI...`);

  // Run all 10 searches in parallel
  const trackPromises = curated.map(async (item) => {
    try {
      const query = `track:${item.track} artist:${item.artist}`;
      const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          q: query,
          type: 'track',
          limit: 1, // We only need the top match
        },
      });

      const track = response.data.tracks.items[0];
      if (track) {
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown Artist',
          albumArt: track.album.images[0]?.url || '',
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls?.spotify || '',
          uri: track.uri,
        };
      }
      return null;
    } catch (error) {
      if (error.response?.status === 401) {
        const err = new Error('Spotify Token Expired');
        err.statusCode = 401;
        throw err;
      }
      console.warn(`Failed to find track: ${item.track} by ${item.artist}`);
      return null;
    }
  });

  const results = await Promise.all(trackPromises);
  const validTracks = results.filter((t) => t !== null);
  
  console.log(`Successfully mapped ${validTracks.length} tracks from Spotify.`);
  return validTracks;
};

/**
 * Create a Spotify playlist and add tracks to it.
 * @param {Array} trackURIs - Array of Spotify track URIs (e.g. ["spotify:track:xxx"])
 * @param {string} playlistName - Name for the new playlist
 * @param {string} accessToken - Spotify OAuth access token
 * @returns {object} { playlistUrl, playlistId }
 */
const createPlaylist = async (trackURIs, playlistName, accessToken) => {
  // Step 1: Get the current user's Spotify ID
  const userResponse = await axios.get(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const userId = userResponse.data.id;

  // Step 2: Create a new playlist
  try {
    const playlistResponse = await axios.post(
    `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
    {
      name: playlistName,
      public: false,
      description: 'Created by Vibe Prompt — AI-powered music discovery',
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const playlistId = playlistResponse.data.id;
  const playlistUrl = playlistResponse.data.external_urls?.spotify || '';

  // Step 3: Add tracks to the playlist
  await axios.post(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    { uris: trackURIs },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return { playlistUrl, playlistId };
  } catch (error) {
    if (error.response && error.response.status === 403) {
      const err = new Error('Spotify Forbidden: User not in allowlist or missing scopes');
      err.statusCode = 403;
      throw err;
    }
    throw error;
  }
};

/**
 * Save a track to the user's Liked Songs (Your Library)
 * @param {string} trackId - Spotify track ID
 * @param {string} accessToken - Spotify OAuth access token
 */
const saveTrack = async (trackId, accessToken) => {
  try {
    await axios.put(
    `${SPOTIFY_API_BASE}/me/tracks`,
    { ids: [trackId] },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      const err = new Error('Spotify Forbidden: User not in allowlist or missing scopes');
      err.statusCode = 403;
      throw err;
    }
    throw error;
  }
};

module.exports = { fetchTracks, createPlaylist, saveTrack };
