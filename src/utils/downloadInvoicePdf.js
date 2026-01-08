// services/invoice.service.js

exports.downloadInvoicePdf = async (
  pool,
  invoiceId,
  mobileNumber,
  ipAddress
) => {
  try {
    // 1️⃣ Validate invoice ownership
    const invoiceQuery = `
      SELECT
        i.id,
        i.invoice_number,
        i.file_path
      FROM invoices i
      INNER JOIN serverpe_users u
        ON i.fk_user = u.id
      WHERE i.id = $1
        AND u.mobile_number = $2;
    `;

    const { rows } = await pool.query(invoiceQuery, [
      invoiceId,
      mobileNumber
    ]);

    if (rows.length === 0) {
      return {
        successstatus: false,
        statuscode: 403,
        message: "Invoice not found or access denied"
      };
    }

    const invoice = rows[0];

    // 2️⃣ Audit log (recommended)
    await pool.query(
      `
      INSERT INTO invoice_download_logs
        (fk_invoice, mobile_number, ip_address)
      VALUES ($1, $2, $3)
      `,
      [invoiceId, mobileNumber, ipAddress]
    );

    return {
      successstatus: true,
      statuscode: 200,
      file_path: invoice.file_path,
      file_name: `invoice_${invoice.invoice_number}.pdf`
    };

  } catch (err) {
    console.error("Invoice Service Error:", err);
    return {
      successstatus: false,
      statuscode: 500,
      message: "Failed to prepare invoice download",
      error: err.message
    };
  }
};
