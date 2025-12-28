const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const sendInvoiceEmail = require("./emails/sendInvoiceMail");

/**
 * Generates a professional Invoice PDF with Branding, Watermark, and QR Code
 * @param {Object} apiResponse - Contains result_transaction and result_credit data
 */
const generateInvoicePdf = async (apiResponse) => {
  const { result_transaction, result_credit } = apiResponse;

  // 1. Setup Metadata and File Paths
  const currentData = new Date();
  const year = currentData.getFullYear();
  const month = String(currentData.getMonth() + 1).padStart(2, "0");
  const day = String(currentData.getDate()).padStart(2, "0");

  // Fixed Invoice ID Logic
  const invoice_id = `SVRP/MCK/${year}${month}${day}${
    result_credit?.id || "121"
  }`;
  const fileName = `ServerPe_Invoice_SP-${result_credit?.id || "121"}.pdf`;
  const dirPath = path.resolve(__dirname, "..", "docs", "invoices");

  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  const filePath = path.join(dirPath, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  // 2. Dynamic Financial Calculations
  const totalPaid = result_transaction.amount / 100;
  const taxRate = 0.18;
  const basePrice = totalPaid / (1 + taxRate);
  const totalTax = totalPaid - basePrice;
  const cgst_sgst = totalTax / 2;

  // 3. BACKGROUND WATERMARK
  doc.save();
  doc.opacity(0.07);
  doc.fillColor("#075985");
  doc.fontSize(100).font("Helvetica-Bold");
  doc.rotate(-45, { origin: [300, 400] });
  doc.text("ServerPe", 50, 400, { align: "center", width: 500 });
  doc.restore();

  // 4. HEADER: LOGO & COMPANY INFO
  const logoPath = path.join(
    __dirname,
    "..",
    "images",
    "logos",
    "ServerPe_Logo.jpg"
  );
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 130 });
  }

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#1e293b")
    .text("ServerPe App Solutions", 300, 50, { align: "right" });
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#64748b")
    .text("GSTIN: 29XXXXX0000X1Z5", 300, 65, { align: "right" })
    .text("New KHB Colony, LIG 2A, #8, Sirsi - 581402", 300, 77, {
      align: "right",
    })
    .text("Uttara Kannada District, Karnataka, India", 300, 89, {
      align: "right",
    })
    .fillColor("#0284c7")
    .text("billing@serverpe.in", 300, 101, { align: "right" });

  // 5. QR CODE VERIFICATION
  const qrData = `Invoice: ${invoice_id} | Amount: INR ${totalPaid.toFixed(
    2
  )} | Status: PAID`;
  const qrCodeDataURL = await QRCode.toDataURL(qrData);
  doc.image(qrCodeDataURL, 50, 140, { width: 80 });
  doc.fontSize(7).fillColor("#64748b").text("Scan to verify", 55, 220);

  // 6. BILLING & INVOICE DETAILS
  const infoTop = 145;
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#64748b")
    .text("BILL TO", 150, infoTop);
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#1e293b")
    .text(
      result_credit?.invoice_user_name?.toUpperCase() || "Customer",
      150,
      infoTop + 15
    );
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#64748b")
    .text(
      result_credit.invoice_email?.toLowerCase() || "billing@serverpe.in",
      150,
      infoTop + 30
    );

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#64748b")
    .text("INVOICE DETAILS", 350, infoTop);
  doc.fontSize(9).font("Helvetica").fillColor("#1e293b");
  doc
    .text(`Invoice #:`, 350, infoTop + 15)
    .font("Helvetica-Bold")
    .text(invoice_id, 250, infoTop + 15, { align: "right" });
  doc
    .font("Helvetica")
    .text(`Date:`, 350, infoTop + 28)
    .text(`${day}/${month}/${year}`, 450, infoTop + 28, { align: "right" });
  doc
    .text(`Status:`, 350, infoTop + 41)
    .fillColor("#10b981")
    .font("Helvetica-Bold")
    .text("PAID", 450, infoTop + 41, { align: "right" });

  // 7. LINE ITEMS TABLE
  const tableTop = 260;
  doc.rect(50, tableTop, 500, 25).fill("#075985");
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#ffffff");
  doc.text("ITEM DESCRIPTION", 60, tableTop + 8);
  doc.text("QTY", 280, tableTop + 8, { width: 40, align: "center" });
  doc.text("RATE (₹)", 330, tableTop + 8, { width: 70, align: "right" });
  doc.text("TAX (18%)", 410, tableTop + 8, { width: 60, align: "right" });
  doc.text("TOTAL (₹)", 480, tableTop + 8, { width: 60, align: "right" });

  const itemY = tableTop + 35;
  doc.fontSize(9).font("Helvetica").fillColor("#1e293b");
  doc.text(
    result_transaction.description || "API Credits Purchase",
    60,
    itemY,
    { width: 210 }
  );
  doc.text("1", 280, itemY, { width: 40, align: "center" });
  doc.text(basePrice.toFixed(2), 330, itemY, { width: 70, align: "right" });
  doc.text(totalTax.toFixed(2), 410, itemY, { width: 60, align: "right" });
  doc.text(totalPaid.toFixed(2), 480, itemY, { width: 60, align: "right" });

  // 8. SUMMARY SECTION
  const summaryTop = itemY + 50;
  doc.rect(300, summaryTop, 250, 110).stroke("#cbd5e1");
  let curY = summaryTop + 15;

  const drawSummary = (lab, val, isB = false) => {
    doc
      .fontSize(9)
      .font(isB ? "Helvetica-Bold" : "Helvetica")
      .fillColor(isB ? "#1e293b" : "#64748b");
    doc.text(lab, 315, curY);
    doc.text(`₹${val}`, 450, curY, { width: 90, align: "right" });
    curY += 20;
  };

  drawSummary("Subtotal (Taxable)", basePrice.toFixed(2));
  drawSummary("CGST @ 9%", cgst_sgst.toFixed(2));
  drawSummary("SGST @ 9%", cgst_sgst.toFixed(2));
  doc.rect(315, curY - 5, 220, 1).fill("#cbd5e1");
  curY += 10;
  drawSummary("GRAND TOTAL", totalPaid.toFixed(2), true);

  // 9. PROFESSIONAL FOOTER
  const footerY = 540;
  doc.rect(50, footerY, 540, 1).fill("#cbd5e1");
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#075985")
    .text("ServerPe™ - Desi API to challenge your UI", 50, footerY + 15, {
      align: "center",
      width: 500,
    });
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#64748b")
    .text(
      "Web: www.serverpe.in | Email: billing@serverpe.in",
      50,
      footerY + 30,
      { align: "center", width: 500 }
    )
    .text(
      "System-generated invoice. Issued as per GST Act, 2017. No signature required.",
      50,
      footerY + 45,
      { align: "center", width: 500 }
    );

  doc.end();
  //send invoice email
  // Step 2: Extract user details from apiResponse
  const userEmail = result_credit.invoice_email.toLowerCase(); // [cite: 13]
  const userName = result_credit.invoice_user_name.toUpperCase(); // [cite: 12]
  // Step 3: Send the email
  await sendInvoiceEmail(userEmail, userName, filePath, fileName);

  return { filePath, fileName };
};

module.exports = generateInvoicePdf;
