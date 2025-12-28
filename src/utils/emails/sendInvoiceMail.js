const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (userEmail, userName, filePath, fileName) => {
  try {
    // 1. Create a Transporter
    // Replace with your actual SMTP details (e.g., Gmail, Outlook, or Custom SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.BILLINGMAIL,
        pass: process.env.BILLINGMAIL_PASSWORD,
      },
    });

    // 2. Setup Email Options
    const mailOptions = {
      from: '"ServerPe Billing" <billing@serverpe.in>', // [cite: 10, 27]
      to: userEmail, // [cite: 13]
      subject: `Your Invoice from ServerPe - ${fileName}`,
      text: `Hello ${userName},\n\nPlease find attached your invoice for your recent transaction with ServerPe.\n\nThank you for choosing us!`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #075985;">Hello ${userName},</h2>
          <p>Thank you for your payment. Your transaction was successful.</p>
          <p>Please find your official tax invoice attached to this email.</p>
          <br>
          <p><b>Regards,</b><br>ServerPe Team</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 11px; color: #999;">This is an automated billing message. Please do not reply to this email.</p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          path: filePath,
          contentType: "application/pdf",
        },
      ],
    };

    // 3. Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
module.exports = sendInvoiceEmail;
