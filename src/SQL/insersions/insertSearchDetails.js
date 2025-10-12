const jwt = require("jsonwebtoken");
const convert_timeStamp_without_timezoneToIndian = require("../../utils/convert_timeStamp_without_timezoneToIndian");
const insertSearchDetails = async (
  client,
  req,
  source_code,
  destination_code
) => {
  try {
    await client.query("BEGIN");
    const { token } = req.cookies;
    const result = await jwt.verify(token, process.env.SECRET_KEY);
    const result_user = await client.query(
      "select *from serverpe_user_token_sessions where mobile_number = $1",
      [result.mobile_number]
    );
    const result_sourcename = await client.query(
      "select station_name from stations where code=$1",
      [source_code.toUpperCase()]
    );
    const result_destinationname = await client.query(
      "select station_name from stations where code=$1",
      [destination_code.toUpperCase()]
    );
    const currentdateandtime = convert_timeStamp_without_timezoneToIndian(
      new Date()
    );
    await client.query(
      "insert into searchdata (fkuser, source_code, destination_code, source, destination, dateOfJourney, dateofsearch) values ($1,$2,$3,$4, $5,$6,$7)",
      [
        result_user.rows[0].id,
        source_code,
        destination_code,
        result_sourcename.rows[0].station_name,
        result_destinationname.rows[0].station_name,
        new Date(),
        new Date(),
      ]
    );
    await client.query("COMMIT");
  } catch (err) {
    console.log(err);
    await client.query("ROLLBACK");
    throw {
      success: false,
      message: "Failed in fetching information from session!",
      data: err,
    };
  }
};

module.exports = insertSearchDetails;
