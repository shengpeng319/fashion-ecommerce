# AGENTS.md

## Project overview

Four independent packages (no root workspace/monorepo config):

| Package | Stack | Port |
|---------|-------|------|
| `backend/` | Express + TypeScript + Prisma + MySQL | 3001 |
| `frontend/` | uni-app (Vue 3 + TS) targeting WeChat Mini Program + H5 | - |
| `admin/` | Vue 3 + Vite + Element Plus | 5173 |
| `shareholder-portal/` | Vue 3 + Vite + Element Plus | 8082 |

## Deployment architecture

| Component | Platform | Address |
|-----------|----------|---------|
| Backend API | 微信云托管 (CloudBase Run) | `fashions-api` service, env `prod-d2gwfmcsv098ff7b1` |
| MySQL | CynosDB (内网) | `10.38.110.185:3306`, db `fashion_ecommerce`, user `fashion1` |
| Frontend H5 | (TBD) | - |
| Admin | (TBD) | - |

## Important gotchas

**Database is MySQL (CynosDB), migrated from SQLite.** `schema.prisma` uses `provider = "mysql"` with `@db.Decimal(10,2)` for currency and `@db.Text` / `@db.LongText` for long strings. Original `prisma/dev.db` is kept for reference only.

**No root-level commands.** Everything is per-package. Run `npm install` and all scripts from within the individual package directories.

**No linter, formatter, or CI configured.** There is no eslint, prettier, or GitHub Actions. There are no `lint`/`format`/`typecheck` scripts — the admin and shareholder-portal `build` script is the only typecheck (`vue-tsc -b && vite build`).

**docs/API.md is a planning doc — do not trust its paths.** The actual C-end API prefix is `/api/fashions/` (e.g., `/api/fashions/products`, not `/api/products`). Refer to `backend/src/index.ts` for the real route mounts.

**Backend `tsc` build fails** due to `"strict": true` in tsconfig. Use `npx tsx src/index.ts` to run in production instead of `npm run start`.

## WeChat Mini Program requirements

### AppID & Environment
- **AppID**: `wx1f873d53541880f1`
- **Cloud Environment**: `prod-d2gwfmcsv098ff7b1` (微信云托管)
- **Service Name**: `fashions-api`

### Build commands
```bash
cd frontend/

# Build for WeChat Mini Program (VITE_API_BASE must be empty)
VITE_API_BASE= npm run build:mp-weixin

# After build, remove SVG files (WeChat doesn't accept SVG for tabBar)
rm -f dist/build/mp-weixin/static/tabbar/*.svg

# Output: dist/build/mp-weixin/  → import this directory in WeChat DevTools
```

### tabBar icons must be PNG
WeChat Mini Program tabBar only supports `.png`, `.jpg`, `.jpeg` — **NOT SVG**. Icon files are in `frontend/src/static/tabbar/*.png` (81x81 RGBA). If you need to regenerate, use Python Pillow (see generation script in commit history). Never reference `.svg` in `pages.json` tabBar config.

### pages.json: tabBar pages must be in main `pages` array
Pages referenced in `tabBar.list[].pagePath` **cannot** be inside `subPackages`. They must be directly in the top-level `pages` array. If a tabBar page is also in a subPackage, WeChat DevTools will error: `need in ["pages"]` and `不应该在 ["subPackages"] 中`.

### manifest.json mp-weixin settings (required for upload)
```json
"mp-weixin": {
  "appid": "wx1f873d53541880f1",
  "setting": {
    "urlCheck": false,
    "minified": true,
    "lazyCodeLoading": "requiredComponents"
  }
}
```
- `minified: true` — JS compression (required by WeChat upload)
- `lazyCodeLoading: "requiredComponents"` — component lazy injection (required by WeChat upload)
- `urlCheck: false` — skip domain validation in DevTools

### API calls: wx.cloud.callContainer (NOT uni.request)
**Mini program uses `wx.cloud.callContainer` to call the backend** — this is the official way for 微信云托管. It does NOT require configuring server domains in mp.weixin.qq.com. The cloud test domain `*.sh.run.tcloudbase.com` **cannot** be added to the server domain whitelist (it will be rejected as "云托管域名仅用作测试").

`wx.cloud.init()` is called in `App.vue` onLaunch. The request flow:
1. `wx.cloud.init({ env: 'prod-d2gwfmcsv098ff7b1' })`
2. `wx.cloud.callContainer({ path: '/api/fashions/...', header: { 'X-WX-SERVICE': 'fashions-api' } })`

For H5, `uni.request` with the full cloud URL is used instead (see `frontend/src/utils/request.ts`).

### Container cold start timeout
微信云托管 scales to 0 instances when idle. Cold start takes ~15-30 seconds, causing mini program request timeout. **Set minimum instances to 1** in the cloud console (服务设置 → 弹性伸缩 → 最小实例数 = 1) to keep the container always warm.

### Publishing flow
1. Build: `VITE_API_BASE= npm run build:mp-weixin` + remove SVGs
2. Open `dist/build/mp-weixin` in WeChat DevTools
3. DevTools → 点击「上传」→ fill version description
4. mp.weixin.qq.com → 版本管理 → 选为体验版 (or 提交审核 for production)
5. Scan QR code on phone to test

### Product images
Product images use **full Unsplash CDN URLs** (not local `/uploads/products/` paths) because container filesystem is ephemeral. The seed data (`prisma/seed.ts`) uses `IMAGE_URLS` constants directly in product records. If you add new products, use full URLs, not relative paths.

## Developer commands

### Backend (cd backend/)
```
npm run dev          # tsx watch on src/index.ts
npm run build        # tsc (has known type errors — use tsx for production too)
npm run db:push      # sync Prisma schema to MySQL
npm run db:seed      # seed data (idempotent — skips if products exist)
npm run db:generate  # regenerate Prisma client
```

**DATABASE_URL** in `backend/.env` points to CynosDB MySQL (internal address for cloud, external for local dev).

### Frontend / uni-app (cd frontend/)
```
VITE_API_BASE= npm run build:mp-weixin  # build for WeChat (MUST set VITE_API_BASE empty)
npm run dev:mp-weixin                     # dev for WeChat Mini Program
npm run dev:h5                            # dev for H5 browser
npm run build:h5                          # build for H5 (uses .env.local for proxy)
```

**`.env.local`** sets `VITE_API_BASE=/api/fashions` for local H5 dev (Vite proxy). Production builds override with `VITE_API_BASE=` to use the cloud URL.

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
No unit tests, no backend tests.

## Architecture notes

- **Backend API prefix**: `/api/fashions/` for C-end, `/api/admin/` for management, `/api/shareholder/` for shareholder routes.
- **Admin auth**: stores `admin_token` + `admin_user` in localStorage. API base is `/api/admin`. Axios interceptor auto-attaches Bearer token and redirects to `/login` on 401.
- **Shareholder auth**: stores `shareholder_token` in localStorage, API base is `/api/shareholder`. Uses Pinia `useAuthStore` for state.
- **Frontend auth**: stores `token` in localStorage via `uni.setStorageSync('token')`.
- **File uploads**: served from `backend/uploads/` via Express static — ephemeral in cloud containers, use external URLs for persistent assets.
