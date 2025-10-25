const getCoachType = async (client) => {
  return await client.query(`select coach_code, coach_name from coachtype`);
};
module.exports = getCoachType;
