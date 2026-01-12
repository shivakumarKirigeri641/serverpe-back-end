-- =====================================================
-- MOCK TRAIN SEAT RESERVATION - DATABASE SCHEMA
-- =====================================================
-- This file creates all tables and populates with sample data
-- Run: npm run init-db
-- =====================================================

-- =====================================================
-- TABLE: stations
-- Stores all railway stations
-- =====================================================
CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    station_name TEXT NOT NULL,
    zone TEXT DEFAULT 'N/A',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: trains
-- Stores train information
-- =====================================================
CREATE TABLE IF NOT EXISTS trains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT UNIQUE NOT NULL,
    train_name TEXT NOT NULL,
    train_type TEXT DEFAULT 'EXP',
    train_runs_on_mon TEXT DEFAULT 'Y',
    train_runs_on_tue TEXT DEFAULT 'Y',
    train_runs_on_wed TEXT DEFAULT 'Y',
    train_runs_on_thu TEXT DEFAULT 'Y',
    train_runs_on_fri TEXT DEFAULT 'Y',
    train_runs_on_sat TEXT DEFAULT 'Y',
    train_runs_on_sun TEXT DEFAULT 'Y',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: coachtype
-- Available coach types (1A, 2A, 3A, SL, CC, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS coachtype (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    seats_per_coach INTEGER DEFAULT 72,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: reservationtype
-- Reservation categories (GEN, TTL, PTL, LADIES)
-- =====================================================
CREATE TABLE IF NOT EXISTS reservationtype (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: coaches
-- Coach configuration per train
-- =====================================================
CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    bogi_count_sl INTEGER DEFAULT 0,
    bogi_count_1a INTEGER DEFAULT 0,
    bogi_count_2a INTEGER DEFAULT 0,
    bogi_count_3a INTEGER DEFAULT 0,
    bogi_count_cc INTEGER DEFAULT 0,
    bogi_count_fc INTEGER DEFAULT 0,
    bogi_count_2s INTEGER DEFAULT 0,
    bogi_count_ec INTEGER DEFAULT 0,
    bogi_count_ea INTEGER DEFAULT 0,
    bogi_count_e3 INTEGER DEFAULT 0,
    FOREIGN KEY (train_number) REFERENCES trains(train_number)
);

-- =====================================================
-- TABLE: schedules
-- Train schedule with all station stops
-- =====================================================
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    station_code TEXT NOT NULL,
    station_name TEXT,
    station_sequence INTEGER NOT NULL,
    arrival TEXT,
    departure TEXT,
    halt_minutes INTEGER DEFAULT 2,
    kilometer INTEGER DEFAULT 0,
    running_day INTEGER DEFAULT 1,
    FOREIGN KEY (train_number) REFERENCES trains(train_number),
    FOREIGN KEY (station_code) REFERENCES stations(code)
);

-- =====================================================
-- TABLE: journey_fare
-- Fare rules per coach and seat type
-- =====================================================
CREATE TABLE IF NOT EXISTS journey_fare (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_code TEXT NOT NULL,
    seat_type TEXT NOT NULL,
    fare_per_km REAL NOT NULL,
    discount_percent REAL DEFAULT 0,
    flat_addon REAL DEFAULT 0,
    UNIQUE(coach_code, seat_type)
);

-- =====================================================
-- TABLE: bookingdata
-- Main booking records
-- =====================================================
CREATE TABLE IF NOT EXISTS bookingdata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pnr TEXT UNIQUE,
    pnr_status TEXT DEFAULT 'BOOKED',
    fktrain_number INTEGER NOT NULL,
    date_of_journey DATE NOT NULL,
    fksource_code INTEGER NOT NULL,
    fkdestination_code INTEGER NOT NULL,
    fkcoach_type INTEGER NOT NULL,
    fkreservation_type INTEGER NOT NULL,
    mobile_number TEXT,
    email TEXT,
    fkboarding_at INTEGER,
    adult_count INTEGER DEFAULT 0,
    child_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to generate PNR
CREATE TRIGGER IF NOT EXISTS generate_pnr
AFTER INSERT ON bookingdata
FOR EACH ROW
BEGIN
    UPDATE bookingdata 
    SET pnr = printf('%010d', NEW.id + 1000000000)
    WHERE id = NEW.id;
END;

-- =====================================================
-- TABLE: passengerdata
-- Passenger details per booking
-- =====================================================
CREATE TABLE IF NOT EXISTS passengerdata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fkbookingdata INTEGER NOT NULL,
    p_name TEXT NOT NULL,
    p_age INTEGER NOT NULL,
    p_gender TEXT CHECK(p_gender IN ('M', 'F', 'O')),
    is_child INTEGER DEFAULT 0,
    is_senior INTEGER DEFAULT 0,
    is_pwd INTEGER DEFAULT 0,
    base_fare REAL DEFAULT 0,
    current_seat_status TEXT,
    updated_seat_status TEXT,
    coach_code TEXT,
    seat_number INTEGER,
    berth_type TEXT,
    FOREIGN KEY (fkbookingdata) REFERENCES bookingdata(id)
);

-- =====================================================
-- TABLE: seatsondate
-- Seat availability tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS seatsondate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    coach_code TEXT NOT NULL,
    date_of_journey DATE NOT NULL,
    total_seats INTEGER DEFAULT 0,
    booked_seats INTEGER DEFAULT 0,
    available_seats INTEGER GENERATED ALWAYS AS (total_seats - booked_seats) STORED,
    UNIQUE(train_number, coach_code, date_of_journey)
);

-- =====================================================
-- TABLE: waitinglistondate
-- Waiting list tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS waitinglistondate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    coach_code TEXT NOT NULL,
    date_of_journey DATE NOT NULL,
    seat_sequence INTEGER NOT NULL,
    fkpassenger_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: email_otps
-- OTP storage for authentication
-- =====================================================
CREATE TABLE IF NOT EXISTS email_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Coach Types
INSERT OR IGNORE INTO coachtype (coach_code, description, seats_per_coach) VALUES
('1A', 'First Class AC', 18),
('2A', 'Second AC', 48),
('3A', 'Third AC', 64),
('SL', 'Sleeper', 72),
('CC', 'Chair Car', 78),
('FC', 'First Class', 18),
('2S', 'Second Sitting', 108),
('EC', 'Executive Chair Car', 56),
('EA', 'Executive AC', 48),
('E3', 'Economy AC 3-Tier', 72);

-- Reservation Types
INSERT OR IGNORE INTO reservationtype (type_code, description) VALUES
('GEN', 'General Quota'),
('TTL', 'Tatkal Quota'),
('PTL', 'Premium Tatkal'),
('LADIES', 'Ladies Quota'),
('SENIOR', 'Senior Citizen'),
('PWD', 'Persons with Disability');

-- Fare Rules (per km rates)
INSERT OR IGNORE INTO journey_fare (coach_code, seat_type, fare_per_km, discount_percent, flat_addon) VALUES
('1A', 'GEN', 4.50, 0, 150),
('1A', 'TTL', 5.50, 0, 400),
('2A', 'GEN', 2.75, 0, 100),
('2A', 'TTL', 3.50, 0, 300),
('3A', 'GEN', 1.85, 0, 75),
('3A', 'TTL', 2.50, 0, 250),
('SL', 'GEN', 0.85, 0, 50),
('SL', 'TTL', 1.20, 0, 150),
('CC', 'GEN', 1.50, 0, 60),
('CC', 'TTL', 2.00, 0, 200),
('FC', 'GEN', 3.50, 0, 120),
('2S', 'GEN', 0.45, 0, 25),
('EC', 'GEN', 3.00, 0, 100),
('EA', 'GEN', 3.25, 0, 110),
('E3', 'GEN', 1.75, 0, 70);

-- =====================================================
-- STATIONS DATA (100+ Major Indian Railway Stations)
-- =====================================================
INSERT OR IGNORE INTO stations (code, station_name, zone) VALUES
('NDLS', 'New Delhi', 'NR'),
('BCT', 'Mumbai Central', 'WR'),
('CSMT', 'Chhatrapati Shivaji Terminus', 'CR'),
('HWH', 'Howrah Junction', 'ER'),
('MAS', 'Chennai Central', 'SR'),
('SBC', 'Bangalore City Junction', 'SWR'),
('SC', 'Secunderabad Junction', 'SCR'),
('ADI', 'Ahmedabad Junction', 'WR'),
('JP', 'Jaipur Junction', 'NWR'),
('LKO', 'Lucknow Charbagh', 'NR'),
('CNB', 'Kanpur Central', 'NCR'),
('PNBE', 'Patna Junction', 'ECR'),
('BPL', 'Bhopal Junction', 'WCR'),
('NGP', 'Nagpur Junction', 'CR'),
('PUNE', 'Pune Junction', 'CR'),
('CSTM', 'CST Mumbai', 'CR'),
('GKP', 'Gorakhpur Junction', 'NER'),
('JHS', 'Jhansi Junction', 'NCR'),
('AGC', 'Agra Cantt', 'NCR'),
('ALLP', 'Alappuzha', 'SR'),
('VSKP', 'Visakhapatnam', 'ECoR'),
('BBS', 'Bhubaneswar', 'ECoR'),
('TATA', 'Tatanagar Junction', 'SER'),
('RNC', 'Ranchi Junction', 'SER'),
('DHN', 'Dhanbad Junction', 'ECR'),
('MGS', 'Mughal Sarai Junction', 'NCR'),
('GZB', 'Ghaziabad Junction', 'NR'),
('MTJ', 'Mathura Junction', 'NCR'),
('GWL', 'Gwalior Junction', 'NCR'),
('BRC', 'Vadodara Junction', 'WR'),
('ST', 'Surat', 'WR'),
('RTM', 'Ratlam Junction', 'WR'),
('UJN', 'Ujjain Junction', 'WR'),
('INDB', 'Indore Junction', 'WR'),
('JBP', 'Jabalpur', 'WCR'),
('KGM', 'Kathgodam', 'NER'),
('DDN', 'Dehradun', 'NR'),
('HW', 'Haridwar Junction', 'NR'),
('RKSH', 'Rishikesh', 'NR'),
('UDZ', 'Udaipur City', 'NWR'),
('AII', 'Ajmer Junction', 'NWR'),
('JU', 'Jodhpur Junction', 'NWR'),
('BKN', 'Bikaner Junction', 'NWR'),
('ABR', 'Abu Road', 'NWR'),
('KPD', 'Katpadi Junction', 'SR'),
('TPJ', 'Tiruchirappalli Junction', 'SR'),
('MDU', 'Madurai Junction', 'SR'),
('TVC', 'Trivandrum Central', 'SR'),
('ERS', 'Ernakulam Junction', 'SR'),
('CBE', 'Coimbatore Junction', 'SR'),
('MYS', 'Mysore Junction', 'SWR'),
('UBL', 'Hubballi Junction', 'SWR'),
('BJU', 'Belgaum', 'SWR'),
('LD', 'Londa Junction', 'SWR'),
('MAO', 'Madgaon Junction', 'KR'),
('RN', 'Ratnagiri', 'KR'),
('KDGD', 'Kudal', 'KR'),
('SWV', 'Sawantwadi Road', 'KR'),
('RJT', 'Rajkot Junction', 'WR'),
('JAM', 'Jamnagar', 'WR'),
('BHUJ', 'Bhuj', 'WR'),
('PGT', 'Porbandar', 'WR'),
('VRL', 'Veraval', 'WR'),
('DVG', 'Davangere', 'SWR'),
('GTL', 'Guntakal Junction', 'SCR'),
('KCG', 'Kacheguda', 'SCR'),
('NZB', 'Nizamabad Junction', 'SCR'),
('NED', 'Nanded', 'SCR'),
('AWB', 'Aurangabad', 'CR'),
('NMZ', 'Nashik Road', 'CR'),
('BSL', 'Bhusaval Junction', 'CR'),
('AK', 'Akola Junction', 'CR'),
('BZA', 'Vijayawada Junction', 'SCR'),
('GNT', 'Guntur Junction', 'SCR'),
('TPTY', 'Tirupati', 'SCR'),
('RU', 'Renigunta Junction', 'SCR'),
('SUR', 'Solapur Junction', 'CR'),
('GR', 'Gulbarga', 'SCR'),
('WL', 'Wadi Junction', 'SCR'),
('YPR', 'Yesvantpur Junction', 'SWR'),
('KJM', 'Krishnarajapuram', 'SWR'),
('BAND', 'Banaswadi', 'SWR'),
('BYPL', 'Baiyyappanahalli', 'SWR'),
('DMM', 'Dharmavaram Junction', 'SCR'),
('ATP', 'Anantapur', 'SCR'),
('KRNT', 'Kurnool Town', 'SCR'),
('NDL', 'Nandyal', 'SCR'),
('OGL', 'Ongole', 'SCR'),
('NLDA', 'Nellore', 'SCR'),
('GDR', 'Gudur Junction', 'SCR'),
('SPR', 'Sullurpeta', 'SCR'),
('PAK', 'Pakala Junction', 'SCR'),
('KPD', 'Katpadi Junction', 'SR'),
('JTJ', 'Jolarpettai Junction', 'SR'),
('KPN', 'Krishnapur', 'SR'),
('SA', 'Salem Junction', 'SR'),
('ED', 'Erode Junction', 'SR'),
('PGT', 'Palakkad Junction', 'SR'),
('TCR', 'Thrissur', 'SR'),
('AWY', 'Aluva', 'SR');

-- =====================================================
-- TRAINS DATA (60 Popular Indian Trains)
-- =====================================================
INSERT OR IGNORE INTO trains (train_number, train_name, train_type) VALUES
('12301', 'Rajdhani Express', 'RAJ'),
('12302', 'Rajdhani Express', 'RAJ'),
('12951', 'Mumbai Rajdhani', 'RAJ'),
('12952', 'Mumbai Rajdhani', 'RAJ'),
('12259', 'Sealdah Duronto', 'DUR'),
('12260', 'Sealdah Duronto', 'DUR'),
('12313', 'Sealdah Rajdhani', 'RAJ'),
('12314', 'Sealdah Rajdhani', 'RAJ'),
('12621', 'Tamil Nadu Express', 'SF'),
('12622', 'Tamil Nadu Express', 'SF'),
('12627', 'Karnataka Express', 'SF'),
('12628', 'Karnataka Express', 'SF'),
('12723', 'Telangana Express', 'SF'),
('12724', 'Telangana Express', 'SF'),
('12839', 'Chennai Mail', 'MAIL'),
('12840', 'Chennai Mail', 'MAIL'),
('12625', 'Kerala Express', 'SF'),
('12626', 'Kerala Express', 'SF'),
('12903', 'Golden Temple Mail', 'MAIL'),
('12904', 'Golden Temple Mail', 'MAIL'),
('12001', 'Shatabdi Express', 'SHTB'),
('12002', 'Shatabdi Express', 'SHTB'),
('12003', 'Lucknow Shatabdi', 'SHTB'),
('12004', 'Lucknow Shatabdi', 'SHTB'),
('12005', 'Kalka Shatabdi', 'SHTB'),
('12006', 'Kalka Shatabdi', 'SHTB'),
('12009', 'Ahmedabad Shatabdi', 'SHTB'),
('12010', 'Ahmedabad Shatabdi', 'SHTB'),
('12013', 'Amritsar Shatabdi', 'SHTB'),
('12014', 'Amritsar Shatabdi', 'SHTB'),
('12423', 'Dibrugarh Rajdhani', 'RAJ'),
('12424', 'Dibrugarh Rajdhani', 'RAJ'),
('12431', 'Trivandrum Rajdhani', 'RAJ'),
('12432', 'Trivandrum Rajdhani', 'RAJ'),
('12433', 'Chennai Rajdhani', 'RAJ'),
('12434', 'Chennai Rajdhani', 'RAJ'),
('12435', 'Dibrugarh Rajdhani', 'RAJ'),
('12436', 'Dibrugarh Rajdhani', 'RAJ'),
('12437', 'Secunderabad Rajdhani', 'RAJ'),
('12438', 'Secunderabad Rajdhani', 'RAJ'),
('12309', 'Rajdhani Express', 'RAJ'),
('12310', 'Rajdhani Express', 'RAJ'),
('12559', 'Shiv Ganga Express', 'SF'),
('12560', 'Shiv Ganga Express', 'SF'),
('12801', 'Purushottam Express', 'SF'),
('12802', 'Purushottam Express', 'SF'),
('12803', 'Swarna Jayanti Express', 'SF'),
('12804', 'Swarna Jayanti Express', 'SF'),
('12615', 'Grand Trunk Express', 'SF'),
('12616', 'Grand Trunk Express', 'SF'),
('12617', 'Mangala Lakshadweep', 'SF'),
('12618', 'Mangala Lakshadweep', 'SF'),
('12619', 'Matsyagandha Express', 'SF'),
('12620', 'Matsyagandha Express', 'SF'),
('12649', 'Karnataka Sampark Kranti', 'SF'),
('12650', 'Karnataka Sampark Kranti', 'SF'),
('12707', 'Andhra Pradesh Express', 'SF'),
('12708', 'Andhra Pradesh Express', 'SF'),
('12711', 'Pinakini Express', 'SF'),
('12712', 'Pinakini Express', 'SF');

-- =====================================================
-- COACH CONFIGURATIONS FOR ALL TRAINS
-- =====================================================
INSERT OR IGNORE INTO coaches (train_number, bogi_count_sl, bogi_count_1a, bogi_count_2a, bogi_count_3a, bogi_count_cc, bogi_count_fc, bogi_count_2s, bogi_count_ec, bogi_count_ea, bogi_count_e3)
SELECT train_number, 
    CASE WHEN train_type = 'RAJ' THEN 0 ELSE 8 END,
    CASE WHEN train_type = 'RAJ' THEN 2 ELSE 1 END,
    CASE WHEN train_type = 'RAJ' THEN 4 ELSE 2 END,
    CASE WHEN train_type = 'RAJ' THEN 6 ELSE 4 END,
    CASE WHEN train_type = 'SHTB' THEN 12 ELSE 0 END,
    0,
    CASE WHEN train_type IN ('MAIL', 'EXP') THEN 4 ELSE 0 END,
    CASE WHEN train_type = 'SHTB' THEN 2 ELSE 0 END,
    0,
    0
FROM trains;

-- =====================================================
-- SCHEDULES DATA (Sample Routes)
-- =====================================================

-- 12301/12302 Howrah - New Delhi Rajdhani
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
('12301', 'HWH', 'Howrah Junction', 1, '--', '16:55', 0, 1),
('12301', 'DHN', 'Dhanbad Junction', 2, '19:53', '19:58', 254, 1),
('12301', 'MGS', 'Mughal Sarai Junction', 3, '23:25', '23:45', 526, 1),
('12301', 'CNB', 'Kanpur Central', 4, '02:50', '02:55', 786, 2),
('12301', 'NDLS', 'New Delhi', 5, '09:55', '--', 1447, 2),
('12302', 'NDLS', 'New Delhi', 1, '--', '17:00', 0, 1),
('12302', 'CNB', 'Kanpur Central', 2, '22:15', '22:20', 440, 1),
('12302', 'MGS', 'Mughal Sarai Junction', 3, '01:25', '01:45', 780, 2),
('12302', 'DHN', 'Dhanbad Junction', 4, '05:05', '05:10', 921, 2),
('12302', 'HWH', 'Howrah Junction', 5, '09:55', '--', 1447, 2);

-- 12951/12952 Mumbai - New Delhi Rajdhani
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
('12951', 'BCT', 'Mumbai Central', 1, '--', '17:00', 0, 1),
('12951', 'BRC', 'Vadodara Junction', 2, '21:02', '21:05', 392, 1),
('12951', 'RTM', 'Ratlam Junction', 3, '00:17', '00:22', 643, 2),
('12951', 'JP', 'Jaipur Junction', 4, '04:25', '04:30', 1067, 2),
('12951', 'NDLS', 'New Delhi', 5, '08:35', '--', 1384, 2),
('12952', 'NDLS', 'New Delhi', 1, '--', '16:25', 0, 1),
('12952', 'JP', 'Jaipur Junction', 2, '20:35', '20:40', 308, 1),
('12952', 'RTM', 'Ratlam Junction', 3, '01:03', '01:08', 741, 2),
('12952', 'BRC', 'Vadodara Junction', 4, '04:05', '04:10', 992, 2),
('12952', 'BCT', 'Mumbai Central', 5, '08:15', '--', 1384, 2);

-- 12621/12622 Tamil Nadu Express
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
('12621', 'NDLS', 'New Delhi', 1, '--', '22:30', 0, 1),
('12621', 'AGC', 'Agra Cantt', 2, '00:45', '00:55', 195, 2),
('12621', 'JHS', 'Jhansi Junction', 3, '03:30', '03:35', 403, 2),
('12621', 'BPL', 'Bhopal Junction', 4, '07:10', '07:25', 700, 2),
('12621', 'NGP', 'Nagpur Junction', 5, '13:15', '13:30', 1093, 2),
('12621', 'BZA', 'Vijayawada Junction', 6, '22:05', '22:25', 1509, 2),
('12621', 'MAS', 'Chennai Central', 7, '06:45', '--', 2175, 3),
('12622', 'MAS', 'Chennai Central', 1, '--', '22:00', 0, 1),
('12622', 'BZA', 'Vijayawada Junction', 2, '05:30', '05:50', 431, 2),
('12622', 'NGP', 'Nagpur Junction', 3, '14:00', '14:15', 1082, 2),
('12622', 'BPL', 'Bhopal Junction', 4, '20:05', '20:20', 1475, 2),
('12622', 'JHS', 'Jhansi Junction', 5, '23:55', '00:00', 1772, 2),
('12622', 'AGC', 'Agra Cantt', 6, '02:20', '02:30', 1980, 3),
('12622', 'NDLS', 'New Delhi', 7, '06:15', '--', 2175, 3);

-- 12627/12628 Karnataka Express
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
('12627', 'NDLS', 'New Delhi', 1, '--', '21:15', 0, 1),
('12627', 'AGC', 'Agra Cantt', 2, '23:35', '23:45', 195, 1),
('12627', 'JHS', 'Jhansi Junction', 3, '02:20', '02:30', 403, 2),
('12627', 'BPL', 'Bhopal Junction', 4, '06:35', '06:50', 700, 2),
('12627', 'NGP', 'Nagpur Junction', 5, '13:20', '13:35', 1093, 2),
('12627', 'SC', 'Secunderabad Junction', 6, '21:45', '22:00', 1507, 2),
('12627', 'GTL', 'Guntakal Junction', 7, '02:45', '03:05', 1852, 3),
('12627', 'SBC', 'Bangalore City Junction', 8, '09:40', '--', 2444, 3),
('12628', 'SBC', 'Bangalore City Junction', 1, '--', '19:20', 0, 1),
('12628', 'GTL', 'Guntakal Junction', 2, '02:00', '02:20', 336, 2),
('12628', 'SC', 'Secunderabad Junction', 3, '08:05', '08:20', 592, 2),
('12628', 'NGP', 'Nagpur Junction', 4, '16:00', '16:15', 937, 2),
('12628', 'BPL', 'Bhopal Junction', 5, '22:15', '22:30', 1351, 2),
('12628', 'JHS', 'Jhansi Junction', 6, '01:55', '02:05', 1648, 3),
('12628', 'AGC', 'Agra Cantt', 7, '04:30', '04:40', 2041, 3),
('12628', 'NDLS', 'New Delhi', 8, '06:50', '--', 2444, 3);

-- 12625/12626 Kerala Express
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
('12625', 'NDLS', 'New Delhi', 1, '--', '11:25', 0, 1),
('12625', 'MTJ', 'Mathura Junction', 2, '13:05', '13:10', 141, 1),
('12625', 'AGC', 'Agra Cantt', 3, '14:00', '14:10', 195, 1),
('12625', 'JHS', 'Jhansi Junction', 4, '16:30', '16:40', 403, 1),
('12625', 'BPL', 'Bhopal Junction', 5, '20:35', '20:50', 700, 1),
('12625', 'NGP', 'Nagpur Junction', 6, '02:50', '03:05', 1093, 2),
('12625', 'BZA', 'Vijayawada Junction', 7, '11:55', '12:15', 1509, 2),
('12625', 'ERS', 'Ernakulam Junction', 8, '04:50', '05:00', 2818, 3),
('12625', 'TVC', 'Trivandrum Central', 9, '09:30', '--', 3035, 3),
('12626', 'TVC', 'Trivandrum Central', 1, '--', '11:15', 0, 1),
('12626', 'ERS', 'Ernakulam Junction', 2, '14:35', '14:45', 217, 1),
('12626', 'BZA', 'Vijayawada Junction', 3, '07:05', '07:30', 1526, 2),
('12626', 'NGP', 'Nagpur Junction', 4, '16:15', '16:30', 1942, 2),
('12626', 'BPL', 'Bhopal Junction', 5, '22:20', '22:35', 2335, 2),
('12626', 'JHS', 'Jhansi Junction', 6, '01:50', '02:00', 2632, 3),
('12626', 'AGC', 'Agra Cantt', 7, '04:05', '04:15', 2840, 3),
('12626', 'MTJ', 'Mathura Junction', 8, '04:50', '04:55', 2894, 3),
('12626', 'NDLS', 'New Delhi', 9, '06:55', '--', 3035, 3);

-- 12001/12002 Bhopal Shatabdi
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
('12001', 'NDLS', 'New Delhi', 1, '--', '06:00', 0, 1),
('12001', 'AGC', 'Agra Cantt', 2, '07:57', '08:00', 195, 1),
('12001', 'GWL', 'Gwalior Junction', 3, '08:58', '09:00', 306, 1),
('12001', 'JHS', 'Jhansi Junction', 4, '10:18', '10:25', 403, 1),
('12001', 'BPL', 'Bhopal Junction', 5, '13:40', '--', 700, 1),
('12002', 'BPL', 'Bhopal Junction', 1, '--', '14:30', 0, 1),
('12002', 'JHS', 'Jhansi Junction', 2, '17:45', '17:50', 297, 1),
('12002', 'GWL', 'Gwalior Junction', 3, '19:00', '19:03', 394, 1),
('12002', 'AGC', 'Agra Cantt', 4, '20:05', '20:08', 505, 1),
('12002', 'NDLS', 'New Delhi', 5, '22:30', '--', 700, 1);

-- 12003/12004 Lucknow Shatabdi
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
('12003', 'NDLS', 'New Delhi', 1, '--', '06:10', 0, 1),
('12003', 'GZB', 'Ghaziabad Junction', 2, '06:34', '06:36', 25, 1),
('12003', 'CNB', 'Kanpur Central', 3, '10:32', '10:35', 440, 1),
('12003', 'LKO', 'Lucknow Charbagh', 4, '12:05', '--', 510, 1),
('12004', 'LKO', 'Lucknow Charbagh', 1, '--', '15:15', 0, 1),
('12004', 'CNB', 'Kanpur Central', 2, '16:45', '16:48', 70, 1),
('12004', 'GZB', 'Ghaziabad Junction', 3, '20:40', '20:42', 485, 1),
('12004', 'NDLS', 'New Delhi', 4, '21:20', '--', 510, 1);

-- More schedules for trains with key routes
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day) VALUES
-- 12723/12724 Telangana Express
('12723', 'NDLS', 'New Delhi', 1, '--', '06:55', 0, 1),
('12723', 'AGC', 'Agra Cantt', 2, '09:13', '09:18', 195, 1),
('12723', 'JHS', 'Jhansi Junction', 3, '11:35', '11:45', 403, 1),
('12723', 'BPL', 'Bhopal Junction', 4, '15:30', '15:45', 700, 1),
('12723', 'NGP', 'Nagpur Junction', 5, '21:40', '21:55', 1093, 1),
('12723', 'SC', 'Secunderabad Junction', 6, '06:15', '--', 1507, 2),
('12724', 'SC', 'Secunderabad Junction', 1, '--', '18:10', 0, 1),
('12724', 'NGP', 'Nagpur Junction', 2, '02:00', '02:15', 414, 2),
('12724', 'BPL', 'Bhopal Junction', 3, '08:10', '08:25', 807, 2),
('12724', 'JHS', 'Jhansi Junction', 4, '11:35', '11:45', 1104, 2),
('12724', 'AGC', 'Agra Cantt', 5, '14:00', '14:05', 1312, 2),
('12724', 'NDLS', 'New Delhi', 6, '17:35', '--', 1507, 2);

-- Sample schedules for remaining trains (abbreviated)
INSERT OR IGNORE INTO schedules (train_number, station_code, station_name, station_sequence, arrival, departure, kilometer, running_day)
SELECT 
    t.train_number,
    'NDLS',
    'New Delhi',
    1,
    '--',
    '06:00',
    0,
    1
FROM trains t
WHERE t.train_number NOT IN (SELECT DISTINCT train_number FROM schedules WHERE station_sequence = 1);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_schedules_train ON schedules(train_number);
CREATE INDEX IF NOT EXISTS idx_schedules_station ON schedules(station_code);
CREATE INDEX IF NOT EXISTS idx_bookingdata_pnr ON bookingdata(pnr);
CREATE INDEX IF NOT EXISTS idx_bookingdata_email ON bookingdata(email);
CREATE INDEX IF NOT EXISTS idx_passengerdata_booking ON passengerdata(fkbookingdata);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
