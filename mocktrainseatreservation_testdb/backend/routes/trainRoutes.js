/**
 * =====================================================
 * TRAIN RESERVATION ROUTES
 * =====================================================
 * 
 * All API endpoints for the train reservation system.
 * Includes public endpoints and protected endpoints.
 * 
 * @author ServerPE
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const { getDb } = require('../database/db');
const { 
    sendSuccess, 
    sendError, 
    isValidDate, 
    isValidEmail,
    isValidMobile,
    calculateSeatDetails,
    calculateFare
} = require('../utils/helpers');
require('dotenv').config();

// =====================================================
// MASTER DATA ENDPOINTS (Public - No Auth Required)
// =====================================================

/**
 * GET /train/stations
 * Get all available stations
 */
router.get('/train/stations', (req, res) => {
    try {
        const db = getDb();
        const stations = db.prepare(`
            SELECT code, station_name, zone 
            FROM stations 
            ORDER BY station_name
        `).all();

        sendSuccess(res, { stations }, 'Stations fetched successfully');
    } catch (error) {
        console.error('Error fetching stations:', error);
        sendError(res, 'Failed to fetch stations', 500, 'DB_ERROR', error.message);
    }
});

/**
 * GET /train/reservation-types
 * Get all reservation types
 */
router.get('/train/reservation-types', (req, res) => {
    try {
        const db = getDb();
        const reservation_types = db.prepare(`
            SELECT id, type_code, description 
            FROM reservationtype 
            ORDER BY id
        `).all();

        sendSuccess(res, { reservation_types }, 'Reservation types fetched successfully');
    } catch (error) {
        console.error('Error fetching reservation types:', error);
        sendError(res, 'Failed to fetch reservation types', 500, 'DB_ERROR', error.message);
    }
});

/**
 * GET /train/coach-types
 * Get all coach types
 */
router.get('/train/coach-types', (req, res) => {
    try {
        const db = getDb();
        const coach_types = db.prepare(`
            SELECT * FROM coachtype ORDER BY id
        `).all();

        sendSuccess(res, { coach_types }, 'Coach types fetched successfully');
    } catch (error) {
        console.error('Error fetching coach types:', error);
        sendError(res, 'Failed to fetch coach types', 500, 'DB_ERROR', error.message);
    }
});

// =====================================================
// TRAIN SEARCH ENDPOINTS (Public)
// =====================================================

/**
 * GET /train/search
 * Search trains between source and destination
 * Query: source, destination, doj (YYYY-MM-DD)
 */
router.get('/train/search', (req, res) => {
    try {
        const { source, destination, doj } = req.query;

        // Validation
        if (!source || !destination || !doj) {
            return sendError(res, 'Missing required parameters: source, destination, doj', 400, 'VALIDATION_ERROR');
        }

        if (!isValidDate(doj)) {
            return sendError(res, 'Invalid date format. Use YYYY-MM-DD', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();
        const srcCode = source.toUpperCase();
        const destCode = destination.toUpperCase();

        // Get day of week for the date
        const dateObj = new Date(doj);
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayColumn = `train_runs_on_${days[dateObj.getDay()]}`;

        // Find trains that run on this route and day
        const trains = db.prepare(`
            SELECT DISTINCT
                t.train_number,
                t.train_name,
                t.train_type,
                s1.departure as departure_time,
                s2.arrival as arrival_time,
                (s2.kilometer - s1.kilometer) as distance_km,
                s1.station_name as source_name,
                s2.station_name as destination_name,
                c.bogi_count_sl, c.bogi_count_1a, c.bogi_count_2a, 
                c.bogi_count_3a, c.bogi_count_cc, c.bogi_count_2s
            FROM schedules s1
            JOIN schedules s2 ON s1.train_number = s2.train_number
            JOIN trains t ON t.train_number = s1.train_number
            LEFT JOIN coaches c ON c.train_number = t.train_number
            WHERE s1.station_code = ?
              AND s2.station_code = ?
              AND s1.station_sequence < s2.station_sequence
              AND t.${dayColumn} = 'Y'
            ORDER BY s1.departure
        `).all(srcCode, destCode);

        // Get availability for each train
        const trainsWithAvailability = trains.map(train => {
            // Get fare info
            const fareRules = db.prepare(`
                SELECT coach_code, fare_per_km, discount_percent, flat_addon
                FROM journey_fare WHERE seat_type = 'GEN'
            `).all();

            const availability = {};
            fareRules.forEach(rule => {
                const coachCountKey = `bogi_count_${rule.coach_code.toLowerCase()}`;
                const coachCount = train[coachCountKey] || 0;
                
                if (coachCount > 0) {
                    const seatsPerCoach = {
                        'SL': 72, '1A': 18, '2A': 48, '3A': 64, 
                        'CC': 78, '2S': 108, 'EC': 56, 'FC': 18
                    };
                    const totalSeats = coachCount * (seatsPerCoach[rule.coach_code] || 72);
                    
                    // Get booked count
                    const booked = db.prepare(`
                        SELECT COALESCE(booked_seats, 0) as booked
                        FROM seatsondate
                        WHERE train_number = ? AND coach_code = ? AND date_of_journey = ?
                    `).get(train.train_number, rule.coach_code, doj);

                    const bookedCount = booked?.booked || 0;
                    const fare = Math.round(train.distance_km * rule.fare_per_km + rule.flat_addon);

                    availability[rule.coach_code] = {
                        available: totalSeats - bookedCount,
                        total: totalSeats,
                        fare: fare,
                        status: bookedCount < totalSeats ? 'AVAILABLE' : 'WL'
                    };
                }
            });

            return {
                train_number: train.train_number,
                train_name: train.train_name,
                train_type: train.train_type,
                source: train.source_name,
                destination: train.destination_name,
                departure_time: train.departure_time,
                arrival_time: train.arrival_time,
                distance_km: train.distance_km,
                classes: availability
            };
        });

        sendSuccess(res, {
            query: { source: srcCode, destination: destCode, doj },
            trains_count: trainsWithAvailability.length,
            trains: trainsWithAvailability
        }, 'Trains fetched successfully');

    } catch (error) {
        console.error('Error searching trains:', error);
        sendError(res, 'Failed to search trains', 500, 'DB_ERROR', error.message);
    }
});

/**
 * GET /train/schedule/:train_input
 * Get complete schedule for a train
 */
router.get('/train/schedule/:train_input', (req, res) => {
    try {
        const { train_input } = req.params;

        if (!train_input) {
            return sendError(res, 'Train number or name is required', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();
        const searchValue = train_input.trim().toUpperCase();

        // Find train
        const train = db.prepare(`
            SELECT 
                train_number, train_name, train_type,
                train_runs_on_mon, train_runs_on_tue, train_runs_on_wed,
                train_runs_on_thu, train_runs_on_fri, train_runs_on_sat, train_runs_on_sun
            FROM trains
            WHERE train_number = ? OR UPPER(train_name) LIKE '%' || ? || '%'
            LIMIT 1
        `).get(searchValue, searchValue);

        if (!train) {
            return sendError(res, `Train "${train_input}" not found`, 404, 'NOT_FOUND');
        }

        // Get schedule
        const schedule = db.prepare(`
            SELECT 
                station_code, station_name, arrival, departure,
                kilometer as distance, running_day as day, station_sequence as seq
            FROM schedules
            WHERE train_number = ?
            ORDER BY station_sequence
        `).all(train.train_number);

        // Get coach config
        const coaches = db.prepare(`
            SELECT * FROM coaches WHERE train_number = ?
        `).get(train.train_number);

        // Build running days array
        const runningDays = [];
        if (train.train_runs_on_mon === 'Y') runningDays.push('Mon');
        if (train.train_runs_on_tue === 'Y') runningDays.push('Tue');
        if (train.train_runs_on_wed === 'Y') runningDays.push('Wed');
        if (train.train_runs_on_thu === 'Y') runningDays.push('Thu');
        if (train.train_runs_on_fri === 'Y') runningDays.push('Fri');
        if (train.train_runs_on_sat === 'Y') runningDays.push('Sat');
        if (train.train_runs_on_sun === 'Y') runningDays.push('Sun');

        sendSuccess(res, {
            schedule: {
                train_number: train.train_number,
                train_name: train.train_name,
                train_type: train.train_type,
                running_days: runningDays,
                coaches: coaches || {},
                schedule: schedule
            }
        }, 'Train schedule fetched successfully');

    } catch (error) {
        console.error('Error fetching train schedule:', error);
        sendError(res, 'Failed to fetch train schedule', 500, 'DB_ERROR', error.message);
    }
});

/**
 * GET /train/live-status/:train_input
 * Get live running status (simulated)
 */
router.get('/train/live-status/:train_input', (req, res) => {
    try {
        const { train_input } = req.params;

        if (!train_input) {
            return sendError(res, 'Train number or name is required', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();
        const searchValue = train_input.trim().toUpperCase();

        // Find train
        const train = db.prepare(`
            SELECT train_number, train_name, train_type
            FROM trains
            WHERE train_number = ? OR UPPER(train_name) LIKE '%' || ? || '%'
            LIMIT 1
        `).get(searchValue, searchValue);

        if (!train) {
            return sendError(res, `Train "${train_input}" not found`, 404, 'NOT_FOUND');
        }

        // Get schedule and simulate live status
        const schedule = db.prepare(`
            SELECT 
                s.station_code,
                st.station_name,
                s.arrival,
                s.departure,
                s.station_sequence,
                s.kilometer
            FROM schedules s
            LEFT JOIN stations st ON s.station_code = st.code
            WHERE s.train_number = ?
            ORDER BY s.station_sequence
        `).all(train.train_number);

        // Simulate current position (random station)
        const currentStation = Math.floor(Math.random() * schedule.length);
        
        const liveStatus = schedule.map((station, index) => ({
            ...station,
            status: index < currentStation ? 'DEPARTED' : 
                    index === currentStation ? 'AT_STATION' : 'UPCOMING',
            delay_minutes: Math.floor(Math.random() * 30) // Simulated delay
        }));

        sendSuccess(res, {
            train_number: train.train_number,
            train_name: train.train_name,
            current_station: schedule[currentStation]?.station_name || 'Unknown',
            live_status: liveStatus
        }, 'Live train status fetched successfully');

    } catch (error) {
        console.error('Error fetching live status:', error);
        sendError(res, 'Failed to fetch live train status', 500, 'DB_ERROR', error.message);
    }
});

/**
 * GET /train/station/:station_code
 * Get all trains at a station
 */
router.get('/train/station/:station_code', (req, res) => {
    try {
        const { station_code } = req.params;

        if (!station_code) {
            return sendError(res, 'Station code is required', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();
        const code = station_code.toUpperCase();

        // Check station exists
        const station = db.prepare(`SELECT * FROM stations WHERE code = ?`).get(code);
        if (!station) {
            return sendError(res, `Station "${station_code}" not found`, 404, 'NOT_FOUND');
        }

        // Get trains at this station
        const trains = db.prepare(`
            SELECT 
                t.train_number, t.train_name, t.train_type,
                s.arrival, s.departure, s.station_sequence,
                t.train_runs_on_mon, t.train_runs_on_tue, t.train_runs_on_wed,
                t.train_runs_on_thu, t.train_runs_on_fri, t.train_runs_on_sat,
                t.train_runs_on_sun
            FROM schedules s
            JOIN trains t ON s.train_number = t.train_number
            WHERE s.station_code = ?
            ORDER BY s.departure
        `).all(code);

        sendSuccess(res, {
            station_code: code,
            station_name: station.station_name,
            trains_count: trains.length,
            trains: trains
        }, 'Trains at station fetched successfully');

    } catch (error) {
        console.error('Error fetching station trains:', error);
        sendError(res, 'Failed to fetch trains at station', 500, 'DB_ERROR', error.message);
    }
});

// =====================================================
// FARE CALCULATION ENDPOINT
// =====================================================

/**
 * POST /train/calculate-fare
 * Calculate fare for a journey
 */
router.post('/train/calculate-fare', (req, res) => {
    try {
        const {
            train_number, source_code, destination_code,
            doj, coach_code, reservation_type, passengers
        } = req.body;

        // Validation
        if (!train_number || !source_code || !destination_code || !doj || !coach_code || !reservation_type) {
            return sendError(res, 'Missing required fields', 400, 'VALIDATION_ERROR');
        }

        if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return sendError(res, 'At least one passenger is required', 400, 'VALIDATION_ERROR');
        }

        if (passengers.length > 6) {
            return sendError(res, 'Maximum 6 passengers allowed per booking', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();
        const trainNum = train_number.toUpperCase();
        const src = source_code.toUpperCase();
        const dest = destination_code.toUpperCase();
        const coach = coach_code.toUpperCase();
        const resType = reservation_type.toUpperCase();

        // Get journey distance
        const journey = db.prepare(`
            SELECT (s2.kilometer - s1.kilometer) as distance_km
            FROM schedules s1
            JOIN schedules s2 ON s1.train_number = s2.train_number
            WHERE s1.train_number = ?
              AND s1.station_code = ?
              AND s2.station_code = ?
              AND s1.station_sequence < s2.station_sequence
        `).get(trainNum, src, dest);

        if (!journey) {
            return sendError(res, 'Invalid route', 400, 'ROUTE_ERROR');
        }

        // Get fare rule
        const fareRule = db.prepare(`
            SELECT fare_per_km, discount_percent, flat_addon
            FROM journey_fare
            WHERE coach_code = ? AND seat_type = ?
        `).get(coach, resType);

        if (!fareRule) {
            return sendError(res, 'Fare rule not found', 404, 'FARE_ERROR');
        }

        // Calculate fare
        const fareDetails = calculateFare(journey.distance_km, fareRule, passengers);

        sendSuccess(res, {
            fare: {
                train_number: trainNum,
                coach_code: coach,
                reservation_type: resType,
                journey_km: journey.distance_km,
                passengers_count: passengers.length,
                ...fareDetails
            }
        }, 'Fare calculated successfully');

    } catch (error) {
        console.error('Error calculating fare:', error);
        sendError(res, 'Failed to calculate fare', 500, 'CALCULATION_ERROR', error.message);
    }
});

// =====================================================
// PNR STATUS ENDPOINT (Public)
// =====================================================

/**
 * GET /train/pnr-status/:pnr
 * Check PNR status
 */
router.get('/train/pnr-status/:pnr', (req, res) => {
    try {
        const { pnr } = req.params;

        if (!pnr) {
            return sendError(res, 'PNR is required', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();

        // Get booking
        const booking = db.prepare(`
            SELECT 
                b.id, b.pnr, b.pnr_status, b.date_of_journey,
                t.train_number, t.train_name,
                s1.station_name as source_name,
                s2.station_name as destination_name
            FROM bookingdata b
            JOIN trains t ON t.id = b.fktrain_number
            JOIN stations s1 ON s1.id = b.fksource_code
            JOIN stations s2 ON s2.id = b.fkdestination_code
            WHERE b.pnr = ?
        `).get(pnr);

        if (!booking) {
            return sendError(res, 'PNR not found', 404, 'NOT_FOUND');
        }

        // Get passengers
        const passengers = db.prepare(`
            SELECT 
                id, p_name as name, p_age as age, p_gender as gender,
                current_seat_status as status, coach_code, seat_number, berth_type
            FROM passengerdata
            WHERE fkbookingdata = ?
            ORDER BY id
        `).all(booking.id);

        // Calculate total fare
        const totalFare = db.prepare(`
            SELECT COALESCE(SUM(base_fare), 0) as total
            FROM passengerdata
            WHERE fkbookingdata = ?
        `).get(booking.id);

        sendSuccess(res, {
            pnr_status: {
                pnr: booking.pnr,
                status: booking.pnr_status,
                train_number: booking.train_number,
                train_name: booking.train_name,
                source: booking.source_name,
                destination: booking.destination_name,
                date_of_journey: booking.date_of_journey,
                total_fare: totalFare.total,
                passengers: passengers
            }
        }, 'PNR status fetched successfully');

    } catch (error) {
        console.error('Error fetching PNR status:', error);
        sendError(res, 'Failed to fetch PNR status', 500, 'DB_ERROR', error.message);
    }
});

// =====================================================
// OTP ENDPOINTS (Authentication)
// =====================================================

/**
 * POST /train/send-otp
 * Send OTP to email (hardcoded as 1234 for students)
 */
router.post('/train/send-otp', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, 'Email is required', 400, 'VALIDATION_ERROR');
        }

        if (!isValidEmail(email)) {
            return sendError(res, 'Invalid email format', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();
        
        // HARDCODED OTP FOR STUDENTS: 1234
        const otp = '1234';
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Save OTP
        db.prepare(`
            INSERT INTO email_otps (email, otp, expires_at)
            VALUES (?, ?, ?)
        `).run(email, otp, expiresAt);

        sendSuccess(res, {
            email,
            expires_in: '10 minutes',
            // Show OTP in development (students can see it)
            otp: process.env.NODE_ENV === 'development' ? otp : undefined,
            hint: 'For this demo, use OTP: 1234'
        }, 'OTP sent successfully');

    } catch (error) {
        console.error('Error sending OTP:', error);
        sendError(res, 'Failed to send OTP', 500, 'OTP_ERROR', error.message);
    }
});

/**
 * POST /train/verify-otp
 * Verify OTP and generate JWT token
 */
router.post('/train/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return sendError(res, 'Email and OTP are required', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();

        // Verify OTP
        const otpRecord = db.prepare(`
            SELECT * FROM email_otps
            WHERE email = ? AND otp = ? AND expires_at > datetime('now') AND verified = 0
            ORDER BY created_at DESC
            LIMIT 1
        `).get(email, otp);

        if (!otpRecord) {
            return sendError(res, 'Invalid or expired OTP', 401, 'OTP_INVALID');
        }

        // Mark as verified and delete
        db.prepare(`DELETE FROM email_otps WHERE id = ?`).run(otpRecord.id);

        // Generate JWT token
        const token = jwt.sign(
            { email },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        sendSuccess(res, {
            email,
            verified: true,
            token_expires_in: '7 days',
            token // Include token for frontend storage
        }, 'OTP verified successfully');

    } catch (error) {
        console.error('Error verifying OTP:', error);
        sendError(res, 'Failed to verify OTP', 500, 'OTP_ERROR', error.message);
    }
});

/**
 * POST /train/logout
 * Clear authentication
 */
router.post('/train/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    sendSuccess(res, null, 'Logged out successfully');
});

/**
 * GET /train/check-auth
 * Check if user is authenticated
 */
router.get('/train/check-auth', authMiddleware, (req, res) => {
    sendSuccess(res, {
        authenticated: true,
        email: req.user.email
    }, 'User is authenticated');
});

// =====================================================
// PROTECTED ENDPOINTS (Auth Required)
// =====================================================

/**
 * POST /train/book-ticket
 * Book a ticket
 */
router.post('/train/book-ticket', authMiddleware, (req, res) => {
    try {
        const {
            train_number, source_code, destination_code, doj,
            coach_code, reservation_type, passengers, mobile_number, email, total_fare
        } = req.body;

        // Validation
        if (!train_number || !source_code || !destination_code || !doj || !coach_code || !reservation_type) {
            return sendError(res, 'Missing required journey details', 400, 'VALIDATION_ERROR');
        }

        if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return sendError(res, 'At least one passenger is required', 400, 'VALIDATION_ERROR');
        }

        if (passengers.length > 6) {
            return sendError(res, 'Maximum 6 passengers allowed', 400, 'VALIDATION_ERROR');
        }

        if (!mobile_number) {
            return sendError(res, 'Mobile number is required', 400, 'VALIDATION_ERROR');
        }

        if (!email) {
            return sendError(res, 'Email is required', 400, 'VALIDATION_ERROR');
        }

        // Validate passengers
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            if (!p.passenger_name || p.passenger_name.trim().length < 2) {
                return sendError(res, `Passenger ${i + 1}: Name is required (min 2 characters)`, 400, 'VALIDATION_ERROR');
            }
            if (!p.passenger_age || p.passenger_age < 0 || p.passenger_age > 120) {
                return sendError(res, `Passenger ${i + 1}: Valid age is required (0-120)`, 400, 'VALIDATION_ERROR');
            }
            if (!p.passenger_gender || !['M', 'F', 'O'].includes(p.passenger_gender.toUpperCase())) {
                return sendError(res, `Passenger ${i + 1}: Gender must be M, F, or O`, 400, 'VALIDATION_ERROR');
            }
        }

        const db = getDb();
        const trainNum = train_number.toUpperCase();
        const src = source_code.toUpperCase();
        const dest = destination_code.toUpperCase();
        const coach = coach_code.toUpperCase();
        const resType = reservation_type.toUpperCase();

        // Get IDs
        const train = db.prepare(`SELECT id, train_name FROM trains WHERE train_number = ?`).get(trainNum);
        if (!train) {
            return sendError(res, 'Train not found', 404, 'NOT_FOUND');
        }

        const srcStation = db.prepare(`SELECT id, station_name FROM stations WHERE code = ?`).get(src);
        const destStation = db.prepare(`SELECT id, station_name FROM stations WHERE code = ?`).get(dest);
        const coachType = db.prepare(`SELECT id FROM coachtype WHERE coach_code = ?`).get(coach);
        const resTypeRecord = db.prepare(`SELECT id FROM reservationtype WHERE type_code = ?`).get(resType);

        if (!srcStation || !destStation) {
            return sendError(res, 'Source or destination station not found', 404, 'NOT_FOUND');
        }

        // Get journey distance for fare calculation
        const journey = db.prepare(`
            SELECT (s2.kilometer - s1.kilometer) as distance_km
            FROM schedules s1
            JOIN schedules s2 ON s1.train_number = s2.train_number
            WHERE s1.train_number = ?
              AND s1.station_code = ?
              AND s2.station_code = ?
              AND s1.station_sequence < s2.station_sequence
        `).get(trainNum, src, dest);

        // Get fare rule
        const fareRule = db.prepare(`
            SELECT fare_per_km, discount_percent, flat_addon
            FROM journey_fare WHERE coach_code = ? AND seat_type = ?
        `).get(coach, resType) || { fare_per_km: 1, discount_percent: 0, flat_addon: 50 };

        // Count adults and children
        const adultCount = passengers.filter(p => p.passenger_age >= 18).length;
        const childCount = passengers.filter(p => p.passenger_age < 18).length;

        // Create booking
        const bookingResult = db.prepare(`
            INSERT INTO bookingdata (
                fktrain_number, date_of_journey, fksource_code, fkdestination_code,
                fkcoach_type, fkreservation_type, mobile_number, email,
                fkboarding_at, adult_count, child_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            train.id, doj, srcStation.id, destStation.id,
            coachType?.id || 1, resTypeRecord?.id || 1, mobile_number, email,
            srcStation.id, adultCount, childCount
        );

        const bookingId = bookingResult.lastInsertRowid;

        // Get the generated PNR
        const booking = db.prepare(`SELECT pnr FROM bookingdata WHERE id = ?`).get(bookingId);

        // Add passengers and allocate seats
        const passengerDetails = [];
        const distanceKm = journey?.distance_km || 500;

        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            
            // Calculate individual fare
            let baseFare = distanceKm * fareRule.fare_per_km;
            let discount = fareRule.discount_percent;
            
            if (p.passenger_ispwd) discount = 50;
            else if (p.passenger_age >= 60) discount = 40;
            else if (p.passenger_age < 5) baseFare = 0;

            const discountedFare = baseFare - (baseFare * discount / 100) + fareRule.flat_addon;
            const fareWithGst = (discountedFare * 1.18).toFixed(2);

            // Get next seat sequence
            const lastSeat = db.prepare(`
                SELECT MAX(seat_number) as last_seat
                FROM passengerdata
                WHERE coach_code = ?
            `).get(coach);

            const seatSequence = (lastSeat?.last_seat || 0) + 1;
            const seatDetails = calculateSeatDetails(coach, seatSequence);

            // Insert passenger
            const passengerResult = db.prepare(`
                INSERT INTO passengerdata (
                    fkbookingdata, p_name, p_age, p_gender,
                    is_child, is_senior, is_pwd, base_fare,
                    current_seat_status, updated_seat_status,
                    coach_code, seat_number, berth_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                bookingId,
                p.passenger_name,
                p.passenger_age,
                p.passenger_gender.toUpperCase(),
                p.passenger_age < 18 ? 1 : 0,
                p.passenger_age >= 60 ? 1 : 0,
                p.passenger_ispwd ? 1 : 0,
                fareWithGst,
                `${seatDetails.coach_code}/${seatDetails.seat_number}/${seatDetails.berth_type}`,
                `${seatDetails.coach_code}/${seatDetails.seat_number}/${seatDetails.berth_type}`,
                seatDetails.coach_code,
                seatDetails.seat_number,
                seatDetails.berth_type
            );

            passengerDetails.push({
                id: passengerResult.lastInsertRowid,
                name: p.passenger_name,
                age: p.passenger_age,
                gender: p.passenger_gender,
                fare: fareWithGst,
                status: `${seatDetails.coach_code}/${seatDetails.seat_number}/${seatDetails.berth_type}`,
                seat: seatDetails
            });
        }

        // Update seats on date
        const existingSeats = db.prepare(`
            SELECT * FROM seatsondate
            WHERE train_number = ? AND coach_code = ? AND date_of_journey = ?
        `).get(trainNum, coach, doj);

        if (existingSeats) {
            db.prepare(`
                UPDATE seatsondate SET booked_seats = booked_seats + ?
                WHERE train_number = ? AND coach_code = ? AND date_of_journey = ?
            `).run(passengers.length, trainNum, coach, doj);
        } else {
            db.prepare(`
                INSERT INTO seatsondate (train_number, coach_code, date_of_journey, total_seats, booked_seats)
                VALUES (?, ?, ?, 72, ?)
            `).run(trainNum, coach, doj, passengers.length);
        }

        sendSuccess(res, {
            booking: {
                pnr: booking.pnr,
                pnr_status: 'BOOKED',
                train_details: {
                    train_number: trainNum,
                    train_name: train.train_name,
                    source: srcStation.station_name,
                    destination: destStation.station_name,
                    date_of_journey: doj
                },
                fare_details: {
                    total_fare: total_fare || passengerDetails.reduce((sum, p) => sum + parseFloat(p.fare), 0).toFixed(2),
                    passengers_count: passengers.length
                },
                passengers: passengerDetails
            }
        }, 'Ticket booked successfully');

    } catch (error) {
        console.error('Error booking ticket:', error);
        sendError(res, 'Failed to book ticket', 500, 'BOOKING_ERROR', error.message);
    }
});

/**
 * POST /train/cancel-ticket
 * Cancel ticket (full or partial)
 */
router.post('/train/cancel-ticket', authMiddleware, (req, res) => {
    try {
        const { pnr, passenger_ids } = req.body;

        if (!pnr) {
            return sendError(res, 'PNR is required', 400, 'VALIDATION_ERROR');
        }

        if (!passenger_ids || !Array.isArray(passenger_ids) || passenger_ids.length === 0) {
            return sendError(res, 'At least one passenger ID is required', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();

        // Get booking
        const booking = db.prepare(`SELECT * FROM bookingdata WHERE pnr = ?`).get(pnr);
        if (!booking) {
            return sendError(res, 'PNR not found', 404, 'NOT_FOUND');
        }

        // Cancel passengers
        const cancelledPassengers = [];
        for (const passId of passenger_ids) {
            const passenger = db.prepare(`
                SELECT * FROM passengerdata WHERE id = ? AND fkbookingdata = ?
            `).get(passId, booking.id);

            if (passenger) {
                db.prepare(`
                    UPDATE passengerdata 
                    SET current_seat_status = 'CANCELLED', updated_seat_status = 'CANCELLED'
                    WHERE id = ?
                `).run(passId);

                cancelledPassengers.push({
                    id: passId,
                    name: passenger.p_name,
                    status: 'CANCELLED',
                    refund_amount: (parseFloat(passenger.base_fare) * 0.75).toFixed(2)
                });
            }
        }

        // Check if all passengers cancelled
        const remainingPassengers = db.prepare(`
            SELECT COUNT(*) as count FROM passengerdata
            WHERE fkbookingdata = ? AND current_seat_status != 'CANCELLED'
        `).get(booking.id);

        if (remainingPassengers.count === 0) {
            db.prepare(`UPDATE bookingdata SET pnr_status = 'CANCELLED' WHERE id = ?`).run(booking.id);
        }

        sendSuccess(res, {
            cancellation: {
                pnr,
                cancelled_passengers: cancelledPassengers,
                total_refund: cancelledPassengers.reduce((sum, p) => sum + parseFloat(p.refund_amount), 0).toFixed(2),
                message: 'Cancellation processed. Refund will be initiated within 7 working days.'
            }
        }, 'Ticket cancelled successfully');

    } catch (error) {
        console.error('Error cancelling ticket:', error);
        sendError(res, 'Failed to cancel ticket', 500, 'CANCEL_ERROR', error.message);
    }
});

/**
 * GET /train/booking-history/:email
 * Get booking history for user
 */
router.get('/train/booking-history/:email', authMiddleware, (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return sendError(res, 'Email is required', 400, 'VALIDATION_ERROR');
        }

        const db = getDb();

        const bookings = db.prepare(`
            SELECT 
                b.id, b.pnr, b.pnr_status, b.date_of_journey, b.created_at,
                t.train_number, t.train_name,
                s1.station_name as source_name,
                s2.station_name as destination_name
            FROM bookingdata b
            JOIN trains t ON t.id = b.fktrain_number
            JOIN stations s1 ON s1.id = b.fksource_code
            JOIN stations s2 ON s2.id = b.fkdestination_code
            WHERE b.email = ?
            ORDER BY b.date_of_journey DESC, b.created_at DESC
        `).all(email);

        // Get passenger counts and fares
        const bookingsWithDetails = bookings.map(booking => {
            const passengers = db.prepare(`
                SELECT COUNT(*) as count, COALESCE(SUM(base_fare), 0) as total_fare
                FROM passengerdata WHERE fkbookingdata = ?
            `).get(booking.id);

            return {
                ...booking,
                passengers_count: passengers.count,
                total_fare: passengers.total_fare
            };
        });

        sendSuccess(res, {
            email,
            bookings_count: bookingsWithDetails.length,
            bookings: bookingsWithDetails
        }, 'Booking history fetched successfully');

    } catch (error) {
        console.error('Error fetching booking history:', error);
        sendError(res, 'Failed to fetch booking history', 500, 'DB_ERROR', error.message);
    }
});

module.exports = router;
