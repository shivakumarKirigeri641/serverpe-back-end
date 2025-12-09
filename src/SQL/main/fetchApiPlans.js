const fetchApiPlans = async (client, isfreeplanfetched) => {
  let result = [];
  if (isfreeplanfetched) {
    result = await client.query(
      `select  *from serverpe_apipricing order by price`
    );
  } else {
    result = await client.query(
      `select  *from serverpe_apipricing where price > 0 order by price`
    );
  }
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "Plans fetched successfully.",
  };
};
module.exports = fetchApiPlans;
