/**
 * scripts/make-dc-document.js — the proposal document for the DC and ADC.
 *
 *   node scripts/make-dc-document.js [outfile.pdf]
 *
 * Generated rather than typed so it stays true: the prices, capacities and
 * slots come out of the live configuration, so the document handed across a
 * desk cannot disagree with the system being demonstrated beside it.
 *
 * Register: a note to a district administration, not a sales brochure. Plain
 * numbering, no colour beyond one rule under each heading, everything on the
 * page defensible. The strongest argument here is arithmetic, not adjectives.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { query, one } = require('../src/gatepass/db');
const settings = require('../src/gatepass/settings');

const OUT = process.argv[2]
  || path.join(process.cwd(), 'Mullayanagiri-entry-ticketing-proposal.pdf');

/* ─────────────────────────────────────────────────────────── page furniture */

const INK = '#111827';
const MUTED = '#4b5563';
const RULE = '#9ca3af';
const ACCENT = '#0f4f48';

const M = 62;                 // margin
const W = 595.28;             // A4 width
const TEXT_W = W - M * 2;

(async () => {
  const cfg = await settings.all();
  const place = await one(`SELECT * FROM places WHERE code = 'MULLAYANAGIRI'`);
  const slots = (await query(
    'SELECT * FROM place_slots WHERE place_id = $1 ORDER BY sort_order', [place.id])).rows;
  const pricing = (await query(
    `SELECT pp.*, vc.label, vc.code FROM place_pricing pp
       JOIN vehicle_categories vc ON vc.id = pp.category_id
      WHERE pp.place_id = $1 AND pp.is_active ORDER BY vc.sort_order`, [place.id])).rows;
  const caps = (await query(
    `SELECT sc.capacity, s.code AS slot_code, vc.label, vc.code
       FROM slot_capacity sc
       JOIN place_slots s ON s.id = sc.slot_id
       JOIN vehicle_categories vc ON vc.id = sc.category_id
      WHERE sc.place_id = $1 ORDER BY s.sort_order, vc.sort_order`, [place.id])).rows;

  const gstPct = Number(cfg.gst_percent_on_platform || 18);
  const feePct = Number(cfg.platform_fee_percent || 10);
  const rs = (p) => (p % 100 === 0 ? String(p / 100) : (p / 100).toFixed(2));
  const inr = (n) => Number(n).toLocaleString('en-IN');

  const PRODUCT = cfg.product_name || 'ServerPe Entry Ticketing';

  /* The commercial figures, from configuration so the document, the invoice and
     the conversation cannot drift apart. */
  const amcPaise = Number(cfg.amc_per_gate_annual_paise || 12000000);
  const amcRs = inr(amcPaise / 100);
  const carEntry = (pricing.find((p) => p.code === 'CAR')?.entry_paise || 10000) / 100;
  const OPERATING_DAYS = 300;
  // How many altered car entries a day the maintenance charge is worth. Rounded
  // up: claiming a fraction of a vehicle would be silly.
  const breakEvenPerDay = Math.ceil((amcPaise / 100) / (carEntry * OPERATING_DAYS));

  /* Daily capacity, computed rather than asserted. */
  const perSlot = {};
  for (const c of caps) perSlot[c.code] = (perSlot[c.code] || 0) + 0;
  const byCategory = {};
  for (const c of caps) {
    byCategory[c.code] = byCategory[c.code] || { label: c.label, per_slot: 0, slots: 0 };
    byCategory[c.code].per_slot = c.capacity;
    byCategory[c.code].slots += 1;
  }
  const dailyVehicles = Object.values(byCategory)
    .reduce((n, c) => n + c.per_slot * c.slots, 0);

  const dailyCollection = pricing.reduce((n, p) => {
    const cat = byCategory[p.code];
    return n + (cat ? p.entry_paise * cat.per_slot * cat.slots : 0);
  }, 0);

  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true,
    info: {
      Title: 'Mullayanagiri vehicle entry ticketing — proposal',
      Author: cfg.merchant_name || 'ServerPe App Solutions',
      Subject: 'Preventing ticket alteration at the Mullayanagiri checkpost',
    } });
  doc.pipe(fs.createWriteStream(OUT));

  let y = 0;

  /* ───────────────────────────────────────────────────────────── cover */

  doc.rect(0, 0, W, 6).fill(ACCENT);

  y = 96;
  doc.fillColor(MUTED).font('Helvetica').fontSize(9)
     .text('SUBMITTED TO THE OFFICE OF THE DEPUTY COMMISSIONER, CHIKKAMAGALURU',
           M, y, { width: TEXT_W, characterSpacing: 0.8 });

  y += 34;
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(23)
     .text('Vehicle entry ticketing for Mullayanagiri', M, y, { width: TEXT_W, lineGap: 3 });

  y = doc.y + 8;
  doc.font('Helvetica').fontSize(13).fillColor(MUTED)
     .text('A proposal to replace the printed entry ticket with a digitally signed '
         + 'QR ticket that the checkpost verifies, rather than reads.',
           M, y, { width: TEXT_W - 40, lineGap: 2 });

  y = doc.y + 40;
  doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.75).strokeColor(RULE).stroke();

  y += 22;
  const meta = [
    ['System', PRODUCT],
    ['Proposed site', `${place.name}, ${place.district}`],
    ['Prepared by', cfg.merchant_name || 'ServerPe App Solutions'],
    ['Date', new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
    ['Term', cfg.contract_term || '1 year, renewable'],
    ['Cost to the department', `Rs. ${amcRs} per gate per year`],
  ];
  for (const [k, v] of meta) {
    doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
       .text(k.toUpperCase(), M, y, { width: 150, characterSpacing: 1 });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(10.5).text(v, M + 155, y - 1, { width: 300 });
    y += 22;
  }

  y += 18;
  doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.75).strokeColor(RULE).stroke();

  /* The summary, on the cover, because it may be the only part that is read. */
  y += 26;
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text('In summary', M, y);
  y = doc.y + 8;

  const summary = [
    'The ticket sold today is a document. At the barrier it is read by a person, not '
    + 'verified by anything. An altered ticket and a genuine one therefore look identical, '
    + 'and the difference is invisible to the staff member holding it.',

    'The proposed ticket carries a QR code that is digitally signed. The vehicle number, '
    + 'date, time slot and vehicle type are inside the signature. Change any one character '
    + 'and the code fails verification at the gate.',

    'Verification needs no network. The checkpost phone can confirm a ticket is genuine '
    + 'with no signal at all, which matters on this road.',

    'Every scan is recorded against the staff member who made it — including every '
    + 'refusal. The department gets a daily record of how many altered or duplicated '
    + 'tickets were stopped.',

    'The department continues to collect the entry fee in full. Day-to-day operation is '
    + 'funded by a separate booking fee paid by the visitor, not by the department. The only '
    + `charge to the department is an annual maintenance fee of Rs. ${amcRs} per gate — `
    + `recovered by stopping roughly ${breakEvenPerDay} altered car entries a day.`,

    'The system is not specific to this site. It is designed for any ticketed entry point, and '
    + 'a second location can be added as configuration rather than as a new deployment.',
  ];
  for (const s of summary) {
    doc.circle(M + 3, y + 5.5, 1.8).fill(ACCENT);
    doc.fillColor(INK).font('Helvetica').fontSize(10)
       .text(s, M + 14, y, { width: TEXT_W - 14, lineGap: 1.5 });
    y = doc.y + 9;
  }

  /* ─────────────────────────────────────────────────────── the sections */

  const H = (n, title) => {
    if (doc.y > 700) doc.addPage();
    const top = doc.y + (doc.y < 100 ? 0 : 24);
    doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(13)
       .text(`${n}.  ${title}`, M, top, { width: TEXT_W });
    const ly = doc.y + 5;
    doc.moveTo(M, ly).lineTo(W - M, ly).lineWidth(1).strokeColor(ACCENT).stroke();
    doc.y = ly + 12;
  };

  const P = (text, opts = {}) => {
    if (doc.y > 740) { doc.addPage(); doc.y = M; }
    doc.fillColor(opts.muted ? MUTED : INK)
       .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
       .fontSize(opts.size || 10)
       .text(text, M, doc.y, { width: TEXT_W, lineGap: 1.8, align: opts.align || 'left' });
    doc.y += opts.gap ?? 10;
  };

  const BULLETS = (items) => {
    for (const it of items) {
      if (doc.y > 730) { doc.addPage(); doc.y = M; }
      const [head, rest] = Array.isArray(it) ? it : [null, it];
      doc.circle(M + 3, doc.y + 5.5, 1.8).fill(ACCENT);
      if (head) {
        doc.fillColor(INK).font('Helvetica-Bold').fontSize(10)
           .text(`${head} `, M + 14, doc.y, { width: TEXT_W - 14, continued: true });
        doc.font('Helvetica').text(rest, { lineGap: 1.5 });
      } else {
        doc.fillColor(INK).font('Helvetica').fontSize(10)
           .text(rest, M + 14, doc.y, { width: TEXT_W - 14, lineGap: 1.5 });
      }
      doc.y += 7;
    }
    doc.y += 4;
  };

  /**
   * A plain table: header rule, hairline row rules, figures to the right.
   *
   * Every cell is drawn at an explicit y rather than letting the cursor advance
   * between them — otherwise a cell that wraps to two lines drags the rest of
   * the row down with it, which is how generated tables end up looking like a
   * staircase. Row height is measured from the tallest cell so wrapping still
   * works.
   */
  const TABLE = (cols, rows) => {
    if (doc.y > 620) { doc.addPage(); doc.y = M; }

    const top = doc.y;
    let x = M;
    doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8.5);
    for (const c of cols) {
      doc.text(c.label.toUpperCase(), x, top,
        { width: c.w, align: c.align || 'left', characterSpacing: 0.6 });
      x += c.w;
    }

    let ry = top + 14;
    doc.moveTo(M, ry).lineTo(W - M, ry).lineWidth(0.75).strokeColor(RULE).stroke();
    let rowTop = ry + 8;

    for (const r of rows) {
      // A row that would fall off the page starts a new one instead of being
      // clipped in half.
      if (rowTop > 760) { doc.addPage(); rowTop = M; }

      x = M;
      let tallest = 0;
      cols.forEach((c, i) => {
        doc.font(c.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(INK);
        const text = String(r[i] ?? '');
        const h = doc.heightOfString(text, { width: c.w, align: c.align || 'left' });
        doc.text(text, x, rowTop, { width: c.w, align: c.align || 'left' });
        tallest = Math.max(tallest, h);
        x += c.w;
      });

      rowTop += Math.max(tallest, 12) + 6;
      doc.moveTo(M, rowTop - 4).lineTo(W - M, rowTop - 4)
         .lineWidth(0.4).strokeColor('#e5e7eb').stroke();
      rowTop += 4;
    }

    doc.y = rowTop + 8;
  };

  doc.addPage();
  doc.y = M;

  /* 1 ─────────────────────────────────────────────────────────────────── */
  H(1, 'What is happening now');

  P('A visitor buys an entry ticket online and prints it, or shows it on a phone. At the '
  + 'checkpost a staff member looks at it, sees a plausible-looking ticket, and raises the '
  + 'barrier.');

  P('The ticket is an ordinary document. It can be opened in any editor and changed — the '
  + 'vehicle number, the date, the ticket number. A single purchased ticket becomes ten '
  + 'tickets, each looking exactly as genuine as the original, because there is nothing on '
  + 'it that the gate can check against anything.');

  P('This is not a failure of the staff at the barrier. They are being asked to detect a '
  + 'forgery by eye, at speed, in a queue. That is not a task a person can do.', { muted: true });

  P('The consequence is a direct loss of entry-fee revenue to the department, and no way to '
  + 'measure how large it is — an altered ticket that is waved through leaves no trace '
  + 'anywhere.');

  /* 2 ─────────────────────────────────────────────────────────────────── */
  H(2, 'What is proposed');

  P('A ticket booked on WhatsApp that carries a digitally signed QR code, and a checkpost '
  + 'application that verifies it rather than reads it.');

  BULLETS([
    ['The ticket cannot be edited.', 'The vehicle number, date, time slot, vehicle type and '
     + 'place are all inside a cryptographic signature. Altering any character invalidates it.'],
    ['The ticket cannot be shared.', 'The vehicle number is inside the signed code. A ticket '
     + 'presented by a different vehicle is refused, without the staff member having to '
     + 'compare anything by eye.'],
    ['A ticket can be used once.', 'The first scan consumes it. A second presentation of the '
     + 'same code — a screenshot passed to a friend — is reported as already used.'],
    ['No network is needed to catch a forgery.', 'The signature check happens on the phone '
     + 'itself. Only the "already used" check needs a connection, and scans taken offline are '
     + 'reconciled automatically when signal returns.'],
  ]);

  /* 3 ─────────────────────────────────────────────────────────────────── */
  H(3, 'How the verification works, in plain terms');

  P('The system holds a private key, kept on the server. When a ticket is paid for, the '
  + 'server writes the ticket\'s details into the QR code and signs them with that key.');

  P('Each checkpost phone holds only the matching public key. A public key can check whether '
  + 'a signature is genuine, but cannot create one. This distinction is the heart of the '
  + 'design: even if a checkpost phone were lost or its contents extracted, it could not be '
  + 'used to manufacture a single valid ticket.');

  P('The alternative — a shared password on every phone — was rejected for exactly this '
  + 'reason. A shared secret in a device at a hill station is a shared secret that eventually '
  + 'leaves it.', { muted: true });

  P('At the gate the phone reports one of eight outcomes, each with a different instruction '
  + 'to the staff member:');

  TABLE(
    [{ label: 'What the phone shows', w: 150 },
     { label: 'What it means', w: TEXT_W - 150 }],
    [
      ['ALLOW', 'Genuine ticket, right vehicle, right day. Raise the barrier.'],
      ['ALREADY USED', 'This exact code has already come through. A copy is being presented.'],
      ['FAKE TICKET', 'The signature does not verify. The ticket has been altered or invented.'],
      ['WRONG DAY', 'Genuine ticket, but issued for another date.'],
      ['WRONG TIME', 'Genuine ticket for later today. A late arrival is allowed; an early one is not.'],
      ['WRONG GATE', 'Genuine ticket for a different checkpost.'],
      ['NOT FOUND', 'Signature valid but no such ticket on record. Refer to the office.'],
      ['CANCELLED', 'The ticket was refunded or cancelled.'],
    ]);

  P('The distinction matters at the barrier. A visitor with a Tuesday ticket needs to be told '
  + 'a different thing from someone presenting a forgery, and a single word — "invalid" — '
  + 'would leave the staff member to guess which they were looking at.');

  /* 4 ─────────────────────────────────────────────────────────────────── */
  H(4, 'What the visitor does');

  BULLETS([
    'Sends a message on WhatsApp to the published number. No application to install, no '
    + 'account to create, no password.',
    'Types the vehicle registration number. The system reads the vehicle type from the '
    + 'government registration record, so the correct fee is charged without the visitor '
    + 'being asked to classify their own vehicle.',
    'Chooses a date and a time slot, and sees how many places are left in each.',
    'Pays. The QR ticket and a printable receipt arrive in the same chat within seconds.',
    'At the gate, shows the QR code. Nothing else.',
  ]);

  P('The same WhatsApp menu also lets a visitor download the ticket again, move it to another '
  + 'day, raise a support request or leave feedback — so an ordinary change of plan does not '
  + 'become a phone call to the department.');

  /* 5 ─────────────────────────────────────────────────────────────────── */
  H(5, 'What the checkpost staff do');

  BULLETS([
    ['Sign in with their own PIN', 'at the start of a shift. Every scan afterwards is '
     + 'recorded against that person by name.'],
    ['Scan.', 'The phone shows a large, single-word verdict, readable at arm\'s length in '
     + 'sunlight.'],
    ['One phone per gate.', 'A second phone at the same checkpost cannot scan until it '
     + 'deliberately takes over, and the handover is recorded. This prevents two people each '
     + 'assuming the other is checking.'],
    ['One gate per person.', 'Signing in at one checkpost ends that person\'s session '
     + 'anywhere else, so a PIN cannot be lent out and used in two places at once.'],
  ]);

  P('A device is registered to a checkpost once, by the administrator. A PIN on an '
  + 'unregistered phone does nothing, and a registered phone without a PIN does nothing '
  + 'either.');

  /* 6 ─────────────────────────────────────────────────────────────────── */
  doc.addPage(); doc.y = M;
  H(6, 'Capacity and crowding');

  P(`The day is divided into ${slots.length} slots, and each vehicle type has its own limit in `
  + 'each slot. A vehicle may enter once per day — the same vehicle cannot book the second '
  + 'slot as well.');

  TABLE(
    [{ label: 'Vehicle type', w: 170 },
     { label: 'Per slot', w: 90, align: 'right' },
     { label: 'Slots', w: 70, align: 'right' },
     { label: 'Per day', w: TEXT_W - 330, align: 'right' }],
    Object.values(byCategory).map((c) => [
      c.label, String(c.per_slot), String(c.slots), String(c.per_slot * c.slots),
    ]).concat([['Total vehicles per day', '', '', String(dailyVehicles)]]));

  P('These figures are configuration, not code. The department can change a limit, close a '
  + 'single slot or close an entire day from the administration panel, and the change takes '
  + 'effect immediately.');

  P('Because a place is held the moment a visitor begins paying and released if they do not '
  + 'finish, the published number of remaining places is accurate rather than optimistic. Two '
  + 'people cannot be sold the same last place.', { muted: true });

  /* 7 ─────────────────────────────────────────────────────────────────── */
  H(7, 'How the money is split');

  P('The visitor pays two separate amounts. They are shown separately at every stage — on the '
  + 'payment page, on the receipt, and in every report the department can download.');

  TABLE(
    [{ label: 'Vehicle type', w: 160 },
     { label: 'Entry fee', w: 95, align: 'right' },
     { label: 'Booking fee', w: 95, align: 'right' },
     { label: 'Visitor pays', w: TEXT_W - 350, align: 'right', bold: true }],
    pricing.map((p) => [
      p.label, `Rs. ${rs(p.entry_paise)}`, `Rs. ${rs(p.platform_paise)}`,
      `Rs. ${rs(p.entry_paise + p.platform_paise)}`,
    ]));

  BULLETS([
    ['The entry fee is the department\'s in full.', 'Every rupee of it. It is collected on the '
     + 'department\'s behalf and is excluded from ServerPe\'s taxable value as a pure agent '
     + 'under Rule 33 of the CGST Rules, 2017 — the department\'s collection is not our income '
     + 'and is not taxed as such.'],
    ['The booking fee is ours.', `Set at ${feePct}% of the entry fee and paid by the visitor, `
     + `not by the department. GST at ${gstPct}% applies to this fee alone and is discharged by `
     + 'ServerPe.'],
    ['Refunds return the whole amount.', 'A visitor refunded after a closure receives the entry '
     + 'fee and the booking fee back in full. ServerPe absorbs the payment gateway charge on '
     + 'that refund.'],
  ]);

  P(`At full capacity the entry fee collected for the department is approximately `
  + `Rs. ${Number(rs(dailyCollection)).toLocaleString('en-IN')} per day — `
  + `every rupee recorded against a specific vehicle, date and slot, and reconcilable to the `
  + `last ticket.`, { bold: true });

  /* 8 ─────────────────────────────────────────────────────────────────── */
  H(8, 'Commercial terms');

  P('Operations are funded by the visitor\'s booking fee. The department is asked for one '
  + 'thing only: an annual maintenance charge covering support, updates and hosting.');

  TABLE(
    [{ label: 'Item', w: 210 },
     { label: 'Charge', w: 150, align: 'right' },
     { label: 'Payable by', w: TEXT_W - 360, align: 'right' }],
    [
      ['Set-up and installation', 'Nil', '-'],
      ['Software licence', 'Nil', '-'],
      ['Per-ticket booking fee', `${feePct}% of entry fee`, 'Visitor'],
      ['Annual maintenance (per gate)', `Rs. ${amcRs}`, 'Department'],
      ['Payment gateway charges', 'Absorbed by ServerPe', '-'],
      ['WhatsApp and messaging', 'Absorbed by ServerPe', '-'],
    ]);

  P('The annual maintenance charge covers:', { gap: 6 });
  BULLETS(String(cfg.amc_covers || '').split(';').map((s) => s.trim()).filter(Boolean));

  P('It does not cover:', { gap: 6 });
  BULLETS(String(cfg.amc_excludes || '').split(';').map((s) => s.trim()).filter(Boolean));

  TABLE(
    [{ label: 'Term', w: 210 },
     { label: '', w: TEXT_W - 210 }],
    [
      ['Contract period', cfg.contract_term || '1 year, renewable'],
      ['Support response', cfg.sla_response || 'Within 2 hours during gate hours'],
      ['Settlement of entry fee', cfg.settlement_terms || 'Weekly'],
      ['Data ownership', 'All booking and collection data belongs to the department and is '
       + 'exportable at any time'],
      ['On termination', 'Full data export provided; no exit charge'],
    ]);

  /* 9 ─────────────────────────────────────────────────────────────────── */
  H(9, 'What the charge is set against');

  P('The maintenance charge is small enough to be recovered by a very small reduction in '
  + 'leakage. The arithmetic below is illustrative, not a claim about the present scale of the '
  + 'problem — nobody can measure that today, which is itself part of the case for this '
  + 'system.');

  TABLE(
    [{ label: 'If the gate stops, per day', w: 210 },
     { label: 'Entry fee recovered per year', w: TEXT_W - 210, align: 'right' }],
    [
      ['2 altered car tickets', `Rs. ${(2 * carEntry * 300).toLocaleString('en-IN')}`],
      ['4 altered car tickets', `Rs. ${(4 * carEntry * 300).toLocaleString('en-IN')}`],
      ['10 altered car tickets', `Rs. ${(10 * carEntry * 300).toLocaleString('en-IN')}`],
      ['25 altered car tickets', `Rs. ${(25 * carEntry * 300).toLocaleString('en-IN')}`],
    ]);

  P(`Assuming 300 operating days. The annual maintenance charge of Rs. ${amcRs} per gate is `
  + `covered by stopping approximately ${breakEvenPerDay} altered car entries per day.`,
    { bold: true });

  P('Beyond the recovery, the department gains something it does not have at all today: a '
  + 'daily, auditable count of how many attempts were refused and why.', { muted: true });

  /* 8 ─────────────────────────────────────────────────────────────────── */
  H(10, 'When a site must close');

  P('Heavy rain, a landslide, a VIP visit or a maintenance day are handled as one procedure. '
  + 'An officer selects the date and, if required, a single slot, and writes the reason in '
  + 'plain words.');

  P('Before anything happens the panel states exactly what will follow — how many tickets are '
  + 'affected, their total value, and how many visitors will be contacted. Only then is the '
  + 'closure confirmed.');

  BULLETS([
    ['Every affected visitor is told.', 'Nobody is left to discover a closed barrier after a '
     + 'three-hour drive.'],
    ['They are offered another date first.', 'Moving a ticket costs nothing and keeps the '
     + 'department\'s collection in place. The ticket keeps its number and is re-issued with a '
     + 'new signed code; the old code stops working by itself.'],
    ['A full refund is available on request.', 'A visitor who cannot come another day receives '
     + `the entire amount back within ${cfg.refund_working_days || '5-7'} working days.`],
  ]);

  /* 9 ─────────────────────────────────────────────────────────────────── */
  doc.addPage(); doc.y = M;
  H(11, 'What the department can see');

  P('A web-based administration panel, accessible to officers on any browser, with accounts '
  + 'that can view everything but change nothing where that is appropriate.');

  BULLETS([
    ['Daily position', 'vehicles entered, amount collected, how full each slot is, and how '
     + 'many attempts the gate refused.'],
    ['The gate log', 'every scan with the staff member, checkpost and time — and a filter '
     + 'showing only the refusals, which is the measure of what the system is preventing.'],
    ['Revenue and GST', 'the department\'s entry fee and the booking fee kept separate, day '
     + 'by day, with downloadable reports in a spreadsheet format.'],
    ['Audit trail', 'every action taken by every officer in the panel, with time and account.'],
  ]);

  P('Daily, weekly and monthly reports can be downloaded at any time. The department does not '
  + 'depend on ServerPe to produce a figure.');

  /* 10 ────────────────────────────────────────────────────────────────── */
  H(12, 'Data protection');

  P('The system holds the least it can:');

  TABLE(
    [{ label: 'Stored', w: 240 }, { label: 'Never stored', w: TEXT_W - 240 }],
    [
      ['Mobile number', 'Owner name'],
      ['Vehicle registration number', 'Owner address'],
      ['Vehicle type, make and model', 'Chassis number'],
      ['Ticket, payment and scan records', 'Engine number'],
    ]);

  P('The vehicle type is read from the government registration record only to charge the '
  + 'correct fee. The visitor is told this and agrees to it before any lookup is made, and '
  + 'the consent is recorded with a timestamp.');

  P('The system never sends an unsolicited message. A visitor hears from it only after they '
  + 'have written to it, or when their own booking is affected.');

  /* 11 ────────────────────────────────────────────────────────────────── */
  H(13, 'What is required from the department');

  BULLETS([
    'Approval to operate at the Mullayanagiri checkpost, and confirmation of the entry fee '
    + 'for each vehicle type.',
    'Two smartphones at the gate — an ordinary Android phone is sufficient. No specialised '
    + 'scanner hardware is needed.',
    'The names of the checkpost staff who should be issued PINs, and of the officers who '
    + 'should have panel access.',
    'A decision on how the entry fee collected is to be settled to the department, and how '
    + 'often.',
  ]);

  P('Nothing else. There is no software to install, no server for the department to run and '
  + 'no recurring cost.');

  /* 12 ────────────────────────────────────────────────────────────────── */
  H(14, 'Present status');

  P('The system described here is built and working. A live demonstration can be given on '
  + 'request, covering:');

  BULLETS([
    'A visitor booking a ticket on WhatsApp and paying, end to end.',
    'A deliberate attempt to alter that ticket, and the gate refusing it.',
    'The same ticket presented twice, and the second attempt being caught.',
    'A checkpost phone verifying a ticket with its network connection switched off.',
    'The administration panel showing all of the above as it happens.',
  ]);

  /* 15 ────────────────────────────────────────────────────────────────── */
  H(15, 'Beyond this site');

  P(`${PRODUCT} is not built for one hill. Places, time slots, vehicle types, prices and `
  + 'capacities are all configuration rather than software, so a second entry point — another '
  + 'peak, a waterfall, a heritage site, a park — is added by an administrator in an afternoon '
  + 'and shares the same checkpost application, the same reports and the same signing '
  + 'infrastructure.');

  P('Each site keeps its own prices, its own capacity, its own staff and its own accounts. '
  + 'What they share is the part that must never differ: how a ticket is signed and how it is '
  + 'verified at a gate.');

  /* ─────────────────────────────────────────────────────── acceptance */

  if (doc.y > 560) { doc.addPage(); doc.y = M; }
  doc.y += 26;

  doc.moveTo(M, doc.y).lineTo(W - M, doc.y).lineWidth(1).strokeColor(ACCENT).stroke();
  doc.y += 16;

  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11)
     .text('Acceptance', M, doc.y);
  doc.y += 6;
  doc.fillColor(MUTED).font('Helvetica').fontSize(9.5)
     .text('Signed below, this proposal may be treated as the basis of the engagement for the '
         + `term stated (${cfg.contract_term || '1 year, renewable'}).`,
           M, doc.y, { width: TEXT_W, lineGap: 1.5 });

  const sigTop = doc.y + 26;
  const colW = (TEXT_W - 40) / 2;
  const sigBlock = (x, who, org) => {
    doc.moveTo(x, sigTop + 46).lineTo(x + colW, sigTop + 46)
       .lineWidth(0.75).strokeColor(RULE).stroke();
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(9.5)
       .text(who, x, sigTop + 52, { width: colW });
    doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
       .text(org, x, sigTop + 65, { width: colW });
    doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
       .text('Name, designation and date', x, sigTop + 82, { width: colW });
  };
  sigBlock(M, 'For the Department', 'Karnataka Tourism Department, Chikkamagaluru');
  sigBlock(M + colW + 40, `For ${cfg.merchant_name || 'ServerPe App Solutions'}`,
    `${PRODUCT}${cfg.support_mobile ? '  ·  ' + cfg.support_mobile : ''}`);

  /* ─────────────────────────────────────────────────────── page furniture */

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    if (i > range.start) {
      doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
         .text('Mullayanagiri vehicle entry ticketing — proposal', M, 34,
               { width: TEXT_W / 2 });
      doc.text(`Page ${i - range.start + 1} of ${range.count}`, W / 2, 34,
               { width: TEXT_W / 2, align: 'right' });
      doc.moveTo(M, 48).lineTo(W - M, 48).lineWidth(0.4).strokeColor('#e5e7eb').stroke();
    }
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
       .text(`${cfg.merchant_name || 'ServerPe App Solutions'}   ·   `
           + `${cfg.support_mobile ? 'Contact ' + cfg.support_mobile : ''}`,
             M, 792, { width: TEXT_W });
  }

  doc.end();
  console.log(`\n  Written: ${OUT}\n`);
  setTimeout(() => process.exit(0), 700);
})().catch((e) => { console.error('\n', e, '\n'); process.exit(1); });
