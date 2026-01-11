# User Manual - QuickSmart Mock Train Reservation

Welcome to the **QuickSmart** portal! This manual provides a step-by-step guide on how to use the system for booking mock train tickets.

## 🚂 Getting Started
1. Open your browser and go to `http://localhost:3001`.
2. You will see the **Landing Page** with the heroic slogan: *"Your Seat Pakka with Affordable Fake Rokka!"*

---

## 🔍 Public Features (No Login Required)

### Search Trains
- Click on **"Search Trains"** in the Navbar.
- Select your **Source** and **Destination** stations.
- Pick a **Date of Journey**.
- View the list of available trains and their seat status.

### Check PNR Status
- Click on **"PNR Status"**.
- Enter your 10-digit mock PNR number to see current booking details and passenger status.

### Live Tracking
- Use **"Live Train Status"** to track a train's current location.
- Use **"Live Station"** to see all trains arriving or departing from a particular station in the next few hours.

---

## 🎟️ Booking Process (Login Required)

### 1. Login
- Click **Login** on the Navbar.
- Enter your **Email Address**.
- You will receive a 4-digit OTP. (In this mock system, check the **Backend Console Logs** to see the OTP).
- Enter the OTP to access your Dashboard.

### 2. Dashboard
- Your personal dashboard shows your login status and provides quick links to all features.
- A sidebar helps you navigate easily between booking, history, and tracking.

### 3. Booking a Ticket
- Navigate to **"Book Ticket"**.
- **Step 1 (Search)**: Find your train.
- **Step 2 (Select)**: Click on your preferred train.
- **Step 3 (Passengers)**: 
  - Choose Coach (SL, 3A, etc.) and Reservation Type (General, Ladies).
  - Add up to 6 passengers.
  - Enter mobile number.
- **Step 4 (Confirm)**: Review the total fare and click **"Confirm & Book"**.
- **Result**: You will receive a unique PNR number.

### 4. Cancellation
- To cancel, go to **"Cancel Ticket"**.
- Enter your PNR.
- Select specific passengers you wish to cancel.
- Click **"Cancel Selected"**.

---

## 📋 Booking History
- View all your past and upcoming bookings in the **"Booking History"** section.
- You can click on any PNR to view its full status.

---

> [!IMPORTANT]
> This is a **MOCK** system for educational and training purposes. No real money is charged, and no actual travel tickets are issued.
