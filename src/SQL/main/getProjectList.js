
const getProjectList = async (client, req) => {
  const result = await client.query(
    `select *from projects order by title;`
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "project details fetched successfully.",
  };
};
module.exports = getProjectList;
