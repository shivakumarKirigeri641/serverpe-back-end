# Quicksmart Mock Train Reservation System - Backend Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Setup Instructions](#setup-instructions)

---

## 🎯 Overview

The **Quicksmart Mock Train Reservation System** is a student-oriented backend application that provides a RESTful API for train reservation operations. It serves as a middleware between the student frontend and the actual ServerPE backend, implementing API key authentication and session management.

### Key Features
- ✅ API Key based authentication for all endpoints
- ✅ OTP-based email verification
- ✅ JWT token session management
- ✅ Complete train search and booking flow
- ✅ Enterprise-level error handling
- ✅ Winston-based logging
- ✅ Rate limiting protection
- ✅ Comprehensive test coverage

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│                 │     │                     │     │                  │
│   Frontend      │────▶│  Student Backend    │────▶│  ServerPE API    │
│   (React)       │     │  (This Project)     │     │  (Main Backend)  │
│                 │◀────│                     │◀────│                  │
└─────────────────┘     └─────────────────────┘     └──────────────────┘
                              │
                              │  Layers
                              ▼
                    ┌─────────────────────┐
                    │  Routes (Routers)   │
                    └──────────┬──────────┘
                              │
                    ┌──────────▼──────────┐
                    │  Services (Logic)   │
                    └──────────┬──────────┘
                              │
                    ┌──────────▼──────────┐
                    │  Repository (API)   │
                    └─────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Routers** | HTTP routing, request validation, response formatting |
| **Middleware** | API key validation, JWT authentication, error handling |
| **Services** | Business logic, data transformation |
| **Repository** | External API communication with ServerPE |

---

## 📁 Project Structure

```
student-back-end/
├── src/
│   ├── app.js                    # Main application entry point
│   ├── config/
│   │   ├── index.js              # Configuration management
│   │   └── apiKeys.js            # Hardcoded API keys for demo
│   ├── middleware/
│   │   ├── index.js              # Middleware exports
│   │   ├── checkApiKey.js        # API key validation middleware
│   │   ├── checkAuth.js          # JWT authentication middleware
│   │   ├── errorHandler.js       # Global error handling
│   │   └── requestLogger.js      # Request logging middleware
│   ├── routers/
│   │   ├── index.js              # Router exports
│   │   ├── studentTrainRouter.js # Train-related endpoints
│   │   ├── authRouter.js         # Authentication endpoints
│   │   └── healthRouter.js       # Health check endpoints
│   ├── services/
│   │   ├── index.js              # Service exports
│   │   ├── trainService.js       # Train business logic
│   │   └── authService.js        # Auth business logic
│   ├── repositories/
│   │   ├── index.js              # Repository exports
│   │   └── trainRepository.js    # ServerPE API calls
│   └── utils/
│       ├── logger.js             # Winston logger configuration
│       ├── responseHelper.js     # Standardized response formatting
│       ├── errors.js             # Custom error classes
│       ├── validators.js         # Input validation utilities
│       └── otpHelper.js          # OTP generation and verification
├── tests/
│   ├── setup.js                  # Jest test setup
│   ├── unit/                     # Unit tests
│   └── e2e/                      # End-to-end tests
├── docs/                         # Documentation folder
├── logs/                         # Application logs (gitignored)
├── package.json
├── jest.config.js
├── .env.example
└── .gitignore
```

---

## 🌐 API Endpoints

### Health Check Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Basic health check |
| GET | `/health/detailed` | Detailed health with dependencies |

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/student/auth/send-otp` | Send OTP to email | API Key |
| POST | `/student/auth/verify-otp` | Verify OTP and get token | API Key |
| GET | `/student/auth/check-auth` | Check authentication status | API Key + JWT |
| POST | `/student/auth/logout` | Clear session | API Key |
| GET | `/student/auth/me` | Get current user info | API Key + JWT |

### Train Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/student/train/stations` | Get all stations | API Key |
| GET | `/student/train/reservation-types` | Get reservation types | API Key |
| GET | `/student/train/coach-types` | Get coach types | API Key |
| GET | `/student/train/search` | Search trains | API Key |
| GET | `/student/train/schedule/:train_input` | Get train schedule | API Key |
| GET | `/student/train/live-status/:train_input` | Get live status | API Key |
| GET | `/student/train/station/:station_code` | Get trains at station | API Key |
| POST | `/student/train/calculate-fare` | Calculate fare | API Key |
| POST | `/student/train/book-ticket` | Book ticket | API Key + JWT |
| POST | `/student/train/cancel-ticket` | Cancel ticket | API Key + JWT |
| GET | `/student/train/pnr-status/:pnr` | Check PNR status | API Key |
| GET | `/student/train/booking-history/:email` | Get booking history | API Key + JWT |

---

## 🔐 Authentication Flow

### OTP-Based Authentication Flow

```
┌──────────┐                ┌──────────────┐                ┌─────────────┐
│  Client  │                │   Student    │                │   OTP Store │
│          │                │   Backend    │                │ (In-Memory) │
└────┬─────┘                └──────┬───────┘                └──────┬──────┘
     │                             │                               │
     │  1. POST /auth/send-otp     │                               │
     │  {email, api_key}           │                               │
     ├────────────────────────────▶│                               │
     │                             │  2. Generate OTP (1234)       │
     │                             ├──────────────────────────────▶│
     │                             │  3. Store OTP with expiry     │
     │                             │◀──────────────────────────────┤
     │  4. Return success          │                               │
     │  (OTP in dev mode)          │                               │
     │◀────────────────────────────┤                               │
     │                             │                               │
     │  5. POST /auth/verify-otp   │                               │
     │  {email, otp, api_key}      │                               │
     ├────────────────────────────▶│                               │
     │                             │  6. Verify OTP                │
     │                             ├──────────────────────────────▶│
     │                             │  7. OTP valid, delete         │
     │                             │◀──────────────────────────────┤
     │                             │                               │
     │                             │  8. Generate JWT Token        │
     │                             │                               │
     │  9. Return success + cookie │                               │
     │  (JWT in HttpOnly cookie)   │                               │
     │◀────────────────────────────┤                               │
     │                             │                               │
     │  10. Subsequent requests    │                               │
     │  (Cookie auto-attached)     │                               │
     ├────────────────────────────▶│                               │
     │                             │                               │
```

### API Key Validation

API keys are validated on every request. Valid keys:
- `QS_DEMO_API_KEY_2026_STUDENT_TRAIN` - Full access
- `QS_TEST_API_KEY_2026` - Full access
- `QS_READONLY_API_KEY_2026` - Read-only access

---

## ❌ Error Handling

### Custom Error Classes

| Error Class | Status Code | Use Case |
|-------------|-------------|----------|
| `ValidationError` | 400 | Invalid input data |
| `AuthenticationError` | 401 | Missing/invalid credentials |
| `AuthorizationError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflict |
| `RateLimitError` | 429 | Too many requests |
| `ExternalServiceError` | 503 | External API failure |

### Standard Error Response Format

```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "mock_data": true,
  "status": "Failed",
  "successstatus": false,
  "message": "Error description",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "error_details": { } // Only in development
}
```

---

## 🧪 Testing

### Test Categories

1. **Unit Tests** (`tests/unit/`)
   - Validators
   - OTP Helper
   - Response Helper
   - API Key validation
   - Custom Errors

2. **E2E Tests** (`tests/e2e/`)
   - Health endpoints
   - Auth endpoints
   - Train endpoints
   - Protected booking endpoints

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run unit tests only
npm run test:unit

# Run e2e tests only
npm run test:e2e

# Run in watch mode
npm run test:watch
```

### Test Coverage Targets

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- ServerPE backend running on port 3000

### Installation

```bash
# Navigate to project
cd student-back-end

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# OR start production server
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment | development |
| `SERVERPE_BASE_URL` | ServerPE API URL | http://localhost:3000 |
| `DEMO_API_KEY` | Demo API key | QS_DEMO_API_KEY_2026_STUDENT_TRAIN |
| `JWT_SECRET` | JWT signing secret | (generated) |
| `JWT_EXPIRES_IN` | Token expiry | 7d |

---

## 📞 Support

For questions or issues, contact the ServerPE team.

---

**Version:** 1.0.0  
**Last Updated:** January 15, 2026
