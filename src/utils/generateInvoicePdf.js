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
  const logoPath = path.join(
    __dirname,
    "..",
    "images",
    "logos",
    "ServerPe_Logo.jpg"
  );
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 30, { width: 100, height: 80 });
  } else {
    doc
      .fontSize(20)
      .fillColor("#4f46e5")
      .font("Helvetica-Bold")
      .text("ServerPe", 50, 50);
  }

  // Professional header background
  doc.rect(160, 30, 340, 80).fill("#f8f9fa").stroke("#e5e7eb");

  doc
    .fillColor("#1f2937")
    .fontSize(28)
    .font("Helvetica-Bold")
    .text("INVOICE", 175, 48, { align: "left" });

  doc
    .fillColor("#6366f1")
    .fontSize(11)
    .font("Helvetica")
    .text("Professional Invoice from ServerPe", 175, 78, { align: "left" });

  doc.fontSize(10).fillColor("#333333").font("Helvetica");
  doc.text("ServerPe App Solutions", 50, 125);
  doc.fontSize(9).fillColor("#666666");
  doc.text("GSTIN: 29XXXXX0000X1Z5", 50, 142);
  doc.text("New KHB Colony, LIG 2A, #8", 50, 157);
  doc.text("Sirsi - 581402, Uttara Kannada", 50, 172);
  doc.text("Karnataka, India | State: Karnataka", 50, 187);

  // Invoice details on the right
  doc.fontSize(10).fillColor("#374151").font("Helvetica");
  doc.text(`Invoice #: ${invoice_id}`, 320, 125, { align: "left" });
  doc.text(
    `Date: ${new Date(result_transaction.created_at).toLocaleDateString(
      "en-IN"
    )}`,
    320,
    142,
    { align: "left" }
  );
  doc
    .fillColor("#10b981")
    .font("Helvetica-Bold")
    .text(`Status: PAID`, 320, 159, { align: "left" });

  // --- BILL TO ---
  doc.rect(50, 210, 500, 70).fill("#ffffff").stroke("#d1d5db");
  doc
    .fontSize(11)
    .fillColor("#1f2937")
    .font("Helvetica-Bold")
    .text("Bill To", 60, 220);
  doc.fontSize(10).font("Helvetica").fillColor("#374151");
  doc.text(result_credit.invoice_user_name, 60, 245);
  doc.text(result_credit.invoice_address, 60, 263, { width: 480 });
  doc.fontSize(9).fillColor("#6b7280");
  doc.text(`Email: ${result_credit.invoice_email}`, 60, 270);

  // --- TABLE HEADER ---
  const tableTop = 305;
  doc.rect(50, tableTop, 500, 25).fill("#4f46e5");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11);
  doc.text("Item Description", 60, tableTop + 6);
  doc.text("Qty", 300, tableTop + 6);
  doc.text("Rate (₹)", 360, tableTop + 6);
  doc.text("Tax (18%)", 430, tableTop + 6);
  doc.text("Total (₹)", 500, tableTop + 6);

  // --- TABLE ROW ---
  const rowY = tableTop + 25;
  doc.rect(50, rowY, 500, 50).fill("#f9fafb").stroke("#d1d5db");
  doc.fillColor("#000000").font("Helvetica").fontSize(10);
  doc.text(
    result_transaction.description || "API Credits Purchase",
    60,
    rowY + 16
  );
  doc.text("1", 300, rowY + 16);
  doc.text(`₹${basePrice.toFixed(2)}`, 360, rowY + 16);
  doc.text(`₹${totalTax.toFixed(2)}`, 430, rowY + 16);
  doc.text(`₹${totalPaid.toFixed(2)}`, 500, rowY + 16);

  // --- GST BREAKDOWN & TOTAL ---
  const summaryY = rowY + 70;
  doc.rect(280, summaryY, 270, 115).fill("#ffffff").stroke("#d1d5db");

  doc.fontSize(10).fillColor("#374151").font("Helvetica");
  doc.text("Taxable Value", 290, summaryY + 15);
  doc.fillColor("#000000").font("Helvetica-Bold");
  doc.text(`₹${basePrice.toFixed(2)}`, 480, summaryY + 15, { align: "right" });

  doc.fillColor("#374151").font("Helvetica").fontSize(10);
  doc.text("CGST (9%)", 290, summaryY + 37);
  doc.fillColor("#000000").font("Helvetica");
  doc.text(`₹${cgst_sgst.toFixed(2)}`, 480, summaryY + 37, { align: "right" });

  doc.fillColor("#374151").font("Helvetica");
  doc.text("SGST (9%)", 290, summaryY + 59);
  doc.fillColor("#000000").font("Helvetica");
  doc.text(`₹${cgst_sgst.toFixed(2)}`, 480, summaryY + 59, { align: "right" });

  // Grand Total highlight
  doc.rect(290, summaryY + 80, 210, 25).fill("#4f46e5");
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#ffffff");
  doc.text("Grand Total", 300, summaryY + 87);
  doc.text(`₹${totalPaid.toFixed(2)}`, 480, summaryY + 87, { align: "right" });

  // --- FOOTER ---
  const footerY = 730;
  doc.rect(50, footerY - 10, 500, 1).fill("#d1d5db");

  doc.fontSize(9).font("Helvetica").fillColor("#6b7280");
  doc.text(
    "This is a system-generated invoice and does not require a signature.",
    50,
    footerY,
    { align: "center" }
  );

  doc.fontSize(8).fillColor("#9ca3af");
  doc.text(
    "For more information, visit www.serverpe.com | Contact: support@serverpe.com",
    50,
    footerY + 20,
    { align: "center" }
  );

  doc.fontSize(7).fillColor("#d1d5db");
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")}`,
    50,
    footerY + 38,
    { align: "center" }
  );

  doc.end();
  return { filePath, fileName };
};

module.exports = generateInvoicePdf;
