# Quicksmart Train Reservation - Backend Viva Document

## 📚 Viva Questions and Answers

---

### **Section 1: Project Overview**

#### Q1: What is the purpose of this project?
**Answer:** This is a Quicksmart Mock Train Reservation System backend that serves as a middleware layer between the student frontend (React) and the actual ServerPE backend. It provides API key authentication, OTP-based user verification, and proxies train-related requests to the main backend.

#### Q2: What are the main technologies used?
**Answer:**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **HTTP Client:** Axios
- **Authentication:** JSON Web Tokens (JWT)
- **Logging:** Winston
- **Security:** Helmet, CORS, express-rate-limit
- **Testing:** Jest, Supertest

#### Q3: Explain the layered architecture of this project.
**Answer:** The project follows a 3-layer architecture:
1. **Router Layer:** Handles HTTP requests, validates input, and formats responses
2. **Service Layer:** Contains business logic and data transformation
3. **Repository Layer:** Communicates with external APIs (ServerPE backend)

This separation ensures:
- Single Responsibility Principle
- Easy testing (each layer can be mocked)
- Maintainability and scalability

---

### **Section 2: Authentication**

#### Q4: How does the authentication work in this system?
**Answer:** The system uses a two-factor authentication approach:

1. **API Key Authentication:**
   - Every request must include a valid API key (X-API-Key header)
   - API keys are validated against a hardcoded list
   - Keys have permissions (read/write) and expiry dates

2. **OTP-based User Authentication:**
   - User requests OTP via email
   - System generates and stores OTP (in-memory)
   - User verifies OTP
   - System issues JWT token stored in HttpOnly cookie
   - Subsequent requests use the cookie for authentication

#### Q5: Why use HttpOnly cookies for JWT instead of localStorage?
**Answer:** HttpOnly cookies provide better security because:
- They cannot be accessed via JavaScript, preventing XSS attacks
- Automatically sent with requests, no manual token management
- Cookie settings (SameSite, Secure) prevent CSRF attacks
- Token is not exposed in browser developer tools

#### Q6: What is the JWT token expiry and why?
**Answer:** The JWT token expires in 7 days. This is a balance between:
- User convenience (not requiring frequent re-authentication)
- Security (limiting exposure if token is compromised)
- Session management (aligned with typical user behavior)

---

### **Section 3: API Design**

#### Q7: What is the standard response format?
**Answer:**
```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "mock_data": true,
  "status": "Success" | "Failed",
  "successstatus": true | false,
  "message": "Description",
  "data": { ... },
  "timestamp": "ISO-8601 date"
}
```

#### Q8: How do you handle validation errors?
**Answer:** Validation is done at multiple levels:
1. **Request level:** Using custom validators in router
2. **Service level:** Business logic validation
3. **Response:** Using `sendValidationError()` with structured error array

Example validation:
```javascript
if (!isValidEmail(email)) {
  return sendError(res, 400, 'Invalid email format');
}
```

#### Q9: Explain the rate limiting implementation.
**Answer:** Rate limiting is implemented using `express-rate-limit`:
- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Response:** 429 Too Many Requests
- **Headers:** Standard rate limit headers included

This prevents:
- DDoS attacks
- API abuse
- Resource exhaustion

---

### **Section 4: Error Handling**

#### Q10: What custom error classes are implemented?
**Answer:**
| Error Class | Status Code | Use Case |
|------------|-------------|----------|
| ValidationError | 400 | Invalid input |
| AuthenticationError | 401 | Missing credentials |
| AuthorizationError | 403 | Access denied |
| NotFoundError | 404 | Resource not found |
| ConflictError | 409 | Duplicate resource |
| RateLimitError | 429 | Too many requests |
| ExternalServiceError | 503 | API failure |

#### Q11: How does global error handling work?
**Answer:** The `errorHandler` middleware catches all errors:
1. Logs error details using Winston
2. Identifies error type (operational vs programmer)
3. Returns appropriate status code and message
4. Hides sensitive details in production

```javascript
app.use(errorHandler);
```

---

### **Section 5: Code Quality**

#### Q12: How is logging implemented?
**Answer:** Using Winston logger with:
- **Console transport:** Colored output for development
- **File transport:** Persistent logs for production
- **Log levels:** error, warn, info, http, debug
- **Format:** Timestamp, level, message, metadata

#### Q13: What testing strategies are used?
**Answer:**
1. **Unit Tests:** Test individual functions in isolation
   - Validators, OTP helper, response formatters
   
2. **E2E Tests:** Test complete request-response cycles
   - Authentication flow, train endpoints, booking flow
   
3. **Mocking:** Axios calls mocked to avoid external dependencies

#### Q14: Explain the environment configuration approach.
**Answer:** Using `.env` files with centralized config:
```javascript
const config = require('./config');
config.server.port       // 4000
config.api.demoApiKey   // API key
config.jwt.secret       // JWT secret
```

Benefits:
- Environment-specific settings
- Single source of truth
- No hardcoded values in code

---

### **Section 6: Security**

#### Q15: What security measures are implemented?
**Answer:**
1. **Helmet:** HTTP security headers
2. **CORS:** Controlled cross-origin access
3. **Rate Limiting:** Request throttling
4. **Input Validation:** Sanitization of all inputs
5. **HttpOnly Cookies:** Secure token storage
6. **API Key Validation:** Access control

#### Q16: How do you prevent SQL injection?
**Answer:** This backend doesn't directly connect to databases. It:
- Validates and sanitizes all input
- Uses parameterized queries in ServerPE backend
- Never concatenates user input into queries

#### Q17: How is the API key stored and validated?
**Answer:**
- Keys are hardcoded in `config/apiKeys.js` (demo purposes)
- Production would use encrypted database storage
- Validation checks:
  - Key exists and matches
  - Key is active
  - Key not expired
  - Key has required permissions

---

### **Section 7: Practical Scenarios**

#### Q18: Walk through a complete booking flow.
**Answer:**
1. User fetches master data (stations, coach types)
2. User searches trains (source, destination, date)
3. User selects train and adds passengers
4. System calculates fare
5. User authenticates via OTP
6. User submits booking with JWT cookie
7. System validates and forwards to ServerPE
8. PNR is returned to user

#### Q19: What happens if ServerPE backend is down?
**Answer:**
1. Repository layer catches the Axios error
2. `ExternalServiceError` is thrown (503)
3. Error handler logs the issue
4. User receives friendly error message:
   ```json
   {
     "status": "Failed",
     "message": "External service unavailable"
   }
   ```

#### Q20: How would you add a new endpoint?
**Answer:**
1. Create route in appropriate router file
2. Add middleware (checkApiKey, checkAuth if needed)
3. Create service method for business logic
4. Create repository method for API call (if needed)
5. Add validation for inputs
6. Add unit and e2e tests
7. Update documentation

---

### **Section 8: Advanced Questions**

#### Q21: How would you scale this application?
**Answer:**
1. **Horizontal Scaling:** Multiple instances behind load balancer
2. **Caching:** Redis for OTP storage and session data
3. **Database:** Move API keys to database
4. **Containerization:** Docker for consistent deployment
5. **Monitoring:** PM2, New Relic, or similar

#### Q22: What improvements would you suggest?
**Answer:**
1. Redis for OTP storage (persistence across restarts)
2. Request validation using express-validator middleware
3. API versioning (v1, v2)
4. OpenAPI/Swagger documentation
5. Request ID tracking for debugging
6. Circuit breaker for external API calls

#### Q23: Explain the difference between synchronous and asynchronous middleware.
**Answer:**
- **Synchronous:** Executes immediately, calls `next()` directly
  ```javascript
  app.use((req, res, next) => {
    req.timestamp = Date.now();
    next();
  });
  ```

- **Asynchronous:** Uses async/await, requires error handling
  ```javascript
  app.use(async (req, res, next) => {
    try {
      await validateToken(req);
      next();
    } catch (error) {
      next(error);
    }
  });
  ```

---

### **Section 9: Quick Reference**

#### Key Files:
| File | Purpose |
|------|---------|
| `src/app.js` | Application entry point |
| `src/config/index.js` | Configuration management |
| `src/middleware/checkApiKey.js` | API key validation |
| `src/middleware/checkAuth.js` | JWT authentication |
| `src/services/trainService.js` | Train business logic |
| `src/repositories/trainRepository.js` | External API calls |

#### Key Commands:
```bash
npm start        # Start production server
npm run dev      # Start development server
npm test         # Run all tests
npm run test:e2e # Run e2e tests only
```

#### Key Environment Variables:
```
PORT=4000
DEMO_API_KEY=QS_DEMO_API_KEY_2026_STUDENT_TRAIN
JWT_SECRET=your_secret_key
SERVERPE_BASE_URL=http://localhost:3000
```

---

**Good luck with your viva! 🎓**

---

**Version:** 1.0.0  
**Last Updated:** January 15, 2026
