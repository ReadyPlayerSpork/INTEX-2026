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

          {/* Protected: Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/roles" element={<RolesPage />} />
            {/* More admin pages added in Phase 7 */}
          </Route>

          {/* Protected: Financial */}
          <Route element={<ProtectedRoute allowedRoles={['Financial']} />}>
            {/* Financial pages added in Phase 4 */}
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
            {/* Survivor pages added in Phase 3 */}
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
