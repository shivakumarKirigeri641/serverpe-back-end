const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};
module.exports = isNumeric;
