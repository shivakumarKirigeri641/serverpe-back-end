# Mock Train Seat Reservation - Backend

A complete backend API for train ticket reservation system built with Node.js, Express, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run init-db
   ```
   This creates the SQLite database with 60+ trains and 100+ stations.

3. **Start Server**
   ```bash
   npm start
   ```
   Server runs on: `http://localhost:7777`

4. **Verify**
   Open browser: `http://localhost:7777/api/health`

---

## 📚 API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/train/stations` | Get all stations |
| GET | `/api/train/coach-types` | Get coach types |
| GET | `/api/train/reservation-types` | Get reservation types |
| GET | `/api/train/search?source=&destination=&doj=` | Search trains |
| GET | `/api/train/schedule/:train` | Train schedule |
| GET | `/api/train/live-status/:train` | Live status |
| GET | `/api/train/station/:code` | Trains at station |
| GET | `/api/train/pnr-status/:pnr` | PNR status |
| POST | `/api/train/calculate-fare` | Calculate fare |
| POST | `/api/train/send-otp` | Send OTP |
| POST | `/api/train/verify-otp` | Verify OTP |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/train/book-ticket` | Book ticket |
| POST | `/api/train/cancel-ticket` | Cancel ticket |
| GET | `/api/train/booking-history/:email` | Booking history |
| POST | `/api/train/logout` | Logout |

---

## 🔐 Authentication

1. **Send OTP**: POST `/api/train/send-otp` with `{ email }`
2. **Verify OTP**: POST `/api/train/verify-otp` with `{ email, otp }`
   - **Demo OTP: `1234`** (hardcoded for testing)
3. Token is stored in HTTP-only cookie

---

## 📝 Example Requests

### Search Trains
```bash
GET /api/train/search?source=NDLS&destination=BCT&doj=2024-01-15
```

### Book Ticket
```bash
POST /api/train/book-ticket
Content-Type: application/json

{
  "train_number": "12951",
  "source_code": "NDLS",
  "destination_code": "BCT",
  "doj": "2024-01-15",
  "coach_code": "3A",
  "reservation_type": "GEN",
  "passengers": [
    {
      "passenger_name": "John Doe",
      "passenger_age": 30,
      "passenger_gender": "M"
    }
  ],
  "mobile_number": "9876543210",
  "email": "john@example.com",
  "total_fare": 1500
}
```

---

## 📁 Project Structure

```
backend/
├── server.js              # Entry point
├── package.json           # Dependencies
├── .env.example           # Environment template
├── database/
│   ├── db.js              # SQLite connection
│   ├── initDb.js          # Database initializer
│   └── schema.sql         # Schema + sample data
├── routes/
│   └── trainRoutes.js     # All API routes
├── middleware/
│   └── authMiddleware.js  # JWT authentication
└── utils/
    └── helpers.js         # Utility functions
```

---

## ⚙️ Environment Variables

Create `.env` file (copy from `.env.example`):

```env
PORT=7777
NODE_ENV=development
SECRET_KEY=your-secret-key
DB_PATH=./database/train_reservation.db
```

---

## 🎓 For Students

This is a complete working backend. To understand the code:

1. Start with `server.js` - see how Express is configured
2. Read `routes/trainRoutes.js` - all API logic
3. Check `database/schema.sql` - database structure
4. Review `middleware/authMiddleware.js` - JWT auth

**Key Concepts:**
- RESTful API design
- JWT authentication
- SQLite database
- Error handling
- Input validation

---

## 📞 Support

For any issues, contact: serverpe.in
