import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { sendDemoBookingEmail, sendInquiryEmail, sendTutorApplicationEmail } from "./email";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createDemoBooking,
  createInquiry,
  createTutor,
  createTutorApplication,
  deleteTutor,
  getAllDemoBookings,
  getAllInquiries,
  getAllTutors,
  getAllTutorsAdmin,
  getDemoBookingsByEmail,
  getTutorById,
  getAllTutorApplications,
  updateDemoBookingStatus,
  updateInquiryStatus,
  updateTutor,
  updateTutorApplicationStatus,
} from "./db";
import { z } from "zod";

// ─── Validation schemas ────────────────────────────────────────────────────────

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(128),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number").max(20),
  role: z.enum(["student", "parent", "tutor", "institution"]),
  subject: z.string().max(128).optional(),
  area: z.string().max(128).optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const tutorApplicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(128),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number").max(20),
  qualification: z.string().min(2).max(256),
  subjects: z.string().min(2).max(512),
  experience: z.string().min(1).max(64),
  area: z.string().min(2).max(128),
  mode: z.enum(["home_tuition", "online", "both"]),
  about: z.string().max(2000).optional(),
});

const demoBookingSchema = z.object({
  tutorName: z.string().min(2).max(128),
  tutorSubject: z.string().min(2).max(128),
  studentName: z.string().min(2).max(128),
  studentEmail: z.string().email(),
  studentPhone: z.string().min(10).max(20),
  grade: z.string().min(1).max(64),
  subject: z.string().min(2).max(128),
  preferredDate: z.string().min(1).max(32),
  preferredTime: z.string().min(1).max(32),
  mode: z.enum(["home_tuition", "online"]),
  message: z.string().max(1000).optional(),
});

const tutorCreateSchema = z.object({
  name: z.string().min(2).max(128),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
  photo: z.string().url().optional(),
  subjects: z.string().min(2).max(512),
  qualification: z.string().min(2).max(256),
  experience: z.string().min(1).max(64),
  area: z.string().min(2).max(128),
  areas: z.string().max(512).optional(),
  mode: z.enum(["home_tuition", "online", "both"]).default("both"),
  rating: z.string().max(8).optional(),
  reviewCount: z.number().int().min(0).optional(),
  bio: z.string().max(2000).optional(),
  languages: z.string().max(256).optional(),
  boards: z.string().max(256).optional(),
  isVerified: z.enum(["yes", "no"]).default("yes"),
  isActive: z.enum(["yes", "no"]).default("yes"),
});

// ─── Router ────────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Contact / Inquiry ──────────────────────────────────────────────────────
  inquiry: router({
    submit: publicProcedure
      .input(inquirySchema)
      .mutation(async ({ input }) => {
        await createInquiry(input);
        await notifyOwner({
          title: `📩 New Inquiry from ${input.name}`,
          content: `**Name:** ${input.name}\n**Email:** ${input.email}\n**Phone:** ${input.phone}\n**Role:** ${input.role}\n**Subject:** ${input.subject ?? "—"}\n**Area:** ${input.area ?? "—"}\n\n**Message:**\n${input.message}\n\nView all inquiries at https://edu-nest.manus.space/admin`,
        }).catch(() => {/* non-blocking */});
        await sendInquiryEmail(input).catch((err) => console.error("[Email] Failed to send inquiry email:", err));
        return { success: true };
      }),

    list: adminProcedure.query(async () => getAllInquiries()),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "resolved"]) }))
      .mutation(async ({ input }) => {
        await updateInquiryStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ─── Tutor Applications ─────────────────────────────────────────────────────
  tutorApplication: router({
    submit: publicProcedure
      .input(tutorApplicationSchema)
      .mutation(async ({ input }) => {
        await createTutorApplication(input);
        await notifyOwner({
          title: `🎓 New Tutor Application from ${input.name}`,
          content: `**Name:** ${input.name}\n**Email:** ${input.email}\n**Phone:** ${input.phone}\n**Qualification:** ${input.qualification}\n**Subjects:** ${input.subjects}\n**Experience:** ${input.experience}\n**Area:** ${input.area}\n**Mode:** ${input.mode.replace("_", " ")}\n\n**About:**\n${input.about ?? "—"}\n\nView all applications at https://edu-nest.manus.space/admin`,
        }).catch(() => {/* non-blocking */});
        await sendTutorApplicationEmail(input).catch((err) => console.error("[Email] Failed to send tutor application email:", err));
        return { success: true };
      }),

    list: adminProcedure.query(async () => getAllTutorApplications()),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "rejected"]) }))
      .mutation(async ({ input }) => {
        await updateTutorApplicationStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ─── Demo Bookings ──────────────────────────────────────────────────────────
  demoBooking: router({
    submit: publicProcedure
      .input(demoBookingSchema)
      .mutation(async ({ input }) => {
        await createDemoBooking(input);
        await notifyOwner({
          title: `📚 Demo Class Booked with ${input.tutorName}`,
          content: `**Student:** ${input.studentName}\n**Email:** ${input.studentEmail}\n**Phone:** ${input.studentPhone}\n**Grade:** ${input.grade}\n**Subject:** ${input.subject}\n**Tutor:** ${input.tutorName} (${input.tutorSubject})\n**Date:** ${input.preferredDate}\n**Time:** ${input.preferredTime}\n**Mode:** ${input.mode.replace("_", " ")}\n\n**Message:** ${input.message ?? "—"}\n\nManage at https://edu-nest.manus.space/admin`,
        }).catch((err) => console.error("[Notify] Failed to send owner notification:", err));
        await sendDemoBookingEmail(input).catch((err) => console.error("[Email] Failed to send demo booking email:", err));
        return { success: true };
      }),

    list: adminProcedure.query(async () => getAllDemoBookings()),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "completed", "cancelled"]) }))
      .mutation(async ({ input }) => {
        await updateDemoBookingStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ─── Tutors (public read, admin write) ──────────────────────────────────────
  tutor: router({
    list: publicProcedure.query(async () => getAllTutors()),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const t = await getTutorById(input.id);
        if (!t) throw new Error("Tutor not found");
        return t;
      }),

    create: adminProcedure
      .input(tutorCreateSchema)
      .mutation(async ({ input }) => {
        const t = await createTutor(input);
        return t;
      }),

    update: adminProcedure
      .input(tutorCreateSchema.partial().extend({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTutor(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTutor(input.id);
        return { success: true };
      }),

    listAdmin: adminProcedure.query(async () => getAllTutorsAdmin()),
  }),

  // ─── My Bookings (logged-in students/parents) ───────────────────────────────
  myBookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) return [];
      return getDemoBookingsByEmail(ctx.user.email);
    }),
  }),
});

export type AppRouter = typeof appRouter;
