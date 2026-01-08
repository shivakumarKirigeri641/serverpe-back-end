// services/college.service.js

exports.getCollegesByStateId = async (pool, stateId) => {
  const query = `
    SELECT
    c.id,
    c.college_name,
    c.college_university,
    c.college_address,
    c.college_district,
    s.id        AS state_id,
    s.state_name      AS state_name
FROM college_list c
INNER JOIN states s
    ON c.fk_state = s.id
WHERE s.id = $1
ORDER BY c.college_name;

  `;

  try {
    const { rows } = await pool.query(query, [stateId]);

    return {
      statuscode: 200,
      count: rows.length,
      colleges: rows,
    };
  } catch (err) {    
    return {
      statuscode: 500,
      message: "Failed to fetch colleges",
      error: err.message,
    };
  }
};
