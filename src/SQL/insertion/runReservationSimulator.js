const { connectMockTrainTicketsDb } = require("../../database/connectDB");
const getPostgreClient = require("../getPostgreClient");
const runSimulator_3a = require("./booking_simulator/runSimulator_3a");
const runReservationSimulator = async (client) => {
  const pool = await connectMockTrainTicketsDb();
  client = await getPostgreClient(pool);

  const train_numbers_3a = await client.query(
    `select train_number from coaches where a_3='Y'`
  );
  const train_numbers_2a = await client.query(
    `select train_number from coaches where a_2='Y'`
  );
  const train_numbers_1a = await client.query(
    `select train_number from coaches where a_1='Y'`
  );
  const train_numbers_2s = await client.query(
    `select train_number from coaches where _2s='Y'`
  );
  const train_numbers_cc = await client.query(
    `select train_number from coaches where cc='Y'`
  );
  const train_numbers_ec = await client.query(
    `select train_number from coaches where ec='Y'`
  );
  const train_numbers_ea = await client.query(
    `select train_number from coaches where ea='Y'`
  );
  const train_numbers_e3 = await client.query(
    `select train_number from coaches where e_3='Y'`
  );
  const train_numbers_fc = await client.query(
    `select train_number from coaches where fc='Y'`
  );
  //get random reservation_type
  await runSimulator_3a(pool, client);
};
module.exports = runReservationSimulator;
