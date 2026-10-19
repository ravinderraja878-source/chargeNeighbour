import React, { useState, useEffect } from 'react';
import { Charger, Review } from '../types';
import { DataService } from '../services/dataService';
import { ChargerMap } from '../components/ChargerMap';
import {
  Zap,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Car,
  DollarSign,
  ArrowLeft,
  Navigation,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface ChargerDetailsPageProps {
  chargerId: string;
  onBack: () => void;
  onBookSlot: (charger: Charger) => void;
}

export const ChargerDetailsPage: React.FC<ChargerDetailsPageProps> = ({
  chargerId,
  onBack,
  onBookSlot,
}) => {
  const [charger, setCharger] = useState<Charger | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const c = await DataService.getChargerById(chargerId);
      const r = await DataService.getChargerReviews(chargerId);
      if (isMounted) {
        setCharger(c);
        setReviews(r);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [chargerId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading charging station details...</p>
      </div>
    );
  }

  if (!charger) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Charging station not found</h2>
        <button type="button" className="btn btn-navy" onClick={onBack} style={{ marginTop: 16 }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${charger.latitude},${charger.longitude}&travelmode=driving`;

  const photos = charger.photos && charger.photos.length > 0
    ? charger.photos
    : ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div style={{ padding: '30px 0 80px' }}>
      <div className="container">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={16} /> Back to Search Results
        </button>

        {/* Title & Top Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-green">
                {charger.power_kw} kW • {charger.charger_type}
              </span>
              <span className="badge badge-navy">
                {charger.connector_type}
              </span>
              <span className={charger.safety_checked ? 'badge badge-blue' : 'badge badge-amber'}>
                {charger.safety_checked ? 'Host Verified Safe' : 'Verification Pending'}
              </span>
            </div>

            <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', margin: '0 0 6px' }}>
              {charger.charger_name}
            </h1>

            <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <MapPin size={16} color="var(--green-600)" />
              <span>{charger.address}, {charger.city}, {charger.state} {charger.postal_code}</span>
              {charger.distance_km && <b> • {charger.distance_km} km away</b>}
            </p>
          </div>

          {/* Quick Book CTA on top */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-600)' }}>
                ₹{charger.price.toFixed(2)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                /{charger.pricing_model === 'per_kwh' ? 'kWh' : 'hr'}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => onBookSlot(charger)}
            >
              Book This Slot ⚡
            </button>
          </div>
        </div>

        {/* PHOTO GALLERY */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: photos.length > 1 ? '2.5fr 1fr' : '1fr',
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div style={{ position: 'relative', height: 380, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={photos[activePhotoIndex]}
              alt={charger.charger_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {photos.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {photos.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  style={{
                    height: 115,
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activePhotoIndex === idx ? '3px solid var(--green-500)' : '1px solid var(--border-light)',
                    opacity: activePhotoIndex === idx ? 1 : 0.7,
                  }}
                >
                  <img src={p} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TWO-COLUMN DETAILS & LOCATION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {/* LEFT: SPECS & HOST RULES */}
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} color="var(--green-600)" />
                Station Specifications
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Charging Speed</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                    {charger.power_kw} kW Maximum
                  </div>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connector Type</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                    {charger.connector_type}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Current Type</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                    {charger.charger_type}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pricing Model</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                    ₹{charger.price.toFixed(2)} / {charger.pricing_model === 'per_kwh' ? 'kWh' : 'hour'}
                  </div>
                </div>
              </div>
            </div>

            {/* Host Rules & Access Instructions */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} color="var(--green-600)" />
                Host Rules & Access Instructions
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14, fontSize: '0.92rem' }}>
                {charger.instructions || 'Standard residential etiquette applies. Please arrive on time for your reserved slot and disconnect cleanly once charging has completed.'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'var(--navy-900)', fontWeight: 600 }}>
                <Clock size={16} color="var(--green-600)" />
                <span>Operating Schedule: {charger.operating_hours}</span>
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={20} color="var(--green-600)" />
                  Driver Reviews ({reviews.length})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>{charger.average_rating || 5.0} / 5.0</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No reviews yet. Be the first driver to charge here and leave feedback!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.owner_name || 'Verified EV Driver'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b', fontSize: '0.8rem' }}>
                          {'★'.repeat(Math.round(r.rating))}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        "{r.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: MAP & NAVIGATION */}
          <div>
            <div className="card" style={{ padding: 24, position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Location & Google Directions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Exact geographic coordinates: <code>{charger.latitude.toFixed(4)}, {charger.longitude.toFixed(4)}</code>
              </p>

              <div style={{ marginBottom: 16 }}>
                <ChargerMap
                  chargers={[charger]}
                  centerLat={charger.latitude}
                  centerLng={charger.longitude}
                  zoom={15}
                  height="280px"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-navy"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <MapPin size={18} /> Open in Google Maps <ExternalLink size={15} />
                </a>

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => onBookSlot(charger)}
                >
                  Book Available Slot Now ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
