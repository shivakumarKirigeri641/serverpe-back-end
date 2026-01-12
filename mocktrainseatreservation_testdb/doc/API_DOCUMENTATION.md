# API Documentation

## Mock Train Seat Reservation API

**Base URL:** `http://localhost:7777/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Master Data Endpoints](#master-data-endpoints)
3. [Train Search Endpoints](#train-search-endpoints)
4. [Booking Endpoints](#booking-endpoints)
5. [PNR & History Endpoints](#pnr--history-endpoints)
6. [Response Format](#response-format)
7. [Error Codes](#error-codes)

---

## Authentication

### Send OTP
Send OTP to user email for login.

**Endpoint:** `POST /train/send-otp`

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "success": true,
    "message": "OTP sent successfully",
    "data": {
        "email": "user@example.com",
        "expires_in": "10 minutes",
        "hint": "For this demo, use OTP: 1234"
    }
}
```

> 💡 **Note:** For demo purposes, OTP is always `1234`

---

### Verify OTP
Verify OTP and get authentication token.

**Endpoint:** `POST /train/verify-otp`

**Request Body:**
```json
{
    "email": "user@example.com",
    "otp": "1234"
}
```

**Response:**
```json
{
    "success": true,
    "message": "OTP verified successfully",
    "data": {
        "email": "user@example.com",
        "verified": true,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_expires_in": "7 days"
    }
}
```

---

## Master Data Endpoints

### Get All Stations
**Endpoint:** `GET /train/stations`

**Response:**
```json
{
    "success": true,
    "data": {
        "stations": [
            { "code": "NDLS", "station_name": "New Delhi", "zone": "NR" },
            { "code": "BCT", "station_name": "Mumbai Central", "zone": "WR" }
        ]
    }
}
```

---

### Get Coach Types
**Endpoint:** `GET /train/coach-types`

**Response:**
```json
{
    "success": true,
    "data": {
        "coach_types": [
            { "id": 1, "coach_code": "1A", "description": "First Class AC", "seats_per_coach": 18 },
            { "id": 2, "coach_code": "2A", "description": "Second AC", "seats_per_coach": 48 }
        ]
    }
}
```

---

### Get Reservation Types
**Endpoint:** `GET /train/reservation-types`

**Response:**
```json
{
    "success": true,
    "data": {
        "reservation_types": [
            { "id": 1, "type_code": "GEN", "description": "General Quota" },
            { "id": 2, "type_code": "TTL", "description": "Tatkal Quota" }
        ]
    }
}
```

---

## Train Search Endpoints

### Search Trains
**Endpoint:** `GET /train/search?source=NDLS&destination=BCT&doj=2024-01-15`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| source | string | Source station code |
| destination | string | Destination station code |
| doj | string | Date of journey (YYYY-MM-DD) |

**Response:**
```json
{
    "success": true,
    "data": {
        "query": { "source": "NDLS", "destination": "BCT", "doj": "2024-01-15" },
        "trains_count": 5,
        "trains": [
            {
                "train_number": "12951",
                "train_name": "Mumbai Rajdhani",
                "train_type": "RAJ",
                "departure_time": "17:00",
                "arrival_time": "08:35",
                "distance_km": 1384,
                "classes": {
                    "3A": { "available": 64, "total": 64, "fare": 2500, "status": "AVAILABLE" }
                }
            }
        ]
    }
}
```

---

### Get Train Schedule
**Endpoint:** `GET /train/schedule/:train_input`

**Example:** `GET /train/schedule/12951` or `GET /train/schedule/Rajdhani`

**Response:**
```json
{
    "success": true,
    "data": {
        "schedule": {
            "train_number": "12951",
            "train_name": "Mumbai Rajdhani",
            "running_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "schedule": [
                {
                    "station_code": "BCT",
                    "station_name": "Mumbai Central",
                    "arrival": "--",
                    "departure": "17:00",
                    "distance": 0,
                    "day": 1
                }
            ]
        }
    }
}
```

---

### Get Live Train Status
**Endpoint:** `GET /train/live-status/:train_input`

---

### Get Trains at Station
**Endpoint:** `GET /train/station/:station_code`

**Example:** `GET /train/station/NDLS`

---

## Booking Endpoints

### Calculate Fare
**Endpoint:** `POST /train/calculate-fare`

**Request Body:**
```json
{
    "train_number": "12951",
    "source_code": "NDLS",
    "destination_code": "BCT",
    "doj": "2024-01-15",
    "coach_code": "3A",
    "reservation_type": "GEN",
    "passengers": [
        { "passenger_name": "John Doe", "passenger_age": 30, "passenger_gender": "M" }
    ]
}
```

---

### Book Ticket (Auth Required)
**Endpoint:** `POST /train/book-ticket`

**Headers:** Cookie with auth token

**Request Body:**
```json
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
            "passenger_gender": "M",
            "passenger_ispwd": false
        }
    ],
    "mobile_number": "9876543210",
    "email": "john@example.com",
    "total_fare": 2500
}
```

---

### Cancel Ticket (Auth Required)
**Endpoint:** `POST /train/cancel-ticket`

**Request Body:**
```json
{
    "pnr": "1000000001",
    "passenger_ids": [1, 2]
}
```

---

## PNR & History Endpoints

### Check PNR Status
**Endpoint:** `GET /train/pnr-status/:pnr`

**Example:** `GET /train/pnr-status/1000000001`

---

### Get Booking History (Auth Required)
**Endpoint:** `GET /train/booking-history/:email`

---

## Response Format

### Success Response
```json
{
    "success": true,
    "message": "Success message",
    "data": { ... },
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "error": "ERROR_CODE",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Invalid input data |
| NOT_FOUND | Resource not found |
| NO_TOKEN | Authentication required |
| TOKEN_EXPIRED | Session expired |
| INVALID_TOKEN | Invalid auth token |
| NETWORK_ERROR | Server unreachable |
| DB_ERROR | Database error |
| BOOKING_ERROR | Booking failed |
