# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Haven for Her** — A full-stack case management and donor platform for a sexual assault survivor assistance nonprofit. Built by BYU INTEX Section 2, Group 15.

## Commands

### Frontend (`frontend/haven-for-her/`)
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
| Frontend | React 19, TypeScript ~6.0, Vite 8 |
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

Roles currently defined: `Admin`, `Financial`, `Counselor`, `SocialMedia`, `Employee`, `Donor`, `Survivor`.

**Key backend files:**
- `Data/HavenForHerBackendDbContext.cs` — domain EF context with all 17 models
- `Data/AuthIdentityDbContext.cs` — identity EF context
- `Data/AuthRoles.cs` / `AuthPolicies.cs` — role and policy name constants
- `Infrastructure/SecurityHeaders.cs` — CSP middleware
- `Controllers/AuthController.cs` — `/api/auth/me`, external login, logout

### Frontend Structure
Currently a lightly customized Vite scaffold with Bootstrap, React Router, and a simple auth connectivity check in `App.tsx`. The build plan (see `BUILDPROMPT.md`) calls for continuing with plain React patterns, Bootstrap styling, and a typed API client layer.

### CORS / Port Configuration
The backend CORS policy allows credentials from `FrontendUrls` / `FrontendUrl` config and defaults to `http://localhost:5173`. Vite is configured to use port **5173** and proxy `/api` to the backend at `https://localhost:7229`.

## Build Plan
The project has a detailed roadmap in `BUILDPROMPT.md`. The backend auth skeleton is complete, and the frontend now has a basic scaffold plus dev proxy wiring. Phase 0 still covers the foundational work needed before feature-heavy pages are built.
