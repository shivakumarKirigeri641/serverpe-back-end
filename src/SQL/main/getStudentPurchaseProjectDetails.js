const getStudentPurchaseProjectDetails = async (client, req, project_id) => {
  const result_user = await client.query(
    `
    SELECT
    u.id                    AS user_id,
    u.user_name,
    u.email,
    u.mobile_number,
    u.fk_college_id,
    u.branch,
    u.created_at            AS user_registered_at 
    FROM users u WHERE u.mobile_number = $1`,
    [req.mobile_number]
  );
  const result_project = await client.query(
    `
    SELECT *from projects where     id=$1`,
    [Number(project_id)]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: {user_details: result_user.rows[0], project_details: result_project.rows[0]},
  };
};
module.exports = getStudentPurchaseProjectDetails;
