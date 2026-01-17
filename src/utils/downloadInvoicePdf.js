const fs = require("fs");
const path = require("path");

exports.downloadInvoicePdf = async (
  pool,
  invoiceId,
  mobileNumber,
  ipAddress,
) => {
  try {
    // 1️⃣ Validate invoice ownership
    // Using COALESCE for fallback if migration hasn't been run yet, though
    // for download we really need a path.
    const invoiceQuery = `
      SELECT i.id,  i.invoice_number,COALESCE(i.invoice_pdf_path, i.invoice_pdf_path) as path FROM invoices i
JOIN orders o on o.id = i.fk_order_id
JOIN users u 
ON o.fk_user_id = u.id WHERE i.id = $1 AND u.mobile_number = $2;
    `;

    const { rows } = await pool.query(invoiceQuery, [invoiceId, mobileNumber]);

    if (rows.length === 0) {
      return {
        successstatus: false,
        statuscode: 403,
        message: "Invoice not found or access denied",
      };
    }

    const invoice = rows[0];

    // 2️⃣ Audit log (optional - wrap in try/catch in case table doesn't exist)
    try {
      await pool.query(
        `
        INSERT INTO invoice_download_logs
          (fk_invoice, mobile_number, ip_address)
        VALUES ($1, $2, $3)
        `,
        [invoiceId, mobileNumber, ipAddress],
      );
    } catch (logErr) {
      console.warn("Could not log invoice download:", logErr.message);
    }

    if (!invoice.path) {
      return {
        successstatus: false,
        statuscode: 404,
        message: "Invoice file not found (no path in DB)",
      };
    }

    // 3️⃣ Resolve absolute path
    // Navigate to project root (up 2 levels from src/utils)
    const projectRoot = path.join(__dirname, "../..");

    // Resolve full path (if stored path is relative like 'src/secure-storage/...')
    const fullPath = path.isAbsolute(invoice.path)
      ? invoice.path
      : path.join(projectRoot, invoice.path);

    if (!fs.existsSync(fullPath)) {
      return {
        successstatus: false,
        statuscode: 404,
        message: "Invoice file not found on server",
        debug_path: fullPath,
      };
    }

    return {
      successstatus: true,
      statuscode: 200,
      file_path: fullPath,
      file_name: `invoice_${invoice.invoice_number}.pdf`,
    };
  } catch (err) {
    console.error("Invoice Service Error:", err);
    return {
      successstatus: false,
      statuscode: 500,
      message: "Failed to prepare invoice download",
      error: err.message,
    };
  }
};
