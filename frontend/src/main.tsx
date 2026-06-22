import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { FormatProvider } from './FormatContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FormatProvider>
      <App />
    </FormatProvider>
  </StrictMode>,
)
