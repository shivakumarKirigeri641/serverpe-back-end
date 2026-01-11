-- ============================================================
-- MOCK TRAIN RESERVATION DATABASE - STUDENT EDITION
-- ============================================================
-- Popular stations and 50 trains for student training
-- Generated for ServerPE Student Training Package
-- ============================================================

-- Disable foreign key checks during import
SET session_replication_role = 'replica';

-- ============================================================
-- 1. MASTER DATA (Required)
-- ============================================================

-- Coach Types
TRUNCATE TABLE coachtype CASCADE;
INSERT INTO coachtype (id, coach_code, description, seats_per_coach) VALUES
(1, '1A', 'First Class AC', 18),
(2, '2A', 'Second AC', 46),
(3, '3A', 'Third AC', 64),
(4, 'SL', 'Sleeper', 72),
(5, 'CC', 'Chair Car', 78),
(6, '2S', 'Second Sitting', 108),
(7, 'EC', 'Executive Chair Car', 56),
(8, 'EA', 'Executive Anubhuti', 56),
(9, 'E3', 'Economy Third AC', 78),
(10, 'FC', 'First Class', 18);

-- Reservation Types
TRUNCATE TABLE reservationtype CASCADE;
INSERT INTO reservationtype (id, type_code, description) VALUES
(1, 'GEN', 'General'),
(2, 'TTL', 'Tatkal'),
(3, 'PTL', 'Premium Tatkal'),
(4, 'LADIES', 'Ladies Quota'),
(5, 'SENIOR', 'Senior Citizen'),
(6, 'PWD', 'Persons with Disability'),
(7, 'CHILD', 'Child');

-- Journey Fare Rules (per km rates)
TRUNCATE TABLE journey_fare CASCADE;
INSERT INTO journey_fare (id, coach_code, seat_type, fare_per_km, discount_percent, flat_addon) VALUES
(1, '1A', 'GEN', 4.50, 0, 50),
(2, '1A', 'TTL', 4.50, 0, 400),
(3, '2A', 'GEN', 2.50, 0, 40),
(4, '2A', 'TTL', 2.50, 0, 300),
(5, '3A', 'GEN', 1.80, 0, 30),
(6, '3A', 'TTL', 1.80, 0, 250),
(7, 'SL', 'GEN', 0.90, 0, 20),
(8, 'SL', 'TTL', 0.90, 0, 150),
(9, 'CC', 'GEN', 1.50, 0, 25),
(10, 'CC', 'TTL', 1.50, 0, 200),
(11, '2S', 'GEN', 0.50, 0, 15),
(12, 'EC', 'GEN', 3.00, 0, 60),
(13, 'EA', 'GEN', 3.20, 0, 70),
(14, 'E3', 'GEN', 1.50, 0, 25),
(15, 'FC', 'GEN', 3.80, 0, 45),
-- Discounted categories
(16, 'SL', 'SENIOR', 0.90, 40, 20),
(17, '3A', 'SENIOR', 1.80, 40, 30),
(18, '2A', 'SENIOR', 2.50, 40, 40),
(19, 'SL', 'LADIES', 0.90, 0, 20),
(20, '3A', 'LADIES', 1.80, 0, 30),
(21, 'SL', 'CHILD', 0.90, 50, 10),
(22, '3A', 'CHILD', 1.80, 50, 15),
(23, 'SL', 'PWD', 0.90, 75, 20),
(24, '3A', 'PWD', 1.80, 75, 30);

-- ============================================================
-- 2. POPULAR STATIONS (Major Cities)
-- ============================================================

TRUNCATE TABLE stations CASCADE;
INSERT INTO stations (id, code, station_name, zone, address) VALUES
-- Metro Cities
(1, 'NDLS', 'New Delhi', 'NR', 'Paharganj, New Delhi, Delhi'),
(2, 'BCT', 'Mumbai Central', 'WR', 'Mumbai Central, Mumbai, Maharashtra'),
(3, 'CSMT', 'Chhatrapati Shivaji Terminus', 'CR', 'Fort, Mumbai, Maharashtra'),
(4, 'HWH', 'Howrah Junction', 'ER', 'Howrah, West Bengal'),
(5, 'MAS', 'Chennai Central', 'SR', 'Park Town, Chennai, Tamil Nadu'),
(6, 'SBC', 'Bengaluru City Junction', 'SWR', 'Majestic, Bengaluru, Karnataka'),
(7, 'SC', 'Secunderabad Junction', 'SCR', 'Secunderabad, Hyderabad, Telangana'),
(8, 'ADI', 'Ahmedabad Junction', 'WR', 'Kalupur, Ahmedabad, Gujarat'),
(9, 'PUNE', 'Pune Junction', 'CR', 'Pune, Maharashtra'),
(10, 'JP', 'Jaipur Junction', 'NWR', 'Jaipur, Rajasthan'),
-- North India
(11, 'LKO', 'Lucknow Junction', 'NR', 'Charbagh, Lucknow, Uttar Pradesh'),
(12, 'CNB', 'Kanpur Central', 'NCR', 'Kanpur, Uttar Pradesh'),
(13, 'ALD', 'Prayagraj Junction', 'NCR', 'Prayagraj, Uttar Pradesh'),
(14, 'BSB', 'Varanasi Junction', 'NER', 'Varanasi, Uttar Pradesh'),
(15, 'AGC', 'Agra Cantt', 'NCR', 'Agra, Uttar Pradesh'),
(16, 'CDG', 'Chandigarh Junction', 'NR', 'Chandigarh'),
(17, 'ASR', 'Amritsar Junction', 'NR', 'Amritsar, Punjab'),
(18, 'UMB', 'Ambala Cantt', 'NR', 'Ambala, Haryana'),
(19, 'DDN', 'Dehradun', 'NR', 'Dehradun, Uttarakhand'),
(20, 'GKP', 'Gorakhpur Junction', 'NER', 'Gorakhpur, Uttar Pradesh'),
-- East India
(21, 'PNBE', 'Patna Junction', 'ECR', 'Patna, Bihar'),
(22, 'DNR', 'Danapur', 'ECR', 'Danapur, Patna, Bihar'),
(23, 'RJPB', 'Rajendra Nagar Terminal', 'ECR', 'Patna, Bihar'),
(24, 'RNC', 'Ranchi Junction', 'SER', 'Ranchi, Jharkhand'),
(25, 'TATA', 'Tatanagar Junction', 'SER', 'Jamshedpur, Jharkhand'),
(26, 'BBS', 'Bhubaneswar', 'ECoR', 'Bhubaneswar, Odisha'),
(27, 'GHY', 'Guwahati', 'NFR', 'Guwahati, Assam'),
-- West India
(28, 'BRC', 'Vadodara Junction', 'WR', 'Vadodara, Gujarat'),
(29, 'ST', 'Surat', 'WR', 'Surat, Gujarat'),
(30, 'RTM', 'Ratlam Junction', 'WR', 'Ratlam, Madhya Pradesh'),
(31, 'BPL', 'Bhopal Junction', 'WCR', 'Bhopal, Madhya Pradesh'),
(32, 'JBP', 'Jabalpur Junction', 'WCR', 'Jabalpur, Madhya Pradesh'),
(33, 'INDB', 'Indore Junction', 'WR', 'Indore, Madhya Pradesh'),
(34, 'NGP', 'Nagpur Junction', 'CR', 'Nagpur, Maharashtra'),
-- South India
(35, 'CBE', 'Coimbatore Junction', 'SR', 'Coimbatore, Tamil Nadu'),
(36, 'MDU', 'Madurai Junction', 'SR', 'Madurai, Tamil Nadu'),
(37, 'TVC', 'Thiruvananthapuram Central', 'SR', 'Thiruvananthapuram, Kerala'),
(38, 'ERS', 'Ernakulam Junction', 'SR', 'Kochi, Kerala'),
(39, 'CLT', 'Kozhikode', 'SR', 'Kozhikode, Kerala'),
(40, 'MYS', 'Mysuru Junction', 'SWR', 'Mysuru, Karnataka'),
(41, 'UBL', 'Hubballi Junction', 'SWR', 'Hubballi, Karnataka'),
(42, 'VSKP', 'Visakhapatnam Junction', 'ECoR', 'Visakhapatnam, Andhra Pradesh'),
(43, 'BZA', 'Vijayawada Junction', 'SCR', 'Vijayawada, Andhra Pradesh'),
(44, 'TPTY', 'Tirupati', 'SCR', 'Tirupati, Andhra Pradesh'),
(45, 'RJT', 'Rajkot Junction', 'WR', 'Rajkot, Gujarat');

-- ============================================================
-- 3. POPULAR TRAINS (50 Trains)
-- ============================================================

TRUNCATE TABLE trains CASCADE;
INSERT INTO trains (id, train_number, train_name, train_type, run_days) VALUES
-- Rajdhani Express (Premium)
(1, '12301', 'Howrah Rajdhani Express', 'RAJDHANI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(2, '12951', 'Mumbai Rajdhani Express', 'RAJDHANI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(3, '12309', 'Rajdhani Express', 'RAJDHANI', 'Mon,Wed,Fri'),
(4, '12433', 'Chennai Rajdhani Express', 'RAJDHANI', 'Wed,Fri'),
(5, '12957', 'Swarna Jayanti Rajdhani', 'RAJDHANI', 'Mon,Tue,Wed,Thu,Fri,Sat'),
-- Shatabdi Express
(6, '12001', 'Bhopal Shatabdi Express', 'SHATABDI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(7, '12002', 'New Delhi Shatabdi Express', 'SHATABDI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(8, '12011', 'Lucknow Shatabdi Express', 'SHATABDI', 'Mon,Tue,Wed,Thu,Fri,Sat'),
(9, '12029', 'Swarna Shatabdi Express', 'SHATABDI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(10, '12031', 'Amritsar Shatabdi Express', 'SHATABDI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
-- Duronto Express
(11, '12213', 'Delhi Duronto Express', 'DURONTO', 'Tue,Sat'),
(12, '12259', 'Sealdah Duronto Express', 'DURONTO', 'Mon,Thu'),
(13, '12289', 'Mumbai Duronto Express', 'DURONTO', 'Wed,Sun'),
-- Superfast Express
(14, '12801', 'Purushottam Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(15, '12839', 'Chennai Mail', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(16, '12621', 'Tamil Nadu Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(17, '12627', 'Karnataka Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(18, '12723', 'Telangana Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(19, '12615', 'Grand Trunk Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(20, '12903', 'Golden Temple Mail', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
-- Express Trains
(21, '12137', 'Punjab Mail', 'EXPRESS', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(22, '12381', 'Poorva Express', 'EXPRESS', 'Mon,Wed,Sat'),
(23, '12311', 'Kalka Mail', 'EXPRESS', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(24, '12423', 'Dibrugarh Town Rajdhani', 'RAJDHANI', 'Mon,Tue,Wed,Fri,Sat,Sun'),
(25, '12505', 'North East Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
-- Vande Bharat Express
(26, '22435', 'Vande Bharat Express', 'VANDEBHARAT', 'Mon,Tue,Wed,Thu,Fri,Sat'),
(27, '22439', 'Vande Bharat Express', 'VANDEBHARAT', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(28, '20501', 'Agra Vande Bharat', 'VANDEBHARAT', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
-- Jan Shatabdi
(29, '12051', 'Jan Shatabdi Express', 'JANSHATABDI', 'Mon,Tue,Wed,Thu,Fri,Sat'),
(30, '12055', 'Jan Shatabdi Express', 'JANSHATABDI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
-- Garib Rath
(31, '12203', 'Garib Rath Express', 'GARIBRATH', 'Mon,Thu'),
(32, '12205', 'Garib Rath Express', 'GARIBRATH', 'Tue,Fri'),
-- More Express Trains
(33, '12559', 'Shiv Ganga Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(34, '12561', 'Swatantrata Senani Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(35, '12155', 'Sampurna Kranti Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(36, '12303', 'Poorva Express', 'SUPERFAST', 'Tue,Thu,Sun'),
(37, '12307', 'Howrah Jodhpur Express', 'SUPERFAST', 'Wed,Sat'),
(38, '12649', 'Karnataka Sampark Kranti', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(39, '12625', 'Kerala Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(40, '12611', 'Chennai Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(41, '12247', 'Yuva Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri'),
(42, '12985', 'Jaipur Double Decker', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(43, '12919', 'Malwa Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(44, '12953', 'August Kranti Rajdhani', 'RAJDHANI', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(45, '12261', 'Mumbai Duronto', 'DURONTO', 'Mon,Thu'),
(46, '12269', 'Chennai Duronto', 'DURONTO', 'Tue,Fri'),
(47, '12715', 'Sachkhand Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(48, '12409', 'Gondwana Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(49, '12123', 'Deccan Queen', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
(50, '12125', 'Pragati Express', 'SUPERFAST', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun');

-- ============================================================
-- 4. COACHES (For All 50 Trains)
-- ============================================================

TRUNCATE TABLE coaches CASCADE;
-- Generate coaches for each train (1A, 2A, 3A, SL, CC pattern)
INSERT INTO coaches (train_number, coach_code, coach_number, total_seats)
SELECT 
    t.train_number,
    c.coach_code,
    c.coach_code || LPAD(ROW_NUMBER() OVER (PARTITION BY t.train_number, c.coach_code ORDER BY t.train_number)::TEXT, 1, '0'),
    c.seats
FROM trains t
CROSS JOIN (
    VALUES 
        ('1A', 18), ('2A', 46), ('2A', 46),
        ('3A', 64), ('3A', 64), ('3A', 64),
        ('SL', 72), ('SL', 72), ('SL', 72), ('SL', 72),
        ('CC', 78), ('CC', 78)
) AS c(coach_code, seats);

-- ============================================================
-- 5. SCHEDULES (Sample routes for trains)
-- ============================================================

TRUNCATE TABLE schedules CASCADE;
-- Route 1: Delhi - Mumbai (12951 Mumbai Rajdhani)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12951', 'NDLS', 1, NULL, '16:55', 0, 0, 1),
('12951', 'RTM', 2, '23:10', '23:15', 5, 690, 1),
('12951', 'BRC', 3, '03:05', '03:10', 5, 950, 2),
('12951', 'ST', 4, '05:00', '05:02', 2, 1100, 2),
('12951', 'BCT', 5, '08:35', NULL, 0, 1386, 2);

-- Route 2: Delhi - Howrah (12301 Howrah Rajdhani)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12301', 'NDLS', 1, NULL, '16:55', 0, 0, 1),
('12301', 'CNB', 2, '21:05', '21:10', 5, 440, 1),
('12301', 'ALD', 3, '22:45', '22:50', 5, 565, 1),
('12301', 'BSB', 4, '01:00', '01:10', 10, 760, 2),
('12301', 'PNBE', 5, '05:15', '05:20', 5, 995, 2),
('12301', 'HWH', 6, '09:55', NULL, 0, 1447, 2);

-- Route 3: Delhi - Chennai (12621 Tamil Nadu Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12621', 'NDLS', 1, NULL, '22:30', 0, 0, 1),
('12621', 'AGC', 2, '00:30', '00:35', 5, 195, 2),
('12621', 'JBP', 3, '10:00', '10:10', 10, 790, 2),
('12621', 'NGP', 4, '15:00', '15:15', 15, 1090, 2),
('12621', 'BZA', 5, '01:45', '02:00', 15, 1520, 3),
('12621', 'MAS', 6, '07:00', NULL, 0, 2175, 3);

-- Route 4: Delhi - Bengaluru (12627 Karnataka Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12627', 'NDLS', 1, NULL, '21:15', 0, 0, 1),
('12627', 'AGC', 2, '23:15', '23:20', 5, 195, 1),
('12627', 'BPL', 3, '08:30', '08:45', 15, 700, 2),
('12627', 'NGP', 4, '14:55', '15:05', 10, 1090, 2),
('12627', 'SC', 5, '04:40', '04:55', 15, 1650, 3),
('12627', 'SBC', 6, '11:00', NULL, 0, 2444, 3);

-- Route 5: Delhi - Secunderabad (12723 Telangana Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12723', 'NDLS', 1, NULL, '06:55', 0, 0, 1),
('12723', 'AGC', 2, '08:50', '08:55', 5, 195, 1),
('12723', 'JBP', 3, '17:55', '18:05', 10, 790, 1),
('12723', 'NGP', 4, '23:15', '23:30', 15, 1090, 1),
('12723', 'SC', 5, '10:45', NULL, 0, 1650, 2);

-- Route 6: Delhi - Bhopal (12001 Bhopal Shatabdi)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12001', 'NDLS', 1, NULL, '06:00', 0, 0, 1),
('12001', 'AGC', 2, '08:02', '08:05', 3, 195, 1),
('12001', 'BPL', 3, '13:50', NULL, 0, 700, 1);

-- Route 7: Delhi - Amritsar (12031 Amritsar Shatabdi)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12031', 'NDLS', 1, NULL, '16:30', 0, 0, 1),
('12031', 'UMB', 2, '18:35', '18:37', 2, 200, 1),
('12031', 'CDG', 3, '19:35', '19:37', 2, 250, 1),
('12031', 'ASR', 4, '22:15', NULL, 0, 449, 1);

-- Route 8: Mumbai - Ahmedabad (12009)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12953', 'BCT', 1, NULL, '17:40', 0, 0, 1),
('12953', 'ST', 2, '21:40', '21:45', 5, 263, 1),
('12953', 'BRC', 3, '23:30', '23:35', 5, 392, 1),
('12953', 'RTM', 4, '06:50', '07:00', 10, 700, 2),
('12953', 'JP', 5, '14:20', '14:30', 10, 1100, 2),
('12953', 'NDLS', 6, '19:25', NULL, 0, 1386, 2);

-- Route 9: Chennai - Trivandrum (12625 Kerala Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12625', 'NDLS', 1, NULL, '11:25', 0, 0, 1),
('12625', 'AGC', 2, '13:33', '13:38', 5, 195, 1),
('12625', 'BPL', 3, '22:15', '22:25', 10, 700, 1),
('12625', 'NGP', 4, '04:05', '04:15', 10, 1090, 2),
('12625', 'SC', 5, '15:55', '16:10', 15, 1650, 2),
('12625', 'CBE', 6, '05:45', '06:00', 15, 2290, 3),
('12625', 'ERS', 7, '10:30', '10:40', 10, 2570, 3),
('12625', 'TVC', 8, '14:55', NULL, 0, 2819, 3);

-- Route 10: Delhi - Lucknow (12011 Lucknow Shatabdi)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12011', 'NDLS', 1, NULL, '06:10', 0, 0, 1),
('12011', 'CNB', 2, '10:15', '10:20', 5, 440, 1),
('12011', 'LKO', 3, '12:40', NULL, 0, 510, 1);

-- ============================================================
-- MORE ROUTES FOR BETTER SEARCH RESULTS
-- ============================================================

-- Route 11: Delhi - Mumbai (12953 August Kranti Rajdhani) - 2nd train on same route
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12309', 'NDLS', 1, NULL, '16:00', 0, 0, 1),
('12309', 'BRC', 2, '01:45', '01:50', 5, 950, 2),
('12309', 'ST', 3, '03:35', '03:38', 3, 1100, 2),
('12309', 'BCT', 4, '07:00', NULL, 0, 1386, 2);

-- Route 12: Delhi - Mumbai via Pune (12137 Punjab Mail)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12137', 'NDLS', 1, NULL, '21:25', 0, 0, 1),
('12137', 'AGC', 2, '23:40', '23:45', 5, 195, 1),
('12137', 'BPL', 3, '08:40', '08:50', 10, 700, 2),
('12137', 'NGP', 4, '15:00', '15:10', 10, 1090, 2),
('12137', 'PUNE', 5, '04:15', '04:25', 10, 1710, 3),
('12137', 'CSMT', 6, '08:05', NULL, 0, 1910, 3);

-- Route 13: Delhi - Howrah (12303 Poorva Express) - 2nd train
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12303', 'NDLS', 1, NULL, '08:10', 0, 0, 1),
('12303', 'CNB', 2, '12:45', '12:50', 5, 440, 1),
('12303', 'ALD', 3, '14:30', '14:40', 10, 565, 1),
('12303', 'BSB', 4, '17:15', '17:25', 10, 760, 1),
('12303', 'PNBE', 5, '21:50', '22:00', 10, 995, 1),
('12303', 'HWH', 6, '06:20', NULL, 0, 1447, 2);

-- Route 14: Delhi - Howrah (12381 Poorva Express) - 3rd train
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12381', 'NDLS', 1, NULL, '14:35', 0, 0, 1),
('12381', 'CNB', 2, '19:15', '19:20', 5, 440, 1),
('12381', 'ALD', 3, '21:05', '21:15', 10, 565, 1),
('12381', 'BSB', 4, '23:55', '00:05', 10, 760, 2),
('12381', 'PNBE', 5, '04:30', '04:40', 10, 995, 2),
('12381', 'HWH', 6, '10:15', NULL, 0, 1447, 2);

-- Route 15: Delhi - Chennai (12615 Grand Trunk Express) - 2nd train
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12615', 'NDLS', 1, NULL, '18:40', 0, 0, 1),
('12615', 'AGC', 2, '20:55', '21:00', 5, 195, 1),
('12615', 'JBP', 3, '06:20', '06:30', 10, 790, 2),
('12615', 'NGP', 4, '11:35', '11:45', 10, 1090, 2),
('12615', 'BZA', 5, '21:50', '22:00', 10, 1520, 2),
('12615', 'MAS', 6, '06:50', NULL, 0, 2175, 3);

-- Route 16: Delhi - Chennai (12433 Chennai Rajdhani) - 3rd train
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12433', 'NDLS', 1, NULL, '15:55', 0, 0, 1),
('12433', 'AGC', 2, '18:10', '18:15', 5, 195, 1),
('12433', 'BPL', 3, '02:25', '02:35', 10, 700, 2),
('12433', 'NGP', 4, '08:15', '08:25', 10, 1090, 2),
('12433', 'SC', 5, '17:10', '17:25', 15, 1650, 2),
('12433', 'MAS', 6, '07:20', NULL, 0, 2175, 3);

-- Route 17: Delhi - Bengaluru (12649 Karnataka Sampark Kranti) - 2nd train
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12649', 'NDLS', 1, NULL, '20:35', 0, 0, 1),
('12649', 'AGC', 2, '22:45', '22:50', 5, 195, 1),
('12649', 'JBP', 3, '08:15', '08:25', 10, 790, 2),
('12649', 'NGP', 4, '13:40', '13:50', 10, 1090, 2),
('12649', 'SC', 5, '03:30', '03:45', 15, 1650, 3),
('12649', 'SBC', 6, '10:00', NULL, 0, 2444, 3);

-- Route 18: Mumbai - Howrah (12809 Howrah Mail)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12801', 'CSMT', 1, NULL, '20:10', 0, 0, 1),
('12801', 'NGP', 2, '07:00', '07:10', 10, 840, 2),
('12801', 'RNC', 3, '20:45', '21:00', 15, 1310, 2),
('12801', 'TATA', 4, '00:50', '00:55', 5, 1540, 3),
('12801', 'HWH', 5, '04:40', NULL, 0, 1968, 3);

-- Route 19: Mumbai - Chennai (12839 Chennai Mail)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12839', 'CSMT', 1, NULL, '21:40', 0, 0, 1),
('12839', 'PUNE', 2, '00:35', '00:40', 5, 192, 2),
('12839', 'SC', 3, '12:45', '13:00', 15, 710, 2),
('12839', 'BZA', 4, '18:35', '18:45', 10, 970, 2),
('12839', 'MAS', 5, '05:35', NULL, 0, 1280, 3);

-- Route 20: Mumbai - Bengaluru (12627 Karnataka Express via Mumbai)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12611', 'CSMT', 1, NULL, '08:00', 0, 0, 1),
('12611', 'PUNE', 2, '10:45', '10:55', 10, 192, 1),
('12611', 'UBL', 3, '22:10', '22:20', 10, 700, 1),
('12611', 'SBC', 4, '06:20', NULL, 0, 1150, 2);

-- Route 21: Chennai - Bengaluru (Multiple trains)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12029', 'MAS', 1, NULL, '06:00', 0, 0, 1),
('12029', 'SBC', 2, '11:00', NULL, 0, 360, 1);

-- Route 22: Delhi - Jaipur (12985 Double Decker)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12985', 'NDLS', 1, NULL, '06:05', 0, 0, 1),
('12985', 'JP', 2, '10:30', NULL, 0, 304, 1);

-- Route 23: Delhi - Jaipur (12957 Swarna Jayanti Rajdhani)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12957', 'NDLS', 1, NULL, '19:55', 0, 0, 1),
('12957', 'JP', 2, '00:15', '00:25', 10, 304, 2),
('12957', 'ADI', 3, '06:55', NULL, 0, 900, 2);

-- Route 24: Mumbai - Ahmedabad (12009 Shatabdi)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('22435', 'BCT', 1, NULL, '06:25', 0, 0, 1),
('22435', 'ST', 2, '08:27', '08:30', 3, 263, 1),
('22435', 'BRC', 3, '09:50', '09:55', 5, 392, 1),
('22435', 'ADI', 4, '11:25', NULL, 0, 493, 1);

-- Route 25: Delhi - Agra (20501 Vande Bharat)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('20501', 'NDLS', 1, NULL, '06:00', 0, 0, 1),
('20501', 'AGC', 2, '07:50', NULL, 0, 195, 1);

-- Route 26: Delhi - Varanasi (12559 Shiv Ganga Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12559', 'NDLS', 1, NULL, '18:55', 0, 0, 1),
('12559', 'CNB', 2, '00:15', '00:20', 5, 440, 2),
('12559', 'ALD', 3, '02:35', '02:45', 10, 565, 2),
('12559', 'BSB', 4, '06:05', NULL, 0, 760, 2);

-- Route 27: Delhi - Varanasi (12561 Swatantrata Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12561', 'NDLS', 1, NULL, '16:30', 0, 0, 1),
('12561', 'CNB', 2, '22:10', '22:15', 5, 440, 1),
('12561', 'ALD', 3, '00:30', '00:40', 10, 565, 2),
('12561', 'BSB', 4, '04:20', NULL, 0, 760, 2);

-- Route 28: Delhi - Patna (12155 Sampurna Kranti)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12155', 'NDLS', 1, NULL, '17:50', 0, 0, 1),
('12155', 'CNB', 2, '23:15', '23:20', 5, 440, 1),
('12155', 'ALD', 3, '01:35', '01:45', 10, 565, 2),
('12155', 'BSB', 4, '04:25', '04:35', 10, 760, 2),
('12155', 'PNBE', 5, '09:35', NULL, 0, 995, 2);

-- Route 29: Mumbai - Pune (12123 Deccan Queen)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12123', 'CSMT', 1, NULL, '17:10', 0, 0, 1),
('12123', 'PUNE', 2, '20:25', NULL, 0, 192, 1);

-- Route 30: Mumbai - Pune (12125 Pragati Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12125', 'CSMT', 1, NULL, '07:10', 0, 0, 1),
('12125', 'PUNE', 2, '10:25', NULL, 0, 192, 1);

-- Route 31: Delhi - Dehradun (12017 Dehradun Shatabdi)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12029', 'NDLS', 1, NULL, '06:45', 0, 0, 1),
('12029', 'DDN', 2, '12:40', NULL, 0, 308, 1);

-- Route 32: Howrah - Chennai (12841 Coromandel Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12505', 'HWH', 1, NULL, '14:50', 0, 0, 1),
('12505', 'BBS', 2, '22:00', '22:10', 10, 440, 1),
('12505', 'VSKP', 3, '04:45', '05:00', 15, 740, 2),
('12505', 'BZA', 4, '10:00', '10:15', 15, 1010, 2),
('12505', 'MAS', 5, '17:25', NULL, 0, 1360, 2);

-- Route 33: Howrah - Bengaluru
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12247', 'HWH', 1, NULL, '20:50', 0, 0, 1),
('12247', 'BBS', 2, '04:20', '04:30', 10, 440, 2),
('12247', 'VSKP', 3, '11:50', '12:05', 15, 740, 2),
('12247', 'BZA', 4, '17:35', '17:50', 15, 1010, 2),
('12247', 'SC', 5, '00:15', '00:30', 15, 1340, 3),
('12247', 'SBC', 6, '10:15', NULL, 0, 1870, 3);

-- Route 34: Chennai - Coimbatore
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('22439', 'MAS', 1, NULL, '06:10', 0, 0, 1),
('22439', 'CBE', 2, '11:10', NULL, 0, 496, 1);

-- Route 35: Mumbai - Indore (12919 Malwa Express)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12919', 'BCT', 1, NULL, '19:20', 0, 0, 1),
('12919', 'ST', 2, '23:05', '23:10', 5, 263, 1),
('12919', 'BRC', 3, '01:15', '01:20', 5, 392, 2),
('12919', 'RTM', 4, '06:55', '07:05', 10, 600, 2),
('12919', 'INDB', 5, '09:35', NULL, 0, 750, 2);

-- Route 36: Delhi - Guwahati (12423 Rajdhani)
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12423', 'NDLS', 1, NULL, '16:00', 0, 0, 1),
('12423', 'CNB', 2, '20:45', '20:50', 5, 440, 1),
('12423', 'BSB', 3, '00:35', '00:40', 5, 760, 2),
('12423', 'PNBE', 4, '05:00', '05:10', 10, 995, 2),
('12423', 'GHY', 5, '19:50', NULL, 0, 1960, 2);

-- Route 37: Secunderabad - Bengaluru
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12785', 'SC', 1, NULL, '22:35', 0, 0, 1),
('12785', 'SBC', 2, '06:40', NULL, 0, 535, 2);

-- Route 38: Ahmedabad - Mumbai
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12903', 'BCT', 1, NULL, '21:00', 0, 0, 1),
('12903', 'ST', 2, '00:20', '00:25', 5, 263, 2),
('12903', 'BRC', 3, '02:30', '02:35', 5, 392, 2),
('12903', 'ADI', 4, '05:25', NULL, 0, 493, 2);

-- Route 39: Delhi - Kanpur
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12311', 'NDLS', 1, NULL, '07:40', 0, 0, 1),
('12311', 'CNB', 2, '12:05', NULL, 0, 440, 1);

-- Route 40: More Mumbai - Delhi trains
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12261', 'BCT', 1, NULL, '23:15', 0, 0, 1),
('12261', 'NDLS', 2, '15:35', NULL, 0, 1386, 2);

-- Route 41: More Chennai - Delhi trains
INSERT INTO schedules (train_number, station_code, station_sequence, arrival_time, departure_time, halt_minutes, kilometer, day_number) VALUES
('12269', 'MAS', 1, NULL, '22:15', 0, 0, 1),
('12269', 'BZA', 2, '04:40', '04:50', 10, 430, 2),
('12269', 'NGP', 3, '15:55', '16:05', 10, 1090, 2),
('12269', 'NDLS', 4, '06:55', NULL, 0, 2175, 3);

-- ============================================================
-- 6. EMPTY TABLES FOR STUDENT USE
-- ============================================================

TRUNCATE TABLE bookingdata CASCADE;
TRUNCATE TABLE passengerdata CASCADE;
TRUNCATE TABLE seatsondate CASCADE;
TRUNCATE TABLE waitinglistondate CASCADE;
TRUNCATE TABLE email_otps CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Stations' as table_name, COUNT(*) as count FROM stations
UNION ALL SELECT 'Trains', COUNT(*) FROM trains
UNION ALL SELECT 'Coaches', COUNT(*) FROM coaches
UNION ALL SELECT 'Schedules', COUNT(*) FROM schedules
UNION ALL SELECT 'Coach Types', COUNT(*) FROM coachtype
UNION ALL SELECT 'Reservation Types', COUNT(*) FROM reservationtype
UNION ALL SELECT 'Fare Rules', COUNT(*) FROM journey_fare;

-- ============================================================
-- END OF STUDENT TRAINING DATABASE DUMP
-- ============================================================
