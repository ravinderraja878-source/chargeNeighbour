import React, { useState, useEffect } from 'react';
import { UserProfile, Charger, Booking, BookingStatus } from '../types';
import { DataService } from '../services/dataService';
import {
  Zap,
  PlusCircle,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Flag,
  Car,
  MapPin,
  AlertCircle,
  Power,
  Edit3,
} from 'lucide-react';

interface ProviderDashboardProps {
  currentUser: UserProfile;
  onNavigate: (route: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'chargers'>('bookings');
  const [actionMessage, setActionMessage] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, bList] = await Promise.all([
        DataService.getProviderChargers(currentUser.id),
        DataService.getProviderBookings(currentUser.id),
      ]);
      setChargers(cList);
      setBookings(bList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  // Status updates
  const handleUpdateStatus = async (bookingId: string, status: BookingStatus, reason?: string) => {
    try {
      await DataService.updateBookingStatus(bookingId, status, reason);
      setActionMessage(`Booking status successfully updated to ${status}.`);
      setTimeout(() => setActionMessage(''), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleToggleCharger = async (charger: Charger) => {
    const nextStatus = charger.listing_status === 'active' ? 'inactive' : 'active';
    await DataService.updateChargerStatus(charger.id, nextStatus);
    loadData();
  };

  // Metrics
  const totalChargers = chargers.length;
  const pendingRequests = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
  const estimatedRevenue = bookings
    .filter((b) => ['Confirmed', 'In Progress', 'Completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.estimated_cost || 0), 0);

  return (
    <div style={{ padding: '30px 0 80px' }}>
      <div className="container">
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-navy">Host Portal</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Community Provider Management</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', margin: 0 }}>
              Host Dashboard: {currentUser.full_name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('/provider/register-charger')}
            >
              <PlusCircle size={18} /> Add New Charger
            </button>
          </div>
        </div>

        {actionMessage && (
          <div
            style={{
              background: 'var(--green-50)',
              color: 'var(--green-600)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 20,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--green-100)',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* METRICS CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Chargers</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: 4 }}>
              {chargers.filter((c) => c.listing_status === 'active').length} / {totalChargers}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', marginTop: 4 }}>Available on map</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Requests</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: pendingRequests > 0 ? 'var(--amber-500)' : 'var(--navy-900)', marginTop: 4 }}>
              {pendingRequests}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Requires host action</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Confirmed Slots</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-600)', marginTop: 4 }}>
              {confirmedBookings}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Upcoming EV arrivals</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Charges</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: 4 }}>
              {completedBookings}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Successful sessions</div>
          </div>

          <div className="card" style={{ padding: 20, background: 'var(--navy-900)', color: '#ffffff' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Estimated Earnings</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-glow)', marginTop: 4 }}>
              ₹{estimatedRevenue.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: 4 }}>*Estimates without meter telemetry</div>
          </div>
        </div>

        {/* TAB TOGGLES */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-navy' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={15} /> Driver Bookings ({bookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'chargers' ? 'btn-navy' : 'btn-secondary'}`}
            onClick={() => setActiveTab('chargers')}
          >
            <Zap size={15} /> My Charging Stations ({chargers.length})
          </button>
        </div>

        {/* TAB 1: MANAGE BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <Calendar size={32} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
                <h3>No Driver Bookings Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                  Ensure your chargers are toggled "Active" so EV drivers in your area can discover and book slots.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {bookings.map((b) => {
                  const isPending = b.status === 'Pending';
                  const isConfirmed = b.status === 'Confirmed';
                  const isInProgress = b.status === 'In Progress';
                  const isFinished = ['Completed', 'Cancelled', 'Rejected'].includes(b.status);

                  return (
                    <div
                      key={b.id}
                      className="card"
                      style={{
                        padding: 22,
                        borderLeft: isPending
                          ? '4px solid var(--amber-500)'
                          : isConfirmed
                          ? '4px solid var(--green-500)'
                          : isInProgress
                          ? '4px solid var(--blue-500)'
                          : '4px solid #cbd5e1',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                              Ref: {b.booking_reference}
                            </span>
                            <span
                              className={`badge ${
                                isConfirmed
                                  ? 'badge-green'
                                  : isPending
                                  ? 'badge-amber'
                                  : isInProgress
                                  ? 'badge-blue'
                                  : 'badge-navy'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            Station: <b>{b.charger_name || 'My Station'}</b>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={14} color="var(--green-600)" />
                              <span>{b.booking_date}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={14} color="var(--green-600)" />
                              <span>{b.start_time} – {b.end_time} ({b.duration_hours}h)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Car size={14} color="var(--blue-500)" />
                              <span>{b.vehicle_model} • {b.connector_type}</span>
                            </div>
                            {b.battery_percentage && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>Arrival Battery: <b>{b.battery_percentage}%</b></span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Financial and Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Payout</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-600)' }}>
                              ₹{b.estimated_cost.toFixed(2)}
                            </div>
                          </div>

                          {/* Action Buttons based on status */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                                >
                                  <CheckCircle2 size={15} /> Accept Request
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    const reason = prompt('Optional reason for rejection:') || 'Slot unavailable';
                                    handleUpdateStatus(b.id, 'Rejected', reason);
                                  }}
                                >
                                  <XCircle size={15} /> Reject
                                </button>
                              </>
                            )}

                            {isConfirmed && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-navy btn-sm"
                                  onClick={() => handleUpdateStatus(b.id, 'In Progress')}
                                >
                                  <PlayCircle size={15} /> Mark In Progress
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    const reason = prompt('Cancellation reason:') || 'Host emergency';
                                    handleUpdateStatus(b.id, 'Cancelled', reason);
                                  }}
                                >
                                  Cancel Slot
                                </button>
                              </>
                            )}

                            {isInProgress && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUpdateStatus(b.id, 'Completed')}
                              >
                                <CheckCircle2 size={15} /> Mark Completed ⚡
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE CHARGERS */}
        {activeTab === 'chargers' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {chargers.map((c) => {
                const isActive = c.listing_status === 'active';

                return (
                  <div key={c.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <span className={isActive ? 'badge badge-green' : 'badge badge-amber'}>
                          {isActive ? 'Active & Listed' : 'Disabled / Paused'}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', marginTop: 6, marginBottom: 2 }}>{c.charger_name}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {c.address}, {c.city}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCharger(c)}
                        title={isActive ? 'Deactivate charger' : 'Activate charger'}
                        style={{
                          background: isActive ? 'var(--green-50)' : '#f1f5f9',
                          color: isActive ? 'var(--green-600)' : 'var(--text-muted)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer',
                        }}
                      >
                        <Power size={14} />
                        {isActive ? 'Turn Off' : 'Turn On'}
                      </button>
                    </div>

                    <div
                      style={{
                        background: 'var(--bg-app)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Power & Type:</span>
                        <b>{c.power_kw} kW ({c.charger_type})</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Connector:</span>
                        <b>{c.connector_type}</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Rate:</span>
                        <b style={{ color: 'var(--green-600)' }}>₹{c.price.toFixed(2)}/{c.pricing_model === 'per_kwh' ? 'kWh' : 'hr'}</b>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => onNavigate(`/chargers/${c.id}`)}
                      >
                        View Public Page
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
