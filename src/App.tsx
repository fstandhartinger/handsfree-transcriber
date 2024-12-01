import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react'
import Index from './pages/Index'
import UpdateNotification from './components/UpdateNotification'
import InstallButton from './components/InstallButton'
import './App.css'

function App() {
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
  }, []);

  return (
    <Router>
      <UpdateNotification />
      <InstallButton />
      <Index />
      <Toaster />
    </Router>
  )
}

export default App