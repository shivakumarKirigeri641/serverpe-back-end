const sendAlertForContactRequestSMS = require("../../utils/sendAlertForContactRequestSMS");
const insertStudentContactMeData = async (
  client,
  user_name,
  email,
  rating,
  category,
  message = null
) => {
  let result_category = await client.query(
    `select id from feedback_category where category_name= $1`,
    [category]
  );
  if (0 === result_category.rows.length) {
    result_category = await client.query(
      `select id from feedback_category LIMIT 1`
    );
  }
  const result = await client.query(
    `insert into user_feedback (user_name, email, fk_category_id, rating, message) values ($1,$2,$3,$4,$5) returning *`,
    [user_name, email, result_category.rows[0].id, rating, message]
  );
  //alert notifification to me with SMS when user gives contact form
  await sendAlertForContactRequestSMS(user_name, email, category);
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message:
      "Contact information request received successfully. Thank you so much.",
  };
};
module.exports = insertStudentContactMeData;
