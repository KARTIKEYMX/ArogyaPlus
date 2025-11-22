import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from './types';
import { Splash } from './components/Splash';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AIAssistant } from './components/AIAssistant';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [isSplashingExiting, setIsSplashExiting] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = dataService.getUser();
    if (storedUser) {
      setUser(storedUser);
      // Don't auto-switch view here, let splash finish first for UX
    }
  }, []);

  const handleSplashComplete = () => {
    setIsSplashExiting(true);
    setTimeout(() => {
      if (user) {
        setView(AppView.DASHBOARD);
      } else {
        setView(AppView.LOGIN);
      }
      setIsSplashExiting(false);
    }, 800);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    dataService.logout();
    setUser(null);
    setView(AppView.LOGIN);
  };

  return (
    <div className="font-sans antialiased">
      {view === AppView.SPLASH && (
        <Splash onComplete={handleSplashComplete} isExiting={isSplashingExiting} />
      )}

      {view === AppView.LOGIN && (
        <Login onLoginSuccess={handleLoginSuccess} onBack={() => setView(AppView.SPLASH)} />
      )}

      {view === AppView.DASHBOARD && user && (
        <>
          <Dashboard user={user} onLogout={handleLogout} />
          <AIAssistant />
        </>
      )}
    </div>
  );
};

export default App;