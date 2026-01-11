# Configuration & Installation Guide

Welcome to the QuickSmart Mock Train Reservation system! This guide will help you set up and run the application on your local machine.

## Prerequisites
- **Node.js**: Version 16.x or higher
- **NPM**: Version 8.x or higher
- **Internet Connection**: Required for license validation

---

## 1. Project Structure
The project is divided into two main folders:
- `student-back-end`: Node.js Express server (Proxy)
- `student-front-end`: Vite + React + Tailwind UI

---

## 2. Backend Setup

1. **Navigate to backend folder**:
   ```bash
   cd student-back-end
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Rename `.env.example` to `.env`.
   - Update the `LICENSE_KEY` with your valid ServerPE license.
   - (Optional) Adjust `PORT` (default: 7777).

4. **Start the Server**:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

---

## 3. Frontend Setup

1. **Navigate to frontend folder**:
   ```bash
   cd student-front-end
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the UI**:
   - Development mode: `npm run dev`
   - The UI will open at `http://localhost:3001`.

---

## 4. Key Configurations

### Ports
- **Backend API**: `7777`
- **Frontend UI**: `3001`

### License Validation
The backend automatically handles device fingerprinting. On first run, it generates a unique `.fingerprint` file in the root directory. **Do not share this file**, as it binds your license to this specific machine environment.

### Connection Indicators
The frontend includes a real-time connection status bar in the Navbar and Dashboard:
- **Green**: Both Backend and ServerPE API are connected.
- **Yellow**: Connection to ServerPE API is missing (check License/Internet).
- **Red**: Student Backend is offline.

---

## 5. Troubleshooting
- **License Error**: Ensure your license key is correct and not expired.
- **Port Conflict**: If port 7777 or 3001 is in use, change it in the respective config files.
- **Network Error**: Check if the Student Backend is running and CORS is correctly configured in `app.js`.
