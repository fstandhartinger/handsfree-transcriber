import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react'
import Index from './pages/Index'
import Plans from './pages/Plans'
import TermsAndConditions from './pages/TermsAndConditions'
import DataPrivacy from './pages/DataPrivacy'
import Imprint from './pages/Imprint'
import { supabase } from './integrations/supabase/client'
import './App.css'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const isLegalPage = ['/terms-and-conditions', '/data-privacy', '/imprint'].includes(location.pathname);

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

  if (isLegalPage) {
    return (
      <Routes>
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/data-privacy" element={<DataPrivacy />} />
        <Route path="/imprint" element={<Imprint />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <main>
        <Routes>
          <Route path="/" element={<Index isAuthenticated={isAuthenticated} />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/auth/callback" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App