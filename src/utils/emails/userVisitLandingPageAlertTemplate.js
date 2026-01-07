const userVisitLandingPageAlertTemplate = ({
  ipAddress,
  visitTime,
  deviceType,
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Visitor Alert - ServerPe</title>
    <style>
      body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: #1e293b; color: #ffffff; padding: 20px; text-align: center; }
      .content { padding: 30px; }
      .alert-box { background-color: #f0fdf4; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
      .detail-row { margin: 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
      .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; }
      .value { font-size: 16px; color: #1e293b; margin-top: 4px; }
      .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin:0;">Landing Page Visit Alert</h2>
      </div>
      <div class="content">
        <div class="alert-box">
          <p style="margin:0; color: #047857; font-weight: 600;">A new user just visited the ServerPe landing page.</p>
        </div>
        
        <div class="detail-row">
          <div class="label">IP Address</div>
          <div class="value">${ipAddress}</div>
        </div>

        <div class="detail-row">
          <div class="label">Visit Date & Time</div>
          <div class="value">${visitTime}</div>
        </div>

        <div class="detail-row">
          <div class="label">Device / Browser Type</div>
          <div class="value">${deviceType}</div>
        </div>
      </div>
      <div class="footer">
        © 2025 ServerPe App Solutions • Automated System Alert
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = userVisitLandingPageAlertTemplate;
