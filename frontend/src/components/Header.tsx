import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, User as UserIcon, LogOut, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleAuth: () => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleAuth, setActiveTab, activeTab }) => {
  const { 
    currentUser, 
    logoutUser, 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    markNotificationsAsRead,
    clearNotifications
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markNotificationsAsRead();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProfileClick = (tab: string) => {
    setShowProfileMenu(false);
    setActiveTab(tab);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logoutUser();
    setActiveTab('home');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {currentUser && (
          <button onClick={onToggleSidebar} className="desktop-only" style={{ padding: '8px', color: 'var(--text-primary)' }}>
            <Menu size={20} />
          </button>
        )}
        <div 
          onClick={() => setActiveTab('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: '8px' }}
        >
          {/* Logo resembling YouTube logo but representing hostel food */}
          <div style={{
            background: 'var(--brand-gradient)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 10px rgba(255, 69, 58, 0.2)'
          }}>
            <span style={{ fontSize: '18px' }}>🍲</span>
            <span>MealTube</span>
          </div>
        </div>

        {/* If logged out, render nav links in header */}
        {!currentUser && (
          <nav className="header-nav">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`header-nav-link ${activeTab === 'home' ? 'active' : ''}`}
            >
              Today's Menu
            </button>
            <button 
              onClick={() => setActiveTab('subscriptions')} 
              className={`header-nav-link ${activeTab === 'subscriptions' ? 'active' : ''}`}
            >
              Meal Plans
            </button>
            <button 
              onClick={() => setActiveTab('extra')} 
              className={`header-nav-link ${activeTab === 'extra' ? 'active' : ''}`}
            >
              Order Extra
            </button>
          </nav>
        )}
      </div>

      <div className="header-center">
        <div className="search-box">
          <span className="search-icon-inside">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search meals, ingredients or days..." 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="search-button">
            <Search size={18} />
          </button>
        </div>
      </div>

      <div className="header-right">
        {/* Notifications Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            onClick={handleNotificationClick}
            style={{ 
              position: 'relative', 
              padding: '8px', 
              color: 'var(--text-primary)',
              borderRadius: '50%',
              backgroundColor: showNotifications ? 'var(--bg-pill)' : 'transparent'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: 'var(--brand-color)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-primary)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              width: '320px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid var(--border-color)', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    style={{ fontSize: '11px', color: 'var(--brand-color)' }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: n.isRead ? 'transparent' : 'rgba(255, 69, 58, 0.05)',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ lineHeight: '1.4', marginBottom: '4px' }}>{n.message}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Auth/Profile section */}
        {currentUser ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }} ref={profileRef}>
            {/* Active Plan Badge */}
            {currentUser.role === 'admin' ? (
              <span className="badge badge-danger desktop-only">ADMIN</span>
            ) : currentUser.subscription ? (
              <span className="badge badge-success desktop-only" style={{ textTransform: 'uppercase' }}>
                {currentUser.subscription.tier} PLAN
              </span>
            ) : (
              <span className="badge badge-warning desktop-only">NO PLAN</span>
            )}

            {/* Profile Avatar */}
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: currentUser.role === 'admin' 
                  ? 'var(--brand-gradient)' 
                  : 'linear-gradient(135deg, #0a84ff 0%, #30b0c7 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>

            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '200px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                padding: '8px 0'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {currentUser.email}
                  </div>
                </div>
                <button 
                  onClick={() => handleProfileClick('profile')}
                  className="sidebar-item"
                  style={{ width: '100%', border: 'none', borderRadius: 0, margin: 0, fontSize: '13px' }}
                >
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </button>
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => handleProfileClick('admin')}
                    className="sidebar-item"
                    style={{ width: '100%', border: 'none', borderRadius: 0, margin: 0, fontSize: '13px' }}
                  >
                    <CheckSquare size={16} />
                    <span>Admin Dashboard</span>
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="sidebar-item"
                  style={{ width: '100%', border: 'none', borderRadius: 0, margin: 0, fontSize: '13px', color: 'var(--danger)' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onToggleAuth} 
            className="btn btn-secondary"
            style={{ 
              color: 'var(--info)', 
              borderColor: 'rgba(10, 132, 255, 0.4)',
              height: '36px',
              padding: '0 12px',
              fontSize: '13px'
            }}
          >
            <UserIcon size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
