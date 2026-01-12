# Mock Train Seat Reservation - Frontend

A professional React application for train ticket reservation with Tailwind CSS styling.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- **Backend server running on port 7777**

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   Opens at: `http://localhost:3000`

3. **Make sure backend is running!**
   ```bash
   # In another terminal, go to backend folder
   cd ../backend
   npm install
   npm run init-db
   npm start
   ```

---

## 📱 Features

### Public Features (No Login Required)
- 🔍 **Train Search** - Find trains between stations
- 📋 **PNR Status** - Check booking status
- 📅 **Train Schedule** - View complete schedules
- 🚂 **Live Train Status** - Track running status
- 🏢 **Station Info** - Trains at any station

### Protected Features (Login Required)
- 🎫 **Book Ticket** - Complete booking flow
- 📜 **Booking History** - View past bookings
- ❌ **Cancel Ticket** - Full/partial cancellation

---

## 🔐 Authentication

1. Click "Login" in navbar
2. Enter any email address
3. **Use OTP: `1234`** (hardcoded for demo)
4. You're logged in!

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── index.js           # Entry point
│   ├── index.css          # Tailwind + custom styles
│   ├── App.js             # Routes
│   ├── api/
│   │   └── apiClient.js   # API functions
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ConnectionStatus.jsx
│   │   └── LoadingSpinner.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   └── pages/
│       ├── LandingPage.jsx
│       ├── LoginPage.jsx
│       ├── SearchTrainsPage.jsx
│       ├── PnrStatusPage.jsx
│       ├── TrainSchedulePage.jsx
│       ├── LiveTrainStatusPage.jsx
│       ├── StationStatusPage.jsx
│       ├── BookTicketPage.jsx
│       ├── BookingHistoryPage.jsx
│       └── CancelTicketPage.jsx
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🎨 Design Features

- **Dark Theme** - Modern dark UI
- **Glass Morphism** - Blur effects
- **Animations** - Smooth transitions
- **Responsive** - Mobile-friendly
- **Connection Status** - Backend indicator

---

## ⚙️ Configuration

Backend URL is set in `src/api/apiClient.js`:
```javascript
const API_BASE_URL = 'http://localhost:7777/api';
```

To change, update this URL or set environment variable:
```bash
REACT_APP_API_URL=http://localhost:7777/api npm start
```

---

## 🎓 For Students

This is a complete working frontend. To understand:

1. Start with `App.js` - see routing structure
2. Read `apiClient.js` - how API calls work
3. Check `AuthContext.jsx` - authentication flow
4. Review any page component - React patterns

**Key Concepts:**
- React Router for navigation
- Context API for state management
- Axios for API calls
- Tailwind CSS for styling

---

## 📞 Support

For any issues, contact: serverpe.in
