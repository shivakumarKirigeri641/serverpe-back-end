/**
 * scripts/make-deck.js — the presentation for the DC and ADC meeting.
 *
 *   node scripts/make-deck.js [outfile.pptx]
 *
 * KANNADA LEADS. This is a Karnataka Tourism proposal shown to officers of the
 * state government, and every headline carries the Kannada first with the
 * English beneath it. Not a translated deck — a Kannada deck that an
 * English-reading visitor can also follow.
 *
 * THE ORDER IS DELIBERATE. A district office's first question about an
 * unfamiliar vendor is not "how does the QR work"; it is "who are you, are you
 * registered, and what have you delivered before". So the deck answers that
 * first, with a live product and registration numbers, and only then explains
 * the problem it is here to solve.
 *
 * Everything factual — prices, capacities, GST number, taglines — is read from
 * the database, so the slide on screen cannot contradict the system being
 * demonstrated beside it.
 *
 * A NOTE ON FONTS: PowerPoint renders Kannada with Nirmala UI, which ships with
 * Windows. The deck names it explicitly rather than relying on a fallback,
 * because a fallback that fails shows empty boxes in front of a Deputy
 * Commissioner.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { query, one } = require('../src/gatepass/db');
const settings = require('../src/gatepass/settings');

const OUT = process.argv[2] || path.join(process.cwd(), 'docs', 'Entry-ticketing-deck.pptx');
const LOGOS = path.join(__dirname, '..', 'assets', 'logos');

const C = {
  ink: '111C1A',
  forest: '0F4F48',
  light: '19A396',
  pale: 'D8E2DF',
  paper: 'F7F8F6',
  white: 'FFFFFF',
  muted: '6B7975',
  alarm: 'B91C1C',
  good: '15803D',
  gold: 'C08A2E',
};

const KN_FONT = 'Nirmala UI';
const EN_FONT = 'Calibri';
const EN_LIGHT = 'Calibri Light';

(async () => {
  const cfg = await settings.all();
  const place = await one(`SELECT * FROM places WHERE code = 'MULLAYANAGIRI'`);
  const pricing = (await query(
    `SELECT pp.*, vc.label, vc.code FROM place_pricing pp
       JOIN vehicle_categories vc ON vc.id = pp.category_id
      WHERE pp.place_id = $1 AND pp.is_active ORDER BY vc.sort_order`, [place.id])).rows;
  const caps = (await query(
    `SELECT sc.capacity, vc.label, vc.code
       FROM slot_capacity sc
       JOIN vehicle_categories vc ON vc.id = sc.category_id
       JOIN place_slots s ON s.id = sc.slot_id
      WHERE sc.place_id = $1 ORDER BY vc.sort_order, s.sort_order`, [place.id])).rows;

  const byCat = {};
  for (const c of caps) {
    byCat[c.code] = byCat[c.code] || { label: c.label, per_slot: c.capacity, slots: 0 };
    byCat[c.code].slots += 1;
  }
  const perDay = Object.values(byCat).reduce((n, c) => n + c.per_slot * c.slots, 0);
  const dailyEntry = pricing.reduce((n, p) => {
    const c = byCat[p.code];
    return n + (c ? (p.entry_paise / 100) * c.per_slot * c.slots : 0);
  }, 0);

  const rs = (p) => (p % 100 === 0 ? String(p / 100) : (p / 100).toFixed(2));
  const inr = (n) => Number(n).toLocaleString('en-IN');
  const feePct = Number(cfg.platform_fee_percent || 10);
  const amcRs = inr(Number(cfg.amc_per_gate_annual_paise || 12000000) / 100);
  const carEntry = (pricing.find((p) => p.code === 'CAR')?.entry_paise || 10000) / 100;
  const breakEven = Math.ceil((Number(cfg.amc_per_gate_annual_paise || 12000000) / 100)
    / (carEntry * 300));

  /** A value that has not been filled in yet, marked so it cannot be missed. */
  const val = (key, fallback = '[ to be filled ]') => (cfg[key] && String(cfg[key]).trim())
    ? cfg[key] : fallback;

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = cfg.legal_name || 'ServerPe App Solutions';
  pptx.company = cfg.legal_name || 'ServerPe App Solutions';
  pptx.title = 'ವಾಹನ ಪ್ರವೇಶ ಟಿಕೆಟ್ ವ್ಯವಸ್ಥೆ — Vehicle entry ticketing';

  const deptLogo = path.join(LOGOS, 'karnataka-tourism-768.png');
  const ourLogo = path.join(LOGOS, 'serverpe-256.png');
  const has = (f) => fs.existsSync(f);

  /* ─────────────────────────────────────────────────────────── helpers */

  /**
   * A content slide.
   *
   * The Kannada headline is the headline; the English sits under it in a
   * lighter weight. Both are always present — an officer may read either, and a
   * visitor from outside the state should not be excluded from a slide about
   * public infrastructure.
   */
  const slide = (eyebrowKn, eyebrowEn, headKn, headEn, { dark = false } = {}) => {
    const s = pptx.addSlide();
    s.background = { color: dark ? C.ink : C.paper };

    if (eyebrowKn || eyebrowEn) {
      s.addText([
        { text: eyebrowKn || '', options: { fontFace: KN_FONT } },
        { text: eyebrowKn && eyebrowEn ? '   ·   ' : '', options: {} },
        { text: (eyebrowEn || '').toUpperCase(), options: { charSpacing: 1.5 } },
      ], {
        x: 0.55, y: 0.36, w: 9, h: 0.28,
        fontFace: EN_FONT, fontSize: 11, bold: true,
        color: dark ? C.light : C.forest,
      });
    }

    if (headKn) {
      s.addText(headKn, {
        x: 0.55, y: 0.66, w: 9, h: 0.62,
        fontFace: KN_FONT, fontSize: 27, bold: true,
        color: dark ? C.white : C.ink,
      });
    }
    if (headEn) {
      s.addText(headEn, {
        x: 0.55, y: headKn ? 1.24 : 0.72, w: 9, h: 0.5,
        fontFace: EN_LIGHT, fontSize: headKn ? 17 : 28, bold: !headKn,
        color: dark ? C.pale : C.muted,
      });
    }

    s.addShape(pptx.ShapeType.rect, {
      x: 0.55, y: headKn ? 1.78 : 1.34, w: 1.0, h: 0.045,
      fill: { color: dark ? C.light : C.forest },
    });

    s.addText(`${cfg.legal_name || 'ServerPe App Solutions'}`, {
      x: 0.55, y: 5.16, w: 6, h: 0.24,
      fontFace: EN_FONT, fontSize: 8.5, color: dark ? '4A5854' : C.muted,
    });
    return s;
  };

  /** Bilingual bullet list: Kannada line, English line beneath, per point. */
  const bullets = (s, items, { y = 2.1, size = 14, dark = false } = {}) => {
    const runs = [];
    for (const it of items) {
      const [k, e] = Array.isArray(it) ? it : [null, it];
      if (k) {
        runs.push({ text: k, options: {
          fontFace: KN_FONT, fontSize: size, bold: true,
          color: dark ? C.white : C.ink,
          bullet: { code: '25AA' }, breakLine: true } });
        runs.push({ text: e, options: {
          fontFace: EN_FONT, fontSize: size - 2.5,
          color: dark ? C.pale : C.muted,
          indentLevel: 1, breakLine: true, paraSpaceAfter: 10 } });
      } else {
        runs.push({ text: e, options: {
          fontFace: EN_FONT, fontSize: size,
          color: dark ? C.pale : C.ink,
          bullet: { code: '25AA' }, breakLine: true, paraSpaceAfter: 8 } });
      }
    }
    s.addText(runs, { x: 0.7, y, w: 8.7, h: 2.9, lineSpacingMultiple: 1.2 });
  };

  const cards = (s, items, { y = 2.2, h = 2.0 } = {}) => {
    const gap = 0.22;
    const w = (8.9 - gap * (items.length - 1)) / items.length;
    items.forEach((it, i) => {
      const x = 0.55 + i * (w + gap);
      s.addShape(pptx.ShapeType.roundRect, {
        x, y, w, h, rectRadius: 0.06,
        fill: { color: C.white }, line: { color: 'C2CCC8', width: 0.5 },
      });
      let top = y + 0.18;
      if (it.big) {
        s.addText(it.big, { x: x + 0.2, y: top, w: w - 0.4, h: 0.6,
          fontFace: EN_FONT, fontSize: 26, bold: true, color: it.color || C.forest });
        top += 0.64;
      }
      if (it.kn) {
        s.addText(it.kn, { x: x + 0.2, y: top, w: w - 0.4, h: 0.34,
          fontFace: KN_FONT, fontSize: 13, bold: true, color: C.ink });
        top += 0.32;
      }
      s.addText(it.title, { x: x + 0.2, y: top, w: w - 0.4, h: 0.3,
        fontFace: EN_FONT, fontSize: 11.5, bold: !it.kn, color: it.kn ? C.muted : C.ink });
      s.addText(it.body, { x: x + 0.2, y: top + 0.3, w: w - 0.4, h: h - (top - y) - 0.4,
        fontFace: EN_FONT, fontSize: 10.5, color: C.muted, lineSpacingMultiple: 1.1 });
    });
  };

  const table = (s, head, rows, { y = 2.2, colW, headKn = [] } = {}) =>
    s.addTable([
      head.map((h, i) => ({
        text: (headKn[i] ? `${headKn[i]}\n` : '') + h.toUpperCase(),
        options: { bold: true, color: C.white, fill: { color: C.forest },
                   fontSize: 10, fontFace: headKn[i] ? KN_FONT : EN_FONT },
      })),
      ...rows.map((r) => r.map((cell, i) => ({
        text: String(cell),
        options: { fontSize: 12, color: C.ink, fontFace: EN_FONT,
                   align: i === 0 ? 'left' : 'right' },
      }))),
    ], {
      x: 0.55, y, w: 8.9, colW,
      border: { type: 'solid', color: 'C2CCC8', pt: 0.5 },
      fill: { color: C.white }, rowH: 0.34, valign: 'middle', margin: 0.08,
    });

  /* ══════════════════════════════════════════════════ 1 · title ══════════ */

  {
    const s = pptx.addSlide();
    s.background = { color: C.ink };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.13, h: 5.63, fill: { color: C.light } });

    if (has(deptLogo)) s.addImage({ path: deptLogo, x: 0.75, y: 0.55, w: 2.6, h: 1.18 });

    s.addText('ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮ ಇಲಾಖೆ  ·  ಚಿಕ್ಕಮಗಳೂರು', {
      x: 0.75, y: 1.95, w: 8.4, h: 0.3,
      fontFace: KN_FONT, fontSize: 13, bold: true, color: C.light,
    });
    s.addText('ವಾಹನ ಪ್ರವೇಶ ಟಿಕೆಟ್ ವ್ಯವಸ್ಥೆ', {
      x: 0.75, y: 2.3, w: 8.4, h: 0.7,
      fontFace: KN_FONT, fontSize: 34, bold: true, color: C.white,
    });
    s.addText(`Vehicle entry ticketing  ·  ${place.name}`, {
      x: 0.75, y: 3.02, w: 8.4, h: 0.4,
      fontFace: EN_LIGHT, fontSize: 19, color: C.pale,
    });
    s.addText('ತಿದ್ದಲಾಗದ, ನಕಲಿಸಲಾಗದ ಡಿಜಿಟಲ್ ಸಹಿಯ ಟಿಕೆಟ್\n'
            + 'A ticket the checkpost verifies, instead of one it merely reads.', {
      x: 0.75, y: 3.55, w: 7.6, h: 0.8,
      fontFace: KN_FONT, fontSize: 13, color: '9EB2AE', lineSpacingMultiple: 1.3,
    });

    if (has(ourLogo)) s.addImage({ path: ourLogo, x: 0.75, y: 4.62, w: 0.42, h: 0.42 });
    s.addText(`${cfg.legal_name || 'ServerPe App Solutions'}   ·   `
            + `${cfg.vendor_tagline || 'Smart Clicks, Smart Taps.'}   ·   `
            + new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), {
      x: 1.28, y: 4.7, w: 8, h: 0.3, fontFace: EN_FONT, fontSize: 10.5, color: C.muted,
    });
  }

  /* ══════════════════════════════════ 2 · who is proposing this ══════════ */

  {
    const s = slide('ನಮ್ಮ ಬಗ್ಗೆ', 'About us', 'ಸರ್ವರ್‌ಪೇ ಆ್ಯಪ್ ಸೊಲ್ಯೂಷನ್ಸ್',
      `${cfg.legal_name || 'ServerPe App Solutions'} — a registered proprietorship building WhatsApp-first public software.`);

    cards(s, [
      { kn: 'ಏಕ ವ್ಯಕ್ತಿ ಸಂಸ್ಥೆ', title: cfg.legal_form || 'Sole Proprietorship',
        body: `${val('proprietor_name')}, personally answerable. No layers, no account manager — `
            + 'the person who builds it is the person you call.' },
      { kn: 'ನೋಂದಣಿ', title: 'Registered',
        body: `GST ${val('gstin')}\nUdyam (MSME) ${val('udyam_number')}` },
      { kn: 'ನೇರ ಸಂಪರ್ಕ', title: 'Direct contact',
        body: `${cfg.support_mobile || ''}\n${cfg.contact_email || ''}\n${cfg.website || ''}` },
    ], { y: 2.15, h: 2.1 });

    s.addText('ಇಲಾಖೆಗೆ ಒಬ್ಬರೇ ಜವಾಬ್ದಾರರು — ನೇರ, ಸರಳ, ಪಾರದರ್ಶಕ.', {
      x: 0.55, y: 4.42, w: 8.9, h: 0.3,
      fontFace: KN_FONT, fontSize: 12, bold: true, color: C.forest,
    });
    s.addText('One accountable person for the department to deal with, not a chain of offices.', {
      x: 0.55, y: 4.68, w: 8.9, h: 0.3, fontFace: EN_FONT, fontSize: 11, color: C.muted,
    });
  }

  /* ══════════════════════════ 3 · why a proprietorship, deliberately ═════ */

  {
    const s = slide('ಸಂಸ್ಥೆಯ ರಚನೆ', 'How we are set up',
      'ಏಕ ವ್ಯಕ್ತಿ ಸಂಸ್ಥೆ — ಉದ್ದೇಶಪೂರ್ವಕ ಆಯ್ಕೆ',
      'A proprietorship by choice, not by default.');

    bullets(s, [
      ['ಒಬ್ಬರೇ ಜವಾಬ್ದಾರರು.',
       'One named person carries the responsibility. A department raising an issue reaches the '
       + 'proprietor directly, not a support queue.'],
      ['ವೇಗದ ನಿರ್ಧಾರ.',
       'A change the department asks for on Monday can be live on Tuesday — no board, no '
       + 'internal approvals, no release committee.'],
      ['ಕಡಿಮೆ ವೆಚ್ಚ, ಕಡಿಮೆ ಶುಲ್ಕ.',
       'No offices to fund and no staff overhead, which is precisely why the department can be '
       + 'charged so little for this.'],
      ['ಪೂರ್ಣ ನೋಂದಾಯಿತ.',
       'GST-registered, Udyam-registered, filing regularly, and able to invoice the department '
       + 'in the ordinary way.'],
    ], { y: 2.05, size: 13.5 });
  }

  /* ══════════════════════════════ 4 · QuizPe, the delivery record ════════ */

  {
    const s = slide('ನಮ್ಮ ಮೊದಲ ಉತ್ಪನ್ನ', 'Our first product',
      `${cfg.first_product_name || 'QuizPe'} — ಭಾರತದಾದ್ಯಂತ ಬಳಕೆಯಲ್ಲಿದೆ`,
      `${cfg.first_product_name || 'QuizPe'} — live, in use across India today.`,
      { dark: true });

    s.addText(cfg.first_product_line
      || 'A daily learning quiz for school children, delivered entirely on WhatsApp.', {
      x: 0.55, y: 2.05, w: 6.2, h: 0.6,
      fontFace: EN_LIGHT, fontSize: 16, color: C.white, lineSpacingMultiple: 1.2,
    });

    bullets(s, [
      ['ವಾಟ್ಸ್ಆ್ಯಪ್‌ನಲ್ಲೇ — ಯಾವುದೇ ಆ್ಯಪ್ ಬೇಡ.',
       'Parents and children use it entirely inside WhatsApp. Nothing to install, no account to create.'],
      ['ಪಾವತಿ, ಬಿಲ್, ವರದಿ — ಎಲ್ಲವೂ ಸ್ವಯಂಚಾಲಿತ.',
       'Payments, GST invoices and progress reports are already running in production, at scale, '
       + 'with real money moving through them every day.'],
      ['ಅದೇ ತಂತ್ರಜ್ಞಾನ ಈ ವ್ಯವಸ್ಥೆಗೂ.',
       'The entry-ticketing system proposed here is built on the same proven foundations — this '
       + 'is not a first attempt.'],
    ], { y: 2.75, size: 13, dark: true });
  }

  /* ═════════════════════════════ 5 · this, the second product ════════════ */

  {
    const s = slide('ನಮ್ಮ ಎರಡನೇ ಉತ್ಪನ್ನ', 'Our second product',
      'ಪ್ರವಾಸಿ ತಾಣಗಳಿಗೆ ಪ್ರವೇಶ ಟಿಕೆಟ್ ವ್ಯವಸ್ಥೆ',
      `${cfg.product_name || 'ServerPe Entry Ticketing'} — for any ticketed tourist site.`);

    cards(s, [
      { big: '1', kn: 'ಕ್ವಿಜ್‌ಪೇ', title: cfg.first_product_name || 'QuizPe',
        body: 'Live across India. Schools, parents, daily use, real payments.' },
      { big: '2', kn: 'ಪ್ರವೇಶ ಟಿಕೆಟ್', title: cfg.product_name || 'Entry Ticketing',
        body: `Built and working. ${place.name} is the first proposed site; the system is designed `
            + 'for any entry point.', color: C.gold },
    ], { y: 2.2, h: 1.9 });

    s.addText('ಎರಡೂ ಒಂದೇ ಅಡಿಪಾಯದ ಮೇಲೆ — ವಾಟ್ಸ್ಆ್ಯಪ್, ಪಾವತಿ, ಜಿಎಸ್‌ಟಿ, ವರದಿಗಳು.', {
      x: 0.55, y: 4.3, w: 8.9, h: 0.3,
      fontFace: KN_FONT, fontSize: 12, bold: true, color: C.forest,
    });
    s.addText('Both sit on the same foundations: WhatsApp delivery, payments, GST invoicing and reporting.', {
      x: 0.55, y: 4.56, w: 8.9, h: 0.3, fontFace: EN_FONT, fontSize: 11, color: C.muted,
    });
  }

  /* ══════════════════════════════════════════ 6 · the problem ════════════ */

  {
    const s = slide('ಸಮಸ್ಯೆ', 'The problem',
      'ಒಂದು ಟಿಕೆಟ್ — ಹತ್ತು ಪ್ರತಿಗಳು',
      'One ticket becomes ten.', { dark: true });

    s.addText('ಪ್ರವಾಸಿಗರು ಒಂದು ಟಿಕೆಟ್ ಖರೀದಿಸಿ, ಅದನ್ನು ಎಡಿಟ್ ಮಾಡಿ, ವಾಹನ ಸಂಖ್ಯೆ ಮತ್ತು ದಿನಾಂಕ ಬದಲಾಯಿಸಿ, '
            + 'ಹಲವು ಪ್ರತಿಗಳನ್ನು ಮುದ್ರಿಸುತ್ತಾರೆ.', {
      x: 0.55, y: 2.1, w: 8.2, h: 0.8,
      fontFace: KN_FONT, fontSize: 16, color: C.white, lineSpacingMultiple: 1.35,
    });
    s.addText('A visitor buys one printed ticket, opens the file in an editor, changes the vehicle '
            + 'number and the date, and prints it again.\n\n'
            + 'At the barrier, every copy looks exactly as genuine as the original.', {
      x: 0.55, y: 3.05, w: 8.2, h: 1.2,
      fontFace: EN_LIGHT, fontSize: 14.5, color: C.pale, lineSpacingMultiple: 1.3,
    });
  }

  /* ═════════════════════════════════════ 7 · why it is not caught ════════ */

  {
    const s = slide('ಕಾರಣ', 'Why it is not caught',
      'ಟಿಕೆಟ್ ಓದಲಾಗುತ್ತದೆ — ಪರಿಶೀಲಿಸಲಾಗುವುದಿಲ್ಲ',
      'The ticket is read, not verified.');

    s.addText('ಮುದ್ರಿತ ಟಿಕೆಟ್‌ನಲ್ಲಿ ಗೇಟ್ ಪರಿಶೀಲಿಸಬಹುದಾದ ಯಾವುದೇ ಅಂಶ ಇಲ್ಲ.', {
      x: 0.55, y: 2.15, w: 8.9, h: 0.45,
      fontFace: KN_FONT, fontSize: 18, bold: true, color: C.ink,
    });
    s.addText('There is nothing on a printed ticket that the gate can check against anything.\n\n'
            + 'A staff member is being asked to detect a forgery by eye, at speed, in a queue. '
            + 'That is not a task a person can do — and every ticket that passes leaves no trace, '
            + 'so nobody can measure the loss.', {
      x: 0.55, y: 2.75, w: 8.6, h: 1.6,
      fontFace: EN_FONT, fontSize: 14, color: C.muted, lineSpacingMultiple: 1.35,
    });
  }

  /* ═══════════════════════════════════════════ 8 · the proposal ══════════ */

  {
    const s = slide('ಪರಿಹಾರ', 'The proposal',
      'ತಿದ್ದಲಾಗದ ಟಿಕೆಟ್',
      'A ticket that cannot be edited.', { dark: true });

    s.addText('ವಾಹನ ಸಂಖ್ಯೆ, ದಿನಾಂಕ, ಸಮಯ ಮತ್ತು ವಾಹನದ ಪ್ರಕಾರ — ಎಲ್ಲವೂ QR ಕೋಡ್‌ನ ಡಿಜಿಟಲ್ ಸಹಿಯ ಒಳಗೆ.', {
      x: 0.55, y: 2.15, w: 8.5, h: 0.8,
      fontFace: KN_FONT, fontSize: 17, color: C.white, lineSpacingMultiple: 1.3,
    });
    s.addText('The vehicle number, date, time slot and vehicle type are sealed inside a digital '
            + 'signature in the QR code.', {
      x: 0.55, y: 3.0, w: 8.5, h: 0.6,
      fontFace: EN_LIGHT, fontSize: 15, color: C.pale, lineSpacingMultiple: 1.25,
    });
    s.addText('ಒಂದು ಅಕ್ಷರ ಬದಲಾದರೂ ಗೇಟ್ ತಿರಸ್ಕರಿಸುತ್ತದೆ.   ·   Change one character and the gate rejects it.', {
      x: 0.55, y: 3.85, w: 8.9, h: 0.4,
      fontFace: KN_FONT, fontSize: 14, bold: true, color: C.light,
    });
  }

  /* ═══════════════════════════════════════════ 9 · how it works ══════════ */

  {
    const s = slide('ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', 'How it works',
      'ಎರಡು ಕೀಲಿಗಳು — ಒಂದು ಮಾತ್ರ ಹೊರಗೆ ಹೋಗುತ್ತದೆ',
      'Two keys, and only one of them travels.');

    cards(s, [
      { kn: 'ಸರ್ವರ್ ಸಹಿ ಮಾಡುತ್ತದೆ', title: 'The server signs',
        body: 'A private key, held only on the server, seals the ticket details into the QR at '
            + 'the moment payment succeeds.' },
      { kn: 'ಫೋನ್ ಪರಿಶೀಲಿಸುತ್ತದೆ', title: 'The phone verifies',
        body: 'Each checkpost phone holds only the public key. It can check a signature — and '
            + 'cannot create one.' },
      { kn: 'ಫೋನ್ ಕಳೆದರೂ ಅಪಾಯವಿಲ್ಲ', title: 'A lost phone is harmless',
        body: 'Even taken apart, a gate phone could not manufacture a single valid ticket.' },
    ], { y: 2.15, h: 2.0 });

    s.addText('ಎಲ್ಲಾ ಫೋನ್‌ಗಳಲ್ಲಿ ಒಂದೇ ಪಾಸ್‌ವರ್ಡ್ ಇಡುವ ವಿಧಾನವನ್ನು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.', {
      x: 0.55, y: 4.35, w: 8.9, h: 0.3, fontFace: KN_FONT, fontSize: 11.5, color: C.muted,
    });
    s.addText('A shared password on every phone was rejected: a secret kept in a device at a hill '
            + 'station is a secret that eventually leaves it.', {
      x: 0.55, y: 4.62, w: 8.9, h: 0.3,
      fontFace: EN_FONT, fontSize: 10.5, italic: true, color: C.muted,
    });
  }

  /* ═══════════════════════════════════════════ 10 · offline ══════════════ */

  {
    const s = slide('ಘಾಟಿ ರಸ್ತೆಯಲ್ಲಿ', 'On the ghat road',
      'ನೆಟ್‌ವರ್ಕ್ ಇಲ್ಲದಿದ್ದರೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
      'No signal is not a problem.');

    cards(s, [
      { big: 'Offline', kn: 'ಟಿಕೆಟ್ ನಿಜವೇ?', title: 'Is this ticket genuine?',
        body: 'Signature, vehicle number, date and slot are all checked on the phone itself. '
            + 'A forgery is caught with no network at all.' },
      { big: 'Online', kn: 'ಈಗಾಗಲೇ ಬಳಸಿದೆಯೇ?', title: 'Has it already come through?',
        body: 'The only fact that must be shared between gates. Offline scans queue on the phone '
            + 'and reconcile automatically when signal returns.', color: C.muted },
    ], { y: 2.15, h: 2.15 });
  }

  /* ═══════════════════════════════════════════ 11 · the verdicts ═════════ */

  {
    const s = slide('ಗೇಟ್‌ನಲ್ಲಿ', 'At the barrier',
      'ಫೋನ್ ಸ್ಪಷ್ಟ ಸೂಚನೆ ನೀಡುತ್ತದೆ',
      'The phone gives an instruction, not a guess.');

    table(s, ['What the staff member sees', 'What it means'], [
      ['ALLOW', 'Genuine, right vehicle, right day'],
      ['ALREADY USED', 'This code has come through before — a copy'],
      ['FAKE TICKET', 'The signature does not verify'],
      ['WRONG DAY', 'Genuine ticket, issued for another date'],
      ['WRONG TIME', 'Genuine ticket for later today'],
    ], { y: 2.25, colW: [3.2, 5.7],
      headKn: ['ಸಿಬ್ಬಂದಿಗೆ ಕಾಣುವುದು', 'ಅರ್ಥ'] });

    s.addText('ತಡವಾಗಿ ಬಂದರೆ ಪ್ರವೇಶ ಇದೆ; ಮೊದಲೇ ಬಂದರೆ ಇಲ್ಲ.   ·   Late arrivals are allowed, early ones are not.', {
      x: 0.55, y: 4.65, w: 8.9, h: 0.3, fontFace: KN_FONT, fontSize: 11.5, color: C.muted });
  }

  /* ═══════════════════════════════════════════ 12 · the visitor ══════════ */

  {
    const s = slide('ಪ್ರವಾಸಿಗರಿಗೆ', 'The visitor',
      'ಐದು ಹಂತ — ಆ್ಯಪ್ ಇಲ್ಲ, ಖಾತೆ ಇಲ್ಲ',
      'Five steps, no app, no account.');

    bullets(s, [
      ['ವಾಟ್ಸ್ಆ್ಯಪ್‌ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ.', 'Sends a WhatsApp message to the published number.'],
      ['ವಾಹನ ಸಂಖ್ಯೆ ಟೈಪ್ ಮಾಡಿ.',
       'The vehicle type is read from the government record, so the correct fee is charged '
       + 'automatically.'],
      ['ದಿನ ಮತ್ತು ಸಮಯ ಆಯ್ಕೆ ಮಾಡಿ.', 'Sees how many places are left in each slot.'],
      ['ಪಾವತಿಸಿ — ಟಿಕೆಟ್ ಅದೇ ಚಾಟ್‌ನಲ್ಲಿ ಬರುತ್ತದೆ.',
       'The QR ticket and receipt arrive in the same chat within seconds.'],
      ['ಗೇಟ್‌ನಲ್ಲಿ QR ತೋರಿಸಿ.', 'Nothing else.'],
    ], { y: 2.0, size: 13 });
  }

  /* ═══════════════════════════════════════════ 13 · accountability ═══════ */

  {
    const s = slide('ಚೆಕ್‌ಪೋಸ್ಟ್', 'The checkpost',
      'ಪ್ರತಿ ಸ್ಕ್ಯಾನ್‌ಗೂ ಹೆಸರು ಇರುತ್ತದೆ',
      'Every scan has a name on it.');

    cards(s, [
      { kn: 'ಸ್ವಂತ ಪಿನ್', title: 'Own PIN per person',
        body: 'Issued by the administrator, never chosen. Every scan is attributed by name.' },
      { kn: 'ಒಂದು ಗೇಟ್ — ಒಂದು ಫೋನ್', title: 'One phone per gate',
        body: 'A second phone cannot scan until it deliberately takes over, and the handover is '
            + 'recorded.' },
      { kn: 'ಒಬ್ಬರಿಗೆ ಒಂದೇ ಗೇಟ್', title: 'One gate per person',
        body: 'Signing in at one checkpost ends that person\'s session everywhere else. A PIN '
            + 'cannot be lent.' },
    ], { y: 2.15, h: 2.0 });
  }

  /* ═══════════════════════════════════════════ 14 · capacity ═════════════ */

  {
    const s = slide('ಜನದಟ್ಟಣೆ ನಿಯಂತ್ರಣ', 'Crowd control',
      'ದಿನಕ್ಕೆ ಎರಡು ಅವಧಿ, ಪ್ರತಿ ಪ್ರಕಾರಕ್ಕೂ ಮಿತಿ',
      'Two slots a day, with a limit for each vehicle type.');

    table(s, ['Vehicle type', 'Per slot', 'Slots', 'Per day'],
      Object.values(byCat).map((c) => [c.label, c.per_slot, c.slots, c.per_slot * c.slots])
        .concat([['Total vehicles per day', '', '', perDay]]),
      { y: 2.25, colW: [3.8, 1.7, 1.7, 1.7],
        headKn: ['ವಾಹನ ಪ್ರಕಾರ', 'ಪ್ರತಿ ಅವಧಿ', 'ಅವಧಿಗಳು', 'ದಿನಕ್ಕೆ'] });

    s.addText('ಒಂದು ವಾಹನ ದಿನಕ್ಕೆ ಒಮ್ಮೆ ಮಾತ್ರ. ಎಲ್ಲಾ ಮಿತಿಗಳನ್ನು ಇಲಾಖೆ ಬದಲಾಯಿಸಬಹುದು.', {
      x: 0.55, y: 4.55, w: 8.9, h: 0.3, fontFace: KN_FONT, fontSize: 11.5, color: C.muted });
    s.addText('One vehicle enters once per day. Every limit is configurable by the department, '
            + 'without a software change.', {
      x: 0.55, y: 4.82, w: 8.9, h: 0.3, fontFace: EN_FONT, fontSize: 10.5, color: C.muted });
  }

  /* ═══════════════════════════════════════════ 15 · the money ════════════ */

  {
    const s = slide('ಹಣಕಾಸು', 'The money',
      'ಪ್ರವೇಶ ಶುಲ್ಕ ಪೂರ್ತಿ ಇಲಾಖೆಗೆ',
      'The department collects the entry fee in full.');

    table(s, ['Vehicle type', 'Entry fee', 'Booking fee', 'Visitor pays'],
      pricing.map((p) => [
        p.label, `Rs. ${rs(p.entry_paise)}`, `Rs. ${rs(p.platform_paise)}`,
        `Rs. ${rs(p.entry_paise + p.platform_paise)}`,
      ]),
      { y: 2.2, colW: [3.5, 1.8, 1.8, 1.8],
        headKn: ['ವಾಹನ ಪ್ರಕಾರ', 'ಪ್ರವೇಶ ಶುಲ್ಕ', 'ಬುಕಿಂಗ್ ಶುಲ್ಕ', 'ಒಟ್ಟು'] });

    s.addText('ಪ್ರವೇಶ ಶುಲ್ಕವನ್ನು ಇಲಾಖೆಯ ಪರವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ — ಅದು ನಮ್ಮ ಆದಾಯವಲ್ಲ.', {
      x: 0.55, y: 4.15, w: 8.9, h: 0.3, fontFace: KN_FONT, fontSize: 12, bold: true, color: C.forest });
    s.addText(`The entry fee is collected as a pure agent under Rule 33 of the CGST Rules and is `
            + `not ServerPe revenue. The booking fee is ${feePct}% of the entry fee and is paid by `
            + 'the visitor.', {
      x: 0.55, y: 4.45, w: 8.9, h: 0.5, fontFace: EN_FONT, fontSize: 11, color: C.muted });
  }

  /* ═══════════════════════════════════════════ 16 · commercials ══════════ */

  {
    const s = slide('ವಾಣಿಜ್ಯ ಷರತ್ತುಗಳು', 'Commercial terms',
      'ಇಲಾಖೆಗೆ ಒಂದೇ ಶುಲ್ಕ',
      'One charge to the department, and nothing else.');

    table(s, ['Item', 'Charge', 'Paid by'], [
      ['Set-up and installation', 'Nil', '—'],
      ['Software licence', 'Nil', '—'],
      ['Per-ticket booking fee', `${feePct}% of entry fee`, 'Visitor'],
      ['Annual maintenance, per gate', `Rs. ${amcRs}`, 'Department'],
      ['Payment gateway and messaging', 'Absorbed by us', '—'],
    ], { y: 2.2, colW: [4.3, 2.6, 2.0],
      headKn: ['ವಿವರ', 'ಶುಲ್ಕ', 'ಪಾವತಿ'] });

    s.addText(`ವಾರ್ಷಿಕ ನಿರ್ವಹಣಾ ಶುಲ್ಕ ದಿನಕ್ಕೆ ಸುಮಾರು ${breakEven} ನಕಲಿ ಟಿಕೆಟ್ ತಡೆದರೆ ವಸೂಲಾಗುತ್ತದೆ.`, {
      x: 0.55, y: 4.3, w: 8.9, h: 0.3,
      fontFace: KN_FONT, fontSize: 12.5, bold: true, color: C.forest });
    s.addText(`The maintenance charge is recovered by stopping about ${breakEven} altered car `
            + `entries a day. Term: ${cfg.contract_term || '1 year, renewable'}.`, {
      x: 0.55, y: 4.6, w: 8.9, h: 0.4, fontFace: EN_FONT, fontSize: 11, color: C.muted });
  }

  /* ═══════════════════════════════════════════ 17 · closures ═════════════ */

  {
    const s = slide('ರದ್ದತಿ', 'When the hill must close',
      'ಯಾರೂ ಮುಚ್ಚಿದ ಗೇಟ್‌ಗೆ ಪ್ರಯಾಣಿಸಬಾರದು',
      'Nobody drives three hours to a shut barrier.');

    bullets(s, [
      ['ಅಧಿಕಾರಿ ದಿನಾಂಕ ರದ್ದುಪಡಿಸುತ್ತಾರೆ, ಕಾರಣ ಬರೆಯುತ್ತಾರೆ.',
       'An officer closes the date — or one slot of it — and writes the reason in plain words.'],
      ['ಮೊದಲು ಎಷ್ಟು ಟಿಕೆಟ್ ಪರಿಣಾಮ ಎಂದು ತೋರಿಸುತ್ತದೆ.',
       'The panel states exactly what will happen before anything is done.'],
      ['ಎಲ್ಲರಿಗೂ ಸಂದೇಶ, ಬೇರೆ ದಿನಕ್ಕೆ ಉಚಿತ ಬದಲಾವಣೆ.',
       'Every affected visitor is messaged and offered another day at no extra cost.'],
      ['ಬೇಡವೆಂದರೆ ಪೂರ್ಣ ಮರುಪಾವತಿ.',
       `A full refund within ${cfg.refund_working_days || '5-7'} working days for anyone who cannot come.`],
    ], { y: 2.05, size: 13 });
  }

  /* ═══════════════════════════════════════════ 18 · oversight ════════════ */

  {
    const s = slide('ಮೇಲ್ವಿಚಾರಣೆ', 'Oversight',
      'ಇಲಾಖೆಗೆ ಎಲ್ಲವೂ ನೇರವಾಗಿ ಕಾಣುತ್ತದೆ',
      'The department does not have to ask us for a number.');

    cards(s, [
      { kn: 'ಈ ಕ್ಷಣದ ಸ್ಥಿತಿ', title: 'Live position',
        body: 'Vehicles entered, amount collected, how full each slot is, and every attempt the '
            + 'gate refused today.' },
      { kn: 'ದೈನಂದಿನ · ಸಾಪ್ತಾಹಿಕ · ಮಾಸಿಕ', title: 'Full reports',
        body: 'Daily, weekly and monthly reports with every ticket and every scan, downloadable '
            + 'as PDF or spreadsheet at any moment.' },
      { kn: 'ಲೆಕ್ಕಪರಿಶೋಧನೆ', title: 'Full audit trail',
        body: 'Every action by every officer, with time and account. Every scan with the staff '
            + 'member who made it.' },
    ], { y: 2.15, h: 2.05 });
  }

  /* ═══════════════════════════════════════════ 19 · privacy ══════════════ */

  {
    const s = slide('ಮಾಹಿತಿ ಸುರಕ್ಷತೆ', 'Data protection',
      'ಅಗತ್ಯವಿರುವಷ್ಟೇ ಮಾಹಿತಿ ಸಂಗ್ರಹ',
      'The system holds the least it can.');

    table(s, ['Stored', 'Never stored'], [
      ['Mobile number', 'Owner name'],
      ['Vehicle registration number', 'Owner address'],
      ['Vehicle type, make and model', 'Chassis number'],
      ['Ticket, payment and scan records', 'Engine number'],
    ], { y: 2.25, colW: [4.45, 4.45], headKn: ['ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ', 'ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ'] });

    s.antiAlias = true;
    s.addText('ಪ್ರವಾಸಿಗರ ಒಪ್ಪಿಗೆ ಪಡೆದ ನಂತರವೇ ಪರಿಶೀಲನೆ. ನಾವು ಎಂದಿಗೂ ಕೇಳದೆ ಸಂದೇಶ ಕಳುಹಿಸುವುದಿಲ್ಲ.', {
      x: 0.55, y: 4.5, w: 8.9, h: 0.4, fontFace: KN_FONT, fontSize: 11.5, color: C.muted });
  }

  /* ═══════════════════════════════════════════ 20 · the ask ══════════════ */

  {
    const s = slide('ಇಲಾಖೆಯಿಂದ ಬೇಕಾದದ್ದು', 'What we need',
      'ನಾಲ್ಕು ವಿಷಯಗಳು — ಸ್ಥಾಪಿಸಲು ಏನೂ ಇಲ್ಲ',
      'Four things, and nothing to install.');

    bullets(s, [
      ['ಚೆಕ್‌ಪೋಸ್ಟ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸಲು ಅನುಮತಿ ಮತ್ತು ಶುಲ್ಕದ ದೃಢೀಕರಣ.',
       'Approval to operate, and confirmation of the entry fee for each vehicle type.'],
      ['ಎರಡು ಸಾಮಾನ್ಯ ಆಂಡ್ರಾಯ್ಡ್ ಫೋನ್.',
       'Two ordinary Android phones at the gate — no special scanner hardware.'],
      ['ಸಿಬ್ಬಂದಿ ಮತ್ತು ಅಧಿಕಾರಿಗಳ ಹೆಸರುಗಳು.',
       'Staff to be issued PINs, and officers to be given panel access.'],
      ['ಸಂಗ್ರಹಿಸಿದ ಶುಲ್ಕ ಇಲಾಖೆಗೆ ಪಾವತಿಸುವ ವಿಧಾನ.',
       'A decision on how and how often the collected entry fee is settled.'],
    ], { y: 2.05, size: 13 });
  }

  /* ═══════════════════════════════════════════ 21 · the demo ═════════════ */

  {
    const s = slide('ಈಗ', 'Now', 'ನೇರ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ', 'A live demonstration, on this table.',
      { dark: true });

    bullets(s, [
      ['ವಾಟ್ಸ್ಆ್ಯಪ್‌ನಲ್ಲಿ ನಿಜವಾದ ಟಿಕೆಟ್ ಬುಕಿಂಗ್ ಮತ್ತು ಪಾವತಿ.',
       'Booking a real ticket on WhatsApp, and paying for it.'],
      ['ಆ ಟಿಕೆಟ್ ತಿದ್ದಿ ತೋರಿಸಿದಾಗ ಗೇಟ್ ತಿರಸ್ಕರಿಸುವುದು.',
       'Altering that ticket deliberately — and the gate refusing it.'],
      ['ಒಂದೇ ಟಿಕೆಟ್ ಎರಡು ಬಾರಿ — ಎರಡನೆಯದು ಸಿಕ್ಕಿಬೀಳುವುದು.',
       'The same ticket presented twice, and the second attempt being caught.'],
      ['ನೆಟ್‌ವರ್ಕ್ ಆಫ್ ಮಾಡಿ ಪರಿಶೀಲನೆ.',
       'Verifying a ticket with the phone\'s network switched off.'],
      ['ಇಲಾಖೆಯ ಪ್ಯಾನೆಲ್‌ನಲ್ಲಿ ಇವೆಲ್ಲವೂ ತಕ್ಷಣ ಕಾಣುವುದು.',
       'Watching all of it appear in the department\'s panel as it happens.'],
    ], { y: 2.1, size: 12.5, dark: true });

    if (dailyEntry) {
      s.addText(`ಪೂರ್ಣ ಸಾಮರ್ಥ್ಯದಲ್ಲಿ ದಿನಕ್ಕೆ ಸುಮಾರು ರೂ. ${inr(dailyEntry)} ಪ್ರವೇಶ ಶುಲ್ಕ — `
              + 'ಪ್ರತಿ ರೂಪಾಯಿಯೂ ದಾಖಲಾಗುತ್ತದೆ.', {
        x: 0.55, y: 4.75, w: 8.9, h: 0.35,
        fontFace: KN_FONT, fontSize: 12.5, bold: true, color: C.light });
    }
  }

  /* ═══════════════════════════════════════════ 22 · contact ══════════════ */

  {
    const s = pptx.addSlide();
    s.background = { color: C.paper };
    if (has(ourLogo)) s.addImage({ path: ourLogo, x: 0.55, y: 0.5, w: 0.9, h: 0.9 });

    s.addText(cfg.legal_name || 'ServerPe App Solutions', {
      x: 0.55, y: 1.6, w: 8.9, h: 0.5,
      fontFace: EN_FONT, fontSize: 26, bold: true, color: C.ink });
    s.addText(cfg.vendor_tagline || 'Smart Clicks, Smart Taps.', {
      x: 0.55, y: 2.08, w: 8.9, h: 0.35,
      fontFace: EN_LIGHT, fontSize: 15, italic: true, color: C.forest });

    const facts = [
      ['ಸಂಸ್ಥೆಯ ರಚನೆ', 'Constitution', cfg.legal_form || 'Sole Proprietorship'],
      ['ಮಾಲೀಕರು', 'Proprietor', val('proprietor_name')],
      ['ಜಿಎಸ್‌ಟಿ', 'GSTIN', val('gstin')],
      ['ಉದ್ಯಮ್ (MSME)', 'Udyam', val('udyam_number')],
      ['ವಿಳಾಸ', 'Address', val('business_address')],
      ['ಸಂಪರ್ಕ', 'Contact', `${cfg.support_mobile || ''}  ·  ${cfg.contact_email || ''}`],
    ];

    facts.forEach(([k, ke, v], i) => {
      const y = 2.7 + i * 0.42;
      s.addText(`${k} · ${ke}`, { x: 0.55, y, w: 2.6, h: 0.32,
        fontFace: KN_FONT, fontSize: 10.5, bold: true, color: C.muted });
      s.addText(String(v), { x: 3.25, y, w: 6.2, h: 0.32,
        fontFace: EN_FONT, fontSize: 12, color: C.ink });
    });
  }

  await pptx.writeFile({ fileName: OUT });

  const missing = ['gstin', 'udyam_number', 'business_address', 'proprietor_name']
    .filter((k) => !cfg[k] || !String(cfg[k]).trim());

  console.log(`\n  Written: ${OUT}  (22 slides)`);
  if (missing.length) {
    console.log('\n  STILL TO FILL — these show as "[ to be filled ]" on the contact slide:');
    for (const m of missing) console.log(`    ${m}`);
    console.log('\n  Set them in the admin panel under Pricing & settings, then run this again.\n');
  } else {
    console.log('');
  }
  process.exit(0);
})().catch((e) => { console.error('\n', e, '\n'); process.exit(1); });
