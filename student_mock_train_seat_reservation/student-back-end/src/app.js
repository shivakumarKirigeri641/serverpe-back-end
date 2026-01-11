/**
 * ============================================================================
 * STUDENT MOCK TRAIN BACKEND - Main Application Entry Point
 * ============================================================================
 *
 * This is the main Express.js application for the student mock train
 * reservation backend. It serves as a proxy to the ServerPE main API.
 *
 * FEATURES:
 * - Automatic license key and fingerprint injection
 * - Comprehensive error handling with user-friendly messages
 * - Health check endpoint with connection status
 * - CORS enabled for frontend communication
 * - Debug mode for development
 *
 * RUNNING THE SERVER:
 * 1. Copy .env.example to .env
 * 2. Configure your LICENSE_KEY in .env
 * 3. Run: npm install
 * 4. Run: npm start (or npm run dev for development)
 *
 * Server will start on port 7777 by default.
 *
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const trainRouter = require('./routes/trainRouter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { initializeFingerprint } = require('./utils/fingerprintGenerator');
const apiClient = require('./utils/apiClient');

// Initialize Express app
const app = express();

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// JSON body parser
app.use(express.json());

// URL encoded body parser
app.use(express.urlencoded({ extended: true }));

// CORS Configuration - Allow frontend to communicate
app.use(cors({
  origin: [
    config.frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-license-key', 'x-device-fingerprint'],
  credentials: true
}));

// =============================================================================
// PUBLIC ROUTES & HEALTH CHECKS
// =============================================================================

/**
 * @route   GET /
 * @desc    Basic health check
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Student Mock Train Backend',
    poweredBy: 'ServerPE',
    version: '1.0.0',
    status: 'Running',
    message: '🚂 Welcome to Mock Train Reservation API!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/health
 * @desc    Comprehensive health check with connection status
 */
app.get('/api/health', async (req, res) => {
  try {
    // Check connection to main API
    const connectionStatus = await apiClient.checkConnection();
    const licenseValidation = await apiClient.validateLicense();

    const health = {
      success: true,
      service: 'Student Mock Train Backend',
      poweredBy: 'ServerPE',
      version: '1.0.0',
      
      // Status indicators
      status: {
        student_backend: 'connected',
        main_api: connectionStatus.isConnected ? 'connected' : 'disconnected',
        license: licenseValidation.valid ? 'valid' : 'invalid'
      },

      // Detailed info
      details: {
        port: config.port,
        serverpe_api: config.serverpeApiUrl,
        license_configured: config.isLicenseConfigured(),
        debug_mode: config.debug,
        connection_last_check: connectionStatus.checkedAt,
        license_message: licenseValidation.message
      },

      timestamp: new Date().toISOString()
    };

    // Return appropriate status code
    const httpStatus = connectionStatus.isConnected && licenseValidation.valid ? 200 : 503;
    res.status(httpStatus).json(health);

  } catch (error) {
    res.status(503).json({
      success: false,
      service: 'Student Mock Train Backend',
      status: {
        student_backend: 'connected',
        main_api: 'error',
        license: 'unknown'
      },
      error: {
        userMessage: 'Unable to check system status',
        technicalMessage: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/connection-status
 * @desc    Quick connection status check (for frontend polling)
 */
app.get('/api/connection-status', async (req, res) => {
  try {
    const status = apiClient.getConnectionStatus();
    const connectionCheck = await apiClient.checkConnection();

    res.json({
      success: true,
      studentBackend: true,
      mainApi: connectionCheck.isConnected,
      licenseConfigured: config.isLicenseConfigured(),
      serverUrl: config.serverpeApiUrl,
      lastError: connectionCheck.lastError,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      studentBackend: true,
      mainApi: false,
      licenseConfigured: config.isLicenseConfigured(),
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =============================================================================
// API ROUTES
// =============================================================================

// Mount train routes
app.use('/api', trainRouter);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Handle 404 - Not Found
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Start the server with proper initialization
 */
async function startServer() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║   🚂 STUDENT MOCK TRAIN RESERVATION BACKEND                    ║');
  console.log('║   Powered by ServerPE                                          ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Log configuration
  config.logConfig();

  // Initialize fingerprint
  initializeFingerprint();

  // Check initial connection
  console.log('\n============================================');
  console.log('🔗 CHECKING CONNECTION TO SERVERPE API');
  console.log('============================================');

  try {
    const connectionStatus = await apiClient.checkConnection();

    if (connectionStatus.isConnected) {
      console.log('   ✅ ServerPE API: Connected');
      
      // Validate license
      const licenseStatus = await apiClient.validateLicense();
      if (licenseStatus.valid) {
        console.log('   ✅ License: Valid');
        if (licenseStatus.licenseInfo) {
          console.log(`   📋 Project: ${licenseStatus.licenseInfo.project_title || 'N/A'}`);
          console.log(`   👤 User: ${licenseStatus.licenseInfo.user_name || 'N/A'}`);
        }
      } else {
        console.log('   ⚠️  License: ' + licenseStatus.message);
      }
    } else {
      console.log('   ⚠️  ServerPE API: Not reachable');
      console.log(`   Error: ${connectionStatus.lastError}`);
    }
  } catch (error) {
    console.log('   ⚠️  Connection check failed:', error.message);
  }

  console.log('============================================\n');

  // Start listening
  app.listen(config.port, () => {
    console.log('============================================');
    console.log('🚀 SERVER STARTED SUCCESSFULLY');
    console.log('============================================');
    console.log(`   URL: http://localhost:${config.port}`);
    console.log(`   Health: http://localhost:${config.port}/api/health`);
    console.log('============================================');
    console.log('\n📋 Available Endpoints:');
    console.log('   GET  /                         - Welcome');
    console.log('   GET  /api/health               - Health check');
    console.log('   GET  /api/connection-status    - Connection status');
    console.log('   GET  /api/stations             - Get stations');
    console.log('   GET  /api/reservation-types    - Get reservation types');
    console.log('   GET  /api/coach-types          - Get coach types');
    console.log('   POST /api/search-trains        - Search trains');
    console.log('   POST /api/train-schedule       - Get train schedule');
    console.log('   POST /api/live-train-status    - Live train status');
    console.log('   POST /api/live-station         - Trains at station');
    console.log('   POST /api/calculate-fare       - Calculate fare');
    console.log('   POST /api/confirm-ticket       - Book ticket');
    console.log('   POST /api/cancel-ticket        - Cancel ticket');
    console.log('   GET  /api/pnr-status/:pnr      - PNR status');
    console.log('   POST /api/booking-history      - Booking history');
    console.log('   POST /api/auth/send-otp        - Send OTP');
    console.log('   POST /api/auth/verify-otp      - Verify OTP');
    console.log('\n');
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
