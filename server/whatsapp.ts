/**
 * Admin Email Alerts
 * Sends email notifications to the admin Gmail (learn.at.edunest@gmail.com)
 * for two key events: demo class scheduled and session sheet uploaded.
 * Each email includes clickable wa.me deep links to directly message the parent/tutor on WhatsApp.
 *
 * WhatsApp link format: https://wa.me/<countrycode><number>?text=<urlencoded message>
 * Indian numbers: +91XXXXXXXXXX → 91XXXXXXXXXX
 */

import nodemailer from "nodemailer";

const OWNER_EMAIL = "learn.at.edunest@gmail.com";

function getTransporter(): nodemailer.Transporter | null {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    console.warn("[Admin Alert] GMAIL_APP_PASSWORD not set — admin email alerts disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: OWNER_EMAIL, pass },
  });
}

async function sendAdminEmail(subject: string, html: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: `"EduNest Alerts" <${OWNER_EMAIL}>`,
      to: OWNER_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Admin Alert] Failed to send admin alert email:", err);
  }
}

/** Normalise an Indian phone number to WhatsApp-compatible format (91XXXXXXXXXX) */
function toWaNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** Build a wa.me URL with a pre-filled message */
function waLink(phone: string, message: string): string {
  const number = toWaNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

// ─── Alert 1: Demo class scheduled ──────────────────────────────────────────

export async function notifyAdminDemoScheduled(params: {
  parentName: string;
  parentPhone: string;
  tutorName: string;
  tutorPhone: string;
  studentName: string;
  subject: string;
  demoDate: string;
}): Promise<void> {
  const { parentName, parentPhone, tutorName, tutorPhone, studentName, subject, demoDate } = params;

  const parentWaMsg = `Hi ${parentName}! 👋 This is EduNest. Your demo class for ${studentName} (${subject}) with ${tutorName} has been scheduled for ${demoDate}. Please be ready. For any queries, reply here.`;
  const tutorWaMsg = `Hi ${tutorName}! 👋 This is EduNest. A demo class has been booked for you with ${parentName}'s child ${studentName} (${subject}) on ${demoDate}. Please be punctual and dressed professionally. For any queries, reply here.`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e5e7eb;border-radius:10px">
      <div style="border-bottom:3px solid #ea580c;padding-bottom:12px;margin-bottom:20px">
        <h2 style="color:#ea580c;margin:0;font-size:20px">📅 New Demo Class Scheduled</h2>
        <p style="color:#6b7280;margin:4px 0 0;font-size:13px">EduNest Admin Alert</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
        <tr><td style="padding:10px 8px;font-weight:bold;color:#374151;width:120px;border-bottom:1px solid #f3f4f6">Student</td><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6">${studentName}</td></tr>
        <tr style="background:#fef9f0"><td style="padding:10px 8px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Subject</td><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6">${subject}</td></tr>
        <tr><td style="padding:10px 8px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Demo Date</td><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;font-weight:bold;color:#ea580c">${demoDate}</td></tr>
        <tr style="background:#fef9f0"><td style="padding:10px 8px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Parent</td><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6">${parentName} &mdash; ${parentPhone}</td></tr>
        <tr><td style="padding:10px 8px;font-weight:bold;color:#374151">Tutor</td><td style="padding:10px 8px">${tutorName} &mdash; ${tutorPhone}</td></tr>
      </table>
      <p style="font-weight:bold;color:#374151;margin:0 0 12px">Contact them directly on WhatsApp:</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="${waLink(parentPhone, parentWaMsg)}" style="background:#25D366;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
          💬 Message Parent on WhatsApp<br><span style="font-weight:normal;font-size:12px">${parentPhone}</span>
        </a>
        <a href="${waLink(tutorPhone, tutorWaMsg)}" style="background:#128C7E;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
          💬 Message Tutor on WhatsApp<br><span style="font-weight:normal;font-size:12px">${tutorPhone}</span>
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:12px">EduNest — learn.at.edunest@gmail.com | +91-8618635627</p>
    </div>
  `;

  await sendAdminEmail(`📅 Demo Scheduled: ${studentName} ↔ ${tutorName} on ${demoDate}`, html);
}

// ─── Alert 2: Tutor uploaded session sheet ───────────────────────────────────

export async function notifyAdminSheetUploaded(params: {
  tutorName: string;
  tutorPhone: string;
  parentName: string;
  parentPhone: string;
  studentName: string;
  sheetUrl?: string;
}): Promise<void> {
  const { tutorName, tutorPhone, parentName, parentPhone, studentName, sheetUrl } = params;

  const parentWaMsg = `Hi ${parentName}! 👋 EduNest here. Your tutor ${tutorName} has uploaded the session sheet for ${studentName}. Please log in to edu-nest.manus.space to review and process the payment. Thank you!`;
  const tutorWaMsg = `Hi ${tutorName}! 👋 EduNest here. We've received your session sheet for ${studentName}. We'll notify the parent to process the payment shortly. Thank you!`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e5e7eb;border-radius:10px">
      <div style="border-bottom:3px solid #ea580c;padding-bottom:12px;margin-bottom:20px">
        <h2 style="color:#ea580c;margin:0;font-size:20px">📋 Session Sheet Uploaded</h2>
        <p style="color:#6b7280;margin:4px 0 0;font-size:13px">EduNest Admin Alert — Payment Action Required</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
        <tr><td style="padding:10px 8px;font-weight:bold;color:#374151;width:120px;border-bottom:1px solid #f3f4f6">Student</td><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6">${studentName}</td></tr>
        <tr style="background:#fef9f0"><td style="padding:10px 8px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Tutor</td><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6">${tutorName} &mdash; ${tutorPhone}</td></tr>
        <tr><td style="padding:10px 8px;font-weight:bold;color:#374151;border-bottom:1px solid #f3f4f6">Parent</td><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6">${parentName} &mdash; ${parentPhone}</td></tr>
        ${sheetUrl ? `<tr style="background:#fef9f0"><td style="padding:10px 8px;font-weight:bold;color:#374151">Sheet</td><td style="padding:10px 8px"><a href="${sheetUrl}" style="color:#ea580c;font-weight:bold">📄 View Uploaded Sheet</a></td></tr>` : ""}
      </table>
      <p style="font-weight:bold;color:#374151;margin:0 0 12px">Contact them directly on WhatsApp:</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="${waLink(parentPhone, parentWaMsg)}" style="background:#25D366;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
          💬 Message Parent on WhatsApp<br><span style="font-weight:normal;font-size:12px">${parentPhone}</span>
        </a>
        <a href="${waLink(tutorPhone, tutorWaMsg)}" style="background:#128C7E;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
          💬 Message Tutor on WhatsApp<br><span style="font-weight:normal;font-size:12px">${tutorPhone}</span>
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:12px">EduNest — learn.at.edunest@gmail.com | +91-8618635627</p>
    </div>
  `;

  await sendAdminEmail(`📋 Sheet Uploaded: ${tutorName} for ${studentName} — Payment Pending`, html);
}

// ─── Stub exports for backward compatibility (no-ops) ────────────────────────

export async function notifyAdminParentPaid(_params: unknown): Promise<void> {
  // Removed per admin preference — only demo scheduled and sheet uploaded alerts are sent
}

export async function notifyAdminCancellationRequested(_params: unknown): Promise<void> {
  // Removed per admin preference — only demo scheduled and sheet uploaded alerts are sent
}
