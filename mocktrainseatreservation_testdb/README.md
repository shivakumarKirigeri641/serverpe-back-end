# Mock Train Seat Reservation System

A complete full-stack train ticket reservation system for educational purposes.

---

## 📋 Project Overview

This project simulates the IRCTC train booking process, allowing users to:
- Search trains between stations
- Check PNR status
- View train schedules and live status
- Book and cancel tickets

---

## 🏗️ Project Structure

```
mocktrainseatreservation_testdb/
├── backend/          # Node.js + Express API
│   ├── server.js     # Entry point
│   ├── routes/       # API routes
│   ├── database/     # SQLite DB + schema
│   ├── middleware/   # JWT auth
│   └── utils/        # Helpers
├── frontend/         # React + Tailwind
│   ├── src/
│   │   ├── pages/    # 10 page components
│   │   ├── components/
│   │   ├── context/  # Auth context
│   │   └── api/      # API client
│   └── public/
└── doc/              # Documentation
    ├── API_DOCUMENTATION.md
    ├── VIVA_REFERRAL.md
    └── USER_MANUAL.md
```

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm run init-db   # Creates SQLite database
npm start         # Runs on http://localhost:7777
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm start         # Runs on http://localhost:3000
```

### 3. Open Browser
Navigate to `http://localhost:3000`

---

## 🔐 Demo Login

- **Email:** Any valid email format
- **OTP:** `1234` (hardcoded for demo)

---

## 📊 Features

| Feature | Description | Auth Required |
|---------|-------------|---------------|
| Train Search | Find trains between stations | ❌ |
| PNR Status | Check booking status | ❌ |
| Train Schedule | View complete route | ❌ |
| Live Status | Track train location | ❌ |
| Station Info | Trains at a station | ❌ |
| Book Ticket | Reserve seats | ✅ |
| Cancel Ticket | Full/partial cancel | ✅ |
| Booking History | Past bookings | ✅ |

---

## 💾 Database

- **Type:** SQLite (file-based, no setup needed)
- **Trains:** 60+ popular trains
- **Stations:** 100+ major stations
- **Coach Types:** 8 (1A, 2A, 3A, SL, CC, 2S, EC, FC)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Frontend | React 18, React Router |
| Styling | Tailwind CSS |
| Auth | JWT + HTTP-only Cookies |

---

## 📚 Documentation

- **[API Documentation](doc/API_DOCUMENTATION.md)** - All endpoints
- **[Viva Guide](doc/VIVA_REFERRAL.md)** - Q&A for exams
- **[User Manual](doc/USER_MANUAL.md)** - How to use

---

## 🎓 For Students

1. Read the documentation first
2. Start with backend `server.js`
3. Understand database schema in `schema.sql`
4. Check routes in `trainRoutes.js`
5. Frontend starts with `App.js`

---

## 📞 Support

For issues: contact@serverpe.in

---

© 2024 ServerPE - Student Learning Project
