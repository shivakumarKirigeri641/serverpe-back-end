# API Documentation - Student Mock Train Reservation

This document describes the API endpoints provided by the Student Mock Train Backend (`port 7777`). This backend acts as a secure proxy to the main ServerPE API, handling authentication, license validation, and error transformation.

## Base URL
`http://localhost:7777/api`

## Authentication & License
All requests to the backend are automatically injected with the required `x-license-key` and `x-device-fingerprint` headers before forwarding to the main ServerPE API. 

> [!NOTE]
> Ensure your `LICENSE_KEY` is correctly set in the `.env` file.

---

## 1. Reference Data

### Get Stations
Fetches all available stations for booking.
- **URL:** `/stations`
- **Method:** `GET`
- **Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "stations": [{ "code": "NDLS", "station_name": "New Delhi" }, ...]
  }
}
```

### Get Coach Types
- **URL:** `/coach-types`
- **Method:** `GET`

### Get Reservation Types
- **URL:** `/reservation-types`
- **Method:** `GET`

---

## 2. Train Information

### Search Trains
- **URL:** `/search-trains`
- **Method:** `POST`
- **Body:**
```json
{
  "source_code": "NDLS",
  "destination_code": "BCT",
  "doj": "2026-01-20"
}
```

### Train Schedule
- **URL:** `/train-schedule`
- **Method:** `POST`
- **Body:** `{ "train_number": "12301" }`

### Live Train Status
- **URL:** `/live-train-status`
- **Method:** `POST`
- **Body:** `{ "train_number": "12301" }`

---

## 3. Booking Flow

### Calculate Fare
Calculates the total price before booking.
- **URL:** `/calculate-fare`
- **Method:** `POST`
- **Body Parameters:** `train_number`, `source_code`, `destination_code`, `doj`, `coach_code`, `reservation_type`, `passengers[]`.

### Confirm Ticket
Finalizes the booking and generates a PNR.
- **URL:** `/confirm-ticket`
- **Method:** `POST`

---

## 4. User & History

### PNR Status
- **URL:** `/pnr-status/:pnr`
- **Method:** `GET`

### Booking History
- **URL:** `/booking-history`
- **Method:** `POST`
- **Body:** `{ "email": "user@example.com" }`

---

## 5. Error Handling
The API returns a standardized error format:
```json
{
  "success": false,
  "error": {
    "userMessage": "Friendly message for the student",
    "technicalMessage": "Detailed developer error info",
    "errorCode": "ERROR_CODE",
    "statusCode": 400
  }
}
```
