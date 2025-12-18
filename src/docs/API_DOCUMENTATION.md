# Mock Train Reservation System - API Documentation

**Version:** 1.0  
**Last Updated:** December 18, 2025  
**API Base URL:** `/mockapis/serverpeuser/api/mocktrain/reserved`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Rate Limiting](#api-rate-limiting)
4. [Reference APIs](#reference-apis)
5. [Core Booking Flow](#core-booking-flow)
6. [Supplementary APIs](#supplementary-apis)
7. [Response Structure](#response-structure)
8. [Error Handling](#error-handling)
9. [Data Definitions](#data-definitions)
10. [Implementation Notes](#implementation-notes)

---

## Overview

The Mock Train Reservation System API provides a comprehensive suite of endpoints for managing train reservations, including searching trains, booking tickets, managing cancellations, and tracking booking history. This API simulates real-world Indian Railways reservation operations with comprehensive seat availability and fare information.

### Key Features

- **Train Search & Availability**: Real-time search for available trains with seat and fare details
- **Reservation Management**: Complete booking lifecycle from search to confirmation
- **Ticket Operations**: Booking confirmation, PNR status tracking, and cancellations
- **Live Train Status**: Current train location and station-wise timing information
- **Station-wise Information**: Live train arrivals/departures at specific stations

### Disclaimer

> **CAUTION**: The data provided by these APIs is strictly for UI testing, learning, and training purposes only. No relation exists with any live scenario or actual railway operations.

---

## Authentication & Authorization

All API requests must include valid API credentials as specified in the system's middleware authentication requirements.

### Required Headers

```
Authorization:
1) x-api-key (provided after subscription)
2) x-secret-key (provided after subscription)
```

### API Key Validation

Requests are validated through the `checkApiKey` middleware. Ensure your API key & secret-key is valid before making requests. Each API key has rate-limited call allocations.

---

## API Rate Limiting

Each API response includes a `remaining_calls` parameter that indicates the number of API calls available for your current session.

```json
{
  "success": true,
  "remaining_calls": 69,
  "data": { ... }
}
```

**Important**: Monitor this value and implement appropriate error handling when calls are exhausted.

---

## Reference APIs

These endpoints provide reference data and must be called during UI initialization.

### 1. Get All Railway Stations

Retrieves a comprehensive list of all available railway stations with zone, address, and station code information.

**Endpoint:** `GET /stations`

**Method:** GET

**Description:** Fetches complete list of all railway stations including identification details, geographical zone, and address information.

**Response Structure:**

```json
{
  "success": true,
  "data": [
    {
      "id": 41,
      "code": "ACND",
      "station_name": "A N DEV NAGAR",
      "zone": "NR",
      "address": "Amanigunj, Faizabad, Uttar Pradesh, In.."
    },
    {
      "id": 338,
      "code": "ASBS",
      "station_name": "A S BHALE SULTN",
      "zone": "NR",
      "address": "Misharauli, Uttar Pradesh, India"
    },
    {
      "id": 14,
      "code": "ABB",
      "station_name": "ABADA",
      "zone": "SER",
      "address": "Dhulagori, Howrah, West Bengal 711313,.."
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique station identifier in the system |
| `code` | String | 3-4 character station code (e.g., YPR, SBC) |
| `station_name` | String | Complete official station name |
| `zone` | String | Railway zone code (e.g., NR, SER, CR) |
| `address` | String | Full address of the station |

**Notes:**
- Station codes are used as parameters in all search and booking operations
- Station IDs are stored in booking records as foreign keys
- Zone information helps categorize trains by administrative region

---

### 2. Get Coach Types

Retrieves all available coach/class types with descriptive names.

**Endpoint:** `GET /coach-type`

**Method:** GET

**Description:** Fetches all available railway coach classes (e.g., First AC, Sleeper Class) with their corresponding codes.

**Response Structure:**

```json
{
  "success": true,
  "data": [
    {
      "coach_code": "1A",
      "coach_name": "First AC"
    },
    {
      "coach_code": "2A",
      "coach_name": "Second AC"
    },
    {
      "coach_code": "3A",
      "coach_name": "Third AC"
    },
    {
      "coach_code": "E3",
      "coach_name": "Third AC Economy"
    },
    {
      "coach_code": "EA",
      "coach_name": "Executive Anubhuti Class"
    },
    {
      "coach_code": "FC",
      "coach_name": "First Class"
    },
    {
      "coach_code": "CC",
      "coach_name": "AC Chair Car"
    },
    {
      "coach_code": "EC",
      "coach_name": "Executive Chair Car"
    },
    {
      "coach_code": "SL",
      "coach_name": "Sleeper Class"
    },
    {
      "coach_code": "2S",
      "coach_name": "Second Sitting"
    }
  ]
}
```

**Coach Codes Reference:**

| Code | Class Name | Description |
|------|-----------|-------------|
| 1A | First AC | Premium sleeper class with individual cabins |
| 2A | Second AC | Air-conditioned sleeper class with 2-tier bunks |
| 3A | Third AC | Air-conditioned sleeper class with 3-tier bunks |
| E3 | Third AC Economy | Budget-friendly 3-tier AC option |
| EA | Executive Anubhuti | Premium seating with enhanced amenities |
| FC | First Class | Non-AC first-class sleeper compartment |
| CC | AC Chair Car | Air-conditioned seating (day travel) |
| EC | Executive Chair Car | Premium AC chair car with reclining seats |
| SL | Sleeper Class | Non-AC sleeper class with 3-tier bunks |
| 2S | Second Sitting | Non-AC day travel seating |

**Notes:**
- Use coach codes (not names) in all booking requests
- "-" in seat count indicates the coach class is not available on that train
- Coach availability varies by train type and route

---

### 3. Get Reservation Types

Retrieves all available reservation categories with descriptions.

**Endpoint:** `GET /reservation-type`

**Method:** GET

**Description:** Fetches all reservation quota types available in the Indian Railways system.

**Response Structure:**

```json
{
  "success": true,
  "data": [
    {
      "type_code": "GEN",
      "description": "General"
    },
    {
      "type_code": "TTL",
      "description": "Tatkal Lower"
    },
    {
      "type_code": "PTL",
      "description": "Premium Tatkal Lower"
    },
    {
      "type_code": "LADIES",
      "description": "Ladies Lower Berth"
    },
    {
      "type_code": "PWD",
      "description": "Person With Disability Lower Berth"
    },
    {
      "type_code": "DUTY",
      "description": "Person with railway duty"
    },
    {
      "type_code": "SENIOR",
      "description": "Senior citizen"
    }
  ]
}
```

**Reservation Type Codes Reference:**

| Code | Quota Type | Eligibility Criteria |
|------|-----------|-------------------|
| GEN | General | Open to all passengers |
| TTL | Tatkal Lower | Bookable 24 hours before departure (lower berth) |
| PTL | Premium Tatkal | Bookable 12 hours before departure with premium charges |
| LADIES | Ladies Lower Berth | Women passengers only (lower berth preference) |
| PWD | Person With Disability | Passengers with certified disabilities (lower berth) |
| DUTY | Duty Staff | Railway personnel on official duty |
| SENIOR | Senior Citizen | Passengers aged 60+ years |

**Notes:**
- Availability depends on train type and class
- Some quotas have higher fares (TTL, PTL)
- Concessions apply for PWD and SENIOR quotas
- Use type codes (not descriptions) in booking requests

---

## Core Booking Flow

The booking process follows a strict sequential flow. Endpoints must be called in the specified order:

**Sequence:** Search Trains → Proceed Booking → Confirm Ticket

### Sequence 1: Search Trains

**Endpoint:** `POST /search-trains`

**Method:** POST

**Description:** Searches for available trains based on source, destination, date of journey, and optional filters. Returns comprehensive availability data including seat counts and fares for all cabin types.

**Request Body:**

```json
{
  "source_code": "ypr",
  "destination_code": "hvr",
  "doj": "2025-12-23",
  "coach_type": null,
  "reservation_type": null
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source_code` | String | Yes | 3-4 character station code for origin |
| `destination_code` | String | Yes | 3-4 character station code for destination |
| `doj` | String (Date) | Yes | Date of journey in YYYY-MM-DD format |
| `coach_type` | String | No | Filter by specific coach type (e.g., "SL", "2A") |
| `reservation_type` | String | No | Filter by specific reservation quota (e.g., "GEN", "TTL") |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 69,
  "data": {
    "source": "YESVANTPUR JN",
    "source_code": "YPR",
    "destination": "HAVERI",
    "destination_code": "HVR",
    "date_of_journey": "2025-12-23",
    "trains_list": [
      {
        "train_number": "17391",
        "train_name": "SBC UBL EXP",
        "train_type": "Mail Express",
        "station_from": "KSR BANGALORE CY JN",
        "station_to": "HUBBALLI JN",
        "source_code": "YPR",
        "destination_code": "HVR",
        "scheduled_departure": "00:27:00",
        "estimated_arrival": "06:48:00",
        "running_day": 1,
        "running_days": "S M T W T F S",
        "journey_duration": "6 hours 21 minutes",
        "distance": 388,
        "seat_count_gen_sl": "705",
        "seat_count_rac_sl": "101",
        "seat_count_rac_share_sl": "101",
        "seat_count_ttl_sl": "50",
        "seat_count_ptl_sl": "50",
        "seat_count_ladies_sl": "30",
        "seat_count_pwd_sl": "20",
        "seat_count_duty_sl": "20",
        "seat_count_senior_sl": "30",
        "seat_count_gen_3a": "-",
        "seat_count_gen_2a": "-",
        "seat_count_gen_1a": "-",
        "seat_count_gen_cc": "-",
        "seat_count_gen_ec": "-",
        "seat_count_gen_ea": "-",
        "seat_count_gen_e3": "-",
        "seat_count_gen_fc": "-",
        "seat_count_gen_2s": "-",
        "fare_gen_sl": "388.00",
        "fare_ttl_sl": "638.00",
        "fare_ptl_sl": "788.00",
        "fare_pwd_sl": "155.200",
        "fare_senior_sl": "194.000",
        "fare_gen_3a": "-",
        "fare_ttl_3a": "-",
        "fare_ptl_3a": "-",
        "fare_pwd_3a": "-",
        "fare_senior_3a": "-"
      }
    ]
  }
}
```

**Train Details Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `train_number` | String | Unique 5-digit train identification number |
| `train_name` | String | Common name of the train |
| `train_type` | String | Category (Mail Express, Superfast, Janshatabdi, etc.) |
| `station_from` | String | Full name of origin railway station |
| `station_to` | String | Full name of destination railway station |
| `scheduled_departure` | String | Scheduled departure time in HH:MM:SS format |
| `estimated_arrival` | String | Estimated arrival time in HH:MM:SS format |
| `running_day` | Integer | Day number of train operation (1-3 for multi-day journeys) |
| `running_days` | String | Days of operation (S M T W T F S format) |
| `journey_duration` | String | Total journey duration in readable format |
| `distance` | Integer | Total distance in kilometers |

**Seat Count Fields Naming Convention:**

- Format: `seat_count_[quota]_[class]`
- Quota: `gen` (General), `rac` (Reserve Against Cancellation), `ttl` (Tatkal), `ptl` (Premium Tatkal), `ladies`, `pwd` (Physically Challenged), `duty`, `senior`
- Class: `sl` (Sleeper), `3a` (Third AC), `2a` (Second AC), `1a` (First AC), `cc` (Chair Car), `ec` (Executive Chair Car), `ea` (Executive Anubhuti), `e3` (Third AC Economy), `fc` (First Class), `2s` (Second Sitting)
- "-" indicates class not available on this train

**Fare Fields Naming Convention:**

- Format: `fare_[quota]_[class]`
- Pricing varies by quota type and class
- "-" indicates fare not available for that combination
- Fares are before GST and convenience charges

**Response Notes:**

- Each train object contains comprehensive seat availability for all combinations
- Multiple trains may be returned; user selects the desired train for booking
- Use `train_number`, `doj`, `coach_type`, and `reservation_type` in the next booking step
- The response maintains consistent field naming across all trains

---

### Sequence 2: Proceed with Booking

**Endpoint:** `POST /proceed-booking`

**Method:** POST

**Description:** Creates a provisional booking record with passenger details and fare calculation. Must be called after selecting a specific train from search results.

**Request Body:**

```json
{
  "train_number": "17391",
  "doj": "2025-12-23",
  "coach_type": "sl",
  "source_code": "ypr",
  "destination_code": "hvr",
  "mobile_number": "9886122415",
  "reservation_type": "gen",
  "passenger_details": [
    {
      "passenger_name": "Amruta",
      "passenger_gender": "M",
      "passenger_age": 36,
      "passenger_ischild": false,
      "passenger_issenior": false
    }
  ]
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `train_number` | String | Yes | Train number from search results |
| `doj` | String (Date) | Yes | Date of journey (YYYY-MM-DD format) |
| `coach_type` | String | Yes | Coach type code selected (e.g., "sl", "2a") |
| `source_code` | String | Yes | Source station code |
| `destination_code` | String | Yes | Destination station code |
| `mobile_number` | String | Yes | 10-digit mobile number for notifications |
| `reservation_type` | String | Yes | Reservation quota type (e.g., "gen", "ttl") |
| `passenger_details` | Array | Yes | Array of passenger objects (minimum 1) |

**Passenger Details Object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `passenger_name` | String | Yes | Full name of passenger |
| `passenger_gender` | String | Yes | "M" for Male, "F" for Female |
| `passenger_age` | Integer | Yes | Age of passenger in years |
| `passenger_ischild` | Boolean | Yes | True if child (typically age < 5) |
| `passenger_issenior` | Boolean | Yes | True if senior citizen (age >= 60) |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 68,
  "data": {
    "booked_details": {
      "id": 62,
      "fktrain_number": 1641,
      "date_of_journey": "2025-12-23",
      "fksource_code": 8918,
      "fkdestination_code": 3239,
      "fkreservation_type": 1,
      "fkcoach_type": 9,
      "mobile_number": "9886122415",
      "proceed_status": false,
      "adult_count": 1,
      "child_count": 0,
      "fkboarding_at": 8918,
      "created_at": "2025-12-18T09:38:25.118Z",
      "updated_at": "2025-12-18T09:38:25.118Z",
      "pnr": null,
      "pnr_status": null,
      "ticket_expiry_status": false,
      "train_number": "17391",
      "coach_code": "SL",
      "type_code": "GEN",
      "source_code": "YPR",
      "source_name": "YESVANTPUR JN",
      "destination_code": "HVR",
      "destination_name": "HAVERI",
      "boarding_point": "YPR",
      "boarding_point_name": "YESVANTPUR JN"
    },
    "passenger_details": [
      {
        "id": 1071693,
        "fkbookingdata": 62,
        "p_name": "Amruta",
        "p_age": 36,
        "p_gender": "M",
        "preferred_berth": null,
        "seat_status": null,
        "created_at": "2025-12-18T09:38:25.118Z",
        "updated_at": "2025-12-18T09:38:25.118Z",
        "current_seat_status": null,
        "updated_seat_status": null,
        "is_child": false,
        "is_senior": false,
        "is_adult": true,
        "base_fare": null,
        "cancellation_status": false,
        "refund_amount": null
      }
    ],
    "fare_details": {
      "base_fare": 388,
      "GST": "18.00",
      "convience": "1.30",
      "gross_fare": 462.884
    }
  }
}
```

**Booking Details Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | **CRITICAL**: Booking ID for confirmation (store this value) |
| `train_number` | String | Echoed train number from request |
| `date_of_journey` | String | Journey date in ISO format |
| `coach_code` | String | Coach class code assigned |
| `type_code` | String | Reservation type code |
| `source_code` | String | Origin station code |
| `source_name` | String | Origin station full name |
| `destination_code` | String | Destination station code |
| `destination_name` | String | Destination station full name |
| `proceed_status` | Boolean | False until payment confirmation |
| `pnr` | String | Null until confirmation; generated after payment |
| `pnr_status` | String | Null until confirmation; "CNF" after confirmation |
| `adult_count` | Integer | Number of adult passengers |
| `child_count` | Integer | Number of child passengers |

**Fare Details:**

| Field | Type | Description |
|-------|------|-------------|
| `base_fare` | Float | Base fare per passenger |
| `GST` | String | GST percentage (18% for railways) |
| `convience` | String | Convenience charge percentage |
| `gross_fare` | Float | Total fare including all charges |

**Critical Notes:**

- **SAVE THE BOOKING ID** - Required for the next step (confirm-ticket)
- `proceed_status` is false until payment confirmation
- Seat allocation hasn't occurred yet; seats are assigned after confirmation
- Passenger IDs are generated; store for cancellation operations
- Fare is calculated but not charged until confirmation
- Booking is temporary and may expire if not confirmed within time limit

---

### Sequence 3: Confirm Ticket & Process Payment

**Endpoint:** `POST /confirm-ticket`

**Method:** POST

**Description:** Finalizes the booking, processes payment (simulated), generates PNR, allocates seats, and sends confirmation details.

**Request Body:**

```json
{
  "booking_id": 62,
  "can_send_mock_ticket_sms": true
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `booking_id` | Integer | Yes | Booking ID from proceed-booking response |
| `can_send_mock_ticket_sms` | Boolean | Yes | Whether to send SMS confirmation to mobile number |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 67,
  "data": {
    "result_updated_bookingdetails": {
      "id": 62,
      "fktrain_number": 1641,
      "date_of_journey": "2025-12-23",
      "fksource_code": 8918,
      "fkdestination_code": 3239,
      "fkreservation_type": 1,
      "fkcoach_type": 9,
      "mobile_number": "9886122415",
      "proceed_status": true,
      "adult_count": 1,
      "child_count": 0,
      "fkboarding_at": 8918,
      "created_at": "2025-12-18T09:38:25.118Z",
      "updated_at": "2025-12-18T09:38:25.118Z",
      "pnr": "PNR001520",
      "pnr_status": "CNF",
      "ticket_expiry_status": false,
      "train_number": "17391",
      "train_name": "SBC UBL EXP",
      "coach_code": "SL",
      "type_code": "GEN",
      "source_code": "YPR",
      "source_name": "YESVANTPUR JN",
      "destination_code": "HVR",
      "destination_name": "HAVERI",
      "scheduled_departure": "00:27:00",
      "estimated_arrival": "06:48:00",
      "boarding_point": "YPR",
      "boarding_point_name": "YESVANTPUR JN"
    },
    "result_udpated_passengerdetails": [
      {
        "id": 1071693,
        "fkbookingdata": 62,
        "p_name": "Amruta",
        "p_age": 36,
        "p_gender": "F",
        "preferred_berth": null,
        "seat_status": "CNF",
        "created_at": "2025-12-18T09:38:25.118Z",
        "updated_at": "2025-12-18T09:38:25.118Z",
        "current_seat_status": "SL10/57/LB",
        "updated_seat_status": "SL10/57/LB",
        "is_child": false,
        "is_senior": false,
        "is_adult": true,
        "base_fare": "388",
        "cancellation_status": false,
        "refund_amount": null
      }
    ],
    "fare_details": {
      "base_fare": 388,
      "GST": "18.00",
      "convience": "1.30",
      "gross_fare": 462.884
    }
  }
}
```

**Updated Booking Details (Post-Confirmation):**

| Field | Type | Changes from Proceed |
|-------|------|---------------------|
| `proceed_status` | Boolean | Now **true** (payment processed) |
| `pnr` | String | Now contains **PNR number** (e.g., "PNR001520") |
| `pnr_status` | String | Now **"CNF"** (Confirmed) |
| `train_name` | String | Train name now included |
| `scheduled_departure` | String | Departure time now included |
| `estimated_arrival` | String | Arrival time now included |

**Updated Passenger Details (Post-Confirmation):**

| Field | Type | Changes from Proceed |
|-------|------|---------------------|
| `seat_status` | String | Now **"CNF"** (Confirmed) |
| `current_seat_status` | String | Now contains **seat number** (e.g., "SL10/57/LB") |
| `updated_seat_status` | String | Mirrors current_seat_status |
| `base_fare` | String | Now contains **calculated fare** |

**Seat Number Format:**

- Format: `[COACH][NUMBER]/[POSITION]/[BERTH]`
- Example: `SL10/57/LB`
  - `SL` = Coach type (Sleeper)
  - `10` = Coach number
  - `57` = Berth number
  - `LB` = Position (LB=Lower Berth, MB=Middle Berth, UB=Upper Berth, SU=Side Upper, SL=Side Lower)

**Critical Information:**

- Booking is now **CONFIRMED**
- **PNR number is the booking reference** - share with passenger
- **Seat has been allocated** - cannot be changed after confirmation
- Payment has been processed (simulated)
- SMS sent if `can_send_mock_ticket_sms` was true
- All fare details finalized

---

## Supplementary APIs

These endpoints can be called independently at any time and don't depend on the booking flow sequence.

### Get PNR Status

Retrieves current status of a confirmed booking using PNR number.

**Endpoint:** `POST /pnr-status`

**Method:** POST

**Description:** Fetches detailed status of a booking identified by PNR number. Only works for confirmed bookings (after sequence 3).

**Request Body:**

```json
{
  "pnr": "PNR001520"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pnr` | String | Yes | PNR number from confirmed booking |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 66,
  "data": {
    "id": 1071630,
    "train_number": "17310",
    "source_code": "UBL",
    "destination_code": "DVG",
    "coach_code": "SL",
    "type_code": "GEN",
    "date_of_journey": "2025-12-06",
    "mobile_number": "9876543210",
    "p_name": "Shiva",
    "p_gender": "M",
    "p_age": 33,
    "is_senior": false,
    "is_child": false,
    "base_fare": "144",
    "refund_amount": null,
    "current_seat_status": "SL7/72/SU",
    "updated_seat_status": "SL7/72/SU",
    "cancellation_status": false
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `train_number` | String | Train identification number |
| `source_code` | String | Origin station code |
| `destination_code` | String | Destination station code |
| `coach_code` | String | Coach class |
| `type_code` | String | Reservation quota type |
| `date_of_journey` | String | Journey date |
| `p_name` | String | Passenger name |
| `p_gender` | String | Passenger gender (M/F) |
| `p_age` | Integer | Passenger age |
| `current_seat_status` | String | Allocated seat number |
| `cancellation_status` | Boolean | Indicates if ticket is cancelled |
| `refund_amount` | Float | Refund amount (null if not cancelled) |

**Error Cases:**

- Invalid PNR: Returns error; ensure PNR is correct and booking is confirmed
- Only works for confirmed bookings

**Notes:**

- Use this to verify booking status at any time
- Multiple passengers on same PNR will have separate entries
- Refund amount populated only if cancellation_status is true

---

### Get Booking History

Retrieves all bookings for a specific mobile number.

**Endpoint:** `POST /booking-history`

**Method:** POST

**Description:** Fetches complete booking history for a passenger identified by mobile number. Returns all bookings (confirmed, pending, or cancelled).

**Request Body:**

```json
{
  "mobile_number": "9886122415"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mobile_number` | String | Yes | 10-digit mobile number used during booking |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 64,
  "data": {
    "status": 200,
    "success": true,
    "data": [
      {
        "id": 62,
        "fktrain_number": 1641,
        "date_of_journey": "2025-12-23",
        "fksource_code": 8918,
        "fkdestination_code": 3239,
        "fkreservation_type": 1,
        "fkcoach_type": 9,
        "mobile_number": "9886122415",
        "proceed_status": true,
        "adult_count": 1,
        "child_count": 0,
        "fkboarding_at": 8918,
        "created_at": "2025-12-18T09:38:25.118Z",
        "updated_at": "2025-12-18T09:38:25.118Z",
        "pnr": "PNR001520",
        "pnr_status": "CNF",
        "ticket_expiry_status": false,
        "train_number": "17391",
        "p_name": "Amruta",
        "p_gender": "F",
        "p_age": 36,
        "preferred_berth": null,
        "seat_status": "CNF",
        "current_seat_status": "SL10/57/LB",
        "updated_seat_status": "SL10/57/LB",
        "is_child": false,
        "is_senior": false,
        "base_fare": "388",
        "cancellation_status": false,
        "refund_amount": null,
        "coach_code": "SL",
        "type_code": "GEN",
        "source_code": "YPR",
        "source_name": "YESVANTPUR JN",
        "destination_code": "HVR",
        "destination_name": "HAVERI",
        "boarding_point": "YPR",
        "boarding_point_name": "YESVANTPUR JN"
      }
    ],
    "message": "Booking history fetched successfully!"
  }
}
```

**Key Response Fields:**

- Returns array of booking objects with passenger details merged
- Each booking entry represents one passenger (multiple passengers = multiple entries)
- Includes cancellation status for each passenger

**Notes:**

- Multiple entries may exist for same booking if multiple passengers
- Filter by `date_of_journey` on frontend if showing only future bookings
- Display format is flexible based on UI requirements

---

### Cancel Ticket

Cancels ticket(s) for specific passenger(s) on a booking.

**Endpoint:** `POST /cancel-ticket`

**Method:** POST

**Description:** Cancels ticket for one or more passengers identified by PNR and passenger IDs. Generates refund based on cancellation policy.

**Request Body:**

```json
{
  "pnr": "PNR001521",
  "passengerids": [
    1071674
  ]
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pnr` | String | Yes | PNR number of the booking |
| `passengerids` | Array (Integer) | Yes | Array of passenger IDs to cancel (minimum 1) |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 61,
  "data": {
    "result_bookingdata": {
      "id": 18,
      "train_number": "17391",
      "source_code": "SBC",
      "pnr_status": "CAN",
      "destination_code": "UBL",
      "coach_code": "SL",
      "type_code": "GEN",
      "date_of_journey": "2025-11-29",
      "mobile_number": "98*******"
    },
    "passenger_details": [
      {
        "id": 1071632,
        "fkbookingdata": 18,
        "p_name": "jkl",
        "p_age": 66,
        "p_gender": "M",
        "preferred_berth": null,
        "seat_status": "CNF",
        "created_at": "2025-11-25T12:58:56.580Z",
        "updated_at": "2025-11-25T12:58:56.580Z",
        "current_seat_status": "SL1/30/UB",
        "updated_seat_status": "SL1/30/UB",
        "is_child": false,
        "is_senior": true,
        "is_adult": false,
        "base_fare": "235",
        "cancellation_status": true,
        "refund_amount": 235
      }
    ]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `pnr_status` | String | Updated to "CAN" (Cancelled) |
| `cancellation_status` | Boolean | True for cancelled passengers |
| `refund_amount` | Float | Amount refunded to passenger |

**Cancellation Policy Notes:**

- Refund amount depends on time until departure
- Passenger age and ticket type may affect refund percentage
- Refund is processed to original payment method
- Child and senior citizen refunds may have different calculations

**Error Cases:**

- Invalid PNR or passenger ID: Returns error
- Booking already cancelled: May return error or indicate already cancelled
- Insufficient time to journey: May restrict cancellation or apply penalties

**Important Cautions:**

- **Verify passenger name before cancellation** - Operation is irreversible
- Cancellation cannot be reverted in this API
- Refund processing time varies by payment method
- Partial cancellation allowed (some passengers can be cancelled while others remain)

---

### Get Train Schedule

Retrieves complete schedule details for a specific train including all stops.

**Endpoint:** `POST /train-schedule`

**Method:** POST

**Description:** Fetches detailed station-wise schedule for a given train number including arrival, departure times, and distances.

**Request Body:**

```json
{
  "train_number": "11312"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `train_number` | String | Yes | 5-digit train identification number |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 56,
  "data": {
    "train_details": {
      "train_number": "11312",
      "train_name": "SOLAPUR EXP",
      "train_type": "Mail Express",
      "zone": "CR",
      "station_from": "HASSAN",
      "station_to": "SOLAPUR JN",
      "train_runs_on_mon": "Y",
      "train_runs_on_tue": "Y",
      "train_runs_on_wed": "Y",
      "train_runs_on_thu": "Y",
      "train_runs_on_fri": "Y",
      "train_runs_on_sat": "Y",
      "train_runs_on_sun": "Y"
    },
    "train_schedule_details": [
      {
        "station_sequence": 1,
        "kilometer": 0,
        "station_code": "HAS",
        "station_name": "HASSAN",
        "arrival": null,
        "departure": "16:05:00",
        "running_day": 1
      },
      {
        "station_sequence": 2,
        "kilometer": 42,
        "station_code": "SBGA",
        "station_name": "SHRAVANBELAGOLA",
        "arrival": "16:39:00",
        "departure": "16:40:00",
        "running_day": 1
      }
    ]
  }
}
```

**Train Details Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `train_number` | String | Train identification |
| `train_name` | String | Common train name |
| `train_type` | String | Express type (Mail Express, Superfast, etc.) |
| `zone` | String | Railway zone code |
| `station_from` | String | Starting station |
| `station_to` | String | Ending station |
| `train_runs_on_[day]` | String | "Y" if train runs on that day; "N" otherwise |

**Schedule Detail Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `station_sequence` | Integer | Order of station in route (1 = first stop) |
| `kilometer` | Integer | Distance from starting station in km |
| `station_code` | String | 3-4 character station code |
| `station_name` | String | Full station name |
| `arrival` | String | Arrival time (null for starting station) |
| `departure` | String | Departure time (null for ending station) |
| `running_day` | Integer | Day number for multi-day journeys |

**Notes:**

- Arrival is null for the first station (starting point)
- Departure is null for the last station (ending point)
- Times are in 24-hour format (HH:MM:SS)
- Use running_day to handle multi-day journeys

---

### Get Live Station Status

Retrieves real-time train arrivals and departures at a specific station.

**Endpoint:** `POST /live-station`

**Method:** POST

**Description:** Fetches live status of trains arriving at or departing from a specified station within a time window. Shows current status (Departed, Yet to Arrive, etc.).

**Request Body:**

```json
{
  "station_code": "MYS",
  "next_hours": 2
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `station_code` | String | Yes | 3-4 character station code |
| `next_hours` | Integer | Yes | Time window in hours (valid: 2, 4, or 8) |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 55,
  "data": {
    "trains_list": [
      {
        "train_number": "20624",
        "train_name": "MALGUDI EXP",
        "train_type": "Superfast Express",
        "station_from": "KSR BANGALORE CY JN",
        "station_to": "MYSORE JN",
        "station_name": "MYSORE JN",
        "arrival_time": "2025-12-18T10:50:00.000Z",
        "departure_time": null,
        "status": "Departed",
        "eta_hhmm": "00:29"
      },
      {
        "train_number": "16219",
        "train_name": "CMNR TPTY EXP",
        "train_type": "Mail Express",
        "station_from": "CHAMARAJANAGAR",
        "station_to": "TIRUPATI",
        "station_name": "MYSORE JN",
        "arrival_time": "2025-12-18T11:30:00.000Z",
        "departure_time": "2025-12-18T11:40:00.000Z",
        "status": "Yet to arrive",
        "eta_hhmm": "01:09"
      }
    ],
    "message": "Trains list fetched successfully!"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `train_number` | String | Train identification number |
| `train_name` | String | Train name |
| `train_type` | String | Express type |
| `station_from` | String | Origin station |
| `station_to` | String | Destination station |
| `arrival_time` | String (ISO 8601) | Scheduled arrival time |
| `departure_time` | String (ISO 8601) | Scheduled departure time (null if arrival-only) |
| `status` | String | Current status (see statuses below) |
| `eta_hhmm` | String | Estimated time until arrival in MM:HH format |

**Possible Status Values:**

| Status | Meaning |
|--------|---------|
| "Departed" | Train has already departed from this station |
| "Yet to arrive" | Train hasn't arrived at this station yet |
| "On Time" | Train is running on schedule |
| "Delayed" | Train is running behind schedule |
| "Cancelled" | Train service cancelled for this day |

**Notes:**

- Filter trains displayed by arrival_time within specified hours
- Use status to show appropriate UI indicators/warnings
- eta_hhmm helps gauge train proximity
- null departure_time indicates terminal station

---

### Get Train Live Running Status

Retrieves detailed live running status of a specific train at all stations along its route.

**Endpoint:** `POST /train-live-running-status`

**Method:** POST

**Description:** Shows current location and status of a train with station-wise progress information, including ETA (Estimated Time of Arrival) at upcoming stations.

**Request Body:**

```json
{
  "train_number": "12080"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `train_number` | String | Yes | 5-digit train identification number |

**Response Structure:**

```json
{
  "success": true,
  "remaining_calls": 54,
  "data": {
    "trains_list": [
      {
        "station_sequence": 1,
        "station_code": "UBL",
        "station_name": "HUBBALLI JN",
        "arrival_time": null,
        "departure_time": "2025-12-18 14:05:00",
        "kilometer": 0,
        "train_number": "12080",
        "runs_today": true,
        "train_status_at_station": "Departed",
        "km_ran_from_last_departed": 0,
        "km_remaining_to_next": 0,
        "eta_hours": "0",
        "eta_minutes": "0"
      },
      {
        "station_sequence": 4,
        "station_code": "HRR",
        "station_name": "HARIHAR",
        "arrival_time": "2025-12-18 16:01:00",
        "departure_time": "2025-12-18 16:02:00",
        "kilometer": 131,
        "train_number": "12080",
        "runs_today": true,
        "train_status_at_station": "Yet to Arrive",
        "km_ran_from_last_departed": 23,
        "km_remaining_to_next": 0,
        "eta_hours": "0",
        "eta_minutes": "8"
      }
    ],
    "message": "Trains details fetched successfully!"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `station_sequence` | Integer | Order in route (1 = starting point) |
| `station_code` | String | 3-4 character station code |
| `station_name` | String | Full station name |
| `arrival_time` | String | Expected arrival time |
| `departure_time` | String | Expected departure time (null for terminal) |
| `kilometer` | Integer | Distance from starting station in km |
| `runs_today` | Boolean | Whether train operates today |
| `train_status_at_station` | String | Status at this specific station |
| `km_ran_from_last_departed` | Integer | Distance covered since last departure |
| `km_remaining_to_next` | Integer | Distance to next station |
| `eta_hours` | String | Hours until next arrival |
| `eta_minutes` | String | Minutes until next arrival |

**Status Values:**

| Status | Description |
|--------|------------|
| "Departed" | Train has left this station |
| "Yet to Arrive" | Train hasn't reached this station yet |
| "On Time" | Running as per schedule |
| "Delayed" | Running behind schedule |

**Real-Time Data Usage:**

- Use `km_ran_from_last_departed` and `km_remaining_to_next` to calculate progress
- Display current location based on train_status_at_station
- Show ETA for upcoming stations using eta_hours and eta_minutes
- Last entry with "Yet to Arrive" status indicates next station
- Can be used to show train position on route map

---

## Response Structure

All API responses follow a consistent structure for reliability and ease of integration.

### Standard Success Response

```json
{
  "success": true,
  "remaining_calls": 69,
  "data": {
    // Endpoint-specific data structure
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "remaining_calls": 69
}
```

### Response Header Fields

| Field | Type | Always Present | Description |
|-------|------|-----------------|-------------|
| `success` | Boolean | Yes | Indicates operation success/failure |
| `remaining_calls` | Integer | Yes | API calls remaining in current session |
| `data` | Object/Array | Conditional | Response data (only if success = true) |
| `message` | String | Conditional | Error message (only if success = false) |
| `error_code` | String | Conditional | Machine-readable error code |

### Data Field Structure

The `data` field contains:

- **Single Object Responses**: Reference APIs return single data object
- **Array Responses**: Booking history and schedule details return arrays
- **Nested Responses**: Complex operations (confirm-ticket) return nested objects with multiple sections

---

## Error Handling

Implement comprehensive error handling for production applications.

### Common Error Codes

| Error Code | HTTP Status | Description | Resolution |
|-----------|-------------|-------------|-----------|
| `INVALID_REQUEST` | 400 | Missing or invalid request parameters | Verify all required parameters and format |
| `UNAUTHORIZED` | 401 | Invalid or expired API key | Check API key validity |
| `RATE_LIMIT_EXCEEDED` | 429 | API call limit exhausted | Wait for next reset period |
| `INVALID_STATION_CODE` | 400 | Station code doesn't exist | Verify against stations reference |
| `NO_TRAINS_FOUND` | 404 | No trains available for given criteria | Try different date/stations |
| `INVALID_TRAIN_NUMBER` | 400 | Train number doesn't exist | Verify train number from search results |
| `INVALID_PNR` | 400 | PNR not found or not confirmed | Ensure booking is confirmed first |
| `BOOKING_NOT_FOUND` | 404 | Booking ID doesn't exist | Verify booking ID from proceed-booking |
| `INVALID_MOBILE_NUMBER` | 400 | Mobile number format incorrect | Use 10-digit Indian mobile number |
| `EXPIRED_BOOKING` | 410 | Booking expired without confirmation | Book again within time limit |
| `INVALID_PASSENGER_DATA` | 400 | Passenger details incomplete/invalid | Verify all passenger fields filled correctly |

### Implementation Recommendations

```javascript
// Error handling example
async function handleApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    
    switch(status) {
      case 400:
        console.error('Invalid request:', data.message);
        // Show user-friendly error
        break;
      case 401:
        console.error('Authentication failed');
        // Redirect to re-authentication
        break;
      case 429:
        console.error('Rate limit exceeded');
        // Show retry message
        break;
      default:
        console.error('Unexpected error:', data.message);
    }
  }
}
```

---

## Data Definitions

### Seat Position Codes

| Code | Meaning |
|------|---------|
| LB | Lower Berth |
| MB | Middle Berth |
| UB | Upper Berth |
| SL | Side Lower |
| SU | Side Upper |

### PNR Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| CNF | Confirmed | Ticket successfully confirmed |
| CAN | Cancelled | Ticket has been cancelled |
| RAC | Reserve Against Cancellation | Waiting list seat |
| WL | Waiting List | On waiting list |
| PEND | Pending | Awaiting confirmation |

### Railway Zones (Sample)

| Zone Code | Zone Name |
|-----------|-----------|
| NR | Northern Railway |
| SER | South Eastern Railway |
| CR | Central Railway |
| WR | Western Railway |
| SR | Southern Railway |
| NE | North Eastern Railway |

### Date and Time Formats

- **Date Format**: YYYY-MM-DD (ISO 8601)
  - Example: 2025-12-23
- **Time Format**: HH:MM:SS (24-hour format)
  - Example: 14:30:00
- **ISO 8601 DateTime**: YYYY-MM-DDTHH:MM:SS.sssZ
  - Example: 2025-12-18T09:38:25.118Z
- **DateTime String**: YYYY-MM-DD HH:MM:SS
  - Example: 2025-12-18 14:05:00

---

## Implementation Notes

### Best Practices

1. **API Call Sequencing**
   - Always call reference APIs (stations, coach-types, reservation-types) during initialization
   - Strictly follow the booking sequence (Search → Proceed → Confirm)
   - Store booking IDs and PNRs for reference throughout the session

2. **Error Resilience**
   - Implement retry logic with exponential backoff for transient failures
   - Cache reference data to reduce API calls
   - Validate all user inputs before sending to API

3. **Performance Optimization**
   - Load reference data once at application startup
   - Implement pagination for booking history if needed
   - Use client-side filtering for coach types and reservation types to reduce server calls

4. **Security Considerations**
   - Never expose API keys in client-side code
   - Use environment variables for sensitive credentials
   - Validate mobile numbers before submitting to API
   - Encrypt sensitive booking information in transit

5. **User Experience**
   - Show remaining API calls in UI for transparency
   - Implement loading states during long-running operations
   - Display clear error messages to users
   - Provide confirmation dialogs for irreversible operations (cancellation)

### Rate Limiting Strategy

```
// Monitor remaining calls
if (response.remaining_calls < 10) {
  showWarning("Limited API calls remaining");
}

if (response.remaining_calls === 0) {
  disableAllBooking();
  showMessage("API call limit reached. Please try again later.");
}
```

### Booking Flow Visualization

```
┌─────────────────────┐
│  Reference APIs     │  Load once at startup
├─────────────────────┤
│ stations            │
│ coach-types         │
│ reservation-types   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Search Trains      │  Get available trains
├─────────────────────┤
│ search-trains (POST)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Proceed Booking    │  Create provisional booking
├─────────────────────┤
│ proceed-booking     │  Get booking ID & fare summary
│ (POST)              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Confirm Ticket     │  Finalize & allocate seat
├─────────────────────┤
│ confirm-ticket      │  Get PNR & seat details
│ (POST)              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Independent APIs   │  Can be called anytime
├─────────────────────┤
│ pnr-status          │
│ booking-history     │
│ cancel-ticket       │
│ train-schedule      │
│ live-station        │
│ live-running-status │
└─────────────────────┘
```

### Sample Implementation Checklist

- [ ] Load reference data on app initialization
- [ ] Validate input before API calls
- [ ] Store booking ID after proceed-booking
- [ ] Store PNR after confirm-ticket
- [ ] Implement error handling for each endpoint
- [ ] Monitor remaining_calls in responses
- [ ] Implement retry logic for failed requests
- [ ] Cache reference data locally
- [ ] Add loading indicators during API calls
- [ ] Implement booking status tracking
- [ ] Add confirmation dialogs for cancellations
- [ ] Log API responses for debugging

---

## Support & Maintenance

### Documentation Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-18 | Initial comprehensive API documentation |

### Contact & Support

For API issues, technical support, or integration assistance, contact the development team.

### Disclaimer

This API and accompanying documentation are provided for testing and learning purposes only. All data is simulated and does not reflect real railway operations or actual bookings. No actual financial transactions occur.

---

**End of Document**
