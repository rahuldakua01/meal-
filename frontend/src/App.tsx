import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { Home } from './pages/Home';
import { Subscriptions } from './pages/Subscriptions';
import { OrderExtra } from './pages/OrderExtra';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import './App.css';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Security guard for tabs
  React.useEffect(() => {
    if (activeTab === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
      setActiveTab('home');
    }
    if (activeTab === 'profile' && !currentUser) {
      setActiveTab('home');
      setAuthModalOpen(true);
    }
  }, [activeTab, currentUser]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} onToggleAuth={() => setAuthModalOpen(true)} />;
      case 'subscriptions':
        return <Subscriptions onToggleAuth={() => setAuthModalOpen(true)} />;
      case 'extra':
        return <OrderExtra onToggleAuth={() => setAuthModalOpen(true)} />;
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <Home setActiveTab={setActiveTab} onToggleAuth={() => setAuthModalOpen(true)} />;
    }
  };

  return (
    <div className={`app-container ${!currentUser ? 'logged-out' : ''}`}>
      <Header 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleAuth={() => setAuthModalOpen(true)}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />
      
      <div className="main-layout">
        {currentUser && (
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            onToggleAuth={() => setAuthModalOpen(true)}
          />
        )}
        
        <main className={`content-wrapper ${sidebarCollapsed && currentUser ? 'collapsed' : ''} ${!currentUser ? 'full-width' : ''}`}>
          {renderActivePage()}
        </main>
      </div>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
