const convert_timeStamp_without_timezoneToIndian = (datetimeinstring) => {
  datetimeinstring.setHours(datetimeinstring.getHours() + 5);
  datetimeinstring.setMinutes(datetimeinstring.getMinutes() + 30);
  datetimeinstring = datetimeinstring.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return datetimeinstring;
};
module.exports = convert_timeStamp_without_timezoneToIndian;
