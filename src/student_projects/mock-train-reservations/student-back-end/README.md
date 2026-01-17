# Quicksmart Mock Train Reservation System - Student Backend

## 📋 Overview

A comprehensive mock train reservation system backend built for educational purposes. This system replicates the functionality of Indian Railways IRCTC booking system with API key authentication, OTP-based user authentication, and complete booking workflows.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Project Structure
```
student-back-end/
├── src/
│   ├── app.js                 # Main application entry point
│   ├── config/                # Configuration files
│   │   ├── index.js          # App config
│   │   └── apiKeys.js        # API key management
│   ├── middleware/            # Express middleware
│   │   ├── checkApiKey.js    # API key validation
│   │   ├── checkAuth.js      # JWT authentication
│   │   ├── errorHandler.js   # Error handling
│   │   └── requestLogger.js  # Request logging
│   ├── repositories/          # Data access layer
│   │   └── trainRepository.js # External API calls
│   ├── services/              # Business logic layer
│   │   ├── trainService.js   # Train operations
│   │   └── authService.js    # Authentication
│   ├── routers/               # API routes
│   │   ├── studentTrainRouter.js # Train endpoints
│   │   ├── authRouter.js     # Auth endpoints
│   │   └── healthRouter.js   # Health checks
│   └── utils/                 # Utility functions
│       ├── logger.js         # Winston logger
│       ├── responseHelper.js # Response formatting
│       ├── validators.js     # Input validation
│       ├── errors.js         # Custom errors
│       └── otpHelper.js      # OTP management
├── tests/
│   ├── unit/                  # Unit tests
│   └── e2e/                   # Integration tests
├── docs/                      # Documentation
├── logs/                      # Log files
├── .env                       # Environment variables
├── package.json              # Dependencies
└── jest.config.js            # Test configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- serverpe-back-end running on port 3000 (or configure accordingly)

### Installation

```bash
# Navigate to project directory
cd student-back-end

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# nano .env

# Start the server
npm start

# For development with auto-reload
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run only unit tests
npm run test:unit

# Run only e2e tests
npm run test:e2e

# Watch mode for development
npm run test:watch
```

## 🔑 API Key Authentication

All API endpoints require a valid API key. Include it in requests via:

1. **Header**: `X-API-Key: YOUR_API_KEY`
2. **Query**: `?api_key=YOUR_API_KEY`
3. **Body**: `{ "apiKey": "YOUR_API_KEY" }`

### Demo API Keys

```
Full Access:     QS_DEMO_API_KEY_2026_STUDENT_TRAIN
Test Access:     QS_TEST_API_KEY_2026
Read-Only:       QS_READONLY_API_KEY_2026
```

## 📡 API Endpoints

### Health Check
```
GET  /health              # Basic health check
GET  /health/detailed     # Detailed health info
GET  /                    # API information
```

### Authentication
```
POST /student/auth/send-otp       # Send OTP to email
POST /student/auth/verify-otp     # Verify OTP and login
GET  /student/auth/check-auth     # Check auth status
GET  /student/auth/me             # Get user info
POST /student/auth/logout         # Logout
```

### Master Data (Public with API Key)
```
GET  /student/train/stations           # Get all stations
GET  /student/train/reservation-types  # Get reservation types
GET  /student/train/coach-types        # Get coach types
```

### Train Search
```
GET  /student/train/search                  # Search trains
GET  /student/train/schedule/:train_input   # Train schedule
GET  /student/train/live-status/:train_input # Live status
GET  /student/train/station/:station_code   # Trains at station
```

### Fare & Booking
```
POST /student/train/calculate-fare    # Calculate fare
POST /student/train/book-ticket       # Book ticket (Auth required)
POST /student/train/cancel-ticket     # Cancel ticket (Auth required)
```

### PNR & History
```
GET  /student/train/pnr-status/:pnr              # Check PNR
GET  /student/train/booking-history/:email       # Booking history (Auth)
```

## 🔐 Authentication Flow

1. **Send OTP**: User requests OTP via email
   ```bash
   POST /student/auth/send-otp
   Headers: X-API-Key: YOUR_API_KEY
   Body: { "email": "user@example.com" }
   ```

2. **Verify OTP**: User submits OTP to login
   ```bash
   POST /student/auth/verify-otp
   Headers: X-API-Key: YOUR_API_KEY
   Body: { "email": "user@example.com", "otp": "1234" }
   ```

3. **Use JWT Token**: Cookie is set automatically
   - Cookie name: `qs_train_token`
   - Expires in: 7 days
   - HttpOnly, Secure (production)

4. **Access Protected Routes**: Use the cookie for authenticated requests

## 🎫 Booking Flow Example

```bash
# 1. Authenticate
curl -X POST http://localhost:4000/student/auth/send-otp \
  -H "X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

curl -X POST http://localhost:4000/student/auth/verify-otp \
  -H "X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"1234"}' \
  -c cookies.txt

# 2. Search trains
curl -X GET "http://localhost:4000/student/train/search?source=NDLS&destination=MAS&doj=2026-02-15" \
  -H "X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN"

# 3. Calculate fare
curl -X POST http://localhost:4000/student/train/calculate-fare \
  -H "X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN" \
  -H "Content-Type: application/json" \
  -d '{
    "train_number": "12951",
    "source_code": "NDLS",
    "destination_code": "MAS",
    "doj": "2026-02-15",
    "coach_code": "SL",
    "reservation_type": "GEN",
    "passengers": [
      {"passenger_name":"John Doe","passenger_age":30,"passenger_gender":"M"}
    ]
  }'

# 4. Book ticket
curl -X POST http://localhost:4000/student/train/book-ticket \
  -H "X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "train_number": "12951",
    "source_code": "NDLS",
    "destination_code": "MAS",
    "doj": "2026-02-15",
    "coach_code": "SL",
    "reservation_type": "GEN",
    "passengers": [
      {"passenger_name":"John Doe","passenger_age":30,"passenger_gender":"M"}
    ],
    "mobile_number": "9876543210",
    "email": "test@example.com",
    "total_fare": 1180
  }'

# 5. Check PNR status
curl -X GET http://localhost:4000/student/train/pnr-status/ABC123 \
  -H "X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN"
```

## 🛡️ Security Features

- **API Key Authentication**: All endpoints protected
- **JWT Tokens**: Secure session management
- **Rate Limiting**: 100 requests per 15 minutes
- **Helmet**: Security headers
- **CORS**: Configured origin control
- **Input Validation**: Comprehensive validation
- **Error Sanitization**: No sensitive data leakage

## 📊 Logging

Logs are written to:
- Console: Color-coded, development-friendly
- File: `logs/app.log` (all levels)
- File: `logs/error.log` (errors only)

Log levels: `error`, `warn`, `info`, `http`, `debug`

## 🧪 Testing Strategy

### Unit Tests
- Validators
- Response helpers
- Error classes
- API key validation
- OTP helper

### Integration Tests (E2E)
- Health endpoints
- Authentication flow
- Train search
- Fare calculation
- Booking operations
- PNR status
- Booking history

### Coverage Goals
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 🔧 Configuration

Key environment variables:

```env
PORT=4000
NODE_ENV=development
SERVERPE_BASE_URL=http://localhost:3000
DEMO_API_KEY=QS_DEMO_API_KEY_2026_STUDENT_TRAIN
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
```

## 📈 Performance Considerations

- Connection pooling to external API
- Request/response logging middleware
- Efficient error handling
- Proper HTTP status codes
- Structured JSON responses

## 🐛 Error Handling

All errors return standardized JSON:

```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "mock_data": true,
  "status": "Failed",
  "successstatus": false,
  "message": "Error description",
  "timestamp": "2026-01-15T10:00:00.000Z"
}
```

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Diagram](./ARCHITECTURE.md)
- [Viva Questions](./VIVA_QUESTIONS.md)
- [Flow Diagrams](./FLOW_DIAGRAMS.md)

## 👥 Development Team

Developed for educational purposes by ServerPE Student Team

## 📝 License

ISC

## 🤝 Contributing

This is an educational project. For improvements:
1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📞 Support

For questions or issues, please refer to the documentation or create an issue in the repository.

---

**Note**: This is a mock/demo system for educational purposes. Not for production use.
