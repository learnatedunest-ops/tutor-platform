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
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — inquiry email not sent");
    return;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: OWNER_EMAIL,
      subject: `📩 New Inquiry from ${data.name} — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #F47920, #e06510); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">📩 New Contact Inquiry</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px;">EduNest — edunest.courses</p>
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
              <a href="https://edunest.courses/admin" style="background: #F47920; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                View in Admin Dashboard →
              </a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Inquiry email sent via Gmail SMTP to owner`);
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
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — tutor application email not sent");
    return;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: OWNER_EMAIL,
      subject: `🎓 New Tutor Application from ${data.name} — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #6C63FF, #5a52e0); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🎓 New Tutor Application</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px;">EduNest — edunest.courses</p>
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
              <a href="https://edunest.courses/admin" style="background: #6C63FF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Review Application →
              </a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Tutor application email sent via Gmail SMTP to owner`);
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
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — demo booking email not sent");
    return;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: OWNER_EMAIL,
      subject: `📚 Demo Class Booked with ${data.tutorName} — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">📚 New Demo Class Booking</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px;">EduNest — edunest.courses</p>
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
              <a href="https://edunest.courses/admin" style="background: #22c55e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Confirm Booking →
              </a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Demo booking email sent via Gmail SMTP to owner`);
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
              <a href="https://edunest.courses" style="color: #F47920; font-size: 11px; text-decoration: none;">edunest.courses</a>
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
                ${data.studentFullAddress ? `<tr><td style="padding: 7px 0; color: #666;"><strong>Navigate</strong></td><td style="padding: 7px 0;"><a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.studentFullAddress)}" target="_blank" style="display:inline-block;background:#4285F4;color:white;padding:7px 14px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;">📍 Open in Google Maps</a></td></tr>` : ""}
                <tr><td style="padding: 7px 0; color: #666;"><strong>Grade</strong></td><td style="padding: 7px 0; color: #333;">${data.studentGrade}</td></tr>
                <tr><td style="padding: 7px 0; color: #666;"><strong>Subjects</strong></td><td style="padding: 7px 0; color: #333;">${data.studentSubjects}</td></tr>
              </table>
            </div>
            <p style="color: #888; font-size: 13px; margin: 0 0 20px;">
              Please reach out to the student/parent directly to schedule your first regular class. Congratulations on the match!
            </p>
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #bbb; font-size: 11px; margin: 0;">EduNest — Best Home Tuition &amp; Tutors in Bengaluru</p>
              <a href="https://edunest.courses" style="color: #6C63FF; font-size: 11px; text-decoration: none;">edunest.courses</a>
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
              <a href="https://edunest.courses" style="color: #F47920; font-size: 11px; text-decoration: none;">edunest.courses</a>
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

/**
 * Notify parent/student that the tutor has uploaded the session sheet
 * and they should now pay EduNest via UPI.
 */
export async function sendParentPayNowEmail(data: {
  parentEmail: string;
  parentName: string;
  tutorName: string;
  amount?: string | null;
  portalUrl?: string;
}): Promise<void> {
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — parent pay-now email not sent");
    return;
  }
  const upiId = "8618635627@yescred";
  const portalUrl = data.portalUrl ?? "https://edunest.courses/student-portal";
  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: data.parentEmail,
      subject: `📋 Session Sheet Ready — Please Pay Tutor Fee | EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #F47920, #e06510); padding: 24px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold;">Session Sheet Ready!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">EduNest — Best Home Tuition &amp; Tutors</p>
          </div>
          <div style="background: #f9f9f9; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <p style="color: #555; font-size: 15px; margin: 0 0 16px;">Hi <strong>${data.parentName}</strong>,</p>
            <p style="color: #555; font-size: 15px; margin: 0 0 20px;">
              Your tutor <strong>${data.tutorName}</strong> has uploaded the completed session sheet.
              Please pay the tutor fee to EduNest via UPI to confirm your classes.
            </p>
            <div style="background: #fff; border: 2px solid #F47920; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Pay to EduNest UPI ID</p>
              <p style="font-size: 22px; font-weight: bold; color: #F47920; letter-spacing: 1px; margin: 0 0 4px;">${upiId}</p>
              ${data.amount ? `<p style="color: #333; font-size: 16px; font-weight: bold; margin: 8px 0 0;">Amount: ₹${data.amount}</p>` : ""}
              <p style="color: #888; font-size: 12px; margin: 12px 0 0;">
                Open any UPI app (GPay, PhonePe, Paytm, BHIM) and pay to the above UPI ID.
              </p>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${portalUrl}" style="background: #F47920; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                Go to My Classes →
              </a>
            </div>
            <p style="color: #888; font-size: 13px; margin: 0;">
              After paying, click <strong>"I've Paid — Notify EduNest"</strong> in your portal so our team can verify and confirm.
            </p>
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #bbb; font-size: 11px; margin: 0;">EduNest — Best Home Tuition &amp; Tutors in Bengaluru</p>
              <a href="https://edunest.courses" style="color: #F47920; font-size: 11px; text-decoration: none;">edunest.courses</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Pay-now email sent to parent: ${data.parentEmail}`);
  } catch (err) {
    console.warn("[Email] Failed to send parent pay-now email:", err);
  }
}

/**
 * Notify tutor that EduNest has approved payment and transferred the fee.
 * Sent when admin clicks "Approve Payment" in the admin panel.
 */
export async function sendTutorFeePaidEmail(data: {
  tutorEmail: string;
  tutorName: string;
  studentName: string;
  upiId?: string | null;
  amount?: string | null;
}): Promise<void> {
  const transport = getGmailTransport();
  if (!transport) {
    console.warn("[Email] Gmail SMTP not configured — tutor fee-paid email not sent");
    return;
  }
  try {
    await transport.sendMail({
      from: FROM_EMAIL_GMAIL,
      to: data.tutorEmail,
      subject: `💰 Your Fee Has Been Processed — EduNest`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <div style="background: linear-gradient(135deg, #16A34A, #15803d); padding: 24px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: bold;">Fee Processed! 🎉</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">EduNest — Best Home Tuition &amp; Tutors</p>
          </div>
          <div style="background: #f9f9f9; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <p style="color: #555; font-size: 15px; margin: 0 0 16px;">Hi <strong>${data.tutorName}</strong>,</p>
            <p style="color: #555; font-size: 15px; margin: 0 0 20px;">
              Great news! EduNest has processed your fee for the session with <strong>${data.studentName}</strong>.
            </p>
            ${data.upiId ? `
            <div style="background: #fff; border: 2px solid #16A34A; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Payment sent to your UPI ID</p>
              <p style="font-size: 20px; font-weight: bold; color: #16A34A; letter-spacing: 1px; margin: 0;">${data.upiId}</p>
              ${data.amount ? `<p style="color: #333; font-size: 16px; font-weight: bold; margin: 8px 0 0;">Amount: ₹${data.amount}</p>` : ""}
            </div>` : `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #166534; font-size: 14px; margin: 0;">
                ✅ Your payment has been approved. Please check your UPI app for the transfer.
                If you haven't registered a UPI ID yet, please update it in your tutor profile.
              </p>
            </div>`}
            <p style="color: #888; font-size: 13px; margin: 0;">
              Thank you for being a valued tutor on EduNest. Keep up the great work!
            </p>
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #bbb; font-size: 11px; margin: 0;">EduNest — Best Home Tuition &amp; Tutors in Bengaluru</p>
              <a href="https://edunest.courses" style="color: #F47920; font-size: 11px; text-decoration: none;">edunest.courses</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Fee-paid email sent to tutor: ${data.tutorEmail}`);
  } catch (err) {
    console.warn("[Email] Failed to send tutor fee-paid email:", err);
  }
}

/**
 * Send "We found a student for you!" email to a tutor from Smart Pairs.
 */
export async function sendSmartPairEmailToTutor(data: {
  tutorEmail: string;
  tutorName: string;
  studentName: string;
  studentGrade: string;
  studentSubjects: string;
  studentArea: string;
  distanceKm: number;
}): Promise<void> {
  const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 26px; font-weight: 700;">🎉 Great News, ${data.tutorName}!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">EduNest has found a student for you</p>
      </div>
      <div style="padding: 32px 40px;">
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>${data.tutorName}</strong>,</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">We found a student who is looking for a tutor matching your profile. Here are the details:</p>
        <div style="background: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px; padding: 20px 24px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #92400e; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Student Details</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Name:</strong> ${data.studentName}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Grade:</strong> ${data.studentGrade}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Subjects:</strong> ${data.studentSubjects}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Area:</strong> ${data.studentArea}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Distance:</strong> ~${data.distanceKm} km from you</p>
        </div>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Our team will be in touch shortly to connect you. If you have any questions, feel free to reply to this email or call us at <strong>+91-8618635627</strong>.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://edunest.courses" style="display: inline-block; background: #f97316; color: #fff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">View Your Dashboard →</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 24px;">EduNest · Bengaluru · <a href="https://edunest.courses" style="color: #f97316;">edunest.courses</a></p>
      </div>
    </div>
  `;
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL_RESEND,
      to: data.tutorEmail,
      subject: `🎉 We found a student for you, ${data.tutorName}! — EduNest`,
      html,
    });
  } catch (err) {
    console.warn('[Email] Failed to send smart pair tutor email:', err);
  }
}

/**
 * Send "We found a tutor for you!" email to a student/parent from Smart Pairs.
 */
export async function sendSmartPairEmailToStudent(data: {
  studentEmail: string;
  studentName: string;
  tutorName: string;
  tutorSubjects: string;
  tutorArea: string;
  tutorQualification: string;
  distanceKm: number;
}): Promise<void> {
  const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 26px; font-weight: 700;">🎉 Great News, ${data.studentName}!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">EduNest has found a tutor for you</p>
      </div>
      <div style="padding: 32px 40px;">
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>${data.studentName}</strong>,</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">We found a verified tutor near you who matches your requirements. Here are the details:</p>
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px 24px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #1e40af; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Tutor Details</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Name:</strong> ${data.tutorName}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Subjects:</strong> ${data.tutorSubjects}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Area:</strong> ${data.tutorArea}</p>
          ${data.tutorQualification ? `<p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Qualification:</strong> ${data.tutorQualification}</p>` : ''}
          <p style="margin: 4px 0; color: #374151; font-size: 15px;"><strong>Distance:</strong> ~${data.distanceKm} km from you</p>
        </div>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Our team will be in touch shortly to schedule a free demo class. If you have any questions, feel free to reply to this email or call us at <strong>+91-8618635627</strong>.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://edunest.courses" style="display: inline-block; background: #f97316; color: #fff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">View Your Dashboard →</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 24px;">EduNest · Bengaluru · <a href="https://edunest.courses" style="color: #f97316;">edunest.courses</a></p>
      </div>
    </div>
  `;
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL_RESEND,
      to: data.studentEmail,
      subject: `🎉 We found a tutor for you, ${data.studentName}! — EduNest`,
      html,
    });
  } catch (err) {
    console.warn('[Email] Failed to send smart pair student email:', err);
  }
}

/** Admin: notify parent/student that payment has been confirmed and processed */
export async function sendPaymentConfirmedToParentEmail(data: {
  parentEmail: string;
  parentName: string;
  tutorName: string;
}) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; padding: 32px 0;">
      <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #f97316 100%); padding: 32px 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 26px; font-weight: 800; margin: 0;">&#x2705; Payment Confirmed</h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">EduNest &mdash; Your Tuition Partner</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>${data.parentName}</strong>,</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">Great news! Your payment for tuition sessions with <strong>${data.tutorName}</strong> has been confirmed and processed by EduNest. Thank you for your trust!</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">If you have any questions, feel free to reply to this email or call us at <strong>+91-8618635627</strong>.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://edunest.courses" style="display: inline-block; background: #f97316; color: #fff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">View Your Dashboard &rarr;</a>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 24px;">EduNest &middot; Bengaluru &middot; <a href="https://edunest.courses" style="color: #f97316;">edunest.courses</a></p>
        </div>
      </div>
    </div>
  `;
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL_RESEND,
      to: data.parentEmail,
      subject: `Payment Confirmed — EduNest`,
      html,
    });
  } catch (err) {
    console.warn('[Email] Failed to send payment confirmed to parent email:', err);
  }
}
