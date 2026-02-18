# QuickFix Services — Full-Stack Service Booking Platform

## Overview
A clean, minimal service booking website where customers can book home services, providers can manage their offerings, and admins can oversee the platform. Built with React + Supabase (Lovable Cloud) for a modern, scalable full-stack experience.

---

## 1. Authentication & Role System
- Email/password registration and login
- Role selection during signup: **Customer** or **Service Provider**
- User roles stored in a dedicated `user_roles` table (secure, not on profile)
- Admin role assigned manually via the database
- Logout functionality on all pages
- Protected routes based on role

## 2. Database Schema
- **profiles** — name, phone, avatar, linked to auth.users
- **user_roles** — user_id, role (customer / service_provider / admin)
- **service_categories** — id, name, icon, description (pre-seeded with: Plumber, Electrician, Carpenter, Painter, Cleaner, AC Repair, Pest Control, Appliance Repair, Gardening, Moving)
- **provider_profiles** — user_id, bio, experience_years, location, phone, availability status
- **provider_services** — links providers to categories they offer
- **bookings** — customer_id, provider_id, service_category_id, date, time_slot, status (pending/accepted/rejected/completed/cancelled)
- **reviews** — booking_id, customer_id, provider_id, rating (1-5), comment
- RLS policies on all tables for secure access

## 3. Customer Features

### Home Page
- Hero section with search bar and tagline
- Grid of service categories with icons
- "How it works" section (Browse → Book → Done)

### Browse & Book
- Click a category to see available providers in that category
- Provider cards showing name, experience, rating, location
- Provider detail page with full profile, reviews, and a **Book Now** button
- Booking form: select date and time slot
- Confirmation screen after booking

### My Bookings
- List of all bookings with status indicators (pending, accepted, completed, cancelled)
- Cancel button for pending bookings
- Leave a rating & review after a completed service

## 4. Service Provider Features

### Provider Dashboard
- Overview of incoming and past bookings
- Accept or reject pending booking requests
- Status updates on bookings

### Profile Management
- Edit profile: bio, experience, location, phone
- Select which service categories they offer
- Toggle availability (available / unavailable)

### Booking History
- View all past and current bookings with filters

## 5. Admin Panel

### User Management
- View all users, filter by role
- Ability to deactivate accounts

### Category Management
- Add, edit, or remove service categories

### Bookings Overview
- View all bookings across the platform with filters by status, date, category

## 6. Design & UX
- Clean & minimal design with white backgrounds, subtle shadows, and professional typography
- Responsive layout — works on mobile, tablet, and desktop
- Consistent navigation: top navbar with role-appropriate links
- Toast notifications for actions (booking confirmed, review submitted, etc.)
- Loading skeletons for data-heavy pages

## 7. Pages Summary
| Page | Access |
|------|--------|
| Landing / Home | Public |
| Login / Register | Public |
| Service Category Listing | Public |
| Provider Listing (by category) | Public |
| Provider Detail | Public |
| Book a Service | Customer |
| My Bookings | Customer |
| Leave Review | Customer |
| Provider Dashboard | Provider |
| Provider Profile Edit | Provider |
| Admin Dashboard | Admin |
| Admin: Manage Users | Admin |
| Admin: Manage Categories | Admin |
| Admin: All Bookings | Admin |