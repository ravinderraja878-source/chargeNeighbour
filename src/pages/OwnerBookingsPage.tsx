import React, { useState, useEffect } from 'react';
import { UserProfile, Booking } from '../types';
import { DataService } from '../services/dataService';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  ExternalLink,
  XCircle,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface OwnerBookingsPageProps {
  currentUser: UserProfile;
  onNavigate: (route: string) => void;
}

export const OwnerBookingsPage: React.FC<OwnerBookingsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await DataService.getOwnerBookings(currentUser.id);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser.id]);

  const handleCancel = async (bookingId: string) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this reservation?');
    if (!confirmCancel) return;

    try {
      await DataService.updateBookingStatus(bookingId, 'Cancelled', 'Cancelled by driver');
      loadBookings();
    } catch (e: any) {
      alert(e.message || 'Failed to cancel reservation.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    try {
      await DataService.addReview({
        booking_id: reviewBooking.id,
        owner_id: currentUser.id,
        charger_id: reviewBooking.charger_id,
        rating,
        comment: reviewComment,
        owner_name: currentUser.full_name,
      });

      setReviewSuccess('Thank you for submitting your feedback!');
      setTimeout(() => {
        setReviewBooking(null);
        setReviewSuccess('');
        setReviewComment('');
      }, 1500);
    } catch (e: any) {
      alert(e.message || 'Failed to submit review.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'active') return ['Pending', 'Confirmed', 'In Progress'].includes(b.status);
    if (filterTab === 'completed') return b.status === 'Completed';
    if (filterTab === 'cancelled') return ['Cancelled', 'Rejected'].includes(b.status);
    return true;
  });

  return (
    <div style={{ padding: '30px 0 80px' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        {/* Title */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="badge badge-green">Driver Bookings</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', margin: 0 }}>My Reserved Slots</h1>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate('/owner/dashboard')}
          >
            Find Another Charger ⚡
          </button>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
          <button
            type="button"
            className={`btn btn-sm ${filterTab === 'all' ? 'btn-navy' : 'btn-secondary'}`}
            onClick={() => setFilterTab('all')}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterTab === 'active' ? 'btn-navy' : 'btn-secondary'}`}
            onClick={() => setFilterTab('active')}
          >
            Active & Upcoming ({bookings.filter((b) => ['Pending', 'Confirmed', 'In Progress'].includes(b.status)).length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterTab === 'completed' ? 'btn-navy' : 'btn-secondary'}`}
            onClick={() => setFilterTab('completed')}
          >
            Completed ({bookings.filter((b) => b.status === 'Completed').length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterTab === 'cancelled' ? 'btn-navy' : 'btn-secondary'}`}
            onClick={() => setFilterTab('cancelled')}
          >
            Cancelled ({bookings.filter((b) => ['Cancelled', 'Rejected'].includes(b.status)).length})
          </button>
        </div>

        {/* Booking Cards */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading your reservations...</p>
        ) : filteredBookings.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <Calendar size={36} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No reservations found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Search for nearby community chargers and reserve your charging slot with zero queueing!
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('/owner/dashboard')}
            >
              Explore Nearby Chargers ⚡
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {filteredBookings.map((b) => {
              const isConfirmed = b.status === 'Confirmed';
              const isPending = b.status === 'Pending';
              const isInProgress = b.status === 'In Progress';
              const isCompleted = b.status === 'Completed';

              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${b.charger_latitude || 37.7749},${b.charger_longitude || -122.4194}&travelmode=driving`;

              return (
                <div key={b.id} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy-900)' }}>
                          {b.charger_name || 'Community Charger'}
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

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                        Reservation Ref: <b style={{ color: 'var(--navy-900)' }}>{b.booking_reference}</b>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: '0.88rem', color: 'var(--navy-900)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={15} color="var(--green-600)" />
                          <span><b>Date:</b> {b.booking_date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={15} color="var(--green-600)" />
                          <span><b>Time:</b> {b.start_time} – {b.end_time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Car size={15} color="var(--blue-500)" />
                          <span>{b.vehicle_model}</span>
                        </div>
                      </div>

                      {/* Address revealed upon confirmation */}
                      {(isConfirmed || isInProgress || isCompleted) && b.charger_address && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MapPin size={16} color="var(--green-600)" />
                          <span><b>Exact Address:</b> {b.charger_address} (Host: {b.provider_name})</span>
                        </div>
                      )}
                    </div>

                    {/* Actions & Navigation */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--green-600)' }}>
                          ₹{b.estimated_cost.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {/* Direct Google Maps Navigation Button */}
                        {(isConfirmed || isInProgress) && (
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ textDecoration: 'none' }}
                          >
                            <MapPin size={15} /> Navigate in Google Maps <ExternalLink size={14} />
                          </a>
                        )}

                        {/* Leave Review for completed charges */}
                        {isCompleted && (
                          <button
                            type="button"
                            className="btn btn-outline-green btn-sm"
                            onClick={() => setReviewBooking(b)}
                          >
                            <Star size={14} /> Leave Host Review
                          </button>
                        )}

                        {/* Cancel button if pending or confirmed */}
                        {(isPending || isConfirmed) && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCancel(b.id)}
                          >
                            <XCircle size={15} /> Cancel Booking
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

        {/* REVIEW MODAL */}
        {reviewBooking && (
          <div className="modal-overlay" onClick={() => setReviewBooking(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 10 }}>
                  Review Host: {reviewBooking.charger_name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
                  Your honest feedback helps maintain safety and trust across our community charging network.
                </p>

                {reviewSuccess ? (
                  <div
                    style={{
                      background: 'var(--green-50)',
                      color: 'var(--green-600)',
                      padding: 16,
                      borderRadius: 8,
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {reviewSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview}>
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            style={{
                              background: 'transparent',
                              fontSize: '1.8rem',
                              color: star <= rating ? '#f59e0b' : '#cbd5e1',
                              cursor: 'pointer',
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Feedback & Experience</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Was the driveway easily accessible? Did the charger deliver as expected?"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setReviewBooking(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
