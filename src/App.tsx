import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import Index from './pages/Index'
import UpdateNotification from './components/UpdateNotification'
import InstallButton from './components/InstallButton'
import './App.css'

function App() {
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