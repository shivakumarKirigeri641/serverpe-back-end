const getStudentUserProfile = async (client, req) => {
  const result = await client.query(
    `
    SELECT
    -- BASIC PROFILE
    u.id                 AS user_id,
    u.user_name,
    u.email,
    u.mobile_number,
    u.branch,

    -- VERIFICATION STATUS
    u.is_email_verified,
    u.is_mobile_verified,

    -- COLLEGE DETAILS
    c.id                 AS college_id,
    c.college_name,
    c.place              AS college_place,
    c.district           AS college_district,
    c.state              AS college_state,

    -- STATE DETAILS
    s.state_name,
    s.state_code,

    -- ACCOUNT META
    u.created_at         AS registered_on,
    u.updated_at         AS last_profile_update

FROM users u

LEFT JOIN college_list c
    ON c.id = u.fk_college_id

LEFT JOIN states s
    ON s.id = u.fk_state_id

WHERE
    u.mobile_number = $1;
    `,
    [req.mobile_number]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows[0],
  };
};
module.exports = getStudentUserProfile;
