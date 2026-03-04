# Uzzap Buddy Chat

A mobile-first community chat app built with Expo + React Native + Supabase.

## Tech stack

- Expo Router (file-based navigation)
- React Native + TypeScript
- Zustand for local app/auth/chat state
- Supabase (auth, database, realtime)
- React Query for server state caching

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (via `npx expo` is fine)
- Supabase project with required tables/policies

## Environment setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your Supabase values.

```bash
cp .env.example .env.local
```

Required variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_BLINK_PROJECT_ID`
- `EXPO_PUBLIC_BLINK_PUBLISHABLE_KEY`

## Install

```bash
npm install
```

## Run

```bash
npm run start
```

Other useful scripts:

- `npm run dev` - run web dev server on port 3000
- `npm run start:ios` - run iOS target
- `npm run start:android` - run Android target

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
```

## Production checklist

- Checklist: `docs/prod-test-checklist.md`
- Latest environment run report: `docs/prod-test-checklist-results.md`

## Build failure troubleshooting

- Prisma mismatch for app store submission payload: `docs/prisma-app-store-submissions-troubleshooting.md`

## Project structure (high level)

- `app/` - route screens
- `components/` - reusable UI
- `services/` - Supabase-backed service layer
- `store/` - Zustand stores
- `lib/` - clients and shared infra
- `docs/` - architecture and release docs
