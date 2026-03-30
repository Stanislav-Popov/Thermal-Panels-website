import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './admin/AdminApp.jsx'
import './index.css'
import App from './App.jsx'

const isAdminMode =
  window.location.pathname.startsWith('/admin') ||
  window.location.hash.startsWith('#admin') ||
  window.location.hash.startsWith('#/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminMode ? <AdminApp /> : <App />}
  </StrictMode>,
)
