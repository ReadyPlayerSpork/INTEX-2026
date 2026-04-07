import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { RootLayout } from '@/layouts/RootLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CookieConsent } from '@/components/CookieConsent'
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
import { RolesPage } from '@/pages/admin/RolesPage'
import { DonorDashboardPage } from '@/pages/donor/DonorDashboardPage'
import { FinancialDashboardPage } from '@/pages/financial/FinancialDashboardPage'
import { DonorManagementPage } from '@/pages/financial/DonorManagementPage'
import { DonationRecordsPage } from '@/pages/financial/DonationRecordsPage'
import { InsightsPage } from '@/pages/financial/InsightsPage'
import { ReportsPage } from '@/pages/financial/ReportsPage'
import { CounselingPage } from '@/pages/survivor/CounselingPage'
import { FindHomePage } from '@/pages/survivor/FindHomePage'
import { MyResourcesPage } from '@/pages/survivor/MyResourcesPage'

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
          <Route path="/donate/anonymous" element={<AnonymousDonatePage />} />

          {/* Protected: any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
          </Route>

          {/* Protected: Donor */}
          <Route element={<ProtectedRoute allowedRoles={['Donor']} />}>
            <Route path="/donor/dashboard" element={<DonorDashboardPage />} />
          </Route>

          {/* Protected: Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/roles" element={<RolesPage />} />
            {/* More admin pages added in Phase 7 */}
          </Route>

          {/* Protected: Financial */}
          <Route element={<ProtectedRoute allowedRoles={['Financial']} />}>
            <Route path="/financial/dashboard" element={<FinancialDashboardPage />} />
            <Route path="/financial/donors" element={<DonorManagementPage />} />
            <Route path="/financial/donations" element={<DonationRecordsPage />} />
            <Route path="/financial/insights" element={<InsightsPage />} />
            <Route path="/financial/reports" element={<ReportsPage />} />
          </Route>

          {/* Protected: Counselor */}
          <Route element={<ProtectedRoute allowedRoles={['Counselor']} />}>
            {/* Counselor pages added in Phase 5 */}
          </Route>

          {/* Protected: SocialMedia */}
          <Route element={<ProtectedRoute allowedRoles={['SocialMedia']} />}>
            {/* Social media pages added in Phase 6 */}
          </Route>

          {/* Protected: Survivor */}
          <Route element={<ProtectedRoute allowedRoles={['Survivor']} />}>
            <Route path="/survivor/counseling" element={<CounselingPage />} />
            <Route path="/survivor/find-home" element={<FindHomePage />} />
            <Route path="/survivor/resources" element={<MyResourcesPage />} />
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
