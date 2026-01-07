export const updateStudentProfileByMobile = async (client, req) => {  

  try {
    const {
      user_name,
      email,
      mobile_number,
      fk_college_id,
      fk_state_id
    } = req.body;

    const loggedInMobile = req.mobile_number;

    const query = `
      UPDATE users
      SET
          user_name = COALESCE($1, user_name),

          email = CASE
              WHEN is_email_verified = FALSE
              THEN COALESCE($2, email)
              ELSE email
          END,

          mobile_number = CASE
              WHEN is_mobile_verified = FALSE
              THEN COALESCE($3, mobile_number)
              ELSE mobile_number
          END,

          fk_college_id = COALESCE($4, fk_college_id),
          fk_state_id   = COALESCE($5, fk_state_id)

      WHERE mobile_number = $6
      RETURNING
          id,
          user_name,
          email,
          mobile_number,
          is_email_verified,
          is_mobile_verified,
          fk_college_id,
          fk_state_id;
    `;

    const values = [
      user_name ?? null,
      email ?? null,
      mobile_number ?? null,
      fk_college_id ?? null,
      fk_state_id ?? null,
      loggedInMobile
    ];

    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "User not found",
      };
    }

    return {
      statuscode: 200,
      successstatus: true,
      status: "Success",
      message: "Profile updated successfully",
      data: rows[0],
    };

  } catch (err) {
    if (err.code === "23505") {
      return {
        statuscode: 409,
        successstatus: false,
        status: "Failed",
        message: "Email or mobile number already exists",
      };
    }

    throw err;
  } finally {
  }
};
