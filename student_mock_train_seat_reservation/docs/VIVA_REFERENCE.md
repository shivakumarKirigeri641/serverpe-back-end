# Student Viva & Reference Material

This document contains technical explanations and common questions related to the **Student Mock Train Reservation** project, useful for project submissions and viva voce.

## 🛠️ Technical Architecture

### 1. What is the architecture of this application?
The application follows a **Full-Stack Proxy Architecture**:
- **Frontend**: React.js with Tailwind CSS for a modern, responsive UI.
- **Student Backend**: A Node.js Express server that acts as a secure middleware/proxy.
- **Main API**: The ServerPE central API that handles the actual database logic.

### 2. Why use a Proxy Backend?
- **Security**: It hides the main API URL and only exposes necessary endpoints to the frontend.
- **License Management**: It handles the complexities of license header injection and device fingerprinting once, so the frontend doesn't have to.
- **Error Abstraction**: It transforms complex API errors into user-friendly messages for students.

### 3. How does the License Security work?
The backend implements **Device Fingerprinting**:
- It generates a unique SHA-256 hash based on system-specific identifiers.
- This fingerprint is persisted in a `.fingerprint` file.
- Both the `LICENSE_KEY` and `FINGERPRINT` are sent in headers for every request to the main API.
- The main API validates that the license is not being "leaked" or used on unauthorized machines.

---

## 💻 Code Breakdown

### 1. `AppError.js`
A custom error class that standardizes how errors are handled. It provides:
- `userMessage`: For the end-user (e.g., "Invalid OTP").
- `technicalMessage`: For the developer (e.g., "Axios error: Connection refused internally").

### 2. `apiClient.js`
A configured Axios instance that uses **Interceptors**:
- **Request Interceptor**: Injects license and fingerprint headers.
- **Response Interceptor**: Catches failed requests and transforms them into `AppError` objects.

### 3. `trainService.js`
The Business Logic layer. It contains 14 methods mapping to the `train.repo.js` on the main server, handling search, calculation, booking, and history.

---

## ❓ Frequently Asked Viva Questions

**Q: What is the purpose of `.env` file?**
A: It stores sensitive configuration like Port numbers, API URLs, and License Keys outside the code, making the app more secure and configurable.

**Q: Explain the flow of a Search Request.**
A: UI (Select Search) → Frontend API call → Student Backend Router → Student Train Service → Axios Client (Interceptors add License) → ServerPE API → Response returns back through the same chain.

**Q: How do you handle asynchronous operations in the backend?**
A: We use `async/await` syntax and a custom `asyncHandler` wrapper to catch errors automatically and pass them to the global Error Handler middleware.

**Q: What is the benefit of using Tailwind CSS here?**
A: Tailwind allows for rapid UI development using utility classes, providing a consistent design system (colors, spacing, shadows) without writing large CSS files.

---

## 📚 Key Learning Points
- REST API Integration
- Middleware implementation in Express.js
- State management in React (Context API)
- Form validation and multi-step UI flows
- Secure communication using Headers and Fingerprinting
