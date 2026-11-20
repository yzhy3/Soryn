import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BioLinkApp from './pages/BioLinkApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BioLinkApp />
  </StrictMode>,
)
