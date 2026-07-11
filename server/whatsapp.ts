/**
 * WhatsApp Alert Helper
 * Sends email notifications to the admin (learn.at.edunest@gmail.com)
 * Each alert includes clickable wa.me deep links so admin can directly message the parent/tutor.
 *
 * Format: https://wa.me/<countrycode><number>?text=<urlencoded message>
 * Indian numbers: +91XXXXXXXXXX → 91XXXXXXXXXX
 */

import { Resend } from "resend";
import { notifyOwner } from "./_core/notification";

const OWNER_EMAIL = "learn.at.edunest@gmail.com";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[WhatsApp Alert] RESEND_API_KEY not set — admin WhatsApp alerts disabled");
    return null;
  }
  return new Resend(apiKey);
}

async function sendAdminAlert(subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: "EduNest <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("[WhatsApp Alert] Failed to send admin alert email:", err);
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

// ─── Alert: Demo class scheduled ────────────────────────────────────────────

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
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#ea580c">📅 New Demo Class Scheduled — EduNest Alert</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;font-weight:bold;color:#555">Student</td><td style="padding:8px">${studentName}</td></tr>
        <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Subject</td><td style="padding:8px">${subject}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555">Demo Date</td><td style="padding:8px">${demoDate}</td></tr>
        <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Parent</td><td style="padding:8px">${parentName} — ${parentPhone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555">Tutor</td><td style="padding:8px">${tutorName} — ${tutorPhone}</td></tr>
      </table>
      <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
        <a href="${waLink(parentPhone, parentWaMsg)}" style="background:#25D366;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp Parent (${parentPhone})
        </a>
        <a href="${waLink(tutorPhone, tutorWaMsg)}" style="background:#128C7E;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp Tutor (${tutorPhone})
        </a>
      </div>
    </div>
  `;

  await sendAdminAlert(`📅 Demo Scheduled: ${studentName} ↔ ${tutorName} on ${demoDate}`, html);
  // Also send push notification to owner with wa.me links
  await notifyOwner({
    title: `📅 Demo Scheduled: ${studentName} ↔ ${tutorName}`,
    content: `**Date:** ${demoDate}\n**Parent:** ${parentName} — [WhatsApp](${waLink(parentPhone, parentWaMsg)})\n**Tutor:** ${tutorName} — [WhatsApp](${waLink(tutorPhone, tutorWaMsg)})`,
  }).catch(() => {});
}

// ─── Alert: Tutor uploaded session sheet ────────────────────────────────────

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
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#ea580c">📋 Session Sheet Uploaded — EduNest Alert</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;font-weight:bold;color:#555">Student</td><td style="padding:8px">${studentName}</td></tr>
        <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Tutor</td><td style="padding:8px">${tutorName} — ${tutorPhone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555">Parent</td><td style="padding:8px">${parentName} — ${parentPhone}</td></tr>
        ${sheetUrl ? `<tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Sheet</td><td style="padding:8px"><a href="${sheetUrl}" style="color:#ea580c">View Sheet</a></td></tr>` : ""}
      </table>
      <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
        <a href="${waLink(parentPhone, parentWaMsg)}" style="background:#25D366;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp Parent (${parentPhone})
        </a>
        <a href="${waLink(tutorPhone, tutorWaMsg)}" style="background:#128C7E;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp Tutor (${tutorPhone})
        </a>
      </div>
    </div>
  `;

  await sendAdminAlert(`📋 Sheet Uploaded: ${tutorName} for ${studentName} — Payment Pending`, html);
  await notifyOwner({
    title: `📋 Sheet Uploaded: ${tutorName} for ${studentName}`,
    content: `**Tutor:** ${tutorName} — [WhatsApp](${waLink(tutorPhone, tutorWaMsg)})\n**Parent:** ${parentName} — [WhatsApp](${waLink(parentPhone, parentWaMsg)})${sheetUrl ? `\n[View Sheet](${sheetUrl})` : ""}`,
  }).catch(() => {});
}

// ─── Alert: Parent marked payment ───────────────────────────────────────────

export async function notifyAdminParentPaid(params: {
  parentName: string;
  parentPhone: string;
  tutorName: string;
  tutorPhone: string;
  studentName: string;
  amount?: string;
}): Promise<void> {
  const { parentName, parentPhone, tutorName, tutorPhone, studentName, amount } = params;

  const parentWaMsg = `Hi ${parentName}! 👋 EduNest here. We've received your payment notification for ${studentName}'s tuition. Our team is reviewing it and will confirm shortly. Thank you!`;
  const tutorWaMsg = `Hi ${tutorName}! 👋 EduNest here. The parent has submitted payment for ${studentName}'s tuition. We're reviewing it and will process your fee soon. Thank you for your patience!`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#ea580c">💰 Parent Payment Received — EduNest Alert</h2>
      <p style="background:#fef9c3;padding:12px;border-radius:8px;border-left:4px solid #eab308">
        ⚠️ <strong>Action Required:</strong> Please verify the payment on your UPI app (8618635627@yescred) and approve it in the Admin Panel → Session Payments.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;font-weight:bold;color:#555">Student</td><td style="padding:8px">${studentName}</td></tr>
        <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Parent</td><td style="padding:8px">${parentName} — ${parentPhone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555">Tutor</td><td style="padding:8px">${tutorName} — ${tutorPhone}</td></tr>
        ${amount ? `<tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Amount</td><td style="padding:8px;font-weight:bold;color:#16a34a">₹${amount}</td></tr>` : ""}
      </table>
      <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
        <a href="${waLink(parentPhone, parentWaMsg)}" style="background:#25D366;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp Parent (${parentPhone})
        </a>
        <a href="${waLink(tutorPhone, tutorWaMsg)}" style="background:#128C7E;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp Tutor (${tutorPhone})
        </a>
      </div>
    </div>
  `;

  await sendAdminAlert(`💰 Payment Received: ${parentName} for ${studentName} — Awaiting Your Approval`, html);
  await notifyOwner({
    title: `💰 Payment Received: ${parentName} for ${studentName}`,
    content: `**Action Required:** Verify UPI payment on 8618635627@yescred then approve in Admin → Session Payments.\n**Parent:** ${parentName} — [WhatsApp](${waLink(parentPhone, parentWaMsg)})\n**Tutor:** ${tutorName} — [WhatsApp](${waLink(tutorPhone, tutorWaMsg)})`,
  }).catch(() => {});
}

// ─── Alert: Cancellation requested ──────────────────────────────────────────

export async function notifyAdminCancellationRequested(params: {
  requestedBy: "tutor" | "parent";
  requesterName: string;
  requesterPhone: string;
  otherPartyName: string;
  otherPartyPhone: string;
  studentName: string;
  reason?: string;
}): Promise<void> {
  const { requestedBy, requesterName, requesterPhone, otherPartyName, otherPartyPhone, studentName, reason } = params;

  const requesterWaMsg = `Hi ${requesterName}! 👋 EduNest here. We've received your cancellation request for ${studentName}'s class. Our team is reviewing it and will get back to you within 24 hours. Thank you.`;
  const otherWaMsg = `Hi ${otherPartyName}! 👋 EduNest here. A cancellation request has been submitted for ${studentName}'s class. Our team is reviewing it. We'll keep you informed. Thank you.`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#dc2626">🚫 Class Cancellation Requested — EduNest Alert</h2>
      <p style="background:#fef2f2;padding:12px;border-radius:8px;border-left:4px solid #dc2626">
        ⚠️ <strong>Action Required:</strong> Please review and approve/reject this cancellation in the Admin Panel → Cancellation Requests.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;font-weight:bold;color:#555">Student</td><td style="padding:8px">${studentName}</td></tr>
        <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Requested By</td><td style="padding:8px;text-transform:capitalize">${requestedBy}: ${requesterName} — ${requesterPhone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555">Other Party</td><td style="padding:8px">${otherPartyName} — ${otherPartyPhone}</td></tr>
        ${reason ? `<tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold;color:#555">Reason</td><td style="padding:8px">${reason}</td></tr>` : ""}
      </table>
      <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
        <a href="${waLink(requesterPhone, requesterWaMsg)}" style="background:#25D366;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp ${requestedBy === "parent" ? "Parent" : "Tutor"} (${requesterPhone})
        </a>
        <a href="${waLink(otherPartyPhone, otherWaMsg)}" style="background:#128C7E;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 WhatsApp ${requestedBy === "parent" ? "Tutor" : "Parent"} (${otherPartyPhone})
        </a>
      </div>
    </div>
  `;

  await sendAdminAlert(`🚫 Cancellation Request: ${requesterName} (${requestedBy}) for ${studentName}'s class`, html);
  await notifyOwner({
    title: `🚫 Cancellation Request: ${studentName}'s class`,
    content: `**Requested by ${requestedBy}:** ${requesterName} — [WhatsApp](${waLink(requesterPhone, requesterWaMsg)})\n**Other party:** ${otherPartyName} — [WhatsApp](${waLink(otherPartyPhone, otherWaMsg)})${reason ? `\n**Reason:** ${reason}` : ""}`,
  }).catch(() => {});
}
