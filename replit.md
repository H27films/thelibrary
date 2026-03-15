# The Library

A personal collection tracker PWA for movies/TV, books, and people.

## Architecture

- **Frontend:** React + TypeScript + Vite (mobile-first, iPhone-optimized)
- **Styling:** Tailwind CSS — cream background (#F5F2EE), charcoal text (#1A1A1A), burgundy accent (#8B2635)
- **Fonts:** Playfair Display (serif, headings) + Inter (sans-serif, body)
- **Storage:** localStorage (no database required)
- **APIs:** TMDB (films, TV, people) + Google Books API (books)
- **Backend:** Express server (minimal, no DB routes needed by frontend)

## Structure

```
client/src/
  App.tsx              — Bottom tab navigation (Films & TV, Books, People)
  pages/
    movies.tsx         — Films & TV tab with TMDB search
    books.tsx          — Books tab with Google Books search
    people.tsx         — People tab with TMDB people search
  components/
    detail-view.tsx    — Full-screen detail overlay with delete
  hooks/
    use-library.ts     — localStorage hooks (useMovies, useBooks, usePeople)
  lib/
    tmdb.ts            — TMDB API helpers
    google-books.ts    — Google Books API helper
client/public/
  manifest.json        — PWA manifest
  sw.js                — Service worker for offline support
```

## PWA
- manifest.json with icons for "any" and "maskable" purposes
- Service worker for basic offline caching
- Apple PWA meta tags in index.html (apple-mobile-web-app-capable, status-bar-style, title)

## Design
- Editorial, magazine aesthetic (Kinfolk meets Criterion Collection)
- Sharp corners (no border-radius)
- Hairline borders (border-black/5 to border-black/8)
- Playfair Display for all headings and item titles
- Burgundy (#8B2635) used sparingly as accent on labels, add buttons, active tab indicator
