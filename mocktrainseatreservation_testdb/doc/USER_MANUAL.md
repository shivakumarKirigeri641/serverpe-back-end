# User Manual

## Mock Train Seat Reservation System

A step-by-step guide to using the application.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Search Trains](#search-trains)
3. [Check PNR Status](#check-pnr-status)
4. [View Train Schedule](#view-train-schedule)
5. [Live Train Status](#live-train-status)
6. [Login / Authentication](#login--authentication)
7. [Book a Ticket](#book-a-ticket)
8. [View Booking History](#view-booking-history)
9. [Cancel a Ticket](#cancel-a-ticket)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (or local setup)

### Accessing the Application
1. Open your browser
2. Navigate to: `http://localhost:3000`
3. Check the connection status (green = connected)

---

## Search Trains

### Steps:
1. On the home page, find the "Search Trains" section
2. Enter **From** station (type station name or code)
3. Enter **To** station
4. Select **Date of Journey**
5. Click **Search Trains**

### Tips:
- Station codes work faster (e.g., NDLS for New Delhi)
- Suggestions appear as you type
- Only future dates allowed

### Understanding Results:
- Each train shows departure/arrival times
- Distance in kilometers
- Available classes with seat count
- Fare for each class (approximate)

---

## Check PNR Status

### Steps:
1. Go to **PNR Status** page
2. Enter your 10-digit PNR number
3. Click **Check Status**

### Information Displayed:
- Booking status (BOOKED/CANCELLED)
- Train details
- Journey date
- Passenger list with seat status
- Total fare

---

## View Train Schedule

### Steps:
1. Click **Schedule** in navigation
2. Enter train number (e.g., 12951) or name (e.g., Rajdhani)
3. Click **Get Schedule**

### Information Displayed:
- Train running days
- Complete route with all stops
- Arrival/Departure times
- Distance from origin
- Coach composition

---

## Live Train Status

### Steps:
1. Click **Live Status** in navigation
2. Enter train number or name
3. Click **Track Train**

### Understanding the Display:
- Green dots = Departed stations
- Blue pulsing dot = Current location
- Gray dots = Upcoming stations
- Delay shown in minutes (if any)

> **Note:** This is simulated data for demo purposes

---

## Login / Authentication

### Why Login?
Login is required for:
- Booking tickets
- Viewing booking history
- Cancelling tickets

### Login Steps:
1. Click **Login** button (top right)
2. Enter your email address
3. Click **Send OTP**
4. Enter OTP: **1234** (demo)
5. Click **Verify & Login**

### Session Duration:
- Login valid for 7 days
- Auto-logout after expiry
- Manual logout available

---

## Book a Ticket

### Step 1: Journey Details
1. Click **Book Ticket** (requires login)
2. Enter From and To stations
3. Select travel date
4. Click **Search Trains**
5. Select your preferred train
6. Choose coach type (SL, 3A, 2A, etc.)
7. Choose quota (General, Tatkal)
8. Click **Continue to Passengers**

### Step 2: Passenger Details
1. Enter passenger name (min 2 characters)
2. Enter age
3. Select gender (M/F/O)
4. Click **+ Add Passenger** for more (max 6)
5. Enter mobile number
6. Click **Calculate Fare & Review**

### Step 3: Review & Confirm
1. Verify journey details
2. Check passenger list
3. Review total fare (including GST)
4. Click **Confirm Booking**

### After Booking:
- PNR number displayed
- Redirected to PNR status page
- Save/note your PNR number!

---

## View Booking History

### Steps:
1. Login to your account
2. Click **My Bookings** in navigation
3. View all your past bookings

### Actions Available:
- View details (PNR page)
- Cancel tickets

---

## Cancel a Ticket

### Steps:
1. Go to **Cancel Ticket** page (or from booking history)
2. Enter PNR number
3. Click **Fetch**
4. Select passengers to cancel (checkbox)
5. Click **Cancel X Passenger(s)**

### Cancellation Rules:
- Partial cancellation allowed
- 25% cancellation charges
- Refund processed in 7 working days

---

## Troubleshooting

### "Disconnected" Status
**Problem:** Red "Disconnected" indicator

**Solution:**
1. Check if backend server is running
2. Restart backend: `npm start` in backend folder
3. Click on the indicator to retry

### "PNR Not Found"
**Problem:** PNR status shows not found

**Solution:**
1. Verify PNR number (10 digits)
2. Check if booking was successful
3. PNR may not exist in demo data

### Login Not Working
**Problem:** Cannot verify OTP

**Solution:**
1. Use OTP: **1234** (hardcoded for demo)
2. Ensure email format is correct
3. Try with a different email

### Train Search Shows No Results
**Problem:** No trains found

**Solution:**
1. Check station codes are correct
2. Try different source/destination
3. Some routes may not have trains

### Booking Fails
**Problem:** Error during ticket booking

**Solution:**
1. Ensure all fields are filled
2. Mobile must be 10 digits starting with 6-9
3. Passenger name min 2 characters
4. Age must be 0-120

---

## Quick Reference

### Station Codes (Popular)
| Code | Station |
|------|---------|
| NDLS | New Delhi |
| BCT | Mumbai Central |
| HWH | Howrah (Kolkata) |
| MAS | Chennai Central |
| SBC | Bangalore City |

### Coach Types
| Code | Description |
|------|-------------|
| 1A | First Class AC |
| 2A | Second Class AC |
| 3A | Third Class AC |
| SL | Sleeper |
| CC | Chair Car |

### Demo Login
- Email: Any valid email
- OTP: **1234**

---

## Support

For technical issues or questions:
- Email: support@serverpe.in
- Documentation: Check `/doc` folder
