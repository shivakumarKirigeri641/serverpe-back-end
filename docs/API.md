# ServerPe Back-end — API Documentation

This document summarizes the public router endpoints implemented in the repository and provides example request shapes, security notes, and quick usage hints.

Base URL
- `http://localhost:8888`

Security
- API key endpoints expect headers: `x-api-key` and `x-secret-key` (see `checkApiKey` middleware).
- Some endpoints require a login cookie `serverpe_user_token` (JWT).

Common Responses
- 200: success object with `status`, `success`, `message`, `data`.
- 400: validation error
- 401: unauthorized (missing/invalid token or api key)
- 429: rate limit exceeded for pincode endpoints

Endpoints (summary)
- `GET /stations` — Returns list of stations.
- `GET /reservation-type` — Returns reservation types.
- `GET /coach-type` — Returns coach types.
- `POST /train-schedule` — Body: `{ "train_number": "..." }`.
- `POST /search-trains` — Body: `{ "source_code": "...", "destination_code": "...", "doj": "YYYY-MM-DD" }`.
- `POST /trains-between-two-stations` — Body: `{ "source_code": "..", "destination_code": "..", "via_code": ".." }`.
- `POST /proceed-booking` — Booking request body (application-specific schema).
- `POST /confirm-booking` — Body: `{ "booking_id": "..." }`.
- `POST /cancel-ticket` — Body: `{ "pnr": "...", "passengerids": ["id1","id2"] }`.
- `POST /pnr-status` — Body: `{ "pnr": "..." }`.
- `POST /booking-history` — Body: `{ "mobile_number": "..." }`.
- `POST /live-train-running-status` — Body: `{ "train_number": "..." }`.
- `GET /connection-health` — Health check endpoint.
- `POST /live-station` — Body: `{ "station_code": "...", "next_hours": 2|4|8 }`.
- `POST /test` — Internal testing endpoint.

Pincode / Mock APIs (serverpe user)
- `GET /mockapis/serverpeuser/api-pincodes` — (protected) list pincodes.
- `GET /mockapis/serverpeuser/api-pincodes` — alias: `GET /mockapis/serverpeuser/api/pincodes` in code — returns all pincodes.
- `POST /mockapis/serverpeuser/api/pincode-details` — Body: `{ "pincode": "..." }` — Requires `x-api-key` and `x-secret-key` headers and is rate-limited.
- `POST /mockapis/serverpeuser/send-otp` — Body: `{ "mobile_number": "..." }` — Sends OTP (currently static `1234`).
- `POST /mockapis/serverpeuser/verify-otp` — Body: `{ "mobile_number": "...", "otp": "1234" }` — Verifies OTP and sets `serverpe_user_token` cookie on success.
- `GET /mockapis/serverpeuser/api-usage` — Requires `serverpe_user_token` cookie (JWT) — returns usage info for logged-in user.

Example: cURL — search trains
```bash
curl -X POST http://localhost:8888/search-trains \
  -H "Content-Type: application/json" \
  -d '{"source_code":"NDLS","destination_code":"BCT","doj":"2025-12-10"}'
```

Notes & Next Steps
- The OpenAPI spec is in `docs/openapi.yaml`. You can use Swagger UI or ReDoc to render it.
- If you want, I can generate a runnable Swagger UI route, wire it into `app.js`, or expand request/response schemas with exact database fields.
