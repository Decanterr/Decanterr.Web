# Decanterr Web

The React frontend for **Decanterr** — a self-hosted audiobook library manager. Talks to [Decanterr.API](../Decanterr.API) for library data, processing queue management, and live progress via SignalR.

## Tech stack

- React 19 + TypeScript + Vite
- MUI (Material UI) + MUI X Data Grid
- TanStack React Query for data fetching/caching
- React Router
- SignalR client for real-time queue/scan status

## Getting started

```bash
npm install
cp .env.example .env   # then fill in VITE_API_URL / VITE_API_KEY for your backend
npm run dev
```

## Environment variables

| Variable       | Description                                                   |
| -------------- | --------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the Decanterr API (e.g. `http://localhost:5000`)     |
| `VITE_API_KEY` | API key matching one of the backend's configured `ApiKeys`      |

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## Docker

```bash
docker build -t decanterr-web .
```

See `../Decanterr.API/docker-compose.api.yml` for running the full stack (API + web + Postgres) together.