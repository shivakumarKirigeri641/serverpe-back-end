const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

/**
 * Generate a professional train ticket PDF
 * @param {Object} bookingData - Booking details
 * @param {string} outputPath - Full path where PDF will be saved
 * @returns {Promise<string>} - Path to generated PDF
 */
exports.generateTrainTicketPdf = async (bookingData) => {
  try {
    const {
      pnr,
      train_number,
      train_name,
      source_station,
      destination_station,
      departure_time,
      arrival_time,
      journey_date,
      coach_type,
      reservation_type,
      passengers,
      total_fare,
      booking_date,
      booking_status,
      contact_mobile,
      contact_email,
    } = bookingData;

    // Create output directory if it doesn't exist
    const ticketsDir = path.join(
      __dirname,
      "../../src/secure-storage/downloads/projects/mock-train-reservation/tickets"
    );

    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }

    const outputPath = path.join(ticketsDir, `ticket_${pnr}.pdf`);

    // Generate QR code for PNR
    const qrCodeDataUrl = await QRCode.toDataURL(`PNR:${pnr}`, {
      errorCorrectionLevel: "H",
      width: 150,
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // ========== HEADER ==========
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("QuickSmart Mock Train Reservation System", { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .font("Helvetica-Oblique")
        .text("Mock ticket for demonstration of realistic behaviour", {
          align: "center",
        });

      // Watermark
      doc.save();
      doc
        .fontSize(60)
        .fillColor("#e5e7eb")
        .opacity(0.1)
        .rotate(-45, { origin: [300, 400] })
        .text("MOCK TICKET FOR DEMO", 50, 400, { align: "center", width: 500 });
      doc.restore();

      // Line separator
      doc.moveDown(1);
      doc
        .strokeColor("#d1d5db")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(1);

      // ========== BOOKING STATUS ==========
      const statusY = doc.y;
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#047857")
        .text(`BOOKING STATUS: ${booking_status || "CONFIRMED"}`, 50, statusY);

      doc
        .fontSize(10)
        .fillColor("#4b5563")
        .font("Helvetica")
        .text(`PNR: ${pnr}`, 400, statusY, { width: 145, align: "right" });

      doc.moveDown(1.5);

      // ========== TRAIN DETAILS ==========
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text("TRAIN DETAILS", 50);

      doc.moveDown(0.5);

      const trainDetailsY = doc.y;

      // Train Number & Name
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text(`${train_number} - ${train_name}`, 50, trainDetailsY);

      doc.moveDown(0.8);

      // Journey Details
      doc.fontSize(10).font("Helvetica").fillColor("#4b5563");

      const journeyY = doc.y;
      doc.text("From:", 50, journeyY);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(source_station, 100, journeyY);

      doc
        .font("Helvetica")
        .fillColor("#4b5563")
        .text("Departure:", 280, journeyY);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(departure_time, 350, journeyY);

      doc.moveDown(0.7);

      const toY = doc.y;
      doc.font("Helvetica").fillColor("#4b5563").text("To:", 50, toY);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(destination_station, 100, toY);

      doc.font("Helvetica").fillColor("#4b5563").text("Arrival:", 280, toY);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(arrival_time, 350, toY);

      doc.moveDown(0.7);

      const dateY = doc.y;
      doc
        .font("Helvetica")
        .fillColor("#4b5563")
        .text("Journey Date:", 50, dateY);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(journey_date, 150, dateY);

      doc.font("Helvetica").fillColor("#4b5563").text("Class:", 280, dateY);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(`${coach_type} - ${reservation_type}`, 350, dateY);

      doc.moveDown(2);

      // ========== PASSENGER DETAILS ==========
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text("PASSENGER DETAILS", 50);

      doc.moveDown(0.5);

      // Table Header
      const tableTop = doc.y;
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .rect(50, tableTop, 495, 20)
        .fill("#1e40af");

      doc.fillColor("#ffffff");
      doc.text("S.No", 60, tableTop + 6);
      doc.text("Name", 110, tableTop + 6);
      doc.text("Age", 280, tableTop + 6);
      doc.text("Gender", 330, tableTop + 6);
      doc.text("Seat/Berth", 400, tableTop + 6);
      doc.text("Status", 480, tableTop + 6);

      // Table Rows
      let currentY = tableTop + 25;
      passengers.forEach((passenger, index) => {
        const rowColor = index % 2 === 0 ? "#f9fafb" : "#ffffff";

        doc.rect(50, currentY - 5, 495, 22).fill(rowColor);

        doc.fontSize(9).font("Helvetica").fillColor("#1f2937");
        doc.text(index + 1, 60, currentY);
        doc.text(passenger.passenger_name || passenger.name, 110, currentY, {
          width: 160,
        });
        doc.text(passenger.passenger_age || passenger.age, 280, currentY);
        doc.text(passenger.passenger_gender || passenger.gender, 330, currentY);
        doc.text(passenger.seat_number || `S${index + 1}`, 400, currentY);
        doc.text("Confirmed", 480, currentY);

        currentY += 22;
      });

      doc.moveDown(2);

      // ========== FARE DETAILS ==========
      const fareBoxY = doc.y + 20;

      // Draw fare box
      doc
        .rect(350, fareBoxY, 195, 100)
        .strokeColor("#d1d5db")
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text("FARE DETAILS", 360, fareBoxY + 10);

      doc.fontSize(9).font("Helvetica").fillColor("#4b5563");

      const baseFare = Math.round(total_fare / 1.18); // Reverse calculate base fare
      const gst = total_fare - baseFare;

      doc.text("Base Fare:", 360, fareBoxY + 35);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(`₹${baseFare}`, 480, fareBoxY + 35, { align: "right" });

      doc
        .font("Helvetica")
        .fillColor("#4b5563")
        .text("GST (18%):", 360, fareBoxY + 52);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(`₹${gst}`, 480, fareBoxY + 52, { align: "right" });

      doc
        .strokeColor("#d1d5db")
        .lineWidth(0.5)
        .moveTo(360, fareBoxY + 67)
        .lineTo(535, fareBoxY + 67)
        .stroke();

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("Total:", 360, fareBoxY + 75);
      doc
        .fontSize(12)
        .text(`₹${total_fare}`, 480, fareBoxY + 75, { align: "right" });

      // QR Code
      const qrImage = qrCodeDataUrl.split(",")[1];
      const qrBuffer = Buffer.from(qrImage, "base64");

      doc.image(qrBuffer, 60, fareBoxY, {
        width: 100,
        height: 100,
      });

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text("Scan for PNR", 80, fareBoxY + 110, {
          width: 60,
          align: "center",
        });

      // ========== CONTACT INFO ==========
      const contactY = fareBoxY + 130;

      doc.moveDown(10);
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text("CONTACT INFORMATION", 50, contactY);

      doc.fontSize(9).font("Helvetica").fillColor("#4b5563");
      doc.text(`Mobile: ${contact_mobile}`, 50, contactY + 20);
      doc.text(`Email: ${contact_email}`, 50, contactY + 35);

      // ========== FOOTER ==========
      const footerY = 750;

      doc
        .strokeColor("#d1d5db")
        .lineWidth(1)
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .stroke();

      doc.fontSize(8).font("Helvetica").fillColor("#6b7280");
      doc.text("Important Instructions:", 50, footerY + 10);
      doc.text(
        "• Please carry a valid ID proof during your journey  • This is a mock/demo ticket for testing purposes only",
        50,
        footerY + 22,
        { width: 495 }
      );

      doc.text(
        `Booking Date: ${booking_date || new Date().toLocaleString("en-IN")}`,
        50,
        footerY + 50,
        { align: "center", width: 495 }
      );

      doc
        .fontSize(7)
        .text(
          "© QuickSmart Mock Train Reservation System - For Demonstration Purposes Only",
          50,
          footerY + 65,
          { align: "center", width: 495 }
        );

      // Finalize PDF
      doc.end();

      stream.on("finish", () => {
        resolve(outputPath);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};
