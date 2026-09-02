# Cinevo 🎬 — Public-First Streaming Web Application

A modern, high-performance streaming web application built with **Next.js 15**, **Express.js**, **TypeScript**, **Prisma**, and **Tailwind CSS**.

Cinevo is architected around a **public-first philosophy**:
- **Zero Friction**: Anyone can browse the catalog, search for movies and TV series, view details, and immediately stream authorized video sources without logging in.
- **Optional Authentication**: Accounts are optional and enhance the experience with cross-device Watchlist, synced Watch History, and personalized settings.
- **Seamless Local-to-Cloud Sync**: When a guest user watches video or saves titles, progress is stored locally in `localStorage`. Once they sign in or register, their bookmarks and playback resume points are automatically synchronized with the backend database.

---

## High-Level Architecture

```
                                  ┌──────────────────────────┐
                                  │      TMDB API / Mock     │
                                  └─────────────┬────────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND (Next.js 15)                                  │
│                                                                                        │
│  [Navbar: Glassmorphic]                                                                │
│  ├── / (Home: Hero Backdrop, Trending Rows, Top Rated, Genre Rows)                    │
│  ├── /movies (Filtered Movie Catalog & Categories)                                     │
│  ├── /series (TV Shows, Seasons & Episode Selector)                                    │
│  ├── /search (Debounced Multi-Search with Filters)                                     │
│  ├── /movie/[id] & /tv/[id] (Rich Details, Cast, Recommendations)                      │
│  ├── /watch/[type]/[id] (Custom HLS Player: Quality, Subtitles, Progress, Next Ep)     │
│  ├── /my-list & /history (Guest localStorage + Authenticated Cloud Sync)               │
│  └── /login & /register (Seamless optional JWT Auth modal/page)                        │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API Client (TanStack Query)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                BACKEND (Express + TypeScript)                          │
│                                                                                        │
│  PUBLIC ROUTES (No Auth Required)            PROTECTED ROUTES (JWT Middleware)         │
│  ├── GET /api/movies/trending                ├── GET    /api/user/profile              │
│  ├── GET /api/movies/popular                 ├── GET    /api/watchlist                 │
│  ├── GET /api/movies/:id                     ├── POST   /api/watchlist                 │
│  ├── GET /api/tv/popular                     ├── DELETE /api/watchlist/:id             │
│  ├── GET /api/tv/:id                         ├── GET    /api/history                   │
│  ├── GET /api/tv/:id/season/:season          ├── POST   /api/history (batch sync)      │
│  ├── GET /api/search                         └── DELETE /api/history/:id               │
│  ├── GET /api/play/movie/:id                                                           │
│  └── GET /api/play/tv/:id/:season/:episode                                             │
└─────────────────────┬────────────────────────────────────────────────┬─────────────────┘
                      │                                                │
                      ▼                                                ▼
        ┌───────────────────────────┐                    ┌───────────────────────────┐
        │       Cache Layer         │                    │       Database Layer      │
        │  Redis (ioredis)          │                    │  Prisma ORM               │
        │  (Fallback: In-Memory TTL)│                    │  User, Watchlist, History │
        └─────────────┬─────────────┘                    └───────────────────────────┘
                      │
                      ▼
        ┌───────────────────────────┐
        │      Streaming Layer      │
        │   StreamingProvider Spec  │
        │   ├── TestProviderA (HLS) │
        │   └── TestProviderB (Demo)│
        └───────────────────────────┘
```

---

## Features

- 🌟 **Public Access**: Browse, search, and watch instantly without an account.
- 📺 **Custom Cinema Video Player**:
  - Adaptive bitrate HLS streaming powered by `hls.js`.
  - Resolution selector (1080p, 720p, 480p, Auto).
  - Subtitle / Closed Caption switcher.
  - Skip forward/backward 10s keyboard shortcuts (`Space`, `F`, `M`, `Left`, `Right`).
  - Auto-resume previous playback point.
  - "Next Episode" interactive prompt for television series.
- 🔄 **Guest & Account Sync**: Guest progress in `localStorage` seamlessly syncs to the database upon registration or login.
- ⚡ **Pluggable Streaming Architecture**: Modular `StreamingProvider` interface decoupled from TMDB metadata with automated failover handling.
- 🛡️ **Zero-Crash Development Fallbacks**:
  - Prisma configured for SQLite (`file:./dev.db`) for instant zero-configuration local dev, and 100% compatible with PostgreSQL.
  - Cache Service with Redis support and automatic in-memory TTL fallback.
  - TMDB Service with API client and curated offline demo catalog fallback if `TMDB_API_KEY` is not provided.
- 🎨 **Netflix/Prime UI Aesthetics**: Obsidian theme (`#09090b`), glassmorphism navigation, shimmer skeleton loaders, smooth carousels, and responsive layouts.

---

## Quick Start

### 1. Install Dependencies
```bash
# At the root directory:
npm run install:all
```

### 2. Configure Environment (Optional)
The application works out-of-the-box with built-in fallbacks. To connect real TMDB or Redis keys, customize the `.env` files:
- `backend/.env`
- `frontend/.env.local`

### 3. Run Development Servers Concurrently
```bash
npm run dev
```
- Frontend will run at: **http://localhost:3000**
- Backend will run at: **http://localhost:5000**

---

## Testing

Run the automated API test suite covering all 11 public and authentication endpoints:
```bash
cd backend
npm test
```
