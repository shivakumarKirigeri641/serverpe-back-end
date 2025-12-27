const sendAlertOnUserVisitMailTemplate = ({
  ipAddress = "N/A",
  visitTime = new Date().toLocaleString("en-IN"),
  pageVisited = "Home Page",
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Portal Visit Alert - ServerPe</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f7fa;
      }
      .email-container {
        max-width: 650px;
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
      .alert-banner {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        text-align: center;
      }
      .alert-banner p {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .alert-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
      .visitor-card {
        background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
        border: 2px solid #4f46e5;
        border-radius: 8px;
        padding: 25px;
        margin-bottom: 25px;
      }
      .visitor-title {
        color: #4f46e5;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
      }
      .visitor-title::before {
        content: "👤";
        margin-right: 8px;
        font-size: 18px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      .info-item {
        background-color: #ffffff;
        padding: 12px;
        border-radius: 6px;
        border-left: 3px solid #4f46e5;
      }
      .info-label {
        color: #64748b;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      .info-value {
        color: #1e293b;
        font-size: 13px;
        font-weight: 600;
        word-break: break-all;
      }
      .info-item.full-width {
        grid-column: 1 / -1;
      }
      .technical-details {
        background-color: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }
      .technical-details h3 {
        margin: 0 0 15px 0;
        color: #1e293b;
        font-size: 14px;
        font-weight: 700;
      }
      .tech-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e2e8f0;
        font-size: 12px;
      }
      .tech-item:last-child {
        border-bottom: none;
      }
      .tech-label {
        color: #64748b;
        font-weight: 600;
      }
      .tech-value {
        color: #1e293b;
        font-weight: 500;
        text-align: right;
      }
      .timeline-section {
        background: linear-gradient(135deg, #fef3c7 0%, #ffeaa7 100%);
        border-left: 4px solid #f59e0b;
        border-radius: 6px;
        padding: 20px;
        margin: 25px 0;
      }
      .timeline-section h3 {
        margin: 0 0 12px 0;
        color: #92400e;
        font-size: 14px;
        font-weight: 700;
        display: flex;
        align-items: center;
      }
      .timeline-section h3::before {
        content: "⏰";
        margin-right: 8px;
      }
      .timeline-item {
        color: #78350f;
        font-size: 13px;
        line-height: 1.6;
      }
      .timestamp {
        background-color: #ffffff;
        color: #f59e0b;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: 700;
        font-family: 'Courier New', monospace;
      }
      .action-required {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-left: 4px solid #10b981;
        border-radius: 6px;
        padding: 20px;
        margin: 25px 0;
      }
      .action-required h3 {
        margin: 0 0 12px 0;
        color: #047857;
        font-size: 14px;
        font-weight: 700;
      }
      .action-required p {
        margin: 0;
        color: #065f46;
        font-size: 13px;
        line-height: 1.6;
      }
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
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <img src="cid:serverpe-logo" alt="ServerPe Logo" style="height: 60px; width: auto;">
        </div>
        <h1>Portal Activity Alert</h1>
        <p class="header-subtitle">User Visit Notification</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Alert Banner -->
        <div class="alert-banner">
          <div class="alert-icon">🔔</div>
          <p>New User Visit to Your Portal Detected</p>
        </div>

        <!-- Visitor Information Card -->
        <div class="visitor-card">
          <div class="visitor-title">Portal Visit Details</div>
          <div class="info-grid">
            <div class="info-item full-width">
              <div class="info-label">Page Visited</div>
              <div class="info-value">${pageVisited}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Visitor IP Address</div>
              <div class="info-value">${ipAddress}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Visit Date & Time</div>
              <div class="info-value">${visitTime}</div>
            </div>
          </div>
        </div>

        <!-- Action Required -->
        <div class="action-required">
          <h3>📝 Alert Information</h3>
          <p>
            This is an automated alert confirming that your portal has received a visit. 
            A new user accessed your <strong>${pageVisited}</strong> from IP address <strong>${ipAddress}</strong> 
            on <strong>${visitTime}</strong>. Review the details above for monitoring purposes.
          </p>
        </div>

        <!-- Quick Actions -->
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://www.serverpe.in/admin/visitors" style="
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: white;
            padding: 10px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 13px;
          ">View Full Analytics</a>
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
            <strong>Website:</strong> <a href="https://www.serverpe.in">www.serverpe.in</a>
          </div>
        </div>

        <!-- Useful Links -->
        <div class="footer-links">
          <a href="https://www.serverpe.in">Website</a> |
          <a href="https://www.serverpe.in/admin">Admin Panel</a> |
          <a href="https://support.serverpe.in">Support</a> |
          <a href="https://www.serverpe.in/privacy">Privacy</a>
        </div>

        <!-- Autogenerated Notice -->
        <div class="autogenerated-notice">
          <strong>🤖 Automated Alert:</strong><br>
          This is an <strong>automatically generated alert email</strong> from ServerPe's monitoring system. 
          Please <strong>do not reply</strong> to this message. For issues or inquiries, 
          contact <a href="mailto:support@serverpe.in" style="color: #93c5fd;">support@serverpe.in</a>.
        </div>

        <div class="divider"></div>

        <p style="margin: 15px 0 8px 0; color: #64748b; font-size: 11px;">
          ™ 2025 ServerPe App Solutions. All rights reserved. | Secure Monitoring
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
const getSendAlertOnUserVisitMailTemplateWithAttachment = (params) => {
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
    html: sendAlertOnUserVisitMailTemplate(params),
    attachments: [
      {
        filename: "serverpe-logo.jpg",
        path: logoPath,
        cid: "serverpe-logo",
      },
    ],
  };
};

module.exports = sendAlertOnUserVisitMailTemplate;
module.exports.getSendAlertOnUserVisitMailTemplateWithAttachment =
  getSendAlertOnUserVisitMailTemplateWithAttachment;
