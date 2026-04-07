import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { RootLayout } from '@/layouts/RootLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CookieConsent } from '@/components/CookieConsent'
import { useAuth } from '@/hooks/useAuth'

// Public pages
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { ImpactPage } from '@/pages/ImpactPage'
import { DonatePage } from '@/pages/DonatePage'
import { AnonymousDonatePage } from '@/pages/AnonymousDonatePage'
import { VolunteerPage } from '@/pages/VolunteerPage'
import { ResourcesPage } from '@/pages/ResourcesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Donor pages
import { DonorDashboardPage } from '@/pages/donor/DonorDashboardPage'

// Survivor pages
import { CounselingPage } from '@/pages/survivor/CounselingPage'
import { FindHomePage } from '@/pages/survivor/FindHomePage'
import { MyResourcesPage } from '@/pages/survivor/MyResourcesPage'

// Counselor pages (Phase 5)
import { CounselorDashboardPage } from '@/pages/counselor/CounselorDashboardPage'
import { SessionsPage } from '@/pages/counselor/SessionsPage'
import { VisitationsPage } from '@/pages/counselor/VisitationsPage'

// Financial pages
import { FinancialDashboardPage } from '@/pages/financial/FinancialDashboardPage'
import { DonorManagementPage } from '@/pages/financial/DonorManagementPage'
import { DonationRecordsPage } from '@/pages/financial/DonationRecordsPage'
import { InsightsPage } from '@/pages/financial/InsightsPage'
import { ReportsPage } from '@/pages/financial/ReportsPage'

// Social media pages (Phase 6)
import { SocialDashboardPage } from '@/pages/social/SocialDashboardPage'
import { PostsPage } from '@/pages/social/PostsPage'
import { CreatePostPage } from '@/pages/social/CreatePostPage'

// Admin pages (Phase 7)
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { RolesPage } from '@/pages/admin/RolesPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { CaseloadPage } from '@/pages/admin/CaseloadPage'
import { ResidentProfilePage } from '@/pages/admin/ResidentProfilePage'
import { IncidentsPage } from '@/pages/admin/IncidentsPage'
import { InterventionsPage } from '@/pages/admin/InterventionsPage'
import { SafehousesPage } from '@/pages/admin/SafehousesPage'
import { PartnersPage } from '@/pages/admin/PartnersPage'

function DonateRouter() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <DonatePage /> : <AnonymousDonatePage />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/donate" element={<DonateRouter />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/resources" element={<ResourcesPage />} />

          {/* Protected: Donor */}
          <Route element={<ProtectedRoute allowedRoles={['Donor']} />}>
            <Route path="/donor/dashboard" element={<DonorDashboardPage />} />
          </Route>

          {/* Protected: Survivor */}
          <Route element={<ProtectedRoute allowedRoles={['Survivor']} />}>
            <Route path="/survivor/counseling" element={<CounselingPage />} />
            <Route path="/survivor/find-home" element={<FindHomePage />} />
            <Route path="/survivor/resources" element={<MyResourcesPage />} />
          </Route>

          {/* Protected: Counselor (Phase 5) */}
          <Route element={<ProtectedRoute allowedRoles={['Counselor']} />}>
            <Route
              path="/counselor/dashboard"
              element={<CounselorDashboardPage />}
            />
            <Route path="/counselor/sessions" element={<SessionsPage />} />
            <Route
              path="/counselor/visitations"
              element={<VisitationsPage />}
            />
          </Route>

          {/* Protected: Financial */}
          <Route element={<ProtectedRoute allowedRoles={['Financial']} />}>
            <Route
              path="/financial/dashboard"
              element={<FinancialDashboardPage />}
            />
            <Route path="/financial/donors" element={<DonorManagementPage />} />
            <Route
              path="/financial/donations"
              element={<DonationRecordsPage />}
            />
            <Route path="/financial/insights" element={<InsightsPage />} />
            <Route path="/financial/reports" element={<ReportsPage />} />
          </Route>

          {/* Protected: SocialMedia (Phase 6) */}
          <Route element={<ProtectedRoute allowedRoles={['SocialMedia']} />}>
            <Route path="/social/dashboard" element={<SocialDashboardPage />} />
            <Route path="/social/posts" element={<PostsPage />} />
            <Route path="/social/post" element={<CreatePostPage />} />
          </Route>

          {/* Protected: Admin (Phase 7) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/roles" element={<RolesPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/caseload" element={<CaseloadPage />} />
            <Route
              path="/admin/caseload/:id"
              element={<ResidentProfilePage />}
            />
            <Route path="/admin/incidents" element={<IncidentsPage />} />
            <Route
              path="/admin/interventions"
              element={<InterventionsPage />}
            />
            <Route path="/admin/safehouses" element={<SafehousesPage />} />
            <Route path="/admin/partners" element={<PartnersPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <CookieConsent />
    </AuthProvider>
  )
}

export default App
