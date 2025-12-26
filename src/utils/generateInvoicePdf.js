const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePdf = (apiResponse) => {
  const { result_transaction, result_credit } = apiResponse;
  const currentData = new Date();
  const year = currentData.getFullYear();
  const month = currentData.getMonth() + 1;
  const day = currentData.getDate();
  const invoice_id = `${
    result_credit?.invoice_prefix + year + month + day + result_credit?.id
  }`;
  const invoiceNo = `SP-${result_credit?.id}`;
  const fileName = `ServerPe_Invoice_${invoiceNo}.pdf`;
  const filePath = path.join(
    path.resolve(__dirname, "..", "docs", "invoices"),
    fileName
  );

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  // Calculations
  const totalPaid = result_transaction.amount / 100;
  const taxRate = 0.18;
  const basePrice = totalPaid / (1 + taxRate);
  const totalTax = totalPaid - basePrice;
  const cgst_sgst = totalTax / 2;

  // --- WATERMARK ---
  doc.save();
  doc.opacity(0.1);
  doc.fontSize(80).font("Helvetica-Bold");
  doc.rotate(-45, { origin: [300, 400] });
  doc.text("ServerPe", 100, 400, { align: "center" });
  doc.restore();

  // --- HEADER & LOGO ---
  const logoPath = path.join(__dirname, "..", "images", "ServerPe_Logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 120 });
  } else {
    doc
      .fontSize(20)
      .fillColor("#4f46e5")
      .font("Helvetica-Bold")
      .text("ServerPe", 50, 50);
  }

  doc
    .fillColor("#000000")
    .fontSize(25)
    .font("Helvetica-Bold")
    .text("INVOICE", 400, 50, { align: "right" });

  doc.fontSize(10).fillColor("#333333").font("Helvetica");
  doc.text("ServerPe App Solutions", 50, 110);
  doc.text("GSTIN: 29XXXXX0000X1Z5", 50, 125);
  doc.text("New KHB Colony, ", 50, 140);
  doc.text("LIG 2A, #8", 50, 140);
  doc.text("Sirsi - 581402", 50, 140);
  doc.text("District: Uttara Kannada, Karnataka - 560013", 50, 140);
  doc.text("State: Karnataka", 50, 140);

  doc.text(`Invoice #: ${invoice_id}`, 300, 85, { align: "right" });
  doc.text(
    `Date: ${new Date(result_transaction.created_at).toLocaleDateString(
      "en-IN"
    )}`,
    400,
    115,
    { align: "right" }
  );
  doc.text(`Status: PAID`, 400, 130, { align: "right" });

  // --- BILL TO ---
  doc.fontSize(12).font("Helvetica-Bold").text("Bill To", 50, 185);
  doc.fontSize(10).font("Helvetica");
  doc.text(result_credit.invoice_user_name, 50, 205);
  doc.text(result_credit.invoice_address, 50, 220, { width: 220 });
  doc.text(`Email: ${result_credit.invoice_email}`, 50, 255);

  // --- TABLE HEADER ---
  const tableTop = 300;
  doc.rect(50, tableTop, 500, 20).fill("#f3f4f6").stroke("#e5e7eb");
  doc.fillColor("#374151").font("Helvetica-Bold");
  doc.text("Item Description", 60, tableTop + 5);
  doc.text("Qty", 300, tableTop + 5);
  doc.text("Rate", 360, tableTop + 5);
  doc.text("Tax (18%)", 430, tableTop + 5);
  doc.text("Total", 500, tableTop + 5);

  // --- TABLE ROW ---
  const rowY = tableTop + 20;
  doc.rect(50, rowY, 500, 45).stroke("#e5e7eb");
  doc.fillColor("#000000").font("Helvetica");
  doc.text(
    result_transaction.description || "API Credits Purchase",
    60,
    rowY + 18
  );
  doc.text("1", 300, rowY + 18);
  doc.text(basePrice.toFixed(2), 360, rowY + 18);
  doc.text(totalTax.toFixed(2), 430, rowY + 18);
  doc.text(totalPaid.toFixed(2), 500, rowY + 18);

  // --- GST BREAKDOWN & TOTAL ---
  const summaryY = rowY + 70;
  doc.rect(330, summaryY, 220, 100).stroke("#e5e7eb");

  doc.fontSize(10);
  doc.text("Taxable Value", 340, summaryY + 15);
  doc.text(`₹${basePrice.toFixed(2)}`, 480, summaryY + 15, { align: "right" });

  doc.text("CGST (9%)", 340, summaryY + 35);
  doc.text(`₹${cgst_sgst.toFixed(2)}`, 480, summaryY + 35, { align: "right" });

  doc.text("SGST (9%)", 340, summaryY + 55);
  doc.text(`₹${cgst_sgst.toFixed(2)}`, 480, summaryY + 55, { align: "right" });

  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Grand Total", 340, summaryY + 80);
  doc.text(`₹${totalPaid.toFixed(2)}`, 480, summaryY + 80, { align: "right" });

  // --- FOOTER ---
  doc.fontSize(9).font("Helvetica").fillColor("#6b7280");
  doc.text(
    "This is a system-generated invoice and does not require a signature.",
    50,
    750,
    { align: "center" }
  );

  doc.end();
  return { filePath, fileName };
};

module.exports = generateInvoicePdf;
