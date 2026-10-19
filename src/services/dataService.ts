import {
  UserProfile,
  Charger,
  Booking,
  NotificationItem,
  Review,
  SearchFilterState,
  BookingStatus,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Helper for Haversine distance formula
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// User profiles are created by users via registration
const SEED_USERS: UserProfile[] = [];

const SEED_CHARGERS: Charger[] = [
  {
    id: 'charger-sf-1',
    provider_id: 'provider-demo-1',
    charger_name: 'Mission Eco-Hub Solar Wallbox',
    charger_type: 'Level 2 AC',
    connector_type: 'Type 2 (Mennekes)',
    power_kw: 22,
    pricing_model: 'per_kwh',
    price: 15.00,
    address: '842 Valencia St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94110',
    latitude: 37.7599,
    longitude: -122.4214,
    operating_hours: '07:00 - 23:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Pull up to the left bay. Green cable is unlocked on the wall mount. 100% solar powered!',
    created_at: '2026-02-10T12:00:00Z',
    provider_name: 'Marcus Vance',
    provider_phone: '+91 98450 11223',
    average_rating: 4.9,
    review_count: 38,
    photos: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '16:00 - 17:00', '19:00 - 20:00'],
  },
  {
    id: 'charger-sf-2',
    provider_id: 'provider-demo-1',
    charger_name: 'SoMa Hyper-DC Rapid Point',
    charger_type: 'DC Fast Charger',
    connector_type: 'CCS2',
    power_kw: 60,
    pricing_model: 'per_kwh',
    price: 22.00,
    address: '320 4th Street',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94107',
    latitude: 37.7818,
    longitude: -122.4011,
    operating_hours: '06:00 - 24:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Gated parking space behind the townhomes. Code provided upon confirmed booking.',
    created_at: '2026-02-18T14:30:00Z',
    provider_name: 'Marcus Vance',
    provider_phone: '+91 98450 22334',
    average_rating: 4.8,
    review_count: 52,
    photos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558441719-8d18471b0bc4?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['07:00 - 08:00', '11:00 - 12:00', '12:00 - 13:00', '15:00 - 16:00', '18:00 - 19:00', '21:00 - 22:00'],
  },
  {
    id: 'charger-sf-3',
    provider_id: 'provider-demo-2',
    charger_name: 'Sunset Ocean-Breeze Tesla & NACS Station',
    charger_type: 'Level 2 AC',
    connector_type: 'Tesla / NACS',
    power_kw: 11.5,
    pricing_model: 'per_hour',
    price: 180.00,
    address: '1420 22nd Ave',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94122',
    latitude: 37.7612,
    longitude: -122.4795,
    operating_hours: '08:00 - 21:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Wide driveway, easy reversal. Tesla Gen 3 Wall Connector with 24ft cable.',
    created_at: '2026-03-01T09:15:00Z',
    provider_name: 'Elena Rostova',
    provider_phone: '+91 98450 33445',
    average_rating: 5.0,
    review_count: 21,
    photos: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['08:00 - 09:00', '09:00 - 10:00', '13:00 - 14:00', '14:00 - 15:00', '17:00 - 18:00'],
  },
  {
    id: 'charger-sf-4',
    provider_id: 'provider-host-sf',
    charger_name: 'Marina Green Clean Charge',
    charger_type: 'Level 2 AC',
    connector_type: 'Type 2 (Mennekes)',
    power_kw: 22,
    pricing_model: 'per_kwh',
    price: 16.50,
    address: '2240 Chestnut St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94123',
    latitude: 37.8005,
    longitude: -122.4418,
    operating_hours: '07:30 - 22:30',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Covered carport. Security camera on-site for peace of mind while charging.',
    created_at: '2026-03-12T16:00:00Z',
    provider_name: 'Elena Rostova',
    provider_phone: '+91 98450 44556',
    average_rating: 4.7,
    review_count: 15,
    photos: [
      'https://images.unsplash.com/photo-1558441719-8d18471b0bc4?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '15:00 - 16:00', '19:00 - 20:00'],
  },
  // Indian Community Charging Stations
  {
    id: 'charger-blr-1',
    provider_id: 'host-blr-1',
    charger_name: 'Indiranagar 100ft Solar Hub',
    charger_type: 'Level 2 AC',
    connector_type: 'Type 2 (Mennekes)',
    power_kw: 22,
    pricing_model: 'per_kwh',
    price: 16.00,
    address: '742 12th Main Rd, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560038',
    latitude: 12.9716,
    longitude: 77.6412,
    operating_hours: '06:00 - 23:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Dedicated visitor parking bay with green canopy. Solar grid-tied 22 kW smart charger.',
    created_at: '2026-03-01T10:00:00Z',
    provider_name: 'Arjun Sharma',
    provider_phone: '+91 98450 12345',
    average_rating: 4.9,
    review_count: 42,
    photos: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['07:00 - 08:00', '08:00 - 09:00', '10:00 - 11:00', '14:00 - 15:00', '17:00 - 18:00', '20:00 - 21:00'],
  },
  {
    id: 'charger-blr-2',
    provider_id: 'host-blr-2',
    charger_name: 'Koramangala 4th Block Hyper-DC',
    charger_type: 'DC Fast Charger',
    connector_type: 'CCS2',
    power_kw: 60,
    pricing_model: 'per_kwh',
    price: 21.00,
    address: '18 80 Feet Road, Koramangala 4th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
    operating_hours: '24 Hours',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Gated residential complex. Security guard will guide you to Bay #2. High speed DC 60 kW.',
    created_at: '2026-03-05T12:00:00Z',
    provider_name: 'Priya Reddy',
    provider_phone: '+91 98451 98765',
    average_rating: 4.95,
    review_count: 67,
    photos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558441719-8d18471b0bc4?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['06:00 - 07:00', '09:00 - 10:00', '12:00 - 13:00', '15:00 - 16:00', '18:00 - 19:00', '21:00 - 22:00'],
  },
  {
    id: 'charger-hyd-1',
    provider_id: 'host-hyd-1',
    charger_name: 'Hitec City Cyber Towers Rapid Point',
    charger_type: 'DC Fast Charger',
    connector_type: 'CCS2',
    power_kw: 60,
    pricing_model: 'per_kwh',
    price: 22.00,
    address: 'Plot 14, Phase 2, HITEC City',
    city: 'Hyderabad',
    state: 'Telangana',
    postal_code: '500081',
    latitude: 17.4504,
    longitude: 78.3808,
    operating_hours: '06:00 - 24:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Wide basement driveway with automatic boom barrier. CCTV monitored 24/7.',
    created_at: '2026-03-08T14:00:00Z',
    provider_name: 'Vikram Patel',
    provider_phone: '+91 99890 54321',
    average_rating: 4.88,
    review_count: 53,
    photos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['08:00 - 09:00', '11:00 - 12:00', '13:00 - 14:00', '16:00 - 17:00', '19:00 - 20:00'],
  },
  {
    id: 'charger-hyd-2',
    provider_id: 'host-hyd-2',
    charger_name: 'Jubilee Hills Road 36 Green Station',
    charger_type: 'Level 2 AC',
    connector_type: 'Type 2 (Mennekes)',
    power_kw: 22,
    pricing_model: 'per_kwh',
    price: 18.00,
    address: 'Road No. 36, Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    postal_code: '500033',
    latitude: 17.4319,
    longitude: 78.4073,
    operating_hours: '07:00 - 23:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Front courtyard parking. Plug & charge enabled with app confirmation.',
    created_at: '2026-03-10T09:30:00Z',
    provider_name: 'Sneha Rao',
    provider_phone: '+91 98850 67890',
    average_rating: 4.92,
    review_count: 29,
    photos: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['07:00 - 08:00', '09:00 - 10:00', '12:00 - 13:00', '15:00 - 16:00', '18:00 - 19:00'],
  },
  {
    id: 'charger-mum-1',
    provider_id: 'host-mum-1',
    charger_name: 'Bandra West Pali Hill EV Hub',
    charger_type: 'DC Fast Charger',
    connector_type: 'CCS2',
    power_kw: 50,
    pricing_model: 'per_kwh',
    price: 22.00,
    address: 'Pali Mala Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400050',
    latitude: 19.0596,
    longitude: 72.8295,
    operating_hours: '07:00 - 23:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Spacious driveway beside sea-facing bungalow. Fast charging for all CCS2 compatible EVs.',
    created_at: '2026-03-14T11:00:00Z',
    provider_name: 'Rohan Mehta',
    provider_phone: '+91 98200 45678',
    average_rating: 4.9,
    review_count: 48,
    photos: [
      'https://images.unsplash.com/photo-1558441719-8d18471b0bc4?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['08:00 - 09:00', '10:00 - 11:00', '13:00 - 14:00', '16:00 - 17:00', '20:00 - 21:00'],
  },
  {
    id: 'charger-del-1',
    provider_id: 'host-del-1',
    charger_name: 'Connaught Place Central Fast Point',
    charger_type: 'DC Fast Charger',
    connector_type: 'CCS2',
    power_kw: 60,
    pricing_model: 'per_kwh',
    price: 20.00,
    address: 'Barakhamba Road, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    postal_code: '110001',
    latitude: 28.6315,
    longitude: 77.2167,
    operating_hours: '06:00 - 24:00',
    listing_status: 'active',
    safety_checked: true,
    instructions: 'Central Delhi prime parking with shaded canopy and water dispenser.',
    created_at: '2026-03-16T15:00:00Z',
    provider_name: 'Ananya Verma',
    provider_phone: '+91 98110 34567',
    average_rating: 4.85,
    review_count: 36,
    photos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    ],
    available_slots: ['07:00 - 08:00', '10:00 - 11:00', '14:00 - 15:00', '17:00 - 18:00', '21:00 - 22:00'],
  },
];

const SEED_BOOKINGS: Booking[] = [];

const SEED_NOTIFICATIONS: NotificationItem[] = [];

const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    booking_id: 'booking-seed-1',
    owner_id: 'owner-real-1',
    charger_id: 'charger-blr-1',
    rating: 5,
    comment: 'Super fast charging and clean parking instructions! Will definitely book again.',
    owner_name: 'Ravi Kumar',
    created_at: '2026-03-20T16:00:00Z',
  },
  {
    id: 'rev-2',
    booking_id: 'booking-seed-2',
    owner_id: 'owner-real-2',
    charger_id: 'charger-hyd-1',
    rating: 5,
    comment: 'Clean garage, reliable high-power connection. Saved me from running low on battery!',
    owner_name: 'Kavitha S.',
    created_at: '2026-03-18T18:30:00Z',
  },
];

// Local Storage Keys (Version 2 with Indian Rupees)
const LS_CURRENT_USER = 'chargeneighbor_inr_user_v2';
const LS_USERS = 'chargeneighbor_inr_users_v2';
const LS_CHARGERS = 'chargeneighbor_inr_chargers_v2';
const LS_BOOKINGS = 'chargeneighbor_inr_bookings_v2';
const LS_NOTIFICATIONS = 'chargeneighbor_inr_notifications_v2';
const LS_REVIEWS = 'chargeneighbor_inr_reviews_v2';

function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

// Storage Initializer: purges obsolete demo accounts
function ensureInitialized(): void {
  try {
    const rawUser = localStorage.getItem(LS_CURRENT_USER);
    if (rawUser && (rawUser.includes('owner-demo') || rawUser.includes('provider-demo') || rawUser.includes('demo.com') || rawUser.includes('Alex Johnson') || rawUser.includes('Marcus Vance'))) {
      localStorage.removeItem(LS_CURRENT_USER);
    }
    // Clean demo users from storage
    const rawUsers = localStorage.getItem(LS_USERS);
    if (rawUsers) {
      const users = JSON.parse(rawUsers) as UserProfile[];
      const cleanUsers = users.filter((u) => !u.email.includes('demo') && !u.id.includes('demo'));
      localStorage.setItem(LS_USERS, JSON.stringify(cleanUsers));
    }
    // Clean demo bookings from storage
    const rawBookings = localStorage.getItem(LS_BOOKINGS);
    if (rawBookings) {
      const bookings = JSON.parse(rawBookings) as Booking[];
      const cleanBookings = bookings.filter((b) => !b.owner_id.includes('demo'));
      localStorage.setItem(LS_BOOKINGS, JSON.stringify(cleanBookings));
    }
  } catch {}

  if (!localStorage.getItem(LS_USERS)) {
    setLocalStorage(LS_USERS, []);
  }
  // If chargers not yet seeded or need updating to include Indian stations and Indian numbers
  const currentChargers = getLocalStorage<Charger[]>(LS_CHARGERS, []);
  if (!currentChargers || currentChargers.length === 0 || !currentChargers.some(c => c.city === 'Bengaluru') || currentChargers.some(c => c.provider_phone?.includes('+1 (555)'))) {
    setLocalStorage(LS_CHARGERS, SEED_CHARGERS);
  }
  if (!localStorage.getItem(LS_BOOKINGS)) {
    setLocalStorage(LS_BOOKINGS, []);
  }
  if (!localStorage.getItem(LS_NOTIFICATIONS)) {
    setLocalStorage(LS_NOTIFICATIONS, []);
  }
  if (!localStorage.getItem(LS_REVIEWS)) {
    setLocalStorage(LS_REVIEWS, SEED_REVIEWS);
  }
}

// Execute initial storage setup
if (typeof window !== 'undefined') {
  ensureInitialized();
}

export const DataService = {
  isSupabaseLive(): boolean {
    return isSupabaseConfigured;
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) return profile as UserProfile;
    }

    const saved = getLocalStorage<UserProfile | null>(LS_CURRENT_USER, null);
    return saved;
  },

  async login(email: string, roleRequired: 'owner' | 'provider'): Promise<UserProfile> {
    ensureInitialized();
    const users = getLocalStorage<UserProfile[]>(LS_USERS, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('No account found with this email. Please click "Create Account" below to register.');
    }

    if (user.role !== roleRequired) {
      throw new Error(`This account is registered as a ${user.role === 'owner' ? 'Driver' : 'Host'}. Please use the ${user.role === 'owner' ? 'Driver' : 'Host'} portal.`);
    }

    setLocalStorage(LS_CURRENT_USER, user);
    return user;
  },

  async registerUser(params: {
    fullName: string;
    email: string;
    phone: string;
    role: 'owner' | 'provider';
    propertyDetails?: {
      propertyType: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
    };
  }): Promise<UserProfile> {
    ensureInitialized();
    const users = getLocalStorage<UserProfile[]>(LS_USERS, SEED_USERS);

    if (users.some((u) => u.email.toLowerCase() === params.email.toLowerCase())) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      full_name: params.fullName,
      email: params.email,
      phone: params.phone,
      role: params.role,
      created_at: new Date().toISOString(),
      property_details: params.propertyDetails
        ? {
            property_type: params.propertyDetails.propertyType,
            address: params.propertyDetails.address,
            city: params.propertyDetails.city,
            state: params.propertyDetails.state,
            postal_code: params.propertyDetails.postalCode,
          }
        : undefined,
    };

    users.push(newUser);
    setLocalStorage(LS_USERS, users);
    setLocalStorage(LS_CURRENT_USER, newUser);

    // Create welcome notification
    this.createNotification(
      newUser.id,
      `Welcome to ChargeNeighbor! ⚡`,
      params.role === 'owner'
        ? 'Your EV driver profile is ready. Search nearby community chargers and book your first slot!'
        : 'Your host profile is active. Register your home or business charger now to start receiving booking requests!'
    );

    return newUser;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LS_CURRENT_USER);
  },

  // ==========================================
  // CHARGERS DISCOVERY & DETAILS
  // ==========================================

  async getNearbyChargers(filters: SearchFilterState): Promise<Charger[]> {
    ensureInitialized();
    let chargers = getLocalStorage<Charger[]>(LS_CHARGERS, SEED_CHARGERS);

    // Only active listings visible in public search
    chargers = chargers.filter((c) => c.listing_status === 'active');

    const originLat = filters.userLat ?? 37.7749;
    const originLng = filters.userLng ?? -122.4194;

    // Attach distance
    chargers = chargers.map((c) => ({
      ...c,
      distance_km: calculateDistanceKm(originLat, originLng, c.latitude, c.longitude),
    }));

    // Apply radius filter (0 = nationwide / all stations)
    if (filters.radiusKm && filters.radiusKm > 0) {
      chargers = chargers.filter((c) => (c.distance_km ?? 0) <= filters.radiusKm);
    }

    // Text search (city, name, address)
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      chargers = chargers.filter(
        (c) =>
          c.charger_name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.postal_code.toLowerCase().includes(q)
      );
    }

    // Connector type filter
    if (filters.connectorType && filters.connectorType !== 'all') {
      chargers = chargers.filter((c) => c.connector_type.toLowerCase().includes(filters.connectorType.toLowerCase()));
    }

    // Min Power filter
    if (filters.minPower && filters.minPower > 0) {
      chargers = chargers.filter((c) => c.power_kw >= filters.minPower);
    }

    // Max Price filter
    if (filters.maxPrice && filters.maxPrice > 0) {
      chargers = chargers.filter((c) => c.price <= filters.maxPrice);
    }

    // Sort by distance (nearest first)
    chargers.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

    return chargers;
  },

  async getChargerById(chargerId: string): Promise<Charger | null> {
    ensureInitialized();
    const chargers = getLocalStorage<Charger[]>(LS_CHARGERS, SEED_CHARGERS);
    const charger = chargers.find((c) => c.id === chargerId);
    return charger || null;
  },

  async registerCharger(data: Omit<Charger, 'id' | 'created_at'>): Promise<Charger> {
    ensureInitialized();
    const chargers = getLocalStorage<Charger[]>(LS_CHARGERS, SEED_CHARGERS);

    const newCharger: Charger = {
      ...data,
      id: `charger-${Date.now()}`,
      created_at: new Date().toISOString(),
      listing_status: 'active', // Active upon registration for instant testability
      average_rating: 5.0,
      review_count: 0,
      available_slots: [
        '08:00 - 09:00',
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00',
        '18:00 - 19:00',
        '19:00 - 20:00',
      ],
      photos: data.photos && data.photos.length > 0
        ? data.photos
        : ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'],
    };

    chargers.unshift(newCharger);
    setLocalStorage(LS_CHARGERS, chargers);

    return newCharger;
  },

  async getProviderChargers(providerId: string): Promise<Charger[]> {
    ensureInitialized();
    const chargers = getLocalStorage<Charger[]>(LS_CHARGERS, SEED_CHARGERS);
    return chargers.filter((c) => c.provider_id === providerId);
  },

  async updateChargerStatus(chargerId: string, status: 'active' | 'inactive'): Promise<void> {
    ensureInitialized();
    const chargers = getLocalStorage<Charger[]>(LS_CHARGERS, SEED_CHARGERS);
    const index = chargers.findIndex((c) => c.id === chargerId);
    if (index !== -1) {
      chargers[index].listing_status = status;
      setLocalStorage(LS_CHARGERS, chargers);
    }
  },

  // ==========================================
  // BOOKINGS & CONCURRENCY-SAFE RESERVATION
  // ==========================================

  async getAvailableTimeSlots(chargerId: string, dateStr: string): Promise<{ slot: string; available: boolean }[]> {
    ensureInitialized();
    const charger = await this.getChargerById(chargerId);
    const standardSlots = charger?.available_slots || [
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
      '18:00 - 19:00',
      '19:00 - 20:00',
    ];

    const bookings = getLocalStorage<Booking[]>(LS_BOOKINGS, SEED_BOOKINGS);
    const activeBookings = bookings.filter(
      (b) =>
        b.charger_id === chargerId &&
        b.booking_date === dateStr &&
        ['Pending', 'Confirmed', 'In Progress'].includes(b.status)
    );

    return standardSlots.map((slot) => {
      const [start] = slot.split(' - ');
      const isTaken = activeBookings.some((b) => b.start_time.startsWith(start));
      return {
        slot,
        available: !isTaken,
      };
    });
  },

  async createBookingAtomic(params: {
    ownerId: string;
    chargerId: string;
    bookingDate: string;
    timeSlot: string; // "14:00 - 15:00"
    vehicleModel: string;
    connectorType: string;
    batteryPercentage: number;
    durationHours: number;
  }): Promise<Booking> {
    ensureInitialized();
    const bookings = getLocalStorage<Booking[]>(LS_BOOKINGS, SEED_BOOKINGS);
    const charger = await this.getChargerById(params.chargerId);

    if (!charger) {
      throw new Error('Charging station not found.');
    }

    if (charger.listing_status !== 'active') {
      throw new Error('This charger is currently inactive and cannot accept bookings.');
    }

    const [startTime, endTime] = params.timeSlot.split(' - ');

    // Concurrency collision check: ensure no active reservation exists for the same slot
    const conflict = bookings.find(
      (b) =>
        b.charger_id === params.chargerId &&
        b.booking_date === params.bookingDate &&
        ['Pending', 'Confirmed', 'In Progress'].includes(b.status) &&
        b.start_time === startTime
    );

    if (conflict) {
      throw new Error(`Time slot collision: Slot ${params.timeSlot} on ${params.bookingDate} has already been reserved by another driver. Please choose another time slot.`);
    }

    const users = getLocalStorage<UserProfile[]>(LS_USERS, SEED_USERS);
    const owner = users.find((u) => u.id === params.ownerId);

    // Calculate estimated pricing
    let estimatedCost = 0;
    if (charger.pricing_model === 'per_kwh') {
      // Estimated 15kWh delivered per hour on AC or 40kWh on DC Fast
      const estimatedKwh = charger.power_kw >= 50 ? 40 * params.durationHours : Math.min(charger.power_kw, 11) * params.durationHours;
      estimatedCost = Math.round(estimatedKwh * charger.price * 100) / 100;
    } else {
      estimatedCost = Math.round(charger.price * params.durationHours * 100) / 100;
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      booking_reference: `CN-${randomDigits}`,
      owner_id: params.ownerId,
      charger_id: params.chargerId,
      provider_id: charger.provider_id,
      booking_date: params.bookingDate,
      start_time: startTime,
      end_time: endTime,
      vehicle_model: params.vehicleModel,
      connector_type: params.connectorType,
      estimated_cost: estimatedCost,
      battery_percentage: params.batteryPercentage,
      duration_hours: params.durationHours,
      status: 'Confirmed', // Automatically confirmed in initial community standard, or pending host confirmation
      created_at: new Date().toISOString(),
      charger_name: charger.charger_name,
      charger_address: `${charger.address}, ${charger.city}, ${charger.state}`,
      charger_latitude: charger.latitude,
      charger_longitude: charger.longitude,
      provider_name: charger.provider_name || 'Community Host',
      owner_name: owner?.full_name || 'EV Driver',
      owner_phone: owner?.phone || '+91 98765 43210',
    };

    bookings.unshift(newBooking);
    setLocalStorage(LS_BOOKINGS, bookings);

    // Notify Driver
    this.createNotification(
      params.ownerId,
      `Slot Confirmed: ${newBooking.booking_reference}`,
      `Your reservation at ${charger.charger_name} for ${params.bookingDate} (${params.timeSlot}) is secured. Google Maps navigation is now available!`,
      newBooking.id
    );

    // Notify Host
    this.createNotification(
      charger.provider_id,
      `New Driver Reservation: ${newBooking.booking_reference}`,
      `${owner?.full_name || 'A driver'} booked a slot for ${params.vehicleModel} on ${params.bookingDate} at ${startTime}.`,
      newBooking.id
    );

    return newBooking;
  },

  async getOwnerBookings(ownerId: string): Promise<Booking[]> {
    ensureInitialized();
    const bookings = getLocalStorage<Booking[]>(LS_BOOKINGS, SEED_BOOKINGS);
    return bookings.filter((b) => b.owner_id === ownerId);
  },

  async getProviderBookings(providerId: string): Promise<Booking[]> {
    ensureInitialized();
    const bookings = getLocalStorage<Booking[]>(LS_BOOKINGS, SEED_BOOKINGS);
    return bookings.filter((b) => b.provider_id === providerId);
  },

  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    reason?: string
  ): Promise<Booking> {
    ensureInitialized();
    const bookings = getLocalStorage<Booking[]>(LS_BOOKINGS, SEED_BOOKINGS);
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error('Booking not found');

    const updated = {
      ...bookings[index],
      status: newStatus,
      rejection_reason: reason,
    };
    bookings[index] = updated;
    setLocalStorage(LS_BOOKINGS, bookings);

    // Send notification to EV driver
    this.createNotification(
      updated.owner_id,
      `Booking ${updated.booking_reference} Status Update`,
      `Your charging booking status is now: ${newStatus}${reason ? ` (Reason: ${reason})` : ''}.`,
      updated.id
    );

    return updated;
  },

  // ==========================================
  // NOTIFICATIONS & REVIEWS
  // ==========================================

  createNotification(userId: string, title: string, message: string, bookingId?: string): void {
    const notifs = getLocalStorage<NotificationItem[]>(LS_NOTIFICATIONS, SEED_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      booking_id: bookingId,
      title,
      message,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    setLocalStorage(LS_NOTIFICATIONS, notifs);
  },

  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    ensureInitialized();
    const notifs = getLocalStorage<NotificationItem[]>(LS_NOTIFICATIONS, SEED_NOTIFICATIONS);
    return notifs.filter((n) => n.user_id === userId);
  },

  async markNotificationRead(notifId: string): Promise<void> {
    ensureInitialized();
    const notifs = getLocalStorage<NotificationItem[]>(LS_NOTIFICATIONS, SEED_NOTIFICATIONS);
    const index = notifs.findIndex((n) => n.id === notifId);
    if (index !== -1) {
      notifs[index].read_at = new Date().toISOString();
      setLocalStorage(LS_NOTIFICATIONS, notifs);
    }
  },

  async getChargerReviews(chargerId: string): Promise<Review[]> {
    ensureInitialized();
    const reviews = getLocalStorage<Review[]>(LS_REVIEWS, SEED_REVIEWS);
    return reviews.filter((r) => r.charger_id === chargerId);
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    ensureInitialized();
    const reviews = getLocalStorage<Review[]>(LS_REVIEWS, SEED_REVIEWS);
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    setLocalStorage(LS_REVIEWS, reviews);
    return newReview;
  },
};
