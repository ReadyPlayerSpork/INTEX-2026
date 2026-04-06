# INTEX-2026 Build Prompt

You are building a full-stack web application for a nonprofit that operates safe homes for girls who are survivors of sexual abuse and trafficking in the Philippines. The tech stack is **React + TypeScript (Vite)** on the frontend and **ASP.NET Core (.NET 10)** on the backend, with Entity Framework Core and SQLite for development. The backend authentication skeleton already exists (ASP.NET Identity + Google OAuth, CORS, CSP headers, secure cookies). All 17 EF Core domain models are already built and registered in `IntexPlaceholderDbContext`. The frontend has not been started.

Follow this process **in order**. Complete each phase before moving to the next. Within each phase, build the pieces in the numbered order listed. Always verify the build compiles and the app runs before moving on. Complete only one phase at a time, then ask if we're ready to implement the next phase. 

---

## Phase 0: Foundation & Project Scaffolding

1. **Scaffold the React + Vite + TypeScript frontend** in a `frontend/` directory at the project root. Install React Router, Axios (or fetch wrapper), and a component library if desired. Configure Vite to proxy API requests to `https://localhost:7229` during development.
2. **Set up a shared layout** with a persistent navbar/sidebar and a main content area. The navbar should be role-aware — it only shows links the current user is authorized to see. Include a footer with the organization name and a link to the privacy policy.
3. **Create an auth context/provider** on the frontend that calls `GET /api/auth/me` on app load to hydrate the current user session (isAuthenticated, email, roles). Expose login, logout, and register functions. Persist auth state across page refreshes via the existing cookie-based session.
4. **Create a `<ProtectedRoute>` component** that accepts a list of allowed roles. If the user is not authenticated, redirect to login. If authenticated but missing the required role, show a 403 Forbidden page.

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
2. **Cross-Post Tool** (`/social/post`) — Simplified posting interface that uses Meta (Facebook/Instagram) and TikTok APIs to publish content. The form has:
   - **Post type toggle:** Post or Ad
   - **Media upload:** Image or video
   - **Primary text:** Caption/copy
   - **Platform selector:** Checkboxes for Facebook, Instagram, TikTok
   - **If Ad:** Lifetime budget input (PHP), campaign duration (start/end dates), simplified audience picker with two presets: "Survivors" (crisis/support targeting), "Donors" (philanthropy/giving targeting), "Locations" (geographic targeting by region)
   - Advanced settings drop down for people already familiar with advertising which allows a 
   - On submit, call the respective platform APIs and store the post record in `social_media_posts`.
3. **Post Performance Tracker** (`/social/posts`) — Table of all social media posts with engagement metrics. Link to the original post. Sort/filter by platform, engagement rate, donation referrals.

---

## Phase 7: Admin Dashboard & System Management

Gated behind the **Admin** role.

1. **Admin Dashboard** (`/admin/dashboard`) — KPI summary: total residents, total active safehouses, total donations this month, recent activity feed (new residents, new donations, incidents). Quick links to all admin tools.
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
8. **Credential Security** — Move all secrets (Google OAuth keys, connection strings, API keys) to environment variables or a secrets manager. Never commit secrets to the repo. Create an `.env.example` file documenting required variables.
9. **Optional: 2FA/MFA** — Add optional TOTP-based two-factor authentication via ASP.NET Identity.
10. **Accessibility** — Target Lighthouse accessibility score of 90+. Use semantic HTML, ARIA labels, keyboard navigation, sufficient color contrast.

---

## Phase 9: ML Pipeline Integration (IS 455 Requirements)

Create Jupyter notebooks in a `ml-pipelines/` directory. Each pipeline follows the full lifecycle: problem framing, data prep, exploration, modeling, evaluation, feature selection, deployment. Integrate predictions into the web app via API endpoints.

1. **Donor Retention & Growth Pipeline** — Predict which donors are likely to churn or increase giving. Surface recommendations on the Financial dashboard and Donor Management page.
2. **Volunteer Optimization Pipeline** — Predict volunteer hours and recommend who/how to maximize volunteer engagement. Surface on the Volunteer page or Admin dashboard.
3. **Donor Outreach Prioritization Pipeline** — Prioritize which donors to reach out to, when, and how. Surface on the Financial Insights page.
4. **Resident Outreach/Follow-up Pipeline** — Predict which former residents need follow-up. Surface on the Counselor dashboard.
5. **Social Media Analytics Pipeline** — Analyze post performance and predict optimal posting strategies. Surface on the Social Media Analytics dashboard.

---

## Phase 10: Deployment & Final Polish

1. **Deploy to a public cloud** (Azure, AWS, or similar). Set up the database (Azure SQL, PostgreSQL, or MySQL for production). Configure environment variables for all secrets.
2. **Connect frontend and backend** under a single domain or configure proper CORS for the production URLs.
3. **Mobile responsiveness** — Verify all pages work on mobile viewports. Use responsive design patterns throughout.
4. **Data seeding** — Import the 17 CSV files into the production database. Create a seed script or migration that loads the initial dataset.
5. **Export functionality** — Verify PDF and CSV export works on Financial reports, tax documents, and any data table.
6. **Lighthouse audit** — Run Lighthouse on all pages. Fix any accessibility, performance, or SEO issues until scores are 90+.
7. **Video walkthroughs** — Record demo videos for IS 413 (app features), IS 414 (security), and IS 455 (ML pipelines).

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
