const sendMockTrainTicketMailTemplate = ({
  pnr = "XXXXXXXXXX",
  train_number = "12345",
  train_name = "Express Train",
  source_station = "Source",
  destination_station = "Destination",
  journey_date = "DD-MM-YYYY",
  departure_time = "00:00",
  arrival_time = "00:00",
  coach_type = "SL",
  booking_status = "CONFIRMED",
  passengers = [],
  total_fare = 0,
  contact_email = "",
  contact_mobile = "",
  booking_date = new Date().toLocaleDateString("en-IN"),
}) => {
  // Generate passenger rows
  const passengerRows = passengers
    .map(
      (p, index) => `
      <tr style="background: ${index % 2 === 0 ? "#f8f9fa" : "#ffffff"};">
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${
          index + 1
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef; font-weight: bold;">${
          p.name || p.passenger_name || "Passenger"
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${
          p.age || p.passenger_age || "-"
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${
          (p.gender || p.passenger_gender) === "M"
            ? "Male"
            : (p.gender || p.passenger_gender) === "F"
            ? "Female"
            : "Other"
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${
          p.seat_number || p.updated_seat_status || "---"
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">
          <span style="background: ${
            (p.status || "CNF").includes("CNF") ? "#d4edda" : "#fff3cd"
          }; color: ${
        (p.status || "CNF").includes("CNF") ? "#155724" : "#856404"
      }; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
            ${p.status || p.updated_seat_status || "CNF"}
          </span>
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Train Ticket Confirmation - PNR: ${pnr}</title>
</head>
<body style="margin:0; padding:0; background:#f6f8fa; font-family:Arial, Helvetica, sans-serif;">

  <div style="max-width:650px; margin:30px auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); position: relative;">

    <!-- WATERMARK -->
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 60px; font-weight: bold; color: rgba(220, 38, 38, 0.08); white-space: nowrap; pointer-events: none; z-index: 1; letter-spacing: 5px;">
      DEMO PURPOSE ONLY
    </div>

    <!-- HEADER -->
    <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 25px; text-align: center; position: relative; z-index: 2;">
      <img
        src="cid:serverpe-logo"
        alt="QuickSmart Railways"
        style="max-width:140px; margin-bottom: 10px;"
      />
      <h1 style="color:#ffffff; margin:10px 0 5px 0; font-size: 22px;">
        🎫 Train Ticket Confirmed!
      </h1>
      <p style="color:#94a3b8; margin:0; font-size: 14px;">
        Electronic Reservation Slip (ERS)
      </p>
      <!-- DEMO BADGE -->
      <div style="background: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-top: 10px; font-size: 11px; font-weight: bold; letter-spacing: 1px;">
        ⚠️ DEMO PURPOSE ONLY
      </div>
    </div>

    <!-- CONTENT -->
    <div style="padding: 25px; position: relative; z-index: 2;">

      <!-- PNR & STATUS -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="background:#f1f5f9; padding: 15px 20px; border-radius: 8px; flex: 1; margin-right: 10px;">
          <p style="color:#64748b; margin:0; font-size: 12px;">PNR NUMBER</p>
          <p style="color:#1a365d; margin:5px 0 0 0; font-size: 22px; font-weight: bold; letter-spacing: 2px;">${pnr}</p>
        </div>
        <div style="background:#f1f5f9; padding: 15px 20px; border-radius: 8px; text-align: center;">
          <p style="color:#64748b; margin:0; font-size: 12px;">STATUS</p>
          <span style="display: inline-block; margin-top: 5px; background: ${
            booking_status === "CANCELLED"
              ? "#dc2626"
              : booking_status === "WAITLIST"
              ? "#d97706"
              : "#059669"
          }; color: #ffffff; padding: 6px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;">
            ${booking_status}
          </span>
        </div>
      </div>


      <!-- TRAIN INFO -->
      <div style="background:#1a365d; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color:#ffffff; margin:0; font-size: 16px; font-weight: bold;">
          🚂 ${train_number} - ${train_name}
        </p>
        <p style="color:#94a3b8; margin:5px 0 0 0; font-size: 13px;">
          Class: <strong style="color:#60a5fa;">${coach_type}</strong> | Journey Date: <strong style="color:#60a5fa;">${journey_date}</strong>
        </p>
      </div>

      <!-- JOURNEY DETAILS -->
      <div style="background:#f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="40%" style="vertical-align: top;">
              <p style="color:#64748b; margin:0; font-size: 11px;">FROM</p>
              <p style="color:#1f2937; margin:5px 0; font-size: 14px; font-weight: bold;">${source_station}</p>
              <p style="color:#1a365d; margin:0; font-size: 20px; font-weight: bold;">${departure_time}</p>
              <p style="color:#64748b; margin:0; font-size: 11px;">Departure</p>
            </td>
            <td width="20%" style="text-align: center; vertical-align: middle;">
              <div style="color:#2563eb; font-size: 24px;">→</div>
              <div style="background:#e2e8f0; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">
                <span style="color:#1a365d; font-size: 11px; font-weight: bold;">${journey_date}</span>
              </div>
            </td>
            <td width="40%" style="vertical-align: top; text-align: right;">
              <p style="color:#64748b; margin:0; font-size: 11px;">TO</p>
              <p style="color:#1f2937; margin:5px 0; font-size: 14px; font-weight: bold;">${destination_station}</p>
              <p style="color:#1a365d; margin:0; font-size: 20px; font-weight: bold;">${arrival_time}</p>
              <p style="color:#64748b; margin:0; font-size: 11px;">Arrival</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- PASSENGER DETAILS -->
      <h3 style="color:#1a365d; margin: 0 0 10px 0; font-size: 14px;">👥 PASSENGER DETAILS</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
        <thead>
          <tr style="background:#1a365d;">
            <th style="padding: 10px; color: #ffffff; font-size: 12px; text-align: left;">S.No</th>
            <th style="padding: 10px; color: #ffffff; font-size: 12px; text-align: left;">Name</th>
            <th style="padding: 10px; color: #ffffff; font-size: 12px; text-align: left;">Age</th>
            <th style="padding: 10px; color: #ffffff; font-size: 12px; text-align: left;">Gender</th>
            <th style="padding: 10px; color: #ffffff; font-size: 12px; text-align: left;">Seat/Berth</th>
            <th style="padding: 10px; color: #ffffff; font-size: 12px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${passengerRows}
        </tbody>
      </table>

      <!-- FARE SUMMARY -->
      <div style="background:#f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px;">
        <table width="100%">
          <tr>
            <td style="color:#166534; font-size: 14px;">💰 Total Fare Paid</td>
            <td style="text-align: right; color:#166534; font-size: 22px; font-weight: bold;">₹ ${total_fare.toLocaleString(
              "en-IN"
            )}</td>
          </tr>
        </table>
      </div>

      <!-- CONTACT INFO -->
      <div style="background:#f1f5f9; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px;">
        <table width="100%">
          <tr>
            <td style="color:#64748b; font-size: 12px;">
              📱 Mobile: <strong style="color:#1f2937;">${
                contact_mobile || "N/A"
              }</strong>
            </td>
            <td style="color:#64748b; font-size: 12px;">
              📧 Email: <strong style="color:#1f2937;">${
                contact_email || "N/A"
              }</strong>
            </td>
            <td style="color:#64748b; font-size: 12px; text-align: right;">
              📅 Booked: <strong style="color:#1f2937;">${booking_date}</strong>
            </td>
          </tr>
        </table>
      </div>

      <!-- MOCK DISCLAIMER -->
      <div style="
        background:#fff3cd;
        border:1px solid #ffecb5;
        padding:15px;
        border-radius:8px;
        margin-bottom: 20px;
        font-size:13px;
        color:#664d03;
      ">
        <strong>⚠️ DISCLAIMER - DEMO PURPOSE ONLY</strong><br /><br />
        This is a <strong>demonstration/mock ticket</strong> generated for <strong>educational and testing purposes only</strong>.
        <br /><br />
        <ul style="margin: 5px 0 0 0; padding-left: 20px;">
          <li>This ticket is <strong>NOT valid</strong> for actual railway travel.</li>
          <li>No real-time scenario is related to this ticket.</li>
          <li>No actual train booking has been made with Indian Railways or any other railway service.</li>
          <li>This is part of a mock/simulation project for learning purposes.</li>
        </ul>
      </div>

      <!-- ADDITIONAL DISCLAIMER BOX -->
      <div style="
        background:#fee2e2;
        border:1px solid #fecaca;
        padding:12px 15px;
        border-radius:8px;
        margin-bottom: 20px;
        font-size:12px;
        color:#991b1b;
        text-align: center;
      ">
        🚫 <strong>DO NOT USE THIS TICKET FOR ACTUAL TRAVEL</strong> 🚫<br />
        This is a simulated ticket for project demonstration only.
      </div>

      <!-- INSTRUCTIONS -->
      <div style="background:#f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
        <p style="color:#1a365d; margin: 0 0 10px 0; font-size: 13px; font-weight: bold;">📋 Important Instructions:</p>
        <ul style="color:#64748b; font-size: 12px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>This is a mock ticket for demo purposes only</li>
          <li>Mock SMS/Email will be sent on journey date as a reminder</li>
          <li>You can use this for project demonstrations</li>
        </ul>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="background:#1a365d; padding: 20px; text-align: center;">
      <p style="color:#94a3b8; margin:0; font-size: 12px;">
        QuickSmart Railways - Mock Train Reservation System
      </p>
      <p style="color:#64748b; margin:5px 0 0 0; font-size: 11px;">
        © ServerPe | This is a system-generated email. Please do not reply.
      </p>
    </div>

  </div>
</body>
</html>
  `;
};

// Function to get template with logo attachment
const getMockTrainTicketMailTemplateWithAttachment = (params) => {
  const path = require("path");

  const logoPath = path.join(
    __dirname,
    "..",
    "..",
    "images",
    "logos",
    "ServerPe_Logo.jpg"
  );

  return {
    html: sendMockTrainTicketMailTemplate(params),
    attachments: [
      {
        filename: "serverpe-logo.jpg",
        path: logoPath,
        cid: "serverpe-logo",
      },
    ],
  };
};

module.exports = sendMockTrainTicketMailTemplate;
module.exports.getMockTrainTicketMailTemplateWithAttachment =
  getMockTrainTicketMailTemplateWithAttachment;
