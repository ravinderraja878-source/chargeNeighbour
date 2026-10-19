import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Charger } from '../types';
import { ExternalLink, Info, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ChargerMapProps {
  chargers: Charger[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  userLat?: number | null;
  userLng?: number | null;
  radiusKm?: number;
  onSelectCharger?: (charger: Charger) => void;
  isPickerMode?: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
  pickedLat?: number;
  pickedLng?: number;
  height?: string;
}

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
  }
}

export const ChargerMap: React.FC<ChargerMapProps> = ({
  chargers,
  centerLat = 37.7749,
  centerLng = -122.4194,
  zoom = 13,
  userLat,
  userLng,
  radiusKm,
  onSelectCharger,
  isPickerMode = false,
  onPickLocation,
  pickedLat,
  pickedLng,
  height = '480px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('leaflet');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [googleLoadError, setGoogleLoadError] = useState<string | null>(null);

  // References for Leaflet
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletLayerRef = useRef<L.LayerGroup | null>(null);
  const leafletCircleRef = useRef<L.Circle | null>(null);
  const leafletUserMarkerRef = useRef<L.Marker | null>(null);
  const leafletPickerMarkerRef = useRef<L.Marker | null>(null);

  // References for Google Maps
  const gMapRef = useRef<any>(null);
  const gMarkersRef = useRef<any[]>([]);
  const gCircleRef = useRef<any>(null);
  const gPickerMarkerRef = useRef<any>(null);
  const gUserMarkerRef = useRef<any>(null);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isGoogleKeyConfigured = Boolean(
    googleApiKey &&
    googleApiKey !== 'your-google-maps-api-key-here' &&
    !googleApiKey.includes('placeholder')
  );

  // Initialize Map Engine
  useEffect(() => {
    let isCancelled = false;

    // Listen for Google Maps auth failure
    window.gm_authFailure = () => {
      console.warn('Google Maps API key validation failed.');
      setGoogleLoadError('Invalid Google Maps API Key or billing not enabled.');
      setMapEngine('leaflet');
    };

    if (isGoogleKeyConfigured && typeof window !== 'undefined') {
      // Attempt to load Google Maps JS API script
      if (!window.google?.maps) {
        const existingScript = document.getElementById('google-maps-sdk-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-maps-sdk-script';
          script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (!isCancelled && window.google?.maps) {
              setMapEngine('google');
            }
          };
          script.onerror = () => {
            if (!isCancelled) {
              setGoogleLoadError('Failed to load Google Maps JavaScript API script.');
              setMapEngine('leaflet');
            }
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('load', () => {
            if (!isCancelled && window.google?.maps) {
              setMapEngine('google');
            }
          });
        }
      } else {
        setMapEngine('google');
      }
    } else {
      setMapEngine('leaflet');
    }

    return () => {
      isCancelled = true;
    };
  }, [isGoogleKeyConfigured, googleApiKey]);

  // ==========================================
  // GOOGLE MAPS RENDERING ENGINE
  // ==========================================
  useEffect(() => {
    if (mapEngine !== 'google' || !mapContainerRef.current || !window.google?.maps) return;

    const initialLat = pickedLat || userLat || centerLat;
    const initialLng = pickedLng || userLng || centerLng;

    if (!gMapRef.current) {
      const gMap = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        ],
      });

      if (isPickerMode && onPickLocation) {
        gMap.addListener('click', (e: any) => {
          onPickLocation(e.latLng.lat(), e.latLng.lng());
        });
      }

      gMapRef.current = gMap;
    } else {
      gMapRef.current.setCenter({ lat: initialLat, lng: initialLng });
      gMapRef.current.setZoom(zoom);
    }

    const gMap = gMapRef.current;

    // Clear existing markers
    gMarkersRef.current.forEach((m) => m.setMap(null));
    gMarkersRef.current = [];

    if (gCircleRef.current) gCircleRef.current.setMap(null);
    if (gUserMarkerRef.current) gUserMarkerRef.current.setMap(null);
    if (gPickerMarkerRef.current) gPickerMarkerRef.current.setMap(null);

    // Driver location & radius on Google Map
    if (userLat && userLng) {
      gUserMarkerRef.current = new window.google.maps.Marker({
        position: { lat: userLat, lng: userLng },
        map: gMap,
        title: 'Your Live Location (GPS)',
        zIndex: 9999,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3.5,
        },
      });

      const userWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px;">
            <b style="color: #2563eb;">📍 Your Live Location</b><br/>
            Lat: ${userLat.toFixed(5)}, Lng: ${userLng.toFixed(5)}
          </div>
        `,
      });

      gUserMarkerRef.current.addListener('click', () => {
        userWindow.open(gMap, gUserMarkerRef.current);
      });

      if (radiusKm && radiusKm > 0) {
        gCircleRef.current = new window.google.maps.Circle({
          strokeColor: '#10b981',
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
          fillColor: '#10b981',
          fillOpacity: 0.08,
          map: gMap,
          center: { lat: userLat, lng: userLng },
          radius: radiusKm * 1000,
        });
      }
    }

    // Picker Marker in Google Maps
    if (isPickerMode && pickedLat && pickedLng) {
      gPickerMarkerRef.current = new window.google.maps.Marker({
        position: { lat: pickedLat, lng: pickedLng },
        map: gMap,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Charger Placement',
      });

      gPickerMarkerRef.current.addListener('dragend', (e: any) => {
        if (onPickLocation) {
          onPickLocation(e.latLng.lat(), e.latLng.lng());
        }
      });
    }

    // Render Charger Pins in Google Maps
    if (!isPickerMode) {
      chargers.forEach((c) => {
        const isFast = c.charger_type === 'DC Fast Charger';
        const marker = new window.google.maps.Marker({
          position: { lat: c.latitude, lng: c.longitude },
          map: gMap,
          title: c.charger_name,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: isFast ? '#0a192f' : '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            scale: 1.8,
            anchor: new window.google.maps.Point(12, 22),
          },
        });

        const googleMapsNavUrl = userLat && userLng
          ? `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${c.latitude},${c.longitude}&travelmode=driving`
          : `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}&travelmode=driving`;

        const infoContent = `
          <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 230px;">
            <div style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase;">${c.charger_type}</div>
            <h4 style="margin: 2px 0 4px; font-size: 14px; color: #0a192f;">${c.charger_name}</h4>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${c.city}, ${c.state}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px;">
              <span><b>${c.power_kw} kW</b></span>
              <span style="color: #059669; font-weight: 700;">₹${c.price.toFixed(2)}/${c.pricing_model === 'per_kwh' ? 'kWh' : 'hr'}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <a href="${googleMapsNavUrl}" target="_blank" style="flex: 1; text-align: center; background: #0a192f; color: #ffffff; padding: 5px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 600;">Directions</a>
            </div>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({ content: infoContent });

        marker.addListener('click', () => {
          infoWindow.open(gMap, marker);
          if (onSelectCharger) {
            onSelectCharger(c);
          }
        });

        gMarkersRef.current.push(marker);
      });
    }
  }, [mapEngine, chargers, isPickerMode, userLat, userLng, pickedLat, pickedLng, radiusKm, centerLat, centerLng, zoom, onPickLocation, onSelectCharger]);

  // ==========================================
  // LEAFLET / OPENSTREETMAP FALLBACK ENGINE
  // ==========================================
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const initialLat = pickedLat || userLat || centerLat;
      const initialLng = pickedLng || userLng || centerLng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: zoom,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      leafletLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;

      if (isPickerMode && onPickLocation) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onPickLocation(e.latlng.lat, e.latlng.lng);
        });
      }
    } else {
      leafletMapRef.current.setView([pickedLat || userLat || centerLat, pickedLng || userLng || centerLng], zoom);
    }

    const map = leafletMapRef.current;
    const layer = leafletLayerRef.current;

    // User location
    if (leafletUserMarkerRef.current) leafletUserMarkerRef.current.remove();
    if (leafletCircleRef.current) leafletCircleRef.current.remove();

    if (userLat && userLng && map) {
      const userDotIcon = L.divIcon({
        className: 'user-pin-icon',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; background: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: pulseLiveRadar 2s infinite ease-out;"></div>
            <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.35); z-index: 10;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      leafletUserMarkerRef.current = L.marker([userLat, userLng], { icon: userDotIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px;">
            <b style="color: #2563eb;">📍 Your Live Location</b><br/>
            Lat: ${userLat.toFixed(5)}<br/>
            Lng: ${userLng.toFixed(5)}
          </div>
        `);

      if (radiusKm && radiusKm > 0) {
        leafletCircleRef.current = L.circle([userLat, userLng], {
          radius: radiusKm * 1000,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '5, 5',
        }).addTo(map);
      }
    }

    // Picker Pin
    if (isPickerMode && pickedLat && pickedLng && map) {
      if (leafletPickerMarkerRef.current) leafletPickerMarkerRef.current.remove();
      const pinIcon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="background: #0a192f; color: #00e676; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
            <span style="transform: rotate(45deg); font-size: 16px;">⚡</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      leafletPickerMarkerRef.current = L.marker([pickedLat, pickedLng], { icon: pinIcon, draggable: true })
        .addTo(map)
        .bindPopup('Drag pin to position charger');

      leafletPickerMarkerRef.current.on('dragend', () => {
        const latLng = leafletPickerMarkerRef.current?.getLatLng();
        if (latLng && onPickLocation) {
          onPickLocation(latLng.lat, latLng.lng);
        }
      });
    }

    // Charger Pins
    if (layer && !isPickerMode) {
      layer.clearLayers();
      chargers.forEach((c) => {
        const isFast = c.charger_type === 'DC Fast Charger';
        const pinBg = isFast ? '#0a192f' : '#10b981';

        const chargerIcon = L.divIcon({
          className: 'charger-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
              <div style="background: ${pinBg}; color: #ffffff; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px; border: 1.5px solid #ffffff;">
                <span style="color: ${isFast ? '#00e676' : '#ffffff'}; font-size: 12px;">⚡</span>
                <span>${c.power_kw}kW</span>
              </div>
              <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${pinBg};"></div>
            </div>
          `,
          iconSize: [60, 36],
          iconAnchor: [30, 36],
        });

        const googleMapsNavUrl = userLat && userLng
          ? `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${c.latitude},${c.longitude}&travelmode=driving`
          : `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}&travelmode=driving`;

        const marker = L.marker([c.latitude, c.longitude], { icon: chargerIcon }).addTo(layer);

        const popupHtml = `
          <div style="width: 240px; font-family: var(--font-sans); padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="background: ${isFast ? '#eff6ff' : '#ecfdf5'}; color: ${isFast ? '#2563eb' : '#059669'}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                ${c.charger_type}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #0f172a;">
                ⭐ ${c.average_rating || '5.0'} (${c.review_count || 12})
              </span>
            </div>
            <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0a192f;">${c.charger_name}</h4>
            <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">📍 ${c.city}, ${c.state} ${c.distance_km !== undefined ? `• <b>${c.distance_km} km away</b>` : ''}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 6px 8px; border-radius: 6px; margin-bottom: 10px; font-size: 11px;">
              <span><b>Connector:</b> ${c.connector_type}</span>
              <span style="color: #059669; font-weight: 700;">₹${c.price.toFixed(2)}/${c.pricing_model === 'per_kwh' ? 'kWh' : 'hr'}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="${googleMapsNavUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #0a192f; color: #ffffff; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
                🗺️ Directions
              </a>
              <button id="book-btn-${c.id}" style="flex: 1; background: #10b981; color: #ffffff; border: none; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                Book Slot
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`book-btn-${c.id}`);
          if (btn && onSelectCharger) {
            btn.onclick = () => onSelectCharger(c);
          }
        });
      });
    }
  }, [mapEngine, chargers, isPickerMode, userLat, userLng, pickedLat, pickedLng, radiusKm, centerLat, centerLng, zoom, onPickLocation, onSelectCharger]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Status & Engine Pill */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 500,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setShowSetupModal(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--navy-900)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
          }}
          title="Click to view Google Maps connection guide"
        >
          <span style={{ color: mapEngine === 'google' ? '#10b981' : '#3b82f6', fontSize: '0.9rem' }}>
            {mapEngine === 'google' ? '🟢' : '⚡'}
          </span>
          <span>
            {mapEngine === 'google'
              ? 'Real Google Maps Active'
              : 'Interactive Radar Map'}
          </span>
          <Info size={13} color="var(--text-muted)" />
        </button>

        {isGoogleKeyConfigured && (
          <button
            type="button"
            onClick={() => {
              if (mapEngine === 'google') {
                if (mapContainerRef.current) mapContainerRef.current.innerHTML = '';
                gMapRef.current = null;
                setMapEngine('leaflet');
              } else {
                if (leafletMapRef.current) {
                  leafletMapRef.current.remove();
                  leafletMapRef.current = null;
                }
                if (mapContainerRef.current) mapContainerRef.current.innerHTML = '';
                setMapEngine('google');
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--navy-900)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
            }}
          >
            {mapEngine === 'google' ? 'Switch to OSM' : 'Switch to Google Map'}
          </button>
        )}
      </div>

      {/* Setup Guide Modal */}
      {showSetupModal && (
        <div className="modal-overlay" onClick={() => setShowSetupModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <img src="https://www.gstatic.com/images/branding/product/1x/maps_64dp.png" alt="Google Maps" style={{ width: 24, height: 24 }} />
                  Connect Real Google Maps to ChargeNeighbor
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  style={{ background: 'transparent', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              {mapEngine === 'google' ? (
                <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={20} color="var(--green-600)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--green-600)', fontWeight: 600 }}>
                    Real Google Maps JavaScript API is connected and active on your website!
                  </span>
                </div>
              ) : (
                <div style={{ background: 'var(--blue-50)', border: '1px solid #bfdbfe', padding: 14, borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                  <b>Status:</b> Currently running the zero-config Leaflet / OpenStreetMap radar map with <b>direct Google Maps driving navigation</b> links. Follow the steps below to embed the full native Google Maps JavaScript SDK.
                </div>
              )}

              <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>3-Step Setup Instructions:</h4>
              <ol style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.7, marginBottom: 20 }}>
                <li>
                  Open the <b><a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-600)', fontWeight: 600 }}>Google Cloud Console</a></b> and create or select a project.
                </li>
                <li>
                  Go to <b>APIs & Services → Library</b> and enable:
                  <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                    <li><b>Maps JavaScript API</b> (for interactive embedded map)</li>
                    <li><b>Directions API</b> (for turn-by-turn routing)</li>
                    <li><b>Places API</b> (for locality search autocomplete)</li>
                  </ul>
                </li>
                <li>
                  Go to <b>APIs & Services → Credentials</b>, click <b>Create Credentials → API Key</b>.
                </li>
                <li>
                  Add your key to your project's <code>.env</code> file:
                  <div style={{ background: '#0a192f', color: '#10b981', padding: '10px 14px', borderRadius: 6, marginTop: 6, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_key_here
                  </div>
                </li>
              </ol>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                💡 <b>Security Tip:</b> In the Google Cloud Console, restrict your API key by <b>HTTP referrers</b> (e.g. <code>localhost:5173/*</code> and your Vercel deployment URL <code>*.vercel.app/*</code>).
              </div>

              <button
                type="button"
                className="btn btn-navy"
                style={{ width: '100%' }}
                onClick={() => setShowSetupModal(false)}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
