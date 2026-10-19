import React, { useState } from 'react';
import { ShieldCheck, Mail, HelpCircle, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StaticPageProps {
  type: 'support' | 'privacy' | 'terms';
  onNavigate: (route: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);

  if (type === 'support') {
    return (
      <div style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="badge badge-green" style={{ marginBottom: 8 }}>Help Center</span>
            <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)' }}>Customer & Host Support</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Need assistance with a booking, charger listing, or account access? We are here 24/7.
            </p>
          </div>

          <div className="card" style={{ padding: 32, marginBottom: 32 }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={48} color="var(--green-500)" style={{ margin: '0 auto 12px' }} />
                <h3>Support Request Dispatched</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                  Our community support team has received your ticket and will respond within 30 minutes.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input type="text" className="form-input" placeholder="Alex Morgan" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="name@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select">
                    <option>Reservation Assistance / Booking Question</option>
                    <option>Charger Hardware / Compatibility Issue</option>
                    <option>Host Earnings & Payouts</option>
                    <option>Report Inappropriate Etiquette</option>
                    <option>Other Inquiry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message Details</label>
                  <textarea className="form-textarea" rows={4} placeholder="Please describe how we can assist..." required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Submit Support Ticket ⚡
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'privacy') {
    return (
      <div style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <span className="badge badge-navy" style={{ marginBottom: 8 }}>Data Protection</span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginBottom: 20 }}>
            Privacy Policy & Residential Address Protection
          </h1>
          <div className="card" style={{ padding: 32, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>1. Residential Address Obfuscation</h3>
            <p style={{ marginBottom: 18 }}>
              ChargeNeighbor prioritizes the safety and privacy of community charging hosts. Public map searches and listings deliberately display only general localities, cities, and approximate distances. Exact residential street addresses and unit access instructions are strictly sealed and only disclosed to authenticated EV drivers after a valid reservation has been confirmed.
            </p>

            <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>2. Geolocation & Permissions</h3>
            <p style={{ marginBottom: 18 }}>
              We never access your physical device GPS coordinates without explicit browser permission. Location data is processed ephemerally on the client to calculate straight-line Haversine distances to nearby stations and is never sold or shared with commercial advertising brokers.
            </p>

            <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>3. Vehicle Battery Advisory Notice</h3>
            <p style={{ marginBottom: 18 }}>
              The battery percentage alert system functions solely on user-entered values for roadside guidance and urgent charging recommendations. We do not inspect or communicate directly with your vehicle’s onboard CAN-bus or telemetry unless a certified automaker API has been connected.
            </p>

            <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>4. Data Deletion & Profile Controls</h3>
            <p>
              Users may update their profiles, deactivate charging listings, or request full account deletion at any time via their profile settings or by contacting privacy@chargeneighbor.com.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <span className="badge badge-green" style={{ marginBottom: 8 }}>Legal Agreement</span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginBottom: 20 }}>
          Terms of Service & Community Rules
        </h1>
        <div className="card" style={{ padding: 32, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>1. Community Etiquette & Punctuality</h3>
          <p style={{ marginBottom: 18 }}>
            Drivers must arrive within 15 minutes of their scheduled booking start time and disconnect promptly when their reservation window concludes to ensure fair availability for subsequent drivers.
          </p>

          <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>2. Host Equipment Responsibilities</h3>
          <p style={{ marginBottom: 18 }}>
            Hosts represent that their charging apparatus is compliant with local electrical codes and is kept in safe, dry operating condition. Self-declarations are marked as "Verification Pending" until accredited verification documentation has been recorded.
          </p>

          <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>3. Cancellation & Rescheduling Policy</h3>
          <p style={{ marginBottom: 18 }}>
            Reservations can be freely cancelled by drivers or hosts without penalty up to 1 hour prior to the booking slot start time. Repeated unexcused no-shows may lead to temporary suspension from the booking platform.
          </p>

          <h3 style={{ color: 'var(--navy-900)', marginBottom: 8 }}>4. Payment Terms</h3>
          <p>
            During platform beta, energy fees are coordinated directly between driver and host or tracked as estimates. Official payment provider integrations will settle payouts automatically following completion of the charging session.
          </p>
        </div>
      </div>
    </div>
  );
};
