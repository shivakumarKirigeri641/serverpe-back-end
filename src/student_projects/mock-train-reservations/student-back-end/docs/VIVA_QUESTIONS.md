# Backend Viva Questions & Answers

## 🎯 Project Overview Questions

### Q1: What is the purpose of this project?
**Answer:** This is a Quicksmart Mock Train Reservation System designed as an educational backend API. It replicates the functionality of Indian Railways IRCTC booking system with features like train search, fare calculation, ticket booking, PNR status checking, and booking management. The system uses API key authentication and OTP-based user authentication.

### Q2: What is the architecture pattern used?
**Answer:** The project follows a **Layered Architecture** pattern:
- **Router Layer**: Handles HTTP requests and routes
- **Middleware Layer**: Authentication, validation, logging
- **Service Layer**: Business logic
- **Repository Layer**: Data access and external API calls
- **Utility Layer**: Helper functions and common utilities

This separation of concerns makes the code maintainable, testable, and scalable.

### Q3: Why do you have a separate repository layer when you're not using a database?
**Answer:** The repository layer provides an abstraction for data access. Even though we're calling an external API (serverpe-back-end) instead of a database, the repository pattern:
- Abstracts the data source (can be switched from API to DB without changing service layer)
- Centralizes external API calls
- Makes testing easier with mocking
- Follows SOLID principles (Dependency Inversion)

---

## 🔐 Authentication & Security

### Q4: Explain the authentication flow in your system.
**Answer:** We use a two-step OTP-based authentication:
1. **Send OTP**: User requests OTP for their email. System generates a 4-digit OTP and stores it in memory with 10-minute expiry
2. **Verify OTP**: User submits the OTP. System validates and generates a JWT token
3. **Session Management**: JWT is stored in an HTTP-only cookie for 7 days
4. **Protected Routes**: Middleware validates the JWT for authenticated endpoints

This is more secure than password-based auth for demo purposes.

### Q5: What is the difference between API Key authentication and JWT authentication?
**Answer:**
- **API Key**: Identifies the application/client making the request. All endpoints require this. Think of it as "which app is calling us"
- **JWT**: Identifies the user within that application. Only protected endpoints require this. Think of it as "which user is logged in"

Example: Mobile app uses API key (identifies the app), and each user login gets a JWT (identifies the user).

### Q6: How do you store the OTP? Is it secure?
**Answer:** Currently, OTPs are stored in-memory using a JavaScript Map for demo purposes. In production, we would:
- Use Redis for distributed caching
- Hash the OTP before storing
- Implement rate limiting on OTP requests
- Add IP-based restrictions
- Use secure email service for OTP delivery

### Q7: What security measures have you implemented?
**Answer:**
1. **Helmet**: Sets secure HTTP headers
2. **CORS**: Restricts cross-origin requests
3. **Rate Limiting**: 100 requests per 15 minutes
4. **JWT with HttpOnly Cookies**: Prevents XSS attacks
5. **Input Validation**: Sanitizes all inputs
6. **API Key Validation**: Every request needs valid API key
7. **Error Sanitization**: No sensitive data in error responses

---

## 🏗️ Code Structure & Design

### Q8: Why did you separate routers, services, and repositories?
**Answer:** This follows the **Separation of Concerns** principle:
- **Routers**: Handle HTTP concerns (request parsing, response formatting)
- **Services**: Handle business logic (fare calculation, booking validation)
- **Repositories**: Handle data access (API calls, data fetching)

**Benefits:**
- Each layer has a single responsibility
- Easy to test (can mock each layer)
- Easy to modify (change DB without touching business logic)
- Code reusability

### Q9: Explain the middleware chain in your application.
**Answer:**
```
Request → Helmet → CORS → Rate Limiter → JSON Parser 
→ Cookie Parser → Request Logger → Route Matching 
→ API Key Check → Auth Check (if protected) 
→ Route Handler → Response
```

If any middleware fails, the request is rejected immediately. Each middleware has a specific purpose and can be added/removed independently.

### Q10: How do you handle errors in your application?
**Answer:** We have a centralized error handling strategy:
1. **Custom Error Classes**: ValidationError, AuthenticationError, etc.
2. **Try-Catch in Async Handlers**: All async routes wrapped with asyncHandler
3. **Global Error Handler**: Catches all errors
4. **Error Logging**: Winston logs all errors
5. **Standardized Response**: Same format for all errors
6. **Environment-specific Details**: Stack traces only in development

---

## 🧪 Testing

### Q11: What types of tests have you written?
**Answer:**
1. **Unit Tests**: Test individual functions (validators, helpers, utilities)
2. **Integration Tests (E2E)**: Test complete request/response cycles
3. **Coverage**: Aim for 70%+ code coverage

**Tools Used:**
- Jest: Testing framework
- Supertest: HTTP assertions
- Mock: Axios mocking for external API calls

### Q12: How do you mock external API calls in tests?
**Answer:** We use Jest's mock functionality:
```javascript
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
}));
```

This allows us to:
- Test without actually calling serverpe API
- Control response data
- Test error scenarios
- Run tests faster

### Q13: Why is testing important for this project?
**Answer:**
- **Confidence**: Ensures code works as expected
- **Regression Prevention**: New changes don't break existing features
- **Documentation**: Tests document how code should behave
- **Refactoring Safety**: Can refactor with confidence
- **Quality Assurance**: Catches bugs before production

---

## 📡 API Design

### Q14: Why do you use REST API instead of GraphQL?
**Answer:** REST is more suitable for this project because:
- Simpler to implement and understand
- Well-defined endpoints for each operation
- Better caching with HTTP headers
- Standard HTTP methods (GET, POST)
- Frontend team is familiar with REST
- Matches the serverpe backend API structure

### Q15: Explain your API response structure.
**Answer:**
```json
{
  "poweredby": "quicksmart-student.serverpe.in",
  "mock_data": true,
  "status": "Success/Failed",
  "successstatus": true/false,
  "message": "Descriptive message",
  "data": { ... },
  "timestamp": "ISO timestamp"
}
```

**Benefits:**
- Consistent structure across all endpoints
- Easy for frontend to parse
- Clear success/failure indication
- Helpful messages for debugging

### Q16: How do you handle versioning in your API?
**Answer:** Currently using `/student/` prefix as the namespace. For versioning, we could:
- URL versioning: `/api/v1/student/train/search`
- Header versioning: `Accept: application/vnd.api.v1+json`
- Query parameter: `/student/train/search?version=1`

For this educational project, single version is sufficient.

---

## 🔄 Data Flow

### Q17: Explain the complete flow when a user searches for trains.
**Answer:**
1. Frontend sends GET request with source, destination, date
2. **Middleware**: Validates API key
3. **Router**: Validates query parameters
4. **Service**: Normalizes inputs, validates business rules
5. **Repository**: Calls serverpe API via Axios
6. **serverpe API**: Queries database, returns trains
7. **Repository**: Handles response/errors
8. **Service**: Transforms data if needed
9. **Router**: Formats response using sendSuccess()
10. **Response**: Sent to frontend

### Q18: How does the booking flow work with both API key and JWT?
**Answer:**
1. User must first authenticate (OTP flow) → Gets JWT cookie
2. To book ticket, frontend sends:
   - Header: X-API-Key (identifies the app)
   - Cookie: qs_train_token (identifies the user)
   - Body: Booking details
3. **Middleware checks**:
   - First: API key valid?
   - Second: JWT valid?
4. Only if both pass, booking proceeds
5. JWT token is forwarded to serverpe API to maintain user session

---

## 🛠️ Technology Choices

### Q19: Why did you choose Express.js?
**Answer:**
- **Lightweight**: Minimalist framework
- **Flexibility**: Choose your own structure
- **Ecosystem**: Large npm package ecosystem
- **Middleware**: Easy to add functionality
- **Performance**: Fast and efficient
- **Community**: Large community support
- **Learning**: Industry standard, good for learning

### Q20: Why Winston for logging instead of console.log?
**Answer:** Winston provides:
- **Log Levels**: error, warn, info, debug, http
- **Multiple Transports**: Console, File, Remote
- **Formatting**: Timestamps, colors, JSON
- **Performance**: Better performance than console.log
- **Production Ready**: Structured logging
- **File Rotation**: Automatic log file management

Console.log is okay for development, but Winston is necessary for production.

### Q21: Why use Axios instead of native fetch?
**Answer:**
- **Automatic JSON parsing**: Don't need res.json()
- **Interceptors**: Can add global request/response handling
- **Better error handling**: Clearer error objects
- **Request/Response transformation**: Middleware for axios
- **Timeout support**: Built-in
- **Node.js support**: Works in both browser and Node
- **Instance creation**: Can create configured instances

---

## 🔍 Validation & Error Handling

### Q22: How do you validate passenger data?
**Answer:**
```javascript
validatePassengers(passengers) {
  // Check 1: Is array and not empty
  // Check 2: Max 6 passengers
  // Check 3: Each passenger has:
  //   - Name (min 2 chars)
  //   - Age (0-120)
  //   - Gender (M/F/O)
  // Returns: { isValid, errors[] }
}
```

Validation happens in two places:
1. **Router level**: Using validator utilities
2. **Service level**: Business rule validation

### Q23: What's the difference between 400, 401, and 403 errors?
**Answer:**
- **400 Bad Request**: Client sent invalid data (missing fields, wrong format)
- **401 Unauthorized**: Authentication required or failed (no/invalid API key or JWT)
- **403 Forbidden**: Authenticated but not authorized (accessing other user's bookings)

Example:
- No API key → 401
- Invalid passenger age → 400
- Accessing someone else's booking history → 403

---

## 🚀 Deployment & Production

### Q24: How would you deploy this application?
**Answer:**
1. **Environment Setup**:
   - Set NODE_ENV=production
   - Secure JWT secret
   - Configure CORS for production domain
2. **Deployment Options**:
   - Heroku, AWS EC2, DigitalOcean
   - Docker container
   - PM2 for process management
3. **Production Changes**:
   - Use Redis for OTP storage
   - Add database for user management
   - Implement real email service
   - Add monitoring (New Relic, DataDog)
   - SSL/TLS certificates
   - Load balancer for scaling

### Q25: What improvements would you make for production?
**Answer:**
1. **Database**: Add PostgreSQL for user data
2. **Caching**: Redis for sessions and frequent queries
3. **Email Service**: SendGrid/AWS SES for OTP emails
4. **Rate Limiting**: Redis-based distributed rate limiting
5. **Monitoring**: Application performance monitoring
6. **Logging**: Centralized logging (ELK stack)
7. **CI/CD**: Automated testing and deployment
8. **Documentation**: Swagger/OpenAPI docs
9. **Health Checks**: Advanced health endpoints
10. **Scaling**: Horizontal scaling with load balancer

---

## 📊 Performance

### Q26: How do you optimize API performance?
**Answer:**
1. **Async/Await**: Non-blocking operations
2. **Connection Pooling**: Reuse HTTP connections
3. **Response Compression**: Gzip middleware
4. **Caching**: Cache frequently accessed data
5. **Pagination**: Limit data returned
6. **Database Indexing**: (if using DB)
7. **Lazy Loading**: Load data on demand
8. **Request Timeout**: Set timeouts on external calls

### Q27: How do you handle concurrent booking requests?
**Answer:** This is handled by the serverpe backend:
- **Database Transactions**: ACID properties
- **Row Locking**: Prevents double booking
- **Advisory Locks**: PostgreSQL advisory locks
- **Seat Allocation Function**: Atomic operations

Our student backend just forwards the request to serverpe which handles the concurrency.

---

## 🎓 Best Practices

### Q28: What coding best practices have you followed?
**Answer:**
1. **Naming Conventions**: Meaningful variable names
2. **DRY Principle**: Don't Repeat Yourself
3. **SOLID Principles**: Single Responsibility, etc.
4. **Error Handling**: Try-catch, custom errors
5. **Comments**: JSDoc documentation
6. **Code Organization**: Logical folder structure
7. **Environment Variables**: Configuration management
8. **Async/Await**: Modern JavaScript
9. **ES6+ Features**: Arrow functions, destructuring
10. **Linting**: Code style consistency

### Q29: How do you ensure code quality?
**Answer:**
1. **Testing**: Unit and integration tests
2. **Code Reviews**: (in team environment)
3. **Linting**: ESLint for code style
4. **Type Checking**: (could add TypeScript)
5. **Documentation**: README, JSDoc comments
6. **Version Control**: Git with meaningful commits
7. **Error Logging**: Winston for tracking issues

---

## 💡 Conceptual Questions

### Q30: What is middleware and why is it important?
**Answer:** Middleware is a function that has access to request, response, and next function in the request-response cycle.

**Importance:**
- **Modularity**: Add features without modifying route handlers
- **Reusability**: Use same middleware across routes
- **Separation of Concerns**: Authentication, logging, validation separated
- **Order Matters**: Execute in sequence
- **Error Handling**: Centralized error middleware

**Example:**
```javascript
app.use(middleware1);  // Runs first
app.use(middleware2);  // Runs second
app.get('/route', handler);  // Runs last
```

---

This comprehensive viva document covers architectural, technical, and conceptual aspects of the backend system. Use it for interview preparation and technical discussions.
