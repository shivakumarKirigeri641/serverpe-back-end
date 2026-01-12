/**
 * =====================================================
 * AUTHENTICATION MIDDLEWARE
 * =====================================================
 * 
 * JWT-based authentication middleware.
 * Verifies token from cookies and attaches user info to request.
 * 
 * @author ServerPE
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authentication middleware
 * Checks for valid JWT token in cookies
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const authMiddleware = (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;

        // Check if token exists
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login first.',
                error: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Attach user data to request
        req.user = {
            email: decoded.email,
            mobile_number: decoded.mobile_number
        };

        // Continue to next middleware
        next();

    } catch (error) {
        console.error('Auth Error:', error.message);

        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.',
                error: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.',
                error: 'INVALID_TOKEN'
            });
        }

        // Generic auth error
        return res.status(401).json({
            success: false,
            message: 'Authentication failed.',
            error: 'AUTH_ERROR'
        });
    }
};

module.exports = authMiddleware;
