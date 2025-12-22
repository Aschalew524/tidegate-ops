import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { useClock } from './hooks/useClock.ts'
import { HarborProvider } from './state/HarborContext.tsx'

function Root() {
  const now = useClock()
  return (
    <HarborProvider now={now}>
      <App />
    </HarborProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
