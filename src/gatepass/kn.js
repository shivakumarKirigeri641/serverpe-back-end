/**
 * kn.js — Kannada, in one place.
 *
 * This is a Karnataka Tourism ticket. It is read at a barrier in Chikkamagaluru
 * by people whose first language is Kannada, and an English-only ticket for a
 * state tourism site is the wrong artefact regardless of how well it works.
 *
 * THE RULE FOLLOWED THROUGHOUT: Kannada first, English beneath it. Not Kannada
 * instead of English — a visitor from Mumbai holds the same ticket — and not
 * English with a Kannada footnote, which reads as an afterthought.
 *
 * WHAT IS DELIBERATELY NOT TRANSLATED: the registration number, the ticket
 * number and the verification code. Those are identifiers, and an identifier
 * that changes shape between languages is an identifier that causes an argument
 * at a gate.
 *
 * A NOTE ON THE TRANSLATIONS: these were written to be plain and official
 * rather than literal, using the terms a government notice would use. They
 * should be read by a Kannada speaker before the system goes in front of the
 * public — the cost of a slightly wrong word on a government ticket is much
 * higher than the cost of checking.
 */

const KN = {
  /* ── Authority and the ticket itself ──────────────────────────────── */
  department: 'ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮ ಇಲಾಖೆ',
  tagline: 'ಒಂದು ರಾಜ್ಯ, ಹಲವು ಪ್ರಪಂಚಗಳು',
  vehicle_entry_ticket: 'ವಾಹನ ಪ್ರವೇಶ ಟಿಕೆಟ್',
  show_at_checkpost: 'ಚೆಕ್‌ಪೋಸ್ಟ್‌ನಲ್ಲಿ ಇದನ್ನು ತೋರಿಸಿ',
  secure_code: 'ಸುರಕ್ಷಿತ ಪರಿಶೀಲನಾ ಸಂಕೇತ',
  ticket_no: 'ಟಿಕೆಟ್ ಸಂಖ್ಯೆ',

  /* ── Fields ───────────────────────────────────────────────────────── */
  vehicle_number: 'ವಾಹನ ಸಂಖ್ಯೆ',
  vehicle_type: 'ವಾಹನದ ಪ್ರಕಾರ',
  travel_date: 'ಪ್ರಯಾಣದ ದಿನಾಂಕ',
  entry_time: 'ಪ್ರವೇಶ ಸಮಯ',
  place: 'ಸ್ಥಳ',

  /* ── Money ────────────────────────────────────────────────────────── */
  entry_fee: 'ಪ್ರವೇಶ ಶುಲ್ಕ',
  booking_fee: 'ಬುಕಿಂಗ್ ಶುಲ್ಕ',
  gst_included: 'ಜಿಎಸ್‌ಟಿ ಸೇರಿದೆ',
  total_paid: 'ಒಟ್ಟು ಪಾವತಿ',
  refund: 'ಮರುಪಾವತಿ',

  /* ── The conversation ─────────────────────────────────────────────── */
  greeting: 'ನಮಸ್ಕಾರ',
  what_would_you_like: 'ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?',
  menu_book: 'ಟಿಕೆಟ್ ಬುಕ್ ಮಾಡಿ',
  menu_download: 'ಟಿಕೆಟ್ ಪಡೆಯಿರಿ',
  menu_postpone: 'ದಿನಾಂಕ ಬದಲಿಸಿ',
  menu_support: 'ಸಹಾಯ',
  menu_feedback: 'ಅಭಿಪ್ರಾಯ',

  book_here: 'ಇಲ್ಲಿ ವಾಹನ ಪ್ರವೇಶ ಟಿಕೆಟ್ ಬುಕ್ ಮಾಡಿ — ಗೇಟ್‌ನಲ್ಲಿ ಸರತಿ ಸಾಲು ಇಲ್ಲ.',
  qr_cannot_be_copied: 'ನಿಮ್ಮ ಟಿಕೆಟ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತ QR ಕೋಡ್ ಇರುತ್ತದೆ. ಅದನ್ನು ತಿದ್ದಲು ಅಥವಾ ನಕಲಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
  consent_ask: 'ವಾಹನದ ಪ್ರಕಾರವನ್ನು ಖಚಿತಪಡಿಸಲು ನಿಮ್ಮ ವಾಹನ ಸಂಖ್ಯೆಯನ್ನು ಸರ್ಕಾರಿ ದಾಖಲೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸುತ್ತೇವೆ. ವಾಹನ ಸಂಖ್ಯೆ, ಪ್ರಕಾರ ಮತ್ತು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮಾತ್ರ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ. ಮಾಲೀಕರ ಯಾವುದೇ ವಿವರ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.',
  agree_continue: 'ಒಪ್ಪಿ ಮುಂದುವರಿಯಿರಿ',
  read_policy: 'ನಿಯಮ ಓದಿ',

  type_vehicle_number: 'ನಿಮ್ಮ *ವಾಹನ ಸಂಖ್ಯೆ* ಟೈಪ್ ಮಾಡಿ.',
  example: 'ಉದಾಹರಣೆ',
  any_format_ok: 'ಸ್ಪೇಸ್, ಡ್ಯಾಶ್ ಅಥವಾ ಒಟ್ಟಿಗೆ — ಹೇಗೆ ಬೇಕಾದರೂ ಟೈಪ್ ಮಾಡಬಹುದು.',
  is_this_correct: 'ಇದು ಸರಿಯಾಗಿದೆಯೇ?',
  yes_correct: 'ಹೌದು, ಸರಿ',
  re_enter: 'ಮತ್ತೆ ಟೈಪ್ ಮಾಡಿ',
  not_a_vehicle_number: 'ಅದು ವಾಹನ ಸಂಖ್ಯೆಯಂತೆ ಕಾಣುತ್ತಿಲ್ಲ.',
  checking_vehicle: 'ನಿಮ್ಮ ವಾಹನವನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',

  which_day: 'ಯಾವ ದಿನ ಪ್ರಯಾಣಿಸುತ್ತೀರಿ?',
  choose_date: 'ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ',
  choose_time: 'ಪ್ರವೇಶ ಸಮಯ ಆಯ್ಕೆ ಮಾಡಿ:',
  today: 'ಇಂದು',
  tomorrow: 'ನಾಳೆ',
  morning: 'ಬೆಳಗ್ಗೆ',
  afternoon: 'ಮಧ್ಯಾಹ್ನ',
  left: 'ಉಳಿದಿವೆ',

  booking_summary: 'ಬುಕಿಂಗ್ ವಿವರ',
  pay_here: 'ಇಲ್ಲಿ ಪಾವತಿಸಿ',
  held_for_minutes: 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು {n} ನಿಮಿಷಗಳ ಕಾಲ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',

  already_has_ticket: 'ಈ ವಾಹನಕ್ಕೆ ಈಗಾಗಲೇ ಟಿಕೆಟ್ ಇದೆ.',
  one_vehicle_one_day: 'ಒಂದು ವಾಹನ ದಿನಕ್ಕೆ ಒಮ್ಮೆ ಮಾತ್ರ ಪ್ರವೇಶಿಸಬಹುದು.',
  sold_out: 'ಕ್ಷಮಿಸಿ, ಆ ದಿನ ನಿಮ್ಮ ವಾಹನದ ಪ್ರಕಾರಕ್ಕೆ ಸ್ಥಳ ಭರ್ತಿಯಾಗಿದೆ.',
  type_hi_for_menu: 'ಮೆನುಗಾಗಿ *hi* ಎಂದು ಟೈಪ್ ಮಾಡಿ.',

  ticket_moved: 'ಟಿಕೆಟ್ ಬದಲಾಯಿಸಲಾಗಿದೆ',
  old_qr_invalid: 'ನಿಮ್ಮ ಹಳೆಯ QR ಕೋಡ್ ಇನ್ನು ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ. ಗೇಟ್‌ನಲ್ಲಿ ಹೊಸದನ್ನು ತೋರಿಸಿ.',
  day_closed: 'ನಿಮ್ಮ ಪ್ರಯಾಣದ ದಿನ ರದ್ದುಗೊಂಡಿದೆ',
  choose_new_date: 'ಹೊಸ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ',
  refund_me: 'ಹಣ ಹಿಂತಿರುಗಿಸಿ',
  refund_started: 'ಮರುಪಾವತಿ ಪ್ರಾರಂಭವಾಗಿದೆ',

  thank_you: 'ಧನ್ಯವಾದಗಳು',
  support_ask: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಒಂದೇ ಸಂದೇಶದಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ.',
  feedback_ask: 'ನಿಮ್ಮ ಭೇಟಿ ಹೇಗಿತ್ತು? ಒಂದೇ ಸಂದೇಶದಲ್ಲಿ ತಿಳಿಸಿ.',

  /* ── Ticket small print ───────────────────────────────────────────── */
  note_valid_only: 'ಈ ಟಿಕೆಟ್ ಮೇಲೆ ನಮೂದಿಸಿದ ವಾಹನ, ದಿನಾಂಕ ಮತ್ತು ಸಮಯಕ್ಕೆ ಮಾತ್ರ ಮಾನ್ಯ.',
  note_one_entry: 'ದಿನಕ್ಕೆ ಒಂದು ವಾಹನಕ್ಕೆ ಒಂದು ಪ್ರವೇಶ. QR ಕೋಡ್ ಒಮ್ಮೆ ಮಾತ್ರ ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತದೆ.',
  note_signed: 'QR ಕೋಡ್ ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿದೆ. ತಿದ್ದಿದ ಅಥವಾ ನಕಲಿ ಟಿಕೆಟ್ ಗೇಟ್‌ನಲ್ಲಿ ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ.',
  pure_agent: 'ಪ್ರವೇಶ ಶುಲ್ಕವನ್ನು ಇಲಾಖೆಯ ಪರವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.',
};

/** One string, or the key itself if it is missing — never a blank on a ticket. */
const kn = (key, vars) => {
  let s = KN[key] || key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
};

/**
 * Kannada line, English line — the standard pairing used everywhere.
 *
 * Returned as a two-line string for messages, where WhatsApp gives no way to
 * style one line differently from another.
 */
const both = (key, english, vars) => `${kn(key, vars)}\n${english}`;

/** Side by side, for a label on a ticket where vertical space is short. */
const inline = (key, english) => `${kn(key)} · ${english}`;

module.exports = { KN, kn, both, inline };
