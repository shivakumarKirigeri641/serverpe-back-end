# Disclaimer & Legal Information

## 📜 Educational Purpose
The **QuickSmart Mock Train Reservation** system is designed and provided **exclusively for educational and training purposes**. It is intended to help students, developers, and researchers understand full-stack development, API integration, and reservation system logic.

## 🚫 No Real Transactions
- **No Real Bookings**: Any ticket booked through this system is for demonstration only. It does not entitle the user to travel on any train or transportation network.
- **No Real Money**: fares displayed are "Fake Rokka." No actual payments are processed or required.
- **No Personal Data**: Do not enter sensitive personal information. Use mock data (random emails/numbers) for testing.

## ⚖️ Liability
- The developers (ServerPE Team) are not responsible for any misuse of this software.
- This software is provided "as is" without warranty of any kind, express or implied.
- Any resemblance to real trains, schedules, or commercial platforms is purely for creating a realistic simulation environment.

---

# Release Notes - v1.0.0

**Initial Release (January 2026)**

### Features
- **Student Backend Proxy**: Express.js server on Port 7777.
- **Modern UI**: React + Tailwind CSS dashboard on Port 3001.
- **Security**: SHA-256 Device Fingerprinting and License Validation.
- **Public Features**: Train Search, PNR Check, Schedule, Live Status, Live Station.
- **Auth Flow**: Secure Email + OTP login logic.
- **Booking Engine**: Multi-step booking flow with fare calculation.
- **Error Management**: Standardized `AppError` system for both layers.

### Performance
- Optimized Axios interceptors for low-latency header injection.
- Optimized CSS builds with Tailwind PostCSS.

---

# Invoice & Documentation Guide

### 📄 Invoices
For student project submissions requiring invoice components:
- The system generates a **Mock Invoice** upon successful booking.
- Displayed in the Dashboard under "Booking History."
- Users can view and "print" (save as PDF) the booking confirmation, which acts as a mock invoice.

### 📝 Project Logs
Students can use the **Backend Console Logs** to generate a log of transactions and API calls for their project reports.

### 🎥 Demo Recording
A recommended walkthrough of the app should include:
1. Landing Page presentation.
2. Searching for a train anonymously.
3. Login using OTP.
4. Completing a full booking.
5. Verifying the PNR status.
6. Showing the final "Booking History."
