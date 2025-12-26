const rechargeSuccessTemplate = ({ amount, credits }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recharge Successful - ServerPe</title>
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
      .header-icon {
        font-size: 48px;
        margin-bottom: 15px;
      }
      .header h1 {
        margin: 0;
        font-size: 32px;
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
      .success-message {
        background-color: #f0fdf4;
        border-left: 4px solid #10b981;
        padding: 20px;
        border-radius: 6px;
        margin-bottom: 30px;
      }
      .success-message p {
        margin: 0;
        color: #047857;
        font-weight: 500;
        font-size: 14px;
      }
      .details-section {
        background-color: #f8f9fa;
        padding: 30px;
        border-radius: 8px;
        margin-bottom: 30px;
        border: 1px solid #e2e8f0;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #e2e8f0;
      }
      .detail-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .detail-label {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
      }
      .detail-value {
        font-size: 18px;
        color: #1e293b;
        font-weight: 600;
      }
      .amount-highlight {
        color: #4f46e5;
      }
      .credits-highlight {
        color: #10b981;
      }
      .description {
        color: #475569;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 10px;
      }
      .next-steps {
        background-color: #f0f4ff;
        border-left: 4px solid #4f46e5;
        padding: 20px;
        border-radius: 6px;
        margin: 30px 0;
      }
      .next-steps h3 {
        margin: 0 0 15px 0;
        color: #4f46e5;
        font-size: 16px;
        font-weight: 600;
      }
      .next-steps ul {
        margin: 0;
        padding-left: 20px;
        color: #475569;
        font-size: 14px;
        line-height: 1.8;
      }
      .next-steps li {
        margin-bottom: 8px;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        color: #ffffff;
        padding: 12px 32px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        margin: 20px 0 30px 0;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
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
        margin: 0 12px;
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
        <div class="header-icon">✓</div>
        <h1>Recharge Successful</h1>
        <p class="header-subtitle">Your account has been credited</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Success Message -->
        <div class="success-message">
          <p>✓ Thank you for your recharge. Your account has been successfully credited.</p>
        </div>

        <!-- Transaction Details -->
        <div class="details-section">
          <div class="detail-row">
            <span class="detail-label">Amount Paid</span>
            <span class="detail-value amount-highlight">₹${amount}/-</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Credits Added</span>
            <span class="detail-value credits-highlight">${credits} Credits</span>
          </div>
        </div>

        <!-- Description -->
        <p class="description">
          Your <strong>${credits} mock API credits</strong> have been successfully added to your ServerPe account. 
          You can start using our comprehensive suite of mock APIs immediately to test and develop your applications.
        </p>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>Access your dashboard to view API credits</li>
            <li>Start integrating our mock APIs into your application</li>
            <li>Monitor your usage and credit consumption</li>
            <li>Upgrade your plan anytime for more features</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <center>
          <a href="https://www.serverpe.com/dashboard" class="cta-button">Go to Dashboard</a>
        </center>

        <!-- Support Info -->
        <p class="description" style="text-align: center; color: #64748b; margin-top: 30px;">
          Have questions? Contact our support team at 
          <strong><a href="mailto:support@serverpe.com" style="color: #4f46e5; text-decoration: none;">support@serverpe.com</a></strong>
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <!-- Company Information -->
        <div class="footer-company-info">
          <div class="footer-company-name">ServerPe™</div>
          <div class="footer-tagline">Your Partner in Digital Solutions</div>
          
          <div class="footer-address">
            <strong>ServerPe App Solutions</strong><br>
            New KHB Colony, LIG 2A, #8<br>
            Sirsi - 581402<br>
            Uttara Kannada District, Karnataka 560013<br>
            India
          </div>
          
          <div class="footer-contact">
            <strong>Contact:</strong> <a href="mailto:support@serverpe.com">support@serverpe.com</a><br>
            <strong>Phone:</strong> +91-XXXXX-XXXXX<br>
            <strong>Website:</strong> <a href="https://www.serverpe.com">www.serverpe.com</a>
          </div>
        </div>

        <!-- Useful Links -->
        <div class="footer-links">
          <a href="https://www.serverpe.com">Website</a> |
          <a href="https://docs.serverpe.com">Documentation</a> |
          <a href="https://support.serverpe.com">Support</a> |
          <a href="https://www.serverpe.com/privacy">Privacy Policy</a> |
          <a href="https://www.serverpe.com/terms">Terms of Service</a>
        </div>

        <!-- Autogenerated Notice -->
        <div class="autogenerated-notice">
          <strong>⚠ Automated Email Notice:</strong><br>
          This is an <strong>automatically generated email</strong> from ServerPe's system. 
          Please <strong>do not reply</strong> to this message. If you have any questions, concerns, 
          or need assistance, please contact our support team at 
          <a href="mailto:support@serverpe.com" style="color: #93c5fd;">support@serverpe.com</a> or visit our 
          <a href="https://support.serverpe.com" style="color: #93c5fd;">support portal</a>.
        </div>

        <div class="divider"></div>

        <p style="margin: 15px 0 8px 0; color: #64748b; font-size: 11px;">
          © 2025 ServerPe App Solutions. All rights reserved.
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
const getRechargeSuccessTemplateWithAttachment = (params) => {
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
    html: rechargeSuccessTemplate(params),
    attachments: [
      {
        filename: "serverpe-logo.jpg",
        path: logoPath,
        cid: "serverpe-logo",
      },
    ],
  };
};

module.exports = rechargeSuccessTemplate;
module.exports.getRechargeSuccessTemplateWithAttachment =
  getRechargeSuccessTemplateWithAttachment;
