const getReservationType = async (client) => {
  const result = await client.query(
    `select type_code, description from reservationtype where is_display=true`
  );
  return result.rows;
};
module.exports = getReservationType;
