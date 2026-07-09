# AI & Architectural Decisions Log — Vibe Prompt MVP

This document tracks key engineering, product, and design decisions made during the Vibe Prompt MVP build. Follows the same ADR pattern used in the [graduation project](file:///c:/Project/graduation%20project/Docs/decisions.md) and [M3 Groww project](file:///c:/Project/M3%20Groww%20review%20agent%20and%20MCP/Docs/decision.md).

---

## Decision 1: Vanilla HTML/CSS/JS Over Vite/React for Frontend

* **Date:** 2026-07-04
* **Context:** The frontend needs to be deployed as static files on Vercel. The scope is a single-page application with 5 UI states.
* **Decision:** Use vanilla HTML, CSS, and JavaScript — no framework, no build tooling.
* **Rationale:**
  * Zero build step reduces deployment complexity and debugging surface.
  * A single-page MVP with 5 states does not justify React/Vite overhead.
  * Consistent with the graduation project (Part 1 dashboard) and M3 Groww dashboard — both use vanilla frontend stacks.
  * Eliminates `VITE_` environment variable prefix confusion — frontend config is a simple JS constant.

## Decision 2: Groq (llama-3.3-70b-versatile) for Intent Extraction

* **Date:** 2026-07-04
* **Context:** The MVP needs an LLM to convert natural language vibe descriptions into structured JSON parameters for Spotify's API.
* **Decision:** Use **Groq API** with the `llama-3.3-70b-versatile` model.
* **Rationale:**
  * Strict zero-budget constraint — Groq's Developer Plan is extremely generous (1K requests/minute, 300K tokens/minute).
  * Extremely fast inference (~200ms) — critical for user-facing real-time interactions.
  * Consistent with the graduation project (Review Engine) and M3 Groww (Review Analyst) — both use Groq.
  * The intent extraction task is simple enough for a single LLM call (unlike the Review Engine's batch analysis).

## Decision 3: Node.js + Express Over Python/FastAPI for Backend

* **Date:** 2026-07-04
* **Context:** The graduation project (Part 1) uses Python + FastAPI. The MVP (Part 4) needs a backend for OAuth, API routing, and Spotify integration.
* **Decision:** Use **Node.js + Express** for the MVP backend.
* **Rationale:**
  * Spotify's OAuth and Web API documentation and SDKs have stronger Node.js ecosystem support.
  * The MVP's backend logic is lightweight routing — Express is ideal for this.
  * Railway supports Node.js with zero-config deployment.
  * Python/FastAPI would have been equally valid — this decision is about ecosystem fit, not capability.

## Decision 4: sessionStorage Over localStorage for Access Tokens

* **Date:** 2026-07-04
* **Context:** The Spotify access token needs to be stored client-side for API calls.
* **Decision:** Store the access token in `sessionStorage`, not `localStorage`.
* **Rationale:**
  * `sessionStorage` is cleared when the browser tab is closed — reducing the window of token exposure.
  * The MVP is stateless — no session persistence is needed (listed as an acceptable limitation in the architecture doc).
  * `localStorage` would persist tokens across browser restarts, creating unnecessary security risk for a demo MVP.

## Decision 5: Separated Playlist Route Over Combined Vibe Route

* **Date:** 2026-07-04
* **Context:** Playlist creation could be handled as part of the `/api/vibe` endpoint or as a separate `/api/playlist` endpoint.
* **Decision:** Create a separate `POST /api/playlist` route.
* **Rationale:**
  * Separation of concerns — vibe processing and playlist creation are distinct user actions.
  * The user may want to preview tracks without saving a playlist.
  * Easier to debug and test independently.
  * Follows the route-per-feature pattern used in the graduation project's FastAPI backend.

## Decision 6: Spotify Recommendations API Over Search API

* **Date:** 2026-07-04
* **Context:** There are two approaches to finding matching tracks: (1) Spotify Search API with keyword queries, or (2) Spotify Recommendations API with audio feature parameters.
* **Decision:** Primary strategy uses the **Recommendations API** with seed genres + audio feature targets. Search API is a fallback.
* **Rationale:**
  * Recommendations API accepts `target_energy`, `target_valence`, `seed_genres` — directly maps to Groq's structured output.
  * Search API would require crafting keyword queries and offers no audio feature filtering.
  * Recommendations API produces more musically coherent results for vibe-based queries.

## Decision 7: Safe Defaults Over Error Screens for Groq Failures

* **Date:** 2026-07-04
* **Context:** Groq may return invalid JSON, timeout, or hit rate limits. The MVP must handle these gracefully.
* **Decision:** Implement a 3-tier fallback: (1) parse Groq response, (2) retry once with stricter prompt, (3) return safe defaults `{energy: 0.5, valence: 0.5, genres: ["pop"]}`.
* **Rationale:**
  * A demo MVP must never show a blank error screen to an evaluator.
  * Safe defaults produce generic but valid Spotify results — better than no results.
  * Consistent with the M3 Groww project's approach of exponential backoff + graceful fallback.

## Decision 8: No Database — Stateless Architecture

* **Date:** 2026-07-04
* **Context:** The graduation project (Part 1) uses SQLite for review storage. Should the MVP also persist data?
* **Decision:** The MVP is fully **stateless** — no database, no user history, no session persistence.
* **Rationale:**
  * The MVP's job is to demonstrate the AI intent layer concept, not build a production data platform.
  * Adding a database increases deployment complexity and cost without adding demo value.
  * User vibe history is an intentional scope cut documented in the architecture's "Known Limitations" table.
  * This keeps the Railway deployment simple (no volume mounts, no migration scripts).

## Decision 9: Centralized Error Handler Middleware

* **Date:** 2026-07-04
* **Context:** Express routes can throw errors from Groq, Spotify, or internal logic. Error handling needs consistency.
* **Decision:** Create a single `middleware/errorHandler.js` that catches all errors and returns structured JSON.
* **Rationale:**
  * Prevents raw stack traces from leaking to the frontend.
  * Provides consistent error response shape: `{error: string, code: number}`.
  * Follows Express best practices for production error handling.

## Decision 10: Test Scripts Per Phase (TDD-Aligned)

* **Date:** 2026-07-04
* **Context:** The M3 Groww project uses `eval_phaseX.py` scripts as gate checks before proceeding to the next phase.
* **Decision:** Create `tests/` directory with `test_groq.js`, `test_spotify.js`, and `test_e2e.js`.
* **Rationale:**
  * Phase 3 (Groq) must produce valid JSON before Phase 4 (Spotify) can use it.
  * Phase 7 (E2E) validates the full deployed flow.
  * Provides objective go/no-go gates — consistent with the TDD pattern established in the M3 Groww project.
