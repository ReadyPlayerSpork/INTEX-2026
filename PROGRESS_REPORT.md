# INTEX W26 — Progress & Rubric Audit Report

**Repository:** [ReadyPlayerSpork/INTEX-2026](https://github.com/ReadyPlayerSpork/INTEX-2026)  
**Audit baseline:** local `main` at **`86b9917`** (after `git pull origin main`, April 8, 2026)  
**Rubric source:** `INTEX W26 Case.md` (BYU INTEX W26)

**Scope:** Read-only audit. No application code was modified for this report.  
**Limitations:** FigJam, Learning Suite submissions, videos, and live deployment URLs were not accessible from this environment. Local runtime and Lighthouse scores were not executed in this pass (see § Methods).

---

## Methods (how this audit was done)

- Compared **implemented routes, controllers, and key UI** against **IS 413 / IS 414 / IS 455** text in `INTEX W26 Case.md`.
- **IS 401** items (FigJam, sprint screenshots, burndown, user testing notes) are **process deliverables**; only **repo-adjacent artifacts** (e.g. `Figma Wireframes/`, `BUILDPROMPT.md`) were checked where applicable.
- **No browser automation** against a team deployment (URL not provided). **No Lighthouse run** in this session.
- Stash note: if you still have `stash@{0}: audit: temp stash before pull`, compare it to current `CsvDataSeeder.cs` before `git stash pop` — the audit reflects **only** the committed tree at `86b9917`.

---

## Checkpoint 1 — IS 401: Project Management & Systems Design

*Rubric: FigJam, personas, journey map, MoSCoW, backlog, sprint backlogs, burndown, wireframes, daily submissions.*

### Grade (evidence-based, repo-only): **Incomplete / Not gradable from repository**

| Criterion (from case) | Status in repo | Notes |
|----------------------|----------------|--------|
| FigJam board link & daily sections | **Not in repo** | Expected in Learning Suite / external FigJam. |
| Personas, journey map, problem statement, MoSCoW, backlog | **Not verified** | May exist only in FigJam or docs not committed. |
| Wireframes (3 screens, desktop) | **Partial** | `Figma Wireframes/` exists at repo root — suggests design work exists; **fidelity vs. “Monday deliverable”** not validated here. |
| Sprint screenshots / burndown | **Not in repo** | Typically screenshots in submission, not git. |

### Strengths

- Project has **structured agent/docs** (`CLAUDE.md`, `BUILDPROMPT.md`, `STYLE_GUIDE.md`) indicating **ongoing planning and consistency**.

### Gaps / risks for IS 401

- Graders score **submission + FigJam + screenshots**; **none of that is provable from code alone**. Team should confirm FigJam link and nightly screenshots are complete before Friday.

### Checkpoint 1 summary grade (instructional)

| Area | Grade (A–F / narrative) |
|------|-------------------------|
| IS 401 (repo-verifiable only) | **I (incomplete evidence)** — wireframe folder present; core PM artifacts not in git. |

---

## Checkpoint 2 — IS 413: Enterprise Application Development

*Rubric: .NET 10 + React/TS/Vite, PostgreSQL, deployed app+DB, required pages/features, validation, polish.*

### Grade: **Strong partial → approaching complete** (feature coverage high; some IS413 wording gaps)

#### Technical stack (case § IS 413)

| Requirement | Evidence | Status |
|-------------|----------|--------|
| .NET / C# backend | `backend/Haven-for-Her-Backend` | **Met** |
| React + TypeScript + Vite | `frontend/Haven-for-Her` | **Met** |
| PostgreSQL (relational) | `Program.cs` uses `UseNpgsql` for domain + identity contexts | **Met** (dev/prod via config) |
| Deployed app + DB | Dokploy notes in `CLAUDE.md` | **Assumed met for prod**; **not re-verified** in this audit (no live URL test). |

#### Public (non-authenticated)

| Page / feature | Evidence | Status |
|----------------|----------|--------|
| Home / landing | `HomePage`, route `/` | **Met** |
| Impact / donor-facing dashboard | `ImpactPage`, `/impact`; public APIs e.g. `PublicController` | **Met** (verify exact “dashboard” copy vs. case wording) |
| Login | `LoginPage`, `/login` | **Met** |
| Privacy + cookie consent | `PrivacyPage`, `CookieConsent` | **Met** (functional depth: see IS 414) |

#### Admin / staff portal (authenticated)

| Feature (case wording) | Evidence | Status |
|------------------------|----------|--------|
| Admin dashboard / command center | `AdminDashboardPage`, `AdminDashboardController`, portal layouts | **Met** |
| Donors & contributions | Financial routes, `FinancialManagementController`, donor pages, modals | **Strong partial → Met** (confirm all **donation types** + **allocations** UX end-to-end) |
| Caseload inventory | `CaseloadPage`, `CaseloadController`, `ResidentFormModal`, profile | **Met** (filter/search present in API + UI patterns) |
| Process recording | Counselor sessions, `CounselorController`, session detail | **Strong partial** (verify **full CRUD** + **per-resident chronological** view matches case) |
| Home visitation & case conferences | `VisitationsPage`, `CaseConferencesPage` | **Partial → Strong** (case conferences page exists; **match case’s combined section** in demo) |
| Reports & analytics | `ReportsPage`, `ReportsController`, `AnalyticsPage`, charts | **Strong partial** (aggregations exist; **annual accomplishment format** alignment not fully verified) |

#### Misc

- Role-specific portals (Financial, Counselor, Social, Admin) appear in `App.tsx` with `ProtectedRoute` — **supports** case’s “additional pages.”

### Gaps / risks for IS 413

- **Video demo** must walk each **required** bullet explicitly (case is long; graders use video).
- **Validation & error handling:** present in places; **not line-audited** across every form in this report.
- **Pagination** on large lists: verify on caseload, donations, reports where datasets grow.

### Checkpoint 2 summary grade

| Area | Grade |
|------|--------|
| IS 413 implementation (code review) | **B+** — broad coverage; a few case-wording details need explicit demo proof. |

---

## Checkpoint 3 — IS 414: Security

*Rubric: HTTPS, redirects, Identity, password policy, RBAC, delete confirmation, secrets, privacy, cookie consent, CSP header, deployment, extras (OAuth, MFA, HSTS, etc.).*

### Grade: **Partial credit likely; several explicit case conflicts**

#### Confidentiality — HTTPS / redirect

| Requirement | Evidence | Status |
|-------------|----------|--------|
| HTTPS for public connections | Production: Cloudflare TLS per `CLAUDE.md` | **Met (prod architecture)** |
| Redirect HTTP → HTTPS | `Program.cs` intentionally **omits** `UseHttpsRedirection` behind Cloudflare | **Case asks redirect** — **document in video** as architectural exception or add edge redirect; **grader risk** |
| Local dev | Vite `mkcert` + `https://localhost:5173` | **Helps**; must match cookie `Secure` |

#### Authentication & password policy

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Username/password | Identity + `AuthController` / login flow | **Met** |
| Stricter `PasswordOptions` | `Program.cs` (e.g. `RequiredLength = 14`, relaxed char classes) | **Met “non-default”** — case says **graded vs lab instruction**, not MS docs; **confirm matches class lab** |
| Public can browse home (and appropriate pages) | Routes + `ProtectedRoute` | **Met** |
| APIs protected | `[Authorize]` on controllers; public endpoints for impact/login | **Mostly met** — spot-check any new endpoints |

#### RBAC

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Admin CUD | Rubric table wording: “Only **admin** user can CUD”; case body also allows a **staff** role distinct from admin | **Implementation:** `Financial`, `Counselor`, `SocialMedia`, and `Admin` portals expose create/update flows (`App.tsx` role gates). **Risk:** TAs may expect **Admin-only** CUD unless the **IS414 video** clearly frames Financial/Counselor as authorized staff (aligned with “employee role” option in the case). |
| Donor sees own history | `DonorController`, donor dashboard | **Met (pattern)** |

#### Integrity — delete confirmation

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Confirmation before delete | `PartnersPage` and `SafehousesPage` use a **two-step** pattern (`Delete` → `Confirm` / `Cancel`) before `api.delete` | **Met** for those flows |
| Other destructive actions | Repo grep shows **only** those two `api.delete` call sites in `*.tsx`; role removal and other mutations use different patterns | **Spot-check in video** if new delete endpoints are added elsewhere |

#### Credentials

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Secrets not in repo | `.env.example`, `.gitignore` patterns | **Met (pattern)** — **ensure** no real `.env` committed |

#### Privacy

| Requirement | Evidence | Status |
|-------------|----------|--------|
| Privacy policy linked | Footer / `PrivacyPage` | **Met** |
| GDPR cookie consent | `CookieConsent` | **Case: “fully functional”** — **must state in video** if cosmetic vs. blocking non-essential |

#### CSP (header)

| Requirement | Evidence | Status |
|-------------|----------|--------|
| CSP **HTTP header** | `SecurityHeaders.cs` sets `Content-Security-Policy` on **ASP.NET** responses (skipped for `/openapi` in Development) | **Partial risk** — case graders often inspect the **HTML document** response; if the SPA is served from a **separate static host**, document CSP may differ from API responses. **Confirm** DevTools on your **public site URL** and, if needed, add CSP at the **frontend CDN / hosting** layer. |

#### Availability

| Deployed publicly | Per `CLAUDE.md` | **Assumed** — confirm URL in submission |

#### Additional security features (case list)

| Feature | Evidence | Status |
|---------|----------|--------|
| Third-party auth (e.g. Google) | Google auth wired when ClientId/Secret set | **Partial** — **video** when keys absent locally |
| MFA | `SecuritySettingsPage` / account security | **Verify** + provide **three** grader accounts (admin no MFA, donor no MFA, MFA-enabled) per case |
| HSTS | `Program.cs` calls `AddHsts(...)` but **does not** call `UseHsts()`; comment explains omission behind Cloudflare Tunnel | **Implement at Cloudflare / edge** or **show HSTS** on responses in video; raw container HTTP will not send HSTS from this pipeline |
| Non-HttpOnly preference cookie | Need explicit cookie for React preference | **Not verified** in this pass |
| Sanitization / encoding | React default escaping; API validation | **Partial** — cite in video |

### Checkpoint 3 summary grade

| Area | Grade |
|------|--------|
| IS 414 (code + architecture review) | **B- to B** — Identity, stricter passwords, RBAC policies, rate limiting, forwarded headers, and **confirmed delete UX** on admin partner/safehouse deletes are solid. Remaining risks: **HTTP→HTTPS redirect (0.5 pt)**, **document-level CSP visibility**, **HSTS at edge**, **cookie consent** wording vs “fully functional,” and **video proof** for OAuth/MFA/extras. |

---

## Checkpoint 4 — IS 455: Machine Learning

*Rubric: Multiple end-to-end pipelines in `ml-pipelines/`, notebooks executable, deployment integration, business framing.*

### Grade: **Strong artifact presence; integration depth must be demo-proven**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Multiple notebooks in `ml-pipelines/` | Several `*.ipynb` + `requirements.txt` + `serve.py` | **Met (artifacts)** |
| API integration | `MlController.cs`, `mlApi.ts` | **Met (wiring exists)** |
| Full pipeline story per notebook | Needs TA execution “top to bottom” | **Not re-run here** |
| Prediction + explanation sections | Per-notebook narrative | **Spot-check** before submit |
| Deployment in app | Admin `AnalyticsPage` / ML UI | **Verify** predictions visible **in deployed** app |

### Checkpoint 4 summary grade

| Area | Grade |
|------|--------|
| IS 455 (repo structure + integration signals) | **B** — notebooks + backend ML controller + frontend API suggest **substantial work**; **final grade** depends on **notebook quality** and **live demo**. |

---

## Checkpoint 5 — Cross-cutting: Accessibility, performance, polish (IS 401 Thu / case Thursday)

*Thursday case items: OKR metric in app, Lighthouse a11y ≥ 90, responsive pages.*

| Item | Status in this audit |
|------|----------------------|
| OKR metric displayed | Not systematically verified (likely in dashboard/reports) |
| Lighthouse ≥ 90 all pages | **Not run** — **team must run before submit** |
| Responsive | App uses Tailwind + responsive patterns; **no per-page audit** |

### Checkpoint 5 summary grade

| Area | Grade |
|------|--------|
| Cross-cutting quality | **Incomplete (not measured)** — schedule Lighthouse + mobile pass. |

---

## Consolidated risk register (P0–P2)

| ID | Severity | Area | Issue |
|----|----------|------|--------|
| R1 | **P0** | IS 414 / dev UX | Vite proxy targets `https://localhost:7229`; backend must run **`dotnet run --launch-profile https`** or proxy fails → **502 login** (document for team + graders if demoing local). |
| R2 | **P1** | IS 414 | **HTTP→HTTPS redirect** and **HSTS** rubric vs **Cloudflare/no redirect in API** — **explain in video** or implement at edge. |
| R3 | **P1** | IS 414 | **MFA test accounts** (three credentials in Qualtrics) must match **final deliverable checklist** exactly. Any **new** delete endpoints need the same **Confirm** pattern as partners/safehouses. |
| R4 | **P1** | IS 401 Thu | **Lighthouse 90+** claimed — **must be measured** per page with evidence. |
| R5 | **P2** | IS 413 | Some case phrases (**all donation types**, **accomplishment report shape**) need **explicit** screen time in video. |

---

## Overall snapshot (instructor-facing narrative)

The codebase at **`86b9917`** presents a **credible, feature-rich INTEX implementation**: PostgreSQL + dual EF contexts, broad **RBAC**, **staff portals**, **financial management**, **counselor workflows**, **reports/analytics**, **ML notebooks**, and **ML API** wiring. **Security and grading risk** concentrate in **documented deployment TLS semantics** (redirect/HSTS), **cookie consent “functional”** wording, **delete confirmations**, and **video proof** for IS 414 partial items. **IS 401** and **Lighthouse** cannot be graded from the repository alone.

---

## Clarifying questions (optional follow-ups)

1. What is the **canonical public URL** (and branch name) you want graders to use?  
2. Will you demo **local** or **production** for IS 413 database persistence?  
3. Is **cookie consent** intended to be **blocking** for non-essential cookies or **informational** only? (Case allows either if honest in video.)  
4. Confirm **three grader accounts** exist per final checklist (admin no MFA, donor no MFA with history, MFA-enabled account).

---

*End of PROGRESS_REPORT.md — generated as part of a read-only INTEX audit.*
