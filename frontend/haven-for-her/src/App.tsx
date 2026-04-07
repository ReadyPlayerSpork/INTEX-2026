import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'

type SessionResponse = {
  isAuthenticated: boolean
  userName: string | null
  email: string | null
  roles: string[]
}

const unauthenticatedSession: SessionResponse = {
  isAuthenticated: false,
  userName: null,
  email: null,
  roles: [],
}

function Home() {
  const [session, setSession] = useState<SessionResponse>(unauthenticatedSession)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadSession() {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = (await response.json()) as SessionResponse
        setSession(payload)
        setStatus('success')
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    void loadSession()

    return () => abortController.abort()
  }, [])

  return (
    <div className="app-shell container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <span className="badge text-bg-primary mb-3">Setup Check</span>
              <h1 className="display-6 fw-semibold mb-3">Haven for Her</h1>
              <p className="lead text-body-secondary mb-4">
                This starter screen confirms the React frontend, Bootstrap styles, React Router,
                and ASP.NET auth API can communicate in development.
              </p>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="fw-semibold mb-1">Frontend</div>
                    <div className="text-body-secondary">React + TypeScript + Vite</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="fw-semibold mb-1">Styling</div>
                    <div className="text-body-secondary">Bootstrap loaded from npm</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="fw-semibold mb-1">Backend</div>
                    <div className="text-body-secondary">ASP.NET Core auth endpoint via Vite proxy</div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-4">
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.assign('/api/auth/external-login?provider=Google')}
                  type="button"
                >
                  Try Google Login
                </button>
                <Link className="btn btn-outline-secondary" to="/login">
                  Placeholder Login Route
                </Link>
              </div>

              <div className="status-alert mb-0" role="status">
                {status === 'loading' && (
                  <div className="alert alert-info mb-0">Checking `/api/auth/me`…</div>
                )}
                {status === 'success' && (
                  <div className="alert alert-success mb-0">
                    <div className="fw-semibold mb-2">Backend communication is working.</div>
                    <div>Authenticated: {session.isAuthenticated ? 'Yes' : 'No'}</div>
                    <div>User: {session.userName ?? 'None'}</div>
                    <div>Email: {session.email ?? 'None'}</div>
                    <div>Roles: {session.roles.length > 0 ? session.roles.join(', ') : 'None'}</div>
                  </div>
                )}
                {status === 'error' && (
                  <div className="alert alert-danger mb-0">
                    Could not reach `/api/auth/me`: {errorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceholderPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h1 className="h3 mb-3">Route Placeholder</h1>
              <p className="text-body-secondary mb-0">
                React Router is configured and ready for the real application routes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<PlaceholderPage />} path="/login" />
    </Routes>
  )
}

export default App
