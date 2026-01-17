const axios = require('axios');

/**
 * Fetches geolocation details from IP address using ip-api.com
 * @param {string} ipAddress - The IP address to lookup
 * @returns {Promise<object>} - Location details object
 */
const getIpDetails = async (ipAddress) => {
  try {
    // Skip lookup for localhost/private IPs
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      return {
        status: 'private',
        city: 'Local Network',
        regionName: 'N/A',
        country: 'N/A',
        isp: 'Local Network',
        org: 'N/A',
        timezone: 'N/A',
        query: ipAddress
      };
    }

    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
      timeout: 5000
    });

    if (response.data && response.data.status === 'success') {
      return response.data;
    }

    return { status: 'fail', query: ipAddress };
  } catch (error) {
    console.error('IP lookup failed:', error.message);
    return { status: 'error', query: ipAddress };
  }
};

module.exports = { getIpDetails };
