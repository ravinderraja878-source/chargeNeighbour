# ChargeNeighbor ⚡ — Community EV Charging Slot Booking Platform

ChargeNeighbor is a community-driven EV charging slot booking platform connecting electric vehicle drivers with nearby homeowners and private property hosts who have charging facilities.

When an electric vehicle runs low on battery during a journey, drivers can discover nearby registered community hosts, verify real-time slot availability, reserve a guaranteed charging window, and navigate seamlessly using Google Maps.

---

## ⚡ Key Highlights & Features

1. **Dual Independent Authentication Flows**:
   - **EV Driver Portal** (`/owner/login`, `/owner/register`): Search nearby stations, battery assistant, reserve slots, view bookings, and submit host reviews.
   - **Charging Host Portal** (`/provider/login`, `/provider/register`): Register charging hardware, pin location coordinates, manage operating hours, review incoming booking requests, and track estimated earnings.

2. **Roadside Battery Assistant & Critical Alerts**:
   - Dynamic battery percentage input on the Driver Dashboard.
   - **Low Battery Warning (≤10%)**: *"Low Battery Alert! Find the nearest available charging provider."*
   - **Critical Battery Warning (4%)**: *"Critical Battery: 4%. Search for a nearby charging point now."* with 1-click priority filter for stations within 5 km.
   - Transparent advisory disclaimer (user-entered estimation without uncertified telemetry claims).

3. **7-Step Concurrency-Safe Booking System**:
   - Step 1: Station Selection & Specifications Review.
   - Step 2: Date Selection (Today, Tomorrow, or Custom Calendar).
   - Step 3: Available Time Slot Selection (locked slots dynamically disabled).
   - Step 4: Vehicle Model, Connector Type, and Battery Level.
   - Step 5: Cost Calculation & Beta Pricing Disclaimer.
   - Step 6: Atomic Reservation with collision protection (prevents overlapping bookings).
   - Step 7: Confirmation Modal with unique reference (`CN-XXXXXX`), address reveal, and direct Google Maps navigation.

4. **Google Maps Platform & Geolocation Integration**:
   - Browser Geolocation API integration with graceful SF fallback if permission is denied.
   - Interactive radar map with customizable search radius (2 km, 5 km, 10 km, 25 km, 50 km).
   - Direct Google Maps driving directions generated with exact provider coordinates:
     ```
     https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE&travelmode=driving
     ```

5. **Residential Privacy & Security**:
   - Exact residential addresses and host instructions are concealed on public search maps.
   - Full street address is unlocked only after a booking is confirmed.
   - Comprehensive Row Level Security (RLS) policies for PostgreSQL in Supabase.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite.
- **Styling**: Modern Vanilla CSS with CSS Variables, Design Tokens, and Responsive Layouts (no external CSS framework lock-in).
- **Database & Authentication**: Supabase (PostgreSQL with RLS policies, atomic functions, and auth triggers).
- **Mapping & Geolocation**: Leaflet with CartoDB/OpenStreetMap tiles + Google Maps Platform Directions URL integration.
- **Icons**: Lucide Icons (`lucide-react`).
- **Animations & Effects**: Canvas Confetti (`canvas-confetti`).
- **Hosting & Deployment**: Vercel ready with `vercel.json` SPA routing rewrites.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24+ recommended)
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note on Demo Mode**: ChargeNeighbor runs out of the box in **Interactive Demo Mode** if Supabase credentials are not supplied. It includes pre-seeded stations in the SF Bay Area, mock drivers, and host portals with persistent local storage.

---

## ☁️ Connecting Live Supabase

To switch from Demo Mode to a live cloud Supabase database:

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Dashboard, navigate to **SQL Editor**.

### 2. Run the Database Migration
Copy and execute the entire contents of [`supabase/migrations/20261019_init_schema.sql`](./supabase/migrations/20261019_init_schema.sql) in your Supabase SQL Editor.

This script creates:
- `profiles`, `providers`, `chargers`, `charger_images`, `availability_rules`, `bookings`, `notifications`, and `reviews` tables.
- Concurrency-safe atomic booking function: `create_booking_atomic(...)`.
- Row Level Security (RLS) policies ensuring drivers and providers only access authorized records.
- Automated `auth.users` profile synchronization trigger.

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your project keys:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GOOGLE_MAPS_API_KEY=your-optional-google-maps-key
```

Restart the dev server (`npm run dev`). ChargeNeighbor will detect your keys and display **"Live Cloud"** in the top navigation bar.

---

## 🗺️ Google Maps Directions URL Specification

Whenever an EV driver confirms a reservation or visits **My Bookings** (`/owner/bookings`), ChargeNeighbor generates an official Google Maps navigation link using the exact coordinates stored in the database:

```ts
const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${charger.latitude},${charger.longitude}&travelmode=driving`;
```
If driver GPS permission is granted, the origin coordinate is automatically appended:
```ts
const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${charger.latitude},${charger.longitude}&travelmode=driving`;
```

---

## 🚢 Deploying to Vercel

1. Push your code to a Git repository (GitHub / GitLab / Bitbucket).
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Project Settings > Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY` (Optional)
4. Deploy! The included `vercel.json` ensures client-side routes (`/owner/dashboard`, `/provider/register-charger`, `/chargers/:id`) resolve without 404 errors.

---

## 🧪 Testing Checklist

- [x] **EV Owner Auth**: Sign in at `/owner/login` (or test with `owner@demo.com`).
- [x] **Provider Auth**: Sign in at `/provider/login` (or test with `provider@demo.com`).
- [x] **Battery Assistant**: Change battery percentage to 4% to test the critical alert banner and fast-charger filter.
- [x] **Charger Discovery**: Search by locality or adjust radius from 2 km to 50 km.
- [x] **7-Step Booking**: Select date, slot, vehicle details, review costs, and confirm.
- [x] **Double-Booking Prevention**: Attempting to book the same slot raises a concurrency conflict error.
- [x] **Google Maps Navigation**: Clicking "Navigate in Google Maps" opens driving directions with exact destination coordinates.
- [x] **Provider Actions**: Host can accept/reject pending bookings and toggle charger availability.
- [x] **Production Build**: Passes `tsc -b && vite build` with 0 errors.

---

## 📄 License
MIT License. Built for the clean mobility and EV community.
