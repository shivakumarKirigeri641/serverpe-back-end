/**
 * =====================================================
 * CHECK STUDENT LICENSE MIDDLEWARE
 * =====================================================
 * 
 * Validates student API keys for mock train reservation project.
 * Students purchase a license and receive an API key.
 * 
 * @author ServerPE
 */

const extractLicenseKey = require('../utils/extractLicenseKey');
const { connectTrainSeatDb } = require('../database/connectDB');

/**
 * Middleware to validate student license/API key
 * 
 * Expected header: x-license-key: YOUR_LICENSE_KEY
 * Or: Authorization: License YOUR_LICENSE_KEY
 * Or: Query param: ?license_key=YOUR_LICENSE_KEY
 */
const checkStudentLicense = async (req, res, next) => {
    try {
        // Extract license key from request
        const licenseKey = extractLicenseKey(req);

        if (!licenseKey) {
            return res.status(401).json({
                poweredby: 'serverpe.in',
                mock_data: true,
                status: 'Failed',
                successstatus: false,
                error_code: 'NO_LICENSE_KEY',
                message: 'License key is required',
                help: 'Please add your API key in the x-license-key header or Authorization header',
                example: 'x-license-key: YOUR_LICENSE_KEY'
            });
        }

        // Validate license key format (basic check)
        if (licenseKey.length < 16) {
            return res.status(401).json({
                poweredby: 'serverpe.in',
                mock_data: true,
                status: 'Failed',
                successstatus: false,
                error_code: 'INVALID_LICENSE_FORMAT',
                message: 'Invalid license key format',
                help: 'License key should be at least 16 characters'
            });
        }

        // For development/testing: Allow a demo key
        if (licenseKey === 'DEMO_LICENSE_KEY_1234' || licenseKey === 'SERVERPE_DEMO_KEY') {
            req.studentLicense = {
                license_key: licenseKey,
                student_name: 'Demo Student',
                is_demo: true,
                valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            };
            return next();
        }

        // Validate against database
        const pool = connectTrainSeatDb();
        
        const result = await pool.query(`
            SELECT 
                l.id, l.license_key, l.student_name, l.student_email,
                l.purchase_date, l.expiry_date, l.status, l.project_name,
                l.fingerprint
            FROM student_licenses l
            WHERE l.license_key = $1
            LIMIT 1
        `, [licenseKey]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                poweredby: 'serverpe.in',
                mock_data: true,
                status: 'Failed',
                successstatus: false,
                error_code: 'INVALID_LICENSE_KEY',
                message: 'License key not found',
                help: 'Please check your license key or purchase a new one at serverpe.in'
            });
        }

        const license = result.rows[0];

        // Check if license is active
        if (license.status !== 'active') {
            return res.status(403).json({
                poweredby: 'serverpe.in',
                mock_data: true,
                status: 'Failed',
                successstatus: false,
                error_code: 'LICENSE_INACTIVE',
                message: `License is ${license.status}`,
                help: license.status === 'expired' 
                    ? 'Your license has expired. Please renew at serverpe.in'
                    : 'Contact support for assistance'
            });
        }

        // Check if license has expired
        if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
            // Update status in database
            await pool.query(`
                UPDATE student_licenses SET status = 'expired' WHERE id = $1
            `, [license.id]);

            return res.status(403).json({
                poweredby: 'serverpe.in',
                mock_data: true,
                status: 'Failed',
                successstatus: false,
                error_code: 'LICENSE_EXPIRED',
                message: 'License has expired',
                expired_on: license.expiry_date,
                help: 'Please renew your license at serverpe.in'
            });
        }

        // Fingerprint validation (optional - for machine binding)
        const requestFingerprint = req.headers['x-fingerprint'];
        if (license.fingerprint && requestFingerprint && license.fingerprint !== requestFingerprint) {
            return res.status(403).json({
                poweredby: 'serverpe.in',
                mock_data: true,
                status: 'Failed',
                successstatus: false,
                error_code: 'FINGERPRINT_MISMATCH',
                message: 'License is bound to a different device',
                help: 'This license can only be used on the registered device'
            });
        }

        // Bind fingerprint on first use
        if (!license.fingerprint && requestFingerprint) {
            await pool.query(`
                UPDATE student_licenses SET fingerprint = $1 WHERE id = $2
            `, [requestFingerprint, license.id]);
        }

        // Log usage (optional)
        await pool.query(`
            UPDATE student_licenses 
            SET last_used_at = NOW(), usage_count = COALESCE(usage_count, 0) + 1 
            WHERE id = $1
        `, [license.id]);

        // Attach license info to request
        req.studentLicense = {
            id: license.id,
            license_key: license.license_key,
            student_name: license.student_name,
            student_email: license.student_email,
            project_name: license.project_name,
            valid_until: license.expiry_date,
            is_demo: false
        };

        next();

    } catch (error) {
        console.error('License validation error:', error);
        
        // If database query fails, allow demo mode
        const licenseKey = extractLicenseKey(req);
        if (licenseKey === 'DEMO_LICENSE_KEY_1234') {
            req.studentLicense = { is_demo: true };
            return next();
        }

        return res.status(500).json({
            poweredby: 'serverpe.in',
            mock_data: true,
            status: 'Failed',
            successstatus: false,
            error_code: 'LICENSE_VALIDATION_ERROR',
            message: 'Error validating license',
            technical_message: error.message
        });
    }
};

/**
 * Optional middleware for routes that can work with or without license
 * If license is valid, attaches info. If not, continues without error.
 */
const optionalStudentLicense = async (req, res, next) => {
    try {
        const licenseKey = extractLicenseKey(req);
        if (licenseKey) {
            // Run full validation but don't block on failure
            await checkStudentLicense(req, res, () => {
                next();
            });
        } else {
            next();
        }
    } catch (error) {
        next();
    }
};

module.exports = { checkStudentLicense, optionalStudentLicense };
