/**
 * EduNest Email Notifications
 *
 * - OTP / user-facing emails: Gmail SMTP via Nodemailer
 *   (learn.at.edunest@gmail.com, app password from GMAIL_APP_PASSWORD env)
 * - Owner notification emails: Resend (onboarding@resend.dev → owner only)
 */
import { Resend } from "resend";
import nodemailer from "nodemailer";

const OWNER_EMAIL = "learn.at.edunest@gmail.com";
const GMAIL_USER = "learn.at.edunest@gmail.com";
const FROM_EMAIL_RESEND = "EduNest <onboarding@resend.dev>";
const FROM_EMAIL_GMAIL = `"EduNest" <${GMAIL_USER}>`;

// ─── Resend (owner notifications only) ───────────────────────────────────────

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set — owner notification emails disabled");
    return null;
  }
  return new Resend(apiKey);
}

// ─── Gmail SMTP (user-facing OTP + contact reveal) ───────────────────────────

let _gmailTransport: nodemailer.Transporter | null = null;

function getGmailTransport(): nodemailer.Transporter | null {
  if (_gmailTransport) return _gmailTransport;

  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    console.warn("[Email] GMAIL_APP_PASSWORD not set — Gmail SMTP disabled");
    return null;
  }

  _gmailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: pass.replace(/\s+/g, ""), // strip spaces from app password
    },
  });

  return _gmailTransport;
}

// ─── Owner notification emails (via Resend) ──────────────────────────────────

export async function sendInquiryEmail(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  subject?: string;
  area?: string;
  message: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL_RESEND,
      to: OWNER_EMAIL,
      subject: `📩 New Inquiry from ${data.name} — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #F47920, #e06510); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">📩 New Contact Inquiry</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px;">EduNest — edu-nest.manus.space</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 130px;"><strong>Name</strong></td><td style="padding: 8px 0; color: #333;">${data.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Email</strong></td><td style="padding: 8px 0; color: #333;"><a href="mailto:${data.email}" style="color: #F47920;">${data.email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Phone</strong></td><td style="padding: 8px 0; color: #333;"><a href="tel:${data.phone}" style="color: #F47920;">${data.phone}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Role</strong></td><td style="padding: 8px 0; color: #333;">${data.role}</td></tr>
              ${data.subject ? `<tr><td style="padding: 8px 0; color: #666;"><strong>Subject</strong></td><td style="padding: 8px 0; color: #333;">${data.subject}</td></tr>` : ""}
              ${data.area ? `<tr><td style="padding: 8px 0; color: #666;"><strong>Area</strong></td><td style="padding: 8px 0; color: #333;">${data.area}</td></tr>` : ""}
            </table>
            <div style="margin-top: 16px; padding: 12px; background: white; border-left: 4px solid #F47920; border-radius: 4px;">
              <strong style="color: #666;">Message:</strong>
              <p style="color: #333; margin: 8px 0 0; line-height: 1.6;">${data.message}</p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://edu-nest.manus.space/admin" style="background: #F47920; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                View in Admin Dashboard →
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.warn("[Email] Failed to send inquiry email:", err);
  }
}

export async function sendTutorApplicationEmail(data: {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  subjects: string;
  experience: string;
  area: string;
  mode: string;
  about?: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL_RESEND,
      to: OWNER_EMAIL,
      subject: `🎓 New Tutor Application from ${data.name} — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #6C63FF, #5a52e0); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🎓 New Tutor Application</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px;">EduNest — edu-nest.manus.space</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 130px;"><strong>Name</strong></td><td style="padding: 8px 0; color: #333;">${data.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Email</strong></td><td style="padding: 8px 0; color: #333;"><a href="mailto:${data.email}" style="color: #6C63FF;">${data.email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Phone</strong></td><td style="padding: 8px 0; color: #333;"><a href="tel:${data.phone}" style="color: #6C63FF;">${data.phone}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Qualification</strong></td><td style="padding: 8px 0; color: #333;">${data.qualification}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Subjects</strong></td><td style="padding: 8px 0; color: #333;">${data.subjects}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Experience</strong></td><td style="padding: 8px 0; color: #333;">${data.experience}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Area</strong></td><td style="padding: 8px 0; color: #333;">${data.area}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Mode</strong></td><td style="padding: 8px 0; color: #333;">${data.mode.replace("_", " ")}</td></tr>
            </table>
            ${data.about ? `
            <div style="margin-top: 16px; padding: 12px; background: white; border-left: 4px solid #6C63FF; border-radius: 4px;">
              <strong style="color: #666;">About:</strong>
              <p style="color: #333; margin: 8px 0 0; line-height: 1.6;">${data.about}</p>
            </div>` : ""}
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://edu-nest.manus.space/admin" style="background: #6C63FF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Review Application →
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.warn("[Email] Failed to send tutor application email:", err);
  }
}

export async function sendDemoBookingEmail(data: {
  tutorName: string;
  tutorSubject: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  grade: string;
  subject: string;
  preferredDate: string;
  preferredTime: string;
  mode: string;
  message?: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL_RESEND,
      to: OWNER_EMAIL,
      subject: `📚 Demo Class Booked with ${data.tutorName} — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">📚 New Demo Class Booking</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px;">EduNest — edu-nest.manus.space</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <h3 style="color: #22c55e; margin: 0 0 12px;">📅 Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 130px;"><strong>Tutor</strong></td><td style="padding: 8px 0; color: #333;">${data.tutorName} — ${data.tutorSubject}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Date</strong></td><td style="padding: 8px 0; color: #333; font-weight: bold;">${data.preferredDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Time</strong></td><td style="padding: 8px 0; color: #333; font-weight: bold;">${data.preferredTime}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Mode</strong></td><td style="padding: 8px 0; color: #333;">${data.mode.replace("_", " ")}</td></tr>
            </table>
            <h3 style="color: #F47920; margin: 16px 0 12px;">👤 Student Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 130px;"><strong>Name</strong></td><td style="padding: 8px 0; color: #333;">${data.studentName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Phone</strong></td><td style="padding: 8px 0; color: #333;"><a href="tel:${data.studentPhone}" style="color: #F47920;">${data.studentPhone}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Email</strong></td><td style="padding: 8px 0; color: #333;"><a href="mailto:${data.studentEmail}" style="color: #F47920;">${data.studentEmail}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Grade</strong></td><td style="padding: 8px 0; color: #333;">${data.grade}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Subject</strong></td><td style="padding: 8px 0; color: #333;">${data.subject}</td></tr>
            </table>
            ${data.message ? `
            <div style="margin-top: 16px; padding: 12px; background: white; border-left: 4px solid #22c55e; border-radius: 4px;">
              <strong style="color: #666;">Notes:</strong>
              <p style="color: #333; margin: 8px 0 0;">${data.message}</p>
            </div>` : ""}
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://edu-nest.manus.space/admin" style="background: #22c55e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Confirm Booking →
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.warn("[Email] Failed to send demo booking email:", err);
  }
}

// ─── User-facing emails (via Gmail SMTP) ─────────────────────────────────────

/**
 * Send OTP verification code to user's email address.
 * Uses Gmail SMTP so it can reach ANY email address (not just owner).
 */
export async function sendOtpEmail(data: {
  toEmail: string;
  toName: string;
  phone: string;
  code: string;
  expiresMinutes: number;
}): Promise<void> {
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — OTP email not sent. Code:", data.code);
    return;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: data.toEmail,
      subject: `${data.code} — Your EduNest Phone Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #F47920, #e06510); padding: 24px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold;">Phone Verification</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">EduNest — Best Home Tuition &amp; Tutors</p>
          </div>
          <div style="background: #f9f9f9; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee; text-align: center;">
            <p style="color: #555; font-size: 15px; margin: 0 0 20px;">Hi <strong>${data.toName}</strong>,</p>
            <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
              Use the code below to verify your phone number <strong>${data.phone}</strong> on EduNest.
            </p>
            <div style="display: inline-block; background: #fff; border: 2px solid #F47920; border-radius: 12px; padding: 18px 40px; margin-bottom: 24px;">
              <span style="font-size: 38px; font-weight: bold; letter-spacing: 10px; color: #F47920; font-family: 'Courier New', monospace;">${data.code}</span>
            </div>
            <p style="color: #888; font-size: 13px; margin: 0 0 8px;">
              This code expires in <strong>${data.expiresMinutes} minutes</strong>.
            </p>
            <p style="color: #aaa; font-size: 12px; margin: 0;">
              If you did not request this, please ignore this email.
            </p>
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #bbb; font-size: 11px; margin: 0;">EduNest — Best Home Tuition &amp; Tutors in Bengaluru</p>
              <a href="https://edu-nest.manus.space" style="color: #F47920; font-size: 11px; text-decoration: none;">edu-nest.manus.space</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[OTP Email] Sent via Gmail SMTP to ${data.toEmail} for phone ${data.phone}`);
  } catch (err) {
    console.warn("[Email] Failed to send OTP email via Gmail SMTP:", err);
    throw err; // re-throw so caller can handle gracefully
  }
}

/**
 * Send contact reveal email to tutor — contains full student/parent details.
 * Sent when both parties confirm they want to proceed after the demo class.
 * Uses Gmail SMTP so it reaches any email address.
 */
export async function sendContactRevealToTutor(data: {
  tutorEmail: string;
  tutorName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentArea: string;
  studentFullAddress?: string;
  studentLat?: number;
  studentLng?: number;
  studentGrade: string;
  studentSubjects: string;
  studentParentName?: string;
}): Promise<void> {
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — contact reveal email to tutor not sent");
    return;
  }
  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: data.tutorEmail,
      subject: `🎉 New Student Match — ${data.studentName} wants to proceed! — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #6C63FF, #5a52e0); padding: 24px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold;">🎉 You Have a New Student Match!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Both you and the student/parent have agreed to proceed.</p>
          </div>
          <div style="background: #f9f9f9; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <p style="color: #555; font-size: 15px; margin: 0 0 20px;">Hi <strong>${data.tutorName}</strong>,</p>
            <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
              Great news! Your demo class was a success. Here are the full contact details of your new student:
            </p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #6C63FF; margin: 0 0 14px; font-size: 16px;">👤 Student / Parent Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 7px 0; color: #666; width: 130px;"><strong>Name</strong></td><td style="padding: 7px 0; color: #333;">${data.studentName}</td></tr>
                ${data.studentParentName ? `<tr><td style="padding: 7px 0; color: #666;"><strong>Parent Name</strong></td><td style="padding: 7px 0; color: #333;">${data.studentParentName}</td></tr>` : ""}
                <tr><td style="padding: 7px 0; color: #666;"><strong>Phone</strong></td><td style="padding: 7px 0; color: #333;"><a href="tel:${data.studentPhone}" style="color: #6C63FF; font-weight: bold; font-size: 16px;">${data.studentPhone}</a></td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Email</strong></td><td style="padding: 7px 0; color: #333;"><a href="mailto:${data.studentEmail}" style="color: #6C63FF;">${data.studentEmail}</a></td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Area</strong></td><td style="padding: 7px 0; color: #333;">${data.studentArea}</td></tr>
                ${data.studentFullAddress ? `<tr><td style="padding: 7px 0; color: #666;"><strong>Address</strong></td><td style="padding: 7px 0; color: #333;">${data.studentFullAddress}</td></tr>` : ""}
                ${(data.studentLat && data.studentLng) || data.studentFullAddress ? `<tr><td style="padding: 7px 0; color: #666;"><strong>Navigate</strong></td><td style="padding: 7px 0;"><a href="https://www.google.com/maps/dir/?api=1&destination=${data.studentLat && data.studentLng ? `${data.studentLat},${data.studentLng}` : encodeURIComponent(data.studentFullAddress ?? data.studentArea)}" target="_blank" style="display:inline-block;background:#4285F4;color:white;padding:7px 14px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;">📍 Open in Google Maps</a></td></tr>` : ""}
                <tr><td style="padding: 7px 0; color: #666;"><strong>Grade</strong></td><td style="padding: 7px 0; color: #333;">${data.studentGrade}</td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Subjects</strong></td><td style="padding: 7px 0; color: #333;">${data.studentSubjects}</td></tr>
              </table>
            </div>
            <p style="color: #888; font-size: 13px; margin: 0 0 20px;">
              Please reach out to the student/parent directly to schedule your first regular class. Congratulations on the match!
            </p>
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #bbb; font-size: 11px; margin: 0;">EduNest — Best Home Tuition &amp; Tutors in Bengaluru</p>
              <a href="https://edu-nest.manus.space" style="color: #6C63FF; font-size: 11px; text-decoration: none;">edu-nest.manus.space</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Contact reveal sent via Gmail SMTP to tutor: ${data.tutorEmail}`);
  } catch (err) {
    console.warn("[Email] Failed to send contact reveal to tutor:", err);
  }
}

/**
 * Send contact reveal email to student/parent — contains full tutor details.
 * Sent when both parties confirm they want to proceed after the demo class.
 * Uses Gmail SMTP so it reaches any email address.
 */
export async function sendContactRevealToStudent(data: {
  studentEmail: string;
  studentName: string;
  tutorName: string;
  tutorEmail: string;
  tutorPhone: string;
  tutorQualification: string;
  tutorSubjects: string;
  tutorArea: string;
  tutorMode: string;
  tutorBio?: string;
}): Promise<void> {
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — contact reveal email to student not sent");
    return;
  }
  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: data.studentEmail,
      subject: `🎉 Your Tutor Match — ${data.tutorName} is ready to teach! — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #F47920, #e06510); padding: 24px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold;">🎉 Your Tutor Match is Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Both you and your tutor have agreed to proceed.</p>
          </div>
          <div style="background: #f9f9f9; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <p style="color: #555; font-size: 15px; margin: 0 0 20px;">Hi <strong>${data.studentName}</strong>,</p>
            <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
              Wonderful news! Your demo class went well and your tutor is ready to start regular sessions. Here are their full contact details:
            </p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #F47920; margin: 0 0 14px; font-size: 16px;">🎓 Tutor Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 7px 0; color: #666; width: 130px;"><strong>Name</strong></td><td style="padding: 7px 0; color: #333;">${data.tutorName}</td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Phone</strong></td><td style="padding: 7px 0; color: #333;"><a href="tel:${data.tutorPhone}" style="color: #F47920; font-weight: bold; font-size: 16px;">${data.tutorPhone}</a></td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Email</strong></td><td style="padding: 7px 0; color: #333;"><a href="mailto:${data.tutorEmail}" style="color: #F47920;">${data.tutorEmail}</a></td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Qualification</strong></td><td style="padding: 7px 0; color: #333;">${data.tutorQualification}</td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Subjects</strong></td><td style="padding: 7px 0; color: #333;">${data.tutorSubjects}</td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Area</strong></td><td style="padding: 7px 0; color: #333;">${data.tutorArea}</td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Mode</strong></td><td style="padding: 7px 0; color: #333; text-transform: capitalize;">${data.tutorMode.replace("_", " ")}</td></tr>
              </table>
              ${data.tutorBio ? `
              <div style="margin-top: 12px; padding: 10px; background: #fef9f5; border-left: 3px solid #F47920; border-radius: 4px;">
                <strong style="color: #666; font-size: 12px;">About the Tutor:</strong>
                <p style="color: #555; margin: 6px 0 0; font-size: 13px; line-height: 1.5;">${data.tutorBio}</p>
              </div>` : ""}
            </div>
            <p style="color: #888; font-size: 13px; margin: 0 0 20px;">
              Please contact your tutor directly to schedule your first regular class. Best of luck with your learning journey!
            </p>
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #bbb; font-size: 11px; margin: 0;">EduNest — Best Home Tuition &amp; Tutors in Bengaluru</p>
              <a href="https://edu-nest.manus.space" style="color: #F47920; font-size: 11px; text-decoration: none;">edu-nest.manus.space</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Contact reveal sent via Gmail SMTP to student: ${data.studentEmail}`);
  } catch (err) {
    console.warn("[Email] Failed to send contact reveal to student:", err);
  }
}
