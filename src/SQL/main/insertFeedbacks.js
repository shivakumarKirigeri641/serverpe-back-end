const sendAlertForFeedbackSMS = require("../../utils/sendAlertForFeedbackSMS");

const insertFeedbacks = async (client, mobile_number, jsondata) => {
  const result_user = await client.query(
    `select *from serverpe_user where mobile_number= $1`,
    [mobile_number]
  );
  let result_category = await client.query(
    `select id from serverpe_contactcategory where category_name= $1`,
    [jsondata.category]
  );
  if (0 === result_category.rows.length) {
    result_category = await client.query(
      `select id from serverpe_contactcategory where category_name= General feedback`
    );
  }
  const result = await client.query(
    `insert into serverpe_userfeedback (fkuser, fkcategory, rating, message) values ($1,$2,$3,$4) returning *`,
    [
      result_user.rows[0].id,
      result_category.rows[0].id,
      jsondata.rating,
      jsondata.message,
    ]
  );
  //alert notifification to me with SMS when user feedback gives
  /*await sendAlertForFeedbackSMS(
    result_user.rows[0].mobile_number,
    jsondata.category,
    jsondata.rating
  );*/
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "feedback request received successfully. Thank you so much.",
  };
};
module.exports = insertFeedbacks;
