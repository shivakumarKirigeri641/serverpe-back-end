const getCoachType = async (client) => {
  const result = await client.query(
    `select coach_code, coach_name from coachtype`
  );
  return result.rows;
};
module.exports = getCoachType;
