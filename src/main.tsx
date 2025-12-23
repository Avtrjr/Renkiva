import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // Initialize i18n
import { AuthProvider } from './hooks/useAuth'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
