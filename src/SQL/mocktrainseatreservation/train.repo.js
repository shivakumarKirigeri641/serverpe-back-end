const { connectMockTrainTicketsDb } = require("../../database/connectDB");
const allocateSeat_SL = require("../../utils/mocktrainreservations/allocateSeat_SL");
const allocateSeat_1A = require("../../utils/mocktrainreservations/allocateSeat_1A");
const allocateSeat_2A = require("../../utils/mocktrainreservations/allocateSeat_2A");
const allocateSeat_3A = require("../../utils/mocktrainreservations/allocateSeat_3A");
const allocateSeat_CC = require("../../utils/mocktrainreservations/allocateSeat_CC");
const allocateSeat_2S = require("../../utils/mocktrainreservations/allocateSeat_2S");
const allocateSeat_EC = require("../../utils/mocktrainreservations/allocateSeat_EC");
const allocateSeat_EA = require("../../utils/mocktrainreservations/allocateSeat_EA");
const allocateSeat_E3 = require("../../utils/mocktrainreservations/allocateSeat_E3");
const allocateSeat_FC = require("../../utils/mocktrainreservations/allocateSeat_FC");
const calculateInternalTotalFare = require("../../utils/mocktrainreservations/calculateInternalTotalFare");
const getSearchQueryText = require("../../utils/mocktrainreservations/getSearchQueryText");
const mapPgError = require("../../utils/mocktrainreservations/pgErrorMapper");
const sendConfirmTicketSMS = require("../../utils/sendConfirmTicketSMS");
const sendMockTrainTicketMailTemplate = require("../../utils/emails/sendMockTrainTicketMailTemplate");
const { sendMail } = require("../../utils/emails/sendMail");

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
exports.autocompleteTrains = async (searchQuery) => {
  // 🔄 Normalize input to uppercase
  const normalizedQuery = searchQuery?.toUpperCase();

  console.log("🔍 Autocomplete Query:", normalizedQuery);

  const query = `
    SELECT DISTINCT
      t.train_number,
      t.train_name
    FROM train t
    WHERE 
      CAST(t.train_number AS TEXT) LIKE $1 || '%'
      OR UPPER(t.train_name) LIKE '%' || $1 || '%'
    ORDER BY 
      CASE 
        WHEN CAST(t.train_number AS TEXT) = $1 THEN 1
        WHEN CAST(t.train_number AS TEXT) LIKE $1 || '%' THEN 2
        ELSE 3
      END,
      t.train_number
    LIMIT 10
  `;

  try {
    const pool = connectMockTrainTicketsDb();
    console.log("🗄️  Executing autocomplete query...");
    const result = await pool.query({
      text: query,
      values: [normalizedQuery],
      statement_timeout: 5000,
    });
    console.log("✅ Autocomplete results:", result.rows.length, "trains found");
    return result.rows;
  } catch (err) {
    console.error("❌ PG AUTOCOMPLETE ERROR:", err);
    console.error("Query:", query);
    console.error("Values:", [normalizedQuery]);
    throw mapPgError(err);
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
    return result.rows[0]?.result || [];
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
  passengers,
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
  email,
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
      [train_number],
    );
    const result_reservation_type = await pool.query(
      `select id from reservationtype where type_code = $1`,
      [reservation_type],
    );
    //check coach_code
    const result_coach_type = await pool.query(
      `select id from coachtype where coach_code = $1`,
      [coach_code],
    );
    // Fetch Station IDs and Names
    const result_src = await pool.query(
      `select id, station_name from stations where code = $1`,
      [source_code],
    );
    const result_dest = await pool.query(
      `select id, station_name from stations where code = $1`,
      [destination_code],
    );

    // --- FARE CALCULATION PREP ---
    // 1. Get Journey KM
    const journeyKmSql = `SELECT (s2.kilometer - s1.kilometer) AS journey_km, s1.departure as departure, s2.arrival as arrival 
                          FROM schedules s1 JOIN schedules s2 ON s2.train_number = s1.train_number 
                          WHERE s1.train_number = $1 AND s1.station_code = $2 AND s2.station_code = $3 AND s1.station_sequence < s2.station_sequence`;
    const kmResult = await pool.query(journeyKmSql, [
      train_number,
      source_code,
      destination_code,
    ]);
    const journeyKm = kmResult.rows[0]?.journey_km;

    // 2. Get Fare Rule
    const fareRuleSql = `SELECT fare_per_km, discount_percent, flat_addon FROM journey_fare WHERE coach_code = $1 AND seat_type = $2`;
    const fareResult = await pool.query(fareRuleSql, [
      coach_code,
      reservation_type,
    ]);
    const fareRule = fareResult.rows[0];

    // 3. Calculate Breakdown
    let fareBreakdown = {};
    if (journeyKm && fareRule) {
      fareBreakdown = calculateInternalTotalFare({
        journeyKm,
        fareRule,
        passengers,
      });
    }
    // -----------------------------

    //filter adults
    const adultcount = passengers.filter(
      (passenger) => passenger.passenger_age >= 6,
    ).length;
    const childcount = passengers.filter(
      (passenger) => passenger.passenger_age < 6,
    ).length;

    //bookingdata
    const result_bookingdata = await pool.query(
      `
    insert into bookingData (fktrain_number, date_of_journey, fksource_code, fkdestination_code, fkcoach_type, fkreservation_type, mobile_number, fkboarding_at,email,adult_count,child_count)
    values 
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning * ;
    `,
      [
        result_train_info.rows[0].id,
        doj,
        result_src.rows[0].id,
        result_dest.rows[0].id,
        result_coach_type.rows[0].id,
        result_reservation_type.rows[0].id,
        mobile_number,
        result_src.rows[0].id,
        email,
        adultcount,
        childcount,
      ],
    );

    //insert passengerdata
    let allocated_passengerdata = [];
    const baseFarePerKm = Number(fareRule.fare_per_km);
    const discountPercent = Number(fareRule.discount_percent);
    const flatAddon = Number(fareRule.flat_addon);

    for (let pass of passengers) {
      let passengerBaseFare = (journeyKm || 0) * baseFarePerKm;
      let p_discount = discountPercent;
      if (pass.passenger_ispwd) p_discount = 50;
      else if (pass.passenger_age >= 60) p_discount = 40; // Senior check

      let discountedFare =
        passengerBaseFare - (passengerBaseFare * p_discount) / 100;
      let passengerTotal = discountedFare + flatAddon;

      // Add GST 18% to match calculateInternalTotalFare
      let finalFareWithGst = (passengerTotal * 1.18).toFixed(2);

      // Child below 6 is free (as per calculateInternalTotalFare)
      if (pass.passenger_age < 6) finalFareWithGst = "0.00";

      const result_passengerdata = await pool.query(
        `
        insert into passengerdata (fkbookingdata, p_name,p_age,p_gender, is_child,is_senior, is_pwd, base_fare)
        values 
        ($1,$2,$3,$4,$5,$6,$7,$8)
         returning * ;
        `,
        [
          result_bookingdata.rows[0].id,
          pass.passenger_name,
          pass.passenger_age,
          pass.passenger_gender,
          pass.passenger_ischild,
          pass.passenger_issenior,
          pass.passenger_ispwd,
          finalFareWithGst,
        ],
      );

      //insert to seats (TRANSACTION + LOCK inside SQL function handles concurrency if implemented, but here explicit lock is safer or redundant depending on implementation)
      // The SQL function uses Advisory Lock, so explicit BEGIN/COMMIT here allows surrounding transaction.
      await pool.query(`BEGIN`);
      // The advisory lock is inside book_seat_with_rules, but doing it here ensures the JS loop holds it per passenger transactionally?
      // Actually, `book_seat_with_rules` has `pg_advisory_xact_lock` which lasts for the transaction.
      // IMPORTANT: `book_seat_with_rules` creates the seat.

      // 2️⃣ insert seat using SQL Function
      const result_booked_seat = await pool.query(
        `SELECT * FROM book_seat_with_rules($1, $2, $3, $4, $5)`,
        [
          train_number,
          coach_code,
          reservation_type,
          doj,
          result_passengerdata.rows[0].id,
        ],
      );

      await pool.query(`COMMIT`);

      const bookingStatus = result_booked_seat.rows[0].status; // CONFIRMED / WAITLIST / REGRET
      const allocatedType = result_booked_seat.rows[0].allocated_type;
      const seatSequence = result_booked_seat.rows[0].seat_sequence;

      let result_allocated_seat = {
        status: bookingStatus,
        coach_code: coach_code,
        seat_number: seatSequence, // Will map to berth logic below
        description: allocatedType,
      };

      // Logic to calculate physical seat details (Berth, etc) using Utils
      // Only if CONFIRMED
      if (seatSequence && bookingStatus === "CONFIRMED") {
        switch (coach_code) {
          case "SL":
            result_allocated_seat = allocateSeat_SL(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "2A":
            result_allocated_seat = allocateSeat_2A(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "3A":
            result_allocated_seat = allocateSeat_3A(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "1A":
            result_allocated_seat = allocateSeat_1A(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "CC":
            result_allocated_seat = allocateSeat_CC(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "EC":
            result_allocated_seat = allocateSeat_EC(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "EA":
            result_allocated_seat = allocateSeat_EA(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "E3":
            result_allocated_seat = allocateSeat_E3(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "FC":
            result_allocated_seat = allocateSeat_FC(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          case "2S":
            result_allocated_seat = allocateSeat_2S(
              coach_code,
              seatSequence,
              reservation_type,
            );
            break;
          default:
            break;
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
          description: allocatedType,
        };
      }

      //update passengerdata with readable status
      const seatStatusStr =
        result_allocated_seat.status === "CONFIRMED" ||
        result_allocated_seat.status === "RAC"
          ? `${result_allocated_seat.coach_code}/${
              result_allocated_seat.seat_number
            }/${
              result_allocated_seat.berth_type
                ? result_allocated_seat.berth_type
                : result_allocated_seat.seat_type
            }`
          : `${result_allocated_seat.status}/${result_allocated_seat.seat_number}`;

      const result_updated_passengerdata = await pool.query(
        `update passengerdata set current_seat_status=$1, updated_seat_status=$2 where id=$3 returning *;`,
        [seatStatusStr, seatStatusStr, result_passengerdata.rows[0].id],
      );

      allocated_passengerdata.push({
        passenger_details: result_updated_passengerdata.rows[0],
        seat_details: result_allocated_seat,
      });
    }

    // Fetch PNR and Status from Booking Data
    const result_final_booking = await pool.query(
      `SELECT pnr, pnr_status FROM bookingdata WHERE id = $1`,
      [result_bookingdata.rows[0].id],
    );
    const { pnr, pnr_status } = result_final_booking.rows[0] || {};

    // FINAL JSON RESPONSE STRUCTURE
    //send sms
    await sendConfirmTicketSMS(
      mobile_number,
      pnr,
      train_number,
      result_train_info.rows[0].train_name,
      doj,
      kmResult.rows[0].departure,
    );
    //send mail
    await sendMail({
      to: email,
      subject: "Your QuickSmart Mock Train Ticket – Practice Reservation",
      html: await sendMockTrainTicketMailTemplate({
        pnr,
        train_number,
        train_name: result_train_info.rows[0].train_name,
        source_station: result_src.rows[0].station_name,
        destination_station: result_dest.rows[0].station_name,
        journey_date: doj,
        departure_time: kmResult.rows[0].departure,
        arrival_time: kmResult.rows[0].arrival,
        coach_type: coach_code,
        booking_status: pnr_status,
        passengers,
        total_fare,
        contact_email: email,
        contact_mobile: mobile_number,
      }),
      text: "Your QuickSmart Mock Train Ticket – Practice Reservation",
    });
    return {
      pnr: pnr,
      pnr_status: pnr_status,
      train_details: {
        train_number: train_number,
        train_name: result_train_info.rows[0].train_name,
        source: result_src.rows[0].station_name,
        destination: result_dest.rows[0].station_name,
        doj: doj,
      },
      fare_details: {
        total_fare: total_fare,
        passengers_count: passengers.length,
      },
      fare_calculation_details: fareBreakdown,
      passenger_details: allocated_passengerdata.map((p) => ({
        id: p.passenger_details.id,
        name: p.passenger_details.p_name,
        age: p.passenger_details.p_age,
        gender: p.passenger_details.p_gender,
        status: p.passenger_details.current_seat_status,
      })),
      seat_details: allocated_passengerdata.map((p) => ({
        seat_number: p.seat_details.seat_number,
        berth_type: p.seat_details.berth_type,
        coach_code: p.seat_details.coach_code,
        status: p.seat_details.status,
      })),
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
    train.running_days = (train.running_days || []).filter((d) => d !== null);

    return {
      train_number: train.train_number,

      train_name: train.train_name,

      train_type: train.train_type,

      running_days: train.running_days,

      coaches: coachRes.rows[0] || {},

      schedule: scheduleRes.rows,
    };
  } catch (err) {
    console.error("PG ERROR:", err);

    throw mapPgError(err);
  }
};
exports.getLiveTrainStatus = async (train_input) => {
  try {
    const pool = connectMockTrainTicketsDb();

    // 🔄 Normalize input - could be train number or name
    const searchValue = train_input?.trim().toUpperCase();

    // First find the train to get its train_number
    const trainLookup = await pool.query(
      `
      SELECT train_number FROM trains 
      WHERE train_number = $1 OR UPPER(train_name) ILIKE '%' || $1 || '%'
      LIMIT 1
    `,
      [searchValue],
    );

    if (trainLookup.rows.length === 0) {
      return [];
    }

    const train_number = trainLookup.rows[0].train_number;

    const query = `WITH schedule_base AS (
    SELECT
        s.station_code,
        st.station_name,
        s.station_sequence,
        s.arrival,
        s.departure,
        s.running_day,

        -- Base progressive delay (increases with journey)
        (s.station_sequence * 1.2) AS base_delay,

        -- Small random jitter (-3 to +5)
        FLOOR(random() * 9 - 3) AS jitter_delay

    FROM schedules s
    JOIN stations st ON s.station_code = st.code
    WHERE s.train_number = $1
),

schedule_ts AS (
    SELECT
        *,
        -- Final delay per station (0–20 mins)
        LEAST(
            GREATEST(base_delay + jitter_delay, 0),
            20
        )::INT AS delay_minutes,

        date_trunc('day', NOW())
        + ((running_day - 1) || ' day')::interval
        + arrival
        + (LEAST(GREATEST(base_delay + jitter_delay, 0), 20) || ' minutes')::interval
        AS arrival_ts,

        date_trunc('day', NOW())
        + ((running_day - 1) || ' day')::interval
        + departure
        + (LEAST(GREATEST(base_delay + jitter_delay, 0), 20) || ' minutes')::interval
        AS departure_ts
    FROM schedule_base
),

status_calc AS (
    SELECT *,
        CASE
            WHEN NOW() < arrival_ts THEN 'UPCOMING'
            WHEN NOW() BETWEEN arrival_ts AND departure_ts THEN 'HALTED'
            ELSE 'DEPARTED'
        END AS live_status
    FROM schedule_ts
),

current_station AS (
    SELECT *
    FROM status_calc
    WHERE
        live_status = 'HALTED'
        OR (
            live_status = 'DEPARTED'
            AND arrival_ts = (
                SELECT MAX(arrival_ts)
                FROM status_calc
                WHERE arrival_ts <= NOW()
            )
        )
    ORDER BY station_sequence DESC
    LIMIT 1
)

SELECT
    sc.station_code,
    sc.station_name,
    sc.station_sequence,
    sc.arrival,
    sc.departure,
    sc.running_day,
    sc.delay_minutes,
    sc.live_status,

    CASE
        WHEN sc.station_code = cs.station_code THEN TRUE
        ELSE FALSE
    END AS is_current_station

FROM status_calc sc
LEFT JOIN current_station cs
    ON sc.station_code = cs.station_code

ORDER BY sc.station_sequence;


    `;
    const result = await pool.query(query, [train_number]);
    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};
exports.getTrainsList = async (train_input) => {
  try {
    const pool = connectMockTrainTicketsDb();

    // 🔄 Normalize input - could be train number or name
    const searchValue = train_input?.trim().toUpperCase();

    // First find the train to get its train_number
    const trainLookup = await pool.query(
      `
      SELECT c.train_number, t.train_name FROM trains t join
coaches c on c.train_number=t.train_number
      WHERE UPPER(t.train_name) ILIKE '%' || $1 || '%' or
	  UPPER(c.train_number) ILIKE '%' || $1 || '%'
    `,
      [searchValue],
    );

    if (trainLookup.rows.length === 0) {
      return [];
    }
    return trainLookup.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};
exports.getTrainsAtStation = async (station_code, next_hours = 2) => {
  try {
    const pool = connectMockTrainTicketsDb();
    const query = `
    WITH base_times AS (
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
        t.train_runs_on_sun,

        -- Arrival timestamp
        date_trunc('day', NOW())
        + ((s.running_day - 1) || ' day')::interval
        + s.arrival AS arrival_ts,

        -- Departure timestamp
        date_trunc('day', NOW())
        + ((s.running_day - 1) || ' day')::interval
        + s.departure AS departure_ts

    FROM schedules s
    JOIN trains t ON s.train_number = t.train_number
    WHERE s.station_code = $1
),

events AS (
    -- =========================
    -- DEPARTURES
    -- =========================
    SELECT
        'DEPARTING' AS section_type,
        train_number,
        train_name,
        train_type,
        departure AS scheduled_time,
        departure_ts AS event_time,
        running_day,
        station_sequence,

        train_runs_on_mon,
        train_runs_on_tue,
        train_runs_on_wed,
        train_runs_on_thu,
        train_runs_on_fri,
        train_runs_on_sat,
        train_runs_on_sun

    FROM base_times
    WHERE departure_ts BETWEEN NOW() - INTERVAL '2 hours'
        AND NOW() + ($2 || ' hours')::interval

    UNION ALL

    -- =========================
    -- ARRIVALS
    -- =========================
    SELECT
        'ARRIVING' AS section_type,
        train_number,
        train_name,
        train_type,
        arrival AS scheduled_time,
        arrival_ts AS event_time,
        running_day,
        station_sequence,

        train_runs_on_mon,
        train_runs_on_tue,
        train_runs_on_wed,
        train_runs_on_thu,
        train_runs_on_fri,
        train_runs_on_sat,
        train_runs_on_sun

    FROM base_times
    WHERE arrival_ts BETWEEN NOW() - INTERVAL '2 hours'
        AND NOW() + ($2 || ' hours')::interval
)

SELECT
    section_type,
    train_number,
    train_name,
    train_type,
    scheduled_time,
    event_time,

    -- =========================
    -- RELATIVE TIME STRING
    -- =========================
    CASE
        WHEN event_time > NOW() THEN
            'in ' ||
            FLOOR(EXTRACT(EPOCH FROM (event_time - NOW())) / 3600)::INT || ' hr ' ||
            FLOOR(MOD(EXTRACT(EPOCH FROM (event_time - NOW())), 3600) / 60)::INT || ' mins'

        ELSE
            FLOOR(EXTRACT(EPOCH FROM (NOW() - event_time)) / 3600)::INT || ' hr ' ||
            FLOOR(MOD(EXTRACT(EPOCH FROM (NOW() - event_time)), 3600) / 60)::INT || ' mins ago'
    END AS relative_time,

    running_day,
    station_sequence,

    train_runs_on_mon,
    train_runs_on_tue,
    train_runs_on_wed,
    train_runs_on_thu,
    train_runs_on_fri,
    train_runs_on_sat,
    train_runs_on_sun

FROM events

ORDER BY
    section_type,
    event_time DESC;

    `;
    const result = await pool.query(query, [station_code, next_hours]);
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
    const query = `SELECT * FROM cancel_ticket_procedure($1::TEXT, $2::INTEGER[])`;
    const result = await pool.query(query, [pnr, [passenger_ids]]);

    return result.rows;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};

exports.saveOtp = async (email, otp, expires_at, ispayment = false) => {
  try {
    const pool = connectMockTrainTicketsDb();
    // Insert new OTP with ispayment flag
    const query = `INSERT INTO email_otps (email, otp, expires_at, ispayment) VALUES ($1, $2, $3, $4) RETURNING id`;
    const result = await pool.query(query, [email, otp, expires_at, ispayment]);
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
      await pool.query(`delete from email_otps WHERE id = $1`, [
        result.rows[0].id,
      ]);
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
    -- =====================
    -- BOOKING / PNR DETAILS
    -- =====================
    b.id AS booking_id,
    b.pnr,
    b.pnr_status,
    b.date_of_journey,
    b.created_at,

    -- =====================
    -- TRAIN DETAILS
    -- =====================
    json_build_object(
        'train_id', t.id,
        'train_number', c.train_number,
        'train_name', t.train_name
    ) AS train_details,

    -- =====================
    -- JOURNEY DETAILS
    -- =====================
    json_build_object(
        'source_station', s1.station_name,
        'destination_station', s2.station_name
    ) AS journey_details,

    -- =====================
    -- FARE DETAILS
    -- =====================
    json_build_object(
        'total_fare', COALESCE(SUM(pd.base_fare), 0),
        'passenger_count', COUNT(pd.id)
    ) AS fare_details,

    -- =====================
    -- PASSENGER DETAILS
    -- =====================
    json_agg(
        json_build_object(
            'passenger_id', pd.id,
            'name', pd.p_name,
            'age', pd.p_age,
            'gender', pd.p_gender,
            'current_seat_status', pd.current_seat_status,
            'updated_seat_status', pd.updated_seat_status,
            'fare', pd.base_fare
        )
        ORDER BY pd.id
    ) FILTER (WHERE pd.id IS NOT NULL) AS passenger_details

FROM bookingdata b


LEFT JOIN coaches c
    ON b.fktrain_number = c.id

LEFT JOIN trains t
    ON c.train_number = t.train_number
	
LEFT JOIN stations s1
    ON b.fksource_code = s1.id

LEFT JOIN stations s2
    ON b.fkdestination_code = s2.id

LEFT JOIN passengerdata pd
    ON pd.fkbookingdata = b.id

WHERE b.email = $1

GROUP BY
    b.id,
    b.pnr,
    b.pnr_status,
    b.date_of_journey,
	c.train_number,
    b.created_at,
    t.id,
    t.train_number,
    t.train_name,
    s1.station_name,
    s2.station_name

ORDER BY
    b.date_of_journey DESC,
    b.created_at DESC;
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
                c.train_number,
                pd.id as pid,
                t.train_name,
                s1.station_name as source_name,
                s2.station_name as destination_name,
                COALESCE(SUM(pd.base_fare), 0) as total_fare
            FROM bookingdata b
            LEFT JOIN coaches c ON b.fktrain_number = c.id
			LEFT JOIN trains t ON c.train_number = t.train_number
            LEFT JOIN stations s1 ON b.fksource_code = s1.id
            LEFT JOIN stations s2 ON b.fkdestination_code = s2.id
            LEFT JOIN passengerdata pd ON pd.fkbookingdata = b.id
            WHERE b.pnr = $1
            GROUP BY b.id, b.pnr, pid, b.pnr_status, b.date_of_journey, t.train_number, t.train_name, s1.station_name, s2.station_name, c.train_number
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
      passengers: passengersResult.rows.map((p) => ({
        name: p.p_name,
        age: p.p_age,
        gender: p.p_gender,
        status: p.current_seat_status,
        coach_code: p.coach_code,
        seat_number: p.seat_number,
        berth_type: p.berth_type,
      })),
    };
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};

/**
 * Get booking details by PNR for ticket generation
 */
exports.getBookingByPNR = async (pnr) => {
  const query = `
    
  SELECT
    b.id,
    b.pnr,
    t.train_number,
    tt.train_name,

    s_src.code AS source_code,
    s_src.station_name AS source_station_name,

    s_dest.code AS destination_code,
    s_dest.station_name AS destination_station_name,

    sch_src.departure AS source_departure_time,
    sch_dest.arrival AS destination_arrival_time,

    TO_CHAR(b.date_of_journey, 'DD-MM-YYYY') AS journey_date,
    b.pnr_status,
    rt.description AS reservation_type_description,
    ct.coach_code AS coach_type,    
    b.mobile_number,
    b.email,

    b.created_at AS booking_date,

    /* 🔥 TOTAL BASE FARE FROM PASSENGERS */
    COALESCE(SUM(p.base_fare), 0) AS total_fare

FROM bookingdata b

JOIN coaches t
    ON t.id = b.fktrain_number
JOIN trains tt
    ON tt.train_number = t.train_number

JOIN stations s_src
    ON s_src.id = b.fksource_code

JOIN stations s_dest
    ON s_dest.id = b.fkdestination_code

-- Source station schedule
LEFT JOIN schedules sch_src
    ON sch_src.train_number = t.train_number
   AND sch_src.station_code = s_src.code

-- Destination station schedule
LEFT JOIN schedules sch_dest
    ON sch_dest.train_number = t.train_number
   AND sch_dest.station_code = s_dest.code

LEFT JOIN reservationtype rt
    ON rt.id = b.fkreservation_type

LEFT JOIN coachtype ct
    ON ct.id = b.fkcoach_type

/* 👇 JOIN passengerdata */
LEFT JOIN passengerdata p
    ON p.fkbookingdata = b.id

WHERE b.pnr = $1

GROUP BY
    b.id,
    b.pnr,
    t.train_number,
    tt.train_name,
    s_src.code,
    s_src.station_name,
    s_dest.code,
    s_dest.station_name,
    sch_src.departure,
    sch_dest.arrival,
    b.date_of_journey,
    b.pnr_status,
    rt.description,
    ct.coach_code,
    b.mobile_number,
    b.email,
    b.created_at

LIMIT 1;

  `;

  try {
    const pool = connectMockTrainTicketsDb();
    const result = await pool.query(query, [pnr]);

    if (result.rows.length === 0) {
      return null;
    }

    const booking = result.rows[0];

    // Get passengers for this booking
    const passengersQuery = `
      SELECT
        p_name AS name,
        p_age AS age,
        p_gender AS gender,
        updated_seat_status
      FROM passengerdata
      WHERE fkbookingdata = $1
      ORDER BY id
    `;

    const passengersResult = await pool.query(passengersQuery, [booking.id]);
    booking.passengers = passengersResult.rows;

    return booking;
  } catch (err) {
    console.error("PG ERROR:", err);
    throw mapPgError(err);
  }
};
