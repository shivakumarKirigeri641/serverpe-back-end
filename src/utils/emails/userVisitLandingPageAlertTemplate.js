const { getIpDetails } = require('../geoUtils');

/**
 * Generates email template for landing page visitor alert
 * Fetches IP geolocation from ip-api.com and displays full visitor details
 * 
 * NOTE: This function is now ASYNC - caller must await it!
 * Example: const html = await userVisitLandingPageAlertTemplate({...})
 */
const userVisitLandingPageAlertTemplate = async ({
  ipAddress,
  visitTime,
  deviceType,
}) => {
  // Fetch IP geolocation details from ip-api.com
  const ipDetails = await getIpDetails(ipAddress);

  // Format location string
  const locationDisplay = ipDetails.status === 'success'
    ? `${ipDetails.city}, ${ipDetails.regionName}, ${ipDetails.country}`
    : 'Location unavailable';

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Visitor Alert - ServerPe</title>
    <style>
      body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
      .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 25px; text-align: center; }
      .header h2 { margin: 0; font-size: 22px; font-weight: 600; }
      .header p { margin: 8px 0 0; font-size: 13px; color: #94a3b8; }
      .content { padding: 30px; }
      .alert-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 18px; border-radius: 8px; margin-bottom: 25px; }
      .alert-box p { margin: 0; color: #047857; font-weight: 600; font-size: 15px; }
      
      .section-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
      
      .location-card { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #bfdbfe; }
      .location-main { font-size: 20px; font-weight: 700; color: #1e40af; margin-bottom: 5px; }
      .location-sub { font-size: 13px; color: #3b82f6; }
      
      .info-grid { display: table; width: 100%; border-collapse: collapse; }
      .info-row { display: table-row; }
      .info-label { display: table-cell; padding: 12px 10px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; width: 35%; border-bottom: 1px solid #f1f5f9; }
      .info-value { display: table-cell; padding: 12px 10px; font-size: 14px; color: #1e293b; font-weight: 500; border-bottom: 1px solid #f1f5f9; }
      
      .isp-card { background: #f8fafc; border-radius: 8px; padding: 15px; margin-top: 15px; border: 1px solid #e2e8f0; }
      .isp-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
      .isp-value { font-size: 13px; color: #475569; font-weight: 500; }
      
      .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      .footer a { color: #3b82f6; text-decoration: none; }
      
      .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
      .badge-info { background: #dbeafe; color: #1d4ed8; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>🌐 New Visitor Alert</h2>
        <p>Someone just visited the ServerPe landing page</p>
      </div>
      
      <div class="content">
        <div class="alert-box">
          <p>✨ A new potential customer is browsing your website!</p>
        </div>
        
        <!-- Location Section -->
        <div class="section-title">📍 Visitor Location</div>
        <div class="location-card">
          <div class="location-main">${locationDisplay}</div>
          <div class="location-sub">
            ${ipDetails.status === 'success' ? `
              🕐 Timezone: ${ipDetails.timezone || 'N/A'} &nbsp;|&nbsp; 
              📮 ZIP: ${ipDetails.zip || 'N/A'}
            ` : 'Unable to determine precise location'}
          </div>
        </div>
        
        <!-- Visit Details -->
        <div class="section-title">📋 Visit Details</div>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Visit Time</div>
            <div class="info-value">${visitTime}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Device / Browser</div>
            <div class="info-value">${deviceType}</div>
          </div>
          <div class="info-row">
            <div class="info-label">IP Address</div>
            <div class="info-value"><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;">${ipAddress}</code></div>
          </div>
          ${ipDetails.status === 'success' ? `
          <div class="info-row">
            <div class="info-label">Country</div>
            <div class="info-value">
              ${ipDetails.country} 
              <span class="badge badge-info">${ipDetails.countryCode}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Region</div>
            <div class="info-value">${ipDetails.regionName} (${ipDetails.region})</div>
          </div>
          <div class="info-row">
            <div class="info-label">City</div>
            <div class="info-value">${ipDetails.city}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Coordinates</div>
            <div class="info-value">
              <a href="https://www.google.com/maps?q=${ipDetails.lat},${ipDetails.lon}" target="_blank" style="color:#3b82f6;text-decoration:none;">
                📍 ${ipDetails.lat}, ${ipDetails.lon}
              </a>
            </div>
          </div>
          ` : ''}
        </div>
        
        ${ipDetails.status === 'success' ? `
        <!-- ISP Info -->
        <div class="section-title">🌐 Network Information</div>
        <div class="isp-card">
          <div class="isp-label">Internet Service Provider</div>
          <div class="isp-value">${ipDetails.isp || 'Unknown'}</div>
        </div>
        <div class="isp-card" style="margin-top:10px;">
          <div class="isp-label">Organization</div>
          <div class="isp-value">${ipDetails.org || 'Unknown'}</div>
        </div>
        <div class="isp-card" style="margin-top:10px;">
          <div class="isp-label">AS Number</div>
          <div class="isp-value" style="font-size:11px;word-break:break-all;">${ipDetails.as || 'Unknown'}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <p style="margin:0 0 10px;">© 2025 ServerPe App Solutions • Automated Visitor Alert System</p>
        <p style="margin:0;">
          <a href="https://serverpe.in">serverpe.in</a> &nbsp;|&nbsp; 
          This is an automated notification
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = userVisitLandingPageAlertTemplate;
