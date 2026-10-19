import React, { useState, useEffect } from 'react';
import { Charger, Booking, UserProfile } from '../types';
import { DataService } from '../services/dataService';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Car,
  BatteryCharging,
  Zap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface BookingModalProps {
  charger: Charger;
  currentUser: UserProfile | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onNavigateToBookings: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  charger,
  currentUser,
  onClose,
  onBookingSuccess,
  onNavigateToBookings,
}) => {
  // Step 2 to 7 (Step 1 is the charger already selected)
  const [step, setStep] = useState<number>(2);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<{ slot: string; available: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Vehicle Details
  const [vehicleModel, setVehicleModel] = useState<string>('Tesla Model Y');
  const [connectorType, setConnectorType] = useState<string>(charger.connector_type);
  const [batteryPercentage, setBatteryPercentage] = useState<number>(15);
  const [durationHours, setDurationHours] = useState<number>(1);

  // Booking result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load available time slots when date changes
  useEffect(() => {
    let isMounted = true;
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const slots = await DataService.getAvailableTimeSlots(charger.id, selectedDate);
        if (isMounted) {
          setAvailableSlots(slots);
          const firstFree = slots.find((s) => s.available)?.slot || '';
          setSelectedSlot(firstFree);
        }
      } catch (err) {
        console.error('Error fetching slots', err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => {
      isMounted = false;
    };
  }, [charger.id, selectedDate]);

  // Pricing calculations (INR)
  const calculateCost = () => {
    if (charger.pricing_model === 'per_kwh') {
      const estimatedKwh = charger.power_kw >= 50 ? 40 * durationHours : Math.min(charger.power_kw, 11) * durationHours;
      const energyCost = estimatedKwh * charger.price;
      const serviceFee = 25.00; // Flat ₹25 community convenience fee
      return {
        energyCost: Math.round(energyCost * 100) / 100,
        serviceFee,
        total: Math.round((energyCost + serviceFee) * 100) / 100,
      };
    } else {
      const timeCost = charger.price * durationHours;
      const serviceFee = 25.00;
      return {
        energyCost: Math.round(timeCost * 100) / 100,
        serviceFee,
        total: Math.round((timeCost + serviceFee) * 100) / 100,
      };
    }
  };

  const pricing = calculateCost();

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      setErrorMessage('You must be logged in as an EV driver to book a slot.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const booking = await DataService.createBookingAtomic({
        ownerId: currentUser.id,
        chargerId: charger.id,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        vehicleModel,
        connectorType,
        batteryPercentage,
        durationHours,
      });

      setConfirmedBooking(booking);
      setStep(7); // Jump to confirmation
      onBookingSuccess(booking);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#00e676', '#0a192f', '#3b82f6'],
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete booking. Please choose another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleMapsUrl = confirmedBooking
    ? `https://www.google.com/maps/dir/?api=1&destination=${confirmedBooking.charger_latitude || charger.latitude},${confirmedBooking.charger_longitude || charger.longitude}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${charger.latitude},${charger.longitude}&travelmode=driving`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--navy-900)',
            color: '#ffffff',
            borderTopLeftRadius: 'var(--radius-lg)',
            borderTopRightRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--green-glow)',
                flexShrink: 0,
              }}
            >
              <Zap size={18} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.05rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {step === 7 ? 'Booking Confirmed! ⚡' : `Reserve Slot: ${charger.charger_name}`}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {step === 7 ? 'Your charging slot is locked and secured' : `Step ${step} of 6 • ${charger.city}, ${charger.state}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 6,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {errorMessage && (
            <div
              style={{
                background: 'var(--red-50)',
                color: 'var(--red-600)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 16,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid #fecaca',
              }}
            >
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 2: SELECT DATE */}
          {step === 2 && (
            <div>
              <h4 style={{ marginBottom: 12, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="var(--green-600)" />
                Choose Charging Date
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Select when you plan to arrive at {charger.charger_name}.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 85px), 1fr))', gap: 8, marginBottom: 20 }}>
                {[0, 1, 2].map((offset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const dateStr = d.toISOString().split('T')[0];
                  const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      style={{
                        padding: '12px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--green-500)' : '1px solid var(--border-light)',
                        background: isSelected ? 'var(--green-50)' : '#ffffff',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? 'var(--green-600)' : 'var(--navy-900)' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {dateStr}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="form-group">
                <label className="form-label">Or Pick Custom Date:</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                >
                  Continue to Time Slot <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT TIME SLOT */}
          {step === 3 && (
            <div>
              <h4 style={{ marginBottom: 12, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="var(--green-600)" />
                Select Time Slot for {selectedDate}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Host operating hours: <b>{charger.operating_hours}</b>. Only free, uncontested slots can be reserved.
              </p>

              {loadingSlots ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Checking slot availability...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 110px), 1fr))', gap: 8, maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>
                  {availableSlots.map(({ slot, available }) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected
                            ? '2px solid var(--green-500)'
                            : available
                            ? '1px solid var(--border-light)'
                            : '1px solid #fee2e2',
                          background: isSelected
                            ? 'var(--green-50)'
                            : available
                            ? '#ffffff'
                            : '#fef2f2',
                          color: available ? 'var(--navy-900)' : '#9ca3af',
                          cursor: available ? 'pointer' : 'not-allowed',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          opacity: available ? 1 : 0.6,
                        }}
                      >
                        <div>{slot}</div>
                        <div style={{ fontSize: '0.7rem', color: available ? (isSelected ? 'var(--green-600)' : 'var(--text-muted)') : 'var(--red-500)', marginTop: 4 }}>
                          {available ? 'Available' : 'Booked'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selectedSlot}
                  onClick={() => setStep(4)}
                >
                  Continue to Vehicle Details <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ENTER VEHICLE DETAILS */}
          {step === 4 && (
            <div>
              <h4 style={{ marginBottom: 12, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Car size={18} color="var(--green-600)" />
                Vehicle & Battery Details
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Helps the host prepare compatibility and ensures your vehicle receives optimal charging rate.
              </p>

              <div className="form-group">
                <label className="form-label">Vehicle Make & Model</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hyundai Ioniq 5, Tesla Model 3, Rivian R1T"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Connector Type</label>
                <select
                  className="form-select"
                  value={connectorType}
                  onChange={(e) => setConnectorType(e.target.value)}
                >
                  <option value={charger.connector_type}>
                    {charger.connector_type} (Native Charger Match)
                  </option>
                  <option value="Type 2 (Mennekes)">Type 2 (Mennekes)</option>
                  <option value="CCS2">CCS2 Combo</option>
                  <option value="Tesla / NACS">Tesla / NACS</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="GB/T">GB/T</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="form-label">Current Battery Level</label>
                  <span style={{ fontWeight: 700, color: batteryPercentage <= 10 ? 'var(--red-600)' : 'var(--green-600)' }}>
                    {batteryPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={batteryPercentage}
                  onChange={(e) => setBatteryPercentage(Number(e.target.value))}
                  style={{ width: '100%', accentColor: batteryPercentage <= 10 ? '#ef4444' : '#10b981' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Charging Duration</label>
                <select
                  className="form-select"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours (Full Charge)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(3)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(5)}
                >
                  View Summary & Pricing <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BOOKING SUMMARY */}
          {step === 5 && (
            <div>
              <h4 style={{ marginBottom: 12, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="var(--green-600)" />
                Review Reservation Details
              </h4>

              <div
                style={{
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  marginBottom: 16,
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Charging Station:</span>
                  <span style={{ fontWeight: 600 }}>{charger.charger_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Host / Provider:</span>
                  <span style={{ fontWeight: 600 }}>{charger.provider_name || 'Verified Host'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                  <span style={{ fontWeight: 600 }}>{selectedDate} • {selectedSlot}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                  <span style={{ fontWeight: 600 }}>{vehicleModel} ({connectorType})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Charger Output:</span>
                  <span style={{ fontWeight: 600 }}>{charger.power_kw} kW • {charger.charger_type}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed var(--border-light)', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Charging Cost:</span>
                  <span>₹{pricing.energyCost.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Platform Convenience Fee:</span>
                  <span>₹{pricing.serviceFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: 8 }}>
                  <span>Total Estimated:</span>
                  <span style={{ color: 'var(--green-600)' }}>₹{pricing.total.toFixed(2)}</span>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  marginBottom: 20,
                }}
              >
                ⚠️ <b>Notice:</b> Actual delivered energy and cost may vary depending on vehicle battery thermal conditions, onboard AC inverter limits, and peak electricity rates. No upfront online payment required in beta; payment is coordinated with the host.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(4)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                >
                  {isSubmitting ? 'Securing Slot...' : 'Confirm & Reserve Slot ⚡'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: CONFIRMATION */}
          {step === 7 && confirmedBooking && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--green-50)',
                  color: 'var(--green-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', marginBottom: 6 }}>
                Slot Successfully Booked!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                Your reservation reference is{' '}
                <strong style={{ color: 'var(--navy-900)', background: '#e2e8f0', padding: '3px 8px', borderRadius: 4 }}>
                  {confirmedBooking.booking_reference}
                </strong>
              </p>

              <div
                style={{
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  textAlign: 'left',
                  border: '1px solid var(--border-light)',
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <MapPin size={18} color="var(--green-600)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {confirmedBooking.charger_address}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <Clock size={16} />
                  <span>{confirmedBooking.booking_date} at {confirmedBooking.start_time} - {confirmedBooking.end_time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <BatteryCharging size={16} />
                  <span>{confirmedBooking.vehicle_model} • Estimated ₹{confirmedBooking.estimated_cost.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Official Google Maps Directions Link */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <MapPin size={18} /> Navigate in Google Maps <ExternalLink size={16} />
                </a>

                <button
                  type="button"
                  className="btn btn-navy"
                  onClick={onNavigateToBookings}
                >
                  View in My Bookings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
