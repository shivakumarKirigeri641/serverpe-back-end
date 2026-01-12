const { sendMail } = require("../../utils/emails/sendMail");
const userVisitLandingPageAlertTemplate = require("../../utils/emails/userVisitLandingPageAlertTemplate");
const getTestimonials = async (client, req) => {
  const result = await client.query(
    `select f.user_name, c.category_name, f.message, f.rating, f.created_at from user_feedback f join feedback_category c on c.id = f.fk_category_id order by f.created_at`
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
    html: await userVisitLandingPageAlertTemplate({
      ipAddress,
      visitTime,
      devicename,
    }),
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
