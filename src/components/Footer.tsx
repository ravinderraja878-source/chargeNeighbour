import React from 'react';
import { Zap, Shield, Heart, HelpCircle, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--navy-950)',
        color: '#94a3b8',
        padding: '60px 0 30px',
        borderTop: '1px solid var(--navy-800)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 'clamp(24px, 4vw, 40px)',
            marginBottom: 40,
          }}
        >
          {/* Brand Col */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#ffffff',
                fontSize: '1.3rem',
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--green-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Zap size={20} fill="#ffffff" />
              </div>
              <span>
                Charge<span style={{ color: 'var(--green-400)' }}>Neighbor</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: 16 }}>
              The community-driven EV charging network that eliminates range anxiety. Connecting EV owners with verified neighborhood private chargers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--green-400)' }}>
              <Shield size={16} /> 100% Community Verified & Safe
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: 18 }}>EV Drivers</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/owner/dashboard')}
                  style={{ background: 'transparent', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }}
                >
                  Find Nearby Chargers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/owner/login')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Driver Login & Sign Up
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/owner/bookings')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  My Reserved Slots
                </button>
              </li>
            </ul>
          </div>

          {/* Providers */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: 18 }}>Charging Hosts</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/provider/register')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Become a Charging Host
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/provider/login')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Host Portal Login
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/provider/register-charger')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  List a Home Charger
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: 18 }}>Trust & Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/support')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Mail size={14} /> Help & Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/privacy')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Privacy Policy & Address Safety
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/terms')}
                  style={{ background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Terms & Cancellation Rules
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 24,
            borderTop: '1px solid var(--navy-800)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            gap: 12,
          }}
        >
          <div>
            © {new Date().getFullYear()} ChargeNeighbor Inc. All rights reserved. Built for modern EV communities.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Powered by clean energy & community trust</span>
            <Heart size={14} color="var(--green-500)" fill="var(--green-500)" />
          </div>
        </div>
      </div>
    </footer>
  );
};
