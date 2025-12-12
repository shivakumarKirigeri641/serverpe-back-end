# Bikespec Router — API Documentation

This document provides a professional, developer-ready API reference for the routes defined in `src/routers/bikespecrouter.js`. It includes each endpoint's purpose, HTTP method, required headers, request body schema, validation rules, typical success responses, possible error responses, and example requests. It is written for UI developers who need precise, stable contracts.

Base URL
- `http://localhost:8888`

Authentication & Rate Limits
- Protected endpoints require two headers:
  - `x-api-key`: API key (string)
  - `x-secret-key`: Secret key (string)
- `rateLimitPerApiKey(3, 1000)` applies to all routes in this router: max 3 requests per API key per 1000ms window. Missing API key returns 401. Excess requests receive 429.
- After validation, many endpoints call `updateApiUsage` (wallet-based), which atomically deducts free then paid credits. If usage exhausted it returns `{ ok:false, message }` and the route responds with HTTP 429 and JSON `{ error: message }`.

DB connections
- `poolMain`: main DB used for API usage checks/logging.
- `poolbikeSpecs`: bikespec DB used for vehicle/specs queries.

Common response envelope
- Most successful responses are JSON objects with these keys:
  - `success`: boolean
  - `remaining_calls`: integer (present when `updateApiUsage` is used)
  - `data`: object or array containing the business payload

Error patterns
- Validation functions return objects like `{ statuscode, successstatus, message }` and router forwards those via the HTTP status `statuscode` where applicable.
- 401: missing API keys
- 404 / 422: validation errors (see per-endpoint validation)
- 429: rate limit or wallet exhausted
- 500: internal server error

Endpoints

1) GET /mockapis/serverpeuser/api/bikespecs/bike-makes
- Purpose: Return a list of bike brands (makes) with optional logo URL if an image exists.
- Auth: `x-api-key` and `x-secret-key` (via `checkApiKey`) and rate-limited.
- Request body: none.
- Response (200): JSON `{ success: true, data: [ { brand: string, logo_path: string|null }, ... ] }`.
  - `logo_path` if `src/images/logos/original/<normalized>.png` exists, otherwise `null`.
  - Example:
    {
      "success": true,
      "data": [ { "brand": "Royal Enfield", "logo_path": "http://localhost:8888/images/logos/optimized/royal_enfield.png" }, ... ]
    }

Notes for UI:
- Sort order is alphabetical by brand.
- Logo URLs use `http://localhost:8888/images/logos/optimized/` (may be changed in production).

2) POST /mockapis/serverpeuser/api/bikespecs/bike-models
- Purpose: Return models for a given brand.
- Auth: `x-api-key`, `x-secret-key` and rate-limited. Usage deduction applied when models found.
- Request body (application/json):
  - `{ "brand": "<brand-name>" }` — required, non-empty string.
- Validation rules (from `validateForModels`):
  - `brand` must exist and not be empty.
  - On missing/invalid: responds with 404 or 422 and message.
- Success response (200): `{ success: true, remaining_calls: <int|undefined>, data: [ { model: string }, ... ] }`.
- Not found: SQL returns `statuscode: 204` object; router returns that as `data` with the same status code.

Example request
```bash
curl -X POST http://localhost:8888/mockapis/serverpeuser/api/bikespecs/bike-models \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: <API_KEY>' -H 'x-secret-key: <SECRET>' \
  -d '{"brand":"Yamaha"}'
```

3) POST /mockapis/serverpeuser/api/bikespecs/bike-type
- Purpose: Return bike types for a brand+model.
- Request body:
  - `{ "brand": "<brand>", "model": "<model>" }` — both required, non-empty strings.
- Validation (`validateForBikeType`): returns 404 if fields missing, 422 if empty strings.
- Success response (200): `{ success: true, remaining_calls: <int|undefined>, data: [ { bike_type: string }, ... ] }`.

4) POST /mockapis/serverpeuser/api/bikespecs/bike-category
- Purpose: Return categories/grades for brand+model+bike_type.
- Request body:
  - `{ "brand":"<brand>", "model":"<model>", "bike_type":"<bike_type>" }` — required and non-empty.
- Validation: `validateForCategory` enforces presence and non-empty.
- Success response (200): `{ success: true, remaining_calls: <int|undefined>, data: [ { category: string }, ... ] }`.

5) POST /mockapis/serverpeuser/api/bikespecs/bike-list
- Purpose: Return full vehicle rows that match brand/model/bike_type/category.
- Request body:
  - `{ "brand":"<brand>", "model":"<model>", "bike_type":"<bike_type>", "category":"<category>" }` — all required and non-empty.
- Validation: `validateForBikeList` enforces required fields and non-empty strings.
- Success response (200): `{ success: true, remaining_calls: <int|undefined>, data: [ <vehicle_row>, ... ] }` where `vehicle_row` is a row from `vehicle_information` table.
  - Typical fields returned from DB (example keys): `id`, `brand`, `model`, `bike_type`, `category`, `year_of_manufacture`, `engine_cc`, `power`, `torque`, `transmission`, `fuel_type`, `mileage`, etc. (The exact schema is the DB's `vehicle_information` table.)

UI guidance:
- The router returns full rows — use fields like `id`, `brand`, `model`, `year_of_manufacture`, and `logo` (if present in `searchBikes`) to present lists. Consider limiting the fields in the backend or mapping into a smaller DTO if the UI only needs a subset.

6) POST /mockapis/serverpeuser/api/bikespecs/bike-specs
- Purpose: Return structured specs for a single vehicle id.
- Request body:
  - `{ "id": <numeric> }` — required and must be numeric (validated by `validateForBikeSpecs` which uses `isNumeric`).
- Validation errors:
  - 404 if missing, 422 if not numeric.
- Success response (200): `{ success: true, remaining_calls: <int|undefined>, data: <specs_json> }`.
  - `getBikeSpecs` queries spec tables and returns a nested JSON produced by `convertQuerySpecToJson` (category → headers → values). Example structure:
    {
      "Engine": [{ "header_name": "Displacement", "value": "249 cc" }, ...],
      "Dimensions": [{ "header_name": "Length", "value": "2110 mm" }, ...]
    }

7) POST /mockapis/serverpeuser/api/bikespecs/search-bikes
- Purpose: Full text search over vehicle attributes with pagination.
- Request body:
  - `{ "query": "<search text>", "limit": <number>, "skip": <number> }` — `query` required and non-empty, `limit` and `skip` must be numeric (validated by `validateForSearchbikes`).
- Behaviour:
  - Query uses ILIKE on brand, model, bike_type, category, year_of_manufacture and returns matching `vehicle_information` rows with an added `logo` field (if logo file exists).
  - Default `limit` is 20, default `skip` is 0 (router code applies defaults before calling search function).
- Success response (200): `{ success: true, remaining_calls: <int|undefined>, data: [ <vehicle_row_with_logo>, ... ] }`.

Pagination & Performance Notes
- Use `limit` and `skip` to page results. The DB query uses OFFSET which can be slow for large offsets; consider implementing cursor-based pagination for production.

Examples
- Search bikes (POST):
```bash
curl -X POST http://localhost:8888/mockapis/serverpeuser/api/bikespecs/search-bikes \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: <API_KEY>' -H 'x-secret-key: <SECRET>' \
  -d '{"query":"royal","limit":10,"skip":0}'
```

Error responses and their meaning
- 404 — missing request body or required parameter (validation layer).
- 422 — invalid parameter (e.g., empty string for required field, non-numeric id).
- 204 — the SQL helper returns a 204-like object `{ statuscode: 204, successstatus:false, message: '...' }` when no rows found; the router returns this as `data` together with status code if present.
- 401 — missing API or secret header (in `rateLimitPerApiKey` or `checkApiKey`).
- 429 — rate limit exceeded or API usage exhausted (returned from `updateApiUsage`).

Integration hints for UI developers
- When calling protected endpoints, include both `x-api-key` and `x-secret-key` headers.
- Expect `remaining_calls` to be included for POST endpoints that modify API usage. Show a usage indicator on the UI if useful.
- Always handle 204/empty-results gracefully — the router sometimes returns a 204-style object in `data`.
- For the specs endpoint, the nested spec JSON is category-first, so iterate categories then headers to render grouped specifications.

Next steps I can take (pick one):
- Add machine-readable OpenAPI schemas for these endpoints to `docs/openapi.yaml`.
- Add small response DTO mappers to reduce payload size for UI consumption.
- Add example JSON responses as fixtures under `docs/examples/bikespecs/`.

File generated by code analysis of `src/routers/bikespecrouter.js` and referenced modules on Dec 10, 2025.
