import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<<< HEAD:frontend/Haven-for-Her/src/main.tsx
========
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
>>>>>>>> codex/setup-alignment:frontend/haven-for-her/src/main.tsx
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
