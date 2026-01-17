/**
 * =====================================================
 * GENERATE API KEY UTILITY
 * =====================================================
 * 
 * Generates secure random API keys for UI Only projects.
 * Format: SRV-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 * 
 * @author ServerPE
 */

const crypto = require('crypto');

/**
 * Generate a random API key
 * 
 * @param {number} length - Total characters (default 24)
 * @returns {string} API key in format SRV-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 */
const generateApiKey = (length = 24) => {
    // Character set: uppercase letters and numbers (excluding confusing chars)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    
    // Generate random bytes
    const randomBytes = crypto.randomBytes(length);
    
    // Build the key
    let key = '';
    for (let i = 0; i < length; i++) {
        key += chars[randomBytes[i] % chars.length];
    }
    
    // Format with dashes: SRV-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
    const formatted = key.match(/.{1,4}/g).join('-');
    
    return `SRV-${formatted}`;
};

/**
 * Validate API key format
 * 
 * @param {string} apiKey - Key to validate
 * @returns {boolean} True if valid format
 */
const validateApiKeyFormat = (apiKey) => {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // Must start with SRV-
    if (!apiKey.startsWith('SRV-')) return false;
    
    // Remove prefix and dashes, check length
    const cleanKey = apiKey.substring(4).replace(/-/g, '');
    
    // Should be 24 characters
    if (cleanKey.length < 20 || cleanKey.length > 32) return false;
    
    // Should only contain valid characters
    return /^[A-Z0-9]+$/.test(cleanKey);
};

module.exports = { generateApiKey, validateApiKeyFormat };
