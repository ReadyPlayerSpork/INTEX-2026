# Haven for Her

A full-stack case management and donor platform for a sexual assault survivor assistance nonprofit.

Built by **BYU INTEX Section 2, Group 15**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Backend | ASP.NET Core / .NET 10 |
| ORM | Entity Framework Core 10 |
| Auth | ASP.NET Identity + Google OAuth, cookie-based sessions |
| Dev DB | SQLite |
| Prod DB | PostgreSQL |

---

## Getting Started

### Prerequisites

- Node.js 20+
- .NET 10 SDK

### Frontend

```bash
cd "frontend/Haven for Her"
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

Other frontend commands:
```bash
npm run build      # Production build (tsc + vite)
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend

```bash
cd backend/Haven-for-Her-Backend
dotnet run         # Runs on http://localhost:5064 / https://localhost:7229
```

Other backend commands:
```bash
dotnet build       # Build only
dotnet watch       # Hot-reload dev server
```

Swagger UI is available in development at `/swagger`.

---

## Project Structure

```
INTEX-2026/
├── frontend/
│   └── Haven for Her/     # React + Vite app
└── backend/
    └── Haven-for-Her-Backend/   # ASP.NET Core API
```

### Backend

Two separate EF Core DB contexts:
- `HavenForHerBackendDbContext` — 17 domain models (Resident, Donation, Safehouse, etc.)
- `AuthIdentityDbContext` — ASP.NET Identity (users, roles)

Auth is cookie-based: HttpOnly, SameSite=Lax, Secure, 7-day sliding expiration.

`GET /api/auth/me` returns `{ isAuthenticated, userName, email, roles[] }`.

Default seeded admin: `admin@rootkit.local` / `Rootkit2026!Admin`

Roles: `Admin`, `Financial`, `Counselor`, `SocialMedia`, `Employee`, `Donor`, `Survivor`

---

## Development Notes

- The backend CORS policy allows credentials from `FrontendUrl` (defaults to `http://localhost:3000`). Keep in sync with your Vite port via environment config or the Vite proxy setting.
- See `BUILDPROMPT.md` for the full 7-phase feature roadmap.
