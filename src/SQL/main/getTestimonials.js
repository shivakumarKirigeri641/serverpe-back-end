const { sendMail } = require("../../utils/emails/sendMail");
const userVisitLandingPageAlertTemplate = require("../../utils/emails/userVisitLandingPageAlertTemplate");
const getTestimonials = async (client, req) => {
  const result = await client.query(
    `select cm.user_name, cc.category_name, cm.message, cm.rating, cm.created_at from serverpe_contactme cm join serverpe_contactcategory cc on cc.id = cm.fkcategory order by cm.created_at`
  );
  //send mail alert on visiting
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
  await sendMail({
    to: process.env.ADMINMAIL,
    subject: "An user landing page visit alert",
    html: userVisitLandingPageAlertTemplate(ipAddress, visitTime, devicename),
    text: "Alert! User visited landing page",
  });
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "contact me details fetched successfully.",
  };
};
module.exports = getTestimonials;
