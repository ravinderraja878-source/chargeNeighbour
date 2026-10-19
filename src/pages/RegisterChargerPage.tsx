import React, { useState } from 'react';
import { UserProfile, Charger } from '../types';
import { DataService } from '../services/dataService';
import { ChargerMap } from '../components/ChargerMap';
import {
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Home,
  DollarSign,
  Camera,
  ArrowRight,
  Info,
  Navigation,
  RefreshCw,
} from 'lucide-react';

interface RegisterChargerPageProps {
  currentUser: UserProfile;
  onSuccess: () => void;
  onNavigate: (route: string) => void;
}

export const RegisterChargerPage: React.FC<RegisterChargerPageProps> = ({
  currentUser,
  onSuccess,
  onNavigate,
}) => {
  // Provider details (prefill from real user registered property details)
  const [providerName, setProviderName] = useState(currentUser.full_name);
  const [contactNumber, setContactNumber] = useState(currentUser.phone || '');
  const [propertyType, setPropertyType] = useState(currentUser.property_details?.property_type || 'Residential Driveway');
  const [address, setAddress] = useState(currentUser.property_details?.address || '');
  const [city, setCity] = useState(currentUser.property_details?.city || '');
  const [state, setState] = useState(currentUser.property_details?.state || '');
  const [postalCode, setPostalCode] = useState(currentUser.property_details?.postal_code || '');

  // Charger specifications
  const [chargerName, setChargerName] = useState(
    currentUser.full_name ? `${currentUser.full_name.split(' ')[0]}'s Home Charging Station` : 'Home EV Charging Point'
  );
  const [chargerType, setChargerType] = useState<'Level 2 AC' | 'DC Fast Charger'>('Level 2 AC');
  const [connectorType, setConnectorType] = useState<'Type 2 (Mennekes)' | 'CCS2' | 'CHAdeMO' | 'Tesla / NACS' | 'GB/T'>('Type 2 (Mennekes)');
  const [powerKw, setPowerKw] = useState<number>(22);
  const [connectorsCount, setConnectorsCount] = useState<number>(1);
  const [pricingModel, setPricingModel] = useState<'per_kwh' | 'per_hour'>('per_kwh');
  const [price, setPrice] = useState<number>(18.00);
  const [operatingHours, setOperatingHours] = useState('08:00 - 22:00');
  const [instructions, setInstructions] = useState('Pull into the driveway. Wall connector is mounted on the wall. Please message upon arrival.');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80');

  // Coordinates (Picker Mode) & Live GPS Auto-Detection
  const [latitude, setLatitude] = useState<number>(17.4504);
  const [longitude, setLongitude] = useState<number>(78.3808);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string>('');

  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser.');
      return;
    }
    setIsDetectingGps(true);
    setGpsStatus('Detecting property GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 100000) / 100000;
        const lng = Math.round(pos.coords.longitude * 100000) / 100000;
        setLatitude(lat);
        setLongitude(lng);
        setGpsStatus(`📍 GPS Locked: ${lat}°, ${lng}° (±${Math.round(pos.coords.accuracy)}m)`);
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('GPS detection failed:', err.message);
        setGpsStatus('GPS permission denied. Click anywhere on the map below to position your charger.');
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Attempt initial GPS capture on mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 100000) / 100000;
          const lng = Math.round(pos.coords.longitude * 100000) / 100000;
          setLatitude(lat);
          setLongitude(lng);
          setGpsStatus(`📍 Auto-Detected Live GPS: ${lat}°, ${lng}°`);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Verification & Safety Declarations
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [hasSafetyCheck, setHasSafetyCheck] = useState(true);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePickCoordinates = (lat: number, lng: number) => {
    setLatitude(Math.round(lat * 100000) / 100000);
    setLongitude(Math.round(lng * 100000) / 100000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthorized) {
      setError('You must confirm authorization to offer charging at this property.');
      return;
    }

    if (!chargerName.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in all mandatory station and location fields.');
      return;
    }

    setLoading(true);

    try {
      await DataService.registerCharger({
        provider_id: currentUser.id,
        charger_name: chargerName,
        charger_type: chargerType,
        connector_type: connectorType,
        power_kw: powerKw,
        pricing_model: pricingModel,
        price: price,
        address,
        city,
        state,
        postal_code: postalCode,
        latitude,
        longitude,
        operating_hours: operatingHours,
        listing_status: 'active',
        safety_checked: hasSafetyCheck,
        instructions,
        provider_phone: contactNumber.startsWith('+91') ? contactNumber : `+91 ${contactNumber}`,
        photos: [photoUrl],
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to register charger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <div style={{ marginBottom: 28 }}>
          <span className="badge badge-green" style={{ marginBottom: 8 }}>
            Host Onboarding
          </span>
          <h1 style={{ fontSize: '2.3rem', color: 'var(--navy-900)', margin: '0 0 8px' }}>
            Register Your EV Charger
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            List your home or private business charger to start welcoming local EV drivers and earning passive income.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--red-50)',
              color: 'var(--red-600)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #fecaca',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              background: 'var(--green-50)',
              color: 'var(--green-600)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: '1px solid var(--green-100)',
            }}
          >
            <CheckCircle2 size={24} />
            <div>
              <div style={{ fontWeight: 800 }}>Station Successfully Registered!</div>
              <div style={{ fontSize: '0.85rem' }}>Redirecting to your Host Dashboard...</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: PROVIDER & PROPERTY */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Home size={20} color="var(--green-600)" />
              1. Host & Property Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Host Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Contact Number *</span>
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
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="98765 43210"
                      value={contactNumber.replace(/^\+91\s*/, '')}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        if (digits.length > 5) {
                          setContactNumber(`${digits.slice(0, 5)} ${digits.slice(5)}`);
                        } else {
                          setContactNumber(digits);
                        }
                      }}
                      maxLength={11}
                      required
                    />
                  </div>
                </div>
              </div>
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
              <label className="form-label">Service Street Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 750 Market Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-input"
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
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CHARGER HARDWARE SPECS */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={20} color="var(--green-600)" />
              2. Charging Hardware & Capabilities
            </h3>

            <div className="form-group">
              <label className="form-label">Charger Listing Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mission Eco-Hub Solar Wallbox"
                value={chargerName}
                onChange={(e) => setChargerName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Current Standard</label>
                <select
                  className="form-select"
                  value={chargerType}
                  onChange={(e) => setChargerType(e.target.value as any)}
                >
                  <option value="Level 2 AC">Level 2 AC (Typical Home Wallbox)</option>
                  <option value="DC Fast Charger">DC Fast Charger (Rapid 50kW+)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Connector Type</label>
                <select
                  className="form-select"
                  value={connectorType}
                  onChange={(e) => setConnectorType(e.target.value as any)}
                >
                  <option value="Type 2 (Mennekes)">Type 2 (Mennekes / Universal AC)</option>
                  <option value="CCS2">CCS2 Combo (Standard Fast DC)</option>
                  <option value="Tesla / NACS">Tesla / NACS Wall Connector</option>
                  <option value="CHAdeMO">CHAdeMO (Nissan / Asian EVs)</option>
                  <option value="GB/T">GB/T Standard</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Maximum Charging Power (kW) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="3.7"
                  max="350"
                  className="form-input"
                  value={powerKw}
                  onChange={(e) => setPowerKw(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Simultaneous Connectors</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  className="form-input"
                  value={connectorsCount}
                  onChange={(e) => setConnectorsCount(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Pricing Model</label>
                <select
                  className="form-select"
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as any)}
                >
                  <option value="per_kwh">Per kWh Delivered (₹/kWh)</option>
                  <option value="per_hour">Flat Hourly Rate (₹/hr)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price per Unit (₹) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-light)', fontWeight: 700, fontSize: '1rem' }}>₹</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    className="form-input"
                    style={{ paddingLeft: 34 }}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Schedule & Hours</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 08:00 - 22:00, Monday to Sunday"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Charger Photo URL</label>
              <div style={{ position: 'relative' }}>
                <Camera size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
                <input
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Access Instructions for Visiting Drivers</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Pull into the driveway. Cable is on the left wall. Please text upon arrival."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 3: MAP PIN PLACEMENT */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={20} color="var(--green-600)" />
              3. Pin Exact Charger Location on Map
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Click or drag the pin to mark your charger's precise coordinates for Google Maps navigation.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={detectLiveLocation}
                disabled={isDetectingGps}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Navigation size={14} color="var(--blue-500)" />
                <span>{isDetectingGps ? 'Acquiring GPS...' : '📍 Use My Live Location'}</span>
              </button>
            </div>

            {gpsStatus && (
              <div
                style={{
                  background: 'var(--green-50)',
                  color: 'var(--green-700)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CheckCircle2 size={15} />
                <span>{gpsStatus}</span>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <ChargerMap
                chargers={[]}
                isPickerMode={true}
                pickedLat={latitude}
                pickedLng={longitude}
                onPickLocation={handlePickCoordinates}
                height="320px"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  step="0.00001"
                  className="form-input"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  step="0.00001"
                  className="form-input"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: AUTHORIZATION & SAFETY DECLARATION */}
          <div className="card" style={{ padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} color="var(--green-600)" />
              4. Safety & Legal Declarations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={isAuthorized}
                  onChange={(e) => setIsAuthorized(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--green-500)' }}
                />
                <span>
                  <b>Property Authorization:</b> I confirm that I am the legal owner or authorized tenant of the specified property with full permission to host electric vehicle charging.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={hasSafetyCheck}
                  onChange={(e) => setHasSafetyCheck(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--green-500)' }}
                />
                <span>
                  <b>Equipment Safety Check:</b> The charging unit and electrical breaker have been installed by a qualified electrician or verified functional without wiring damage.
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Note: Self-declaration will display "Verification Pending" badge until independent inspection is completed.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => onNavigate('/provider/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? 'Publishing Station...' : 'Publish Charging Station ⚡'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
