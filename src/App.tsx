import React, { useState, useEffect } from 'react';
import { UserProfile, Charger, Booking } from './types';
import { DataService } from './services/dataService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPages';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { RegisterChargerPage } from './pages/RegisterChargerPage';
import { ChargerDetailsPage } from './pages/ChargerDetailsPage';
import { OwnerBookingsPage } from './pages/OwnerBookingsPage';
import { StaticPage } from './pages/StaticPages';
import { Calendar, Zap, PlusCircle, LogIn, User } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [featuredChargers, setFeaturedChargers] = useState<Charger[]>([]);
  const [bookingCharger, setBookingCharger] = useState<Charger | null>(null);
  const [initialBatteryParam, setInitialBatteryParam] = useState<number>(18);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    // Check if query string contains battery
    if (path.includes('battery=')) {
      const match = path.match(/battery=(\d+)/);
      if (match) {
        setInitialBatteryParam(Number(match[1]));
      }
    }

    const cleanPath = path.split('?')[0];
    window.history.pushState({}, '', path);
    setCurrentRoute(cleanPath);
    window.scrollTo(0, 0);
  };

  // Check auth and seed chargers on load
  useEffect(() => {
    DataService.getCurrentUser().then((user) => {
      setCurrentUser(user);
    });

    DataService.getNearbyChargers({
      query: '',
      connectorType: 'all',
      minPower: 0,
      maxPrice: 0,
      radiusKm: 50,
      availableOnly: true,
      userLat: 37.7749,
      userLng: -122.4194,
    }).then(setFeaturedChargers);
  }, []);

  const handleLogout = async () => {
    await DataService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const handleBookingTrigger = (charger: Charger) => {
    if (!currentUser) {
      alert('Please create an account or sign in as an EV Driver to book this charging slot.');
      navigate('/owner/login');
      return;
    }

    if (currentUser.role !== 'owner') {
      alert('You are currently logged in as a Charging Host. Please switch to or create an EV Driver account to book a charging slot.');
      return;
    }

    setBookingCharger(charger);
  };

  // Route dispatcher
  const renderCurrentView = () => {
    // Home Route
    if (currentRoute === '/') {
      return (
        <HomePage
          onNavigate={navigate}
          onSelectCharger={handleBookingTrigger}
          featuredChargers={featuredChargers}
        />
      );
    }

    // Owner Auth
    if (currentRoute === '/owner/login') {
      return (
        <AuthPage
          role="owner"
          isRegister={false}
          onSuccess={(user, to) => {
            setCurrentUser(user);
            navigate(to);
          }}
          onNavigate={navigate}
        />
      );
    }

    if (currentRoute === '/owner/register') {
      return (
        <AuthPage
          role="owner"
          isRegister={true}
          onSuccess={(user, to) => {
            setCurrentUser(user);
            navigate(to);
          }}
          onNavigate={navigate}
        />
      );
    }

    // Provider Auth
    if (currentRoute === '/provider/login') {
      return (
        <AuthPage
          role="provider"
          isRegister={false}
          onSuccess={(user, to) => {
            setCurrentUser(user);
            navigate(to);
          }}
          onNavigate={navigate}
        />
      );
    }

    if (currentRoute === '/provider/register') {
      return (
        <AuthPage
          role="provider"
          isRegister={true}
          onSuccess={(user, to) => {
            setCurrentUser(user);
            navigate(to);
          }}
          onNavigate={navigate}
        />
      );
    }

    // EV Owner Dashboard
    if (currentRoute === '/owner/dashboard') {
      return (
        <OwnerDashboard
          currentUser={currentUser}
          onSelectCharger={handleBookingTrigger}
          onNavigate={navigate}
          initialBattery={initialBatteryParam}
        />
      );
    }

    // EV Owner Bookings List
    if (currentRoute === '/owner/bookings') {
      if (!currentUser || currentUser.role !== 'owner') {
        return (
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card" style={{ maxWidth: 460, width: '100%', padding: 36, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--navy-50)', color: 'var(--navy-900)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Calendar size={24} />
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 8, color: 'var(--navy-900)' }}>Driver Sign In Required</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 22, lineHeight: 1.5 }}>
                Please create your free EV Driver account or sign in to view and manage your charging slot reservations.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/owner/login')}>
                  <LogIn size={15} /> Sign In
                </button>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/owner/register')}>
                  <User size={15} /> Create Driver Account
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <OwnerBookingsPage
          currentUser={currentUser}
          onNavigate={navigate}
        />
      );
    }

    // Provider Dashboard (Protected: Must be provider)
    if (currentRoute === '/provider/dashboard') {
      if (!currentUser || currentUser.role !== 'provider') {
        return (
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card" style={{ maxWidth: 460, width: '100%', padding: 36, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Zap size={24} />
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 8, color: 'var(--navy-900)' }}>Charging Host Sign In Required</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 22, lineHeight: 1.5 }}>
                Please register as a Charging Host or sign in to access your host dashboard, earnings, and listed charging stations.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/provider/login')}>
                  <LogIn size={15} /> Host Sign In
                </button>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/provider/register')}>
                  <PlusCircle size={15} /> Register as Host
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <ProviderDashboard
          currentUser={currentUser}
          onNavigate={navigate}
        />
      );
    }

    // Register Charger Page
    if (currentRoute === '/provider/register-charger') {
      if (!currentUser || currentUser.role !== 'provider') {
        return (
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card" style={{ maxWidth: 460, width: '100%', padding: 36, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <PlusCircle size={24} />
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 8, color: 'var(--navy-900)' }}>Host Account Required</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 22, lineHeight: 1.5 }}>
                Please register as a Charging Host or sign in to add and publish your EV charging facility.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/provider/login')}>
                  <LogIn size={15} /> Host Sign In
                </button>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/provider/register')}>
                  <Zap size={15} /> Register as Host
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <RegisterChargerPage
          currentUser={currentUser}
          onSuccess={() => navigate('/provider/dashboard')}
          onNavigate={navigate}
        />
      );
    }

    // Charger Details Page: /chargers/:chargerId
    if (currentRoute.startsWith('/chargers/')) {
      const chargerId = currentRoute.replace('/chargers/', '');
      return (
        <ChargerDetailsPage
          chargerId={chargerId}
          onBack={() => navigate('/owner/dashboard')}
          onBookSlot={handleBookingTrigger}
        />
      );
    }

    // Support, Privacy, Terms
    if (currentRoute === '/support') {
      return <StaticPage type="support" onNavigate={navigate} />;
    }

    if (currentRoute === '/privacy') {
      return <StaticPage type="privacy" onNavigate={navigate} />;
    }

    if (currentRoute === '/terms') {
      return <StaticPage type="terms" onNavigate={navigate} />;
    }

    // Fallback: Home
    return (
      <HomePage
        onNavigate={navigate}
        onSelectCharger={handleBookingTrigger}
        featuredChargers={featuredChargers}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {renderCurrentView()}
      </main>

      <Footer onNavigate={navigate} />

      {/* Global Slot Booking Modal */}
      {bookingCharger && (
        <BookingModal
          charger={bookingCharger}
          currentUser={currentUser}
          onClose={() => setBookingCharger(null)}
          onBookingSuccess={() => {
            // refresh data if needed
          }}
          onNavigateToBookings={() => {
            setBookingCharger(null);
            navigate('/owner/bookings');
          }}
        />
      )}
    </div>
  );
}
export default App;
