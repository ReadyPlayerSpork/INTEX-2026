# INTEX Case Rubric Review

Repo-first audit of `INTEX W26 Case.md` against the current project tree in `INTEX-2026`.

Review rules used:
- Source of truth was the local repo only.
- A requirement was only marked `Met` when the repo contained direct evidence.
- Live-only items such as public deployment behavior, production TLS, redirects, CSP on the deployed HTML document, and Lighthouse scores were marked `Unverified from repo` unless the repo itself proved them.
- Verification performed in this pass:
  - Frontend build passed with `npm run build`.
  - Backend build passed with `dotnet build --no-restore`.
  - Full local runtime verification was limited because `backend/Haven-for-Her-Backend/appsettings.json` contains blank connection strings and no deployed URL was provided.

## 1. Consolidated Rubric

### IS 401 Daily Deliverables

| Section | Requirement | Points/Weight if stated | What counts as proof | Evidence found | Status | Gap/Risk |
|---|---|---:|---|---|---|---|
| IS 401 Monday | Identify Scrum Master and Product Owner | Part of Monday `6.5 pts` | FigJam/PM artifact naming team roles | No repo artifact found for team role assignment | Unverified from repo | Could exist only in FigJam/Learning Suite |
| IS 401 Monday | Create 2 realistic customer personas with justification | Part of Monday `6.5 pts` | Persona cards or write-up tied to target users | `.impeccable.md` has audience definitions, but no explicit two-persona deliverable with justification | Partially Met | Design context helps, but the required class artifact is not clearly present |
| IS 401 Monday | Journey map with current steps and pain points | Part of Monday `6.5 pts` | Journey map in FigJam/docs | No journey-map artifact found | Unverified from repo | Likely off-repo submission artifact |
| IS 401 Monday | Problem statement | Part of Monday `6.5 pts` | Written problem statement | Business framing exists in `BusinessIdea.md` and `docs/BUILDPROMPT.md` | Partially Met | Repo contains framing, but not a clearly labeled IS 401 problem statement |
| IS 401 Monday | MoSCoW table with all INTEX requirements, 5 nice-to-haves, and 1 rejected feature | Part of Monday `6.5 pts` | MoSCoW table artifact | No MoSCoW table found | Unverified from repo | High process-deliverable risk |
| IS 401 Monday | Product backlog with clear product goal and 12+ cards | Part of Monday `6.5 pts` | Backlog artifact or exported board | `docs/BUILDPROMPT.md` is a roadmap, not a 12-card backlog | Partially Met | Product direction exists, but the required backlog format is not evidenced |
| IS 401 Monday | Monday sprint backlog with 8+ cards, points, one owner each, screenshot before work | Part of Monday `6.5 pts` | Sprint board screenshot/export | No sprint backlog screenshot/export found | Unverified from repo | Likely off-repo artifact |
| IS 401 Monday | Burndown chart set up and used | Part of Monday `6.5 pts` | Burndown chart screenshot/export | No burndown artifact found | Unverified from repo | Likely off-repo artifact |
| IS 401 Monday | Three desktop wireframes for most important screens | Part of Monday `6.5 pts` | Wireframes or exported design artifacts | `Figma Wireframes/Landing Page`, `Figma Wireframes/Donor Page`, `Figma Wireframes/Admin Page` | Partially Met | Strong evidence of 3 target screens, but not the exact Monday submission format |
| IS 401 Tuesday | Tuesday sprint backlog with 8+ cards, points, one owner each, screenshot before work | Part of Tuesday `4 pts` | Sprint board screenshot/export | No Tuesday sprint artifact found | Unverified from repo | Likely off-repo artifact |
| IS 401 Tuesday | 3 screenshots of each of 3 AI-generated UI designs, 5 AI questions each, takeaways | Part of Tuesday `4 pts` | Screenshot set and notes | No explicit screenshot set or design comparison write-up found | Unverified from repo | Could exist outside git |
| IS 401 Tuesday | Design decision, justification, and 3 changes made to original AI output | Part of Tuesday `4 pts` | Written decision artifact | `STYLE_GUIDE.md`, `.impeccable.md`, and wireframes show design intent | Partially Met | Design system exists, but the required decision narrative is not clearly preserved |
| IS 401 Tuesday | Tech stack diagram with frontend/backend/database logos | Part of Tuesday `4 pts` | Diagram artifact | README lists stack, but no diagram found | Unverified from repo | Needs explicit deliverable proof |
| IS 401 Wednesday | Wednesday sprint backlog with 8+ cards, points, one owner each, screenshot before work | Part of Wednesday `4.5 pts` | Sprint board screenshot/export | No Wednesday sprint artifact found | Unverified from repo | Likely off-repo artifact |
| IS 401 Wednesday | Current-state screenshots of at least 5 pages in desktop and mobile | Part of Wednesday `4.5 pts` | Screenshot set | No screenshot set found in repo | Unverified from repo | Needs separate submission artifact |
| IS 401 Wednesday | One working page deployed to the cloud and persisting data | Part of Wednesday `4.5 pts` | Live URL or deployment proof plus DB persistence demo | App code supports persistence, but no live URL/proof in repo | Unverified from repo | Cannot confirm cloud deployment from repo alone |
| IS 401 Wednesday | Real user feedback session and 5 changes based on feedback | Part of Wednesday `4.5 pts` | Notes, transcript, or written findings | No user-testing notes found | Unverified from repo | Process-deliverable risk |
| IS 401 Wednesday | Updated burndown chart | Part of Wednesday `4.5 pts` | Burndown screenshot/export | No burndown artifact found | Unverified from repo | Process-deliverable risk |
| IS 401 Thursday | Thursday sprint backlog with 8+ cards, points, one owner each, screenshot before work | Part of Thursday `5 pts` | Sprint board screenshot/export | No Thursday sprint artifact found | Unverified from repo | Process-deliverable risk |
| IS 401 Thursday | Track and display one meaningful OKR metric in the app and explain why it matters | Part of Thursday `5 pts` | In-app metric plus explanation artifact | Metrics are displayed in `src/pages/admin/AdminDashboardPage.tsx` and `src/pages/admin/AnalyticsPage.tsx` | Partially Met | App has many metrics, but no explicit OKR framing or rationale artifact was found |
| IS 401 Thursday | Lighthouse accessibility score of at least 90 on every page | Part of Thursday `5 pts` | Lighthouse reports per page | No Lighthouse reports in repo | Unverified from repo | Must be measured, not inferred |
| IS 401 Thursday | Every page resizes appropriately for desktop and mobile | Part of Thursday `5 pts` | Responsive verification or screenshots | Many pages use responsive Tailwind classes such as `sm:` and `lg:` in `HomePage.tsx`, `PublicLayout.tsx`, `AdminDashboardPage.tsx` | Partially Met | Code is responsive-minded, but no page-by-page verification exists |
| IS 401 Thursday | Retrospective with individual and team reflection | Part of Thursday `5 pts` | Retrospective document | No retrospective artifact found | Unverified from repo | Process-deliverable risk |

### IS 413 Enterprise Application Development

| Section | Requirement | Points/Weight if stated | What counts as proof | Evidence found | Status | Gap/Risk |
|---|---|---:|---|---|---|---|
| IS 413 | Use .NET 10 / C# on backend | Required | Backend project targets .NET 10 | `backend/Haven-for-Her-Backend/Haven-for-Her-Backend.csproj`, successful `dotnet build --no-restore` | Met | None in repo |
| IS 413 | Use React / TypeScript / Vite on frontend | Required | Frontend project and build | `frontend/haven-for-her/package.json`, successful `npm run build` | Met | None in repo |
| IS 413 | Use Azure SQL, MySQL, or PostgreSQL for relational database | Required | Configured relational provider | `Program.cs` uses `UseNpgsql` for domain and identity DB contexts | Met | Live database deployment still unverified |
| IS 413 | App and database deployed | Required | Live URL or deploy config with proof | Repo contains deployment notes in `CLAUDE.md` and `docker-compose.yml`, but no verified live URL | Unverified from repo | Cannot award as complete without live proof |
| IS 413 Public | Home / landing page with mission and clear CTAs | Required | Public route and implemented page | `src/pages/HomePage.tsx`, `src/App.tsx` route `/` | Met | None in repo |
| IS 413 Public | Impact / donor-facing dashboard with aggregated anonymized impact, outcomes, progress, and resource-use clarity | Required | Public impact page with meaningful anonymized visuals | `src/pages/ImpactPage.tsx`, `backend/Controllers/PublicController.cs` provide public aggregates and published impact snapshots | Partially Met | Public impact view exists, but it is fairly shallow and does not clearly show richer outcomes/resource-use breakdowns |
| IS 413 Public | Login page with username/password, validation, and error handling | Required | Login UI and auth endpoint | `src/pages/LoginPage.tsx`, `src/features/public/login/useLoginForm.ts`, `backend/Controllers/AuthController.cs` | Met | None in repo |
| IS 413 Public | Privacy policy and cookie consent | Required | Public privacy page and consent component | `src/pages/PrivacyPage.tsx`, `src/components/CookieConsent.tsx`, `src/components/Footer.tsx` | Met | Full GDPR functionality is assessed under IS 414 |
| IS 413 Admin/Staff | Admin dashboard with key metrics and command-center overview | Required | Authenticated admin route plus dashboard data source | `src/pages/admin/AdminDashboardPage.tsx`, `backend/Controllers/AdminDashboardController.cs`, protected `/admin/dashboard` route in `App.tsx` | Met | None in repo |
| IS 413 Admin/Staff | Donors & Contributions page for supporter profiles, contributor classification, donation activity, and allocations | Required | Financial management pages and API | `src/pages/financial/DonorManagementPage.tsx`, `src/pages/financial/DonationRecordsPage.tsx`, `src/pages/financial/SupporterDetailPage.tsx`, `backend/Controllers/FinancialController.cs`, `FinancialManagementController.cs` | Partially Met | Strong evidence exists, but this pass did not verify end-to-end coverage of every contribution type in the case text |
| IS 413 Admin/Staff | Caseload Inventory with detailed resident fields plus filtering and searching | Required | Caseload page, resident form/profile, and caseload API | `src/pages/admin/CaseloadPage.tsx`, `src/pages/admin/ResidentProfilePage.tsx`, `src/components/admin/ResidentFormModal.tsx`, `backend/Controllers/CaseloadController.cs` | Met | None in repo |
| IS 413 Admin/Staff | Process Recording with dated notes, session details, interventions, follow-up, and chronological resident history | Required | Session form/list/detail plus resident-linked access | `src/pages/counselor/SessionsPage.tsx`, `src/pages/counselor/SessionDetailPage.tsx`, `backend/Controllers/CounselorController.cs`, `backend/Controllers/CaseloadController.cs` | Partially Met | Session tooling exists, but this pass did not fully confirm resident-specific chronological history and full-case workflow parity |
| IS 413 Admin/Staff | Home Visitation and Case Conferences with history and upcoming views | Required | Visitation tooling and case-conference view | `src/pages/counselor/VisitationsPage.tsx`, `src/pages/counselor/CaseConferencesPage.tsx`, `backend/Controllers/CounselorController.cs` | Partially Met | Both features exist, but the exact combined resident-centric workflow described in the case was not fully verified |
| IS 413 Admin/Staff | Reports & Analytics with donation trends, resident outcomes, safehouse comparison, and reintegration success | Required | Analytics UI and report endpoints | `src/pages/admin/AnalyticsPage.tsx`, `src/pages/financial/ReportsPage.tsx`, `backend/Controllers/ReportsController.cs` | Partially Met | Reporting is substantial, but reintegration logic appears mismatched to the data dictionary in places and full annual-accomplishment alignment was not fully validated |
| IS 413 Misc | Additional pages needed for security, social media, accessibility, or partner features | Required | Supporting pages beyond minimum set | `src/pages/social/*`, `src/pages/admin/PartnersPage.tsx`, `src/pages/ResourcesPage.tsx`, `src/pages/VolunteerPage.tsx`, `src/pages/AccountPage.tsx` | Met | None in repo |
| IS 413 Quality | Validate data and handle errors so site is robust and reliable | Required | Client/server validation and error handling patterns | Validation and error states exist in `RegisterPage.tsx`, `LoginPage.tsx`, `AccountController.cs`, `AuthController.cs`, and reusable `ApiError` handling in `src/api/client.ts` | Partially Met | Good patterns exist, but this audit did not verify every form and endpoint |
| IS 413 Quality | Polish details such as titles, icons, logos, consistent look and feel, pagination, and speed | Required | Consistent design system and reusable UI | `STYLE_GUIDE.md`, `.impeccable.md`, `src/components/ui/*`, lazy-loaded routes in `App.tsx`, paginated `DataTable.tsx` | Partially Met | Strong design system evidence, but this is still a qualitative grader judgment and some pages remain rougher than others |

### IS 414 Security Rubric

| Section | Requirement | Points/Weight if stated | What counts as proof | Evidence found | Status | Gap/Risk |
|---|---|---:|---|---|---|---|
| IS 414 | Use HTTPS/TLS for public connections | `1 pt` | Verified deployed HTTPS endpoint | Repo notes Cloudflare TLS in `CLAUDE.md`, but no deployed URL or live check | Unverified from repo | Cannot confirm production certificate from code alone |
| IS 414 | Redirect HTTP to HTTPS | `0.5 pt` | Verified redirect behavior | `Program.cs` intentionally omits `UseHttpsRedirection()` due Cloudflare architecture | Unverified from repo | Edge redirect may exist, but there is no repo proof; high grading risk |
| IS 414 | Authenticate users with username/password | `3 pts` | Working auth endpoints and login flow | `backend/Controllers/AuthController.cs`, `AccountController.cs`, `src/pages/LoginPage.tsx` | Met | None in repo |
| IS 414 | Require better passwords than default PasswordOptions | `1 pt` | Explicit Identity password policy | `Program.cs` sets `RequiredLength = 14` and custom lockout settings | Partially Met | Password policy is stronger in length, but it may not match the exact lab rubric if composition rules were expected |
| IS 414 | Pages and API endpoints require auth where needed | `1 pt` | Protected routes and controller authorization | `src/components/ProtectedRoute.tsx`, route gating in `App.tsx`, broad `[Authorize]`/role attributes across controllers | Met | No major gaps found in this scan |
| IS 414 | RBAC: only admin can CUD, donors see donor history, public sees only public pages | `1.5 pts` | Role-gated pages and role-gated write endpoints | Donor/public gating is present, but many write endpoints are also granted to `Financial` and `Counselor` roles in `FinancialManagementController.cs` and `CounselorController.cs` | Partially Met | RBAC exists, but it does not strictly enforce admin-only CUD across the app |
| IS 414 | Confirmation required to delete data | `1 pt` | Delete confirmation in UI before destructive call | Reusable confirmation flow in `src/components/DataTable.tsx` with `AlertDialog`; used by admin/financial/counselor tables | Met | None obvious in this scan |
| IS 414 | Handle credentials safely and keep them out of code/public repo | `1 pt` | No committed secrets, env-driven config | Blank connection strings in `appsettings.json`, `.env.example`, Google secrets omitted, env-based Meta/TikTok config | Met | Production secret storage cannot be fully inspected from repo, but committed-tree evidence is good |
| IS 414 | Customized privacy policy linked from site footer | `1 pt` | Public privacy page and footer link | `src/pages/PrivacyPage.tsx`, `src/components/Footer.tsx`, `src/layouts/PublicLayout.tsx` | Met | None in repo |
| IS 414 | GDPR-compliant cookie consent fully functional | `1 pt` | Consent mechanism meaningfully controls non-essential cookie behavior | `src/components/CookieConsent.tsx` stores accept/decline in `localStorage` and claims essential cookies only | Partially Met | Notice exists, but accept/decline does not change actual cookie behavior and consent is not server-managed |
| IS 414 | CSP header set properly | `2 pts` | HTTP response header present with needed sources and no more | `backend/Infrastructure/SecurityHeaders.cs` sets `Content-Security-Policy` on backend responses | Partially Met | Backend sets a CSP header, but this does not prove the deployed HTML document is served with the correct CSP |
| IS 414 | Site publicly accessible | `4 pts` | Public deployed URL | No live URL verified in this pass | Unverified from repo | Cannot award without deployment proof |
| IS 414 | Additional security/privacy features beyond minimum | `2 pts` | Implemented extras such as OAuth, MFA, HSTS, secure cookies, rate limiting | Google OAuth hooks in `AuthController.cs`, 2FA endpoints and UI in `AuthController.cs` and `AccountPage.tsx`, secure cookies and rate limiting in `Program.cs` | Met | Live enablement of some extras depends on environment variables and deployment config |

### IS 455 Machine Learning

| Section | Requirement | Points/Weight if stated | What counts as proof | Evidence found | Status | Gap/Risk |
|---|---|---:|---|---|---|---|
| IS 455 | Deliver multiple complete pipelines for different business problems | Section total `20 pts` | Multiple distinct notebooks/pipelines | `ml-pipelines/donor_loyalty_pipeline.ipynb`, `incident_risk_pipeline.ipynb`, `resident_progress_pipeline.ipynb`, `safehouse_outcomes_pipeline.ipynb`, `social_media_impact_pipeline.ipynb` | Met | Strong breadth |
| IS 455 | Problem framing with business question and predictive vs explanatory choice | Part of `20 pts` | Notebook sections that state framing and model intent | Notebook content includes predictive/explanatory framing phrases across multiple notebooks | Partially Met | Present in notebook text, but not every notebook was fully read end to end |
| IS 455 | Data acquisition, preparation, and reproducible pipelines | Part of `20 pts` | Reusable data prep, joins, and documented preprocessing | Reusable feature engineering in `ml-pipelines/serve.py`; training orchestration in `ml-pipelines/train.py` | Met | Strong reusable pipeline evidence |
| IS 455 | Exploration before modeling | Part of `20 pts` | Exploratory notebook sections and analysis | Notebooks include sectioned analysis, but this pass did not fully verify every exploration section | Partially Met | Likely present, but not fully audited |
| IS 455 | Modeling and feature selection | Part of `20 pts` | Appropriate models plus justified features | `train.py` trains multiple model types; notebook text references predictive and explanatory models and feature selection | Met | None major in repo evidence |
| IS 455 | Evaluation and selection with proper validation and business interpretation | Part of `20 pts` | Train/test split, CV, metrics, and write-up | `train.py` uses train/test splits, CV, metrics, and writes reports into `ml-pipelines/reports/` | Partially Met | Evaluation infrastructure exists, but notebook-level business interpretation was not fully verified |
| IS 455 | Causal and relationship analysis for each pipeline | Part of `20 pts` | Explanatory sections discussing key drivers and limitations | Notebook search shows explanatory/Logit/OLS sections across pipelines | Partially Met | Good signs, but not fully audited notebook by notebook |
| IS 455 | Deployment and meaningful integration into the web app | Part of `20 pts` | Serving layer, backend endpoints, frontend consumers | `ml-pipelines/serve.py`, `backend/Controllers/MlController.cs`, `src/api/mlApi.ts`, UI consumers in `InsightsPage.tsx`, `CounselorDashboardPage.tsx`, `SafehousesPage.tsx`, `SocialDashboardPage.tsx`, `CreatePostPage.tsx` | Met | Strong integration evidence |
| IS 455 | Notebooks are executable top to bottom | Part of `20 pts` | Successful notebook execution or reproducibility proof | Notebooks and model artifacts are present, but notebooks were not executed in this pass | Unverified from repo | Needs actual run-through before grading |

### Final Submission Items

| Section | Requirement | Points/Weight if stated | What counts as proof | Evidence found | Status | Gap/Risk |
|---|---|---:|---|---|---|---|
| Final Submission | Correct group number and group members | Required | Submission form contents | No submission artifact in repo | Unverified from repo | External submission item |
| Final Submission | Correct URLs for website, repo, notebooks, and videos | Required | Submission form contents and accessible links | Repo contains notebook files, but not the actual final submission form or verified live URLs | Unverified from repo | Very high grader-friction risk if handled manually at the last minute |
| Final Submission | GitHub repository set to public for grading | Required | Verified repo visibility | No public/private verification from local repo | Unverified from repo | External GitHub setting |
| Final Submission | Separate public videos for IS 413, IS 414, and IS 455 that show all required features | Required | Public video links and complete demos | No video artifacts in repo | Unverified from repo | High risk because graders only score what is shown |
| Final Submission | Provide admin account without MFA, donor account without MFA and with donation history, and one MFA-enabled account | Required | Credential list and accessible accounts | Repo seeds `admin@havenforher.local` and `counselor@havenforher.local` in `Data/AuthIdentityGenerator.cs`; no dedicated donor/MFA submission artifact found | Partially Met | Some local accounts exist, but the exact grading set is not evidenced in repo |

## 2. Completed Comparison

### Overall Read

- `IS 401` is the weakest repo-backed area. The project clearly has planning and design work, but most of the class-specific process artifacts look external to git and therefore remain unverified here.
- `IS 413` is the strongest implementation area. The app has substantial public, admin, financial, counselor, donor, survivor, and social-media functionality, and both frontend and backend builds pass in this review.
- `IS 414` is mixed. Identity, route protection, delete confirmation, secure-cookie settings, 2FA code, and rate limiting are real strengths. The biggest risks are the stricter rubric wording around admin-only CUD, cookie-consent functionality, and proving production HTTPS/redirect/CSP behavior.
- `IS 455` is also strong from a repo perspective. There are five distinct pipelines, saved model artifacts, a serving microservice, backend proxy endpoints, and multiple UI integrations. The main remaining uncertainty is notebook execution quality and completeness under grader-run conditions.
- Final submission readiness is mostly unverified from repo because those items live in Qualtrics, GitHub visibility, and public video links rather than source code.

### Verification Notes

- Frontend verification:
  - `npm run build` succeeded in `frontend/haven-for-her`.
- Backend verification:
  - `dotnet build --no-restore` succeeded in `backend/Haven-for-Her-Backend`.
  - A normal restore/build path hit sandboxed NuGet-config access restrictions before the `--no-restore` pass; that was an environment issue, not a compile failure in project code.
- Runtime limits in this pass:
  - `backend/Haven-for-Her-Backend/appsettings.json` contains blank connection strings, so full local runtime and authenticated browser verification were not reliable from repo state alone.

### Section-by-Section Takeaways

- `IS 401`
  - Strongest evidence: three major wireframe targets and a serious design system.
  - Weakest evidence: sprint artifacts, burndown, personas, journey map, user feedback, retrospective, and screenshot deliverables.
- `IS 413`
  - Strongest evidence: landing page, auth, admin dashboard, caseload, resident profile, reporting, donor/financial tooling, extra role portals, and consistent typed API usage.
  - Likely partial areas: public impact page depth, process-recording workflow completeness, home visitation/case-conference parity with the case wording, and the full breadth of donor/contribution handling.
- `IS 414`
  - Strongest evidence: ASP.NET Identity, password customization, secure cookies, authorization attributes, protected routes, delete confirmation, privacy policy, 2FA, Google OAuth wiring, and rate limiting.
  - Likely grading traps: admin-only CUD wording, whether cookie consent is truly “fully functional,” whether CSP is visible on the deployed HTML response, and proving HTTPS redirect/HSTS in production.
- `IS 455`
  - Strongest evidence: five distinct notebooks, production-style `train.py`, serving layer in `serve.py`, role-gated ML API, and UI consumption in financial, counselor, admin, and social pages.
  - Main uncertainty: whether each notebook fully satisfies the narrative sections and executes top-to-bottom without manual repair.

## 3. Highest-Impact Gaps

1. **IS 401 proof is mostly missing from the repo.**
   - The app looks much stronger than the process evidence. If the FigJam, sprint screenshots, burndown, user-feedback notes, and retrospective are not organized elsewhere, that will drag the grade down quickly.

2. **Admin-only CUD is not strictly enforced the way the IS 414 wording suggests.**
   - The app has real RBAC, but `Financial` and `Counselor` roles can create/update/delete within their domains. If graders interpret the rubric literally, this is one of the biggest security-scoring risks.

3. **Cookie consent is present but not clearly “fully functional.”**
   - The notice records a local preference in `localStorage`, but accept/decline does not appear to change actual cookie behavior. That is likely partial credit rather than full credit for the GDPR-cookie line item.

4. **Production TLS, HTTP redirect, CSP-on-document, and public availability are not proven from the repo.**
   - The repo contains deployment notes, but the case is graded on what the live site does. These items should not be assumed complete without direct deployment verification.

5. **The public impact page may undershoot the case’s donor-facing dashboard expectation.**
   - It has solid anonymized aggregate data, but it is much lighter than the richer donor-impact storytelling and resource-use view implied by the case.

6. **Process-recording and visitation/conference flows look substantial but still carry wording-risk.**
   - The project has pages and endpoints for these features, but the exact resident-centric “full history / chronological / combined workflow” language from the case was not fully proven in this repo-only pass.

7. **ML is one of the strongest areas, but notebook execution is still a live grading risk.**
   - Saved models, reports, APIs, and UI integrations are all present. The remaining risk is whether graders can run each notebook top-to-bottom without friction and see the required narrative sections clearly.
