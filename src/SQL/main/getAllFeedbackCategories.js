const getAllFeedbackCategories = async (client) => {
  const result = await client.query(
    `select category_name from serverpe_contactcategory order by category_name`
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "feedback categories details fetched successfully.",
  };
};
module.exports = getAllFeedbackCategories;
