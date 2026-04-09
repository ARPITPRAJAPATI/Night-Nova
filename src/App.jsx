import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Auth from './pages/Auth'
import VenueDetail from './pages/VenueDetail'

import Dashboard from './pages/Dashboard'
import Footer from './components/Footer'

export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  return (
    <div className="bg-brand-dark min-h-screen font-sans text-text-primary selection:bg-brand-accent selection:text-white">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/venue/:id" element={<VenueDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      {!isAuthPage && <Footer />}
    </div>
  )
}
