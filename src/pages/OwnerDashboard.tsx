import React, { useState, useEffect } from 'react';
import { Charger, UserProfile, SearchFilterState } from '../types';
import { DataService, calculateDistanceKm } from '../services/dataService';
import { ChargerMap } from '../components/ChargerMap';
import {
  Zap,
  BatteryWarning,
  BatteryCharging,
  MapPin,
  Search,
  Filter,
  Navigation,
  Star,
  SlidersHorizontal,
  Layers,
  Map,
  List,
  ChevronRight,
  Info,
  Calendar,
  PlusCircle,
  RefreshCw,
  Radio,
} from 'lucide-react';

interface OwnerDashboardProps {
  currentUser: UserProfile | null;
  onSelectCharger: (charger: Charger) => void;
  onNavigate: (route: string) => void;
  initialBattery?: number;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  onSelectCharger,
  onNavigate,
  initialBattery = 18,
}) => {
  // Battery State & Alert
  const [batteryPct, setBatteryPct] = useState<number>(initialBattery);

  useEffect(() => {
    setBatteryPct(initialBattery);
  }, [initialBattery]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [connectorType, setConnectorType] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [minPower, setMinPower] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  // Driver Location & Live GPS Tracking
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>('Detecting your live GPS coordinates...');
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [isLiveGps, setIsLiveGps] = useState<boolean>(false);

  // View mode: 'split' | 'map' | 'list'
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Chargers list
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Geolocation Handler & Auto-Detection on Mount
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported by your browser.');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setGeoStatus('Locating your position with live GPS...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy);
        setUserLat(lat);
        setUserLng(lng);
        setUserAccuracy(acc);
        setIsLiveGps(true);
        setGeoStatus(`Live GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (±${acc}m accuracy)`);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation permission error:', error.message);
        setGeoStatus('Location permission denied or unavailable. Showing all network chargers.');
        // Set fallback center if no previous coordinates
        setUserLat((prev) => prev || 17.4504);
        setUserLng((prev) => prev || 78.3808);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Automatically request live GPS location on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported by browser. Showing default region.');
      setUserLat(17.4504);
      setUserLng(78.3808);
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setGeoStatus('Acquiring real-time GPS coordinates...');

    // First acquire immediate live position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy);
        setUserLat(lat);
        setUserLng(lng);
        setUserAccuracy(acc);
        setIsLiveGps(true);
        setGeoStatus(`Live GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (±${acc}m accuracy)`);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Initial geolocation error:', error.message);
        setIsLocating(false);
        setGeoStatus('Live GPS permission needed to calculate exact distance. Click "Use Live GPS" to enable.');
        // Default to Indian metropolitan area
        setUserLat(17.4504);
        setUserLng(78.3808);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );

    // Watch live position updates as the vehicle moves
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy);
        setUserLat(lat);
        setUserLng(lng);
        setUserAccuracy(acc);
        setIsLiveGps(true);
        setGeoStatus(`Live GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (±${acc}m accuracy)`);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation watch notice:', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Load Chargers based on filters & coordinates
  useEffect(() => {
    let isMounted = true;
    async function fetchChargers() {
      setLoading(true);
      const filters: SearchFilterState = {
        query: searchQuery,
        connectorType,
        radiusKm,
        minPower,
        maxPrice,
        availableOnly: true,
        userLat,
        userLng,
      };

      const results = await DataService.getNearbyChargers(filters);
      if (isMounted) {
        setChargers(results);
        setLoading(false);
      }
    }

    fetchChargers();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, connectorType, radiusKm, minPower, maxPrice, userLat, userLng]);

  return (
    <div style={{ padding: '30px 0 60px' }}>
      <div className="container">
        {/* DASHBOARD HEADER */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-green">{currentUser ? 'Driver Portal' : 'Guest Driver'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Community EV Network</span>
            </div>
            <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--navy-900)' }}>
              Welcome, {currentUser ? currentUser.full_name.split(' ')[0] : 'EV Driver'} ⚡
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {currentUser ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('/owner/bookings')}
              >
                <Calendar size={16} /> My Reservations
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-navy"
                onClick={() => onNavigate('/owner/login')}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* LIVE GPS LOCATION STATUS BANNER */}
        <div
          className="card"
          style={{
            padding: '14px 20px',
            marginBottom: 24,
            background: isLiveGps ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
            border: isLiveGps ? '1.5px solid var(--green-500)' : '1px solid var(--border-light)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: isLiveGps ? 'var(--green-500)' : '#94a3b8',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isLiveGps ? '0 0 0 4px rgba(16, 185, 129, 0.25)' : 'none',
              }}
            >
              <Navigation size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--navy-900)' }}>
                  {isLiveGps ? 'Live Driver Location Active' : 'Driver Location'}
                </span>
                {isLiveGps ? (
                  <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    LIVE GPS LOCKED
                  </span>
                ) : (
                  <span className="badge badge-navy" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    REGION DEFAULT
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {geoStatus}
                {userLat && userLng && (
                  <span> • Nearby stations and driving directions are calculated from this live position.</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={isLocating ? 'spin' : ''} color="var(--green-600)" />
              <span>{isLocating ? 'Detecting Live GPS...' : 'Refresh Live GPS'}</span>
            </button>
          </div>
        </div>

        {/* BATTERY PERCENTAGE INPUT & ALERT WIDGET */}
        <div
          className="card"
          style={{
            padding: '20px 24px',
            marginBottom: 24,
            background: '#ffffff',
            border: batteryPct <= 4 ? '1.5px solid #ef4444' : batteryPct <= 10 ? '1.5px solid #f59e0b' : '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-sm)',
                  background: batteryPct <= 4 ? 'var(--red-50)' : batteryPct <= 10 ? 'var(--amber-50)' : 'var(--green-50)',
                  color: batteryPct <= 4 ? 'var(--red-600)' : batteryPct <= 10 ? '#b45309' : 'var(--green-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BatteryCharging size={24} />
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Driver Battery Assistant
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Current Vehicle State: <span style={{ color: batteryPct <= 4 ? 'var(--red-600)' : batteryPct <= 10 ? '#b45309' : 'var(--green-600)' }}>{batteryPct}%</span>
                </div>
              </div>
            </div>

            {/* Battery Slider Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 240px', minWidth: 'min(100%, 220px)', maxWidth: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Update:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={batteryPct}
                onChange={(e) => setBatteryPct(Number(e.target.value))}
                style={{
                  flex: 1,
                  minWidth: '60px',
                  accentColor: batteryPct <= 4 ? '#ef4444' : batteryPct <= 10 ? '#f59e0b' : '#10b981',
                  cursor: 'pointer',
                }}
              />
              <input
                type="number"
                min="1"
                max="100"
                value={batteryPct}
                onChange={(e) => setBatteryPct(Number(e.target.value))}
                style={{
                  width: '52px',
                  padding: '6px 4px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              />
              <span style={{ fontWeight: 700 }}>%</span>
            </div>
          </div>

          {/* CRITICAL 4% ALERT */}
          {batteryPct <= 4 && (
            <div className="battery-critical-banner" style={{ marginTop: 16, marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BatteryWarning size={28} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    Critical Battery: {batteryPct}%. Search for a nearby charging point now.
                  </div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                    High risk of shutdown. Showing priority stations within 5 km with instant slot availability.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ffffff', color: 'var(--red-600)', fontWeight: 700 }}
                onClick={() => {
                  setRadiusKm(5);
                  setMinPower(22);
                }}
              >
                Fast Chargers (≤5km)
              </button>
            </div>
          )}

          {/* LOW <=10% ALERT */}
          {batteryPct > 4 && batteryPct <= 10 && (
            <div className="battery-low-banner" style={{ marginTop: 16, marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BatteryWarning size={26} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                    Low Battery Alert! Find the nearest available charging provider.
                  </div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                    Your battery is at {batteryPct}%. We recommend securing a nearby slot before reaching critical levels.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ffffff', color: '#b45309', fontWeight: 700 }}
                onClick={() => setRadiusKm(10)}
              >
                Show Chargers ≤10km
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.74rem', color: 'var(--text-light)' }}>
            <Info size={13} />
            <span>Note: This is an advisory alert based on user-entered percentage. Real vehicle telemetry not connected.</span>
          </div>
        </div>

        {/* SEARCH, GEOLOCATION & FILTER BAR */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: 24,
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 12, alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', top: 13, left: 14, color: 'var(--text-light)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="Search city, neighborhood, zip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Connector Type Filter */}
            <div>
              <select
                className="form-select"
                value={connectorType}
                onChange={(e) => setConnectorType(e.target.value)}
              >
                <option value="all">All Connector Types</option>
                <option value="Type 2">Type 2 (Mennekes)</option>
                <option value="CCS2">CCS2 Combo</option>
                <option value="Tesla">Tesla / NACS</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="GB/T">GB/T</option>
              </select>
            </div>

            {/* Radius Selection */}
            <div>
              <select
                className="form-select"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
              >
                <option value={0}>Radius: All Stations (Nationwide)</option>
                <option value={5}>Radius: Within 5 km</option>
                <option value={10}>Radius: Within 10 km</option>
                <option value={25}>Radius: Within 25 km</option>
                <option value={50}>Radius: Within 50 km</option>
                <option value={100}>Radius: Within 100 km</option>
              </select>
            </div>

            {/* Use My Location Button */}
            <div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
              >
                <Navigation size={16} color="var(--blue-500)" />
                <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 'min(100%, 260px)' }}>
              <MapPin size={15} color="var(--green-600)" style={{ flexShrink: 0 }} />
              <span style={{ wordBreak: 'break-word' }}><b>Current Center:</b> {geoStatus}</span>
            </div>

            {/* View Mode Segmented Toggle */}
            <div className="segmented-toggle">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'split' ? 'btn-navy' : 'btn-secondary'}`}
                onClick={() => setViewMode('split')}
              >
                <Layers size={14} /> <span>Split</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'map' ? 'btn-navy' : 'btn-secondary'}`}
                onClick={() => setViewMode('map')}
              >
                <Map size={14} /> <span>Map</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-navy' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                <List size={14} /> <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN RESULTS DISPLAY */}
        <div
          className={viewMode === 'split' ? 'dashboard-split-layout' : ''}
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'split' ? undefined : '1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* CHARGER LIST COLUMN */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                  {chargers.length} Registered Community Stations Available
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sorted by closest distance
                </span>
              </div>

              {loading ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Searching nearby chargers...
                </div>
              ) : chargers.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                  <Zap size={32} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>
                    No community stations found within {radiusKm > 0 ? `${radiusKm} km` : 'selected filters'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                    {isLiveGps && userLat && userLng
                      ? `Your live GPS position (${userLat.toFixed(4)}° N, ${userLng.toFixed(4)}° E) is locked. Expand your search radius to view nationwide stations, or be the first host to list a charger in this area!`
                      : 'Try expanding your search radius to view all registered network stations.'}
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline-green"
                      onClick={() => {
                        setRadiusKm(0);
                        setConnectorType('all');
                        setSearchQuery('');
                      }}
                    >
                      Show All Network Stations (Nationwide)
                    </button>
                    <button
                      type="button"
                      className="btn btn-navy"
                      onClick={() => onNavigate('/provider/register-charger')}
                    >
                      <PlusCircle size={15} /> List Charger at this Location
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {chargers.map((c) => (
                    <div
                      key={c.id}
                      className="card"
                      style={{
                        padding: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 16 }}>
                        <img
                          src={c.photos?.[0] || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80'}
                          alt={c.charger_name}
                          style={{
                            width: 95,
                            height: 95,
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--navy-900)' }}>
                              {c.charger_name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, fontSize: '0.85rem' }}>
                              <Star size={14} fill="#f59e0b" color="#f59e0b" />
                              <span>{c.average_rating || 5.0}</span>
                            </div>
                          </div>

                          <p style={{ margin: '3px 0 6px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={13} color="var(--green-600)" />
                            <span>{c.city}, {c.state}</span>
                            {c.distance_km !== undefined && (
                              <b style={{ color: 'var(--navy-900)' }}> • {c.distance_km} km away</b>
                            )}
                          </p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                              {c.power_kw} kW {c.charger_type}
                            </span>
                            <span className="badge badge-navy" style={{ fontSize: '0.7rem' }}>
                              {c.connector_type}
                            </span>
                            {c.safety_checked && (
                              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                                Safety Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 10,
                          borderTop: '1px solid var(--border-light)',
                          gap: 8,
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--green-600)' }}>
                            ₹{c.price.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            /{c.pricing_model === 'per_kwh' ? 'kWh' : 'hr'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onNavigate(`/chargers/${c.id}`)}
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onSelectCharger(c)}
                          >
                            Book Slot ⚡
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INTERACTIVE MAP COLUMN */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div style={{ position: viewMode === 'split' ? 'sticky' : 'static', top: 90 }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                  Interactive Neighborhood Radar
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click pins to view details or directions
                </span>
              </div>

              <ChargerMap
                chargers={chargers}
                centerLat={userLat || 37.7749}
                centerLng={userLng || -122.4194}
                userLat={userLat}
                userLng={userLng}
                radiusKm={radiusKm}
                onSelectCharger={onSelectCharger}
                height={viewMode === 'map' ? '650px' : '560px'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
