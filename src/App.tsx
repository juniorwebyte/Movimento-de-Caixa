import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import CashFlow from './components/CashFlow';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleRequestLogin = () => {
    setShowLanding(false);
    setShowDemo(false);
  };

  const handleRequestDemo = () => {
    setShowLanding(false);
    setShowDemo(true);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setShowDemo(false);
    setShowAdmin(false);
  };

  return (
    <>
      {showLanding ? (
        <LandingPage 
          onRequestLogin={handleRequestLogin} 
          onRequestDemo={handleRequestDemo}
          onOpenAdmin={() => { setShowLanding(false); setShowAdmin(true); }}
        />
      ) : showDemo ? (
        <CashFlow isDemo={true} onBackToLanding={handleBackToLanding} />
      ) : !isAuthenticated ? (
        <Login onBackToLanding={handleBackToLanding} />
      ) : showAdmin ? (
        <AdminPanel onBack={handleBackToLanding} />
      ) : (
        <CashFlow onBackToLanding={handleBackToLanding} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;