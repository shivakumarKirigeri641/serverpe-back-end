const getTestimonials = async (client) => {
  const result = await client.query(
    `select cm.user_name, cc.category_name, cm.message, cm.created_at from serverpe_contactme cm join serverpe_contactcategory cc on cc.id = cm.fkcategory order by cm.created_at`
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "contact me details fetched successfully.",
  };
};
module.exports = getTestimonials;
