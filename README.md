# Sarajevo Expats

Mobile-first messaging and community management platform for the Sarajevo Expats community.

This project is being developed as the CS308 Software Engineering course project at the International University of Sarajevo. It replaces fragmented WhatsApp-based communication and manual Excel RSVP tracking with a structured mobile experience for community news, event discovery, participation management, and real-time chat.

## Project Vision

Sarajevo Expats is designed to solve three main coordination problems described in the project proposal:

- WhatsApp group limits and fragmented communication
- important event information getting lost in noisy chat streams
- manual RSVP and attendance tracking through spreadsheets

The goal is to centralize:

- daily community news
- event discovery and RSVP
- waitlist and capacity handling
- global and event-based messaging
- user profile and participation tracking

## Proposal Alignment

This README follows the scope and direction defined in:

- `cs308_proposal.pdf`

Key proposal themes reflected in the current codebase:

- Daily News Hub
- Smart Event Discovery
- Event RSVP and event detail flows
- Global Community Chat
- Event-specific chat channels
- User profiles and personalized tracking

## Current App Structure

The mobile app is built with Expo + React Native and currently includes the following user-facing areas:

- `Home`
  - featured news carousel
  - latest news feed
  - recommended events
- `Calendar`
  - event filtering
  - event discovery and capacity visibility
- `Chats`
  - global community chat
  - event chat rooms
  - direct message mock flow
- `Profile`
  - My Events
  - App Settings
  - FAQ
  - Edit Interests

## Implemented Navigation Architecture

The project previously used manual state-based screen switching inside `App.tsx`. It now uses a structured React Navigation setup:

- `src/navigation/AppNavigator.tsx`
- `src/navigation/MainTabNavigator.tsx`
- `src/navigation/ProfileStackNavigator.tsx`
- `src/navigation/types.ts`

Current navigation model:

- Root stack
  - `Auth`
  - `MainTabs`
  - `EventDetail`
  - `ChatDetail`
  - `GlobalChat`
- Bottom tabs
  - `Home`
  - `Calendar`
  - `Chats`
  - `Profile`
- Profile stack
  - `ProfileMain`
  - `MyEvents`
  - `Settings`
  - `FAQ`

This makes the app easier to scale and aligns well with the proposal’s multi-flow mobile UX.

## Event Countdown Design

The event detail screen includes a remaining-time bar/chip for event start countdown.

Relevant files:

- `src/screens/EventDetailScreen.tsx`
- `src/hooks/useEventCountdown.ts`
- `src/utils/eventDate.ts`
- `src/data/events.ts`

Why this matters:

- it gives users immediate visibility into how soon an event starts
- it is written to support both mock data and future API data

Current logic:

- if an event has `startsAt`, it uses that
- otherwise it falls back to the existing mock `date + time` fields

This makes the transition to real Sarajevo Expats backend data very easy: once the real event payload arrives, the app can map backend fields into `startsAt` without rewriting the UI.

## FAQ Integration

The Profile section now includes an FAQ screen:

- `src/screens/FAQScreen.tsx`
- `src/data/faqs.ts`

The FAQ screen is intentionally API-ready:

- the UI is already connected to a dedicated FAQ data source
- the current website Q&A source is referenced through `FAQ_SOURCE_URL`
- once real FAQ data is provided, only the data source or service layer needs to change

At the moment, the public Q&A page does not expose published questions, so the app shows a clean empty-state while keeping the structure ready for real data.

## Real-Time Messaging

The project includes a socket-based chat integration path for real-time communication.

Relevant files:

- `src/services/socketService.ts`
- `src/screens/ChatDetailScreen.tsx`
- `backend/src/socket/chatHandler.ts`

Current capabilities:

- joining chat rooms
- loading previous room messages
- sending and receiving messages over Socket.IO

This aligns directly with the proposal’s:

- Global Community Chat
- Event-Specific Chat Channels

## Tech Stack

Based on both the proposal and the current repository:

### Mobile

- React Native
- Expo
- TypeScript
- React Navigation
- React Query
- AsyncStorage
- Socket.IO client

### Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- JWT-related auth scaffolding

### Project / Delivery

- Git
- GitHub

The proposal mentions PostgreSQL and Supabase as part of the broader target architecture. The current repository already contains backend scaffolding and service layers that can evolve into that deployment model.

## Running the Project

### Mobile app

From the repository root:

```bash
npm install
npx expo start
```

Useful shortcuts:

```bash
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Backend

From the `backend` folder:

```bash
npm install
npm run dev
```

## Environment Variables

The frontend is already structured to work with real backend values through Expo public env variables.

Examples used by the codebase:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SOCKET_URL`
- `EXPO_PUBLIC_USE_MOCK`

The current pattern is:

- use mock data during early UI development
- switch to real API values in `.env` when the Sarajevo Expats tokens and endpoints are available

## Current Status

The project is in an active implementation phase.

Already represented in the app:

- structured navigation
- Daily News Hub style home
- event listing and discovery
- event detail view
- countdown-ready event timing
- global and event-based chat flows
- profile stack
- FAQ placeholder wired for future live content

Planned / proposal-aligned areas for further evolution:

- automated RSVP and waitlist management
- recommendation engine
- conflict and scheduling checks
- weather-aware event alerts
- AI moderation
- RBAC
- deeper backend integration with real Sarajevo Expats data

## Team

According to the proposal:

- Fatih Bahadır Karakuş — Frontend Developer & Backend Developer
- Ömer Faruk Yaşar — Backend Developer & Frontend Developer
- Taylan Taşkın — Real-Time Systems & Backend Developer
- Kayra Yılmaz — Lead Developer
- Ata Arda Kara — Database Engineer

## Repository Notes

- root mobile app: Expo / React Native
- `backend/`: Node.js + Express + Socket.IO backend
- `src/services/`: API and integration layer
- `src/navigation/`: app navigation architecture
- `src/screens/`: user-facing screens
- `src/data/`: mock and transitional data sources

## Summary

Sarajevo Expats is a community infrastructure project rather than just a chat app. Its purpose is to give the Sarajevo expat ecosystem a scalable, mobile-first foundation for:

- communication
- event participation
- discovery
- coordination

The current codebase already reflects that direction and is structured to make the transition from mock data to live Sarajevo Expats data straightforward.
