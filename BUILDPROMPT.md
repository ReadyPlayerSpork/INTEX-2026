# INTEX-2026 Build Prompt

You are building a full-stack web application for a nonprofit that operates safe homes for girls who are survivors of sexual abuse and trafficking in the Philippines. The tech stack is **React + TypeScript (Vite)** on the frontend and **ASP.NET Core (.NET 10)** on the backend, with Entity Framework Core and SQLite for development. The backend authentication skeleton already exists (ASP.NET Identity + Google OAuth, CORS, CSP headers, secure cookies). All 17 EF Core domain models are already built and registered in `IntexPlaceholderDbContext`. The frontend has not been started.

Follow this process **in order**. Complete each phase before moving to the next. Within each phase, build the pieces in the numbered order listed. Always verify the build compiles and the app runs before moving on. Complete only one phase at a time, then ask if we're ready to implement the next phase. 

---

## Non-Negotiable Architecture Guardrails

These rules exist to prevent technical debt. Follow them across every phase.

1. **Do not expose EF Core entities directly to the frontend.**
   - Create explicit request/response DTOs for all API endpoints.
   - Controllers should return DTOs or problem details, never tracked entities.
   - Keep controllers thin and move business logic into services.
2. **Keep backend layers explicit.**
   - Use clear folders such as `Controllers/`, `Services/`, `Dtos/`, `Validators/`, and `Data/`.
   - Do not let `Program.cs` or controllers become the place where business logic accumulates.
3. **Design for SQLite in dev and PostgreSQL in production.**
   - All schema changes must go through EF Core migrations.
   - Seed scripts must be idempotent.
   - Avoid provider-specific SQL unless it is isolated and documented.
4. **All list endpoints must support server-side pagination, filtering, and sorting.**
   - Do not fetch full tables into the browser and paginate client-side.
   - Standardize query params where possible: `page`, `pageSize`, `sort`, `direction`, `search`.
5. **The frontend must be strongly typed and API-driven.**
   - Use TypeScript throughout.
   - Centralize API access in a typed client layer instead of scattered ad hoc calls.
   - Prefer React Router, TanStack Query, and React Hook Form + Zod unless there is a compelling reason not to.
   - Generate or maintain frontend API contracts from backend OpenAPI so DTO drift does not accumulate over time.
6. **All forms need shared validation rules on both client and server.**
   - Client-side validation is for UX.
   - Server-side validation is the source of truth.
7. **Every external integration must be resilient and idempotent.**
   - Meta, TikTok, OAuth, exports, and ML-service calls must use timeouts, retries where appropriate, and structured error handling.
   - Store external IDs explicitly and make sync/import code safe to rerun.
8. **Background work must be designed intentionally.**
   - Meta sync, ML batch scoring, report generation, and imports must be explicit application services that can be triggered manually and scheduled in production.
   - Under Dokploy, scheduled jobs should call deterministic commands or internal endpoints instead of relying only on in-memory timers.
9. **Observability is required.**
   - Add structured logging, request correlation, and health/readiness endpoints for the backend and ML service.
   - Log enough to debug failures without leaking sensitive survivor information.
10. **Testing is part of the deliverable for every phase.**
   - Backend: unit tests for core services and integration tests for important endpoints.
   - Frontend: component tests for shared infrastructure and end-to-end smoke tests for critical flows.
   - Preferred stack:
     - Backend: xUnit + FluentAssertions + `WebApplicationFactory`
     - Frontend: Vitest + React Testing Library
     - End-to-end: Playwright
11. **High-risk data must be treated differently.**
   - Add audit logging for role changes, admin actions, survivor record access, exports, and destructive operations.
   - Prefer deactivation or soft delete where appropriate over hard delete.
12. **Document decisions that create coupling.**
   - If a new table, background job, integration contract, or deployment assumption is introduced, update the README or a short architecture note.

## Definition of Done For Every Phase

A phase is not complete until all of the following are true:

1. The app builds successfully and the changed flows run locally.
2. New backend endpoints are implemented with DTOs, validation, authorization, and error handling.
3. New database requirements are captured in EF Core migrations and any seed/import logic is idempotent.
4. Tests for the most important happy path, failure path, and authorization path are added or updated.
5. Shared UI patterns are reused where possible instead of copying page-specific implementations.
6. New environment variables, jobs, routes, and setup steps are documented.
7. No placeholder TODO logic, fake success responses, or hardcoded secrets remain unless the phase explicitly calls for a temporary placeholder.
8. OpenAPI stays in sync with implemented endpoints and the frontend contract layer is updated accordingly.

---

## Phase 0: Foundation & Project Scaffolding

1. **Scaffold the React + Vite + TypeScript frontend** in a `frontend/` directory at the project root. Install React Router, Axios (or fetch wrapper), and a component library if desired. Configure Vite to proxy API requests to `https://localhost:7229` during development.
2. **Set up a shared layout** with a persistent navbar/sidebar and a main content area. The navbar should be role-aware — it only shows links the current user is authorized to see. Include a footer with the organization name and a link to the privacy policy.
3. **Create an auth context/provider** on the frontend that calls `GET /api/auth/me` on app load to hydrate the current user session (isAuthenticated, email, roles). Expose login, logout, and register functions. Persist auth state across page refreshes via the existing cookie-based session.
4. **Create a `<ProtectedRoute>` component** that accepts a list of allowed roles. If the user is not authenticated, redirect to login. If authenticated but missing the required role, show a 403 Forbidden page.
5. **Create a typed API foundation.**
   - Define shared DTOs/contracts or generate frontend types from OpenAPI.
   - Create a centralized API client with auth-aware error handling.
   - Standardize response shapes for paginated lists, validation errors, and success payloads.
6. **Create a project-wide environment/config strategy.**
   - Add `.env.example` files for frontend, backend, and ML service.
   - Separate dev vs production configuration clearly.
   - Do not hardcode frontend URLs, callback URLs, or third-party tokens.
7. **Add baseline quality tooling before feature work expands.**
   - Frontend: ESLint, Prettier, and TypeScript strict mode.
   - Backend: analyzers, nullable reference types, and a test project scaffold.
   - Add a root README section explaining how to run frontend, backend, and ML service locally.
8. **Publish API contracts early.**
   - Enable and maintain OpenAPI for the backend in development.
   - Use it to keep frontend contracts, request/response shapes, and error handling aligned as the app grows.

---

## Phase 1: Role & Access System

The application has **six custom roles** beyond the existing Admin and Customer roles. Replace the existing "Customer" role concept with these user-facing roles. All role assignments (except the initial default) are managed by Admin users.

### Roles

| Role | Default For | Description |
|------|------------|-------------|
| **Admin** | — (manually assigned) | Full system access. Can assign/revoke all roles for all users. Can CRUD any database record and any user account. Cannot remove their own Admin role. |
| **Financial** | — (assigned by Admin) | Access to the financial dashboard, tax document generation, individual donation records, donor management page, and donor ML recommendations (when built). |
| **Counselor** | — (assigned by Admin) | Access to the counselor dashboard, ability to volunteer for and manage counseling appointments, take session notes (process recordings), and view/manage assigned residents. |
| **SocialMedia** | — (assigned by Admin) | Access to the social media analytics dashboard and the cross-posting tool (Meta + TikTok APIs). |
| **Employee** | Selected at registration ("volunteer/employee") | Default landing page shows upcoming events and volunteer programs. Can be granted additional roles by Admin. Has access to whatever tools their additional roles provide. |
| **Donor** | Selected at registration ("donor") | Default landing page is the donor dashboard showing their donation history, impact metrics, and tax receipts. Also has access to volunteer and resource pages. |
| **Survivor** | Selected at registration ("survivor") | Default landing page shows crisis resources, nearest safe home finder, and the ability to apply for counseling. Also has access to volunteer and donate pages. |

### Implementation Steps

1. **Extend the backend role system.** Update `AuthRoles.cs` to define all seven roles: Admin, Financial, Counselor, SocialMedia, Employee, Donor, Survivor. Update `AuthIdentityGenerator` to seed all roles on startup. Keep the default admin user.
2. **Update the registration flow.** Modify the registration endpoint (or add a post-registration step) so that new users select one of three account types: "Volunteer/Employee," "Donor," or "Survivor." Based on selection, assign the corresponding default role. All users implicitly have access to the volunteer page, donate page, and resources page — these are public-authenticated pages, not role-gated.
3. **Build the Admin role assignment page** (`/admin/roles`). This page lists all users with their current roles. Admins can add or remove any role from any user. Enforce: users cannot edit their own roles unless they are Admin. Admins cannot remove Admin from themselves.
4. **Create backend authorization policies** for each role. Apply `[Authorize(Roles = "...")]` to every controller that is role-gated. Create API endpoints for role management (list users, assign role, revoke role) gated behind Admin.
5. **Wire up the frontend role-aware routing.** Every page below is wrapped in `<ProtectedRoute allowedRoles={[...]}>`. The navbar dynamically shows only the links the user's roles grant access to.
6. **Define role precedence explicitly** for users who have multiple roles so redirects are deterministic.
   - Use this default landing precedence unless a future user preference system overrides it:
     - `Admin`
     - `Financial`
     - `Counselor`
     - `SocialMedia`
     - `Donor`
     - `Survivor`
     - `Employee`

---

## Phase 2: Public & Shared Pages

These pages are visible to anyone (some require authentication but no specific role).

1. **Landing Page** (`/`) — Public. Organization overview, mission statement, calls to action (donate, volunteer, learn more). Hero section, key impact stats pulled from `public_impact_snapshots`.
2. **Login Page** (`/login`) — Public. Email/password form + Google OAuth button. On success, redirect to the user's default landing page based on their primary role.
3. **Registration Page** (`/register`) — Public. Email, password (14+ chars), confirm password. A role selector: "I am a Volunteer/Employee," "I am a Donor," "I am a Survivor." On success, assign default role and redirect to their landing page.
4. **Privacy Policy Page** (`/privacy`) — Public. GDPR-compliant privacy policy. Explain data collection, usage, rights, and contact information.
5. **Cookie Consent Banner** — Appears on first visit. Stores consent in localStorage. Must appear on every page until accepted. Links to the privacy policy.
6. **Public Impact Dashboard** (`/impact`) — Public. Anonymized aggregate stats from `public_impact_snapshots`. Total residents served, total donations, active safehouses, active partners. Visual charts/graphs. No personally identifiable information.
7. **Volunteer & Events Page** (`/volunteer`) — Authenticated (any role). Shows upcoming events and volunteer programs. This is the default landing page for Employee role users.
8. **Donate Page** (`/donate`) — Authenticated (any role). Allows any user to make a donation. Form captures donation type, amount, campaign, etc. This does not require the Donor role — anyone can donate.
9. **Resources Page** (`/resources`) — Authenticated (any role). Crisis resources, hotline numbers, nearest safe home finder (uses `safehouses` data to show active locations). This is the default landing page for Survivor role users.

---

## Phase 3: Survivor-Specific Pages

Gated behind the **Survivor** role.

1. **Apply for Counseling** (`/survivor/counseling`) — Form to request a counseling appointment. Stores a request that Counselor-role users can pick up.
2. **Find Nearest Home** (`/survivor/find-home`) — Uses the `safehouses` table to display active safehouses by region, with capacity and contact info. Could include a simple map or list view sorted by region.
3. **My Resources** (`/survivor/resources`) — Personalized resource page. Links to crisis hotlines, legal aid, educational programs, and health services.

---

## Phase 4: Donor Dashboard & Financial Pages

### Donor Role Pages

1. **Donor Dashboard** (`/donor/dashboard`) — Default landing page for Donor role. Shows the user's donation history (from `donations` table filtered by their supporter record), total giving, impact summary. Links to tax documents and the donate page.

### Financial Role Pages (assigned by Admin)

2. **Financial Dashboard** (`/financial/dashboard`) — Overview of all donations across the organization. Summary cards: total monetary donations, in-kind value, recurring vs one-time, donations by campaign. Charts over time.
3. **Donor Management Page** (`/financial/donors`) — Full list of all supporters with search and filtering. Click into a donor to see their profile, full donation history, and relationship with the organization. This is where ML-recommended actions will surface later.
4. **Individual Donation Records** (`/financial/donations`) — Searchable, filterable, paginated table of all donations. Filter by type, date range, campaign, safehouse allocation. Click into a donation to see allocations and in-kind items.
5. **Tax Document Export** (`/financial/tax-export`) — Generate tax receipt PDFs or CSVs for a donor or date range. Uses `donations` and `supporters` data.
6. **Donor Retention Insights** (`/financial/insights`) — Highlight donors who might give more or might stop donating. Placeholder for ML pipeline output. For now, show basic analytics: donors by frequency, lapsed donors (no donation in 6+ months), top donors.
7. **Export Reports** (`/financial/reports`) — Export any financial data view as PDF or CSV.

---

## Phase 5: Case Management & Counselor Pages

### Counselor Role Pages

1. **Counselor Dashboard** (`/counselor/dashboard`) — Shows the counselor's assigned residents, upcoming appointments, and recent session notes. Ability to volunteer for open counseling requests from survivors.
2. **Session Notes (Process Recordings)** (`/counselor/sessions`) — List of all process recordings for the counselor's assigned residents. Click into a session to view full details. Create new session notes with all fields from the `process_recordings` schema (emotional state observed/end, narrative, interventions, follow-up actions, flags).
3. **Home Visitation Log** (`/counselor/visitations`) — Log and review home visitations. Form matches `home_visitations` schema. List view with filtering by resident, date, outcome.

### Admin/Employee Case Management Pages

4. **Caseload Inventory** (`/admin/caseload`) — Full list of all residents. Search and filter by status, safehouse, risk level. Click into a resident to see their full profile.
5. **Resident Profile** (`/admin/caseload/:id`) — Complete resident record with all fields from the `residents` schema. Tabs or sections for: profile info, process recordings, home visitations, education records, health/wellbeing records, intervention plans, incident reports. Staff can add, edit, and view entries in each section.
6. **Incident Reports** (`/admin/incidents`) — View and create incident reports. Filter by safehouse, severity, type, resolution status.
7. **Intervention Plans** (`/admin/interventions`) — View and manage intervention plans across residents. Filter by category, status, target date.

---

## Phase 6: Social Media Pages

Gated behind the **SocialMedia** role.

1. **Social Media Analytics Dashboard** (`/social/dashboard`) — Aggregate engagement metrics from `social_media_posts`. Charts: engagement rate over time, top-performing content topics, platform comparison, best posting times, posts that drove donations. Filter by platform, date range, campaign.
   - Add an **Ad ROI panel** for Meta campaigns that pulls live ad performance from the Meta Ads API and stores normalized snapshots in the app database.
   - The ROI panel must segment performance by the three strategic audiences: **Donors**, **Survivors**, and **Volunteers/Employees**.
   - For each audience segment, show: impressions, reach, spend, link clicks, CTR, CPC, **cost per link click**, conversions/donation referrals when available, and estimated downstream value.
   - The primary optimization target for paid Meta campaigns is **lowest cost per link click**, because the immediate business goal is to bring the most qualified people to the website.
   - Recommendations must be audience-aware:
     - **Donors** — optimize for traffic quality and downstream donation value
     - **Survivors** — optimize for safe reach and low-friction crisis-resource visits
     - **Volunteers/Employees** — optimize for qualified traffic to volunteer/program pages
   - Include a comparison view that answers: "For this budget, which audience and creative combination is driving the cheapest qualified website traffic?"
   - Use first-party tracking and campaign attribution, not just platform-reported metrics. Every ad/campaign landing URL should include UTM parameters and internal campaign identifiers so downstream website behavior can be tied back to audience, campaign, and creative.
   - If the current schema does not fully support paid-media snapshots and attribution, add new tables and migrations rather than overloading unrelated tables.
   - Recommended schema additions if needed:
     - `paid_media_campaigns`
     - `paid_media_ad_sets`
     - `paid_media_ads`
     - `paid_media_metric_snapshots`
     - `campaign_attribution_events`
     - `audit_logs`
   - Keep platform IDs, business audience intent, landing page, spend snapshots, and attribution events in dedicated structures so reporting and ML features do not depend on overloaded post tables.

2. **Cross-Post Tool** (`/social/post`) — Simplified posting interface that publishes content to Facebook, Instagram, and TikTok from a single form. The backend handles all platform API calls. The form has two modes:

   ### Organic Post Mode
   - **Media upload:** Single image (JPEG) or video (MP4 H.264)
   - **Primary text:** Caption/copy (max 2200 chars for TikTok, 63206 for Facebook)
   - **Platform selector:** Checkboxes for Facebook, Instagram, TikTok
   - On submit, the backend makes separate API calls per platform:
     - **Facebook:** `POST /{page_id}/feed` (text/link) or `POST /{page_id}/photos` (image) or `POST /{page_id}/videos` (video). Requires a Page Access Token with `pages_manage_posts` permission.
     - **Instagram:** Two-step process — `POST /{ig_user_id}/media` to create a container (pass `image_url` or `video_url` + `caption`), then `POST /{ig_user_id}/media_publish` with the `creation_id`. Requires `instagram_basic` + `instagram_content_publish` permissions. Images must be hosted on a publicly accessible URL (upload to blob storage first). Rate limit: 100 posts/day per account.
     - **TikTok:** `POST /v2/post/publish/video/init/` with `post_info.title` (caption), `post_info.privacy_level` (`PUBLIC_TO_EVERYONE`), and `source_info` (either `FILE_UPLOAD` with chunked upload or `PULL_FROM_URL`). Requires OAuth token with `video.publish` scope. Rate limit: 6 requests/min, ~15 posts/day per account. Note: the app must pass TikTok's compliance audit or posts will be private-only.
   - After posting, store the record in `social_media_posts` with the returned platform post ID and URL.

   ### Ad Campaign Mode
   When the user toggles to "Ad" mode, show additional fields:
   - **Lifetime budget:** Input in PHP (Philippine pesos). Meta API accepts budget in cents, so multiply by 100 before sending. Minimums: Meta $1/day for awareness, $5/day for traffic. TikTok: $50/campaign, $20/day per ad group.
   - **Campaign duration:** Start date (default: now) and end date. Meta requires `end_time` when using `lifetime_budget`. TikTok uses `schedule_start_time` + `schedule_end_time`.
   - **Simplified audience picker** with three presets (maps to actual targeting params):
     - **"Survivors"** — Interest targeting: crisis support, social services, women's shelters. Age: 18-45. Location: Philippines.
     - **"Donors"** — Interest targeting: philanthropy, charitable giving, volunteering, nonprofit. Age: 25-65. Location: Philippines + International.
     - **"By Region"** — Geographic targeting: dropdown to select Philippine regions (Luzon, Visayas, Mindanao) or specific cities. Maps to `geo_locations.regions` (Meta) or `location` IDs (TikTok).
   - **Advanced settings dropdown** (collapsed by default, for users familiar with advertising). When expanded, shows:
     - **Campaign objective:** Dropdown — Awareness (default), Traffic, Engagement, Leads. Maps to Meta `OUTCOME_AWARENESS` / `OUTCOME_TRAFFIC` / `OUTCOME_ENGAGEMENT` / `OUTCOME_LEADS` and TikTok `REACH` / `TRAFFIC` / `CONVERSIONS`.
     - **Optimization goal:** Dropdown — Impressions (default), Link Clicks, Reach, Conversions. Must align with the selected objective. Maps to Meta `optimization_goal` and TikTok `optimize_goal`.
     - **Daily vs Lifetime budget:** Toggle. Default is Lifetime. If Daily, show daily budget input instead. Maps to Meta `daily_budget` vs `lifetime_budget` and TikTok `BUDGET_MODE_DAY` vs `BUDGET_MODE_TOTAL`.
     - **Age range:** Two sliders or inputs for min (13-65) and max (13-65). Defaults come from the selected audience preset. Maps to Meta `age_min`/`age_max` and TikTok `age` brackets (`AGE_18_24`, `AGE_25_34`, etc.).
     - **Gender:** Dropdown — All (default), Male, Female. Maps to Meta `genders: [1]`/`[2]` and TikTok `GENDER_MALE`/`GENDER_FEMALE`/`GENDER_UNLIMITED`.
     - **Interest keywords:** Free-text tag input where the user can type interests and press Enter to add them. Maps to Meta `interests` (matched to Interest Targeting Search API) and TikTok `interest_keywords`.
     - **Locations:** Multi-select for countries, regions, or cities. Default comes from the audience preset. Maps to Meta `geo_locations` and TikTok `location` IDs.
     - **Placements:** Checkboxes — Facebook Feed, Instagram Feed, Instagram Stories, Instagram Reels, TikTok. Default: all selected platforms. Maps to Meta `publisher_platforms` + `facebook_positions`/`instagram_positions` and TikTok `placement`.
     - **Call to action:** Dropdown — Learn More (default), Donate Now, Sign Up, Share Story. Maps to Meta `call_to_action_type` on the creative and TikTok `call_to_action` on the ad.
     - **Landing page URL:** Text input. Required for Traffic/Conversion objectives. Used in Meta `link_data.link` and TikTok `landing_page_url`.
     - **Audience intent:** Required selector with `Donor`, `Survivor`, or `Volunteer`. This is first-party business metadata used for ROI analysis and ML features, separate from platform targeting mechanics.
     - **Special ad category:** Checkbox — "This ad relates to housing/shelter services." If checked, sends Meta `special_ad_categories: ["HOUSING"]` (disables age/gender/zip targeting). Show a warning explaining the targeting restrictions.
     - **Start immediately vs schedule:** Toggle. Default: start immediately. If scheduled, show a date/time picker for start. Maps to Meta `start_time` and TikTok `schedule_start_time`.
     - **Bid strategy:** Dropdown — Lowest Cost (default), Cost Cap. Maps to Meta `bid_strategy` and TikTok `bid_type`. Only relevant for advanced users optimizing cost.
     - Any field left at its default value uses the same value the simplified mode would have sent — the advanced dropdown only overrides, never removes.

   **Meta Ad creation flow (backend, 5 API calls):**
   1. Upload image: `POST /act_{ad_account_id}/adimages` → get `image_hash`. Or upload video: `POST /act_{ad_account_id}/advideos` → get `video_id`.
   2. Create campaign: `POST /act_{ad_account_id}/campaigns` with `name`, `objective: "OUTCOME_AWARENESS"` (default), `status: "PAUSED"`, `special_ad_categories: []` (or `["HOUSING"]` if ad content relates to shelter services — this restricts targeting by age/gender/zip).
   3. Create ad set: `POST /act_{ad_account_id}/adsets` with `campaign_id`, `lifetime_budget` (in cents), `start_time` (ISO 8601, default now), `end_time`, `optimization_goal: "IMPRESSIONS"`, `billing_event: "IMPRESSIONS"`, `targeting` (JSON with `geo_locations`, `age_min/max`, `interests`, `publisher_platforms: ["facebook", "instagram"]`).
   4. Create ad creative: `POST /act_{ad_account_id}/adcreatives` with `object_story_spec: { page_id, instagram_actor_id, link_data: { image_hash, message, link } }`.
   5. Create ad: `POST /act_{ad_account_id}/ads` with `adset_id`, `creative: { creative_id }`, `status: "ACTIVE"`.

   **TikTok Ad creation flow (backend, 4 API calls):**
   1. Upload creative: `POST /open_api/v1.3/file/video/ad/upload/` (video) or `POST /open_api/v1.3/file/image/ad/upload/` (image) → get `video_id` or `image_id`.
   2. Create campaign: `POST /open_api/v1.3/campaign/create/` with `advertiser_id`, `campaign_name`, `objective_type: "REACH"` (default), `budget_mode: "BUDGET_MODE_TOTAL"`, `budget`.
   3. Create ad group: `POST /open_api/v1.3/adgroup/create/` with `campaign_id`, `placement_type: "PLACEMENT_TYPE_NORMAL"`, `placement: ["PLACEMENT_TIKTOK"]`, `location` (region IDs), `budget_mode`, `budget`, `schedule_type: "SCHEDULE_START_END"`, `schedule_start_time`, `schedule_end_time`, `optimize_goal: "REACH"`, `billing_event: "CPM"`, `bid_type: "BID_TYPE_NO_BID"`, `pacing: "PACING_MODE_SMOOTH"`, plus optional `age`, `gender`, `interest_keywords`.
   4. Create ad: `POST /open_api/v1.3/ad/create/` with `adgroup_id`, `creatives: [{ ad_name, ad_format: "SINGLE_VIDEO" or "SINGLE_IMAGE", ad_text, video_id or image_ids, call_to_action, landing_page_url }]`.

   ### Prerequisites (one-time setup by the nonprofit)
   - **Meta:** Meta Business Manager account → Facebook Page → Instagram Business account linked to Page → Ad Account (has `act_` ID) → Developer App at developers.facebook.com (type: Business) → App Review for `ads_management`, `ads_read`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish` → System User Access Token (non-expiring, for server-to-server use).
   - **TikTok Ads:** TikTok for Business account at business-api.tiktok.com → Developer App → App Review (1-2 weeks) → OAuth 2.0 flow to get `access_token` (expires 24h, use refresh token) + `advertiser_id`. Sandbox available at sandbox-ads.tiktok.com for testing.
   - **TikTok Organic:** Separate developer app at developers.tiktok.com → Request `video.publish` scope → App Review → Must pass compliance audit for public posting.
   - **Store all tokens/secrets in environment variables, never in code.** Add to `.env.example`: `META_SYSTEM_USER_TOKEN`, `META_AD_ACCOUNT_ID`, `META_PAGE_ID`, `META_IG_USER_ID`, `TIKTOK_APP_ID`, `TIKTOK_APP_SECRET`, `TIKTOK_ACCESS_TOKEN`, `TIKTOK_ADVERTISER_ID`.

   ### Important constraints
   - All ads go through platform review before serving (Meta: typically <24h, TikTok: similar). Ads can be rejected for policy violations.
   - Meta `special_ad_categories: ["HOUSING"]` is required if ad content references shelter/housing services — this disables age, gender, and zip-code targeting.
   - Meta rate limit: 100 requests/sec per app+ad account. TikTok: 600 requests/min.
   - Meta budget is in **cents** (so PHP 500 = `50000`). TikTok budget is in **dollars** (USD equivalent).
   - Ad/media asset storage must be production-safe. Do not depend on local disk for files that must be accessible by Meta/Instagram/TikTok. Use durable object storage or another storage service with public or signed URLs where required.
   - All sync/import jobs for ad metrics must be idempotent and keyed by platform IDs plus snapshot timestamp.

3. **Post Performance Tracker** (`/social/posts`) — Table of all social media posts with engagement metrics. Link to the original post. Sort/filter by platform, engagement rate, donation referrals. For posts created through the Cross-Post Tool, show the platform-returned post IDs and approval status.
   - Add a paid-media mode that lists Meta ads/campaigns/ad sets alongside organic posts.
   - For Meta ads, display campaign objective, audience segment (Donor/Survivor/Volunteer), spend, link clicks, CTR, CPC, cost per link click, landing page URL, and current delivery status.
   - Show a recommendation badge when the system thinks an ad should be scaled, paused, duplicated, or rewritten.

---

## Phase 7: Admin Dashboard & System Management

Gated behind the **Admin** role. The admin dashboard is the executive command center — it should give leadership a complete picture of organizational health at a glance without needing to navigate to individual tools.

1. **Admin Executive Dashboard** (`/admin/dashboard`) — A single-page overview with the following sections/cards:

   ### Financial Health Overview
   - **Total donations this month** vs last month (with % change arrow, green/red)
   - **Donations over time** — Line chart showing monthly donation totals for the past 12 months (from `donations` table, grouped by month). Toggle between monetary only and all types.
   - **Recurring vs one-time donation ratio** — Donut chart (from `donations.is_recurring`)
   - **Top campaigns** — Ranked list of campaigns by total donation value this month (from `donations.campaign_name`)
   - **Donation pipeline** — Breakdown by `donation_type` (Monetary, InKind, Time, Skills, SocialMedia) with totals
   - **Donor health indicators** — Count of active donors (donated in last 6 months), lapsed donors (6-12 months since last donation), churned donors (12+ months). These numbers link to the Financial Insights page.

   ### Resident & Case Management Overview
   - **Total active residents** across all safehouses (from `residents` where `case_status = 'Active'`)
   - **Residents by safehouse** — Bar chart showing active count vs capacity for each safehouse (from `residents` + `safehouses.capacity_girls`)
   - **Risk level distribution** — Pie chart of `residents.current_risk_level` (Low/Medium/High/Critical). Critical count should be prominently displayed with a red badge.
   - **Alerts: Residents who may be struggling** — Auto-generated alert cards for:
     - Residents whose `current_risk_level` is higher than `initial_risk_level` (escalating risk)
     - Residents with `concerns_flagged = true` on their most recent process recording
     - Residents with a `HealthWellbeingRecord.general_health_score < 2.0` in the latest month
     - Residents with an unresolved incident report (`resolved = false`) older than 7 days
     - Residents with no process recording in the last 30 days (may indicate missed sessions)
   - **Alerts: Former residents needing follow-up** — Residents where `case_status = 'Closed'` and `reintegration_status = 'In Progress'` with no `home_visitation` in the last 60 days. These are survivors we haven't heard from.
   - **Recent activity feed** — Chronological list of the last 20 events: new admissions, discharges, incident reports, completed intervention plans

   ### Social Media Overview
   - **Engagement summary** — Total impressions, reach, and engagement rate this month vs last month (from `social_media_posts`)
   - **Top performing post** this month — Show the post with highest `engagement_rate`, its platform, content topic, and a link
   - **Recommended actions:**
    - "Repost this campaign" — Identify the campaign with the highest `estimated_donation_value_php` per post and suggest rerunning it. Show the ROI (total donation referrals / boost budget if boosted).
    - "Scale this audience" — Identify which of Donors, Survivors, or Volunteers currently has the **lowest cost per link click** on Meta and recommend whether to increase budget, duplicate the ad set, or keep budget flat.
    - "Pause or revise this ad" — Flag active Meta campaigns with rising cost per link click, weak CTR, or model-predicted underperformance.
     - "Best time to post" — Show the `day_of_week` + `post_hour` combination with the highest average engagement rate
     - "Content that drives donations" — Show the `content_topic` with the highest average `donation_referrals`
   - **Active campaigns** — List posts from the last 30 days where `is_boosted = true`, with remaining budget context if available

   ### Quick Stats Bar (top of page)
   - Total active residents | Active safehouses | Donations this month (PHP) | Active donors | Unresolved incidents | Engagement rate this month
   - Each stat is clickable and links to the relevant detail page

2. **User Management** (`/admin/users`) — CRUD for user accounts. List all users, search/filter, view details, deactivate accounts. This is separate from role assignment (Phase 1, Step 3) but can link to it.
3. **Database CRUD Pages** (`/admin/data/:table`) — Generic or per-table CRUD interface for all 17 domain tables. Admins can create, read, update, and delete any record. Include confirmation dialogs for all deletions.
4. **Safehouse Management** (`/admin/safehouses`) — CRUD for safehouses with current occupancy tracking.
5. **Partner Management** (`/admin/partners`) — CRUD for partners and partner assignments.

---

## Phase 8: Security Hardening (IS 414 Requirements)

Complete these security requirements across the entire application:

1. **HTTPS/TLS** — Ensure all traffic uses HTTPS. Redirect HTTP to HTTPS. Deploy with a valid TLS certificate.
2. **HSTS Header** — Add `Strict-Transport-Security` header in production.
3. **CSP Headers** — Already implemented. Verify they cover the frontend assets once deployed.
4. **Cookie Consent** — Built in Phase 2. Verify GDPR compliance.
5. **Privacy Policy** — Built in Phase 2. Review for completeness.
6. **Input Validation & Sanitization** — Add server-side validation on all API endpoints using Data Annotations and FluentValidation. Sanitize all user inputs to prevent XSS and SQL injection.
7. **Deletion Confirmations** — Every delete action in the UI must show a confirmation dialog before executing.
8. **Credential Security** — Move all secrets (Google OAuth keys, connection strings, API keys) to environment variables or a secrets manager. Never commit secrets to the repo. Create an `.env.example` file documenting required variables. Production secrets must be injected through **Dokploy environment variables/secrets**, not hardcoded in compose files or committed manifests.
9. **Optional: 2FA/MFA** — Add optional TOTP-based two-factor authentication via ASP.NET Identity.
10. **Accessibility** — Target Lighthouse accessibility score of 90+. Use semantic HTML, ARIA labels, keyboard navigation, sufficient color contrast.
11. **Audit Logging** — Log admin actions, role changes, survivor-record access, exports, and delete/deactivate actions with timestamp, actor, target entity, and action type.
12. **Backups & Recovery** — Define a production backup strategy for PostgreSQL and document restore steps before launch.

---

## Phase 9: ML Pipeline Integration (IS 455 Requirements)

**Scoring:** 20 points total. Quality > quantity, but both matter. Each pipeline is graded on: Problem Framing, Data Prep & Exploration, Modeling & Feature Selection, Evaluation & Interpretation, Causal Analysis, and Deployment Integration. A poorly executed pipeline hurts more than it helps — do each one well before starting the next.

**Directory structure:** Create `ml-pipelines/` at the project root. Each pipeline gets its own descriptively-named `.ipynb` file. Also create `ml-pipelines/requirements.txt` and `ml-pipelines/models/` (for saved model artifacts).

**Environment setup:** `requirements.txt` should include:
```
pandas>=2.0
numpy>=1.24
scikit-learn>=1.3
matplotlib>=3.7
seaborn>=0.12
jupyter>=1.0
joblib>=1.3
flask>=3.0       # lightweight model serving if needed
statsmodels>=0.14  # for explanatory models
shap>=0.42        # for model interpretability
imbalanced-learn>=0.11  # if class imbalance exists
```

**Critical rules for every notebook:**
- Must be **fully executable top-to-bottom** by a TA (no broken cells, no missing data paths)
- Data paths must be relative to the repo root (e.g., `../data/donations.csv`)
- Every notebook must have **written markdown analysis between code cells** — not just code
- Explicitly state whether the pipeline is **predictive or explanatory** and justify why
- 60-80% of effort should be data preparation and exploration
- Evaluate in **business terms** ("this means 12 donors are likely to stop giving next quarter") not just metrics ("accuracy is 0.87")

---

### Pipeline 1: Donor Churn Classifier
**File:** `ml-pipelines/donor-churn-classifier.ipynb`
**Goal:** PREDICTIVE — Identify supporters likely to stop donating in the next 6 months so the Financial team can intervene.
**Surfaces on:** Financial Dashboard (donor health indicators), Donor Management page (risk badges per donor)

**Section 1 — Problem Framing (markdown):**
- Define churn: no donation in the next 6 months from a donor who has donated before
- Who cares: Financial team, executive leadership. A retained donor is worth far more than acquiring a new one.
- Why predictive: we need actionable scores per donor, not causal understanding of why people leave (that's Pipeline 3)

**Section 2 — Data Acquisition & Preparation:**
- Load `supporters.csv` and `donations.csv`. Join on `supporter_id`.
- Engineer features per supporter:
  - `total_donations` — count of all donations
  - `total_monetary_value` — sum of `amount` where `donation_type = 'Monetary'`
  - `avg_donation_amount` — mean monetary donation
  - `donation_frequency_days` — mean days between consecutive donations
  - `days_since_last_donation` — days from most recent `donation_date` to the dataset's max date
  - `is_recurring_donor` — has at least one `is_recurring = true` donation
  - `num_campaigns` — count of distinct `campaign_name` values
  - `channel_diversity` — count of distinct `channel_source` values
  - `supporter_type` — one-hot encode `supporter_type`
  - `acquisition_channel` — one-hot encode
  - `donor_tenure_days` — days from `first_donation_date` to dataset max date
  - `relationship_type` — one-hot encode (Local, International, PartnerOrganization)
- Create the **target variable**: label a donor as churned (1) if they have no donation in the last 6 months of the dataset. Use an earlier cutoff for training so you have ground truth.
- Handle missing values: `amount` is null for non-monetary donations (fill with 0 or filter). `first_donation_date` nulls mean no donations yet (exclude).
- Document class balance (likely imbalanced — more active than churned). Consider SMOTE or class weights.
- Train/test split: 80/20 stratified on the target. Or use a **temporal split** — train on data before a cutoff date, test on data after.

**Section 3 — Exploration (code + markdown):**
- Distribution of `days_since_last_donation` — is there a natural breakpoint for churn?
- Correlation heatmap of engineered features
- Box plots: churned vs active donors by `total_donations`, `avg_donation_amount`, `donor_tenure_days`
- Bar chart: churn rate by `acquisition_channel` and by `supporter_type`
- Document 3-5 key findings that inform model choice

**Section 4 — Modeling & Feature Selection:**
- Start with **Logistic Regression** as a baseline (interpretable, good for comparison)
- Then try **Random Forest** and **Gradient Boosting (XGBoost or sklearn GradientBoostingClassifier)**
- For each model:
  - Fit on training data
  - Predict on test data
  - Print classification report (precision, recall, F1, support)
  - Print confusion matrix
- Use **GridSearchCV or RandomizedSearchCV** for hyperparameter tuning on the best-performing model
- Feature importance: use `model.feature_importances_` (tree models) or SHAP values
- Feature selection: try removing low-importance features and re-evaluate. Document whether it helps.

**Section 5 — Evaluation & Interpretation:**
- Compare models on **recall for the churned class** (catching at-risk donors matters more than overall accuracy — a false negative means we miss a donor who's about to leave)
- Report precision too — too many false positives waste outreach effort
- ROC-AUC curve for the best model
- **Business interpretation:** "The model identifies X% of donors who will churn. If the Financial team reaches out to the top 20 highest-risk donors, we estimate Y potential donations retained based on their historical average."
- Discuss false positive/negative costs in context: false positive = wasted outreach email. False negative = lost donor relationship.

**Section 6 — Causal & Relationship Analysis (markdown):**
- Which features are most predictive of churn? Does this make theoretical sense?
- Is `days_since_last_donation` just a tautology (it partially defines churn)? Discuss and consider excluding it.
- Does `acquisition_channel` correlate with churn? If SocialMedia donors churn more, is that causal or because they're less engaged to begin with?
- Be honest: this model predicts churn, it does NOT prove why donors leave.

**Section 7 — Deployment:**
- Save the trained model with `joblib.dump(model, 'models/donor_churn_model.joblib')`
- Create a backend API endpoint: `GET /api/ml/donor-churn?supporter_id={id}` that loads the model, computes features for that donor from the database, and returns `{ churn_probability: 0.73, risk_level: "High" }`
- Also create a batch endpoint: `GET /api/ml/donor-churn/batch` that scores all active donors and returns a sorted list
- Frontend integration: on the Donor Management page, show a colored risk badge (green/yellow/red) next to each donor. On the Financial Dashboard, show the count of High/Medium/Low risk donors.

---

### Pipeline 2: Donor Outreach Prioritization
**File:** `ml-pipelines/donor-outreach-prioritization.ipynb`
**Goal:** EXPLANATORY — Understand what drives donation amount and frequency so the Financial team knows WHO to reach out to, WHEN, and HOW.
**Surfaces on:** Financial Insights page (recommended actions per donor)

**Section 1 — Problem Framing:**
- This is explanatory, not predictive. We want to understand the relationships between donor characteristics and their giving behavior.
- Who cares: Financial team doing outreach. They need to know which donors to prioritize and what channel/campaign to use.

**Section 2 — Data Prep:**
- Join `supporters`, `donations`, `donation_allocations`. Optionally join `social_media_posts` via `referral_post_id` to understand social media-driven donations.
- Target variable: `total_lifetime_value` (sum of all monetary donations per supporter) OR `donation_frequency` (donations per year)
- Features: `supporter_type`, `relationship_type`, `acquisition_channel`, `country`, `region`, number of campaigns participated in, whether they ever gave in-kind, whether any donation was social-media-referred, tenure, recency
- Handle multicollinearity: check VIF scores before fitting linear models

**Section 3 — Exploration:**
- Scatter: tenure vs lifetime value (is there a loyalty curve?)
- Bar: average donation by `acquisition_channel` — which channels bring high-value donors?
- Heatmap: correlation between all numeric features
- Time series: are there seasonal donation patterns? (group by month)

**Section 4 — Modeling:**
- **Multiple Linear Regression** — primary model for explanation (interpret coefficients)
- Check assumptions: residual plots, Q-Q plot, multicollinearity (VIF)
- **Decision Tree Regressor** — for comparison and to find non-linear splits
- Use `statsmodels.OLS` for the linear model so you get p-values and confidence intervals
- Feature selection: forward selection or backward elimination based on p-values

**Section 5 — Evaluation:**
- R², adjusted R², RMSE on test set
- **Coefficient interpretation in business terms:** "Each additional campaign a donor participates in is associated with PHP X,XXX more in lifetime giving, holding other factors constant"
- Residual analysis: are there donors the model consistently under/over-predicts?

**Section 6 — Causal Analysis:**
- Can we claim `acquisition_channel` causes higher donations? No — donors who come via events may be pre-disposed to give more. Discuss selection bias.
- Can we claim recurring donors give more? Correlation yes, but the direction could be reversed (high-value donors are asked to set up recurring).
- Identify 2-3 actionable insights the Financial team can use despite causal limitations

**Section 7 — Deployment:**
- Backend endpoint: `GET /api/ml/donor-priority` returns a ranked list of donors with a priority score and recommended action ("reach out via email", "invite to next campaign", "at risk of lapsing — personal call")
- Frontend: on the Financial Insights page, show a prioritized outreach table with donor name, priority score, recommended action, and last donation date

---

### Pipeline 3: Resident Risk & Wellbeing Predictor
**File:** `ml-pipelines/resident-risk-predictor.ipynb`
**Goal:** PREDICTIVE — Flag residents whose risk level is likely to escalate so counselors can intervene early.
**Surfaces on:** Counselor Dashboard (alerts), Admin Dashboard (resident alerts section)

**Section 1 — Problem Framing:**
- Predict whether a resident's `current_risk_level` will increase in the next assessment period
- Who cares: Counselors, safehouse managers. Early intervention prevents crises.
- This is predictive — we need individual risk scores, not just understanding of risk factors

**Section 2 — Data Prep:**
- Join `residents`, `process_recordings`, `health_wellbeing_records`, `education_records`, `incident_reports`, `intervention_plans`
- Engineer features per resident:
  - Latest `general_health_score`, `nutrition_score`, `sleep_quality_score`, `energy_level_score`
  - Trend in health scores (improving/declining over last 3 months)
  - Count of `concerns_flagged = true` in recent process recordings
  - Count of unresolved incident reports
  - Count of intervention plans with `status = 'Open'` or `'On Hold'`
  - `emotional_state_observed` from most recent process recording (one-hot or ordinal)
  - Whether emotional state improved or worsened during last session (`emotional_state_observed` vs `emotional_state_end`)
  - Days since last process recording
  - Days since last home visitation
  - `attendance_rate` from latest education record
  - `case_category` and sub-category booleans (abuse type indicators)
  - `length_of_stay` (parse to numeric days)
- Target: binary — did `current_risk_level` increase from one assessment to the next? Or multi-class: predict the risk level itself (Low/Medium/High/Critical as ordinal).
- This dataset is likely small (fewer residents than donors). Use cross-validation heavily.

**Section 3 — Exploration:**
- Distribution of risk levels — is it imbalanced?
- Which health/wellbeing scores correlate most with high risk?
- Do residents with more incident reports have higher risk levels?
- Does `emotional_state_observed` track with risk changes?
- Small dataset means every observation matters — look for outliers carefully

**Section 4 — Modeling:**
- **Logistic Regression** (ordinal or binary) as baseline
- **Random Forest** for non-linear relationships
- **K-Nearest Neighbors** — may work well with small datasets
- Use **stratified k-fold cross-validation** (k=5 or k=10) given small dataset size
- Feature importance via SHAP for the best model

**Section 5 — Evaluation:**
- **Recall for high-risk class is paramount** — missing a resident at risk has severe real-world consequences
- Confusion matrix: discuss what a false negative means (a struggling resident we failed to flag)
- If dataset is too small for reliable predictions, be honest about it and discuss what additional data collection would help

**Section 6 — Causal Analysis:**
- Do declining health scores cause risk escalation, or does risk escalation cause health decline? Likely bidirectional.
- Are abuse type categories predictive? Be very careful with interpretation — correlation with case outcomes does not mean one abuse type is "worse"
- Discuss ethical considerations: this model flags vulnerable minors. False positives mean extra check-ins (low cost). False negatives mean missed crises (very high cost). Err on the side of over-flagging.

**Section 7 — Deployment:**
- Save model. Backend endpoint: `GET /api/ml/resident-risk?resident_id={id}` returns `{ escalation_probability: 0.65, risk_factors: ["declining health scores", "missed sessions"] }`
- Batch endpoint: `GET /api/ml/resident-risk/alerts` returns all residents above a threshold
- Frontend: alert cards on the Counselor Dashboard and Admin Dashboard. Show the resident name (internal code for privacy), current risk level, escalation probability, and top contributing factors.

---

### Pipeline 4: Social Media ROI & Posting Optimization
**File:** `ml-pipelines/social-media-optimization.ipynb`
**Goal:** PREDICTIVE + EXPLANATORY (hybrid) — Predict whether currently running and newly proposed ads/posts will perform well, optimize Meta campaigns for **cost per link click**, and explain what audience/creative/timing factors matter most.
**Surfaces on:** Social Media Analytics Dashboard (recommendations), Admin Dashboard (social overview), Cross-Post Tool / ad creation form

**Section 1 — Problem Framing:**
- Dual goal:
  - (1) Predict whether an ad or post is likely to perform well before and during its run (predictive)
  - (2) Understand what makes content successful for future creative strategy (explanatory)
- The most important paid-media KPI for Meta is **cost per link click**. The system should help the team buy the most website traffic for the lowest efficient cost.
- All paid-media analysis must be segmented by target audience intent:
  - **Donors** — traffic likely to donate
  - **Survivors** — traffic likely to seek resources/help
  - **Volunteers/Employees** — traffic likely to engage with volunteer opportunities
- Who cares: Social Media team for day-to-day ad decisions, executives for ROI justification of social media spend

**Section 2 — Data Prep:**
- Load `social_media_posts.csv` and create a companion Meta ads export or ingestion table from the Meta Ads API. Join live or snapshot ad metrics into the modeling dataset.
- Pull and store Meta Ads metrics for active campaigns on a schedule. At minimum ingest: campaign/ad set/ad IDs, objective, spend, impressions, reach, frequency, CPM, link clicks, CTR, CPC, cost per landing page view if available, conversions, and audience labels.
- Add an explicit `audience_segment` feature with allowed values `Donor`, `Survivor`, `Volunteer`.
- Join to `donations` via `referral_post_id` or campaign tracking fields where possible so donor-facing ads can be evaluated on both traffic and downstream value.
- Features:
  - `platform` — one-hot encode
  - `post_type` — one-hot encode (ImpactStory, Campaign, FundraisingAppeal, etc.)
  - `media_type` — one-hot encode (Photo, Video, Carousel, Reel, Text)
  - `content_topic` — one-hot encode
  - `sentiment_tone` — one-hot encode
  - `day_of_week` — one-hot or ordinal
  - `post_hour` — numeric or binned (morning/afternoon/evening)
  - `caption_length` — numeric
  - `num_hashtags` — numeric
  - `mentions_count` — numeric
  - `has_call_to_action` — boolean
  - `call_to_action_type` — one-hot (nullable — handle missing)
  - `features_resident_story` — boolean
  - `is_boosted` — boolean
  - `boost_budget_php` — numeric (0 if not boosted)
  - `follower_count_at_post` — numeric (controls for audience size growth over time)
  - `audience_segment` — one-hot encode (`Donor`, `Survivor`, `Volunteer`)
  - `campaign_objective` — one-hot encode
  - `ad_creative_format` — image/video/carousel/etc.
  - `headline` or CTA copy family — encoded if available
  - `landing_page_url` or landing page type — donate/resources/volunteer/etc.
  - `spend` — numeric
  - `link_clicks` — numeric
  - `ctr` — numeric
  - `cpc` — numeric
  - `cost_per_link_click` — numeric
  - `frequency` — numeric
- Target variables (build separate models or a multi-output model):
  - `engagement_rate` — for content quality prediction
  - `donation_referrals` — for donation-driving prediction
  - `estimated_donation_value_php` — for ROI prediction
  - `cost_per_link_click` — for Meta traffic-efficiency prediction
  - Optional binary target: `will_perform_well` where "well" is defined per audience segment using thresholds on CTR, cost per link click, and downstream conversions/value

**Section 3 — Exploration:**
- Average engagement rate by `platform`, `post_type`, `media_type`, `content_topic`
- Heatmap: engagement rate by `day_of_week` × `post_hour` — find the optimal posting windows
- Scatter: `boost_budget_php` vs `donation_referrals` — is paid promotion worth it?
- Bar: `content_topic` ranked by average `estimated_donation_value_php` — what content drives money?
- Does `features_resident_story` increase engagement? Compare distributions.
- Does `has_call_to_action` increase `donation_referrals`? Which `call_to_action_type` works best?
- Compare **cost per link click** by `audience_segment`, creative format, and CTA type
- Plot Meta performance by audience segment:
  - Donor ads — cost per link click vs donation referrals
  - Survivor ads — cost per link click vs resource page engagement
  - Volunteer ads — cost per link click vs volunteer-form starts/submissions
- Examine whether certain landing pages systematically lower or raise cost per link click

**Section 4 — Modeling:**
- **For engagement prediction (predictive):** Random Forest Regressor, Gradient Boosting Regressor. Target: `engagement_rate`. Evaluate with RMSE, MAE, R².
- **For donation prediction (predictive):** Same models. Target: `donation_referrals`. This may be a count — consider Poisson regression.
- **For Meta traffic-efficiency prediction (predictive):** Predict `cost_per_link_click` using Gradient Boosting, XGBoost/LightGBM if allowed, Random Forest, or regularized linear models.
- **For "will this ad do well?" classification:** Train a classifier that labels ads as Likely Strong / Mixed / Likely Weak based on audience-specific thresholds. This is the model used before launch and while campaigns are running.
- **For content understanding (explanatory):** Linear Regression with `statsmodels.OLS` on `engagement_rate`. Interpret coefficients: "Posts with FundraisingAppeal type have X% higher engagement than the baseline, controlling for other factors."
- Feature importance comparison across models using SHAP

**Section 5 — Evaluation:**
- For the predictive models: RMSE, MAE, R² on test set. Business framing: "The model predicts donation referrals within ±X for 80% of posts"
- For the explanatory model: coefficient significance, R², residual analysis
- **Identify the top 5 actionable levers** the social media team can control (they can't control follower count, but they can control post timing, content type, CTA, and boosting)
- Evaluate separately by `audience_segment`; a model that works for donor ads but fails for survivor outreach is not acceptable
- For the classification model, report precision/recall for "Likely Weak" so the Social Media team can trust warnings before spending budget

**Section 6 — Causal Analysis:**
- Does boosting cause more donations, or do the SM team boost posts that are already performing well? Selection bias.
- Does posting at optimal times cause better engagement, or do followers just happen to be online then? (Likely causal, but discuss)
- `features_resident_story` correlation with engagement: is it the story or the emotional sentiment that drives engagement?
- Does a low cost per link click actually reflect better audience-targeting, or just broader/cheaper clicks with lower intent? Discuss quality vs quantity tradeoffs by audience.
- Are donor, survivor, and volunteer outcomes meaningfully different because of the audience itself, or because the creative and landing pages differ?

**Section 7 — Deployment:**
- Save models. Backend endpoints:
  - `POST /api/ml/social-media/predict` — accepts post/ad metadata (platform, audience segment, creative type, CTA, timing, landing page, budget, etc.) and returns predicted engagement rate, predicted donation referrals, predicted cost per link click, and a `likely_performance` label
  - `GET /api/ml/social-media/recommendations` — returns best posting time, best content type, best audience/creative pairing, whether to boost, and whether to scale/pause/rewrite currently running ads
  - `GET /api/ml/social-media/live-ad-audit` — scores all currently running Meta ads and returns warnings/recommendations for the Social Media role group
  - `POST /api/social/meta/sync` — pulls current Meta ad performance into the database for dashboards and model features
- Frontend:
  - On the Social Media Analytics Dashboard, show a "Recommendations" card with the top 3 actions plus a live "Active Ad Health" table for current campaigns
  - On the Cross-Post Tool / ad builder, show predicted performance as the user fills out the form before launch
  - Any user in the **SocialMedia** role should see model suggestions, warnings, and audience-specific recommendations so they can make better ad decisions before and during a campaign

---

### Pipeline 5: Reintegration Readiness / Follow-up Priority
**File:** `ml-pipelines/reintegration-readiness.ipynb`
**Goal:** PREDICTIVE — Score residents on their readiness for reintegration and flag former residents who may need follow-up.
**Surfaces on:** Counselor Dashboard (follow-up alerts), Caseload Inventory (readiness scores)

**Section 1 — Problem Framing:**
- Two sub-problems: (1) For active residents: predict readiness for reintegration. (2) For closed/transferred cases: predict likelihood of needing follow-up intervention.
- Who cares: Counselors planning reintegration. Social workers doing post-placement monitoring.
- Predictive — we need individual scores, not just understanding.

**Section 2 — Data Prep:**
- Join `residents`, `process_recordings`, `home_visitations`, `education_records`, `health_wellbeing_records`, `intervention_plans`, `incident_reports`
- Features per resident:
  - Latest health scores (all 4: nutrition, sleep, energy, general health)
  - Health score trends (3-month moving average direction)
  - Education `progress_percent` and `completion_status`
  - `attendance_rate` trend
  - Count of process recordings in last 90 days
  - Ratio of sessions with `progress_noted = true`
  - Count of sessions with `concerns_flagged = true`
  - Most recent `emotional_state_end` (ordinal: Distressed=1 ... Happy=8)
  - Intervention plan completion rate (`status = 'Achieved'` / total plans)
  - Count of open intervention plans
  - Days since last incident
  - Total incident count and severity distribution
  - Home visitation outcomes (count of Favorable vs Unfavorable)
  - `family_cooperation_level` from most recent visitation (ordinal)
  - `length_of_stay` in days
  - `current_risk_level` (ordinal)
- Target for sub-problem 1: `reintegration_status = 'Completed'` (binary: ready vs not ready). Use historical completed cases as positive examples.
- Target for sub-problem 2: For closed cases, define "needed follow-up" as having a home visitation or incident report after `date_closed`. Binary classification.

**Section 3 — Exploration:**
- What distinguishes residents who successfully reintegrated from those still in progress?
- Do health score trends correlate with reintegration timing?
- Is family cooperation level from home visitations predictive?
- How do intervention plan completion rates relate to outcomes?
- Small dataset warning: same as Pipeline 3. Use cross-validation.

**Section 4 — Modeling:**
- Logistic Regression (baseline), Random Forest, Gradient Boosting
- Stratified k-fold cross-validation
- SHAP values for interpretability — counselors need to understand WHY a resident is flagged

**Section 5 — Evaluation:**
- For readiness: precision matters (don't prematurely recommend reintegration). A false positive means a girl is reintegrated before she's ready.
- For follow-up: recall matters (don't miss someone who needs help). A false negative means a former resident struggles alone.
- Frame results: "Of the 15 residents the model flagged for follow-up, 12 had documented needs within 90 days."

**Section 6 — Causal Analysis:**
- Does completing intervention plans cause better reintegration outcomes, or are residents who complete plans just generally doing better? Selection vs treatment effect.
- Does family cooperation cause successful reintegration, or does a resident doing well cause the family to be more cooperative?
- Ethical framing: these scores inform high-stakes decisions about vulnerable minors. Discuss guardrails (human always makes final decision, model is advisory only).

**Section 7 — Deployment:**
- Save model. Backend: `GET /api/ml/reintegration-readiness?resident_id={id}` returns `{ readiness_score: 0.78, top_factors: ["high health scores", "3 completed intervention plans", "favorable home visits"] }`
- Batch: `GET /api/ml/follow-up-needed` returns closed-case residents ranked by follow-up urgency
- Frontend: on Caseload Inventory, show readiness score bar next to active residents. On Counselor Dashboard, show follow-up alerts for closed cases.

---

### General ML Deployment Architecture

All ML models are served from the ASP.NET backend. The pattern for each:

1. **Train in notebook** → save model artifact with `joblib.dump()` to `ml-pipelines/models/`
2. **Backend loads model on startup** using a Python interop approach. Options:
   - **Option A (recommended for this project):** Run a small Flask/FastAPI microservice (`ml-pipelines/serve.py`) that loads all models and exposes prediction endpoints. The ASP.NET backend proxies ML requests to this service. Run both services in production.
   - **Option B:** Use `ML.NET` to retrain equivalent models in C# (more work but single-process deployment)
   - **Option C:** Pre-compute predictions nightly via a Python script and store results in the database. Backend just reads from DB. Simplest but predictions go stale.
3. **Frontend calls the ASP.NET API** which routes to the ML service. The frontend never calls the ML service directly.

For deployment, assume **Dokploy** as the production orchestrator:
- Run the app as separate Dokploy services/containers:
  - `frontend` — React/Vite static app or Node-served build
  - `backend` — ASP.NET Core API
  - `ml-service` — Flask/FastAPI service serving `.joblib` models
  - `db` — PostgreSQL for production
- Configure service-to-service networking inside Dokploy so the backend can call the ML service privately.
- Store all production secrets in Dokploy environment variables/secrets.
- Use Dokploy-managed domains/TLS and reverse proxy routing so frontend and backend are reachable under the intended production URLs.
- Expose health endpoints for each service and configure Dokploy health checks and restart policies.
- Keep scheduled work explicit:
  - Meta sync
  - ML batch scoring / refresh
  - optional nightly reporting/export jobs
  These should be triggerable in a deterministic way so Dokploy scheduled jobs can run them safely.

For the Flask microservice approach, create `ml-pipelines/serve.py`:
- Load all `.joblib` models on startup
- Expose endpoints matching the ones defined in each pipeline above
- Connect to the same SQLite/PostgreSQL database to compute features on-the-fly
- Return JSON responses

Add `ml-pipelines/serve.py` startup instructions to the project README and document the Dokploy deployment topology.

---

## Phase 10: Deployment & Final Polish

1. **Deploy with Dokploy** as the production platform. Create Dokploy services for the frontend, ASP.NET backend, ML service, and production database. Use PostgreSQL for production unless there is a strong reason otherwise. Configure environment variables and secrets through Dokploy.
2. **Define Dokploy routing/domain setup** so the frontend and backend are served under the production domain with proper HTTPS/TLS termination. Configure CORS for the real Dokploy production URLs only.
3. **Containerization** — Add production-ready Dockerfiles for frontend, backend, and ML service plus any Dokploy/docker-compose manifests needed for deployment.
4. **Operational jobs** — Add scheduled jobs or background tasks for Meta ad sync, ML refresh/batch scoring, and any nightly prediction snapshots that should run in production under Dokploy.
   - Document the exact trigger mechanism for each job and make sure each job is safe to rerun.
5. **Mobile responsiveness** — Verify all pages work on mobile viewports. Use responsive design patterns throughout.
6. **Data seeding** — Import the 17 CSV files into the production database. Create a seed script or migration that loads the initial dataset.
7. **Export functionality** — Verify PDF and CSV export works on Financial reports, tax documents, and any data table.
8. **Lighthouse audit** — Run Lighthouse on all pages. Fix any accessibility, performance, or SEO issues until scores are 90+.
9. **Video walkthroughs** — Record demo videos for IS 413 (app features), IS 414 (security), and IS 455 (ML pipelines).

---

## General Rules (Apply Throughout All Phases)

- **Pagination:** Every list/table view must be paginated (10-25 items per page).
- **Search & Filter:** Every list view must have at least basic search. Caseload, donations, and social media pages need multi-field filtering.
- **Error Handling:** Every API call must have try/catch with user-friendly error messages. Backend returns appropriate HTTP status codes.
- **Data Validation:** Both client-side and server-side. Required fields, type checking, range validation.
- **Loading States:** Show loading spinners/skeletons while data is being fetched.
- **Empty States:** Show helpful messages when a list has no data.
- **Responsive Design:** All pages must work on desktop (1920px), tablet (768px), and mobile (375px).
- **No secrets in code:** All API keys, connection strings, and credentials go in environment variables.
- **Role-aware everything:** Every page, every API endpoint, every navbar link must respect the role system. If a user somehow navigates to a URL they don't have access to, they see a 403 page, not the content.
- **Consistent API design:** Use RESTful naming, DTOs, standardized error responses, and `ProblemDetails` for failures where appropriate.
- **No hidden schema drift:** If a feature requires new tables/columns for ads, tracking, audit logs, or ML predictions, add migrations and document why they exist.
- **No duplicate business rules:** Redirect logic, role precedence, validation rules, and permission checks should live in shared abstractions, not be reimplemented per page/controller.
- **Prefer additive evolution over rewrites:** Build reusable tables, filters, charts, forms, and dialog patterns early so later phases compose from them instead of duplicating UI.
- **Track attribution intentionally:** Donation, volunteer, and survivor-resource flows should preserve campaign attribution wherever ethically and legally appropriate.
- **Document what was completed at the end of each phase:** Update the README or a progress note with routes added, endpoints added, migrations created, env vars added, and tests written.
