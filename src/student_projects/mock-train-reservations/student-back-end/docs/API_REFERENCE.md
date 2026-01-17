# Quicksmart Train Reservation - API Reference

## 🔌 Complete API Reference

---

## Base URL
```
http://localhost:4000
```

## Authentication

### Headers Required
| Header | Value | Required |
|--------|-------|----------|
| `X-API-Key` | `QS_DEMO_API_KEY_2026_STUDENT_TRAIN` | All endpoints |
| `Cookie` | `qs_train_token=<jwt>` | Protected endpoints |

---

## Health Endpoints

### GET /
**Description:** Get API information

**Response:**
```json
{
  "name": "Quicksmart Mock Train Reservation API",
  "version": "1.0.0",
  "description": "Student backend for train reservation system",
  "endpoints": {
    "health": "/health",
    "auth": "/student/auth/*",
    "train": "/student/train/*"
  }
}
```

### GET /health
**Description:** Basic health check

**Response:**
```json
{
  "status": "healthy",
  "service": "quicksmart-train-reservation-student",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-01-15T10:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST /student/auth/send-otp
**Description:** Send OTP to email for verification

**Headers:**
```
X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN
```

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
    "otp": "1234"  // Only in development
  }
}
```

**Error Responses:**
- `400` - Invalid email format
- `401` - Invalid or missing API key

---

### POST /student/auth/verify-otp
**Description:** Verify OTP and establish session

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
  "status": "Success",
  "successstatus": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "user@example.com",
    "verified": true,
    "token_expires_in": "7d"
  }
}
```

**Headers Set:**
```
Set-Cookie: qs_train_token=<jwt>; HttpOnly; Path=/; Max-Age=604800
```

**Error Responses:**
- `400` - Email and OTP are required
- `401` - Invalid or expired OTP

---

### GET /student/auth/check-auth
**Description:** Verify current authentication status

**Headers Required:**
```
X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN
Cookie: qs_train_token=<jwt>
```

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "email": "user@example.com",
    "authenticated": true
  }
}
```

---

### POST /student/auth/logout
**Description:** Clear authentication session

**Success Response (200):**
```json
{
  "status": "Success",
  "message": "Logged out successfully",
  "data": null
}
```

---

## Train Endpoints

### GET /student/train/stations
**Description:** Get all available stations

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
**Description:** Get all reservation types

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "reservation_types": [
      { "id": 1, "type_code": "GEN", "description": "General" },
      { "id": 2, "type_code": "TATKAL", "description": "Tatkal" },
      { "id": 3, "type_code": "LADIES", "description": "Ladies" }
    ]
  }
}
```

---

### GET /student/train/coach-types
**Description:** Get all coach types

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "coach_types": [
      { "id": 1, "coach_code": "SL", "description": "Sleeper" },
      { "id": 2, "coach_code": "3A", "description": "Third AC" },
      { "id": 3, "coach_code": "2A", "description": "Second AC" },
      { "id": 4, "coach_code": "1A", "description": "First AC" }
    ]
  }
}
```

---

### GET /student/train/search
**Description:** Search trains between source and destination

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| source | string | Yes | Source station code (e.g., "NDLS") |
| destination | string | Yes | Destination station code (e.g., "MAS") |
| doj | string | Yes | Date of journey (YYYY-MM-DD) |

**Example Request:**
```
GET /student/train/search?source=NDLS&destination=MAS&doj=2026-02-15
```

**Success Response (200):**
```json
{
  "status": "Success",
  "message": "Trains fetched successfully",
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
        "train_name": "Mumbai Rajdhani",
        "departure": "16:55",
        "arrival": "08:35",
        "duration": "15:40",
        "availability": {
          "SL": 120,
          "3A": 45,
          "2A": 20
        }
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Missing required parameters
- `400` - Invalid date format (use YYYY-MM-DD)

---

### GET /student/train/schedule/:train_input
**Description:** Get train schedule

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| train_input | Train number (e.g., "12951") or name (e.g., "Rajdhani") |

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "schedule": {
      "train_number": "12951",
      "train_name": "Mumbai Rajdhani",
      "train_type": "SF",
      "running_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "coaches": {
        "SL": 10,
        "3A": 5,
        "2A": 4,
        "1A": 2
      },
      "schedule": [
        {
          "station_code": "NDLS",
          "station_name": "New Delhi",
          "arrival": "--",
          "departure": "16:55",
          "distance": 0,
          "day": 1
        },
        {
          "station_code": "MAS",
          "station_name": "Chennai Central",
          "arrival": "08:35",
          "departure": "--",
          "distance": 2175,
          "day": 2
        }
      ]
    }
  }
}
```

**Error Responses:**
- `404` - Train not found

---

### GET /student/train/live-status/:train_input
**Description:** Get live running status of train

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "train_input": "12951",
    "live_status": [
      {
        "station_code": "NDLS",
        "station_name": "New Delhi",
        "arrival": "--",
        "departure": "16:55",
        "running_day": 1
      }
    ]
  }
}
```

---

### GET /student/train/station/:station_code
**Description:** Get all trains passing through a station

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "station_code": "NDLS",
    "trains_count": 50,
    "trains": [
      {
        "train_number": "12951",
        "train_name": "Mumbai Rajdhani",
        "arrival": "06:00",
        "departure": "16:55"
      }
    ]
  }
}
```

---

### POST /student/train/calculate-fare
**Description:** Calculate fare for a journey

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
  "status": "Success",
  "message": "Fare calculated successfully",
  "data": {
    "fare": {
      "train_number": "12951",
      "coach_code": "SL",
      "reservation_type": "GEN",
      "journey_km": 2175,
      "passengers_count": 2,
      "fare": {
        "baseFare": 1000,
        "reservationCharge": 60,
        "superfastCharge": 30,
        "gst": 195.60,
        "grandTotal": 1285.60
      }
    }
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Maximum 6 passengers allowed

---

### POST /student/train/book-ticket
**Description:** Book a train ticket (Protected)

**Headers Required:**
```
X-API-Key: QS_DEMO_API_KEY_2026_STUDENT_TRAIN
Cookie: qs_train_token=<jwt>
```

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
  "email": "john@example.com",
  "total_fare": 1285.60
}
```

**Success Response (200):**
```json
{
  "status": "Success",
  "message": "Ticket booked successfully",
  "data": {
    "booking": {
      "pnr": "ABC123",
      "pnr_status": "CONFIRMED",
      "train_details": {
        "train_number": "12951",
        "train_name": "Mumbai Rajdhani",
        "source": "New Delhi",
        "destination": "Chennai Central",
        "doj": "2026-02-15"
      },
      "passenger_details": [
        {
          "id": 1,
          "name": "John Doe",
          "age": 30,
          "gender": "M",
          "status": "SL/45/UB"
        }
      ],
      "seat_details": [
        {
          "seat_number": 45,
          "berth_type": "UB",
          "coach_code": "S1",
          "status": "CONFIRMED"
        }
      ]
    }
  }
}
```

---

### POST /student/train/cancel-ticket
**Description:** Cancel ticket (Protected)

**Request Body:**
```json
{
  "pnr": "ABC123",
  "passenger_ids": [1, 2]
}
```

**Success Response (200):**
```json
{
  "status": "Success",
  "message": "Ticket cancelled successfully",
  "data": {
    "cancellation": {
      "pnr": "ABC123",
      "cancelled_passengers": [1, 2],
      "refund_amount": 1100.00
    }
  }
}
```

---

### GET /student/train/pnr-status/:pnr
**Description:** Check PNR status

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "pnr_status": {
      "pnr": "ABC123",
      "pnr_status": "CONFIRMED",
      "train_number": "12951",
      "train_name": "Mumbai Rajdhani",
      "source_name": "New Delhi",
      "destination_name": "Chennai Central",
      "date_of_journey": "2026-02-15",
      "passengers": [
        {
          "name": "John Doe",
          "age": 30,
          "gender": "M",
          "status": "CNF/S1/45/UB"
        }
      ]
    }
  }
}
```

---

### GET /student/train/booking-history/:email
**Description:** Get booking history (Protected)

**Note:** Users can only view their own booking history.

**Success Response (200):**
```json
{
  "status": "Success",
  "data": {
    "email": "john@example.com",
    "bookings_count": 2,
    "bookings": [
      {
        "pnr": "ABC123",
        "pnr_status": "CONFIRMED",
        "train_number": "12951",
        "train_name": "Mumbai Rajdhani",
        "date_of_journey": "2026-02-15",
        "total_fare": 1285.60
      }
    ]
  }
}
```

**Error Responses:**
- `403` - You can only view your own booking history

---

## Error Response Format

All error responses follow this format:

```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "mock_data": true,
  "status": "Failed",
  "successstatus": false,
  "message": "Error description",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "error_details": { }  // Only in development
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid API key or token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable - External API error |

---

**Version:** 1.0.0  
**Last Updated:** January 15, 2026
