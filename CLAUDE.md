# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Haven for Her** — A full-stack case management and donor platform for a sexual assault survivor assistance nonprofit. Built by BYU INTEX Section 2, Group 15.

## Commands

### Frontend (`frontend/Haven for Her/`)
```bash
npm run dev        # Vite dev server (defaults to port 5173)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (`backend/Haven-for-Her-Backend/`)
```bash
dotnet run         # Run on http://localhost:5064 / https://localhost:7229
dotnet build       # Build only
dotnet watch       # Hot-reload dev server
```

Swagger UI is available in development at `/swagger`.

## Architecture

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript ~6.0, Vite 8, Bootstrap 5.3 (Sass + `@popperjs/core`) |
| Backend | ASP.NET Core / .NET 10 |
| ORM | Entity Framework Core 10 |
| Auth | ASP.NET Identity + Google OAuth, cookie-based sessions |
| Dev DB | SQLite (two separate files) |
| Prod DB | PostgreSQL (planned) |

### Backend Structure
The backend uses **two separate DB contexts**:
- `HavenForHerBackendDbContext` — 17 domain models (Resident, Donation, Safehouse, etc.)
- `AuthIdentityDbContext` — ASP.NET Identity (users, roles)

Auth is cookie-based: HttpOnly, SameSite=Lax, Secure, 7-day sliding expiration. `GET /api/auth/me` returns `{ isAuthenticated, userName, email, roles[] }`.

The default seeded admin is `admin@rootkit.local` / `Rootkit2026!Admin` (overridable via `GenerateDefaultIdentityAdmin` config).

Roles currently defined: `Admin`, `Customer`. The build plan expands these to: Admin, Financial, Counselor, SocialMedia, Employee, Donor, Survivor.

**Key backend files:**
- `Data/HavenForHerBackendDbContext.cs` — domain EF context with all 17 models
- `Data/AuthIdentityDbContext.cs` — identity EF context
- `Data/AuthRoles.cs` / `AuthPolicies.cs` — role and policy name constants
- `Infrastructure/SecurityHeaders.cs` — CSP middleware
- `Controllers/AuthController.cs` — `/api/auth/me`, external login, logout

### Frontend Structure
Vite + React app under `frontend/Haven for Her/` with **Bootstrap 5.3** (see `package.json`). Routing, API client, and forms stack are still per the build plan (see `BUILDPROMPT.md`).

### Agent skills (layout and redundancy)

| Location | Role |
|---|---|
| **`skills-lock.json`** | Records packages installed via **`npx skills add`** (or equivalent) from curated registries (e.g. `anthropics/skills`). Only lists vendor skills the installer manages. |
| **`.agents/skills/`** | Canonical install target for **`frontend-design`** (from the lock file). |
| **`.claude/skills/`** | Symlinks into `.agents/skills/` or `.cursor/skills/` so Claude Code discovers skills without duplicating files. Do not copy skill content here by hand. |
| **`.cursor/skills/`** | Project-authored skills (e.g. **`bootstrap-5-css`**) used by Cursor and linked from `.claude/skills/` for the same content. |

**Not redundant:** `frontend-design` exists once under `.agents/skills/`; `.claude/skills/frontend-design` is a symlink. **`bootstrap-5-css`** is project-owned, not in `skills-lock.json`, and is symlinked as `.claude/skills/bootstrap-5-css` → `.cursor/skills/bootstrap-5-css`.

Re-running the skills installer may refresh vendor skills; it should not remove `.cursor/skills/`. If a symlink breaks on clone (e.g. Windows), recreate: from `.claude/skills/`, point `frontend-design` at `../../.agents/skills/frontend-design` and `bootstrap-5-css` at `../../.cursor/skills/bootstrap-5-css`.

### Frontend styling (Bootstrap) — required for Claude

When editing **layout, components, or CSS** in `frontend/Haven for Her/` (including `.tsx`, `.scss`, and global styles):

1. **Read and follow** the project skill **`bootstrap-5-css`** at **`.cursor/skills/bootstrap-5-css/SKILL.md`** (same file as `.claude/skills/bootstrap-5-css`): Vite + Sass setup, utilities-first workflow, when to load Bootstrap JS.
2. For exact markup and options, prefer **Bootstrap’s MDX source** under the same release as our `bootstrap` dependency—browse [`twbs/bootstrap` → `site/src/content/docs` @ v5.3.8](https://github.com/twbs/bootstrap/tree/v5.3.8/site/src/content/docs) or fetch raw `.mdx` files (pattern documented in that skill). Use [getbootstrap.com/docs/5.3/](https://getbootstrap.com/docs/5.3/getting-started/introduction/) when you need the rendered site.

Do **not** invent Bootstrap class names or patterns from memory; align with those sources.

**vs `frontend-design`:** The installed **`frontend-design`** skill pushes distinctive typography and non-generic visuals. For this app, **Bootstrap structure and components take precedence** (grid, utilities, documented markup). Apply **creative direction** from `frontend-design` *inside* that boundary—e.g. CSS variables, font choices loaded via Bootstrap/theming, motion, and atmosphere—without replacing Bootstrap patterns with one-off layout systems or ignoring accessibility.

### CORS / Port Configuration
The backend CORS policy allows credentials from `FrontendUrl` config (defaults to `http://localhost:3000`). Vite defaults to port **5173** — keep these in sync via environment config or the Vite proxy setting.

## Build Plan
The project has a detailed 7-phase roadmap in `BUILDPROMPT.md`. The backend auth skeleton is complete; the frontend has not yet been built. Phase 0 covers foundational scaffolding (routing, auth context, API client, environment config) before any feature work begins.
