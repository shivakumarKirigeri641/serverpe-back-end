const sendWelcomeMailTemplate = ({ userName, totalCredits = 50 }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ServerPe - Mock APIs Platform</title>
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
      .welcome-message {
        background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
        border-left: 4px solid #4f46e5;
        padding: 20px;
        border-radius: 6px;
        margin-bottom: 30px;
      }
      .welcome-message h2 {
        margin: 0 0 10px 0;
        color: #4f46e5;
        font-size: 18px;
        font-weight: 600;
      }
      .welcome-message p {
        margin: 0;
        color: #2d3748;
        font-size: 14px;
        line-height: 1.6;
      }
      .feature-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 30px 0;
      }
      .feature-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .feature-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
      }
      .feature-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }
      .feature-title {
        color: #1e293b;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .feature-desc {
        color: #64748b;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
      }
      .credit-highlight {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        padding: 25px;
        border-radius: 8px;
        margin: 30px 0;
        text-align: center;
      }
      .credit-highlight h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }
      .credit-amount {
        font-size: 36px;
        font-weight: 700;
        margin: 10px 0;
      }
      .credit-highlight p {
        margin: 8px 0;
        font-size: 13px;
        opacity: 0.95;
      }
      .what-you-get {
        background-color: #f0fdf4;
        border-left: 4px solid #10b981;
        padding: 20px;
        border-radius: 6px;
        margin: 30px 0;
      }
      .what-you-get h3 {
        margin: 0 0 15px 0;
        color: #047857;
        font-size: 16px;
        font-weight: 600;
      }
      .what-you-get ul {
        margin: 0;
        padding-left: 20px;
        color: #047857;
        font-size: 13px;
        line-height: 1.8;
      }
      .what-you-get li {
        margin-bottom: 8px;
      }
      .highlight-text {
        font-weight: 600;
        color: #10b981;
      }
      .pricing-section {
        background-color: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 20px;
        border-radius: 6px;
        margin: 30px 0;
      }
      .pricing-section h3 {
        margin: 0 0 12px 0;
        color: #92400e;
        font-size: 16px;
        font-weight: 600;
      }
      .pricing-section p {
        margin: 8px 0;
        color: #78350f;
        font-size: 13px;
        line-height: 1.6;
      }
      .tagline-section {
        background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        margin: 30px 0;
        text-align: center;
      }
      .tagline-section h2 {
        margin: 0 0 12px 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .tagline-section p {
        margin: 0;
        font-size: 14px;
        color: #e0e7ff;
        font-weight: 500;
      }
      .cta-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin: 30px 0;
      }
      .cta-button {
        display: inline-block;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cta-primary {
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        color: #ffffff;
      }
      .cta-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      }
      .cta-secondary {
        background-color: #f1f5f9;
        color: #4f46e5;
        border: 2px solid #4f46e5;
      }
      .cta-secondary:hover {
        transform: translateY(-2px);
        background-color: #e0e7f1;
      }
      .documentation-link {
        text-align: center;
        margin-top: 20px;
      }
      .documentation-link a {
        color: #4f46e5;
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;
      }
      .documentation-link a:hover {
        text-decoration: underline;
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
        <h1>Welcome to ServerPe! 🚀</h1>
        <p class="header-subtitle">Your Playground for Dynamic Mock APIs</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Welcome Message -->
        <div class="welcome-message">
          <h2>Hi ${userName || "Developer"},</h2>
          <p>
            Welcome to ServerPe, the ultimate platform for testing and developing your applications with 
            <strong>dynamic, production-ready mock APIs</strong>. We're thrilled to have you on board!
          </p>
        </div>

        <!-- Credit Highlight -->
        <div class="credit-highlight">
          <h3>🎁 Your Welcome Gift</h3>
          <div class="credit-amount">${totalCredits}</div>
          <p>Free Mock API Credits</p>
          <p>Ready to use immediately • No credit card required</p>
        </div>

        <!-- Features Grid -->
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">📮</div>
            <div class="feature-title">Postman Ready</div>
            <div class="feature-desc">Seamlessly import and test all APIs in Postman</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <div class="feature-title">Lightning Fast</div>
            <div class="feature-desc">Sub-millisecond response times for your tests</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <div class="feature-title">Dynamic Data</div>
            <div class="feature-desc">Real-time, realistic mock data that updates</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <div class="feature-title">Affordable</div>
            <div class="feature-desc">Lowest rates in the industry • Flexible plans</div>
          </div>
        </div>

        <!-- What You Get -->
        <div class="what-you-get">
          <h3>✨ What You Can Do Right Now:</h3>
          <ul>
            <li>Access <span class="highlight-text">${totalCredits} complimentary mock APIs</span> from our extensive collection</li>
            <li>Test with <span class="highlight-text">real-world scenarios</span> and dynamic responses</li>
            <li>Import collections directly into <span class="highlight-text">Postman</span> for instant testing</li>
            <li>Build and iterate without API rate limits during trial period</li>
            <li>Integrate with your UI development workflow seamlessly</li>
          </ul>
        </div>

        <!-- Rock Your UI Section -->
        <div class="tagline-section">
          <h2>Rock Your UI</h2>
          <p>with dynamic mock APIs that feel like the real thing</p>
        </div>

        <!-- Pricing Section -->
        <div class="pricing-section">
          <h3>💳 Easy Recharge with Lowest Rates</h3>
          <p>
            <strong>Run out of credits?</strong> No problem! Recharge instantly with our unbeatable prices.
            <br><br>
            We offer <strong>flexible, affordable plans</strong> that scale with your development needs. 
            Whether you're an indie developer or a growing startup, we've got you covered.
          </p>
          <p style="margin-top: 15px; font-weight: 600;">
            💡 Pro Tip: More credits = Better rates per credit!
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="cta-container">
          <a href="https://www.serverpe.in/dashboard" class="cta-button cta-primary">Go to Dashboard</a>
          <a href="https://docs.serverpe.in" class="cta-button cta-secondary">View Documentation</a>
        </div>

        <!-- Documentation Link -->
        <div class="documentation-link">
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">
            Need help getting started? Check out our comprehensive guides.
          </p>
          <a href="https://docs.serverpe.in/getting-started">📖 Getting Started Guide →</a>
        </div>

        <!-- Support Info -->
        <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 30px;">
          Have questions? Our support team is here to help at 
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
            <strong>Website:</strong> <a href="https://www.serverpe.in">www.serverpe.in</a>
          </div>
        </div>

        <!-- Useful Links -->
        <div class="footer-links">
          <a href="https://www.serverpe.in">Website</a> |
          <a href="https://docs.serverpe.in">Docs</a> |
          <a href="https://support.serverpe.in">Support</a> |
          <a href="https://www.serverpe.in/privacy">Privacy</a> |
          <a href="https://www.serverpe.in/terms">Terms</a>
        </div>

        <!-- Autogenerated Notice -->
        <div class="autogenerated-notice">
          <strong>⚠ Automated Email Notice:</strong><br>
          This is an <strong>automatically generated email</strong> from ServerPe's system. 
          Please <strong>do not reply</strong> to this message. If you have any questions, concerns, 
          or need assistance, please contact our support team at 
          <a href="mailto:support@serverpe.in" style="color: #93c5fd;">support@serverpe.in</a> or visit our 
          <a href="https://support.serverpe.in" style="color: #93c5fd;">support portal</a>.
        </div>

        <div class="divider"></div>

        <p style="margin: 15px 0 8px 0; color: #64748b; font-size: 11px;">
          ™ 2025 ServerPe App Solutions. All rights reserved.
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
const getSendWelcomeMailTemplateWithAttachment = (params) => {
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
    html: sendWelcomeMailTemplate(params),
    attachments: [
      {
        filename: "serverpe-logo.jpg",
        path: logoPath,
        cid: "serverpe-logo",
      },
    ],
  };
};

module.exports = sendWelcomeMailTemplate;
module.exports.getSendWelcomeMailTemplateWithAttachment =
  getSendWelcomeMailTemplateWithAttachment;
