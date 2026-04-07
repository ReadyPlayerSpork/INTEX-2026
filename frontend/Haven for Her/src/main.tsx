import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './scss/styles.scss'
// All Bootstrap JS (Popper pulled in by Bootstrap); use `bootstrap.Modal`, etc. when needed.
import * as bootstrap from 'bootstrap'
import './index.css'
import App from './App.tsx'

void bootstrap

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
