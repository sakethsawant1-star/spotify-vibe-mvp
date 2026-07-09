const axios = require('axios');

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Fetch tracks from Spotify Recommendations API based on Groq-extracted intent.
 * @param {object} intentJSON - Structured intent from Groq (mood, energy, valence, genres, tempo, search_keywords)
 * @param {string} accessToken - Spotify OAuth access token
 * @returns {Array} Array of track objects
 */
const fetchTracks = async (intentJSON, accessToken) => {
  // Map tempo string to BPM ranges for Spotify
  const tempoMap = {
    slow: { min_tempo: 40, max_tempo: 100 },
    medium: { min_tempo: 100, max_tempo: 140 },
    fast: { min_tempo: 140, max_tempo: 200 },
  };

  const tempoParams = tempoMap[intentJSON.tempo] || tempoMap.medium;

  // Build recommendations query params
  const params = {
    seed_genres: intentJSON.genres.slice(0, 2).join(','), // Spotify allows max 5 seeds total
    target_energy: intentJSON.energy,
    target_valence: intentJSON.valence,
    min_energy: Math.max(0, intentJSON.energy - 0.2),
    max_energy: Math.min(1, intentJSON.energy + 0.2),
    ...tempoParams,
    limit: 15, // Request extra to account for tracks without preview URLs
  };

  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/recommendations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: params,
    });

    // Map and filter tracks
    const tracks = response.data.tracks
      .map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        albumArt: track.album.images[0]?.url || '',
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls?.spotify || '',
        uri: track.uri,
      }))
      .filter((track) => track.previewUrl) // Filter out tracks without preview URLs
      .slice(0, 10); // Return exactly 10

    // If we don't have 10 tracks with previews, supplement with keyword search
    if (tracks.length < 10) {
      const searchTracks = await searchByKeywords(intentJSON.search_keywords, accessToken, 10 - tracks.length);
      tracks.push(...searchTracks);
    }

    return tracks.slice(0, 10);
  } catch (error) {
    console.error('Spotify Recommendations Error:', error.response?.data || error.message);

    // Fallback: use search_keywords from Groq to do a text search
    console.log('Falling back to keyword search...');
    return await searchByKeywords(intentJSON.search_keywords, accessToken, 10);
  }
};

/**
 * Fallback: Search Spotify by keywords when Recommendations API fails or returns too few results.
 * @param {Array} keywords - Array of keyword strings from Groq
 * @param {string} accessToken - Spotify OAuth access token
 * @param {number} limit - Number of tracks to return
 * @returns {Array} Array of track objects
 */
const searchByKeywords = async (keywords, accessToken, limit = 10) => {
  const query = keywords.join(' ');

  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: query,
        type: 'track',
        limit: limit + 5, // Request extra for filtering
      },
    });

    return response.data.tracks.items
      .map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        albumArt: track.album.images[0]?.url || '',
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls?.spotify || '',
        uri: track.uri,
      }))
      .filter((track) => track.previewUrl)
      .slice(0, limit);
  } catch (error) {
    console.error('Spotify Search Error:', error.response?.data || error.message);
    return [];
  }
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
};

module.exports = { fetchTracks, createPlaylist };
