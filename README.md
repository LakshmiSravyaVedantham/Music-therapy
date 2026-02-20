<div align="center">

# HealthTune

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**AI-powered music therapy that reads your health data and prescribes the right sound for your body.**

</div>

---

## Overview

HealthTune bridges the gap between personal health monitoring and evidence-based music therapy. By ingesting biometric data from wearable devices, the application infers your current emotional and physiological state through AI analysis, then delivers curated Spotify playlists engineered to move that state in a therapeutic direction.

## Problem and Solution

| Challenge | How HealthTune Addresses It |
|---|---|
| Generic wellness apps ignore objective health signals | Ingests heart rate, HRV, sleep score, and activity data directly from device integrations |
| Music streaming lacks therapeutic intent | AI maps biometric patterns to mood states and selects music with clinically-aligned parameters |
| Mood self-reporting is subjective and inconsistent | Cross-references multiple health metrics to derive a data-driven mood profile |
| Wellness insights are siloed across devices | Unified dashboard aggregates Apple Watch, Whoop, and iPhone data in one view |
| Users have no feedback loop between music and wellbeing | Session tracking correlates playlist choices with subsequent health metric changes |

---

## Features

### Health Integration

- Connect and sync data from Apple Watch, Whoop, and iPhone Health
- Real-time ingestion of heart rate, heart rate variability (HRV), sleep stages, and activity rings
- Simulated health data mode for development and demonstration without physical devices
- Persistent health history stored in PostgreSQL for longitudinal trend analysis

### AI Analysis

- OpenAI-powered mood inference engine that translates raw biometric vectors into emotional state classifications
- Contextual analysis considers time of day, recent sleep quality, and activity load
- Confidence scoring on each mood prediction with supporting metric explanations
- Adaptive model that refines recommendations based on user engagement history

### Music Therapy

- Spotify Web API integration for seamless playlist delivery within the application
- Recommendation engine selects tracks based on tempo, valence, energy, and acousticness
- Categorized therapeutic goals: stress reduction, focus enhancement, energy restoration, and emotional processing
- Session history and playlist bookmarking for repeat access to effective recommendations

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Language | TypeScript 5.6 | End-to-end type safety across client and server |
| Frontend | React 18 + Vite | Component-based UI with fast HMR in development |
| Styling | Tailwind CSS + Radix UI | Utility-first styling with accessible component primitives |
| State Management | TanStack Query | Server state synchronization and caching |
| Backend | Express.js | REST API and session management |
| AI | OpenAI API | Mood analysis and recommendation logic |
| Music | Spotify Web API SDK | Playlist search, playback, and track metadata |
| ORM | Drizzle ORM | Type-safe database queries with schema-as-code |
| Database | PostgreSQL (Neon) | Persistent storage for users, sessions, and health records |
| Validation | Zod | Runtime schema validation shared across client and server |

---

## Quick Start

**Prerequisites:** Node.js 20+, a PostgreSQL database, an OpenAI API key, and a Spotify Developer application.

**1. Clone the repository**

```bash
git clone https://github.com/LakshmiSravyaVedantham/Music-therapy.git
cd Music-therapy
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/healthtune
OPENAI_API_KEY=sk-...
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SESSION_SECRET=a_long_random_string
```

**4. Push the database schema**

```bash
npm run db:push
```

**5. Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5000`. The Express backend and Vite dev server run as a single unified process.

**6. Build for production**

```bash
npm run build
npm start
```

---

## Architecture Overview

```
Music-therapy/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/           # Route-level components
│       │   ├── DevicesPage.tsx      # Device connection and sync
│       │   ├── HealthPage.tsx       # Health metrics dashboard
│       │   ├── MoodPage.tsx         # AI mood analysis view
│       │   └── MusicPage.tsx        # Music recommendations and playback
│       ├── components/      # Shared UI components (shadcn/ui)
│       ├── hooks/           # Custom React hooks
│       └── services/        # Client-side API wrappers
├── server/                  # Express backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Database access layer
│   └── services/
│       ├── openai.ts        # Mood analysis via OpenAI
│       ├── spotify.ts       # Spotify API integration
│       └── healthSimulator.ts  # Mock health data for development
├── shared/
│   └── schema.ts            # Drizzle schema and Zod validators (shared)
├── drizzle.config.ts        # Drizzle ORM configuration
├── vite.config.ts           # Vite build configuration
└── tsconfig.json            # TypeScript project configuration
```

The server serves both the API and the compiled frontend assets from a single Express process. Shared TypeScript types and Zod schemas in `/shared` are imported by both client and server, eliminating duplication and ensuring consistent validation at every layer.

---

## Contributing

Contributions are welcome. Please follow this workflow:

1. Fork the repository and create a feature branch from `main`.
2. Write clear, focused commits. Each commit should represent a single logical change.
3. Ensure TypeScript compilation passes with `npm run check` before opening a pull request.
4. Open a pull request with a concise description of the change and the motivation behind it.

For significant changes, open an issue first to discuss the approach before investing time in implementation.

---

## License

This project is licensed under the [MIT License](LICENSE).
