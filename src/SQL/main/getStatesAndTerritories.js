const { sendMail } = require("../../utils/emails/sendMail");
const userVisitLandingPageAlertTemplate = require("../../utils/emails/userVisitLandingPageAlertTemplate");

const getStatesAndTerritories = async (client, req) => {
  let ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  let visitTime = Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const devicetype = req.headers["user-agent"] || "";
  let devicename = /mobile/i.test(devicetype)
    ? "Mobile"
    : /tablet/i.test(devicetype)
    ? "Tablet"
    : "Desktop/Laptop";
  const result = await client.query(
    `select id, state_name, state_code from states order by state_name`
  );
  //send sms alert
  //send email to alert
  try{
  await sendMail({
    to: process.env.ADMINMAIL,
    subject: "An user landing page visit alert",
    html: userVisitLandingPageAlertTemplate({
      ipAddress,
      visitTime,
      devicename,
    }),
    text: "Alert! User visited landing page",
  });
}
catch(err){
  console.log(err);
}
  return result.rows;
};
module.exports = getStatesAndTerritories;
