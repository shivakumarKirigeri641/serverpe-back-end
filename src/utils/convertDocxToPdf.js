const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const puppeteer = require("puppeteer");

const convertDocxToPdf = async (req, res, fetchedpath) => {
  try {
    const pdfpath = fetchedpath.replace(".docx", ".pdf");
    const docxPath = path.join(__dirname, fetchedpath);
    const pdfPath = path.join(__dirname, pdfpath);

    // 1️⃣ DOCX → HTML
    const result = await mammoth.convertToHtml({ path: docxPath });

    // 2️⃣ HTML → PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(result.value, { waitUntil: "networkidle0" });
    await page.pdf({ path: pdfPath, format: "A4" });

    await browser.close();

    // 3️⃣ Send PDF
    res.download(pdfPath, "ServerPe_API_Documentation.pdf");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "PDF conversion failed",
      });
  }
};

module.exports = convertDocxToPdf;
