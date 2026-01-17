# Quicksmart Train Reservation - Complete API Documentation

## Base URL
```
Development: http://localhost:4000
Production:  https://your-domain.com
```

## Authentication

All endpoints require API Key authentication via one of:
- Header: `X-API-Key: YOUR_API_KEY`
- Query: `?api_key=YOUR_API_KEY`
- Body: `{ "apiKey": "YOUR_API_KEY" }`

Protected endpoints additionally require JWT authentication via cookie.

## Demo API Keys
```
Full Access:   QS_DEMO_API_KEY_2026_STUDENT_TRAIN
Test Access:   QS_TEST_API_KEY_2026
Read-Only:     QS_READONLY_API_KEY_2026
```

---

## 🏥 Health Endpoints

### GET /health
Basic health check

**Response:**
```json
{
  "status": "healthy",
  "service": "quicksmart-train-reservation-student",
  "version": "1.0.0",
  "timestamp": "2026-01-15T10:00:00.000Z"
}
```

### GET /health/detailed
Detailed health information

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "memory": {
    "used": "50 MB",
    "total": "100 MB"
  },
  "dependencies": {
    "serverpe_api": {
      "url": "http://localhost:3000",
      "status": "configured"
    }
  }
}
```

---

## 🔐 Authentication Endpoints

### POST /student/auth/send-otp
Send OTP to email for verification

**Headers:**
- `X-API-Key`: Required
- `Content-Type`: application/json

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "mock_data": true,
  "status": "Success",
  "successstatus": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com",
    "expires_in": "10 minutes",
    "otp": "1234"
  },
  "timestamp": "2026-01-15T10:00:00.000Z"
}
```

**Error Responses:**
- 400: Invalid email format
- 401: Invalid/missing API key

---

### POST /student/auth/verify-otp
Verify OTP and login

**Headers:**
- `X-API-Key`: Required
- `Content-Type`: application/json

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Success Response (200):**
```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "mock_data": true,
  "status": "Success",
  "successstatus": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "user@example.com",
    "verified": true,
    "token_expires_in": "7d"
  },
  "timestamp": "2026-01-15T10:00:00.000Z"
}
```

**Cookies Set:**
- `qs_train_token`: JWT token (HttpOnly, 7 days)

**Error Responses:**
- 400: Missing email or OTP
- 401: Invalid or expired OTP

---

### GET /student/auth/check-auth
Check authentication status

**Headers:**
- `X-API-Key`: Required
- `Cookie`: qs_train_token

**Success Response (200):**
```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "status": "Success",
  "data": {
    "email": "user@example.com",
    "authenticated": true
  }
}
```

**Error Responses:**
- 401: Not authenticated

---

### GET /student/auth/me
Get current user information

**Headers:**
- `X-API-Key`: Required
- `Cookie`: qs_train_token

**Success Response (200):**
```json
{
  "data": {
    "email": "user@example.com",
    "mobile_number": null
  }
}
```

---

### POST /student/auth/logout
Logout and clear session

**Headers:**
- `X-API-Key`: Required

**Success Response (200):**
```json
{
  "status": "Success",
  "message": "Logged out successfully"
}
```

---

## 🚂 Master Data Endpoints

### GET /student/train/stations
Get all available stations

**Headers:**
- `X-API-Key`: Required

**Success Response (200):**
```json
{
  "status": "Success",
  "message": "Stations fetched successfully",
  "data": {
    "stations": [
      {
        "code": "NDLS",
        "station_name": "New Delhi",
        "zone": "NR"
      },
      {
        "code": "MAS",
        "station_name": "Chennai Central",
        "zone": "SR"
      }
    ]
  }
}
```

---

### GET /student/train/reservation-types
Get all reservation types

**Headers:**
- `X-API-Key`: Required

**Success Response (200):**
```json
{
  "data": {
    "reservation_types": [
      {
        "id": 1,
        "type_code": "GEN",
        "description": "General"
      },
      {
        "id": 2,
        "type_code": "TATKAL",
        "description": "Tatkal"
      },
      {
        "id": 3,
        "type_code": "LADIES",
        "description": "Ladies Quota"
      }
    ]
  }
}
```

---

### GET /student/train/coach-types
Get all coach types

**Headers:**
- `X-API-Key`: Required

**Success Response (200):**
```json
{
  "data": {
    "coach_types": [
      {
        "id": 1,
        "coach_code": "SL",
        "description": "Sleeper"
      },
      {
        "id": 2,
        "coach_code": "3A",
        "description": "Third AC"
      },
      {
        "id": 3,
        "coach_code": "2A",
        "description": "Second AC"
      }
    ]
  }
}
```

---

## 🔍 Train Search Endpoints

### GET /student/train/search
Search trains between stations

**Headers:**
- `X-API-Key`: Required

**Query Parameters:**
- `source` (string, required): Source station code (e.g., "NDLS")
- `destination` (string, required): Destination station code (e.g., "MAS")
- `doj` (string, required): Date of journey in YYYY-MM-DD format

**Example Request:**
```
GET /student/train/search?source=NDLS&destination=MAS&doj=2026-02-15
```

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "query": {
      "source": "NDLS",
      "destination": "MAS",
      "doj": "2026-02-15"
    },
    "trains_count": 2,
    "trains": [
      {
        "train_number": "12951",
        "train_name": "Rajdhani Express",
        "departure": "16:55",
        "arrival": "08:35",
        "duration": "15h 40m",
        "available_classes": ["1A", "2A", "3A"]
      }
    ]
  }
}
```

**Error Responses:**
- 400: Missing parameters or invalid date format
- 401: Invalid API key

---

### GET /student/train/schedule/:train_input
Get train schedule

**Headers:**
- `X-API-Key`: Required

**Path Parameters:**
- `train_input` (string): Train number or name

**Example Request:**
```
GET /student/train/schedule/12951
```

**Success Response (200):**
```json
{
  "data": {
    "schedule": {
      "train_number": "12951",
      "train_name": "Rajdhani Express",
      "train_type": "Superfast",
      "running_days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
      "coaches": {
        "1A": 1,
        "2A": 2,
        "3A": 3,
        "SL": 10
      },
      "schedule": [
        {
          "station_code": "NDLS",
          "station_name": "New Delhi",
          "arrival": null,
          "departure": "16:55",
          "distance": 0,
          "day": 1,
          "seq": 1
        },
        {
          "station_code": "MAS",
          "station_name": "Chennai Central",
          "arrival": "08:35",
          "departure": null,
          "distance": 2180,
          "day": 2,
          "seq": 10
        }
      ]
    }
  }
}
```

**Error Responses:**
- 404: Train not found

---

### GET /student/train/live-status/:train_input
Get live train running status

**Headers:**
- `X-API-Key`: Required

**Path Parameters:**
- `train_input` (string): Train number or name

**Success Response (200):**
```json
{
  "data": {
    "train_input": "12951",
    "live_status": [
      {
        "station_code": "NDLS",
        "station_name": "New Delhi",
        "scheduled_arrival": null,
        "scheduled_departure": "16:55",
        "actual_arrival": null,
        "actual_departure": "16:58",
        "delay": "+3 min",
        "platform": "16"
      }
    ]
  }
}
```

---

### GET /student/train/station/:station_code
Get all trains at a station

**Headers:**
- `X-API-Key`: Required

**Path Parameters:**
- `station_code` (string): Station code

**Success Response (200):**
```json
{
  "data": {
    "station_code": "NDLS",
    "trains_count": 50,
    "trains": [
      {
        "train_number": "12951",
        "train_name": "Rajdhani Express",
        "arrival": "16:30",
        "departure": "16:55"
      }
    ]
  }
}
```

---

## 💰 Fare Calculation

### POST /student/train/calculate-fare
Calculate ticket fare

**Headers:**
- `X-API-Key`: Required
- `Content-Type`: application/json

**Request Body:**
```json
{
  "train_number": "12951",
  "source_code": "NDLS",
  "destination_code": "MAS",
  "doj": "2026-02-15",
  "coach_code": "SL",
  "reservation_type": "GEN",
  "passengers": [
    {
      "passenger_name": "John Doe",
      "passenger_age": 30,
      "passenger_gender": "M"
    },
    {
      "passenger_name": "Jane Doe",
      "passenger_age": 28,
      "passenger_gender": "F"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "data": {
    "fare": {
      "train_number": "12951",
      "coach_code": "SL",
      "reservation_type": "GEN",
      "journey_km": 2180,
      "passengers_count": 2,
      "fare": {
        "baseFare": 1000,
        "discount": 0,
        "gst": 180,
        "total": 1180,
        "breakdown": [
          {
            "passenger": "John Doe",
            "baseFare": 500,
            "gst": 90,
            "total": 590
          },
          {
            "passenger": "Jane Doe",
            "baseFare": 500,
            "gst": 90,
            "total": 590
          }
        ]
      }
    }
  }
}
```

**Validation Rules:**
- Max 6 passengers
- Passenger name: min 2 characters
- Age: 0-120
- Gender: M, F, or O

---

## 🎫 Booking Endpoints (Auth Required)

### POST /student/train/book-ticket
Book a train ticket

**Headers:**
- `X-API-Key`: Required
- `Cookie`: qs_train_token
- `Content-Type`: application/json

**Request Body:**
```json
{
  "train_number": "12951",
  "source_code": "NDLS",
  "destination_code": "MAS",
  "doj": "2026-02-15",
  "coach_code": "SL",
  "reservation_type": "GEN",
  "passengers": [
    {
      "passenger_name": "John Doe",
      "passenger_age": 30,
      "passenger_gender": "M",
      "passenger_ischild": false,
      "passenger_issenior": false,
      "passenger_ispwd": false
    }
  ],
  "mobile_number": "9876543210",
  "email": "user@example.com",
  "total_fare": 590
}
```

**Success Response (200):**
```json
{
  "data": {
    "booking": {
      "pnr": "ABC1234567",
      "pnr_status": "CONFIRMED",
      "train_details": {
        "train_number": "12951",
        "train_name": "Rajdhani Express",
        "source": "New Delhi",
        "destination": "Chennai Central",
        "doj": "2026-02-15"
      },
      "fare_details": {
        "total_fare": 590,
        "passengers_count": 1
      },
      "passenger_details": [
        {
          "id": 1,
          "name": "John Doe",
          "age": 30,
          "gender": "M",
          "status": "S1/25/LB"
        }
      ],
      "seat_details": [
        {
          "seat_number": "25",
          "berth_type": "LB",
          "coach_code": "S1",
          "status": "CONFIRMED"
        }
      ]
    }
  }
}
```

**Error Responses:**
- 400: Validation errors
- 401: Not authenticated
- 403: Forbidden

---

### POST /student/train/cancel-ticket
Cancel booked ticket

**Headers:**
- `X-API-Key`: Required
- `Cookie`: qs_train_token
- `Content-Type`: application/json

**Request Body:**
```json
{
  "pnr": "ABC1234567",
  "passenger_ids": [1, 2]
}
```

**Success Response (200):**
```json
{
  "data": {
    "cancellation": {
      "pnr": "ABC1234567",
      "cancelled_passengers": [1, 2],
      "refund_amount": 500,
      "cancellation_charges": 90
    }
  }
}
```

---

## 📊 PNR & History

### GET /student/train/pnr-status/:pnr
Check PNR status

**Headers:**
- `X-API-Key`: Required

**Path Parameters:**
- `pnr` (string): PNR number

**Success Response (200):**
```json
{
  "data": {
    "pnr_status": {
      "pnr": "ABC1234567",
      "pnr_status": "CONFIRMED",
      "train_number": "12951",
      "train_name": "Rajdhani Express",
      "source_name": "New Delhi",
      "destination_name": "Chennai Central",
      "date_of_journey": "2026-02-15",
      "total_fare": 590,
      "passengers": [
        {
          "name": "John Doe",
          "age": 30,
          "gender": "M",
          "status": "S1/25/LB"
        }
      ]
    }
  }
}
```

**Error Responses:**
- 404: PNR not found

---

### GET /student/train/booking-history/:email
Get booking history for user

**Headers:**
- `X-API-Key`: Required
- `Cookie`: qs_train_token

**Path Parameters:**
- `email` (string): User email

**Success Response (200):**
```json
{
  "data": {
    "email": "user@example.com",
    "bookings_count": 3,
    "bookings": [
      {
        "pnr": "ABC1234567",
        "pnr_status": "CONFIRMED",
        "train_number": "12951",
        "train_name": "Rajdhani Express",
        "source_name": "New Delhi",
        "destination_name": "Chennai Central",
        "date_of_journey": "2026-02-15",
        "total_fare": 590,
        "created_at": "2026-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Security:**
- Users can only view their own booking history
- Attempting to view another user's history returns 403 Forbidden

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Validation error |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Access denied |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Resource conflict |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |
| 503  | Service Unavailable - External API down |

## Rate Limiting

- Window: 15 minutes
- Max Requests: 100 per window
- Applies to all endpoints

When exceeded:
```json
{
  "status": "Failed",
  "message": "Too many requests, please try again later."
}
```

## CORS

Allowed origins configured in environment:
```
Development: http://localhost:3001
Production: https://your-frontend-domain.com
```

---

**Note:** This API is for educational purposes. All data is mock/demo data.
