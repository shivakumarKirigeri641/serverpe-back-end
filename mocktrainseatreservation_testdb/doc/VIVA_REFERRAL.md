# Viva Referral Guide

## Mock Train Seat Reservation System

A comprehensive Q&A guide for viva preparation.

---

## Project Overview

### Q1: What is this project about?
**Answer:** This is a Mock Train Seat Reservation System that simulates the IRCTC ticket booking process. It allows users to search trains, check PNR status, view schedules, book tickets, and cancel bookings.

### Q2: What technologies are used?
**Answer:**
- **Backend:** Node.js, Express.js, SQLite
- **Frontend:** React.js, Tailwind CSS
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** SQLite (file-based, no setup required)

### Q3: Why SQLite instead of PostgreSQL/MySQL?
**Answer:** SQLite is chosen for simplicity - it's a file-based database that requires no separate installation. This makes the project portable and easy to set up for students.

---

## Backend Questions

### Q4: Explain the folder structure of backend?
**Answer:**
```
backend/
├── server.js          - Entry point, Express setup
├── routes/            - API route handlers
├── middleware/        - JWT authentication
├── database/          - DB connection & schema
└── utils/             - Helper functions
```

### Q5: What is middleware? Give an example.
**Answer:** Middleware is a function that executes between receiving a request and sending a response. Example: `authMiddleware.js` - it verifies JWT token before allowing access to protected routes like booking.

### Q6: Explain JWT authentication flow.
**Answer:**
1. User sends email to `/send-otp`
2. OTP is stored in database (1234 for demo)
3. User verifies OTP at `/verify-otp`
4. Server generates JWT token and sends as HTTP-only cookie
5. For protected routes, token is validated by authMiddleware

### Q7: What are the main API endpoints?
**Answer:**
- `/train/search` - Search trains
- `/train/schedule/:train` - Get schedule
- `/train/pnr-status/:pnr` - Check PNR
- `/train/book-ticket` - Book ticket (protected)
- `/train/cancel-ticket` - Cancel ticket (protected)

### Q8: How is seat allocation done?
**Answer:** The system tracks seats in `seatsondate` table. When booking:
1. Check available seats for train/coach/date
2. Allocate next available seat sequence
3. Calculate berth type based on coach configuration
4. Update booked count in database

---

## Frontend Questions

### Q9: Explain React component structure.
**Answer:**
- **Pages:** LandingPage, SearchTrainsPage, BookTicketPage, etc.
- **Components:** Navbar, Footer, ConnectionStatus (reusable)
- **Context:** AuthContext for global authentication state
- **API:** apiClient.js for all backend calls

### Q10: What is Context API and why is it used?
**Answer:** Context API provides a way to share data between components without prop drilling. We use `AuthContext` to share authentication state (user, isAuthenticated, login, logout functions) across all components.

### Q11: Explain React Router usage.
**Answer:** React Router handles client-side navigation:
- Public routes: `/`, `/search`, `/pnr-status`
- Protected routes: `/dashboard/book-ticket` (wrapped in ProtectedRoute)
- ProtectedRoute checks authentication before rendering

### Q12: What is Tailwind CSS?
**Answer:** Tailwind is a utility-first CSS framework. Instead of writing custom CSS, we use pre-built classes like `bg-blue-500`, `p-4`, `rounded-lg` directly in HTML/JSX.

### Q13: How does the Connection Status indicator work?
**Answer:** It calls `/api/health` endpoint every 30 seconds. If successful, shows green "Connected", otherwise red "Disconnected". This helps users know if backend is running.

---

## Database Questions

### Q14: What tables are in the database?
**Answer:**
- `trains` - Train details
- `stations` - Railway stations
- `schedules` - Train routes/timings
- `coaches` - Coach configuration per train
- `coachtype` - Coach types (1A, 2A, SL, etc.)
- `bookingdata` - Booking records
- `passengerdata` - Passenger details
- `email_otps` - OTP storage

### Q15: What is a foreign key? Give example.
**Answer:** Foreign key links two tables. Example: `passengerdata.fkbookingdata` references `bookingdata.id` - this ensures every passenger belongs to a valid booking.

### Q16: How is PNR generated?
**Answer:** PNR is auto-generated using a database trigger. When a booking is inserted, the trigger creates a 10-digit PNR: `printf('%010d', booking_id + 1000000000)`.

---

## Security Questions

### Q17: How is the application secured?
**Answer:**
1. JWT tokens for authentication
2. HTTP-only cookies (can't be accessed by JavaScript)
3. Input validation on all endpoints
4. Password-less auth (OTP-based)

### Q18: What is CORS and why is it needed?
**Answer:** CORS (Cross-Origin Resource Sharing) allows frontend (port 3000) to make requests to backend (port 7777). Without CORS configuration, browsers block cross-origin requests.

---

## Practical Questions

### Q19: How to start the project?
**Answer:**
```bash
# Backend
cd backend
npm install
npm run init-db
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### Q20: How to test login?
**Answer:**
1. Enter any email
2. Use OTP: `1234`
3. You'll be logged in and can book tickets

---

## Conceptual Questions

### Q21: What is REST API?
**Answer:** REST (Representational State Transfer) is an architectural style for APIs. It uses HTTP methods (GET, POST, PUT, DELETE) and URLs to define operations on resources.

### Q22: Explain async/await.
**Answer:** Async/await is syntax for handling asynchronous operations in JavaScript. `async` marks a function as asynchronous, `await` pauses execution until a Promise resolves.

### Q23: What is the difference between GET and POST?
**Answer:**
- GET: Retrieve data (search trains)
- POST: Create/modify data (book ticket)
- GET params visible in URL, POST data in body

---

## Bonus Questions

### Q24: How would you improve this project?
**Answer:**
- Add payment gateway integration
- Email/SMS notifications
- Seat selection UI
- Train tracking with GPS
- Multi-language support

### Q25: What would you change for production?
**Answer:**
- Use PostgreSQL instead of SQLite
- Add rate limiting
- Implement proper email service for OTPs
- Add logging and monitoring
- Use environment variables for all configs
