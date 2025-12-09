# `dummyRouterPinCode` — API Reference

This document provides a focused, professional reference for the routes implemented in `src/routers/dummyRouterPinCode.js`. It includes request/response shapes, middleware behavior, database notes, rate-limiting, authentication expectations and example requests.

Base URL
- `http://localhost:8888`

Overview
- Router purpose: small mock API surface for pincodes and a lightweight ServerPe 'user' flow (OTP → API keys → protected pincode APIs).
- Reused DB pools: the router reuses `connectMainDB()` and `connectPinCodeDB()` pools created once at module load time.

Authentication & Security
- API Key endpoints: require two headers:
  - `x-api-key`: API key string
  - `x-secret-key`: Secret key string
  These are validated against the `serverpe_user` table by the `checkApiKey` middleware.
- Logged-in endpoints: cookie-based JWT: `serverpe_user_token` (set by `/verify-otp`). The `checkServerPeUser` middleware verifies the cookie with `process.env.SECRET_KEY`.
- Rate limiting: `rateLimitPerApiKey(3, 1000)` enforces a per-API-key limit of 3 requests per 1 second window for protected pincode endpoints.

Database / Connection Notes
- `poolMain` (MAIN DB) is accessed via `connectMainDB()` and used for user, OTP, API usage, and wallet operations.
- `poolPin` (PINCODE DB) is accessed via `connectPinCodeDB()` and used for pincode lookups.
- `getPostgreClient(pool)` returns a pooled `client` (remember to `release()` when finished; the router does this in `finally` blocks).

Common response format (existing patterns)
- Many helper functions/validators return an object like `{ statuscode, successstatus, message, data? }` and the router uses that to set the HTTP response code and JSON payload.

Endpoints

1) POST /mockapis/serverpeuser/api/pincode-details
- Purpose: return detailed rows for a single pincode.
- Middleware (in-order): `rateLimitPerApiKey(3,1000)`, `checkApiKey` — then handler calls `updateApiUsage`.
- Headers: `x-api-key`, `x-secret-key` (required)
- Request body:
  - JSON: { "pincode": "<6-digit pincode>" }
  - Validation performed by `validations/pincodes/validatePinCode.js` — returns 401 response if `pincode` missing.
- Behaviour:
  - `updateApiUsage(clientMain, req)` atomically deducts from free credits first then paid credits; if exhausted it returns `{ ok:false, message: 'API usage exhausted...' }` and the route responds with HTTP 429 and JSON `{ error: message }`.
  - on success, the handler queries `getDetailsFromPinCode(clientPin, pincode)` which runs `select * from pincodes where pincode=$1` and returns `rows`.
- Response (200):
  - `{ success: true, remaining_calls: <number>, data: <getDetailsFromPinCode result> }`
- Errors:
  - 401 if missing API/secret headers (via `checkApiKey`).
  - 429 if `updateApiUsage` indicates usage exhausted or rate-limited by `rateLimitPerApiKey`.

Example
```bash
curl -X POST 'http://localhost:8888/mockapis/serverpeuser/api/pincode-details' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: SPK_live_IN-XX_...' \
  -H 'x-secret-key: <secret>' \
  -d '{"pincode":"560001"}'
```

2) GET /mockapis/serverpeuser/api/pincodes
- Purpose: list all pincodes (single column `pincode` rows returned by `getAllPinCodes`).
- Middleware (in-order): `rateLimitPerApiKey(3,1000)`, `checkApiKey`.
- Headers: `x-api-key`, `x-secret-key` (required)
- Behaviour:
  - `updateApiUsage` is called to deduct usage credits and returns `remaining` count.
  - `getAllPinCodes(clientPin)` runs `select pincode from pincodes` and returns an array of rows `[{ pincode: '560001' }, ...]`.
- Response (200):
  - `{ success: true, remaining_calls: <number>, data: [ { pincode: '...' }, ... ] }`

Example
```bash
curl -X GET 'http://localhost:8888/mockapis/serverpeuser/api/pincodes' \
  -H 'x-api-key: SPK_live_IN-XX_...' \
  -H 'x-secret-key: <secret>'
```

3) POST /mockapis/serverpeuser/send-otp
- Purpose: register/send OTP for a mobile number and create user row if not exists.
- Request body (validator `validateSendOtp` requires all these fields):
  - `mobile_number` (string) — must match regex `/^[6-9]\d{9}$/`.
  - `user_name` (string)
  - `stateid` (string or id) — used to insert user row if new.
- Behaviour:
  - `validateSendOtp` returns 401 on missing/invalid fields.
  - `insertotpentry(clientMain, req.body, result_otp)` inserts/maintains user and stores OTP with expiry `NOW() + INTERVAL '3 minutes'`.
  - NOTE: OTP is currently hard-coded to `1234` in the router (`const result_otp = "1234"`). Replace this with `generateOtp()` for production SMS.
- Response:
  - uses object returned by `insertotpentry`, e.g. `{ statuscode: 200, successstatus: true, message: 'OTP sent successfully.' }` with that status code.

Example
```bash
curl -X POST 'http://localhost:8888/mockapis/serverpeuser/send-otp' \
  -H 'Content-Type: application/json' \
  -d '{"mobile_number":"9876543210","user_name":"Alice","stateid":1}'
```

4) POST /mockapis/serverpeuser/verify-otp
- Purpose: verify OTP for a mobile number; on success generate API keys (if not present) and set cookie `serverpe_user_token` for the user.
- Request body (validator `validateverifyOtp` requires):
  - `mobile_number` (string)
  - `otp` (string)
- Behaviour:
  - `validateotp(clientMain, mobile_number, otp)`:
    - deletes expired otps, checks `serverpe_otpstore` for matching entry
    - if match: deletes the otp row, finds or creates API key & secret for user via `generateapikey` and `generateSecretKey`, seeds free wallet/credit rows, and returns `{ statuscode: 200, successstatus: true, message: 'Otp verified success fully!', data: { api_key, secret_key } }`.
  - On verification success the router sets cookie `serverpe_user_token` to the token returned by `generateToken(mobile_number)` with options: `httpOnly: true`, `secure: false`, `sameSite: 'lax'`, `maxAge: 10 * 60 * 1000` (10 minutes).
- Response:
  - The router responds with the `validateotp` result status code and JSON body.

Example
```bash
curl -X POST 'http://localhost:8888/mockapis/serverpeuser/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{"mobile_number":"9876543210","otp":"1234"}' \
  -i   # inspect Set-Cookie header on success
```

5) GET /mockapis/serverpeuser/api-usage
- Purpose: quick endpoint to check API usage for the logged-in serverpe user.
- Middleware: `checkServerPeUser` — requires cookie `serverpe_user_token`.
- Request: include cookie from `/verify-otp` response; cookie is a JWT signed with `process.env.SECRET_KEY`.
- Response: `{ status: 'ok', message: 'inside user' }` (placeholder — expand to return wallet/usage info).

Errors and Status Codes
- 401 Unauthorized: Missing/invalid API keys or cookie, missing required fields during validation.
- 429 Too Many Requests: Rate limiting by `rateLimitPerApiKey` or usage exhausted (updateApiUsage returns an `ok:false` message).
- 500 Internal Server Error: DB or unexpected runtime failures.

Developer Notes & Recommendations
- Cookie security: set `secure: true` when deploying over HTTPS. Consider setting an `expires`/`iat`/`exp` claim in the JWT payload and signing an object (e.g. `{ sub: mobile_number, iat, exp }`) rather than signing a raw string.
- Standardize response format (consistent keys and HTTP status codes). Convert the internal `{ statuscode, successstatus, message, data }` into a shared schema and always return consistent key names.
- Replace the OTP stub (`1234`) with `generateOtp()` and integrate with an SMS provider. Ensure OTP and SMS sending are robust and retry-safe.
- Expand `/api-usage` to return wallet counts and next reset information using `serverpe_user_apikeywallet` table.
- Add OpenAPI request/response schemas for each endpoint and wire into `docs/openapi.yaml` to improve machine-readability.

Appendix: Key helper behaviours discovered in nested files
- `validateSendOtp` — ensures `mobile_number`, `user_name`, `stateid` present and mobile matches `/^[6-9]\d{9}$/`.
- `insertotpentry` — inserts user if not exists; inserts `serverpe_otpstore` with expiry `NOW() + 3 minutes`.
- `validateotp` — verifies OTP, generates API key/secret if needed, seeds wallet rows.
- `updateApiUsage` — atomic wallet deduction: uses free credits first, then paid credits; inserts non-blocking API history record. Returns `{ ok:true, remaining, userId }` or `{ ok:false, message }`.
- `rateLimitPerApiKey` — in-memory Map per API key with sliding 1-second window; default limit 3.

If you want, I can:
- generate a machine-readable OpenAPI snippet for these endpoints and add it to `docs/openapi.yaml`, or
- integrate Swagger UI into `src/app.js` to serve docs at `/docs`.

File created from code review of `src/routers/dummyRouterPinCode.js` and its nested modules on Dec 05, 2025.
