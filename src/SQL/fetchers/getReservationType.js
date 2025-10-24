const getReservationType = async (client) => {
  return await client.query(
    `select type_code, description from reservationtype where is_display=true`
  );
};
module.exports = getReservationType;
