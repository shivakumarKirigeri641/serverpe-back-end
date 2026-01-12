# Mock Train Seat Reservation - UI Only

Professional React frontend for train ticket reservation. **Requires License Key.**

---

## 🔑 License Key Required

This UI connects to the ServerPE backend API and requires a valid license key.

### Setup License Key

1. Copy `.env.example` to `.env`
2. Replace `YOUR_LICENSE_KEY_HERE` with your key:
   ```
   REACT_APP_LICENSE_KEY=YOUR_ACTUAL_KEY
   ```

### Demo Key (for testing)
```
REACT_APP_LICENSE_KEY=DEMO_LICENSE_KEY_1234
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure license key
cp .env.example .env
# Edit .env and add your key

# Start application
npm start
```

Opens at: `http://localhost:3000`

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| Train Search | Find trains between stations |
| PNR Status | Check booking status |
| Train Schedule | View complete schedules |
| Live Status | Track running status |
| Book Ticket | Reserve seats (login required) |
| Cancel Ticket | Cancel bookings |

---

## 🔐 Authentication

1. Click "Login"
2. Enter email
3. Use OTP: `1234`
4. Access protected features

---

## 📁 Project Structure

```
mocktrainseatreservation_ui/
├── .env.example      # License key template
├── package.json
├── src/
│   ├── App.js        # Main with license check
│   ├── api/
│   │   └── apiClient.js  # API with license headers
│   ├── components/
│   │   ├── LicenseError.jsx
│   │   ├── ConnectionStatus.jsx
│   │   └── ...
│   └── pages/
│       └── (10 pages)
└── public/
```

---

## ⚠️ License Errors

| Error | Solution |
|-------|----------|
| No License Key | Add key to .env file |
| Invalid Key | Check key is correct |
| Expired Key | Renew at serverpe.in |

---

## 📞 Support

- Email: support@serverpe.in
- Website: https://serverpe.in

---

© 2024 ServerPE
