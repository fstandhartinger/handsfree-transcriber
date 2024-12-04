import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react'
import Index from './pages/Index'
import AuthPage from './pages/Auth'
import UpdateNotification from './components/UpdateNotification'
import { supabase } from './integrations/supabase/client'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if running in PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Running in PWA mode');
    } else {
      console.log('Running in browser mode');
    }

    // Check service worker support
    if ('serviceWorker' in navigator) {
      console.log('Service Worker is supported');
      
      // Check if service worker is active
      navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker is active with scope:', registration.scope);
      }).catch(error => {
        console.error('Service Worker ready error:', error);
      });
    } else {
      console.log('Service Worker is not supported');
    }

    // Check authentication status
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setIsAuthenticated(!!session);
    });
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Index /> : <Navigate to="/auth" />} 
        />
      </Routes>
      <UpdateNotification />
      <Toaster />
    </Router>
  )
}

export default App