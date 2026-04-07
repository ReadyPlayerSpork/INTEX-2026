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

Roles currently defined: `Admin`, `Customer`. The build plan expands these to: Admin, Financial, Counselor, SocialMedia, Employee, Donor, Survivor.

**Key backend files:**
- `Data/HavenForHerBackendDbContext.cs` — domain EF context with all 17 models
- `Data/AuthIdentityDbContext.cs` — identity EF context
- `Data/AuthRoles.cs` / `AuthPolicies.cs` — role and policy name constants
- `Infrastructure/SecurityHeaders.cs` — CSP middleware
- `Controllers/AuthController.cs` — `/api/auth/me`, external login, logout

### Frontend Structure
Currently a bare Vite scaffold — no routing, no API client, no component library exists yet. The build plan (see `BUILDPROMPT.md`) calls for adding React Router, TanStack Query, React Hook Form + Zod, and a typed API client layer.

### CORS / Port Configuration
The backend CORS policy allows credentials from `FrontendUrl` config (defaults to `http://localhost:3000`). Vite defaults to port **5173** — keep these in sync via environment config or the Vite proxy setting.

## Build Plan
The project has a detailed 7-phase roadmap in `BUILDPROMPT.md`. The backend auth skeleton is complete; the frontend has not yet been built. Phase 0 covers foundational scaffolding (routing, auth context, API client, environment config) before any feature work begins.
