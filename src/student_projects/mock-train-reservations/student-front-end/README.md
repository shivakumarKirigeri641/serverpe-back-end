# QuickSmart Train Reservation - Student Frontend

A modern React-based frontend for the QuickSmart Train Reservation system. This application connects to the student-back-end API to provide a complete train booking experience.

## Features

- 🔐 **OTP-based Authentication** - Secure login with email OTP verification
- 🚆 **Train Search** - Search trains between stations by date
- 🎫 **Ticket Booking** - Book tickets with multiple passengers
- 💰 **Fare Calculator** - Calculate fares before booking
- 📋 **My Bookings** - View and manage your reservations
- 🔍 **PNR Status** - Check your ticket status anytime
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide Icons** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **date-fns** - Date utility library

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- student-back-end API running on http://localhost:4000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_API_KEY=QS_DEMO_API_KEY_2026_STUDENT_TRAIN
```

4. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Layout.jsx     # Main app layout with sidebar
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── contexts/          # React contexts
│   └── AuthContext.js # Authentication state management
├── pages/             # Page components
│   ├── LoginPage.jsx  # OTP login flow
│   ├── Dashboard.jsx  # Home dashboard
│   ├── SearchTrains.jsx
│   ├── BookingPage.jsx
│   ├── MyBookings.jsx
│   └── PnrStatus.jsx
├── services/          # API services
│   └── api.js        # Axios API client
├── App.js            # Main app with routing
├── index.js          # Entry point
└── index.css         # Global styles
```

## API Endpoints Used

| Feature | Endpoint | Method |
|---------|----------|--------|
| Send OTP | `/student/auth/send-otp` | POST |
| Verify OTP | `/student/auth/verify-otp` | POST |
| Check Auth | `/student/auth/check-auth` | GET |
| Logout | `/student/auth/logout` | POST |
| Get Stations | `/student/train/stations` | GET |
| Get Coach Types | `/student/train/coach-types` | GET |
| Get Reservation Types | `/student/train/reservation-types` | GET |
| Search Trains | `/student/train/search` | GET |
| Calculate Fare | `/student/train/calculate-fare` | POST |
| Book Ticket | `/student/train/book-ticket` | POST |
| Get PNR Status | `/student/train/pnr-status/:pnr` | GET |
| Cancel Ticket | `/student/train/cancel-ticket` | POST |

## Screenshots

### Login Page
Modern OTP-based authentication with email verification.

### Dashboard
Clean dashboard with quick actions and platform overview.

### Train Search
Search trains between stations with date picker.

### Booking Page
Complete booking flow with passenger details and fare calculation.

## Building for Production

```bash
npm run build
```

The build output will be in the `build/` folder.

## License

This project is part of the QuickSmart Train Reservation Student Project.
