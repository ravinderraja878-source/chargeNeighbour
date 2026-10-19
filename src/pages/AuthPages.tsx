import React, { useState } from 'react';
import { DataService } from '../services/dataService';
import { UserProfile, UserRole } from '../types';
import {
  Zap,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Home,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AuthPageProps {
  role: UserRole;
  isRegister: boolean;
  onSuccess: (user: UserProfile, redirectTo: string) => void;
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  role,
  isRegister,
  onSuccess,
  onNavigate,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Provider specific fields
  const [propertyType, setPropertyType] = useState('Residential Driveway');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isOwner = role === 'owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegister) {
      if (!fullName.trim() || !email.trim() || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        setError('Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).');
        return;
      }
      const formattedPhone = `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`;

      if (!isOwner && (!address.trim() || !city.trim() || !postalCode.trim())) {
        setError('Please provide your property address details so drivers can locate your charger.');
        return;
      }

      setLoading(true);
      try {
        const user = await DataService.registerUser({
          fullName,
          email,
          phone: formattedPhone,
          role,
          propertyDetails: !isOwner
            ? {
                propertyType,
                address,
                city,
                state,
                postalCode,
              }
            : undefined,
        });

        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          if (role === 'provider') {
            onSuccess(user, '/provider/register-charger');
          } else {
            onSuccess(user, '/owner/dashboard');
          }
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }

      setLoading(true);
      try {
        const user = await DataService.login(email, role);
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          if (role === 'provider') {
            onSuccess(user, '/provider/dashboard');
          } else {
            onSuccess(user, '/owner/dashboard');
          }
        }, 600);
      } catch (err: any) {
        setError(err.message || 'Login failed. Please verify credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: isRegister && !isOwner ? '580px' : '460px',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div className="card-body">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-sm)',
                background: isOwner ? 'var(--navy-900)' : 'var(--green-500)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                boxShadow: isOwner ? 'var(--shadow-md)' : 'var(--shadow-glow)',
              }}
            >
              <Zap size={26} fill="currentColor" />
            </div>

            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>
              {isOwner
                ? isRegister
                  ? 'Create EV Driver Account'
                  : 'EV Driver Sign In'
                : isRegister
                ? 'Register as Charging Host'
                : 'Charging Host Sign In'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isOwner
                ? isRegister
                  ? 'Create your personal account to search nearby chargers & book slots'
                  : 'Sign in with your registered EV driver account'
                : isRegister
                  ? 'Register your property to list chargers & earn recurring income'
                  : 'Sign in to manage your listed chargers and driver bookings'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div
              style={{
                background: 'var(--red-50)',
                color: 'var(--red-600)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 18,
                border: '1px solid #fecaca',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'var(--green-50)',
                color: 'var(--green-600)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 18,
                border: '1px solid var(--green-100)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mobile Phone (Register - Indian Format) */}
            {isRegister && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Mobile Number *</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>10-Digit Mobile</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '0 12px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--navy-900)',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    title="India Country Code (+91)"
                  >
                    <span style={{ fontSize: '1.1rem' }}>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
                    <input
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: 42 }}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => {
                        // Allow digits and space, auto-format 5+5
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        if (digits.length > 5) {
                          setPhone(`${digits.slice(0, 5)} ${digits.slice(5)}`);
                        } else {
                          setPhone(digits);
                        }
                      }}
                      maxLength={11}
                      required
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Booking confirmation & host coordination will be linked to this number.
                </div>
              </div>
            )}

            {/* Provider Property Address Fields */}
            {isRegister && !isOwner && (
              <div
                style={{
                  background: 'var(--bg-app)',
                  padding: 16,
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 18,
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Home size={16} color="var(--green-600)" />
                  Charger Property Location
                </div>

                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select
                    className="form-select"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="Residential Driveway">Residential Driveway</option>
                    <option value="Private Garage">Private Garage</option>
                    <option value="Apartment / Condo Assigned Space">Apartment / Condo Assigned Space</option>
                    <option value="Commercial / Small Business Lot">Commercial / Small Business Lot</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 842 Valencia St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Zip"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'transparent',
                    color: 'var(--text-light)',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register) */}
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={isOwner ? 'btn btn-navy btn-lg' : 'btn btn-primary btn-lg'}
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : isRegister
                ? isOwner
                  ? 'Complete Driver Registration'
                  : 'Register Host & Continue to Charger Setup →'
                : isOwner
                ? 'Sign In to Driver Dashboard'
                : 'Sign In to Host Portal'}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate(isOwner ? '/owner/login' : '/provider/login')}
                  style={{ background: 'transparent', color: 'var(--green-600)', fontWeight: 700 }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate(isOwner ? '/owner/register' : '/provider/register')}
                  style={{ background: 'transparent', color: 'var(--green-600)', fontWeight: 700 }}
                >
                  Create Account
                </button>
              </span>
            )}
          </div>

          {/* Cross role switch */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid var(--border-light)',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            {isOwner ? (
              <span>
                Have an EV charger to share?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/provider/login')}
                  style={{ background: 'transparent', color: 'var(--navy-900)', fontWeight: 600 }}
                >
                  Host Portal →
                </button>
              </span>
            ) : (
              <span>
                Looking to charge your EV?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/owner/login')}
                  style={{ background: 'transparent', color: 'var(--navy-900)', fontWeight: 600 }}
                >
                  EV Driver Portal →
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
