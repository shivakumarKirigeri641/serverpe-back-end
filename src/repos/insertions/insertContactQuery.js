const { connectDB } = require("../../database/connectDB");
const pool = connectDB();
const insertContactQuery = async (req) => {
  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] &&
        req.headers["x-forwarded-for"].split(",")[0]) ||
      req.socket?.remoteAddress ||
      null;
    const user_agent = req.headers["user-agent"];
    const result = await pool.query(
      `INSERT INTO contact_queries (user_name, mobile_number, email, query_type_id, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5,$6,$7) returning *`,
      [
        req.body.user_name.trim(),
        req.body.mobile_number.trim(),
        req.body.email ? req.body.email.trim() : null,
        req.body.query_type_id,
        req.body.message.trim(),
        ipAddress,
        user_agent,
      ],
    );
    return {
      statuscode: 201,
      successstatus: true,
      message:
        "Thank you! Your query has been submitted. We will get back to you soon.",
      data: result.rows[0],
    };
  } catch (err) {
    return {
      statuscode: 500,
      successstatus: false,
      message: `Error submitting contact query. Error: ${err.message}`,
    };
  }
};

module.exports = insertContactQuery;
