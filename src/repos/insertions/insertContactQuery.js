const { connectDB } = require("../../database/connectDB");
const pool = connectDB();
const insertContactQuery = async (
  user_name,
  mobile_number,
  email,
  query_type_id,
  message,
) => {
  try {
    await pool.query(
      `INSERT INTO contact_queries (user_name, mobile_number, email, query_type_id, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user_name.trim(),
        mobile_number.trim(),
        email ? email.trim() : null,
        query_type_id,
        message.trim(),
      ],
    );
    return {
      statuscode: 201,
      successstatus: true,
      message:
        "Thank you! Your query has been submitted. We will get back to you soon.",
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
