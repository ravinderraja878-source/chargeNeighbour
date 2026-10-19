import React, { useState } from 'react';
import { Charger } from '../types';
import {
  Zap,
  MapPin,
  Calendar,
  ShieldCheck,
  BatteryWarning,
  ArrowRight,
  DollarSign,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onSelectCharger: (charger: Charger) => void;
  featuredChargers: Charger[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectCharger,
  featuredChargers,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does reserving a community charging slot work?',
      a: 'EV drivers search for nearby residential or private chargers, select a date and an available 1-hour to 4-hour time slot, enter their vehicle details, and confirm. Once reserved, that slot is exclusively locked so you will never wait in line.',
    },
    {
      q: 'Is my private residential address revealed to the public?',
      a: 'No. To protect host privacy, only general neighborhood and approximate distance are visible in public searches. The exact street address is only unlocked once a booking is confirmed.',
    },
    {
      q: 'What types of connectors are supported on ChargeNeighbor?',
      a: 'Our network supports all major EV standards including Type 2 (Mennekes), CCS2, Tesla/NACS (with native or adapter support), CHAdeMO, and GB/T. You can filter chargers specifically by your vehicle connector.',
    },
    {
      q: 'How do hosts earn money sharing their home chargers?',
      a: 'Hosts set their own rates (either per kWh or per hour) and specify their operating days and hours. Earnings are tracked directly in the Provider Dashboard.',
    },
    {
      q: 'What happens if I arrive with critical low battery (e.g. 4%)?',
      a: 'Our platform features a Critical Battery Quick-Finder that immediately highlights the closest available high-power Level 2 and DC Fast chargers with turnkey Google Maps turn-by-turn navigation.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Battery Alert Component */}
            <div
              className="battery-alert-hero"
              onClick={() => onNavigate('/owner/dashboard?battery=4')}
              style={{ cursor: 'pointer' }}
              title="Click to search urgent nearby chargers"
            >
              <div className="alert-dot" />
              <BatteryWarning size={18} color="var(--red-500)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 'clamp(0.78rem, 2.5vw, 0.9rem)', fontWeight: 700, color: 'var(--navy-900)' }}>
                Battery at 4%? Find a nearby charger before it's too late.
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--red-600)', fontWeight: 800, whiteSpace: 'nowrap' }}>
                Find Now →
              </span>
            </div>

            {/* Main Heading */}
            <h1
              style={{
                fontSize: 'clamp(1.9rem, 5.5vw, 3.8rem)',
                fontWeight: 800,
                color: 'var(--navy-900)',
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Never Run Out of Charge{' '}
              <span style={{ color: 'var(--green-500)', textDecoration: 'underline wavy #00e676 4px' }}>
                on the Road.
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 36,
                maxWidth: '680px',
                margin: '0 auto 36px',
              }}
            >
              Find nearby community EV chargers, reserve your charging slot, and get back on the road with confidence.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 48,
              }}
            >
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('/owner/dashboard')}
              >
                <Zap size={20} /> Find Nearby Chargers
              </button>
              <button
                type="button"
                className="btn btn-navy btn-lg"
                onClick={() => onNavigate('/provider/register')}
              >
                Become a Charging Provider <ArrowRight size={18} />
              </button>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 24,
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} color="var(--green-500)" />
                <span>Zero Queuing Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} color="var(--green-500)" />
                <span>100% Verified Community Hosts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} color="var(--green-500)" />
                <span>Google Maps Integrated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{ padding: '80px 0', background: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
            <span className="badge badge-green" style={{ marginBottom: 12 }}>
              Simple 3-Step Process
            </span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: 12 }}>
              How ChargeNeighbor Works
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Reserve a verified private charging bay with zero stress in under 60 seconds.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: 24,
            }}
          >
            {/* Step 1 */}
            <div className="card" style={{ padding: 30, textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--green-50)',
                  color: 'var(--green-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <MapPin size={28} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--green-600)' }}>STEP 1</span>
              <h3 style={{ fontSize: '1.25rem', margin: '6px 0 10px' }}>Discover Nearby Chargers</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Use your real GPS location or search by city. Filter by connector type, charging power in kW, and price.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: 30, textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--blue-50)',
                  color: 'var(--blue-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Calendar size={28} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--blue-500)' }}>STEP 2</span>
              <h3 style={{ fontSize: '1.25rem', margin: '6px 0 10px' }}>Reserve Your Exclusive Slot</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Pick your arrival date and time slot. Our concurrency lock guarantees no other driver can double-book your connector.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: 30, textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--green-50)',
                  color: 'var(--green-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Zap size={28} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--green-600)' }}>STEP 3</span>
              <h3 style={{ fontSize: '1.25rem', margin: '6px 0 10px' }}>Navigate & Power Up</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Click "Navigate to Charging Location" to launch Google Maps driving directions directly to the host's bay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COMMUNITY CHARGERS SECTION */}
      <section style={{ padding: '80px 0', background: 'var(--bg-app)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 40,
              gap: 16,
            }}
          >
            <div>
              <span className="badge badge-navy" style={{ marginBottom: 10 }}>
                Live Community Listings
              </span>
              <h2 style={{ fontSize: '2.2rem', margin: 0 }}>
                Community Chargers Near You
              </h2>
            </div>
            <button
              type="button"
              className="btn btn-outline-green"
              onClick={() => onNavigate('/owner/dashboard')}
            >
              Explore All on Map →
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 24,
            }}
          >
            {featuredChargers.slice(0, 3).map((charger) => (
              <div key={charger.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img
                    src={charger.photos?.[0] || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'}
                    alt={charger.charger_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      display: 'flex',
                      gap: 6,
                    }}
                  >
                    <span className="badge badge-green">
                      {charger.power_kw} kW {charger.charger_type === 'DC Fast Charger' ? '⚡ DC' : 'AC'}
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(10, 25, 47, 0.85)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span>{charger.average_rating || 5.0}</span>
                  </div>
                </div>

                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: 6 }}>{charger.charger_name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="var(--green-600)" />
                    {charger.city}, {charger.state} {charger.distance_km ? `• ${charger.distance_km} km away` : ''}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-app)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 16,
                      fontSize: '0.88rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Connector: </span>
                      <b>{charger.connector_type}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--green-600)', fontWeight: 800, fontSize: '1.05rem' }}>
                        ₹{charger.price.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        /{charger.pricing_model === 'per_kwh' ? 'kWh' : 'hr'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => onNavigate(`/chargers/${charger.id}`)}
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => onSelectCharger(charger)}
                    >
                      Book Slot ⚡
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section style={{ padding: '80px 0', background: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 36, alignItems: 'center' }}>
            <div>
              <span className="badge badge-green" style={{ marginBottom: 12 }}>
                For EV Drivers
              </span>
              <h2 style={{ fontSize: '2.4rem', marginBottom: 16 }}>
                Say Goodbye to Public Charger Crowds & Broken Plugs
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Commercial charging plazas are frequently overcrowded, out of service, or blocked by idling vehicles. ChargeNeighbor opens up thousands of private neighborhood charging stations with confirmed, reserved access.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Guaranteed Reserved Time</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      No waiting in line behind other cars. The connector is reserved exclusively for you.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Fair Neighborhood Rates</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Avoid surge pricing and steep demand fees charged by highway commercial stations.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Safe Residential Locations</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Charge in tranquil, secure driveways and residential spaces with verified community hosts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Earnings Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--green-glow)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: 16,
                }}
              >
                Earn by Sharing Your Charger
              </span>
              <h3 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: 12 }}>
                Turn Your Idle Home Charger into Extra Income
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
                Most residential EV chargers sit unused for 20+ hours each day. Host nearby EV owners, set your own schedule, and earn passive revenue while helping accelerate clean mobility.
              </p>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  marginBottom: 28,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Average Host Earnings:</span>
                  <span style={{ color: 'var(--green-glow)', fontWeight: 800 }}>₹15,000 – ₹38,000 / month</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Full Host Control:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>Accept / Reject Requests</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => onNavigate('/provider/register')}
              >
                Register Your Charger Now ⚡
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section style={{ padding: '80px 0', background: 'var(--bg-app)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge badge-navy" style={{ marginBottom: 10 }}>
              Got Questions?
            </span>
            <h2 style={{ fontSize: '2.2rem', margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="card"
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <div
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={18} color="var(--green-600)" /> : <ChevronDown size={18} />}
                  </div>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '70px 0', background: 'var(--navy-950)', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <Sparkles size={36} color="var(--green-glow)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '2.4rem', color: '#ffffff', marginBottom: 14 }}>
            Ready to Electrify Your Neighborhood?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: 30, lineHeight: 1.6 }}>
            Join thousands of EV owners and friendly residential charging hosts. Register today and enjoy guaranteed charging slots anywhere.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('/owner/register')}
            >
              Sign Up as EV Driver
            </button>
            <button
              type="button"
              className="btn btn-outline-green btn-lg"
              style={{ color: '#ffffff', borderColor: 'var(--green-500)' }}
              onClick={() => onNavigate('/provider/register')}
            >
              List Your Charger
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
