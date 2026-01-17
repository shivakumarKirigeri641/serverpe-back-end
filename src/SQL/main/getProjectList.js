
const getProjectList = async (client, req) => {
  // Using SELECT * to avoid issues if new columns haven't been added yet
  const result = await client.query(
    `SELECT * FROM projects ORDER BY title;`
  );
  
  // Add default project_type if column doesn't exist
  const data = result.rows.map(row => ({
    ...row,
    project_type: row.project_type || 'FULL_STACK'
  }));
  
  return {
    statuscode: 200,
    successstatus: true,
    data: data,
    message: "project details fetched successfully.",
  };
};

module.exports = getProjectList;
