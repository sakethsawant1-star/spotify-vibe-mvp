# Architecture: Vibe Prompt
## AI-Native Music Discovery MVP

---

## 1. Product Overview

**What it does:**
Vibe Prompt allows users to type a natural language description of their current mood, activity, or moment. The AI interprets this intent and returns a curated Spotify playlist matching that exact vibe — without requiring the user to select from pre-defined categories.

**Example input:** "focused but restless, like coding at midnight when the deadline is tomorrow"
**Expected output:** A 10-track Spotify playlist matching that semantic context

---

## 2. Tech Stack

| Layer | Tool | Purpose | Cost |
|-------|------|---------|------|
| Frontend | HTML, CSS, Vanilla JavaScript | Single page user interface | Free |
| Backend | Node.js + Express | API routing, server-side logic | Free |
| LLM | Groq API (llama-3.3-70b-versatile) | Natural language intent extraction | Free tier |
| Music API | Spotify Web API | Song search, playlist creation | Free |
| Frontend Deployment | Vercel | Static frontend hosting | Free |
| Backend Deployment | Railway | Node.js backend hosting | Free tier |
| Auth | Spotify OAuth 2.0 | User authentication and API access | Free |

---

## 3. System Architecture

```
USER
  │
  │ Types vibe prompt
  ▼
FRONTEND (Vercel)
  │ HTML/CSS/JS — Single Page App
  │ Sends prompt to backend via POST /api/vibe
  ▼
BACKEND (Railway — Node.js/Express)
  │
  ├──► GROQ API (llama-3.3-70b-versatile)
  │      │ System prompt: Extract intent from vibe description
  │      │ Returns structured JSON:
  │      │ {
  │      │   mood: string,
  │      │   energy: 0.0–1.0,
  │      │   genres: [string],
  │      │   tempo: slow/medium/fast,
  │      │   search_keywords: [string]
  │      │ }
  │      ▼
  ├──► SPOTIFY WEB API
  │      │ Uses extracted parameters to:
  │      │ 1. Search tracks by keywords + genre
  │      │ 2. Filter by audio features (energy, valence, tempo)
  │      │ 3. Return top 10 matching tracks
  │      ▼
  └──► RESPONSE to Frontend
         │ Returns: track list with name, artist, album art,
         │ preview URL, Spotify URI
         ▼
FRONTEND
  │ Renders 10 song cards
  │ User previews 30-second clips
  │ User clicks "Save as Playlist"
  ▼
SPOTIFY (User's Account)
  Creates playlist named after vibe prompt
  Adds all 10 tracks
  Opens in Spotify app
```

---

## 4. Component Breakdown

### 4.1 Frontend (Vercel)

**Files:**
- `index.html` — Main page structure
- `style.css` — Dark theme, Spotify-inspired UI
- `app.js` — Handles user input, API calls to backend, renders results

**Key UI Elements:**
- Spotify OAuth login button
- Vibe prompt input field with placeholder text
- "Find My Vibe" submit button
- Loading state animation
- Song card grid (10 cards)
- 30-second preview player per card
- "Save as Spotify Playlist" CTA button

**Environment Variables (Vercel):**
```
BACKEND_URL=https://your-railway-app.railway.app
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_REDIRECT_URI=https://your-vercel-app.vercel.app/callback
```

---

### 4.2 Backend (Railway — Node.js/Express)

**Files:**
- `server.js` — Express app entry point
- `routes/vibe.js` — POST /api/vibe endpoint
- `routes/auth.js` — Spotify OAuth token exchange
- `services/groq.js` — Groq API integration
- `services/spotify.js` — Spotify Web API integration
- `package.json` — Dependencies

**Dependencies:**
```json
{
  "express": "^4.18.2",
  "axios": "^1.6.0",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5"
}
```

**Environment Variables (Railway):**
```
GROQ_API_KEY=your_groq_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-vercel-app.vercel.app/callback
PORT=3000
```

---

### 4.3 Groq Intent Extraction

**Model:** llama-3.3-70b-versatile

**System Prompt:**
```
You are a music curator AI. Your job is to extract structured listening intent from a user's natural language vibe description.

Extract the following and return ONLY valid JSON. No explanation. No markdown. No preamble:
{
  "mood": "string — one word (eg: melancholic, euphoric, focused, restless, calm)",
  "energy": "number between 0.0 and 1.0 (0.0 = very low energy, 1.0 = very high energy)",
  "valence": "number between 0.0 and 1.0 (0.0 = negative/dark, 1.0 = positive/bright)",
  "genres": ["array of 2-3 valid Spotify genre strings"],
  "tempo": "string — one of: slow, medium, fast",
  "search_keywords": ["array of 3 keyword strings optimized for Spotify track search"]
}

Rules:
- If the prompt is too vague, default energy to 0.5, valence to 0.5, mood to neutral
- Always return valid JSON
- Never return plain text
- Genres must be valid Spotify genre seeds
```

**Failure Handling:**
- If Groq returns invalid JSON → retry once with stricter prompt
- If retry fails → return default parameters (energy: 0.5, valence: 0.5, genre: pop)
- Never expose raw Groq errors to the frontend

---

### 4.4 Spotify Web API Integration

**OAuth Scopes Required:**
- `playlist-modify-public`
- `playlist-modify-private`
- `user-read-private`
- `user-read-email`

**API Calls Used:**
1. `GET /v1/recommendations` — Fetch recommended tracks using seed genres + audio features
2. `GET /v1/search` — Search tracks by keywords
3. `POST /v1/users/{user_id}/playlists` — Create new playlist
4. `POST /v1/playlists/{playlist_id}/tracks` — Add tracks to playlist

**Audio Feature Filters Applied:**
```
target_energy: groq_output.energy
target_valence: groq_output.valence
min_energy: groq_output.energy - 0.2
max_energy: groq_output.energy + 0.2
seed_genres: groq_output.genres (max 2)
seed_keywords: groq_output.search_keywords[0]
limit: 10
```

---

## 5. Data Flow — Step by Step

```
Step 1: User visits Vercel app → clicks "Login with Spotify"
Step 2: Redirected to Spotify OAuth → grants permissions
Step 3: Spotify redirects back with auth code
Step 4: Backend exchanges auth code for access token + refresh token
Step 5: Access token stored in frontend session (not localStorage)
Step 6: User types vibe prompt → clicks "Find My Vibe"
Step 7: Frontend sends POST /api/vibe with {prompt, accessToken}
Step 8: Backend sends prompt to Groq → receives structured JSON
Step 9: Backend calls Spotify Recommendations API with Groq parameters
Step 10: Backend returns 10 tracks to frontend
Step 11: Frontend renders song cards with album art, preview player
Step 12: User clicks "Save as Playlist"
Step 13: Backend calls Spotify API to create playlist + add tracks
Step 14: Frontend displays confirmation + link to open playlist in Spotify
```

---

## 6. Security Rules

- All API keys stored as environment variables only. Never in frontend code.
- Spotify access tokens passed in request headers, never in URLs
- CORS configured to allow only the Vercel frontend domain
- No user data stored anywhere — stateless architecture
- Spotify Client Secret only lives on Railway backend, never exposed to browser

---

## 7. Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Groq free tier rate limits | Concurrent users may face latency | Queue requests, show loading state |
| Spotify API requires login | Adds friction for first-time users | Streamline OAuth to single click |
| 30-second previews only | Not all tracks have preview URLs | Filter out tracks without previews |
| Cold start on Railway free tier | First request may be slow (up to 30s) | Show loading animation, keep service warm |
| No history/session persistence | User cannot return to previous vibes | Acceptable for MVP scope |

---

## 8. Deployment Checklist

### Vercel (Frontend)
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Update Spotify Redirect URI to Vercel URL
- [ ] Verify OAuth callback route works
- [ ] Test end-to-end flow on deployed URL

### Railway (Backend)
- [ ] Connect GitHub repo to Railway
- [ ] Set all environment variables in Railway dashboard
- [ ] Verify PORT environment variable is set
- [ ] Test /api/vibe endpoint returns valid response
- [ ] Test /api/auth endpoint completes token exchange

### Spotify Developer Dashboard
- [ ] Add Vercel URL to Redirect URIs
- [ ] Add Railway URL to allowed origins (if needed)
- [ ] Verify app is in Development Mode (sufficient for evaluation)
