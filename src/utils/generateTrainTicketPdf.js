const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

/**
 * Generate a professional single-page train ticket PDF
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
      passengers = [],
      total_fare,
      booking_date,
      booking_status,
      contact_mobile,
      contact_email,
    } = bookingData;

    // Create output directory
    const ticketsDir = path.join(
      __dirname,
      "../../src/secure-storage/downloads/projects/mock-train-reservation/tickets"
    );

    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }

    const outputPath = path.join(ticketsDir, `ticket_${pnr}.pdf`);

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(
      JSON.stringify({ pnr, train: train_number, date: journey_date }),
      { errorCorrectionLevel: "M", width: 120, margin: 1 }
    );

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const pageWidth = 515;
      const leftMargin = 40;
      let y = 40;

      // Colors
      const navy = "#1a365d";
      const blue = "#2563eb";
      const green = "#059669";
      const gray = "#6b7280";
      const lightGray = "#f3f4f6";

      // ═══════════════════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════════════════
      doc.rect(0, 0, 595, 70).fill(navy);

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text("QuickSmart Railways", leftMargin, 20);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text("Electronic Reservation Slip (ERS)", leftMargin, 45);

      // E-Ticket badge
      doc.roundedRect(450, 20, 90, 28, 4).fill("#b8860b");
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text("E-TICKET", 465, 30);

      y = 85;

      // ═══════════════════════════════════════════════════════════
      // PNR & STATUS ROW
      // ═══════════════════════════════════════════════════════════
      doc.rect(leftMargin, y, 240, 45).fill(lightGray).stroke("#e5e7eb");
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(gray)
        .text("PNR NUMBER", leftMargin + 15, y + 8);
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text(pnr, leftMargin + 15, y + 22);

      doc
        .rect(leftMargin + 255, y, 260, 45)
        .fill(lightGray)
        .stroke("#e5e7eb");
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(gray)
        .text("BOOKING STATUS", leftMargin + 270, y + 8);

      const statusColor =
        booking_status === "CANCELLED"
          ? "#dc2626"
          : booking_status === "WAITLIST"
          ? "#d97706"
          : green;
      doc.roundedRect(leftMargin + 270, y + 22, 80, 18, 3).fill(statusColor);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(booking_status || "CONFIRMED", leftMargin + 278, y + 26);

      y += 55;

      // ═══════════════════════════════════════════════════════════
      // TRAIN INFO
      // ═══════════════════════════════════════════════════════════
      doc.rect(leftMargin, y, pageWidth, 35).fill(navy);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(`${train_number} - ${train_name}`, leftMargin + 15, y + 10);

      // Class badges
      doc.roundedRect(leftMargin + 380, y + 8, 55, 18, 3).fill(blue);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(coach_type || "SL", leftMargin + 390, y + 12);

      doc
        .roundedRect(leftMargin + 445, y + 8, 55, 18, 3)
        .strokeColor("#ffffff")
        .lineWidth(1)
        .stroke();
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(reservation_type || "GN", leftMargin + 452, y + 12);

      y += 45;

      // ═══════════════════════════════════════════════════════════
      // JOURNEY DETAILS
      // ═══════════════════════════════════════════════════════════
      doc.rect(leftMargin, y, pageWidth, 75).stroke("#e5e7eb");

      // FROM
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(gray)
        .text("FROM", leftMargin + 20, y + 10);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(source_station, leftMargin + 20, y + 24, { width: 180 });
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text(departure_time || "N/A", leftMargin + 20, y + 48);

      // Journey date (center)
      doc.roundedRect(leftMargin + 215, y + 28, 85, 22, 4).fill(lightGray);
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text(journey_date, leftMargin + 222, y + 33, {
          width: 70,
          align: "center",
        });

      // Arrow
      doc
        .strokeColor(blue)
        .lineWidth(2)
        .moveTo(leftMargin + 200, y + 40)
        .lineTo(leftMargin + 210, y + 40)
        .stroke();
      doc
        .strokeColor(blue)
        .lineWidth(2)
        .moveTo(leftMargin + 305, y + 40)
        .lineTo(leftMargin + 315, y + 40)
        .stroke();
      doc
        .moveTo(leftMargin + 310, y + 35)
        .lineTo(leftMargin + 320, y + 40)
        .lineTo(leftMargin + 310, y + 45)
        .fill(blue);

      // TO
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(gray)
        .text("TO", leftMargin + 340, y + 10);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(destination_station, leftMargin + 340, y + 24, { width: 160 });
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text(arrival_time || "N/A", leftMargin + 340, y + 48);

      y += 85;

      // ═══════════════════════════════════════════════════════════
      // PASSENGER TABLE
      // ═══════════════════════════════════════════════════════════
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text("PASSENGER DETAILS", leftMargin, y);
      y += 18;

      // Table header
      doc.rect(leftMargin, y, pageWidth, 22).fill(navy);
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#ffffff");
      doc.text("S.No", leftMargin + 10, y + 7, { width: 35 });
      doc.text("Passenger Name", leftMargin + 50, y + 7, { width: 180 });
      doc.text("Age", leftMargin + 235, y + 7, { width: 40 });
      doc.text("Gender", leftMargin + 280, y + 7, { width: 55 });
      doc.text("Berth/Seat", leftMargin + 345, y + 7, { width: 80 });
      doc.text("Status", leftMargin + 435, y + 7, { width: 60 });
      y += 22;

      // Passenger rows (limit to 6 for single page)
      const maxPassengers = Math.min(passengers.length, 6);
      for (let i = 0; i < maxPassengers; i++) {
        const p = passengers[i];
        const rowBg = i % 2 === 0 ? lightGray : "#ffffff";

        doc.rect(leftMargin, y, pageWidth, 22).fill(rowBg).stroke("#e5e7eb");
        doc.fontSize(9).font("Helvetica").fillColor("#1f2937");
        doc.text(String(i + 1), leftMargin + 15, y + 7, { width: 30 });
        doc
          .font("Helvetica-Bold")
          .text(
            p.passenger_name || p.name || "Passenger",
            leftMargin + 50,
            y + 7,
            { width: 180 }
          );
        doc
          .font("Helvetica")
          .text(
            String(p.passenger_age || p.age || "-"),
            leftMargin + 240,
            y + 7,
            { width: 35 }
          );

        const gender =
          (p.passenger_gender || p.gender) === "M"
            ? "Male"
            : (p.passenger_gender || p.gender) === "F"
            ? "Female"
            : "Other";
        doc.text(gender, leftMargin + 285, y + 7, { width: 50 });
        doc.text(
          p.seat_number || p.updated_seat_status || "---",
          leftMargin + 350,
          y + 7,
          { width: 75 }
        );

        const pStatus = p.status || p.updated_seat_status || "CNF";
        const sColor = pStatus.includes("CNF") ? green : "#d97706";
        doc.roundedRect(leftMargin + 438, y + 4, 45, 14, 2).fill(sColor);
        doc
          .fontSize(7)
          .font("Helvetica-Bold")
          .fillColor("#ffffff")
          .text(pStatus.substring(0, 6), leftMargin + 442, y + 7, {
            width: 38,
            align: "center",
          });

        y += 22;
      }

      y += 10;

      // ═══════════════════════════════════════════════════════════
      // FARE & QR CODE SECTION
      // ═══════════════════════════════════════════════════════════
      // QR Code (left side)
      doc.rect(leftMargin, y, 110, 110).stroke("#e5e7eb");
      const qrImage = qrCodeDataUrl.split(",")[1];
      const qrBuffer = Buffer.from(qrImage, "base64");
      doc.image(qrBuffer, leftMargin + 10, y + 5, { width: 90, height: 90 });
      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor(gray)
        .text("Scan for details", leftMargin + 20, y + 96, {
          width: 70,
          align: "center",
        });

      // Fare details (right side)
      doc
        .rect(leftMargin + 125, y, pageWidth - 125, 110)
        .fill(lightGray)
        .stroke("#e5e7eb");

      const fareX = leftMargin + 140;
      let fareY = y + 12;

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text("FARE SUMMARY", fareX, fareY);
      fareY += 20;

      const baseFare = Math.round((total_fare || 0) / 1.05);
      const gst = (total_fare || 0) - baseFare;

      const fareItems = [
        { label: "Base Fare", value: baseFare },
        { label: "GST (5%)", value: gst },
      ];

      fareItems.forEach((item) => {
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor(gray)
          .text(item.label, fareX, fareY, { width: 150 });
        doc
          .font("Helvetica")
          .fillColor("#1f2937")
          .text(`₹ ${item.value.toLocaleString("en-IN")}`, fareX + 260, fareY, {
            width: 80,
            align: "right",
          });
        fareY += 16;
      });

      // Divider
      doc
        .strokeColor("#d1d5db")
        .lineWidth(1)
        .moveTo(fareX, fareY + 2)
        .lineTo(fareX + 350, fareY + 2)
        .stroke();
      fareY += 10;

      // Total
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(navy)
        .text("Total Amount", fareX, fareY);
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(green)
        .text(
          `₹ ${(total_fare || 0).toLocaleString("en-IN")}`,
          fareX + 240,
          fareY - 2,
          { width: 100, align: "right" }
        );

      y += 120;

      // ═══════════════════════════════════════════════════════════
      // CONTACT INFO
      // ═══════════════════════════════════════════════════════════
      doc.rect(leftMargin, y, pageWidth, 35).fill(lightGray).stroke("#e5e7eb");

      doc.fontSize(8).font("Helvetica").fillColor(gray);
      doc.text("Mobile:", leftMargin + 15, y + 8);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(contact_mobile || "N/A", leftMargin + 15, y + 19);

      doc
        .font("Helvetica")
        .fillColor(gray)
        .text("Email:", leftMargin + 150, y + 8);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(contact_email || "N/A", leftMargin + 150, y + 19, { width: 180 });

      doc
        .font("Helvetica")
        .fillColor(gray)
        .text("Booked On:", leftMargin + 380, y + 8);
      doc
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(
          booking_date || new Date().toLocaleDateString("en-IN"),
          leftMargin + 380,
          y + 19
        );

      y += 45;

      // ═══════════════════════════════════════════════════════════
      // INSTRUCTIONS
      // ═══════════════════════════════════════════════════════════
      doc.rect(leftMargin, y, pageWidth, 55).fill("#fef3c7").stroke("#f59e0b");

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#92400e")
        .text("IMPORTANT INSTRUCTIONS", leftMargin + 15, y + 8);

      doc.fontSize(7).font("Helvetica").fillColor("#78350f");
      const instructions = [
        "• This is the mock ticket information and demo purpose only, do not relate to any real world scenarios!",
        "• Mock email/sms will be sent on the day mock departure, you can mention this in demo.",
      ];
      let instY = y + 22;
      instructions.forEach((instr) => {
        doc.text(instr, leftMargin + 15, instY, { width: pageWidth - 30 });
        instY += 12;
      });

      // ═══════════════════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════════════════
      doc.rect(0, 780, 595, 62).fill(navy);

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(
          "QuickSmart Railways - Mock Train Reservation System",
          leftMargin,
          793,
          { width: pageWidth, align: "center" }
        );

      doc
        .fontSize(7)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text(
          "This is a demonstration ticket for educational purposes only. Not valid for railway travel.",
          leftMargin,
          808,
          { width: pageWidth, align: "center" }
        );

      doc.text(
        `Generated: ${new Date().toLocaleString("en-IN")} | Ref: ${pnr}`,
        leftMargin,
        820,
        { width: pageWidth, align: "center" }
      );

      // Finalize
      doc.end();

      stream.on("finish", () => resolve(outputPath));
      stream.on("error", (err) => reject(err));
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};
