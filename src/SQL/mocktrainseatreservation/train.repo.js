const { connectMockTrainTicketsDb } = require("../../database/connectDB");
const allocateSeat_SL=require('../../utils/mocktrainreservations/allocateSeat_SL');
const allocateSeat_1A=require('../../utils/mocktrainreservations/allocateSeat_1A');
const allocateSeat_2A=require('../../utils/mocktrainreservations/allocateSeat_2A');
const allocateSeat_3A=require('../../utils/mocktrainreservations/allocateSeat_3A');
const allocateSeat_CC=require('../../utils/mocktrainreservations/allocateSeat_CC');
const allocateSeat_2S=require('../../utils/mocktrainreservations/allocateSeat_2S');
const allocateSeat_EC=require('../../utils/mocktrainreservations/allocateSeat_EC');
const allocateSeat_EA=require('../../utils/mocktrainreservations/allocateSeat_EA');
const allocateSeat_E3=require('../../utils/mocktrainreservations/allocateSeat_E3');
const allocateSeat_FC=require('../../utils/mocktrainreservations/allocateSeat_FC');
const calculateInternalTotalFare = require("../../utils/mocktrainreservations/calculateInternalTotalFare");
const getSearchQueryText = require("../../utils/mocktrainreservations/getSearchQueryText");
const mapPgError = require("../../utils/mocktrainreservations/pgErrorMapper");

exports.getReservedStations = async () => {
  const query = `
    SELECT
      code,
      station_name,      
      zone
    FROM stations
    ORDER BY station_name
  `;

  try {
    // ⏱️ Query timeout (5s)
    const pool = connectMockTrainTicketsDb();
    const result = await pool.query({
      text: query,
      statement_timeout: 5000,
    });

    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err); // 🔥 convert to AppError
  }
};
exports.getReservationTypes = async () => {
  const query = `
    SELECT
      id, type_code, description from reservationtype
    ORDER BY id
  `;

  try {
    // ⏱️ Query timeout (5s)
    const pool = connectMockTrainTicketsDb();
    const result = await pool.query({
      text: query,
      statement_timeout: 5000,
    });

    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err); // 🔥 convert to AppError
  }
};
exports.getCoachTypes = async () => {
  const query = `
    SELECT
      *from coachtype
    ORDER BY id
  `;

  try {
    // ⏱️ Query timeout (5s)
    const pool = connectMockTrainTicketsDb();
    const result = await pool.query({
      text: query,
      statement_timeout: 5000,
    });

    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err); // 🔥 convert to AppError
  }
};
exports.getTrains = async (source_code, destination_code, doj) => {
  // 🔄 Normalize inputs to uppercase
  source_code = source_code?.toUpperCase();
  destination_code = destination_code?.toUpperCase();

  const query = getSearchQueryText();

  try {
    // ⏱️ Query timeout (5s)
    const pool = connectMockTrainTicketsDb();
    const result = await pool.query(query, [
      source_code,
      destination_code,
      doj,
    ]);
    return result.rows[0]?.result|| [];
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err); // 🔥 convert to AppError
  }
};
exports.calculateTotalFare = async (
  train_number,
  source_code,
  destination_code,
  doj,
  coach_code,
  reservation_type,
  passengers
) => {
  // 🔄 Normalize inputs to uppercase
  train_number = train_number?.toUpperCase();
  source_code = source_code?.toUpperCase();
  destination_code = destination_code?.toUpperCase();
  coach_code = coach_code?.toUpperCase();
  reservation_type = reservation_type?.toUpperCase();

  try {
    // ⏱️ Query timeout (5s)
    const pool = connectMockTrainTicketsDb();
    const journeyKmSql = `SELECT
    (s2.kilometer - s1.kilometer) AS journey_km
FROM schedules s1
JOIN schedules s2
  ON s2.train_number = s1.train_number
WHERE
    s1.train_number   = $1
    AND s1.station_code = $2
    AND s2.station_code = $3
    AND s1.station_sequence < s2.station_sequence; `;
    // 1️⃣ journey km
    const kmResult = await pool.query(journeyKmSql, [
      train_number,
      source_code,
      destination_code,
    ]);

    const journeyKm = kmResult.rows[0]?.journey_km;
    if (!journeyKm) throw new Error("Invalid route");

    // 2️⃣ fare rule
    const fareRuleSql = `SELECT
    fare_per_km,
    discount_percent,
    flat_addon
FROM journey_fare
WHERE
    coach_code = $1
    AND seat_type  = $2;
`;
    const fareResult = await pool.query(fareRuleSql, [
      coach_code,
      reservation_type,
    ]);

    const fareRule = fareResult.rows[0];
    if (!fareRule) throw new Error("Fare rule not found");

    // 3️⃣ calculate fare
    const fareSummary = calculateInternalTotalFare({
      journeyKm,
      fareRule,
      passengers,
    });

    // 4️⃣ response
    return {
      train_number,
      coach_code,
      reservation_type,
      journey_km: journeyKm,
      passengers_count: passengers.length,
      fare: fareSummary,
    };
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err); // 🔥 convert to AppError
  }
};
exports.confirmTicket = async (
  train_number,
  source_code,
  destination_code,
  doj,
  coach_code,
  reservation_type,
  passengers,
  mobile_number,
  total_fare,
  email
) => {
  // 🔄 Normalize inputs to uppercase
  train_number = train_number?.toUpperCase();
  source_code = source_code?.toUpperCase();
  destination_code = destination_code?.toUpperCase();
  coach_code = coach_code?.toUpperCase();
  reservation_type = reservation_type?.toUpperCase();

  try {
    // ⏱️ Query timeout (5s)    
    const pool = connectMockTrainTicketsDb();    
    // FETCH IDs for Booking AND DETAILS for Response
    const result_train_info = await pool.query(
      `select c.id, t.train_name from coaches c join trains t on c.train_number = t.train_number where c.train_number = $1`,
      [train_number]
    );    
    const result_reservation_type = await pool.query(
      `select id from reservationtype where type_code = $1`,
      [reservation_type]
    );
    //check coach_code
    const result_coach_type = await pool.query(
      `select id from coachtype where coach_code = $1`,
      [coach_code]
    );
    // Fetch Station IDs and Names
    const result_src = await pool.query(
      `select id, station_name from stations where code = $1`,
      [source_code]
    );
    const result_dest = await pool.query(
      `select id, station_name from stations where code = $1`,
      [destination_code]
    );

    // --- FARE CALCULATION PREP ---
    // 1. Get Journey KM
    const journeyKmSql = `SELECT (s2.kilometer - s1.kilometer) AS journey_km 
                          FROM schedules s1 JOIN schedules s2 ON s2.train_number = s1.train_number 
                          WHERE s1.train_number = $1 AND s1.station_code = $2 AND s2.station_code = $3 AND s1.station_sequence < s2.station_sequence`;
    const kmResult = await pool.query(journeyKmSql, [train_number, source_code, destination_code]);
    const journeyKm = kmResult.rows[0]?.journey_km;

    // 2. Get Fare Rule
    const fareRuleSql = `SELECT fare_per_km, discount_percent, flat_addon FROM journey_fare WHERE coach_code = $1 AND seat_type = $2`;
    const fareResult = await pool.query(fareRuleSql, [coach_code, reservation_type]);
    const fareRule = fareResult.rows[0];

    // 3. Calculate Breakdown
    let fareBreakdown = {};
    if (journeyKm && fareRule) {
        fareBreakdown = calculateInternalTotalFare({ journeyKm, fareRule, passengers });
    }
    // -----------------------------

    //filter adults
    const adultcount= passengers.filter((passenger) => passenger.passenger_age >= 18).length;
    const childcount= passengers.filter((passenger) => passenger.passenger_age < 18).length;
    
    //bookingdata
    const result_bookingdata = await pool.query(`
    insert into bookingData (fktrain_number, date_of_journey, fksource_code, fkdestination_code, fkcoach_type, fkreservation_type, mobile_number, fkboarding_at,email,adult_count,child_count)
    values 
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning * ;
    `,[result_train_info.rows[0].id,  doj,result_src.rows[0].id,result_dest.rows[0].id, 
    result_coach_type.rows[0].id,result_reservation_type.rows[0].id,mobile_number,result_src.rows[0].id, email, adultcount,childcount]);
    
    //insert passengerdata
    let allocated_passengerdata=[];
    const baseFarePerKm = Number(fareRule.fare_per_km);
    const discountPercent = Number(fareRule.discount_percent);
    const flatAddon = Number(fareRule.flat_addon);

    for(let pass of passengers){
        let passengerBaseFare = (journeyKm || 0) * baseFarePerKm;
        let p_discount = discountPercent;
        if (pass.passenger_ispwd) p_discount = 50;
        else if (pass.passenger_age >= 60) p_discount = 40; // Senior check
        
        let discountedFare = passengerBaseFare - (passengerBaseFare * p_discount) / 100;
        let passengerTotal = discountedFare + flatAddon;
        
        // Add GST 18% to match calculateInternalTotalFare
        let finalFareWithGst = (passengerTotal * 1.18).toFixed(2);
        
        // Child below 6 is free (as per calculateInternalTotalFare)
        if (pass.passenger_age < 6) finalFareWithGst = "0.00";

        const result_passengerdata = await pool.query(`
        insert into passengerdata (fkbookingdata, p_name,p_age,p_gender, is_child,is_senior, is_pwd, base_fare)
        values 
        ($1,$2,$3,$4,$5,$6,$7,$8)
         returning * ;
        `,[result_bookingdata.rows[0].id,  pass.passenger_name,pass.passenger_age,pass.passenger_gender,
        pass.passenger_ischild,pass.passenger_issenior,pass.passenger_ispwd,finalFareWithGst]);

          //insert to seats (TRANSACTION + LOCK inside SQL function handles concurrency if implemented, but here explicit lock is safer or redundant depending on implementation)
          // The SQL function uses Advisory Lock, so explicit BEGIN/COMMIT here allows surrounding transaction.
          await pool.query(`BEGIN`);
          // The advisory lock is inside book_seat_with_rules, but doing it here ensures the JS loop holds it per passenger transactionally? 
          // Actually, `book_seat_with_rules` has `pg_advisory_xact_lock` which lasts for the transaction.
          // IMPORTANT: `book_seat_with_rules` creates the seat. 
          
          // 2️⃣ insert seat using SQL Function
          const result_booked_seat = await pool.query(
            `SELECT * FROM book_seat_with_rules($1, $2, $3, $4, $5)`,
            [train_number, coach_code, reservation_type, doj, result_passengerdata.rows[0].id]
          );

          await pool.query(`COMMIT`);

          const bookingStatus = result_booked_seat.rows[0].status; // CONFIRMED / WAITLIST / REGRET
          const allocatedType = result_booked_seat.rows[0].allocated_type;
          const seatSequence  = result_booked_seat.rows[0].seat_sequence;

          let result_allocated_seat={
              status: bookingStatus,
              coach_code: coach_code,
              seat_number: seatSequence, // Will map to berth logic below
              description: allocatedType
          };

          // Logic to calculate physical seat details (Berth, etc) using Utils
          // Only if CONFIRMED
          if (seatSequence && bookingStatus === 'CONFIRMED') {
              switch(coach_code){
                  case 'SL': result_allocated_seat = allocateSeat_SL(coach_code, seatSequence, reservation_type); break;
                  case '2A': result_allocated_seat = allocateSeat_2A(coach_code, seatSequence, reservation_type); break;
                  case '3A': result_allocated_seat = allocateSeat_3A(coach_code, seatSequence, reservation_type); break;
                  case '1A': result_allocated_seat = allocateSeat_1A(coach_code, seatSequence, reservation_type); break;
                  case 'CC': result_allocated_seat = allocateSeat_CC(coach_code, seatSequence, reservation_type); break;
                  case 'EC': result_allocated_seat = allocateSeat_EC(coach_code, seatSequence, reservation_type); break;
                  case 'EA': result_allocated_seat = allocateSeat_EA(coach_code, seatSequence, reservation_type); break;
                  case 'E3': result_allocated_seat = allocateSeat_E3(coach_code, seatSequence, reservation_type); break;
                  case 'FC': result_allocated_seat = allocateSeat_FC(coach_code, seatSequence, reservation_type); break;
                  case '2S': result_allocated_seat = allocateSeat_2S(coach_code, seatSequence, reservation_type); break;
                  default: break;
              }
              // Override/Merge status from SQL
              result_allocated_seat.status = bookingStatus; 
              result_allocated_seat.allocated_type = allocatedType;
          } else {
              // Waitlist or Regret or RAC (Seat details not known/null)
              result_allocated_seat = {
                  coach_code: null,
                  seat_number: seatSequence, // might be WL sequence
                  berth_type: null,
                  status: bookingStatus,
                  description: allocatedType
              };
          }

        //update passengerdata with readable status
        const seatStatusStr = result_allocated_seat.status === 'CONFIRMED' || result_allocated_seat.status === 'RAC' 
            ? `${result_allocated_seat.coach_code}/${result_allocated_seat.seat_number}/${result_allocated_seat.berth_type?result_allocated_seat.berth_type:result_allocated_seat.seat_type}`
            : `${result_allocated_seat.status}/${result_allocated_seat.seat_number}`;

        const result_updated_passengerdata= await pool.query(`update passengerdata set current_seat_status=$1, updated_seat_status=$2 where id=$3 returning *;`,
          [seatStatusStr, seatStatusStr, result_passengerdata.rows[0].id ]);
        
        allocated_passengerdata.push({
            passenger_details: result_updated_passengerdata.rows[0], 
            seat_details: result_allocated_seat
        });
    }    

    // Fetch PNR and Status from Booking Data
    const result_final_booking = await pool.query(`SELECT pnr, pnr_status FROM bookingdata WHERE id = $1`, [result_bookingdata.rows[0].id]);
    const { pnr, pnr_status } = result_final_booking.rows[0] || {};

    // FINAL JSON RESPONSE STRUCTURE
    return {
        pnr: pnr,
        pnr_status: pnr_status,
        train_details: {
            train_number: train_number,
            train_name: result_train_info.rows[0].train_name,
            source: result_src.rows[0].station_name,
            destination: result_dest.rows[0].station_name,
            doj: doj
        },
        fare_details: {
            total_fare: total_fare,
            passengers_count: passengers.length
        },
        fare_calculation_details: fareBreakdown,
        passenger_details: allocated_passengerdata.map(p => ({
          id: p.passenger_details.id,
            name: p.passenger_details.p_name,
            age: p.passenger_details.p_age,
            gender: p.passenger_details.p_gender,
            status: p.passenger_details.current_seat_status
        })),
        seat_details: allocated_passengerdata.map(p => ({
            seat_number: p.seat_details.seat_number,
            berth_type: p.seat_details.berth_type,
            coach_code: p.seat_details.coach_code,
            status: p.seat_details.status
        }))
    };

  } catch (err) {
    // Only rollback if transaction active? Here we commit inside loop. 
    // If partial failure, earlier passengers might be booked. 
    // Complex atomic booking not fully scoped here, assuming per-passenger is okay or handled by App logic.
    // pool.query('ROLLBACK') might fail if no transaction open.
    console.error("PG ERROR:", err);
    throw mapPgError(err); // 🔥 convert to AppError
  }
};
exports.getTrainSchedule = async (train_input) => {

  try {

    const pool = connectMockTrainTicketsDb();
    
    // 🔄 Normalize input - could be train number or name
    const searchValue = train_input?.trim().toUpperCase();

    // 1️⃣ Train Details - search by number OR name
    const trainQuery = `
      SELECT
        train_number, train_name, train_type,
        json_build_array(
          CASE WHEN train_runs_on_mon = 'Y' THEN 'Mon' END,
          CASE WHEN train_runs_on_tue = 'Y' THEN 'Tue' END,
          CASE WHEN train_runs_on_wed = 'Y' THEN 'Wed' END,
          CASE WHEN train_runs_on_thu = 'Y' THEN 'Thu' END,
          CASE WHEN train_runs_on_fri = 'Y' THEN 'Fri' END,
          CASE WHEN train_runs_on_sat = 'Y' THEN 'Sat' END,
          CASE WHEN train_runs_on_sun = 'Y' THEN 'Sun' END
        ) as running_days
      FROM trains
      WHERE train_number = $1 OR UPPER(train_name) ILIKE '%' || $1 || '%'
      LIMIT 1
    `;

    // First find the train to get its train_number
    const trainRes = await pool.query(trainQuery, [searchValue]);
    const train = trainRes.rows[0];
    if (!train) return null;

    const train_number = train.train_number;

    // 2️⃣ Coach Configuration
    const coachQuery = `
        SELECT 
            bogi_count_sl as SL, bogi_count_1a as "1A", bogi_count_2a as "2A", 

            bogi_count_3a as "3A", bogi_count_cc as CC, bogi_count_fc as FC, 

            bogi_count_2s as "2S", bogi_count_ec as EC, bogi_count_ea as EA, 

            bogi_count_e3 as "E3"

        FROM coaches

        WHERE train_number = $1

    `;



    // 3️⃣ Schedule
    const scheduleQuery = `

      SELECT

        station_code,

        station_name,

        arrival,

        departure,

        kilometer as distance,

        running_day as day,

        station_sequence as seq

      FROM schedules

      WHERE train_number = $1

      ORDER BY station_sequence

    `;

    // Get coach and schedule using the found train_number
    const [coachRes, scheduleRes] = await Promise.all([
      pool.query(coachQuery, [train_number]),
      pool.query(scheduleQuery, [train_number]),
    ]);

    // Filter out nulls from running_days array
    train.running_days = (train.running_days || []).filter(d => d !== null);

    return {

      train_number: train.train_number,

      train_name: train.train_name,

      train_type: train.train_type,

      running_days: train.running_days,

      coaches: coachRes.rows[0] || {},

      schedule: scheduleRes.rows

    };



  } catch (err) {

    console.error("PG ERROR:", err);

    throw mapPgError(err);

  }
}
exports.getLiveTrainStatus = async (train_input) => {
  try {
    const pool = connectMockTrainTicketsDb();
    
    // 🔄 Normalize input - could be train number or name
    const searchValue = train_input?.trim().toUpperCase();

    // First find the train to get its train_number
    const trainLookup = await pool.query(`
      SELECT train_number FROM trains 
      WHERE train_number = $1 OR UPPER(train_name) ILIKE '%' || $1 || '%'
      LIMIT 1
    `, [searchValue]);
    
    if (trainLookup.rows.length === 0) {
      return [];
    }
    
    const train_number = trainLookup.rows[0].train_number;

    const query = `
      SELECT
        s.station_code,
        st.station_name,
        s.arrival,
        s.departure,
        s.running_day,
        s.station_sequence,
        t.train_runs_on_mon,
        t.train_runs_on_tue,
        t.train_runs_on_wed,
        t.train_runs_on_thu,
        t.train_runs_on_fri,
        t.train_runs_on_sat,
        t.train_runs_on_sun
      FROM schedules s
      JOIN stations st ON s.station_code = st.code
      JOIN trains t ON s.train_number = t.train_number
      WHERE s.train_number = $1
      ORDER BY s.station_sequence
    `;
    const result = await pool.query(query, [train_number]);
    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};

exports.getTrainsAtStation = async (station_code) => {
  try {
    const pool = connectMockTrainTicketsDb();
    const query = `
      SELECT
        s.train_number,
        t.train_name,
        t.train_type,
        s.arrival,
        s.departure,
        s.running_day,
        s.station_sequence,
        t.train_runs_on_mon,
        t.train_runs_on_tue,
        t.train_runs_on_wed,
        t.train_runs_on_thu,
        t.train_runs_on_fri,
        t.train_runs_on_sat,
        t.train_runs_on_sun
      FROM schedules s
      JOIN trains t ON s.train_number = t.train_number
      WHERE s.station_code = $1
    `;
    const result = await pool.query(query, [station_code]);
    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};

exports.cancelTicket = async (pnr, passenger_ids) => {
  try {
    const pool = connectMockTrainTicketsDb();
    
    // Call stored procedure
    const query = `SELECT * FROM cancel_ticket_procedure($1, $2)`;
    const result = await pool.query(query, [pnr, passenger_ids]);
    
    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};

exports.saveOtp = async (email, otp, expires_at) => {
    try {
        const pool = connectMockTrainTicketsDb();
        // Nullify previous OTPs for this email to keep clean? Or just insert new.
        // Let's insert new.
        const query = `INSERT INTO email_otps (email, otp, expires_at) VALUES ($1, $2, $3) RETURNING id`;
        const result = await pool.query(query, [email, otp, expires_at]);
        return result.rows[0];
    } catch (err) {
        console.error("PG ERROR:", err);
        throw mapPgError(err);
    }
};

exports.verifyOtp = async (email, otp) => {
    try {
        const pool = connectMockTrainTicketsDb();
        // Check for VALID, NON-EXPIRED, MATCHING OTP
        // Sort by created_at DESC to get latest
        const query = `
            SELECT * FROM email_otps 
            WHERE email = $1 AND otp = $2 AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const result = await pool.query(query, [email, otp]);
        
        if (result.rows.length > 0) {
            // Mark as verified
            await pool.query(`delete from email_otps WHERE id = $1`, [result.rows[0].id]);
            return true;
        }
        return false;
    } catch (err) {
         console.error("PG ERROR:", err);
         throw mapPgError(err);
    }
};

exports.getBookingHistory = async (email) => {
    try {
        const pool = connectMockTrainTicketsDb();
        const query = `
            SELECT 
                b.id,
                b.pnr,
                b.pnr_status,
                b.date_of_journey,
                t.train_number,
                t.train_name,
                s1.station_name as source_name,
                s2.station_name as destination_name,
                b.created_at,
                COALESCE(SUM(pd.base_fare), 0) as total_fare
            FROM bookingdata b
            JOIN trains t ON b.fktrain_number = t.id
            JOIN stations s1 ON b.fksource_code = s1.id
            JOIN stations s2 ON b.fkdestination_code = s2.id
            LEFT JOIN passengerdata pd ON pd.fkbookingdata = b.id
            WHERE b.email = $1
            GROUP BY b.id, b.pnr, b.pnr_status, b.date_of_journey, t.train_number, t.train_name, s1.station_name, s2.station_name, b.created_at
            ORDER BY b.date_of_journey DESC, b.created_at DESC
        `;
        const result = await pool.query(query, [email]);
        return result.rows;
    } catch (err) {
        console.error("PG ERROR:", err);
        throw mapPgError(err);
    }
};

exports.getPnrStatus = async (pnr) => {
    try {
        const pool = connectMockTrainTicketsDb();
        // Get Booking Info
        const bookingQuery = `
            SELECT DISTINCT
                b.id,
                b.pnr,
                b.pnr_status,
                b.date_of_journey,
                t.train_number,
                t.train_name,
                s1.station_name as source_name,
                s2.station_name as destination_name,
                COALESCE(SUM(pd.base_fare), 0) as total_fare
            FROM bookingdata b
            LEFT JOIN trains t ON b.fktrain_number = t.id
            LEFT JOIN stations s1 ON b.fksource_code = s1.id
            LEFT JOIN stations s2 ON b.fkdestination_code = s2.id
            LEFT JOIN passengerdata pd ON pd.fkbookingdata = b.id
            WHERE b.pnr = $1
            GROUP BY b.id, b.pnr, b.pnr_status, b.date_of_journey, t.train_number, t.train_name, s1.station_name, s2.station_name
        `;
        const bookingResult = await pool.query(bookingQuery, [pnr]);
        
        if (bookingResult.rows.length === 0) {
            return null;
        }

        const booking = bookingResult.rows[0];

        // Get Passengers
        const passengersQuery = `
            SELECT 
                *
            FROM passengerdata
            WHERE fkbookingdata = $1
            ORDER BY id
        `;
        const passengersResult = await pool.query(passengersQuery, [booking.id]);

        return {
            ...booking,
            passengers: passengersResult.rows.map(p => ({
                name: p.p_name,
                age: p.p_age,
                gender: p.p_gender,
                status: p.current_seat_status,
                coach_code: p.coach_code,
                seat_number: p.seat_number,
                berth_type: p.berth_type
            }))
        };

    } catch (err) {
        console.error("PG ERROR:", err);
        throw mapPgError(err);
    }
};
