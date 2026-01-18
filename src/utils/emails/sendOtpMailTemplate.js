const sendOtpMailTemplate = ({ result_otp_email, expiryMinutes = 10 }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - ServerPe</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f7fa;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        color: #ffffff;
        padding: 30px;
        text-align: center;
      }
      .logo-section {
        margin-bottom: 20px;
      }
      .logo-section img {
        height: 60px;
        width: auto;
        margin-bottom: 15px;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        letter-spacing: -0.5px;
      }
      .header-subtitle {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: #e0e7ff;
        font-weight: 500;
      }
      .content {
        padding: 40px 30px;
      }
      .intro-text {
        color: #475569;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 30px;
        text-align: center;
      }
      .intro-text strong {
        color: #1e293b;
      }
      /* OTP Display Section */
      .otp-container {
        background: linear-gradient(135deg, #f0f4ff 0%, #fef3c7 100%);
        border: 2px solid #4f46e5;
        border-radius: 12px;
        padding: 40px 30px;
        margin: 30px 0;
        text-align: center;
      }
      .otp-label {
        color: #4f46e5;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 15px;
      }
      .otp-code {
        font-size: 48px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #1e293b;
        font-family: 'Courier New', monospace;
        margin: 15px 0;
        word-break: break-all;
      }
      .otp-divider {
        height: 2px;
        background: linear-gradient(90deg, transparent, #4f46e5, transparent);
        margin: 20px 0;
      }
      .otp-expiry {
        color: #f59e0b;
        font-size: 13px;
        font-weight: 600;
        margin-top: 15px;
      }
      .otp-expiry-icon {
        font-size: 16px;
        margin-right: 5px;
      }
      /* Security Warning */
      .security-warning {
        background-color: #fee2e2;
        border-left: 4px solid #dc2626;
        border-radius: 6px;
        padding: 20px;
        margin: 30px 0;
      }
      .security-warning h3 {
        margin: 0 0 12px 0;
        color: #991b1b;
        font-size: 14px;
        font-weight: 700;
        display: flex;
        align-items: center;
      }
      .security-warning h3::before {
        content: "⚠";
        margin-right: 8px;
        font-size: 18px;
      }
      .security-warning ul {
        margin: 0;
        padding-left: 20px;
        color: #7f1d1d;
        font-size: 13px;
        line-height: 1.8;
      }
      .security-warning li {
        margin-bottom: 8px;
      }
      .security-warning strong {
        color: #991b1b;
      }
      /* Important Note */
      .important-note {
        background-color: #fef3c7;
        border-left: 4px solid #f59e0b;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
        font-size: 12px;
        color: #92400e;
        line-height: 1.6;
      }
      .important-note strong {
        color: #78350f;
      }
      /* Instructions */
      .instructions {
        background-color: #f0fdf4;
        border-left: 4px solid #10b981;
        border-radius: 6px;
        padding: 20px;
        margin: 30px 0;
      }
      .instructions h3 {
        margin: 0 0 15px 0;
        color: #047857;
        font-size: 14px;
        font-weight: 600;
      }
      .instructions ol {
        margin: 0;
        padding-left: 20px;
        color: #047857;
        font-size: 13px;
        line-height: 1.8;
      }
      .instructions li {
        margin-bottom: 10px;
      }
      /* Help Section */
      .help-section {
        background-color: #f8f9fa;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 20px;
        margin: 30px 0;
        text-align: center;
      }
      .help-section p {
        margin: 0 0 12px 0;
        color: #475569;
        font-size: 13px;
      }
      .help-section a {
        color: #4f46e5;
        text-decoration: none;
        font-weight: 600;
      }
      .help-section a:hover {
        text-decoration: underline;
      }
      /* Footer */
      .footer {
        background-color: #1e293b;
        color: #cbd5e1;
        padding: 40px 30px;
        text-align: center;
        font-size: 12px;
      }
      .footer-company-info {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #334155;
      }
      .footer-company-name {
        color: #f1f5f9;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 8px;
      }
      .footer-tagline {
        color: #94a3b8;
        font-size: 12px;
        font-style: italic;
        margin-bottom: 12px;
      }
      .footer-address {
        color: #cbd5e1;
        font-size: 11px;
        line-height: 1.6;
        margin-bottom: 8px;
      }
      .footer-contact {
        color: #93c5fd;
        font-size: 11px;
        margin-bottom: 10px;
      }
      .footer-contact a {
        color: #93c5fd;
        text-decoration: none;
      }
      .footer-contact a:hover {
        text-decoration: underline;
      }
      .footer-links {
        margin-bottom: 20px;
      }
      .footer-links a {
        color: #93c5fd;
        text-decoration: none;
        margin: 0 10px;
        display: inline-block;
        font-size: 11px;
      }
      .footer-links a:hover {
        text-decoration: underline;
      }
      .divider {
        height: 1px;
        background-color: #334155;
        margin: 20px 0;
      }
      .autogenerated-notice {
        background-color: #1f2937;
        border-left: 3px solid #f59e0b;
        padding: 15px;
        border-radius: 4px;
        margin: 20px 0;
        font-size: 11px;
        line-height: 1.5;
      }
      .autogenerated-notice strong {
        color: #fbbf24;
      }
      .otp-box {
        display: inline-block;
        background-color: #1e293b;
        color: #4f46e5;
        padding: 3px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <img src="cid:serverpe-logo" alt="ServerPe Logo" style="height: 60px; width: auto;">
        </div>
        <h1>Verify Your Account</h1>
        <p class="header-subtitle">One-Time Password (OTP) for Secure Access</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Intro Text -->
        <p class="intro-text">
          We received a request to verify your account on <strong>ServerPe</strong>. 
          Use the code below to complete your verification.
        </p>

        <!-- OTP Display -->
        <div class="otp-container">
          <div class="otp-label">Your Verification Code</div>
          <div class="otp-code">${result_otp_email}</div>
          <div class="otp-divider"></div>
          <div class="otp-expiry">
            <span class="otp-expiry-icon">⏱️</span>
            Valid for <strong>${expiryMinutes} minutes</strong>
          </div>
        </div>

        <!-- Security Warning -->
        <div class="security-warning">
          <h3>Keep Your OTP Safe</h3>
          <ul>
            <li><strong>Never share</strong> this code with anyone, including ServerPe staff</li>
            <li>We will <strong>never ask</strong> you for this code via email or message</li>
            <li><strong>Scammers</strong> may try to steal this code - stay vigilant</li>
            <li>If you didn't request this code, <strong>change your password immediately</strong></li>
            <li>Ignore if you received this by mistake</li>
          </ul>
        </div>

        <!-- Important Note -->
        <div class="important-note">
          <strong>⚡ Important:</strong> This is a time-sensitive code. It will expire in ${expiryMinutes} minutes. 
          If you don't use it within this time, you'll need to request a new code.
        </div>

        <!-- Instructions -->
        <div class="instructions">
          <h3>How to Use Your OTP:</h3>
          <ol>
            <li>Copy the <span class="otp-box">${result_otp_email}</span> code above</li>
            <li>Go back to ServerPe and paste it in the verification field</li>
            <li>Click "Verify" to complete the process</li>
            <li>You'll have full access to your account after verification</li>
          </ol>
        </div>

        <!-- Why We Ask -->
        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 25px 0;">
          <strong>Why do we ask for OTP?</strong><br>
          One-Time Passwords help us keep your account secure by confirming that you have access to your 
          registered email address. This is a standard security practice used by major platforms worldwide.
        </p>

        <!-- Help Section -->
        <div class="help-section">
          <p><strong>Didn't request this code?</strong></p>
          <p style="margin: 8px 0;">
            If you didn't request this verification, your account may be at risk. 
            <a href="https://www.serverpe.in/security/change-password">Change your password immediately</a> and 
            contact <a href="mailto:security@serverpe.in">security@serverpe.in</a>.
          </p>
        </div>

        <!-- Support Info -->
        <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 30px;">
          Need help? Contact our support team at 
          <strong><a href="mailto:support@serverpe.in" style="color: #4f46e5; text-decoration: none;">support@serverpe.in</a></strong>
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <!-- Company Information -->
        <div class="footer-company-info">
          <div class="footer-company-name">ServerPe™</div>
          <div class="footer-tagline">Desi API to challenge your UI</div>
          
          <div class="footer-address">
            <strong>ServerPe App Solutions</strong><br>
            New KHB Colony, LIG 2A, #8<br>
            Sirsi - 581402<br>
            Uttara Kannada District, Karnataka 560013<br>
            India
          </div>
          
          <div class="footer-contact">
            <strong>Contact:</strong> <a href="mailto:support@serverpe.in">support@serverpe.in</a><br>
            <strong>Security:</strong> <a href="mailto:security@serverpe.in">security@serverpe.in</a><br>            
          </div>
        </div>

        <!-- Useful Links -->
        <div class="footer-links">
          <a href="https://www.serverpe.in">Website</a> |
          <a href="https://www.serverpe.in/security">Security</a> |
          <a href="https://support.serverpe.in">Support</a> |
          <a href="https://www.serverpe.in/privacy">Privacy</a> |
          <a href="https://www.serverpe.in/terms">Terms</a>
        </div>

        <!-- Autogenerated Notice -->
        <div class="autogenerated-notice">
          <strong>🔒 Automated Security Email:</strong><br>
          This is an <strong>automatically generated security email</strong> from ServerPe. 
          Please <strong>do not reply</strong> to this message. If you need assistance or have security concerns, 
          contact <a href="mailto:security@serverpe.in" style="color: #93c5fd;">security@serverpe.in</a> directly.
        </div>

        <div class="divider"></div>

        <p style="margin: 15px 0 8px 0; color: #64748b; font-size: 11px;">
          ™ 2025 ServerPe App Solutions. All rights reserved. | Secure • Encrypted • Verified
        </p>
        <p style="margin: 0; color: #475569; font-size: 10px;">
          <strong>GSTIN:</strong> 29XXXXX0000X1Z5 | <strong>PAN:</strong> XXXXX0000X
        </p>
      </div>
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
    "ServerPe_Logo.jpg",
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

module.exports = sendOtpMailTemplate;
