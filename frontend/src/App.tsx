import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { authApi } from './services/api';

import { GovUtilityHeader } from './components/GovUtilityHeader';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GovFooter } from './components/GovFooter';
import { MpeCalculatorModal } from './components/MpeCalculatorModal';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManufacturersPage } from './pages/ManufacturersPage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { SessionsPage } from './pages/SessionsPage';
import { TestWizardPage } from './pages/TestWizardPage';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMpeModalOpen, setIsMpeModalOpen] = useState<boolean>(false);
  
  // Accessibility state
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await authApi.getMe();
      setUser(u);
    } catch (err) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const fontScaleClass = 
    fontSize === 'sm' ? 'font-scale-sm' :
    fontSize === 'lg' ? 'font-scale-lg' : 'font-scale-base';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p className="text-xs text-amber-400 font-mono font-semibold uppercase tracking-wider">
          Connecting to Legal Metrology Portal...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${fontScaleClass} ${isHighContrast ? 'high-contrast' : ''}`}>
        <GovUtilityHeader
          fontSize={fontSize}
          setFontSize={setFontSize}
          isHighContrast={isHighContrast}
          setIsHighContrast={setIsHighContrast}
        />
        <LoginPage onLoginSuccess={checkAuth} />
        <GovFooter />
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen bg-slate-50 flex flex-col ${fontScaleClass} ${isHighContrast ? 'high-contrast' : ''}`}>
        
        {/* Top Government Accessibility Toolbar */}
        <GovUtilityHeader
          fontSize={fontSize}
          setFontSize={setFontSize}
          isHighContrast={isHighContrast}
          setIsHighContrast={setIsHighContrast}
        />

        {/* Primary Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          onOpenMpeCalculator={() => setIsMpeModalOpen(true)}
        />

        {/* Main Body */}
        <div className="flex flex-1">
          <Sidebar user={user} />

          <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/manufacturers" element={<ManufacturersPage />} />
              <Route path="/instruments" element={<InstrumentsPage />} />
              <Route path="/sessions" element={<SessionsPage user={user} />} />
              <Route path="/test-wizard/:id" element={<TestWizardPage user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Live MPE Calculator Modal */}
        <MpeCalculatorModal
          isOpen={isMpeModalOpen}
          onClose={() => setIsMpeModalOpen(false)}
        />

        {/* GIGW Compliant Government Footer */}
        <GovFooter />
      </div>
    </Router>
  );
};

export default App;
