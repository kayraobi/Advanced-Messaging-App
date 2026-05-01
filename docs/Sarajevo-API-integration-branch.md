# Sarajevo API integration (`feat/api-place-types-realestate-qaas`)

This document summarizes **what changed** and **what was added** on branch `feat/api-place-types-realestate-qaas`, covering the two feature commits that wire the mobile app (and optional local backend stubs) to the Sarajevo Expats-style HTTP API.

**Remote reference:** `https://test.sarajevoexpats.com/api` (see Swagger UI under `/api/api-docs`).

---

## Commit 1 — `feat: wire Place Types, Real Estate, and Q&A Swagger endpoints`

### Added

| Item | Purpose |
|------|---------|
| `src/utils/apiUnwrap.ts` | Shared helpers to normalize API envelopes (`{ data }`, nested `data`, `user`, or raw arrays) for list and single-entity responses. |

### Changed

| Area | Change |
|------|--------|
| **`src/services/placeTypesService.ts`** | `getWithPlaces()` → `GET /api/placeTypes/with-places`; `getById(id)` → `GET /api/placeTypes/{id}`; list responses use unwrap helpers. |
| **`src/services/realEstateService.ts`** | Lists use `unwrapApiList`; `getById` uses `unwrapApiEntity`; explicit `getByUserId(userId)` → `GET /api/realEstate/user/{userId}`. |
| **`src/services/qaasService.ts`** | `getAll` / `getById` aligned with unwrap helpers for `GET /api/qaas` and `GET /api/qaas/{id}`. |
| **`src/screens/ExploreScreen.tsx`** | Places: prefer grouped payload from `with-places`, flatten places per type, baseline cache for “All”; type chips call `placeTypes/{id}` when filtering. Real estate: separate loads for **all**, **featured**, and **by-type** chips. |
| **`src/screens/ProfileScreen.tsx`** | “My listings” modal loads `realEstate/user/{userId}`; tap navigates to existing real-estate detail flow. |
| **`src/screens/QaasScreen.tsx`** | FAQ list still from `GET /api/qaas`; expanding a row triggers `GET /api/qaas/{id}` to merge fresher detail (with loading guard against overlapping requests). |
| **`App.tsx`** | Passes `onRealEstatePress` into `ProfileScreen` so listings open `realEstateDetail`. |

---

## Commit 2 — `feat: complete Sarajevo API client updates and local backend stubs`

### Added

| Item | Purpose |
|------|---------|
| `.env.example` | Documents `EXPO_PUBLIC_API_URL` and related env vars for pointing the app at the test API (without committing secrets). |
| `assets/*` | Default Expo icons / splash assets tracked for reproducible builds. |
| `src/screens/NewsDetailScreen.tsx` | Detail screen driven by news API `getById`. |
| `src/utils/eventPresentation.ts` | Shared helpers for event titles, dates, location strings for UI consistency. |
| `src/utils/mapCoordinates.ts` | Parsing/normalizing coordinates for map-related UI. |
| `src/components/EventMapView.tsx` | Map wrapper for event location (depends on `react-native-maps` where installed). |
| **`backend/src/db/mongodb.ts`** | Lightweight MongoDB connection scaffold for a dev/backend companion server. |
| **`backend/src/data/*Seed.ts`** | Seed payloads for places, place types, real estate, services, service types, trips. |
| **`backend/src/routes/*.ts`** | Stub REST routes mirroring domain resources (`places`, `placeTypes`, `realEstate`, `services`, `serviceTypes`, `trips`) for local testing. |

### Changed

| Area | Change |
|------|--------|
| **`src/services/api.ts`** | Small adjustments consistent with unified API base URL / client behavior. |
| **`src/services/authService.ts`** | Aligns with `GET /api/users/me`, login/session refresh, profile PATCH and interests sync where applicable. |
| **`src/services/eventService.ts`** | Event fetch/normalization (detail payloads, RSVP-related flows as implemented). |
| **`src/services/newsService.ts`** | News listing/detail aligned with backend envelopes and unwrap patterns where used. |
| **`src/types/event.types.ts`**, **`src/types/user.types.ts`** | Types updated for API payloads (events, user/me fields). |
| **`src/data/news.ts`** | Local/mock or bundled news data adjusted to complement API-backed reads. |
| **`src/screens/EventDetailScreen.tsx`** | Detail UX tied to normalized event API payloads. |
| **`src/screens/HomeScreen.tsx`** | Home feed wiring aligned with events/news/services usage. |
| **`src/screens/MyEventsScreen.tsx`** | User events listing aligned with API. |
| **`src/screens/index.ts`** | Lazy export registration for new screens (e.g. news detail). |

---

## How to run against the real API

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL=https://test.sarajevoexpats.com` (or your deployment base URL **without** trailing slash inconsistencies noted in your axios setup).
2. Ensure authenticated endpoints receive the Bearer token from login wherever required (`with-places` and similar routes may return 401 without auth).

---

## Related Swagger sections

- Place Types (`with-places`, `{id}`)
- Real Estate (list, featured, `by-type/{type}`, `{id}`, `user/{userId}`)
- Q&A (`/qaas`, `/qaas/{id}`)

*(Exact operation IDs appear under Swagger UI at `/api/api-docs`.)*
