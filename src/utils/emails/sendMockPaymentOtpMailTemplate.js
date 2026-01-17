const sendMockPaymentOtpMailTemplate = ({
  otp = "0000",
  expiryMinutes = 10,
}) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mock Payment OTP</title>
</head>
<body style="margin:0; padding:0; background:#f6f8fa; font-family:Arial, Helvetica, sans-serif;">

  <div style="max-width:600px; margin:30px auto; background:#ffffff; padding:24px; border-radius:8px;">

    <!-- LOGO -->
    <div style="text-align:center; margin-bottom:15px;">
      <img
        src="cid:serverpe-logo"
        alt="ServerPe"
        style="max-width:160px;"
      />
    </div>

    <!-- HEADER -->
    <h2 style="color:#0b5ed7; margin-bottom:5px;">
      Mock Payment Verification
    </h2>
    <p style="color:#555; margin-top:0;">
      One-Time Password (OTP) for Demo Transaction
    </p>

    <hr style="margin:20px 0;" />

    <!-- INTRO -->
    <p>Hello,</p>

    <p>
      We received a request to authorize a
      <strong>mock payment</strong> on
      <strong>QuickSmart Mock Train Reservation</strong>.
    </p>

    <p>
      Please use the following <strong>One-Time Password (OTP)</strong>
      to proceed with the <strong>demo payment flow</strong>.
    </p>

    <!-- OTP -->
    <div style="
      font-size:28px;
      font-weight:bold;
      letter-spacing:6px;
      background:#f1f3f5;
      padding:14px;
      text-align:center;
      border-radius:6px;
      margin:20px 0;
    ">
      ${otp}
    </div>

    <p>
      ⏱️ This OTP is valid for <strong>{{EXPIRY_MINUTES}} minutes</strong>.
    </p>

    <!-- MOCK DISCLAIMER -->
    <div style="
      background:#fff3cd;
      border:1px solid #ffecb5;
      padding:12px;
      border-radius:6px;
      margin:20px 0;
      font-size:14px;
      color:#664d03;
    ">
      <strong>🧪 Mock Payment Notice</strong><br /><br />
      This OTP is for a <strong>simulated / mock transaction</strong> only.
      <br />
      <strong>No real money will be debited</strong>.
    </div>

    <!-- SECURITY -->
    <p>
      If you did not initiate this request, please ignore this email.
      <br />
      <strong>Do not share this OTP with anyone.</strong>
    </p>

    <hr style="margin:20px 0;" />

    <!-- FOOTER -->
    <p style="font-size:12px; color:#666;">
      This is a system-generated email. Please do not reply.
      <br />
      © ServerPe / QuickSmart Mock Train Reservation
    </p>

  </div>
</body>
</html>


  `;
};

// Function to get template with logo attachment
const getSendOtpMailTemplateWithAttachment = (params) => {
  const path = require("path");
  const fs = require("fs");

  const logoPath = path.join(
    __dirname,
    "..",
    "..",
    "images",
    "logos",
    "ServerPe_Logo.jpg"
  );

  return {
    html: sendOtpMailTemplate(params),
    attachments: [
      {
        filename: "serverpe-logo.jpg",
        path: logoPath,
        cid: "serverpe-logo",
      },
    ],
  };
};

module.exports = sendMockPaymentOtpMailTemplate;
module.exports.getSendOtpMailTemplateWithAttachment =
  getSendOtpMailTemplateWithAttachment;
