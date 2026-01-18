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
    u.created_at            AS user_registered_at,
    c.college_name,
    c.college_address,
    c.college_district,
    c.college_university,
    s.state_name
    FROM users u join
    college_list c on u.fk_college_id = c.id
    join states s on c.fk_state = s.id
    
    WHERE u.mobile_number = $1`,
    [req.mobile_number],
  );
  const result_project = await client.query(
    `
    SELECT *from projects where     id=$1`,
    [Number(project_id)],
  );
  const result_project_benefits = await client.query(
    `
    SELECT *from project_benefits where  project_id=$1`,
    [Number(project_id)],
  );
  const basePrice = Number(result_project.rows[0].base_price);
  const gstPercent = Number(result_project.rows[0].gst_percent);

  const total_payment = basePrice + (basePrice * gstPercent) / 100;

  const project = result_project.rows[0];
  if (project && !project.project_type) {
    project.project_type = "FULL_STACK";
  }

  return {
    statuscode: 200,
    successstatus: true,
    data: {
      user_details: result_user.rows[0],
      project_details: project,
      project_benefits: result_project_benefits.rows[0],
      total_payment: total_payment,
    },
  };
};
module.exports = getStudentPurchaseProjectDetails;
