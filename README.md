<div align="center">

<img src="assets/icon.png" width="100" alt="Sarajevo Expats Logo" />

# Sarajevo Expats

**A mobile-first community platform for the Sarajevo expat community**

[![Expo](https://img.shields.io/badge/Expo-54.0-black?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black?logo=socket.io)](https://socket.io)

*CS308 Software Engineering — International University of Sarajevo, Spring 2025–2026*

</div>

---

## Overview

Sarajevo Expats replaces fragmented WhatsApp coordination and manual Excel RSVP tracking with a structured, mobile-first platform. The app gives the Sarajevo expat community a single place for daily news, event discovery, RSVP management, real-time chat, explore listings, and personal profile tracking.

| Problem | Solution |
|---|---|
| WhatsApp group limits & noise | Structured news feed + dedicated chat rooms |
| Events buried in chat streams | Calendar with filtering, capacity visibility & countdowns |
| Manual RSVP via spreadsheets | In-app RSVP with automatic waitlist handling |
| No central place directory | Explore screen with places, real estate, services & trips |

---

## Features

### For Community Members
- **Daily News Hub** — curated community news with live search filtering
- **Event Discovery** — browse, filter by date range or category, see capacity & countdowns
- **RSVP & Waitlist** — one-tap join with automatic waitlist placement when full
- **Real-Time Chat** — global community chat and per-event chat rooms via Socket.IO
- **Explore** — places, real estate, services, and trip listings with type-chip filtering
- **User Profile** — interests, attended events, edit personal details

### For GM / Organisers
- **GM Admin Panel** — create and manage events, inspect participant lists
- **Submit Place / Real Estate** — add community-relevant listings directly from the app
- **Business Partnership** — sponsorship and partnership enquiry flow

### Platform
- **Dark & Light theme** — system-aware with manual toggle in Settings
- **Dynamic Island / notch safe** — all headers respect `useSafeAreaInsets` on iOS 26+
- **Offline-friendly** — stale-while-revalidate cache returns data instantly even without network
- **JWT auth** — token stored in AsyncStorage, auto-attached to every request via Axios interceptor

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
| AsyncStorage | 2.2 | Token persistence & TTL cache |
| TanStack Query | 5.0 | Server state management |
| date-fns | 3.6 | Date formatting & calendar logic |
| Expo Image Picker | 17.0 | Photo attachment for listings |
| react-native-maps | 1.27 | Map views in event & place screens |

### Backend (local dev / mock)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Typed route handlers and services |
| Socket.IO | Real-time chat rooms |
| Mongoose + MongoDB | Data models and persistence |
| JWT (`jsonwebtoken`) | Token signing and middleware |
| bcrypt | Password hashing |
| Helmet | Secure HTTP headers |
| CORS | Cross-origin policy |
| express-rate-limit | Brute-force protection |
| morgan | Request logging |

> The `backend/` folder is a local development server. The production backend is maintained separately by the backend team and reached via `EXPO_PUBLIC_API_URL`.

---

## Architecture

Sarajevo Expats uses a **Layered Client-Server Architecture** with an event-driven real-time subsystem.

```
┌─────────────────────────────────────────────────────────┐
│               Presentation Layer                        │
│        React Native / Expo Mobile Client                │
│   Screens · Components · Navigation · Theme Context     │
└──────────────────┬──────────────────────────────────────┘
                   │  HTTPS + JSON  /  WSS + Socket.IO
┌──────────────────▼──────────────────────────────────────┐
│               Communication Layer                       │
│         Axios (REST)  +  Socket.IO Client               │
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
│              MongoDB Atlas                              │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern | Where | Purpose |
|---|---|---|
| **Repository** | `backend/src/repositories/` | Decouples data access from business logic |
| **Service Layer** | `src/services/` · `backend/src/services/` | Centralises business rules, keeps controllers thin |
| **Observer / Pub-Sub** | `backend/src/socket/chatHandler.ts` | Socket.IO room broadcast without polling |
| **Singleton-Like Instance** | `src/services/api.ts` · `backend/src/index.ts` | Single Axios instance + single DB/socket connection |
| **Cache-Aside / Stale-While-Revalidate** | `src/services/storageService.ts` | Show cached data instantly, refresh in background |
| **DTO / Type Definitions** | `src/types/` | Typed contracts at every layer boundary |
| **Strategy (RSVP)** | `backend/src/services/eventService.ts` | Direct join vs. waitlist via same `processRsvp()` entry point |

---

## Project Structure

```
Advanced-Messaging-App/
├── src/
│   ├── screens/              # All user-facing screens
│   ├── components/           # Shared UI (AppHeader, ScreenHeader, BottomNav…)
│   ├── services/             # API + business logic layer
│   │   ├── api.ts            # Axios instance with JWT interceptor
│   │   ├── authService.ts    # Login, register, getMe, updateMe
│   │   ├── eventService.ts   # Event CRUD + RSVP
│   │   ├── chatService.ts    # Chat room operations
│   │   ├── socketService.ts  # Socket.IO connection with JWT handshake
│   │   ├── storageService.ts # TTL cache + useCachedFetch hook
│   │   ├── placesService.ts
│   │   ├── newsService.ts
│   │   ├── realEstateService.ts
│   │   ├── tripsService.ts
│   │   └── …                 # sponsors, qaas, roles, uploads…
│   ├── types/                # TypeScript interfaces (User, Event, News…)
│   ├── contexts/             # ThemeContext (dark/light)
│   ├── navigation/           # AppNavigator, MainTabNavigator, stacks
│   └── utils/                # apiUnwrap, eventDate helpers
├── backend/
│   └── src/
│       ├── routes/           # auth, events, places, realEstate, services, trips…
│       ├── controllers/      # Thin route handlers
│       ├── services/         # Business logic
│       ├── repositories/     # eventRepository, chatRepository
│       ├── socket/           # chatHandler.ts — Socket.IO pub-sub
│       ├── models/           # Mongoose User, Event, Message
│       └── middleware/       # authMiddleware (JWT), requireRole
├── assets/                   # Icons, splash, adaptive icon
├── app.json                  # Expo config (bundle ID, scheme, plugins)
└── package.json
```

### Screens

| Screen | Description |
|---|---|
| `AuthScreen` | Login / register with JWT |
| `SplashScreen` | Animated orange branded splash |
| `HomeScreen` | News carousel + searchable feed + recommended events |
| `CalendarScreen` | Events with date-range presets & chip filters |
| `ExploreScreen` | Places, real estate, services, trips + type-chip filtering |
| `GlobalChatScreen` | Community-wide Socket.IO chat room |
| `ChatsScreen` | All available chat rooms list |
| `ChatDetailScreen` | Per-event or direct-message chat room |
| `EventDetailScreen` | Full event info, countdown timer, RSVP / waitlist |
| `PlaceDetailScreen` | Place info + map |
| `RealEstateDetailScreen` | Listing details |
| `ServiceDetailScreen` | Community service detail |
| `TripDetailScreen` | Trip info |
| `NewsDetailScreen` | Full article view |
| `SponsorDetailScreen` | Sponsor profile |
| `ProfileScreen` | User info, interests, stats |
| `UserProfileScreen` | View another user's profile |
| `MyEventsScreen` | User's RSVPed events |
| `SettingsScreen` | Theme toggle, account options |
| `GmAdminScreen` | Create & manage events (GM role) |
| `SubmitPlaceScreen` | Add community place (GM role) |
| `SubmitRealEstateScreen` | Add listing (GM role) |
| `BusinessPartnershipScreen` | Sponsorship enquiry |
| `QaasScreen` | Community Q&A / FAQ |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI — `npm install -g expo-cli`
- iOS Simulator / Android Emulator **or** Expo Go on a physical device

### Mobile App

```bash
# Clone the repo
git clone https://github.com/kayraobi/Advanced-Messaging-App.git
cd Advanced-Messaging-App

# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

```bash
npx expo start --ios      # iOS only
npx expo start --android  # Android only
npx expo start --web      # Web (Metro bundler)
```

### Backend (local dev server)

```bash
cd backend
npm install
npm run dev   # starts on http://localhost:3030
```

### Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=http://localhost:3030
EXPO_PUBLIC_SOCKET_URL=http://localhost:3030
EXPO_PUBLIC_USE_MOCK=false
```

Set `EXPO_PUBLIC_USE_MOCK=true` to run the app entirely on local mock data without a running backend.

---

## Authentication Flow

1. User submits credentials on `AuthScreen`
2. `authService.login()` posts to `POST /api/users/login`
3. Backend validates credentials with bcrypt and returns a signed JWT
4. Token is stored in AsyncStorage; user object cached locally
5. `api.ts` interceptor attaches `Authorization: Bearer <token>` to every subsequent request
6. `socketService.ts` passes the token in the Socket.IO handshake `auth` field
7. On app start, `getStoredUser()` decodes the JWT to restore the session — clears storage if expired

---

## Caching Strategy

`storageService.ts` implements a **Cache-Aside / Stale-While-Revalidate** pattern using AsyncStorage:

| Data type | TTL |
|---|---|
| Events | 5 minutes |
| Places / News / Real Estate / Trips | 10 minutes |
| Chat messages | 2 minutes |

**Behaviour on screen open:**
1. Return cached data immediately (even if stale) → zero perceived loading time
2. If stale, fetch fresh data in the background and silently update the cache
3. If network fails entirely, keep showing the last known data as an offline fallback

Use `useCachedFetch` to adopt this in any screen:

```ts
const { data, loading, refresh } = useCachedFetch('events', eventService.getAll);
```

---

## Security

- **JWT authentication** — signed tokens, verified by `authMiddleware.ts` before every protected route
- **Role-based access control** — Guest / Member / GM / Admin roles enforced via `requireRole()` middleware
- **Helmet** — sets secure HTTP response headers automatically
- **CORS** — configurable allowed origins
- **Rate limiting** — 100 requests / 15 minutes / IP via `express-rate-limit`
- **bcrypt** — passwords hashed in production auth routes
- **Socket authentication** — JWT token passed in Socket.IO `auth` object during handshake

---

## Roadmap

- [ ] Automated waitlist promotion on cancellation
- [ ] Push notifications via Expo Notifications
- [ ] AI chat moderation (`hidden` flag already in the Message model)
- [ ] Recommendation engine based on user interests
- [ ] Weather-aware event alerts
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

This is an academic project. Team members follow a feature-branch workflow:

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: describe your change"
git push --set-upstream origin feature/your-feature-name
```

Active development branch: `chat-and-cache-feature`

---

<div align="center">

Made with ☕ in Sarajevo &nbsp;·&nbsp; Spring 2026

</div>
