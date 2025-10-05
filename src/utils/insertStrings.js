const getSeatStringA1 = require("./getSeatStringA1");
const getSeatStringA2 = require("./getSeatStringA2");
const getSeatStringA3 = require("./getSeatStringA3");
const getSeatStringSL = require("./getSeatStringSL");
const getSeatStringCC = require("./getSeatStringCC");
const getSeatStringEC = require("./getSeatStringEC");
const getSeatStringE3 = require("./getSeatStringEC");
const getSeatStringEA = require("./getSeatStringEC");
const getSeatStringFC = require("./getSeatStringEC");
const insertSeatString = async (client) => {
  try {
    let result_coach_a1 = await client.query("select *from coach_a1");
    let result_coach_a2 = await client.query("select *from coach_a2");
    let result_coach_a3 = await client.query("select *from coach_a3");
    let result_coach_sl = await client.query("select *from coach_sl");
    let result_coach_cc = await client.query("select *from coach_cc");
    let result_coach_ec = await client.query("select *from coach_ec");
    let result_coach_fc = await client.query("select *from coach_fc");
    let result_coach_ea = await client.query("select *from coach_ea");
    let result_coach_e3 = await client.query("select *from coach_e3");
    //first insert train_number in seatondate with current date till next 2 months
    //await insertSeats(client);
    for (let i = 1; i < result_coach_a1.rows.length; i++) {
      result_a1_string = getSeatStringA1(
        result_coach_a1.rows[i].train_number,
        result_coach_a1.rows[i].display_name_prefix,
        result_coach_a1.rows[i].bogi_count,
        result_coach_a1.rows[i].total_seat_count,
        result_coach_a1.rows[i].seat_general,
        result_coach_a1.rows[i].seat_rac,
        result_coach_a1.rows[i].seat_tatkal,
        result_coach_a1.rows[i].seat_premium_tatkal,
        result_coach_a1.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_1a = $1 where train_number = $2",
        [result_a1_string, result_coach_a1.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_a2.rows.length; i++) {
      result_a2_string = getSeatStringA2(
        result_coach_a2.rows[i].train_number,
        result_coach_a2.rows[i].display_name_prefix,
        result_coach_a2.rows[i].bogi_count,
        result_coach_a2.rows[i].total_seat_count,
        result_coach_a2.rows[i].seat_general,
        result_coach_a2.rows[i].seat_rac,
        result_coach_a2.rows[i].seat_tatkal,
        result_coach_a2.rows[i].seat_premium_tatkal,
        result_coach_a2.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_2a = $1 where train_number = $2",
        [result_a2_string, result_coach_a2.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_a3.rows.length; i++) {
      result_a3_string = getSeatStringA3(
        result_coach_a3.rows[i].train_number,
        result_coach_a3.rows[i].display_name_prefix,
        result_coach_a3.rows[i].bogi_count,
        result_coach_a3.rows[i].total_seat_count,
        result_coach_a3.rows[i].seat_general,
        result_coach_a3.rows[i].seat_rac,
        result_coach_a3.rows[i].seat_tatkal,
        result_coach_a3.rows[i].seat_premium_tatkal,
        result_coach_a3.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_3a = $1 where train_number = $2",
        [result_a3_string, result_coach_a3.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_sl.rows.length; i++) {
      result_sl_string = getSeatStringSL(
        result_coach_sl.rows[i].train_number,
        result_coach_sl.rows[i].display_name_prefix,
        result_coach_sl.rows[i].bogi_count,
        result_coach_sl.rows[i].total_seat_count,
        result_coach_sl.rows[i].seat_general,
        result_coach_sl.rows[i].seat_rac,
        result_coach_sl.rows[i].seat_tatkal,
        result_coach_sl.rows[i].seat_premium_tatkal,
        result_coach_sl.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_sl = $1 where train_number = $2",
        [result_sl_string, result_coach_sl.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_cc.rows.length; i++) {
      result_cc_string = getSeatStringCC(
        result_coach_cc.rows[i].train_number,
        result_coach_cc.rows[i].display_name_prefix,
        result_coach_cc.rows[i].bogi_count,
        result_coach_cc.rows[i].total_seat_count,
        result_coach_cc.rows[i].seat_general,
        result_coach_cc.rows[i].seat_rac,
        result_coach_cc.rows[i].seat_tatkal,
        result_coach_cc.rows[i].seat_premium_tatkal,
        result_coach_cc.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_cc = $1 where train_number = $2",
        [result_cc_string, result_coach_cc.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_ec.rows.length; i++) {
      result_ec_string = getSeatStringEC(
        result_coach_ec.rows[i].train_number,
        result_coach_ec.rows[i].display_name_prefix,
        result_coach_ec.rows[i].bogi_count,
        result_coach_ec.rows[i].total_seat_count,
        result_coach_ec.rows[i].seat_general,
        result_coach_ec.rows[i].seat_rac,
        result_coach_ec.rows[i].seat_tatkal,
        result_coach_ec.rows[i].seat_premium_tatkal,
        result_coach_ec.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_ec = $1 where train_number = $2",
        [result_ec_string, result_coach_ec.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_fc.rows.length; i++) {
      let result_fc_string = getSeatStringFC(
        result_coach_fc.rows[i].train_number,
        result_coach_fc.rows[i].display_name_prefix,
        result_coach_fc.rows[i].bogi_count,
        result_coach_fc.rows[i].total_seat_count,
        result_coach_fc.rows[i].seat_general,
        result_coach_fc.rows[i].seat_rac,
        result_coach_fc.rows[i].seat_tatkal,
        result_coach_fc.rows[i].seat_premium_tatkal,
        result_coach_fc.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_fc = $1 where train_number = $2",
        [result_fc_string, result_coach_fc.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_e3.rows.length; i++) {
      let result_e3_string = getSeatStringE3(
        result_coach_e3.rows[i].train_number,
        result_coach_e3.rows[i].display_name_prefix,
        result_coach_e3.rows[i].bogi_count,
        result_coach_e3.rows[i].total_seat_count,
        result_coach_e3.rows[i].seat_general,
        result_coach_e3.rows[i].seat_rac,
        result_coach_e3.rows[i].seat_tatkal,
        result_coach_e3.rows[i].seat_premium_tatkal,
        result_coach_e3.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_e3 = $1 where train_number = $2",
        [result_e3_string, result_coach_e3.rows[i].train_number]
      );
    }
    for (let i = 1; i < result_coach_ea.rows.length; i++) {
      let result_ea_string = getSeatStringEA(
        result_coach_ea.rows[i].train_number,
        result_coach_ea.rows[i].display_name_prefix,
        result_coach_ea.rows[i].bogi_count,
        result_coach_ea.rows[i].total_seat_count,
        result_coach_ea.rows[i].seat_general,
        result_coach_ea.rows[i].seat_rac,
        result_coach_ea.rows[i].seat_tatkal,
        result_coach_ea.rows[i].seat_premium_tatkal,
        result_coach_ea.rows[i].name
      );
      await client.query(
        "update seatsondate set coach_ea = $1 where train_number = $2",
        [result_ea_string, result_coach_ea.rows[i].train_number]
      );
    }
  } catch (err) {
    throw err;
  }
};
module.exports = insertSeatString;
