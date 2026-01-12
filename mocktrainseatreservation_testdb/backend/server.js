/**
 * =====================================================
 * MOCK TRAIN SEAT RESERVATION - BACKEND SERVER
 * =====================================================
 * 
 * This is the main entry point for the backend server.
 * It sets up Express with all necessary middleware and routes.
 * 
 * @author ServerPE
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const trainRoutes = require('./routes/trainRoutes');

// Initialize Express app
const app = express();

// =====================================================
// MIDDLEWARE CONFIGURATION
// =====================================================

// Enable CORS for frontend connection
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// =====================================================
// API ROUTES
// =====================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Train reservation routes
app.use('/api', trainRoutes);

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 Handler - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
        error: 'NOT_FOUND'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'SERVER_ERROR'
    });
});

// =====================================================
// SERVER STARTUP
// =====================================================

const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   MOCK TRAIN SEAT RESERVATION - BACKEND        ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║   Server running on: http://localhost:${PORT}     ║`);
    console.log(`║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║`);
    console.log('║   Health Check: /api/health                    ║');
    console.log('╚════════════════════════════════════════════════╝');
});

module.exports = app;
