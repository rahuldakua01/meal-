import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, ShieldAlert, User, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  onToggleAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, onToggleAuth }) => {
  const { currentUser, logoutUser } = useApp();

  const handleTabClick = (tab: string) => {
    if (tab === 'profile' && !currentUser) {
      onToggleAuth();
      return;
    }
    setActiveTab(tab);
  };

  const handleLogout = () => {
    logoutUser();
    setActiveTab('home');
  };

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className={`sidebar-item ${activeTab === 'home' ? 'active' : ''}`} 
        onClick={() => handleTabClick('home')}
      >
        <Home size={22} />
        <span>Today's Menu</span>
      </button>

      <button 
        className={`sidebar-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
        onClick={() => handleTabClick('subscriptions')}
      >
        <UtensilsCrossed size={22} />
        <span>Meal Plans</span>
      </button>

      <button 
        className={`sidebar-item ${activeTab === 'extra' ? 'active' : ''}`}
        onClick={() => handleTabClick('extra')}
      >
        <ShoppingBag size={22} />
        <span>Order Extra</span>
      </button>

      {currentUser && currentUser.role === 'admin' && (
        <button 
          className={`sidebar-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => handleTabClick('admin')}
        >
          <ShieldAlert size={22} />
          <span>Admin Panel</span>
        </button>
      )}

      {currentUser ? (
        <>
          <button 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabClick('profile')}
          >
            <User size={22} />
            <span>Profile</span>
          </button>
          
          <button 
            className="sidebar-item desktop-only" 
            onClick={handleLogout}
            style={{ marginTop: 'auto' }}
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <button 
          className="sidebar-item" 
          onClick={onToggleAuth}
          style={{ marginTop: 'auto' }}
        >
          <User size={22} />
          <span>Sign In</span>
        </button>
      )}
    </aside>
  );
};
