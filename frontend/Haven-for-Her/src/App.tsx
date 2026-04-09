import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { RootLayout } from '@/layouts/RootLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CookieConsent } from '@/components/CookieConsent'
import { RoutePageFallback } from '@/components/RoutePageFallback'
import { useAuth } from '@/hooks/useAuth'

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)
const ImpactPage = lazy(() =>
  import('@/pages/ImpactPage').then((m) => ({ default: m.ImpactPage })),
)
const DonatePage = lazy(() =>
  import('@/pages/DonatePage').then((m) => ({ default: m.DonatePage })),
)
const AnonymousDonatePage = lazy(() =>
  import('@/pages/AnonymousDonatePage').then((m) => ({
    default: m.AnonymousDonatePage,
  })),
)
const VolunteerPage = lazy(() =>
  import('@/pages/VolunteerPage').then((m) => ({ default: m.VolunteerPage })),
)
const ResourcesPage = lazy(() =>
  import('@/pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)
const AccountPage = lazy(() =>
  import('@/pages/AccountPage').then((m) => ({
    default: m.AccountPage,
  })),
)

const DonorDashboardPage = lazy(() =>
  import('@/pages/donor/DonorDashboardPage').then((m) => ({
    default: m.DonorDashboardPage,
  })),
)

const CounselingPage = lazy(() =>
  import('@/pages/survivor/CounselingPage').then((m) => ({
    default: m.CounselingPage,
  })),
)
const FindHomePage = lazy(() =>
  import('@/pages/survivor/FindHomePage').then((m) => ({
    default: m.FindHomePage,
  })),
)
const MyResourcesPage = lazy(() =>
  import('@/pages/survivor/MyResourcesPage').then((m) => ({
    default: m.MyResourcesPage,
  })),
)

const CounselorDashboardPage = lazy(() =>
  import('@/pages/counselor/CounselorDashboardPage').then((m) => ({
    default: m.CounselorDashboardPage,
  })),
)
const SessionsPage = lazy(() =>
  import('@/pages/counselor/SessionsPage').then((m) => ({
    default: m.SessionsPage,
  })),
)
const VisitationsPage = lazy(() =>
  import('@/pages/counselor/VisitationsPage').then((m) => ({
    default: m.VisitationsPage,
  })),
)

const FinancialDashboardPage = lazy(() =>
  import('@/pages/financial/FinancialDashboardPage').then((m) => ({
    default: m.FinancialDashboardPage,
  })),
)
const DonorManagementPage = lazy(() =>
  import('@/pages/financial/DonorManagementPage').then((m) => ({
    default: m.DonorManagementPage,
  })),
)
const DonationRecordsPage = lazy(() =>
  import('@/pages/financial/DonationRecordsPage').then((m) => ({
    default: m.DonationRecordsPage,
  })),
)
const InsightsPage = lazy(() =>
  import('@/pages/financial/InsightsPage').then((m) => ({
    default: m.InsightsPage,
  })),
)
const ReportsPage = lazy(() =>
  import('@/pages/financial/ReportsPage').then((m) => ({
    default: m.ReportsPage,
  })),
)

const SocialDashboardPage = lazy(() =>
  import('@/pages/social/SocialDashboardPage').then((m) => ({
    default: m.SocialDashboardPage,
  })),
)
const PostsPage = lazy(() =>
  import('@/pages/social/PostsPage').then((m) => ({ default: m.PostsPage })),
)
const CreatePostPage = lazy(() =>
  import('@/pages/social/CreatePostPage').then((m) => ({
    default: m.CreatePostPage,
  })),
)

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)
const RolesPage = lazy(() =>
  import('@/pages/admin/RolesPage').then((m) => ({ default: m.RolesPage })),
)
const UsersPage = lazy(() =>
  import('@/pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })),
)
const CaseloadPage = lazy(() =>
  import('@/pages/admin/CaseloadPage').then((m) => ({
    default: m.CaseloadPage,
  })),
)
const ResidentProfilePage = lazy(() =>
  import('@/pages/admin/ResidentProfilePage').then((m) => ({
    default: m.ResidentProfilePage,
  })),
)
const IncidentsPage = lazy(() =>
  import('@/pages/admin/IncidentsPage').then((m) => ({
    default: m.IncidentsPage,
  })),
)
const InterventionsPage = lazy(() =>
  import('@/pages/admin/InterventionsPage').then((m) => ({
    default: m.InterventionsPage,
  })),
)
const SafehousesPage = lazy(() =>
  import('@/pages/admin/SafehousesPage').then((m) => ({
    default: m.SafehousesPage,
  })),
)
const PartnersPage = lazy(() =>
  import('@/pages/admin/PartnersPage').then((m) => ({
    default: m.PartnersPage,
  })),
)
const AnalyticsPage = lazy(() =>
  import('@/pages/admin/AnalyticsPage').then((m) => ({
    default: m.AnalyticsPage,
  })),
)

const SupporterDetailPage = lazy(() =>
  import('@/pages/financial/SupporterDetailPage').then((m) => ({
    default: m.SupporterDetailPage,
  })),
)

const SessionDetailPage = lazy(() =>
  import('@/pages/counselor/SessionDetailPage').then((m) => ({
    default: m.SessionDetailPage,
  })),
)
const CaseConferencesPage = lazy(() =>
  import('@/pages/counselor/CaseConferencesPage').then((m) => ({
    default: m.CaseConferencesPage,
  })),
)

const RolePortalLayout = lazy(() =>
  import('@/layouts/RolePortalLayout').then((m) => ({
    default: m.RolePortalLayout,
  })),
)

function DonateRouter() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 px-4 py-24"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="text-muted-foreground text-sm">Checking your session…</p>
      </div>
    )
  }
  return isAuthenticated ? <DonatePage /> : <AnonymousDonatePage />
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<RoutePageFallback />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/donate" element={<DonateRouter />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/resources" element={<ResourcesPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<AccountPage />} />
              <Route
                path="/account/security"
                element={<Navigate to="/account" replace />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Donor']} />}>
              <Route path="/donor/dashboard" element={<DonorDashboardPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Survivor']} />}>
              <Route path="/survivor/counseling" element={<CounselingPage />} />
              <Route path="/survivor/find-home" element={<FindHomePage />} />
              <Route path="/survivor/resources" element={<MyResourcesPage />} />
            </Route>

            <Route
              path="/counselor"
              element={<ProtectedRoute allowedRoles={['Counselor', 'Admin']} />}
            >
              <Route element={<RolePortalLayout role="counselor" />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CounselorDashboardPage />} />
                <Route path="sessions" element={<SessionsPage />} />
                <Route path="sessions/:id" element={<SessionDetailPage />} />
                <Route path="visitations" element={<VisitationsPage />} />
                <Route path="case-conferences" element={<CaseConferencesPage />} />
              </Route>
            </Route>

            <Route
              path="/financial"
              element={<ProtectedRoute allowedRoles={['Financial', 'Admin']} />}
            >
              <Route element={<RolePortalLayout role="financial" />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<FinancialDashboardPage />} />
                <Route path="donors" element={<DonorManagementPage />} />
                <Route path="donors/:id" element={<SupporterDetailPage />} />
                <Route path="donations" element={<DonationRecordsPage />} />
                <Route path="insights" element={<InsightsPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Route>

            <Route
              path="/social"
              element={<ProtectedRoute allowedRoles={['SocialMedia', 'Admin']} />}
            >
              <Route element={<RolePortalLayout role="social" />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SocialDashboardPage />} />
                <Route path="posts" element={<PostsPage />} />
                <Route path="post" element={<CreatePostPage />} />
              </Route>
            </Route>

            <Route
              path="/admin"
              element={<ProtectedRoute allowedRoles={['Admin']} />}
            >
              <Route element={<RolePortalLayout role="admin" />}>
                <Route
                  index
                  element={<Navigate to="dashboard" replace />}
                />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="roles" element={<RolesPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="caseload" element={<CaseloadPage />} />
                <Route path="caseload/:id" element={<ResidentProfilePage />} />
                <Route path="incidents" element={<IncidentsPage />} />
                <Route path="interventions" element={<InterventionsPage />} />
                <Route path="safehouses" element={<SafehousesPage />} />
                <Route path="partners" element={<PartnersPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
      <CookieConsent />
    </AuthProvider>
  )
}

export default App
