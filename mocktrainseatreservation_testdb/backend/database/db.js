/**
 * =====================================================
 * DATABASE CONNECTION - SQLite
 * =====================================================
 * 
 * This module handles SQLite database connection and initialization.
 * Uses better-sqlite3 for synchronous, fast SQLite operations.
 * 
 * @author ServerPE
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database file path
const dbPath = process.env.DB_PATH || './database/train_reservation.db';
const absoluteDbPath = path.resolve(__dirname, '..', dbPath.replace('./database/', ''));

// Ensure database directory exists
const dbDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
let db = null;

/**
 * Get database connection (singleton pattern)
 * @returns {Database} SQLite database instance
 */
function getDb() {
    if (!db) {
        db = new Database(absoluteDbPath, { verbose: console.log });
        console.log('✅ SQLite Database connected:', absoluteDbPath);
    }
    return db;
}

/**
 * Initialize database with schema
 * @param {string} schemaPath - Path to SQL schema file
 */
function initializeDatabase(schemaPath) {
    const database = getDb();
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute schema
    database.exec(schema);
    console.log('✅ Database schema initialized');
}

/**
 * Close database connection
 */
function closeDb() {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed');
    }
}

module.exports = {
    getDb,
    initializeDatabase,
    closeDb
};
