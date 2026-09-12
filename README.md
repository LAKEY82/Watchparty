# Watchly — Watch Party Frontend

A modern, premium watch-party web app where people can create or join rooms and watch movies together in perfect sync. Dark, cinematic UI with glassmorphism accents.

This repo is the frontend. It talks to the [backend](https://github.com/LAKEY82/WatchpartyBackend) for auth and room data.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- `clsx` + `tailwind-merge` for conditional class handling

## Getting started

```bash
npm install
```

Copy `.env.example` to `.env.local` and point it at your backend:

```bash
cp .env.example .env.local
```

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

`NEXT_PUBLIC_API_URL` is the single place the backend's location is configured (`src/lib/api.ts`) — change it any time (a different port, a deployed URL, ...) without touching code.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Make sure the [backend](https://github.com/LAKEY82/WatchpartyBackend) is running too, or auth and room actions will fail with a "couldn't reach the server" error.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page — hero, features, how-it-works, CTA |
| `/login`, `/register` | Auth screens, wired to the backend's `/api/auth` routes |
| `/dashboard` | Real rooms fetched from the backend, quick create/join actions, stats |
| `/create-room` | Creates a real room via `POST /api/rooms`, then redirects into it |
| `/join-room` | Joins a room by code via the backend, or quick-joins one of your recent rooms |
| `/room/[roomId]` | The watch room — `roomId` is the room's code. Header, participants, and settings come from the backend; the player, chat, and mic/camera controls are local-only for now (no live sync yet) |

## Project structure

```
src/
├── app/                # Next.js App Router pages
├── components/
│   ├── ui/              # Reusable primitives (Button, Input, Avatar, Switch, ...)
│   ├── landing/          # Landing page sections
│   ├── auth/             # Auth layout/shared pieces
│   ├── dashboard/        # Dashboard widgets
│   └── room/              # Watch room: video player, chat, dock, modals
├── hooks/
│   └── useAuth.ts        # useRequireAuth() — redirects to /login if no session
├── lib/
│   ├── api.ts            # API_BASE_URL + all backend calls
│   ├── auth-storage.ts   # token/user persistence (localStorage)
│   ├── mappers.ts        # backend Room/Participant -> UI-friendly shapes
│   ├── mock-data.ts       # fixtures still used by the landing page preview
│   └── utils.ts
└── types/               # Shared TypeScript types (UI types + Api* backend types)
```

## Auth

Login/register call the backend, store the returned JWT + user in `localStorage`, and every subsequent request sends `Authorization: Bearer <token>`. Pages under `/dashboard`, `/create-room`, `/join-room`, and `/room/*` use `useRequireAuth()` and redirect to `/login` if there's no session.

## Notes / what's not connected yet

- **Real-time is not wired up.** The backend has Socket.io events for chat, playback sync, and presence (see its README), but this frontend doesn't open a socket connection yet — the video player, chat panel, and mic/camera toggles in the room only update local state. That's the natural next step.
- The landing page's preview mockup still uses fixtures from `src/lib/mock-data.ts` — it's just decorative there, not a real room.
