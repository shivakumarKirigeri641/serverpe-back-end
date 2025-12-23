const sendAlertForContactRequestSMS = require("../../utils/sendAlertForContactRequestSMS");
const insertContactMeData = async (
  client,
  user_name,
  email,
  rating,
  category,
  message = null
) => {
  let result_category = await client.query(
    `select id from serverpe_contactcategory where category_name= $1`,
    [category]
  );
  if (0 === result_category.rows.length) {
    result_category = await client.query(
      `select id from serverpe_contactcategory where category_name= General feedback`
    );
  }
  const result = await client.query(
    `insert into serverpe_contactme (user_name, emailid, fkcategory, rating, message) values ($1,$2,$3,$4,$5) returning *`,
    [user_name, email, rating, result_category.rows[0].id, message]
  );
  //alert notifification to me with SMS when user gives contact form
  //await sendAlertForContactRequestSMS(user_name, email, category);
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message:
      "Contact information request received successfully. Thank you so much.",
  };
};
module.exports = insertContactMeData;
