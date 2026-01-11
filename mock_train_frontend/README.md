# 🚂 Mock Train Seat Reservation
## Student Training Package by ServerPE.in

A complete train seat reservation system for learning full-stack development.

---

## 🚀 Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8888
```

---

## 📦 What's Included

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React + Tailwind UI |
| Backend | 8888 | Express.js API |
| PostgreSQL | 5432 | Database with mock data |

---

## 🎯 Features

- ✅ Search trains between stations
- ✅ View train schedules & live status
- ✅ Book tickets with OTP verification
- ✅ Check PNR status
- ✅ Pre-loaded mock data (45 stations, 50 trains)

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/train/stations` | GET | List all stations |
| `/train/search` | GET | Search trains |
| `/train/schedule/:input` | GET | Train schedule |
| `/train/live-status/:input` | GET | Live tracking |
| `/train/pnr-status/:pnr` | GET | PNR status |
| `/train/calculate-fare` | POST | Calculate fare |
| `/train/book-ticket` | POST | Book ticket |
| `/train/send-otp` | POST | Send OTP |
| `/train/verify-otp` | POST | Verify OTP |

---

## 🔧 Development Setup

### Backend
```bash
cd serverpe-back-end
npm install
npm start
```

### Frontend
```bash
cd mock_train_frontend
npm install
npm start
```

---

## 📝 Test Credentials

- **OTP**: `1234` (for testing)
- **Database**: `student` / `student123`

---

## 🎓 Created by ServerPE.in
For student training and portfolio projects.
