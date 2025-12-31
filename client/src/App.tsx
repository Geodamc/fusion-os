import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Rocket, Settings, Cpu, Home, ArrowLeft } from 'lucide-react';

// Pages (We will implement them next)
import Dashboard from './pages/Dashboard';
import SetupWizard from './pages/SetupWizard';
import Configurator from './pages/Configurator';
import ControlCenter from './pages/ControlCenter';
import ThemeToggle from './components/ui/ThemeToggle';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide nav on dashboard to keep the "Hub" feel, or show a minimal one?
    // Let's show a minimal back button if not on dashboard
    if (location.pathname === '/') return null;

    return (
        <div className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
            <button
                onClick={() => navigate('/')}
                className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
                <Home size={16} />
                <span className="text-sm font-medium">Hub</span>
            </button>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <div className="min-h-screen text-white font-sans selection:bg-orange-500/30">
                <ThemeToggle />
                <Navbar />

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/setup" element={<SetupWizard />} />
                    <Route path="/config" element={<Configurator />} />
                    <Route path="/control" element={<ControlCenter />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
