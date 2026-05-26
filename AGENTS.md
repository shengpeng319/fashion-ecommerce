# AGENTS.md

## Project overview

Four independent packages (no root workspace/monorepo config):

| Package | Stack | Port |
|---------|-------|------|
| `backend/` | Express + TypeScript + Prisma | 3001 |
| `frontend/` | uni-app (Vue 3 + TS) targeting WeChat Mini Program | Vite proxy to 3001 |
| `admin/` | Vue 3 + Vite + Element Plus | 5173 |
| `shareholder-portal/` | Vue 3 + Vite + Element Plus | 8082 |

## Important gotchas

**Database is SQLite, not MySQL.** `schema.prisma` uses `provider = "sqlite"`. The `.env.example` shows a MySQL URL but the actual `.env` uses `file:./dev.db`. Ignore the MySQL reference in docs — this project runs on local SQLite.

**shareholder-portal proxies to port 8083**, not 3001 like admin/frontend. If you need the portal to work, either run a second backend on 8083 or update the proxy target.

**No root-level commands.** Everything is per-package. Run `npm install` and all scripts from within the individual package directories.

**No linter, formatter, or CI configured.** There is no eslint, prettier, or GitHub Actions. There are no `lint`/`format`/`typecheck` scripts — the admin and shareholder-portal `build` script is the only typecheck (`vue-tsc -b && vite build`).

**docs/API.md is a planning doc — do not trust its paths.** The actual C-end API prefix is `/api/fashions/` (e.g., `/api/fashions/products`, not `/api/products`). Refer to `backend/src/index.ts` for the real route mounts.

## Developer commands

### Backend (cd backend/)
```
npm run dev          # tsx watch on src/index.ts
npm run build        # tsc (has known type errors — use tsx for production too)
npm run db:push      # sync Prisma schema to SQLite (preferred — no migration files tracked)
npm run db:seed      # seed data
npm run db:generate  # regenerate Prisma client
```
`db:push` is the preferred way to update the DB schema. `db:migrate` exists but is not used in this repo.

**Backend `tsc` build fails** due to `"strict": true` in tsconfig. Use `npx tsx src/index.ts` to run in production instead of `npm run start`.

### Frontend / uni-app (cd frontend/)
```
npm run dev:mp-weixin   # dev for WeChat Mini Program
npm run dev:h5           # dev for H5 browser
npm run build:mp-weixin  # build for WeChat
npm run build:h5         # build for H5
```

### Admin (cd admin/)
```
npm run dev       # Vite dev on port 5173
npm run build     # vue-tsc typecheck → vite build (type errors block build)
```

### Shareholder Portal (cd shareholder-portal/)
```
npm run dev       # Vite dev on port 8082
npm run build     # vue-tsc typecheck → vite build (type errors block build)
```

## Testing

Only the admin package has tests — Playwright e2e:
```
cd admin && npx playwright test
```
Playwright serves the admin on port 3002, which proxies `/api` to `localhost:3001`. **The backend must be running separately** — Playwright's `webServer` config only starts the admin dev server, not the backend.

No unit tests, no backend tests.

## Deployment

```
./deploy/deploy.sh    # builds frontend H5 + admin, starts all 3 services
```

| Service | Port | Description |
|---------|------|-------------|
| Backend | 3001 | `tsx src/index.ts` (TS source, no tsc needed) |
| Website (H5) | 8080 | Static serve of `frontend/dist/build/h5` with `/api` proxy |
| Admin | 8081 | `vite preview` of `admin/dist` with `/api` proxy |

## Architecture notes

- **Backend API prefix**: `/api/fashions/` for C-end, `/api/admin/` for management, `/api/shareholder/` for shareholder routes.
- **Admin auth**: stores `admin_token` + `admin_user` in localStorage. API base is `/api/admin`. Axios interceptor auto-attaches Bearer token and redirects to `/login` on 401.
- **Shareholder auth**: stores `shareholder_token` in localStorage, API base is `/api/shareholder`. Uses Pinia `useAuthStore` for state.
- **Frontend has no auth yet** — the uni-app is C-end (customer-facing), no login implemented.
- **File uploads** are served from `backend/uploads/` via Express static middleware at `/uploads`.
- **All three frontend packages** proxy `/api` to their respective backend targets via Vite config.
