// Dynamically set API_BASE based on where the app is running
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:3000/api' 
    : 'https://spotify-vibe-mvp-production.up.railway.app/api';

// DOM Elements
const loginView = document.getElementById('login-view');
const vibeView = document.getElementById('vibe-view');
const resultsView = document.getElementById('results-view');
const homeView = document.getElementById('home-view');
const appContent = document.getElementById('app-content');

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('nav-logout-btn');
const vibeInput = document.getElementById('vibe-input');
const submitVibeBtn = document.getElementById('submit-vibe-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const savePlaylistBtn = document.getElementById('save-playlist-btn');
const tracksGrid = document.getElementById('tracks-grid');
const trackCardTemplate = document.getElementById('track-card-template');

// Player Elements
const playerArt = document.getElementById('player-art');
const playerInfo = document.getElementById('player-info');
const playerTrack = document.getElementById('player-track');
const playerArtist = document.getElementById('player-artist');
const playerSkeleton = document.getElementById('player-skeleton');
const mainPlayBtn = document.getElementById('main-play-btn');
const mainPlayIcon = document.getElementById('main-play-icon');
const playerSkipPrev = document.getElementById('player-skip-prev');
const playerSkipNext = document.getElementById('player-skip-next');
const timeCurrent = document.getElementById('time-current');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');

// Navigation
const navHomeBtn = document.getElementById('nav-home-btn');
const navSearchBtn = document.getElementById('nav-search-btn');
const navLibraryBtn = document.getElementById('nav-library-btn');
const navProfileBtn = document.getElementById('nav-profile-btn');

// Walkthrough Modal
const walkthroughModal = document.getElementById('walkthrough-modal');
const walkthroughCloseBtn = document.getElementById('walkthrough-close-btn');

// Home Dashboard Elements
const homeTopTracksGrid = document.getElementById('home-top-tracks-grid');
const homePlaylistsGrid = document.getElementById('home-playlists-grid');

// State
let currentToken = null;
let currentTracks = [];
let audio = null;
let currentlyPlayingPreviewUrl = null;

// Initialize
function init() {
    checkAuth();
    
    // Event Listeners
    loginBtn.addEventListener('click', () => {
        window.location.href = `${API_BASE}/auth/login`;
    });
    
    navProfileBtn.addEventListener('click', () => {
        logoutBtn.classList.toggle('hidden');
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('spotify_token');
        sessionStorage.removeItem('spotify_refresh_token');
        sessionStorage.removeItem('walkthrough_seen');
        window.location.href = '/';
    });
    
    walkthroughCloseBtn.addEventListener('click', () => {
        walkthroughModal.classList.remove('opacity-100');
        walkthroughModal.classList.add('opacity-0');
        setTimeout(() => walkthroughModal.classList.replace('flex', 'hidden'), 500);
        sessionStorage.setItem('walkthrough_seen', 'true');
    });
    
    navHomeBtn.addEventListener('click', () => {
        if (currentToken) showView(homeView);
    });
    
    navSearchBtn.addEventListener('click', () => {
        if (currentToken) showView(vibeView);
    });

    submitVibeBtn.addEventListener('click', handleVibeSubmit);
    
    // Allow 'Enter' to submit
    vibeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleVibeSubmit();
    });

    // Preset vibe chips
    document.querySelectorAll('.vibe-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            vibeInput.value = chip.textContent;
            handleVibeSubmit();
        });
    });

    savePlaylistBtn.addEventListener('click', handleSavePlaylist);
    
    mainPlayBtn.addEventListener('click', togglePlay);

    // Player Listeners
    playerSkipPrev.addEventListener('click', playPrevTrack);
    playerSkipNext.addEventListener('click', playNextTrack);
    volumeSlider.addEventListener('input', (e) => {
        if (audio) {
            audio.volume = e.target.value;
        }
    });
}

// Navigation Functions
function goHome() {
    if (currentToken) {
        vibeInput.value = '';
        showView(vibeView);
    }
}

function handleLogout() {
    sessionStorage.removeItem('spotify_token');
    currentToken = null;
    showView(loginView);
}

// Save Track to Library
async function handleSaveToLibrary() {
    if (!currentlyPlayingPreviewUrl || !currentToken) {
        alert("Please generate a vibe and play a track first to save it to your Library.");
        return;
    }
    
    // Find track by previewUrl
    const currentTrack = currentTracks.find(t => t.previewUrl === currentlyPlayingPreviewUrl);
    if (!currentTrack) return;

    try {
        const response = await fetch(`${API_BASE}/playlist/save-track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ 
                trackId: currentTrack.id,
                accessToken: currentToken
            })
        });

        if (response.ok) {
            alert(`Saved "${currentTrack.name}" to your Library!`);
        } else {
            throw new Error('Failed to save track');
        }
    } catch (e) {
        alert(e.message);
    }
}

// Authentication
function checkAuth() {
    // Check if returning from redirect
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const tokenFromUrl = params.get('access_token');
    const refreshFromUrl = params.get('refresh_token');

    if (tokenFromUrl) {
        sessionStorage.setItem('spotify_token', tokenFromUrl);
        if (refreshFromUrl) sessionStorage.setItem('spotify_refresh_token', refreshFromUrl);
        window.location.hash = ''; // Clear hash
    }

    currentToken = sessionStorage.getItem('spotify_token');

    if (currentToken) {
        showView(homeView);
        loadHomeData();
        
        if (!sessionStorage.getItem('walkthrough_seen')) {
            setTimeout(() => {
                walkthroughModal.classList.remove('hidden');
                walkthroughModal.classList.add('flex');
                setTimeout(() => walkthroughModal.classList.remove('opacity-0'), 10);
                setTimeout(() => walkthroughModal.classList.add('opacity-100'), 10);
            }, 500);
        }
    } else {
        showView(loginView);
    }
}

async function refreshSpotifyToken() {
    const refreshToken = sessionStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('spotify_token', data.access_token);
            currentToken = data.access_token;
            return true;
        }
    } catch (e) {
        console.error('Failed to refresh token', e);
    }
    return false;
}

// View Management
function showView(viewElement) {
    loginView.classList.add('hidden');
    vibeView.classList.add('hidden');
    resultsView.classList.add('hidden');
    homeView.classList.add('hidden');
    
    viewElement.classList.remove('hidden');
    
    // Adjust container alignment based on view
    if (viewElement === loginView) {
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('sidebar').classList.remove('flex');
        document.getElementById('footer-player').classList.add('hidden');
        document.getElementById('footer-player').classList.remove('flex');
        document.getElementById('top-header').classList.add('hidden');
        document.getElementById('top-header').classList.remove('flex');
    } else {
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('sidebar').classList.add('flex');
        document.getElementById('footer-player').classList.remove('hidden');
        document.getElementById('footer-player').classList.add('flex');
        document.getElementById('top-header').classList.remove('hidden');
        document.getElementById('top-header').classList.add('flex');
    }

    if (viewElement === resultsView || viewElement === homeView) {
        appContent.classList.remove('items-center', 'justify-center');
        appContent.classList.add('items-start', 'justify-start');
    } else {
        appContent.classList.add('items-center', 'justify-center');
        appContent.classList.remove('items-start', 'justify-start');
    }
    
    // Update active state on sidebar
    navHomeBtn.classList.remove('bg-surface-container-highest', 'text-white');
    navHomeBtn.classList.add('text-on-surface-variant');
    navSearchBtn.classList.remove('bg-surface-container-highest', 'text-white');
    navSearchBtn.classList.add('text-on-surface-variant');
    
    if (viewElement === homeView) {
        navHomeBtn.classList.add('bg-surface-container-highest', 'text-white');
        navHomeBtn.classList.remove('text-on-surface-variant');
    } else if (viewElement === vibeView || viewElement === resultsView) {
        navSearchBtn.classList.add('bg-surface-container-highest', 'text-white');
        navSearchBtn.classList.remove('text-on-surface-variant');
    }
}

// Load Home Dashboard Data
async function loadHomeData() {
    try {
        const response = await fetch(`${API_BASE}/home`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderHomeDashboard(data.topTracks, data.playlists);
        } else if (response.status === 401) {
            const refreshed = await refreshSpotifyToken();
            if (refreshed) {
                return loadHomeData(); // Retry
            }
            sessionStorage.removeItem('spotify_token');
            checkAuth();
        } else {
            console.error('Failed to load home data', await response.text());
            homeTopTracksGrid.innerHTML = '<p class="text-on-surface-variant text-red-400">Error loading data. Please try again later.</p>';
        }
    } catch (e) {
        console.error('Failed to load home data', e);
        homeTopTracksGrid.innerHTML = '<p class="text-on-surface-variant text-red-400">Error loading data. Please check your connection.</p>';
    }
}

function renderHomeDashboard(topTracks, playlists) {
    homeTopTracksGrid.innerHTML = '';
    homePlaylistsGrid.innerHTML = '';
    
    // Render Top Tracks
    if (topTracks && topTracks.length > 0) {
        topTracks.forEach(track => {
            const card = document.createElement('div');
            card.className = "bg-[#181818] hover:bg-[#282828] p-4 rounded-lg cursor-pointer transition-all duration-300 group";
            card.innerHTML = `
                <div class="relative mb-4 aspect-square shadow-lg rounded-md overflow-hidden">
                    <img class="w-full h-full object-cover" src="${track.albumArt}" alt="Album Art">
                </div>
                <h3 class="text-white font-bold truncate mb-1 text-base">${track.name}</h3>
                <p class="text-on-surface-variant text-sm truncate font-medium">${track.artist}</p>
            `;
            card.addEventListener('click', () => {
                window.open(track.spotifyUrl, '_blank');
            });
            homeTopTracksGrid.appendChild(card);
        });
    } else {
        homeTopTracksGrid.innerHTML = '<p class="text-on-surface-variant">No top tracks found.</p>';
    }
    
    // Render Featured Playlists
    if (playlists && playlists.length > 0) {
        playlists.forEach(pl => {
            const card = document.createElement('div');
            card.className = "bg-[#181818] hover:bg-[#282828] p-4 rounded-lg cursor-pointer transition-all duration-300 group";
            card.innerHTML = `
                <div class="relative mb-4 aspect-square shadow-lg rounded-md overflow-hidden">
                    <img class="w-full h-full object-cover" src="${pl.image}" alt="Playlist Cover">
                </div>
                <h3 class="text-white font-bold truncate mb-1 text-base">${pl.name}</h3>
                <p class="text-on-surface-variant text-sm line-clamp-2 mt-1">${pl.description}</p>
            `;
            card.addEventListener('click', () => {
                window.open(pl.spotifyUrl, '_blank');
            });
            homePlaylistsGrid.appendChild(card);
        });
    } else {
        homePlaylistsGrid.innerHTML = '<p class="text-on-surface-variant">No featured playlists found.</p>';
    }
}

// Handle Vibe Submission
async function handleVibeSubmit() {
    const prompt = vibeInput.value.trim();
    if (!prompt) return;

    // Loading State
    btnText.textContent = 'Generating...';
    btnSpinner.classList.remove('hidden');
    submitVibeBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/vibe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ prompt: prompt, accessToken: currentToken })
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired
                sessionStorage.removeItem('spotify_token');
                checkAuth();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error('Failed to generate vibe.');
        }

        const data = await response.json();
        currentTracks = data.tracks;
        
        renderResults(currentTracks, data.intent);
        
    } catch (error) {
        console.error(error);
        alert(error.message || 'Something went wrong. Please try again.');
    } finally {
        btnText.textContent = 'Find My Vibe';
        btnSpinner.classList.add('hidden');
        submitVibeBtn.disabled = false;
    }
}

// Render Tracks Grid
function renderResults(tracks, intent = null) {
    tracksGrid.innerHTML = ''; // Clear existing
    
    const messageEl = document.getElementById('results-message');
    if (messageEl && intent && intent.personalized_message) {
        messageEl.textContent = `"${intent.personalized_message}"`;
    } else if (messageEl) {
        messageEl.textContent = "";
    }
    
    tracks.forEach(track => {
        const clone = trackCardTemplate.content.cloneNode(true);
        const card = clone.querySelector('.music-card');
        
        clone.querySelector('.track-img').src = track.albumArt;
        clone.querySelector('.track-img').alt = track.name;
        clone.querySelector('.track-title').textContent = track.name;
        clone.querySelector('.track-artist').textContent = track.artist;
        
        const playBtn = clone.querySelector('.play-button');
        const playIcon = clone.querySelector('.play-icon');
        
        if (!track.previewUrl) {
            // No preview available, dim the button
            playBtn.classList.add('opacity-50', 'cursor-not-allowed');
            playBtn.title = "No preview available";
        } else {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playTrack(track, playIcon);
            });
        }
        
        // Open Spotify link on card click
        card.addEventListener('click', () => {
            window.open(track.spotifyUrl, '_blank');
        });

        // Save to Library via Heart Icon
        const saveBtn = clone.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    const response = await fetch(`${API_BASE}/playlist/save-track`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({ trackId: track.id, accessToken: currentToken })
                    });
                    if (response.ok) {
                        saveBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
                        saveBtn.classList.add('text-primary');
                    } else {
                        throw new Error('Failed to save');
                    }
                } catch (e) {
                    console.error('Save error:', e);
                    if (e.message && e.message.includes('403')) {
                        alert('Spotify Error (403): You must log out and log back in to apply your developer permissions. Also ensure your email is on the app allowlist.');
                    } else {
                        alert('Could not save track to library.');
                    }
                }
            });
        }
        
        tracksGrid.appendChild(clone);
    });
    
    showView(resultsView);
}

// Save Playlist
async function handleSavePlaylist() {
    if (currentTracks.length === 0) return;
    
    savePlaylistBtn.textContent = 'Saving...';
    savePlaylistBtn.disabled = true;

    const uris = currentTracks.map(t => t.uri);
    const vibeName = vibeInput.value.trim() || 'My Vibe';

    try {
        const response = await fetch(`${API_BASE}/playlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ 
                playlistName: `Spotify Vibe: ${vibeName}`,
                trackURIs: uris,
                accessToken: currentToken
            })
        });

        if (!response.ok) {
            if (response.status === 403) {
                alert('Spotify Error (403): You must log out and log back in to apply your developer permissions. Also ensure your email is on the app allowlist.');
            } else {
                alert('Failed to save playlist');
            }
            return;
        }
        
        const data = await response.json();
        
        savePlaylistBtn.textContent = 'Saved!';
        savePlaylistBtn.classList.add('bg-primary-container', 'text-black', 'border-primary-container');
        
        // Open playlist in new tab
        setTimeout(() => {
            if (!data.mocked && data.playlistUrl) {
                window.open(data.playlistUrl, '_blank');
            }
            savePlaylistBtn.textContent = 'Save as Playlist';
            savePlaylistBtn.classList.remove('bg-primary-container', 'text-black', 'border-primary-container');
            savePlaylistBtn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error(error);
        alert('Failed to save playlist');
        savePlaylistBtn.textContent = 'Save as Playlist';
        savePlaylistBtn.disabled = false;
    }
}

// Audio Player
function playTrack(track, iconElement) {
    if (audio && currentlyPlayingPreviewUrl === track.previewUrl) {
        // Toggle current track
        togglePlay();
        return;
    }

    if (audio) {
        audio.pause();
        resetAllPlayIcons();
    }

    audio = new Audio(track.previewUrl);
    // Apply current volume
    audio.volume = volumeSlider.value;
    
    currentlyPlayingPreviewUrl = track.previewUrl;
    
    audio.play();
    
    // Update UI
    if (iconElement) iconElement.textContent = 'pause';
    
    // Update Footer Player
    playerSkeleton.classList.add('hidden');
    playerArt.classList.remove('hidden');
    playerInfo.classList.remove('hidden');
    
    playerArt.src = track.albumArt;
    playerTrack.textContent = track.name;
    playerTrack.href = track.spotifyUrl;
    playerArtist.textContent = track.artist;
    
    mainPlayIcon.textContent = 'pause';
    mainPlayBtn.disabled = false;

    // Progress Bar Animation
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent || 0}%`;
        
        // Format time
        const secs = Math.floor(audio.currentTime);
        timeCurrent.textContent = `0:${secs < 10 ? '0' : ''}${secs}`;
    });

    audio.addEventListener('ended', () => {
        if (iconElement) iconElement.textContent = 'play_arrow';
        mainPlayIcon.textContent = 'play_arrow';
        progressBar.style.width = '0%';
        timeCurrent.textContent = '0:00';
    });
}

function togglePlay() {
    if (!audio) return;
    
    if (audio.paused) {
        audio.play();
        mainPlayIcon.textContent = 'pause';
    } else {
        audio.pause();
        mainPlayIcon.textContent = 'play_arrow';
    }
}

function resetAllPlayIcons() {
    document.querySelectorAll('.play-icon').forEach(icon => {
        icon.textContent = 'play_arrow';
    });
}

function playNextTrack() {
    if (!currentlyPlayingPreviewUrl || currentTracks.length === 0) return;
    const currentIndex = currentTracks.findIndex(t => t.previewUrl === currentlyPlayingPreviewUrl);
    
    let nextIndex = currentIndex + 1;
    // Loop back to start or skip tracks without previews
    while (nextIndex < currentTracks.length && !currentTracks[nextIndex].previewUrl) {
        nextIndex++;
    }
    
    if (nextIndex < currentTracks.length) {
        playTrack(currentTracks[nextIndex], null);
    } else {
        // Find first track with preview
        const firstTrack = currentTracks.find(t => t.previewUrl);
        if (firstTrack) playTrack(firstTrack, null);
    }
}

function playPrevTrack() {
    if (!currentlyPlayingPreviewUrl || currentTracks.length === 0) return;
    const currentIndex = currentTracks.findIndex(t => t.previewUrl === currentlyPlayingPreviewUrl);
    
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0 && !currentTracks[prevIndex].previewUrl) {
        prevIndex--;
    }
    
    if (prevIndex >= 0) {
        playTrack(currentTracks[prevIndex], null);
    } else {
        // Play last track with preview
        const reversedTracks = [...currentTracks].reverse();
        const lastTrack = reversedTracks.find(t => t.previewUrl);
        if (lastTrack) playTrack(lastTrack, null);
    }
}

// Boot
document.addEventListener('DOMContentLoaded', init);
