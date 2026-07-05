const express = require('express');
const axios = require('axios');
const router = express.Router();

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * GET /api/home
 * Fetches data for the Home dashboard: user's top tracks and featured playlists.
 * Headers: { Authorization: 'Bearer <token>' }
 */
router.get('/', async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    // Fetch Top Tracks
    const topTracksResponse = await axios.get(`${SPOTIFY_API_BASE}/me/top/tracks?limit=8`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).catch((err) => {
      if (err.response?.status === 401) {
        const authErr = new Error('Spotify Token Expired');
        authErr.statusCode = 401;
        throw authErr;
      }
      console.error('Spotify API Error on top tracks:', err.response?.status, err.response?.data);
      return { data: { items: [] } };
    }); // Fallback if no top tracks

    const topTracks = topTracksResponse.data.items ? topTracksResponse.data.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      albumArt: track.album.images[0]?.url || '',
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls?.spotify || '',
      uri: track.uri,
    })) : [];

    // Fetch Featured Playlists
    const playlistsResponse = await axios.get(`${SPOTIFY_API_BASE}/browse/featured-playlists?limit=6`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).catch((err) => {
      if (err.response?.status === 401) {
        const authErr = new Error('Spotify Token Expired');
        authErr.statusCode = 401;
        throw authErr;
      }
      console.error('Spotify API Error on featured playlists:', err.response?.status, err.response?.data);
      return { data: { playlists: { items: [] } } };
    });

    const playlists = playlistsResponse.data.playlists?.items ? playlistsResponse.data.playlists.items.map(pl => ({
      id: pl.id,
      name: pl.name,
      description: pl.description,
      image: pl.images[0]?.url || '',
      spotifyUrl: pl.external_urls?.spotify || '',
    })) : [];

    const trackPool = [
      { id: '1', name: 'Blinding Lights', artist: 'The Weeknd', albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b', uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b' },
      { id: '2', name: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9', uri: 'spotify:track:463CkQjx2Zk1yXoBuierM9' },
      { id: '3', name: 'As It Was', artist: 'Harry Styles', albumArt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: 'https://open.spotify.com/track/4LRPsHqHa3zxWp862iO123', uri: 'spotify:track:4LRPsHqHa3zxWp862iO123' },
      { id: '4', name: 'Good Days', artist: 'SZA', albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: 'https://open.spotify.com/track/3YJJjQPAbDT7mGpX3WtQ9A', uri: 'spotify:track:3YJJjQPAbDT7mGpX3WtQ9A' },
      { id: '5', name: 'Sweater Weather', artist: 'The Neighbourhood', albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: 'https://open.spotify.com/track/2QjOHCTQ1Jl3zawyAHlsU2', uri: 'spotify:track:2QjOHCTQ1Jl3zawyAHlsU2' },
      { id: '6', name: 'Cruel Summer', artist: 'Taylor Swift', albumArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: 'https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr', uri: 'spotify:track:1BxfuPKGuaTgP7aM0Bbdwr' },
      { id: '7', name: 'Watermelon Sugar', artist: 'Harry Styles', albumArt: 'https://images.unsplash.com/photo-1516280440502-6c369fc87740?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: '#', uri: 'spotify:track:123' },
      { id: '8', name: 'Peaches', artist: 'Justin Bieber', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: '#', uri: 'spotify:track:124' },
      { id: '9', name: 'Heat Waves', artist: 'Glass Animals', albumArt: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: '#', uri: 'spotify:track:125' },
      { id: '10', name: 'Sunflower', artist: 'Post Malone', albumArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: '#', uri: 'spotify:track:126' },
      { id: '11', name: 'Starboy', artist: 'The Weeknd', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: '#', uri: 'spotify:track:127' },
      { id: '12', name: 'Say So', artist: 'Doja Cat', albumArt: 'https://images.unsplash.com/photo-1483032469466-b937c425697b?auto=format&fit=crop&q=80&w=300&h=300', previewUrl: null, spotifyUrl: '#', uri: 'spotify:track:128' }
    ];

    const playlistPool = [
      { id: 'p1', name: 'Today\'s Top Hits', description: 'Harry Styles is on top of the Hottest 50!', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' },
      { id: 'p2', name: 'RapCaviar', description: 'New music from Drake, Travis Scott, and more.', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' },
      { id: 'p3', name: 'Chill Vibes', description: 'Just relax and unwind.', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' },
      { id: 'p4', name: 'Lofi Beats', description: 'Beats to relax, study, and focus.', image: 'https://images.unsplash.com/photo-1516280440502-6c369fc87740?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' },
      { id: 'p5', name: 'All Out 2010s', description: 'The biggest songs of the 2010s.', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' },
      { id: 'p6', name: 'Rock Classics', description: 'Rock legends & epic songs.', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' },
      { id: 'p7', name: 'Peaceful Piano', description: 'Beautiful piano pieces.', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' },
      { id: 'p8', name: 'Workout', description: 'Pop and hip-hop to keep you moving.', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300', spotifyUrl: '#' }
    ];

    // Helper to get random elements from array
    const getRandomItems = (arr, n) => {
      let shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    let finalTracks = topTracks.length > 0 ? topTracks : getRandomItems(trackPool, 5);
    let finalPlaylists = playlists.length > 0 ? playlists : getRandomItems(playlistPool, 5);

    res.json({
      topTracks: finalTracks,
      playlists: finalPlaylists
    });
  } catch (error) {
    console.error('Home Dashboard Error:', error.response?.data || error.message);
    next(error);
  }
});

module.exports = router;
