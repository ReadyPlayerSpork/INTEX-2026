# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Keep agent guidance up to date (important)

This file is a **living source of truth**. If you discover that any instruction here is wrong, incomplete, or has drifted from the codebase, **update `CLAUDE.md` in the same PR/commit as the change (or immediately after the discovery)** so future agents don’t repeat the same mistake.

Update this document when you confirm changes to (examples):
- Dev commands, working directories, or required tooling (npm/dotnet scripts, build steps)
- Local ports, URLs, proxy rules, or CORS/credentials behavior
- Auth behavior (cookie/session settings, `/api/auth/me` shape), roles/policies, or seeded credentials
- DB contexts, migrations/DB files, or environment/config keys that agents rely on
- Canonical “key files” lists when files move/rename

When updating:
- Prefer **specific, verifiable facts** (exact paths, endpoints, ports, config keys).
- If behavior differs by environment (dev vs prod), state that explicitly.
- Avoid speculative notes; if you’re not sure, either verify quickly or omit.

## Project Overview

**Haven for Her** — A full-stack case management and donor platform for a sexual assault survivor assistance nonprofit. Built by BYU INTEX Section 2, Group 15.

## Commands

> **CRITICAL AGENT INSTRUCTION:** Whenever you run commands, please prefix them with `PATH=$PATH:/opt/homebrew/bin:/usr/local/bin` or run `source ~/.zshrc && <command>` to load the user's tools first. If the tools don't load, then run them as you normally would.

### Frontend (`frontend/Haven-for-Her/`)
```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

**Production / CI builds (Dokploy, Railpack, Docker):** Use build path **`frontend/Haven-for-Her`** exactly—Linux images are case-sensitive, so a lowercase `haven-for-her` path can make the build step fail and leave an old image running. **`vite-plugin-mkcert`** is wired only for `vite` dev (`command === 'serve'`), not for `vite build`, so `npm run build` does not run mkcert (avoids CI hangs, permission errors under `/.vite-plugin-mkcert`, or blocked CA installs).

### Backend (`backend/Haven-for-Her-Backend/`)
```bash
dotnet run --launch-profile https   # REQUIRED: starts on https://localhost:7229 + http://localhost:5064
dotnet build                        # Build only
dotnet watch                        # Hot-reload dev server
```

> **Important:** You must use `--launch-profile https` so the backend listens on `https://localhost:7229`. The Vite dev server proxies `/api` requests to that address. Running plain `dotnet run` only starts `http://localhost:5064`, which causes 502 Bad Gateway errors in the frontend.

In development, the backend exposes an OpenAPI document via `Microsoft.AspNetCore.OpenApi` at `/openapi/v1.json` (not Swagger UI). See [OpenAPI support in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi).

## Architecture

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript ~6.0, Vite 8, Tailwind CSS, shadcn/ui |
| Backend | ASP.NET Core / .NET 10 |
| ORM | Entity Framework Core 10 + Npgsql 10.0.1 |
| Auth | ASP.NET Identity + Google OAuth, cookie-based sessions |
| DB | PostgreSQL (dev & prod) — connection strings via `.env` override, empty in `appsettings.json` |

### Backend Structure
The backend uses **two separate DB contexts** (both PostgreSQL via Npgsql):
- `HavenForHerBackendDbContext` — 18 domain models (Resident, Donation, Safehouse, etc.) with explicit Fluent API relationship configuration in `OnModelCreating`
- `AuthIdentityDbContext` — ASP.NET Identity (users, roles)

Migrations are split into **two folders**: `Migrations/Domain/` and `Migrations/Identity/`.

### Domain seed CSVs (US demo data)
- **Path:** `backend/Haven-for-Her-Backend/docs/lighthouse_csv_v7/*.csv` — domain tables are seeded via `CsvDataSeeder` (see `Program.cs`) **only when** `REFRESH=true` (env var) **or** the domain DB is empty (first deploy). Data persists across restarts otherwise.
- **REFRESH safety:** `CsvDataSeeder` validates that **all required CSV files exist** before running bulk deletes. **`Program.cs` fails startup** (throws) if `REFRESH=true` or the domain DB is empty but the CSV folder cannot be resolved or `SeedAsync` throws — so Dokploy/logs show a hard error instead of serving an all-zero dashboard. Search paths include `ContentRootPath`, `AppContext.BaseDirectory`, `Directory.GetCurrentDirectory()`, `/app/docs/...`, and `/app/publish/docs/...`.
- **Publish:** `Haven-for-Her-Backend.csproj` includes `<Content Include="docs\lighthouse_csv_v7\**\*.csv" CopyToPublishDirectory="PreserveNewest" />` so `dotnet publish` / typical images carry CSVs; custom buildpacks must preserve that output.
- **Content:** United States–based sites and addresses; monetary rows use **`USD`** (legacy PHP amounts were converted in the generator at **58 PHP = 1 USD**). Supporters, donations, allocations, in-kind lines, and social posts are expanded ~**1.5×** for demos; regenerate with:
  `python scripts/localize_us_expand_seed_csv.py` (repo root).
- **ML:** `ml-pipelines/serve.py` reads the same CSVs. `_csv()` normalizes **snake_case** CSV headers to **PascalCase** so feature code matches PostgreSQL `fetch_data` when `DATABASE_URL` is unset.

Auth is cookie-based: HttpOnly, SameSite=Lax, Secure, 7-day sliding expiration. `GET /api/auth/me` returns `{ isAuthenticated, userName, email, roles[] }`.

Seeded role accounts are created by `AuthIdentityGenerator` on startup (if they don't already exist). **All credentials are configurable via environment variables** — no passwords are hardcoded in committed source. Dev defaults are used only when the env vars are absent.

| Role | Email env var | Password env var |
|---|---|---|
| Admin | `GenerateDefaultIdentityAdmin__Email` | `GenerateDefaultIdentityAdmin__Password` |
| Counselor | `GenerateDefaultIdentityCounselor__Email` | `GenerateDefaultIdentityCounselor__Password` |
| Donor | `GenerateDefaultIdentityDonor__Email` | `GenerateDefaultIdentityDonor__Password` |
| Supporter accounts (CSV seed) | — | `SeedSupporterPassword` |

Full table, dev defaults, and MFA notes: [`docs/demo-credentials.md`](docs/demo-credentials.md).

The counselor account maps to the CSV caseload for `SW-15` (residents C0043, C3116, C9025, C3204 — 162 sessions, 69 visitations in the seed data).

Roles currently defined: `Admin`, `Financial`, `Counselor`, `SocialMedia`, `Employee`, `Donor`, `Survivor`.

**Key backend files:**
- `Data/HavenForHerBackendDbContext.cs` — domain EF context with 18 DbSets + `OnModelCreating` (15 explicit FK relationships, `Cascade`/`SetNull` delete behaviors)
- `Data/AuthIdentityDbContext.cs` — identity EF context
- `Data/AuthRoles.cs` / `AuthPolicies.cs` — role and policy name constants
- `Infrastructure/SecurityHeaders.cs` — CSP middleware
- `Controllers/AuthController.cs` — `/api/auth/me`, external login, logout
- `Controllers/DonationsController.cs` — `POST /api/donations` (auth) and `POST /api/donations/anonymous`; `DonationRequest.CurrencyCode` defaults to **`USD`** when omitted; `DonationType` may be omitted (defaults to **Monetary**). Other types must be sent explicitly when used. `isRecurring` (default **false**) stores donor intent only—**no automated billing** in this API.
- `Controllers/DonorController.cs` — `GET /api/donor/dashboard` returns `givingTotalsByCurrency` (`{ currencyCode, total }[]` for donations with an amount, sorted by currency, no FX conversion).
- `Controllers/PublicController.cs` — `GET /api/public/impact` returns aggregate counts, **`liveProgramOutcomes`** (avg general health score and education progress from latest records per **Active** resident), **`donationImpact`** (illustrative USD per resident-week from trailing-12-month monetary USD, with a sample `$15` coverage percent), and **`latestSnapshot`** with **`displaySummaryText`** (prefers live DB copy over static CSV summary). Published snapshots are limited to `published_at <= UTC today`; placeholder CSV rows with zero metrics are seeded `is_published=false`.
- `Controllers/FinancialController.cs` — `GET /api/financial/dashboard` returns `totalMonetaryUsd` and `totalInKindValueUsd` (aggregate `Amount` / `EstimatedValue` from donations).
- `Controllers/AdminDashboardController.cs` — `GET /api/admin/dashboard` **`financial`** quick totals, **`donationsByType`**, **`topCampaigns`**, and **`recurringVsOneTime`** use two consecutive **rolling 30-day** windows of donations; **monetary USD totals** sum only **`DonationType == Monetary`** rows with **`Amount`**. (Avoids `$0` when seed data has no gifts in the current calendar month.)

### Frontend Structure
Vite + React app under `frontend/Haven-for-Her/`. Uses Tailwind CSS 4 + shadcn/ui for styling. Routing, API client, and forms stack are per the build plan (see `BUILDPROMPT.md`). **Routes** are **lazy-loaded** via `React.lazy` + `import()` in [`App.tsx`](frontend/Haven-for-Her/src/App.tsx); the route tree is wrapped in **`Suspense`** with [`RoutePageFallback`](frontend/Haven-for-Her/src/components/RoutePageFallback.tsx). **`/login`** is wrapped in [`GuestOnlyRoute`](frontend/Haven-for-Her/src/components/GuestOnlyRoute.tsx) so authenticated users are sent to **`/account`**. **`CookieConsent`** stays **outside** `Suspense` so it is not blocked by chunk loading. **Nav:** [`components/Navbar.tsx`](frontend/Haven-for-Her/src/components/Navbar.tsx) — primary links inline from `md+`; **Account** dropdown (email, role-gated routes, log out) on desktop; **mobile** menu is a left **Sheet** (Explore + Account sections) instead of horizontal link scrolling.

### Design System
All visual design follows `STYLE_GUIDE.md` (the Bloom theme). Design context and principles live in `.impeccable.md`. Key points:
- **Fonts:** Fraunces (headings) + Nunito (body), loaded via Google Fonts `<link>` tags
- **Palette:** Lavender/Sage/Plum/Blush/Cream — all defined as oklch values in `:root` CSS variables
- **Sage green is `#4E7842`** (darkened from original `#7A9E70` to pass WCAG AA contrast)
- **Implementation:** Tailwind utility classes + shadcn components only — no inline styles, no custom CSS, no `@apply`
- **Light mode only** — no `.dark` block, no `dark:` variants
- **Motion:** moderate, all wrapped in `motion-safe:`, no bounce/elastic easing

### Agent skills (layout and redundancy)

| Location | Role |
|---|---|
| **`skills-lock.json`** | Records packages installed via **`npx skills add`** (or equivalent) from curated registries (e.g. `anthropics/skills`). Only lists vendor skills the installer manages. |
| **`.agents/skills/`** | Canonical install target for **`frontend-design`** (from the lock file). |
| **`.claude/skills/`** | Symlinks into `.agents/skills/` so Claude Code discovers skills without duplicating files. Do not copy skill content here by hand. |

**Not redundant:** `frontend-design` exists once under `.agents/skills/`; `.claude/skills/frontend-design` is a symlink.

If a symlink breaks on clone (e.g. Windows), recreate: from `.claude/skills/`, point `frontend-design` at `../../.agents/skills/frontend-design`.


### CORS / Port Configuration
The backend CORS policy allows credentials from `FrontendUrls` (comma-separated) or `FrontendUrl` and defaults to `https://localhost:5173`. **Production:** include the public SPA origin (e.g. `https://havenforher.example.com`) in `FrontendUrls` or credentialed browser requests from that origin will fail CORS. Vite is configured to use port **5173** and proxy `/api` to the backend at `https://localhost:7229`.

## Production Deployment (Dokploy + Cloudflare Tunnel)

The project is deployed to a self-hosted **Dokploy** instance. External HTTPS is handled entirely by a **Cloudflare Tunnel** (`cloudflared` container) — the backend and frontend containers only receive plain HTTP.

### Services

| Dokploy Service | Type | Build Path |
|---|---|---|
| `frontend` | GitHub → Railpack | `frontend/Haven-for-Her` |
| `backend` | GitHub → Railpack | `backend/Haven-for-Her-Backend` |
| PostgreSQL 18 | Docker image | — |
| `cloudflared` | Docker image | — |
| `ml-pipeline` | GitHub → Railpack | `ml-pipelines/` |

### TLS / HTTPS Handling
- **Cloudflare** terminates TLS at the edge and forwards plain HTTP to the Dokploy containers via the tunnel.
- **`UseHttpsRedirection()` and `UseHsts()` are intentionally omitted** from the ASP.NET middleware pipeline — adding them behind Cloudflare causes redirect loops.
- **`UseForwardedHeaders()`** uses `ForwardedHeadersOptions` with `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Forwarded-Host`; **`KnownIPNetworks` and `KnownProxies` are cleared** so headers from Docker/Cloudflare are not ignored.
- If OAuth still builds `redirect_uri=http://...` (last hop to the container is often plain HTTP), set **`PublicBaseUrl=https://<your-api-host>`** on the backend (Dokploy **Environment**). Middleware upgrades `http`→`https` for that host so Google accepts the callback.
- Dokploy domain entries use `https: false` / `certificateType: none` since Cloudflare handles certs.

### Environment Variables
- Backend and frontend env vars are set in each Dokploy app's **Environment** tab.
- See `backend/.env.production.example` and `frontend/.env.production.example` for templates.
- DB connection strings use standard Npgsql format (`Host=...;Database=...;Username=...;Password=...`) pointing to the internal Dokploy service hostname.
- **Backend → ML:** set **`MlService__BaseUrl=http://<ml-service-hostname>:5050`** on the **backend** app (use the internal Docker/Dokploy service name for the ML container, not `localhost`).

### ML pipeline service (`ml-pipelines/` — models & persistence)

`*.joblib` files are **gitignored** (see repo `.gitignore`), so Railpack images often ship with **only** `models/.gitkeep`. The Flask app loads from **`/app/ml-pipelines/models`** (see `ml-pipelines/serve.py` / `Dockerfile` `WORKDIR`). A 503 on `/api/ml/...` with `"Model not trained yet."` usually means **that directory is empty in the running container**.

**Dokploy — persistent volume (recommended)**

1. Open the **`ml-pipeline`** (or equivalent) application → **Volumes** (or advanced storage, depending on Dokploy version).
2. Add a **named volume** (or bind mount) whose **container path** is exactly **`/app/ml-pipelines/models`**.
3. Redeploy so the mount applies. The image’s empty `models/` layer is replaced by the volume contents.

**Populate models once**

- **Copy from your machine:** build `*.joblib` locally (or from CI), `scp` them to the VPS, then copy into the volume (e.g. `docker run --rm -v <volume_name>:/data -v $(pwd):/src alpine cp /src/*.joblib /data/`) or use **Dokploy’s terminal** into the ML container and upload via a method your host provides.
- **Train on the server:** in the ML container shell (e.g. **Docker Terminal** in Dokploy), run:
  - `cd /app/ml-pipelines`
  - With **Postgres** (same data as prod): set **`DATABASE_URL`** on the ML service (Dokploy **Environment**) to the internal Postgres URL, then `python train.py` (all models) or `python train.py incident_risk` (one model). Writes go to `MODEL_DIR` → **`/app/ml-pipelines/models`** and persist if that path is a volume.
  - **CSV-only** training: provide CSVs (e.g. mount `lighthouse_csv_v7` or set **`ML_CSV_DIR`**) and run with **`FLASK_ENV=development`** so `serve.py` allows CSV reads (production mode blocks CSV in `_csv()`).

**Social ML (`/api/ml/social-media/predict`):** `POST` body must include a realistic **`captionLength`** (characters). If **`captionLength` is under 20**, the service returns a low placeholder probability and **`contentInsufficient: true`** instead of running the classifier on padded defaults. **`GET /api/ml/social-media/recommendations`** adds **`recommendedCtaLabel`** and **`historicalDonationDriverRate`** (camelCase via `to_camel`).

**Safehouse outcomes (`/api/ml/safehouse-outcomes`):** Each row compares **predicted vs recorded** **`AvgEducationProgress`** for the **same** latest month per safehouse (`comparisonMonthStart`). The regressor uses lagged funding, **`ActiveResidents`**, and **`LaggedEducationProgress`** (prior month). Deploy updated `*.joblib` after `python train.py safehouse_outcomes` so serving matches `serve._safehouse_features`; predictions are **clipped to 0–100**.

Repo **`docker-compose.yml`** mounts **`ml-models`** → **`/app/ml-pipelines/models`** for local stacks (fixed from the old incorrect `/app/models` path).

### Auto-Deploy
Both frontend and backend have `autoDeploy: true` on the `main` branch — pushing to `main` triggers a rebuild.

## Agent Guidance Files

All agent guidance files live at the **project root** for auto-discovery:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Agent onboarding — commands, architecture, key files |
| `.impeccable.md` | Design context — brand personality, audiences, design principles |
| `STYLE_GUIDE.md` | Bloom theme — palette, typography, components, anti-patterns |

## Build Plan
A detailed feature roadmap lives in `docs/BUILDPROMPT.md`. **Do NOT read this file into context unless the user explicitly asks for it** (e.g. "check the build plan", "look at the roadmap"). It is ~870 lines and significantly increases token usage when loaded unnecessarily.
