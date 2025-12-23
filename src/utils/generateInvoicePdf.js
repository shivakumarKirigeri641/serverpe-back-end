const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePdf = (apiResponse) => {
  const {
    result_user_details,
    result_transaction,
    result_wallet,
    result_credit,
  } = apiResponse;

  const invoiceNo = `SP-${result_transaction.id}`;
  const fileName = `ServerPe_Invoice_${invoiceNo}.pdf`;
  const filePath = path.join(
    path.resolve(__dirname, "..", "docs", "invoices"),
    fileName
  );

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  /* ================= HEADER ================= */

  doc
    .fontSize(18)
    .text("ServerPe App Solutions", { align: "center" })
    .moveDown(0.3);

  doc.fontSize(11).text("Desi API to challenge your UI", { align: "center" });

  doc.fontSize(10).text("GST: XXXXX (Not applicable)", { align: "center" });

  doc.text(
    "The Orchard Apartment, HMT Watch Factory Road,\nJalahalli, Bangalore - 560013",
    { align: "center" }
  );

  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  /* ================= INVOICE META ================= */

  doc.moveDown(0.8);
  doc.fontSize(10);
  doc.text(`Invoice No: ${invoiceNo}`);
  doc.text(
    `Invoice Date: ${new Date(result_transaction.created_at).toLocaleString(
      "en-IN"
    )}`
  );

  /* ================= BILLING INFO ================= */

  doc.moveDown(0.8);
  doc.fontSize(12).text("Billing Information", { underline: true });

  doc.fontSize(10);
  doc.text(`Name: ${result_credit.invoice_user_name}`);
  doc.text(`Mobile: ${result_credit.invoice_mobile_number}`);
  doc.text(`Email: ${result_credit.invoice_email}`);
  doc.text(`Address: ${result_credit.invoice_address}`);

  /* ================= PAYMENT DETAILS ================= */

  doc.moveDown(1);
  doc.fontSize(12).text("Payment Details", { underline: true });
  doc.fontSize(10);

  const baseAmount = (result_transaction.amount / 100).toFixed(2);

  doc.text(`Plan Description: ${result_transaction.description}`);
  doc.text(`Payment Method: ${result_transaction.method.toUpperCase()}`);
  doc.text(`Razorpay Payment ID: ${result_transaction.razorpay_payment_id}`);
  doc.text(`Order ID: ${result_transaction.razorpay_order_id}`);
  doc.text(`UPI Transaction ID: ${result_transaction.upi_transaction_id}`);
  doc.text(`RRN: ${result_transaction.rrn}`);
  doc.text(`Amount Paid: ₹ ${baseAmount} ${result_transaction.currency}`);
  doc.text(`Payment Status: ${result_transaction.status.toUpperCase()}`);

  /* ================= WALLET INFO ================= */

  doc.moveDown(1);
  doc.fontSize(12).text("Credits Summary", { underline: true });
  doc.fontSize(10);
  doc.text(`API Calls Credited: ${result_wallet.outstanding_apikey_count}`);

  /* ================= FOOTER ================= */

  doc.moveDown(2);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

  doc.moveDown(0.5);
  doc
    .fontSize(9)
    .text("This is a system-generated invoice. No signature required.", {
      align: "center",
    });

  doc
    .fontSize(9)
    .text("For queries, contact support@serverpe.in | Powered by ServerPe.in", {
      align: "center",
    });

  doc.end();

  return { filePath, fileName };
};
module.exports = generateInvoicePdf;
