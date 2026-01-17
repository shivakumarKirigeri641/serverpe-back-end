/**
 * =====================================================
 * INVOICE PDF GENERATOR
 * =====================================================
 *
 * Generates GST-compliant invoice PDFs for purchases.
 * Uses pdfkit library for PDF generation.
 *
 * Install: npm install pdfkit
 *
 * @author ServerPE
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate Invoice PDF
 *
 * @param {Object} invoiceData - Invoice details
 * @param {string} invoiceData.invoice_number - Invoice number (e.g., SVRP/2026/123)
 * @param {string} invoiceData.buyer_name - Customer name
 * @param {string} invoiceData.buyer_email - Customer email
 * @param {string} invoiceData.buyer_mobile - Customer mobile
 * @param {string} invoiceData.project_title - Project name
 * @param {string} invoiceData.project_type - FULL_STACK or UI_ONLY
 * @param {number} invoiceData.taxable_amount - Base amount
 * @param {number} invoiceData.gst_amount - GST amount (18%)
 * @param {number} invoiceData.total_amount - Total payable
 * @param {string} invoiceData.payment_id - Razorpay payment ID
 * @param {Date} invoiceData.invoice_date - Invoice date
 * @returns {Promise<string>} Path to generated PDF
 */
const generateInvoicePdf = async (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      // Create directory structure
      const year = new Date().getFullYear();
      const invoicesDir = path.join(
        __dirname,
        "../../secure-storage/downloads/invoices",
        year.toString()
      );

      // Ensure directory exists
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      // Generate filename
      const safeInvoiceNumber = invoiceData.invoice_number.replace(/\//g, "_");
      const fileName = `${safeInvoiceNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const relativePath = `src/secure-storage/downloads/invoices/${year}/${fileName}`;

      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // =====================================================
      // HEADER
      // =====================================================
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("ServerPE", { align: "center" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text("Educational Project Solutions", { align: "center" });

      doc.moveDown();
      doc
        .fontSize(16)
        .fillColor("#000000")
        .text("TAX INVOICE", { align: "center" });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#cccccc");
      doc.moveDown();

      // =====================================================
      // INVOICE DETAILS
      // =====================================================
      const invoiceDate = invoiceData.invoice_date
        ? new Date(invoiceData.invoice_date).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN");

      doc.fontSize(10);

      // Left column - Seller details
      const leftX = 50;
      const rightX = 300;
      let y = doc.y;

      doc.font("Helvetica-Bold").text("From:", leftX, y);
      doc.font("Helvetica").text("ServerPE", leftX, y + 15);
      doc.text("Educational Services", leftX, y + 28);
      doc.text("GSTIN: 29XXXXXXXX1Z5", leftX, y + 41);
      doc.text("Karnataka, India", leftX, y + 54);

      // Right column - Invoice details
      doc.font("Helvetica-Bold").text("Invoice Details:", rightX, y);
      doc
        .font("Helvetica")
        .text(`Invoice No: ${invoiceData.invoice_number}`, rightX, y + 15);
      doc.text(`Date: ${invoiceDate}`, rightX, y + 28);
      doc.text(
        `Payment ID: ${invoiceData.payment_id || "N/A"}`,
        rightX,
        y + 41
      );

      doc.moveDown(4);

      // =====================================================
      // BILL TO
      // =====================================================
      y = doc.y;
      doc.font("Helvetica-Bold").text("Bill To:", leftX, y);
      doc
        .font("Helvetica")
        .text(invoiceData.buyer_name || "Customer", leftX, y + 15)
        .text(invoiceData.buyer_email || "", leftX, y + 28)
        .text(invoiceData.buyer_mobile || "", leftX, y + 41);

      doc.moveDown(4);

      // =====================================================
      // ITEMS TABLE
      // =====================================================
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#cccccc");
      doc.moveDown(0.5);

      // Table header
      y = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Description", 50, y, { width: 250 });
      doc.text("Type", 300, y, { width: 80 });
      doc.text("Amount (₹)", 400, y, { width: 100, align: "right" });

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#cccccc");
      doc.moveDown(0.5);

      // Table row
      y = doc.y;
      doc.font("Helvetica");
      doc.text(invoiceData.project_title || "Project Purchase", 50, y, {
        width: 250,
      });
      doc.text(invoiceData.project_type || "FULL_STACK", 300, y, { width: 80 });
      doc.text(Number(invoiceData.taxable_amount).toFixed(2), 400, y, {
        width: 100,
        align: "right",
      });

      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#cccccc");
      doc.moveDown(0.5);

      // =====================================================
      // TOTALS
      // =====================================================
      y = doc.y;
      const totalsX = 350;
      const amountX = 470;

      doc
        .font("Helvetica")
        .text("Subtotal:", totalsX, y)
        .text(
          `₹ ${Number(invoiceData.taxable_amount).toFixed(2)}`,
          amountX,
          y,
          { align: "right" }
        );

      y += 18;
      doc
        .text("CGST (9%):", totalsX, y)
        .text(
          `₹ ${(Number(invoiceData.gst_amount) / 2).toFixed(2)}`,
          amountX,
          y,
          { align: "right" }
        );

      y += 18;
      doc
        .text("SGST (9%):", totalsX, y)
        .text(
          `₹ ${(Number(invoiceData.gst_amount) / 2).toFixed(2)}`,
          amountX,
          y,
          { align: "right" }
        );

      y += 25;
      doc.moveTo(totalsX, y).lineTo(545, y).stroke("#cccccc");
      y += 10;

      doc
        .font("Helvetica-Bold")
        .text("Total:", totalsX, y)
        .text(`₹ ${Number(invoiceData.total_amount).toFixed(2)}`, amountX, y, {
          align: "right",
        });

      // =====================================================
      // FOOTER
      // =====================================================
      doc.moveDown(4);
      doc.fontSize(8).font("Helvetica").fillColor("#888888");
      doc.text(
        "This is a computer generated invoice and does not require signature.",
        50,
        doc.y,
        { align: "center" }
      );
      doc.moveDown();
      doc.text("For support: support@serverpe.in | www.serverpe.in", {
        align: "center",
      });

      // Finalize PDF
      doc.end();

      writeStream.on("finish", () => {
        resolve({
          success: true,
          file_path: filePath,
          relative_path: relativePath,
          file_name: fileName,
        });
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoicePdf;
