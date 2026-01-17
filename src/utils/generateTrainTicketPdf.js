const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

// Color Palette - Professional Railway Theme
const COLORS = {
  primary: "#1e3a5f", // Deep navy blue
  secondary: "#2563eb", // Bright blue
  accent: "#059669", // Green for confirmed status
  warning: "#d97706", // Orange for waitlist
  danger: "#dc2626", // Red for cancelled
  dark: "#1f2937", // Dark gray for text
  medium: "#4b5563", // Medium gray
  light: "#9ca3af", // Light gray
  border: "#e5e7eb", // Border color
  background: "#f8fafc", // Light background
  white: "#ffffff",
  gold: "#b8860b", // Gold accent
};

/**
 * Draw a rounded rectangle with optional shadow effect
 */
const drawRoundedRect = (doc, x, y, width, height, radius, options = {}) => {
  const { fill, stroke, shadow } = options;

  // Simulate shadow
  if (shadow) {
    doc.save();
    doc.fillColor("#00000010");
    doc.roundedRect(x + 3, y + 3, width, height, radius).fill();
    doc.restore();
  }

  doc.roundedRect(x, y, width, height, radius);

  if (fill) {
    doc.fillColor(fill).fill();
  }
  if (stroke) {
    doc
      .strokeColor(stroke.color || COLORS.border)
      .lineWidth(stroke.width || 1)
      .stroke();
  }
};

/**
 * Draw a section header with decorative line
 */
const drawSectionHeader = (doc, text, x, y, width) => {
  doc.save();

  // Decorative left bar
  doc.rect(x, y, 4, 20).fill(COLORS.secondary);

  // Header text
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor(COLORS.primary)
    .text(text.toUpperCase(), x + 12, y + 4);

  // Underline
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(x, y + 24)
    .lineTo(x + width, y + 24)
    .stroke();

  doc.restore();
  return y + 30;
};

/**
 * Generate a professional enterprise-level train ticket PDF
 * @param {Object} bookingData - Booking details
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
    const qrCodeDataUrl = await QRCode.toDataURL(
      JSON.stringify({ pnr, train: train_number, date: journey_date }),
      { errorCorrectionLevel: "H", width: 200, margin: 1 }
    );

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const pageWidth = 515;
      const startX = 40;

      // ══════════════════════════════════════════════════════════════
      // HEADER SECTION - Enterprise Branding
      // ══════════════════════════════════════════════════════════════

      // Header background with gradient effect (simulated)
      doc.rect(0, 0, 595, 100).fill(COLORS.primary);
      doc.rect(0, 95, 595, 5).fill(COLORS.secondary);

      // Company Logo Area (placeholder circle)
      doc.circle(70, 50, 25).fill(COLORS.white);
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text("QS", 55, 40);

      // Company Name
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(COLORS.white)
        .text("QuickSmart Railways", 110, 30);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text("Electronic Reservation Slip (ERS)", 110, 55);

      // Ticket Type Badge
      doc.roundedRect(450, 30, 100, 30, 5).fill(COLORS.gold);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(COLORS.white)
        .text("E-TICKET", 465, 40);

      // Booking Reference
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text(`Ref: ${pnr}`, 450, 65, { width: 100, align: "center" });

      let currentY = 115;

      // ══════════════════════════════════════════════════════════════
      // PNR & STATUS BAR
      // ══════════════════════════════════════════════════════════════

      // PNR Box with shadow
      drawRoundedRect(doc, startX, currentY, 250, 50, 8, {
        fill: COLORS.white,
        shadow: true,
      });
      doc
        .roundedRect(startX, currentY, 250, 50, 8)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.medium)
        .text("PNR NUMBER", startX + 15, currentY + 10);

      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text(pnr, startX + 15, currentY + 24);

      // Status Box
      const statusColor =
        booking_status === "CANCELLED"
          ? COLORS.danger
          : booking_status === "WAITLIST"
          ? COLORS.warning
          : COLORS.accent;

      drawRoundedRect(doc, startX + 265, currentY, 250, 50, 8, {
        fill: COLORS.white,
        shadow: true,
      });
      doc
        .roundedRect(startX + 265, currentY, 250, 50, 8)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.medium)
        .text("BOOKING STATUS", startX + 280, currentY + 10);

      // Status badge
      doc
        .roundedRect(startX + 280, currentY + 26, 100, 18, 4)
        .fill(statusColor);
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(COLORS.white)
        .text(booking_status || "CONFIRMED", startX + 285, currentY + 29);

      currentY += 65;

      // ══════════════════════════════════════════════════════════════
      // TRAIN DETAILS CARD
      // ══════════════════════════════════════════════════════════════

      // Main card with shadow
      drawRoundedRect(doc, startX, currentY, pageWidth, 130, 10, {
        fill: COLORS.white,
        shadow: true,
      });
      doc
        .roundedRect(startX, currentY, pageWidth, 130, 10)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      // Train info header bar
      doc.rect(startX, currentY, pageWidth, 35).fill(COLORS.background);
      doc.roundedRect(startX, currentY, pageWidth, 35, 10);

      // Train icon (circle with T)
      doc.circle(startX + 25, currentY + 17, 12).fill(COLORS.secondary);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(COLORS.white)
        .text("T", startX + 20, currentY + 11);

      // Train Number & Name
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text(`${train_number}`, startX + 50, currentY + 8);

      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor(COLORS.dark)
        .text(`${train_name}`, startX + 120, currentY + 10);

      // Class & Quota badges
      doc
        .roundedRect(startX + 380, currentY + 7, 60, 20, 4)
        .fill(COLORS.secondary);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(COLORS.white)
        .text(coach_type, startX + 390, currentY + 12);

      doc
        .roundedRect(startX + 445, currentY + 7, 60, 20, 4)
        .strokeColor(COLORS.secondary)
        .lineWidth(1)
        .stroke();
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(COLORS.secondary)
        .text(reservation_type, startX + 450, currentY + 12);

      // Journey Details - Two Column Layout
      const journeyY = currentY + 50;

      // FROM Section
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.light)
        .text("FROM", startX + 20, journeyY);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(COLORS.dark)
        .text(source_station, startX + 20, journeyY + 14, { width: 180 });

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text(departure_time, startX + 20, journeyY + 55);

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.medium)
        .text("Departure", startX + 20, journeyY + 75);

      // Arrow/Journey indicator
      const arrowX = startX + 230;
      doc
        .strokeColor(COLORS.secondary)
        .lineWidth(2)
        .moveTo(arrowX, journeyY + 40)
        .lineTo(arrowX + 50, journeyY + 40)
        .stroke();

      // Arrow head
      doc
        .moveTo(arrowX + 45, journeyY + 35)
        .lineTo(arrowX + 55, journeyY + 40)
        .lineTo(arrowX + 45, journeyY + 45)
        .fill(COLORS.secondary);

      // Journey date in center
      doc
        .roundedRect(arrowX + 5, journeyY + 50, 50, 20, 4)
        .fill(COLORS.background);
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(COLORS.medium)
        .text(journey_date, arrowX + 7, journeyY + 55, {
          width: 46,
          align: "center",
        });

      // TO Section
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.light)
        .text("TO", startX + 320, journeyY);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(COLORS.dark)
        .text(destination_station, startX + 320, journeyY + 14, { width: 180 });

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text(arrival_time, startX + 320, journeyY + 55);

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.medium)
        .text("Arrival", startX + 320, journeyY + 75);

      currentY += 145;

      // ══════════════════════════════════════════════════════════════
      // PASSENGER DETAILS TABLE
      // ══════════════════════════════════════════════════════════════

      currentY = drawSectionHeader(
        doc,
        "Passenger Details",
        startX,
        currentY,
        pageWidth
      );

      // Table container with shadow
      const tableHeight = 30 + passengers.length * 28;
      drawRoundedRect(doc, startX, currentY, pageWidth, tableHeight, 8, {
        fill: COLORS.white,
        shadow: true,
      });
      doc
        .roundedRect(startX, currentY, pageWidth, tableHeight, 8)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      // Table Header
      doc
        .rect(startX + 1, currentY + 1, pageWidth - 2, 28)
        .fill(COLORS.primary);

      const headers = [
        { text: "S.No", x: startX + 15, width: 40 },
        { text: "Passenger Name", x: startX + 55, width: 180 },
        { text: "Age", x: startX + 235, width: 50 },
        { text: "Gender", x: startX + 285, width: 60 },
        { text: "Seat/Berth", x: startX + 355, width: 80 },
        { text: "Status", x: startX + 440, width: 70 },
      ];

      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.white);
      headers.forEach((h) => {
        doc.text(h.text, h.x, currentY + 10, { width: h.width });
      });

      // Table Rows
      let rowY = currentY + 32;
      passengers.forEach((passenger, index) => {
        const isEven = index % 2 === 0;

        // Row background
        if (isEven) {
          doc
            .rect(startX + 1, rowY - 2, pageWidth - 2, 26)
            .fill(COLORS.background);
        }

        // Row data
        doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);
        doc.text(String(index + 1).padStart(2, "0"), startX + 15, rowY + 5, {
          width: 40,
        });
        doc
          .font("Helvetica-Bold")
          .text(
            passenger.passenger_name || passenger.name,
            startX + 55,
            rowY + 5,
            { width: 180 }
          );
        doc
          .font("Helvetica")
          .text(
            String(passenger.passenger_age || passenger.age),
            startX + 235,
            rowY + 5,
            { width: 50 }
          );

        const genderText =
          (passenger.passenger_gender || passenger.gender) === "M"
            ? "Male"
            : (passenger.passenger_gender || passenger.gender) === "F"
            ? "Female"
            : "Other";
        doc.text(genderText, startX + 285, rowY + 5, { width: 60 });
        doc.text(
          passenger.seat_number || `${coach_type}-${index + 1}`,
          startX + 355,
          rowY + 5,
          { width: 80 }
        );

        // Status badge in row
        const passengerStatus = passenger.status || "CNF";
        const statusBgColor = passengerStatus === "CNF" ? "#dcfce7" : "#fef3c7";
        const statusTextColor =
          passengerStatus === "CNF" ? COLORS.accent : COLORS.warning;

        doc.roundedRect(startX + 440, rowY + 2, 50, 18, 3).fill(statusBgColor);
        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor(statusTextColor)
          .text(passengerStatus, startX + 445, rowY + 6, {
            width: 40,
            align: "center",
          });

        rowY += 28;
      });

      currentY = rowY + 10;

      // ══════════════════════════════════════════════════════════════
      // FARE DETAILS & QR CODE SECTION
      // ══════════════════════════════════════════════════════════════

      currentY = drawSectionHeader(
        doc,
        "Payment Summary",
        startX,
        currentY,
        pageWidth
      );

      // Two column layout
      // Left: QR Code
      drawRoundedRect(doc, startX, currentY, 150, 140, 8, {
        fill: COLORS.white,
        shadow: true,
      });
      doc
        .roundedRect(startX, currentY, 150, 140, 8)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      // QR Code
      const qrImage = qrCodeDataUrl.split(",")[1];
      const qrBuffer = Buffer.from(qrImage, "base64");
      doc.image(qrBuffer, startX + 25, currentY + 10, {
        width: 100,
        height: 100,
      });

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(COLORS.medium)
        .text("Scan for verification", startX + 25, currentY + 115, {
          width: 100,
          align: "center",
        });

      // Right: Fare breakdown
      const fareBoxX = startX + 165;
      const fareBoxWidth = pageWidth - 165;

      drawRoundedRect(doc, fareBoxX, currentY, fareBoxWidth, 140, 8, {
        fill: COLORS.white,
        shadow: true,
      });
      doc
        .roundedRect(fareBoxX, currentY, fareBoxWidth, 140, 8)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      const baseFare = Math.round(total_fare / 1.18);
      const gst = total_fare - baseFare;

      const fareItems = [
        { label: "Base Fare", value: baseFare },
        { label: "Reservation Charge", value: Math.round(baseFare * 0.02) },
        { label: "Superfast Charge", value: Math.round(baseFare * 0.03) },
        { label: "GST @ 5%", value: gst },
      ];

      let fareY = currentY + 15;
      fareItems.forEach((item) => {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor(COLORS.medium)
          .text(item.label, fareBoxX + 20, fareY);
        doc
          .font("Helvetica-Bold")
          .fillColor(COLORS.dark)
          .text(
            `₹ ${item.value.toLocaleString("en-IN")}`,
            fareBoxX + fareBoxWidth - 100,
            fareY,
            { width: 80, align: "right" }
          );
        fareY += 22;
      });

      // Total divider
      doc
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .moveTo(fareBoxX + 20, fareY)
        .lineTo(fareBoxX + fareBoxWidth - 20, fareY)
        .stroke();

      fareY += 10;

      // Total amount with highlight
      doc
        .rect(fareBoxX + 10, fareY - 2, fareBoxWidth - 20, 30)
        .fill(COLORS.background);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(COLORS.dark)
        .text("Total Amount", fareBoxX + 20, fareY + 5);

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text(
          `₹ ${total_fare.toLocaleString("en-IN")}`,
          fareBoxX + fareBoxWidth - 120,
          fareY + 2,
          { width: 100, align: "right" }
        );

      currentY += 155;

      // ══════════════════════════════════════════════════════════════
      // CONTACT & BOOKING INFO
      // ══════════════════════════════════════════════════════════════

      currentY = drawSectionHeader(
        doc,
        "Contact & Booking Information",
        startX,
        currentY,
        pageWidth
      );

      drawRoundedRect(doc, startX, currentY, pageWidth, 50, 8, {
        fill: COLORS.background,
      });
      doc
        .roundedRect(startX, currentY, pageWidth, 50, 8)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

      // Contact info in grid
      const infoItems = [
        { icon: "📱", label: "Mobile", value: contact_mobile },
        { icon: "📧", label: "Email", value: contact_email },
        {
          icon: "📅",
          label: "Booked On",
          value: booking_date || new Date().toLocaleDateString("en-IN"),
        },
        { icon: "🎫", label: "Transaction ID", value: `TXN${pnr}` },
      ];

      const infoColWidth = pageWidth / 4;
      infoItems.forEach((item, i) => {
        const infoX = startX + i * infoColWidth + 10;
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(COLORS.light)
          .text(item.label, infoX, currentY + 10);
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(COLORS.dark)
          .text(item.value, infoX, currentY + 24, { width: infoColWidth - 20 });
      });

      currentY += 65;

      // ══════════════════════════════════════════════════════════════
      // IMPORTANT INSTRUCTIONS
      // ══════════════════════════════════════════════════════════════

      drawRoundedRect(doc, startX, currentY, pageWidth, 70, 8, {
        fill: "#fef3c7",
      });
      doc
        .roundedRect(startX, currentY, pageWidth, 70, 8)
        .strokeColor("#f59e0b")
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(COLORS.warning)
        .text("⚠️ IMPORTANT INSTRUCTIONS", startX + 15, currentY + 10);

      const instructions = [
        "• Carry a valid government-issued photo ID (Aadhaar, Passport, Driving License, etc.) during the journey.",
        "• This e-ticket is valid only for the person(s) mentioned above. ID proof is mandatory.",
        "• Please arrive at the station at least 30 minutes before departure time.",
        "• This is a DEMO/MOCK ticket generated for testing purposes only - NOT valid for actual travel.",
      ];

      doc.fontSize(8).font("Helvetica").fillColor(COLORS.dark);

      let instrY = currentY + 25;
      instructions.forEach((instr) => {
        doc.text(instr, startX + 15, instrY, { width: pageWidth - 30 });
        instrY += 11;
      });

      // ══════════════════════════════════════════════════════════════
      // FOOTER
      // ══════════════════════════════════════════════════════════════

      const footerY = 780;

      doc.rect(0, footerY, 595, 62).fill(COLORS.primary);

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text(
          "QuickSmart Railways - Mock Train Reservation System",
          startX,
          footerY + 15,
          { width: pageWidth, align: "center" }
        );

      doc
        .fontSize(7)
        .text(
          "This is a demonstration ticket for educational purposes. Not valid for actual railway travel.",
          startX,
          footerY + 28,
          { width: pageWidth, align: "center" }
        );

      doc.text(
        `Generated on: ${new Date().toLocaleString(
          "en-IN"
        )} | Document ID: ${pnr}-${Date.now()}`,
        startX,
        footerY + 42,
        { width: pageWidth, align: "center" }
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
