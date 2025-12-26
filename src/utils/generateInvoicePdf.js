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
  const dirPath = path.resolve(__dirname, "..", "docs", "invoices");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
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
  doc.opacity(0.25);
  doc.fontSize(100).font("Helvetica-Bold");
  doc.fillColor("#4f46e5");
  doc.rotate(-45, { origin: [300, 400] });
  doc.text("ServerPe", 100, 400, { align: "center" });
  doc.restore();

  // --- HEADER ACCENT LINE ---
  doc.rect(50, 25, 500, 3).fill("#4f46e5");

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

  // Professional header background with gradient effect
  doc
    .fillColor("#1e293b")
    .fontSize(36)
    .font("Helvetica-Bold")
    .text("INVOICE", 300, 50, { align: "center" });

  doc
    .fillColor("#6366f1")
    .fontSize(10)
    .font("Helvetica")
    .text("Official Tax Invoice", 300, 80, { align: "center" });

  // --- COMPANY DETAILS ---
  doc.fontSize(11).fillColor("#1e293b").font("Helvetica-Bold");
  doc.text("ServerPe App Solutions", 50, 125);
  doc.fontSize(9).fillColor("#64748b").font("Helvetica");
  doc.text("GSTIN: 29XXXXX0000X1Z5", 50, 142);
  doc.text("New KHB Colony, LIG 2A, #8, Sirsi - 581402", 50, 157);
  doc.text("Uttara Kannada District, Karnataka 560013, India", 50, 172);
  doc.fontSize(8).fillColor("#7c3aed");
  doc.text("Email: billing@serverpe.com", 50, 187);

  // --- INVOICE DETAILS BOX ---
  doc.rect(280, 120, 270, 75).fill("#f8f5ff").stroke("#c7d2fe");
  doc.fontSize(8).fillColor("#6b7280").font("Helvetica");
  doc.text("INVOICE DETAILS", 290, 128);

  doc.fontSize(9).fillColor("#1e293b").font("Helvetica-Bold");
  doc.text(`Invoice #: ${invoice_id}`, 290, 145);
  doc.fontSize(9).fillColor("#374151").font("Helvetica");
  doc.text(
    `Date: ${new Date(result_transaction.created_at).toLocaleDateString(
      "en-IN"
    )}`,
    290,
    163,
    { width: 250 }
  );
  doc.fontSize(9).fillColor("#10b981").font("Helvetica-Bold");
  doc.text(`Status: ✓ PAID`, 290, 181);

  // --- BILL TO SECTION ---
  doc.rect(50, 210, 230, 75).fill("#ffffff").stroke("#e2e8f0");
  doc
    .fontSize(10)
    .fillColor("#1e293b")
    .font("Helvetica-Bold")
    .text("BILL TO", 60, 218);
  doc.fontSize(9).font("Helvetica").fillColor("#1e293b");
  doc.text(result_credit.invoice_user_name, 60, 240);
  doc.fontSize(8).fillColor("#64748b");
  doc.text(result_credit.invoice_address, 60, 256, { width: 200 });
  doc.fontSize(8).fillColor("#7c3aed");
  doc.text(result_credit.invoice_email, 60, 270);

  // --- PAYMENT DETAILS ---
  doc.rect(290, 210, 260, 75).fill("#fffbeb").stroke("#fbbf24");
  doc
    .fontSize(10)
    .fillColor("#92400e")
    .font("Helvetica-Bold")
    .text("PAYMENT METHOD", 300, 218);
  doc.fontSize(8).fillColor("#78350f").font("Helvetica");
  doc.text("Mode: Online Payment (Razorpay)", 300, 240);
  doc.text("Transaction ID: " + (result_transaction.id || "N/A"), 300, 256, {
    width: 230,
  });
  doc.fontSize(7).fillColor("#b45309");
  doc.text("Amount Paid: ₹" + totalPaid.toFixed(2), 300, 270);

  // --- TABLE HEADER ---
  const tableTop = 310;
  doc.rect(50, tableTop, 500, 30).fill("#4f46e5");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
  doc.text("ITEM DESCRIPTION", 60, tableTop + 9);
  doc.text("QTY", 310, tableTop + 9);
  doc.text("RATE (₹)", 360, tableTop + 9);
  doc.text("TAX (18%)", 420, tableTop + 9);
  doc.text("TOTAL (₹)", 490, tableTop + 9);

  // --- TABLE ROW ---
  const rowY = tableTop + 30;
  doc.rect(50, rowY, 500, 55).fill("#f8fafc").stroke("#cbd5e1");
  doc.fillColor("#1e293b").font("Helvetica").fontSize(9);
  doc.text(
    result_transaction.description || "API Credits Purchase",
    60,
    rowY + 18,
    { width: 240 }
  );
  doc.text("1", 310, rowY + 18);
  doc.fillColor("#000000").font("Helvetica-Bold");
  doc.text(`₹${basePrice.toFixed(2)}`, 360, rowY + 18);
  doc.text(`₹${totalTax.toFixed(2)}`, 420, rowY + 18);
  doc.text(`₹${totalPaid.toFixed(2)}`, 490, rowY + 18);

  // --- GST BREAKDOWN & TOTAL ---
  const summaryY = rowY + 65;
  doc.rect(280, summaryY, 270, 130).fill("#ffffff").stroke("#cbd5e1");

  // Taxable Value
  doc.fontSize(9).fillColor("#64748b").font("Helvetica");
  doc.text("Subtotal (Taxable Value)", 290, summaryY + 12);
  doc.fontSize(10).fillColor("#1e293b").font("Helvetica-Bold");
  doc.text(`₹${basePrice.toFixed(2)}`, 510, summaryY + 12, { align: "right" });

  // CGST
  doc.fontSize(9).fillColor("#64748b").font("Helvetica");
  doc.text("CGST @ 9%", 290, summaryY + 35);
  doc.fontSize(10).fillColor("#1e293b").font("Helvetica");
  doc.text(`₹${cgst_sgst.toFixed(2)}`, 510, summaryY + 35, { align: "right" });

  // SGST
  doc.fontSize(9).fillColor("#64748b").font("Helvetica");
  doc.text("SGST @ 9%", 290, summaryY + 58);
  doc.fontSize(10).fillColor("#1e293b").font("Helvetica");
  doc.text(`₹${cgst_sgst.toFixed(2)}`, 510, summaryY + 58, { align: "right" });

  // Divider line
  doc.rect(290, summaryY + 78, 210, 1).fill("#e2e8f0");

  // Grand Total highlight with shadow effect
  doc.rect(290, summaryY + 82, 210, 32).fill("#4f46e5");
  doc.fontSize(11).font("Helvetica-Bold").fillColor("#ffffff");
  doc.text("GRAND TOTAL", 300, summaryY + 93);
  doc.fontSize(13).font("Helvetica-Bold").fillColor("#fbbf24");
  doc.text(`₹${totalPaid.toFixed(2)}`, 485, summaryY + 93, { align: "right" });

  // --- TERMS & CONDITIONS ---
  doc.fontSize(8).fillColor("#64748b").font("Helvetica-Bold");
  doc.text("TERMS & CONDITIONS:", 50, 700);
  doc.fontSize(7).fillColor("#64748b").font("Helvetica");
  doc.text(
    "1. Payment terms: Due on receipt | 2. Issued as per GST Act, 2017",
    50,
    712
  );
  doc.text(
    "3. For discrepancies, contact billing@serverpe.com | 4. Valid for 30 days",
    50,
    722
  );

  // --- FOOTER DIVIDER ---
  const footerY = 750;
  doc.rect(50, footerY - 10, 500, 1).fill("#cbd5e1");

  // --- PROFESSIONAL FOOTER ---
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#1e293b");
  doc.text("ServerPe™ - Your Partner in Digital Solutions", 50, footerY + 2, {
    align: "center",
  });

  doc.fontSize(8).fillColor("#64748b").font("Helvetica");
  doc.text(
    "Web: www.serverpe.com | Email: billing@serverpe.com | Phone: +91-XXXXX-XXXXX",
    50,
    footerY + 18,
    { align: "center" }
  );

  doc.fontSize(7).fillColor("#94a3b8").font("Helvetica");
  doc.text(
    "This is a system-generated invoice and does not require a signature. GST Registration Certificate available upon request.",
    50,
    footerY + 32,
    { align: "center" }
  );

  doc.fontSize(6).fillColor("#cbd5e1");
  doc.text(
    `Generated: ${new Date().toLocaleString(
      "en-IN"
    )} | Document ID: ${invoice_id}`,
    50,
    footerY + 46,
    { align: "center" }
  );

  doc.end();
  return { filePath, fileName };
};

module.exports = generateInvoicePdf;
