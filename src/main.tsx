import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupStoragePolicies } from './utils/setupStorage'

// Setup storage policies
setupStoragePolicies().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch(error => {
  console.error('Failed to setup storage policies:', error);
  // Still render the app even if storage setup fails
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});