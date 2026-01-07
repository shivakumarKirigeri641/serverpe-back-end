
const getDisclaimerBeforeBuyList = async (client, req) => {
  const result = await client.query(
    `select *from disclaimer_before_buy order by title_id;`
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "project details fetched successfully.",
  };
};
module.exports = getDisclaimerBeforeBuyList;
