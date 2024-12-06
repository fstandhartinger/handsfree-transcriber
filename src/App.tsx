import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react'
import Index from './pages/Index'
import UpdateNotification from './components/UpdateNotification'
import { supabase } from './integrations/supabase/client'
import ProfileButton from './components/ProfileButton'
import { SettingsDialog } from '@/components/SettingsDialog'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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
      <div className="h-16 flex items-center justify-end px-4 fixed top-0 right-0 w-full gap-4 bg-background z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <SettingsDialog 
          open={showSettings} 
          onOpenChange={setShowSettings} 
        />
        {isAuthenticated && <ProfileButton />}
      </div>
      <Routes>
        <Route path="/*" element={<Index isAuthenticated={isAuthenticated} />} />
      </Routes>
      <UpdateNotification />
      <Toaster />
    </Router>
  )
}

export default App