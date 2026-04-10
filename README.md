# Haven for Her

A full-stack case management and donor platform for a sexual assault survivor assistance nonprofit.

Built by **BYU INTEX Section 2, Group 15**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS, shadcn/ui |
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

### 1. Backend

```bash
cd backend/Haven-for-Her-Backend
cp .env.example .env           # Fill in any values you need (Google OAuth, etc.)
dotnet run                     # Runs on http://localhost:5064 / https://localhost:7229
```

Other backend commands:

```bash
dotnet build       # Build only
dotnet watch       # Hot-reload dev server
dotnet test        # Run xUnit tests (from backend/Haven-for-Her-Backend.Tests/)
```

In development, the OpenAPI JSON document is served at `/openapi/v1.json` (`Microsoft.AspNetCore.OpenApi`). There is no bundled Swagger UI; use that URL with an OpenAPI client or external UI if needed.

### 2. Frontend

```bash
cd frontend/Haven-for-Her
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend at `https://localhost:7229`, so both must be running for the app to work.

Other frontend commands:

```bash
npm run build      # Production build (tsc + vite)
npm run lint       # ESLint
npm run preview    # Preview production build
```

### 3. ML Service (future)

```bash
cd ml-pipelines
pip install -r requirements.txt
python serve.py                # Flask/FastAPI microservice (not yet implemented)
```

---

## Project Structure

```text
INTEX-2026/
|-- frontend/
|   `-- Haven-for-Her/                  # React + Vite app (Tailwind + shadcn/ui)
|-- backend/
|   |-- Haven-for-Her-Backend/          # ASP.NET Core API
|   `-- Haven-for-Her-Backend.Tests/    # xUnit test project
`-- ml-pipelines/                       # ML notebooks & model serving (future)
```

### Backend

Two separate EF Core DB contexts:
- `HavenForHerBackendDbContext` - 17 domain models (Resident, Donation, Safehouse, etc.)
- `AuthIdentityDbContext` - ASP.NET Identity (users, roles)

Auth is cookie-based: HttpOnly, SameSite=Lax, Secure, 7-day sliding expiration.

`GET /api/auth/me` returns `{ isAuthenticated, userName, email, roles[] }`.

Default seeded accounts are configured via environment variables — see [`docs/demo-credentials.md`](docs/demo-credentials.md) and `backend/.env.example`.

Roles: `Admin`, `Financial`, `Counselor`, `SocialMedia`, `Employee`, `Donor`, `Survivor`

---

## Development Notes

- The backend CORS policy allows credentials from `FrontendUrl` (defaults to `http://localhost:5173`). Keep it in sync with your Vite dev server or the configured proxy.
- See `BUILDPROMPT.md` for the full feature roadmap.
