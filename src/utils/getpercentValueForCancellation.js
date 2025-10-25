const getpercentValueForCancellation = (hours, result_cancellation_policy) => {
  let percentvalue = 1;
  let id = 1;
  for (let i = 0; i < result_cancellation_policy.rows.length - 1; i++) {
    if (
      hours > result_cancellation_policy.rows[i].from_time &&
      hours <= result_cancellation_policy.rows[i].to_time
    ) {
      percentvalue = result_cancellation_policy[i].percent_charges;
      id = result_cancellation_policy.rows[i].id;
      break;
    } else if (
      hours > result_cancellation_policy.rows[i].from_time &&
      0 === result_cancellation_policy.rows[i].to_time
    ) {
      percentvalue = result_cancellation_policy.rows[i].percent_charges;
      id = result_cancellation_policy.rows[i].id;
      break;
    }
  }
  return {
    percentvalue,
    id,
  };
};
module.exports = getpercentValueForCancellation;
