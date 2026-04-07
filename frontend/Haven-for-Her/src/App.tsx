import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { RootLayout } from '@/layouts/RootLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected: any authenticated user */}
          <Route element={<ProtectedRoute />}>
            {/* Placeholder — pages will be added in later phases */}
          </Route>

          {/* Protected: Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            {/* Placeholder — admin pages added in Phase 7 */}
          </Route>

          {/* Protected: Financial */}
          <Route element={<ProtectedRoute allowedRoles={['Financial']} />}>
            {/* Placeholder — financial pages added in Phase 4 */}
          </Route>

          {/* Protected: Counselor */}
          <Route element={<ProtectedRoute allowedRoles={['Counselor']} />}>
            {/* Placeholder — counselor pages added in Phase 5 */}
          </Route>

          {/* Protected: SocialMedia */}
          <Route element={<ProtectedRoute allowedRoles={['SocialMedia']} />}>
            {/* Placeholder — social media pages added in Phase 6 */}
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
