import React, { useState, useEffect } from 'react';
import { UserProfile, NotificationItem } from '../types';
import { DataService } from '../services/dataService';
import {
  Zap,
  Bell,
  User,
  LogOut,
  MapPin,
  Calendar,
  PlusCircle,
  Menu,
  X,
  Database,
  CheckCircle,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const isLiveSupabase = DataService.isSupabaseLive();

  useEffect(() => {
    if (currentUser) {
      DataService.getUserNotifications(currentUser.id).then(setNotifications);
    }
  }, [currentUser, currentRoute]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleMarkAllRead = async () => {
    for (const notif of notifications) {
      if (!notif.read_at) {
        await DataService.markNotificationRead(notif.id);
      }
    }
    if (currentUser) {
      const updated = await DataService.getUserNotifications(currentUser.id);
      setNotifications(updated);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          {/* Brand Logo */}
          <button
            type="button"
            className="brand-logo"
            onClick={() => onNavigate('/')}
            style={{ background: 'transparent', textAlign: 'left' }}
          >
            <div className="brand-icon-wrap">
              <Zap size={22} fill="currentColor" />
            </div>
            <span>
              Charge<span style={{ color: 'var(--green-500)' }}>Neighbor</span>
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="nav-links">
            <button
              type="button"
              className={`nav-link ${currentRoute === '/' ? 'active' : ''}`}
              onClick={() => onNavigate('/')}
              style={{ background: 'transparent' }}
            >
              Home
            </button>
            <button
              type="button"
              className={`nav-link ${currentRoute === '/owner/dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('/owner/dashboard')}
              style={{ background: 'transparent' }}
            >
              Find Chargers
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                if (currentRoute === '/') {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('/#how-it-works');
                }
              }}
              style={{ background: 'transparent' }}
            >
              How It Works
            </button>
            <button
              type="button"
              className={`nav-link ${currentRoute === '/provider/register' ? 'active' : ''}`}
              onClick={() => onNavigate('/provider/register')}
              style={{ background: 'transparent' }}
            >
              Become a Provider
            </button>
          </nav>

          {/* Status & User Actions */}
          <div className="nav-actions">
            {/* Supabase status badge */}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 'var(--radius-pill)',
                background: isLiveSupabase ? 'var(--green-50)' : '#f1f5f9',
                color: isLiveSupabase ? 'var(--green-600)' : 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: isLiveSupabase ? '1px solid var(--green-100)' : '1px solid var(--border-light)',
              }}
              title="Click for database configuration details"
            >
              <Database size={13} />
              <span className="hide-on-mobile">{isLiveSupabase ? 'Cloud DB' : 'Local Storage'}</span>
            </button>

            {/* If logged in */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                {/* Notifications Bell */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    style={{ position: 'relative' }}
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          background: 'var(--red-500)',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          borderRadius: '50%',
                          width: 18,
                          height: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 48,
                        right: 0,
                        width: 320,
                        background: '#ffffff',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-light)',
                        zIndex: 1100,
                        padding: 16,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            style={{ background: 'transparent', color: 'var(--green-600)', fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: n.read_at ? 'transparent' : 'var(--green-50)',
                                border: '1px solid var(--border-light)',
                                fontSize: '0.82rem',
                              }}
                            >
                              <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: 2 }}>{n.title}</div>
                              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.35 }}>{n.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Shortcut */}
                {currentUser.role === 'owner' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-navy btn-sm"
                      onClick={() => onNavigate('/owner/dashboard')}
                    >
                      <MapPin size={15} /> Find Chargers
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigate('/owner/bookings')}
                    >
                      <Calendar size={15} /> Bookings
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-navy btn-sm"
                      onClick={() => onNavigate('/provider/dashboard')}
                    >
                      Provider Dashboard
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onNavigate('/provider/register-charger')}
                    >
                      <PlusCircle size={15} /> Add Charger
                    </button>
                  </>
                )}

                {/* Logout Button */}
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={onLogout}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              /* If Logged Out */
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('/owner/login')}
                >
                  <User size={15} /> Driver Login
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate('/provider/login')}
                >
                  Host Login ⚡
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              style={{ display: 'none' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Supabase & Deployment Config Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Database color="var(--green-600)" />
                  Backend & Database Status
                </h3>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  style={{ background: 'transparent', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  background: isLiveSupabase ? 'var(--green-50)' : 'var(--blue-50)',
                  padding: 16,
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 16,
                  border: isLiveSupabase ? '1px solid var(--green-100)' : '1px solid #bfdbfe',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} color={isLiveSupabase ? 'var(--green-600)' : 'var(--blue-500)'} />
                  {isLiveSupabase ? 'Connected to Live Supabase' : 'Offline / Local Storage Active'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {isLiveSupabase
                    ? 'All authentication, charger discovery, and atomic slot reservations are persisting in your Supabase project.'
                    : 'ChargeNeighbor is fully functional with persistent local storage, seeded community chargers in India & global metro hubs, atomic double-booking protection, and Google Maps directions.'}
                </p>
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>How to Activate Live Supabase in 2 Minutes:</h4>
              <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.6, marginBottom: 16 }}>
                <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-600)', fontWeight: 600 }}>supabase.com</a></li>
                <li>Run the migration script provided in <code>supabase/migrations/20261019_init_schema.sql</code> in the Supabase SQL Editor.</li>
                <li>Add your credentials to <code>.env</code>:
                  <pre style={{ background: '#0a192f', color: '#10b981', padding: '10px 12px', borderRadius: 6, marginTop: 6, fontSize: '0.78rem' }}>
                    VITE_SUPABASE_URL=https://your-id.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </pre>
                </li>
              </ol>

              <button
                type="button"
                className="btn btn-navy"
                style={{ width: '100%' }}
                onClick={() => setShowConfigModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
