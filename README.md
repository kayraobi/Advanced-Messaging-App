<div align="center">

<img src="assets/icon.png" width="100" alt="Sarajevo Expats Logo" />

# Sarajevo Expats

**A mobile-first community platform for expats living in Sarajevo, Bosnia and Herzegovina**

[![Expo](https://img.shields.io/badge/Expo-54.0-black?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black?logo=socket.io)](https://socket.io)
[![Supabase](https://img.shields.io/badge/Supabase-Feedback-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

*CS308 Software Engineering — International University of Sarajevo, Spring 2025–2026*

</div>

---

## Overview

Sarajevo Expats replaces fragmented WhatsApp coordination and manual Excel RSVP tracking with a structured, mobile-first platform. It gives the Sarajevo expat community a single place for daily news, event discovery, RSVP management, real-time chat, explore listings, interactive maps, live weather, an AI assistant, and more.

| Problem | Solution |
|---|---|
| WhatsApp group limits & noise | Structured news feed + dedicated chat rooms |
| Events buried in chat streams | Calendar with filtering, capacity visibility & countdowns |
| Manual RSVP via spreadsheets | In-app RSVP with automatic waitlist handling |
| No central place directory | Explore screen — places, real estate, services & trips |
| No way to give product feedback | In-app feedback form → Supabase |

---

## Features

### Community
- **Daily News Hub** — curated news feed with live search and slide carousel
- **Event Discovery** — browse by date range or category, see capacity, countdowns, and maps
- **RSVP & Waitlist** — one-tap join with automatic waitlist placement when full
- **Real-Time Chat** — global community chat + per-event rooms via Socket.IO
- **Explore** — places, real estate, services, and trips with type-chip filtering
- **Interactive Maps** — Leaflet-powered WebView maps for places and real estate; background geocoding via Nominatim for listings without coordinates

### Personalisation
- **User Profile** — avatar, display name, interests, attended events
- **Notification Centre** — in-app bell with unread badge; push notifications for new events, news, and daily weather briefing
- **Live Weather Widget** — Open-Meteo powered, shown in the app header; full modal with hourly/daily forecast and condition icons
- **AI Assistant** — Groq-powered chat assistant (llama3-8b) with context about Sarajevo expat life, accessible from the home screen

### Games
- **Snake** — classic snake on a 16×14 grid; swipe or D-pad controls; score and personal best
- **Word Game** — Wordle-style 5-letter guessing game; 5 Sarajevo-themed categories (Food, Places, History, Expat Life, Culture); 35 unique words with hints and descriptions; colour-coded keyboard feedback

### Feedback
- **Send Feedback** — category + priority + free-text form; submitted directly to Supabase `feedbacks` table; user name/email auto-attached; success confirmation screen

### Platform
- **Dark & Light theme** — system-aware with manual toggle in Settings
- **Safe area aware** — all headers use `useSafeAreaInsets` for Dynamic Island / notch support
- **Stale-while-revalidate cache** — AsyncStorage TTL cache returns data instantly, refreshes silently in the background
- **JWT auth** — token stored in AsyncStorage, auto-attached via Axios interceptor; socket handshake also authenticated

---

## Tech Stack

### Mobile Client

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81.5 | Core mobile framework |
| Expo | 54.0 | Build toolchain & native modules |
| TypeScript | 5.9 | Type safety across the entire codebase |
| React Navigation | 7.x | Stack + bottom-tab navigation |
| Axios | 1.13 | HTTP client with JWT interceptor |
| Socket.IO Client | 4.8 | Real-time bidirectional chat |
| TanStack Query | 5.0 | Server state management |
| AsyncStorage | 2.2 | Token + TTL cache persistence |
| Expo Notifications | 0.32 | Push + local notification scheduling |
| Expo Image Picker | 17.0 | Photo upload for listings and profile |
| react-native-webview | 13.x | Leaflet map rendering |
| react-native-maps | 1.20 | Native map views |
| @supabase/supabase-js | 2.x | Feedback form database |
| date-fns | 3.6 | Date formatting & calendar logic |

### Backend (local dev / mock)

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Typed route handlers and services |
| Socket.IO | Real-time chat rooms |
| Mongoose + MongoDB | Data models and persistence |
| JWT (`jsonwebtoken`) | Token signing and middleware |
| bcrypt | Password hashing |
| Helmet + CORS | Secure headers and cross-origin policy |
| express-rate-limit | Brute-force protection |

> The `backend/` folder is a local development server. The production backend is maintained separately by the backend team and reached via `EXPO_PUBLIC_API_URL`.

### External APIs

| API | Purpose |
|---|---|
| Open-Meteo | Live weather data for Sarajevo (no key required) |
| Nominatim (OSM) | Geocoding addresses to coordinates for map pins |
| Groq (llama3-8b) | AI assistant responses |
| Supabase | Feedback form storage |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│               Presentation Layer                        │
│        React Native / Expo Mobile Client                │
│   Screens · Components · Navigation · Theme Context     │
└──────────────────┬──────────────────────────────────────┘
                   │  HTTPS + JSON  /  WSS + Socket.IO
┌──────────────────▼──────────────────────────────────────┐
│               Communication Layer                       │
│   Axios (REST) · Socket.IO Client · Supabase JS Client  │
│      JWT interceptor · TTL cache · AsyncStorage         │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│           Backend Application Layer                     │
│   Express API · Middleware · Controllers · Services     │
│              Socket.IO Chat Handler                     │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│               Data Access Layer                         │
│      EventRepository · ChatRepository · Mongoose        │
│         MongoDB Atlas  +  Supabase (feedbacks)          │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern | Where | Purpose |
|---|---|---|
| **Repository** | `backend/src/repositories/` | Decouples data access from business logic |
| **Service Layer** | `src/services/` · `backend/src/services/` | Centralises business rules, keeps controllers thin |
| **Observer / Pub-Sub** | `backend/src/socket/chatHandler.ts` | Socket.IO room broadcast without polling |
| **Singleton-Like Instance** | `src/services/api.ts` | Single Axios instance + single DB/socket connection |
| **Cache-Aside / Stale-While-Revalidate** | `src/services/storageService.ts` | Show cached data instantly, refresh in background |
| **DTO / Type Definitions** | `src/types/` | Typed contracts at every layer boundary |
| **Strategy (RSVP)** | `backend/src/services/eventService.ts` | Direct join vs. waitlist via same `processRsvp()` entry point |

---

## Project Structure

```
Advanced-Messaging-App/
├── src/
│   ├── screens/                    # 25 user-facing screens
│   ├── components/
│   │   ├── AppHeader.tsx           # Weather widget + notification bell
│   │   ├── WeatherModal.tsx        # Full weather forecast modal
│   │   ├── AiAssistantModal.tsx    # Groq-powered AI chat
│   │   ├── GamesModal.tsx          # Game launcher (Snake + Word Game)
│   │   ├── SnakeGame.tsx           # Snake game component
│   │   ├── WordGame.tsx            # Wordle-style word game
│   │   ├── FeedbackModal.tsx       # Feedback form → Supabase
│   │   ├── EventMapView.tsx        # Leaflet map for event locations
│   │   └── …                       # EventCard, NewsCard, BottomNav…
│   ├── services/
│   │   ├── api.ts                  # Axios instance with JWT interceptor
│   │   ├── authService.ts          # Login, register, getMe, updateMe
│   │   ├── eventService.ts         # Event CRUD + RSVP
│   │   ├── chatService.ts          # Chat room operations
│   │   ├── socketService.ts        # Socket.IO with JWT handshake
│   │   ├── geocodeService.ts       # Nominatim address → coordinates
│   │   ├── groqService.ts          # Groq AI API client
│   │   ├── supabaseClient.ts       # Supabase JS client (feedback)
│   │   ├── contentNotificationService.ts  # New content diff & notify
│   │   └── …                       # places, news, realEstate, trips…
│   ├── hooks/
│   │   ├── useWeather.ts           # Open-Meteo weather data
│   │   ├── useNotifications.ts     # Notification state management
│   │   ├── useAiAssistant.ts       # AI chat message handling
│   │   ├── useEvents.ts            # Cached event fetching
│   │   └── …
│   ├── contexts/
│   │   ├── ThemeContext.tsx         # Dark / light theme
│   │   ├── AuthContext.tsx          # Auth state
│   │   └── NotificationContext.tsx  # Push + in-app notifications
│   ├── navigation/                 # AppNavigator, MainTabs, types
│   ├── types/                      # TypeScript interfaces
│   └── utils/                      # mapCoordinates, mapPins, weatherUtils…
├── backend/
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── socket/                 # chatHandler.ts — Socket.IO pub-sub
│       ├── models/                 # Mongoose User, Event, Message
│       └── middleware/             # authMiddleware, requireRole
├── assets/
├── app.json
└── package.json
```

### Screens

| Screen | Description |
|---|---|
| `AuthScreen` | Login / register with JWT |
| `SplashScreen` | Animated branded splash |
| `HomeScreen` | News carousel + searchable feed + recommended events + AI assistant |
| `CalendarScreen` | Events with date-range presets, chip filters, and countdown timers |
| `ExploreScreen` | Places, real estate, services, trips with type-chip filtering |
| `MapScreen` | Leaflet WebView map for places or real estate; background geocoding |
| `GlobalChatScreen` | Community-wide Socket.IO chat room |
| `ChatsScreen` | All available chat rooms list |
| `ChatDetailScreen` | Per-event or direct-message chat room |
| `EventDetailScreen` | Full event info, countdown, RSVP / waitlist, location map |
| `PlaceDetailScreen` | Place info + map |
| `RealEstateDetailScreen` | Listing details |
| `ServiceDetailScreen` | Community service detail |
| `TripDetailScreen` | Trip info |
| `NewsDetailScreen` | Full article view |
| `SponsorDetailScreen` | Sponsor profile |
| `ProfileScreen` | Avatar, interests, Games, Send Feedback, settings access |
| `UserProfileScreen` | View another user's public profile |
| `MyEventsScreen` | User's RSVPed events |
| `SettingsScreen` | Theme toggle, account options |
| `GmAdminScreen` | Create & manage events (GM role) |
| `SubmitPlaceScreen` | Add community place (GM role) |
| `SubmitRealEstateScreen` | Add listing (GM role) |
| `BusinessPartnershipScreen` | Sponsorship enquiry flow |
| `QaasScreen` | Community Q&A / FAQ |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI — `npm install -g expo-cli`
- iOS Simulator / Android Emulator or Expo Go on a physical device

### Mobile App

```bash
git clone https://github.com/kayraobi/Advanced-Messaging-App.git
cd Advanced-Messaging-App
npm install
npx expo start
```

Press `i` for iOS simulator, `a` for Android, or scan the QR with Expo Go.

### Backend

```bash
cd backend
npm install
npm run dev   # starts on http://localhost:3030
```

### Environment Variables

```env
EXPO_PUBLIC_API_URL=http://localhost:3030
EXPO_PUBLIC_SOCKET_URL=http://localhost:3030
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

Set `EXPO_PUBLIC_USE_MOCK=true` to run on local mock data without a backend.

---

## Key System Flows

### Authentication
1. `authService.login()` posts to `POST /api/users/login`
2. Backend validates with bcrypt, returns a signed JWT
3. Token stored in AsyncStorage; `api.ts` interceptor attaches it to every request
4. `socketService.ts` passes the token in Socket.IO `auth` during handshake
5. On app restart, `getStoredUser()` restores the session — clears storage if expired

### Notification System
1. `NotificationContext` manages both push and in-app notifications
2. On login, Expo push token is registered with the backend
3. `contentNotificationService` diffs API responses against AsyncStorage to detect new news/events and fires local notifications
4. A daily weather notification is scheduled once per day
5. In-app bell in `AppHeader` shows unread badge; tapping opens the notification modal

### Interactive Maps
1. `MapScreen` fetches all places or real estate from the API
2. `parseItemCoordinates` reads `latitude`/`longitude` fields directly if present
3. For items without coordinates, `extractCoordinatesFromText` scans Google Maps URLs in text fields
4. Remaining items get a `fallbackLatLng` (golden-angle scatter around Sarajevo centre)
5. Background geocoding via Nominatim fills in real coordinates (capped at 24 items, 1 req/s rate limit)
6. Map renders as Leaflet HTML inside a `WebView`; tapping a pin navigates to the detail screen

### Feedback → Supabase
1. User opens `FeedbackModal` from Profile, selects category and priority, writes message
2. `supabaseClient.ts` inserts a row into the `feedbacks` table with user name/email
3. RLS policy: INSERT open to everyone, SELECT restricted — write-only from the app

### Caching

| Data type | TTL |
|---|---|
| Events | 5 minutes |
| Places / News / Real Estate / Trips | 10 minutes |
| Chat messages | 2 minutes |

On screen open: return cached data immediately → fetch fresh in background if stale → keep last known data if offline.

---

## Security

- **JWT** — signed tokens verified by `authMiddleware.ts` on every protected route
- **RBAC** — Guest / Member / GM / Admin roles enforced via `requireRole()` middleware
- **Helmet** — secure HTTP response headers
- **Rate limiting** — 100 req / 15 min / IP
- **bcrypt** — passwords hashed at rest
- **Socket auth** — JWT passed in Socket.IO handshake `auth` field
- **Supabase RLS** — feedback table is INSERT-only from the mobile client

---

## Roadmap

- [x] Push notifications via Expo Notifications
- [x] Weather-aware daily notifications
- [x] AI assistant (Groq / llama3-8b)
- [x] Interactive maps with background geocoding
- [x] In-app games (Snake + Word Game)
- [x] User feedback form → Supabase
- [ ] Automated waitlist promotion on cancellation
- [ ] AI chat moderation (`hidden` flag already in Message model)
- [ ] Recommendation engine based on user interests
- [ ] Full MongoDB Atlas production deployment
- [ ] Admin moderation dashboard

---

## Team

| Name | Student ID | Role |
|---|---|---|
| Fatih Bahadır Karakuş | 220302370 | Frontend Developer & Backend Developer |
| Ömer Faruk Yaşar | 220302323 | Backend Developer & Frontend Developer |
| Taylan Taşkın | 220302443 | Real-Time Systems & Backend Developer |
| Kayra Yılmaz | 220302421 | Lead Developer |
| Ata Arda Kara | 230302007 | Database Engineer |

**Instructor:** Mirza Selimović &nbsp;|&nbsp; **Lab Assistant:** Adna Dedić &nbsp;|&nbsp; **Course:** CS308 Software Engineering — IUS

---

## Contributing

```bash
git checkout -b feat/your-feature-name
git add .
git commit -m "feat: describe your change"
git push --set-upstream origin feat/your-feature-name
```

---

<div align="center">

Made with ☕ in Sarajevo &nbsp;·&nbsp; Spring 2026

</div>
