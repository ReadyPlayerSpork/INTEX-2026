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

### Frontend (`frontend/Haven-for-Her/`)
```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

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

Auth is cookie-based: HttpOnly, SameSite=Lax, Secure, 7-day sliding expiration. `GET /api/auth/me` returns `{ isAuthenticated, userName, email, roles[] }`.

The default seeded admin is `admin@havenforher.local` / `admin!haven4her` (overridable via `GenerateDefaultIdentityAdmin` config).

Seeded role accounts (created by `AuthIdentityGenerator` on every fresh DB):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@havenforher.local` | `admin!haven4her` |
| Counselor | `counselor@havenforher.local` | `Counselor!haven4her` |

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

### Frontend Structure
Vite + React app under `frontend/Haven-for-Her/`. Uses Tailwind CSS 4 + shadcn/ui for styling. Routing, API client, and forms stack are per the build plan (see `BUILDPROMPT.md`). **Routes** are **lazy-loaded** via `React.lazy` + `import()` in [`App.tsx`](frontend/Haven-for-Her/src/App.tsx); the route tree is wrapped in **`Suspense`** with [`RoutePageFallback`](frontend/Haven-for-Her/src/components/RoutePageFallback.tsx). **`CookieConsent`** stays **outside** `Suspense` so it is not blocked by chunk loading. **Nav:** [`components/Navbar.tsx`](frontend/Haven-for-Her/src/components/Navbar.tsx) — primary links inline from `md+`; **Account** dropdown (email, role-gated routes, log out) on desktop; **mobile** menu is a left **Sheet** (Explore + Account sections) instead of horizontal link scrolling.

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
