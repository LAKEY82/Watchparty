# ReelSync — Watch Party Frontend

A modern, premium watch-party web app where people can create or join rooms and watch movies together in perfect sync. Dark, cinematic UI with glassmorphism accents, built as a fully static/client-driven frontend (no backend required to explore the UI).

This repo currently contains the **frontend only** — a Next.js app with mocked data and local component state standing in for the real-time backend and playback sync.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- `clsx` + `tailwind-merge` for conditional class handling

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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
| `/login`, `/register` | Auth screens with a split-screen cinematic preview |
| `/dashboard` | Quick create/join actions, stats, live + recent rooms |
| `/create-room` | Room setup — movie source, privacy, guest limit, chat/voice toggles |
| `/join-room` | Join by room code/link, or quick-join a recent room |
| `/room/[roomId]` | The watch room — synced player, chat + participants sidebar, mic/camera dock, share and settings modals |

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
├── lib/                 # Mock data + utility helpers
└── types/               # Shared TypeScript types
```

## Notes

- All data (rooms, participants, chat messages) is mocked in `src/lib/mock-data.ts` — there is no live backend wired up yet, so actions like sending a chat message or toggling playback only update local component state.
- Fully responsive: the watch room's chat panel becomes a slide-over drawer and the media dock reflows below the player on small screens.
