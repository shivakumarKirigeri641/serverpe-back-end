const getDisclaimerBeforeBuyList = async (client, req) => {
  const result = await client.query(
    `SELECT id, title_id, title, description, is_mandatory, is_active 
     FROM disclaimer_before_buy 
     WHERE is_active = true;`,
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "Disclaimers fetched successfully.",
  };
};
module.exports = getDisclaimerBeforeBuyList;
