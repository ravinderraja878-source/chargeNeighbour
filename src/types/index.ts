export type UserRole = 'owner' | 'provider';

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rejected';

export type ListingStatus = 'active' | 'inactive' | 'pending_review';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  property_details?: {
    property_type?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
}

export interface ProviderInfo {
  id: string;
  user_id: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  verification_status: 'Verified' | 'Verification Pending';
  created_at?: string;
}

export interface Charger {
  id: string;
  provider_id: string;
  charger_name: string;
  charger_type: 'Level 2 AC' | 'DC Fast Charger';
  connector_type: 'Type 2 (Mennekes)' | 'CCS2' | 'CHAdeMO' | 'Tesla / NACS' | 'GB/T';
  power_kw: number;
  pricing_model: 'per_kwh' | 'per_hour';
  price: number;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
  listing_status: ListingStatus;
  safety_checked: boolean;
  instructions?: string;
  created_at?: string;
  
  // Joined / Calculated fields
  provider_name?: string;
  provider_phone?: string;
  distance_km?: number;
  average_rating?: number;
  review_count?: number;
  photos?: string[];
  available_slots?: string[];
}

export interface Booking {
  id: string;
  booking_reference: string;
  owner_id: string;
  charger_id: string;
  provider_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  vehicle_model: string;
  connector_type: string;
  estimated_cost: number;
  battery_percentage?: number;
  duration_hours: number;
  status: BookingStatus;
  rejection_reason?: string;
  created_at: string;
  
  // Joined details
  charger_name?: string;
  charger_address?: string;
  charger_latitude?: number;
  charger_longitude?: number;
  provider_name?: string;
  owner_name?: string;
  owner_phone?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  booking_id?: string;
  title: string;
  message: string;
  read_at?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  owner_id: string;
  charger_id: string;
  rating: number;
  comment: string;
  owner_name?: string;
  created_at: string;
}

export interface SearchFilterState {
  query: string;
  connectorType: string;
  minPower: number;
  maxPrice: number;
  radiusKm: number;
  availableOnly: boolean;
  userLat: number | null;
  userLng: number | null;
  locationName?: string;
}
