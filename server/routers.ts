import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { sendContactRevealToStudent, sendContactRevealToTutor, sendDemoBookingEmail, sendInquiryEmail, sendOtpEmail, sendTutorApplicationEmail } from "./email";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createDemoBooking,
  createInquiry,
  createReferral,
  createStudentRequirement,
  createTutor,
  createTutorApplication,
  deleteTutor,
  getAllDemoBookings,
  getAllInquiries,
  getAllReferrals,
  getAllStudentRequirements,
  getAllTutors,
  getAllTutorsAdmin,
  getDemoBookingsByEmail,
  getTutorById,
  getAllTutorApplications,
  updateDemoBookingStatus,
  updateInquiryStatus,
  updateReferralStatus,
  updateStudentRequirementStatus,
  updateTutor,
  updateTutorApplicationStatus,
  upsertTutorProfile,
  getTutorProfileByUserId,
  getAllTutorProfiles,
  updateTutorProfileStatus,
  upsertStudentProfile,
  getStudentProfileByUserId,
  getAllStudentProfiles,
  getActiveStudentProfiles,
  getApprovedTutorProfiles,
  setUserRole,
  getUserById,
  createTutorInterest,
  getAllTutorInterests,
  getTutorInterestsByTutor,
  updateTutorInterestStatus,
  createStudentDemoInterest,
  getStudentDemoInterestsByStudent,
  getStudentDemoInterestByPair,
  getAllStudentDemoInterests,
  updateStudentDemoInterestStatus,
  // OTP
  createOtp,
  getLatestOtp,
  markOtpVerified,
  markTutorPhoneVerified,
  markStudentPhoneVerified,
  // Demo slots
  createDemoSlot,
  getDemoSlotByInterestId,
  getDemoSlotsByTutor,
  getDemoSlotsByStudent,
  updateDemoSlotSchedule,
  updateDemoSlotStatus,
  getAllDemoSlots,
  // Proceed intent & confirmed matches
  setDemoSlotProceedIntent,
  getDemoSlotById,
  getConfirmedMatchBySlotId,
  createConfirmedMatch,
  getAllConfirmedMatches,
  // Session logs
  getOrCreateSessionLog,
  getSessionLogByMatchId,
  getSessionLogById,
  updateSessionLogSheet,
  updateSessionLogPaymentStatus,
  getAllSessionLogs,
  getSessionLogsByTutor,
  getSessionLogsByStudent,
} from "./db";
import { z } from "zod";

// ─── Validation schemas ────────────────────────────────────────────────────────

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(128).trim(),
  email: z.string().email("Please enter a valid email").max(256).trim().toLowerCase(),
  phone: z.string().min(10, "Please enter a valid phone number").max(20).trim(),
  role: z.enum(["student", "parent", "tutor", "institution"]),
  subject: z.string().max(128).trim().optional(),
  area: z.string().max(128).trim().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000).trim(),
});

const tutorApplicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(128).trim(),
  email: z.string().email("Please enter a valid email").max(256).trim().toLowerCase(),
  phone: z.string().min(10, "Please enter a valid phone number").max(20).trim(),
  qualification: z.string().min(2).max(256).trim(),
  subjects: z.string().min(2).max(512).trim(),
  experience: z.string().min(1).max(64).trim(),
  area: z.string().min(2).max(128).trim(),
  mode: z.enum(["home_tuition", "online", "both"]),
  about: z.string().max(2000).trim().optional(),
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

    // Returns the current user's userRole (tutor | student | null)
    getRole: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return { userRole: user?.userRole ?? null };
    }),

    // Sets the user's role (can only be set once; subsequent calls are no-ops unless forced)
    setRole: protectedProcedure
      .input(z.object({ userRole: z.enum(["tutor", "student"]) }))
      .mutation(async ({ ctx, input }) => {
        await setUserRole(ctx.user.id, input.userRole);
        return { success: true, userRole: input.userRole };
      }),

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

  // ─── Student Requirements ─────────────────────────────────────────────────────
  studentRequirement: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2).max(128),
        email: z.string().email(),
        phone: z.string().min(10).max(20),
        role: z.enum(["student", "parent"]),
        studentName: z.string().max(128).optional(),
        grade: z.string().min(1).max(64),
        board: z.enum(["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"]),
        subjects: z.string().min(2).max(512),
        area: z.string().min(2).max(128),
        mode: z.enum(["home_tuition", "online", "both"]),
        budget: z.string().max(64).optional(),
        preferredTime: z.string().max(128).optional(),
        additionalNotes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        await createStudentRequirement(input);
        await notifyOwner({
          title: `👨‍🎓 New Tutor Requirement from ${input.name}`,
          content: `**Name:** ${input.name}\n**Email:** ${input.email}\n**Phone:** ${input.phone}\n**Role:** ${input.role}\n**Grade:** ${input.grade} (${input.board})\n**Subjects:** ${input.subjects}\n**Area:** ${input.area}\n**Mode:** ${input.mode.replace("_", " ")}\n**Budget:** ${input.budget ?? "—"}\n**Preferred Time:** ${input.preferredTime ?? "—"}\n\n**Notes:** ${input.additionalNotes ?? "—"}\n\nMatch a tutor at https://edu-nest.manus.space/admin`,
        }).catch(() => {/* non-blocking */});
        return { success: true };
      }),

    list: adminProcedure.query(async () => getAllStudentRequirements()),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "matching", "matched", "closed"]),
        matchedTutorId: z.number().optional(),
        matchedTutorName: z.string().optional(),
        matchNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, status, ...matchData } = input;
        await updateStudentRequirementStatus(id, status, matchData);
        return { success: true };
      }),
  }),

  myBookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) return [];
      return getDemoBookingsByEmail(ctx.user.email);
    }),
  }),

  // ─── Tutor Profiles ──────────────────────────────────────────────────────
  tutorProfile: router({
    // Get the logged-in tutor's own profile
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return getTutorProfileByUserId(ctx.user.id);
    }),

    // Create or update the logged-in tutor's profile
    save: protectedProcedure
      .input(z.object({
        name: z.string().min(2).max(128),
        email: z.string().email(),
        phone: z.string().min(10).max(20),
        qualification: z.string().min(2).max(256),
        subjects: z.string().min(2).max(512),
        experience: z.string().min(1).max(64),
        boards: z.string().max(256).optional(),
        languages: z.string().max(256).optional(),
        mode: z.enum(["home_tuition", "online", "both"]),
        bio: z.string().max(2000).optional(),
        education: z.string().max(3000).optional(),
        workExperience: z.string().max(3000).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        fullAddress: z.string().max(1000).optional(),
        area: z.string().max(128).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await upsertTutorProfile(ctx.user.id, {
          ...input,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          status: "pending",
        });
        // Notify Amogha
        await notifyOwner({
          title: `👨‍🏫 New Tutor Profile: ${input.name}`,
          content: `**Name:** ${input.name}\n**Subjects:** ${input.subjects}\n**Experience:** ${input.experience}\n**Mode:** ${input.mode}\n**Location:** ${input.fullAddress ?? input.area ?? 'Not provided'}\n\nReview at https://edu-nest.manus.space/admin`,
        }).catch(() => {});
        return { success: true, profile };
      }),

    // Admin: list all tutor profiles
    listAll: adminProcedure.query(async () => getAllTutorProfiles()),

    // Admin: approve or reject a tutor profile
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await updateTutorProfileStatus(input.id, input.status);
        return { success: true };
      }),

    // Get nearby active student profiles (for approved tutors)
    getNearbyStudents: protectedProcedure
      .input(z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radiusKm: z.number().min(1).max(50).default(10),
      }))
      .query(async ({ ctx, input }) => {
        // Verify tutor is approved
        const myProfile = await getTutorProfileByUserId(ctx.user.id);
        if (!myProfile || myProfile.status !== "approved") return [];
        const students = await getActiveStudentProfiles();
        // Haversine distance filter
        const R = 6371;
        return students
          .filter(s => s.latitude && s.longitude)
          .map(s => {
            const lat1 = input.latitude * Math.PI / 180;
            const lat2 = parseFloat(s.latitude!) * Math.PI / 180;
            const dLat = (parseFloat(s.latitude!) - input.latitude) * Math.PI / 180;
            const dLon = (parseFloat(s.longitude!) - input.longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
            const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return { ...s, distKm: Math.round(distKm * 10) / 10 };
          })
          .filter(s => s.distKm <= input.radiusKm)
          .sort((a, b) => a.distKm - b.distKm);
      }),
  }),

  // ─── Student Profiles ─────────────────────────────────────────────────────
  studentProfile: router({
    // Get the logged-in student/parent's own profile
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return getStudentProfileByUserId(ctx.user.id);
    }),
    // Admin: list all student profiles
    listAll: adminProcedure.query(async () => getAllStudentProfiles()),

    // Create or update the logged-in student/parent's profile
    save: protectedProcedure
      .input(z.object({
        name: z.string().min(2).max(128),
        email: z.string().email(),
        phone: z.string().min(10).max(20),
        role: z.enum(["student", "parent"]),
        studentName: z.string().max(128).optional(),
        grade: z.string().min(1).max(64),
        board: z.enum(["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"]),
        subjects: z.string().min(2).max(512),
        mode: z.enum(["home_tuition", "online", "both"]),
        demoTime: z.string().max(128).optional(),
        regularTime: z.string().max(128).optional(),
        daysPerWeek: z.string().max(128).optional(),
        sessionsPerWeek: z.string().max(32).optional(),
        sessionDuration: z.string().max(64).optional(),
        budget: z.string().max(64).optional(),
        specialRequirements: z.string().max(2000).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        fullAddress: z.string().max(1000).optional(),
        area: z.string().max(128).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await upsertStudentProfile(ctx.user.id, {
          ...input,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          isActive: "yes",
        });
        await notifyOwner({
          title: `🎓 New Student Requirement: ${input.name}`,
          content: `**Name:** ${input.name}\n**Grade:** ${input.grade} (${input.board})\n**Subjects:** ${input.subjects}\n**Mode:** ${input.mode}\n**Location:** ${input.fullAddress ?? input.area ?? 'Not provided'}\n\nReview at https://edu-nest.manus.space/admin`,
        }).catch(() => {});
        return { success: true, profile };
      }),

    // Get nearby approved tutors (for students)
    getNearbyTutors: protectedProcedure
      .input(z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radiusKm: z.number().min(1).max(50).default(10),
      }))
      .query(async ({ input }) => {
        const tutorList = await getApprovedTutorProfiles();
        const R = 6371;
        return tutorList
          .filter(t => t.latitude && t.longitude)
          .map(t => {
            const lat1 = input.latitude * Math.PI / 180;
            const lat2 = parseFloat(t.latitude!) * Math.PI / 180;
            const dLat = (parseFloat(t.latitude!) - input.latitude) * Math.PI / 180;
            const dLon = (parseFloat(t.longitude!) - input.longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
            const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return { ...t, distKm: Math.round(distKm * 10) / 10 };
          })
          .filter(t => t.distKm <= input.radiusKm)
          .sort((a, b) => a.distKm - b.distKm);
      }),
  }),

  // --- Tutor Interests ---
  tutorInterest: router({
    // Tutor expresses interest in a student requirement
    express: protectedProcedure
      .input(z.object({
        studentProfileId: z.number(),
        message: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const myProfile = await getTutorProfileByUserId(ctx.user.id);
        if (!myProfile || myProfile.status !== "approved") {
          throw new Error("Only approved tutors can express interest.");
        }
        const interest = await createTutorInterest(myProfile.id, input.studentProfileId, input.message);
        await notifyOwner({
          title: `New Tutor Interest: ${myProfile.name}`,
          content: `**Tutor:** ${myProfile.name} (${myProfile.phone})\n**Student Profile ID:** ${input.studentProfileId}\n**Message:** ${input.message ?? 'No message'}\n\nReview at https://edu-nest.manus.space/admin`,
        }).catch(() => {});
        return { success: true, interest };
      }),

    // Get all interests expressed by the logged-in tutor
    getMyInterests: protectedProcedure.query(async ({ ctx }) => {
      const myProfile = await getTutorProfileByUserId(ctx.user.id);
      if (!myProfile) return [];
      return getTutorInterestsByTutor(myProfile.id);
    }),

    // Admin: list all tutor interests
    list: adminProcedure.query(async () => getAllTutorInterests()),

    // Admin: update interest status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "accepted", "declined"]),
      }))
      .mutation(async ({ input }) => {
        await updateTutorInterestStatus(input.id, input.status);
        return { success: true };
      }),
  }),


  // ─── Referrals ─────────────────────────────────────────────────────────────
  referral: router({
    submit: publicProcedure
      .input(z.object({
        referrerName: z.string().min(2).max(128),
        referrerEmail: z.string().email(),
        referrerPhone: z.string().max(20).optional(),
        refereeName: z.string().min(2).max(128),
        refereeEmail: z.string().email(),
        refereePhone: z.string().max(20).optional(),
      }))
      .mutation(async ({ input }) => {
        // Generate a unique 8-char referral code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        await createReferral({ ...input, referralCode: code });
        await notifyOwner({
          title: `🎁 New Referral from ${input.referrerName}`,
          content: `**Referrer:** ${input.referrerName} (${input.referrerEmail})\n**Referred:** ${input.refereeName} (${input.refereeEmail})\n**Code:** ${code}\n\nManage at https://edu-nest.manus.space/admin`,
        }).catch(() => {/* non-blocking */});
        return { success: true, referralCode: code };
      }),

    list: adminProcedure.query(async () => getAllReferrals()),

        updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "joined", "rewarded"]),
        discountApplied: z.enum(["yes", "no"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await updateReferralStatus(input.id, input.status, input.discountApplied);
        return { success: true };
      }),
  }),

  // ─── Student Demo Interests ──────────────────────────────────────────────────
  studentDemoInterest: router({
    // Student books a free demo class with a nearby tutor
    bookDemo: protectedProcedure
      .input(z.object({
        tutorProfileId: z.number(),
        message: z.string().max(512).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const studentProfile = await getStudentProfileByUserId(ctx.user.id);
        if (!studentProfile) throw new Error("Complete your student profile first");
        // Prevent duplicate bookings
        const existing = await getStudentDemoInterestByPair(studentProfile.id, input.tutorProfileId);
        if (existing) return { success: true, status: existing.status, alreadyExists: true };
        await createStudentDemoInterest(studentProfile.id, input.tutorProfileId, input.message);
        await notifyOwner({
          title: `📚 New Demo Class Request`,
          content: `Student **${studentProfile.name}** (${studentProfile.email}) has requested a free demo class.\n\nTutor Profile ID: ${input.tutorProfileId}\n\nManage at https://edu-nest.manus.space/admin`,
        }).catch(() => {/* non-blocking */});
        return { success: true, status: "pending", alreadyExists: false };
      }),

    // Student checks their own demo interest status for a specific tutor
    getStatusForTutor: protectedProcedure
      .input(z.object({ tutorProfileId: z.number() }))
      .query(async ({ ctx, input }) => {
        const studentProfile = await getStudentProfileByUserId(ctx.user.id);
        if (!studentProfile) return null;
        const record = await getStudentDemoInterestByPair(studentProfile.id, input.tutorProfileId);
        return record ?? null;
      }),

    // Student sees all their demo interests
    myInterests: protectedProcedure.query(async ({ ctx }) => {
      const studentProfile = await getStudentProfileByUserId(ctx.user.id);
      if (!studentProfile) return [];
      return getStudentDemoInterestsByStudent(studentProfile.id);
    }),

    // Admin: list all demo interests
    listAll: adminProcedure.query(async () => getAllStudentDemoInterests()),

    // Admin: update status — also creates a demo slot when confirming
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await updateStudentDemoInterestStatus(input.id, input.status);
        if (input.status === "confirmed") {
          // Fetch the interest to get profile IDs
          const all = await getAllStudentDemoInterests();
          const interest = all.find(i => i.id === input.id);
          if (interest) {
            // Create a demo slot if one doesn't already exist
            const existing = await getDemoSlotByInterestId(input.id);
            if (!existing) {
              await createDemoSlot(
                input.id,
                interest.studentProfileId,
                interest.tutorProfileId,
                "online"
              );
            }
            // Notify the tutor via owner notification (best-effort)
            await notifyOwner({
              title: `🎉 Demo Class Confirmed — Tutor Profile #${interest.tutorProfileId}`,
              content: `A student has confirmed a free demo class with you!\n\nStudent Profile ID: ${interest.studentProfileId}\nTutor Profile ID: ${interest.tutorProfileId}\n\nLog in to EduNest to view the schedule: https://edu-nest.manus.space/tutor-dashboard`,
            }).catch(() => {});
          }
        }
        return { success: true };
      }),
  }),

  // ─── OTP Phone Verification ─────────────────────────────────────────────────
  otp: router({
    // Send OTP to a phone number (generates a 6-digit code, stores in DB, sends via email to the logged-in user)
    send: protectedProcedure
      .input(z.object({
        phone: z.string().min(10).max(20).trim(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Rate limit: check if a recent OTP was sent in the last 60 seconds
        const recent = await getLatestOtp(input.phone);
        if (recent) {
          const age = Date.now() - new Date(recent.createdAt).getTime();
          if (age < 60_000) {
            throw new Error("Please wait 60 seconds before requesting a new OTP.");
          }
        }
        // Generate 6-digit code
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await createOtp(input.phone, code, expiresAt);
        // Send OTP via email to the logged-in user's email address (free, no SMS provider needed)
        const userEmail = ctx.user.email;
        const userName = ctx.user.name ?? "EduNest User";
        if (!userEmail) {
          throw new Error("Your account has no email address. Please contact EduNest support.");
        }
        // Attempt to send the OTP email — surface failure to the user
        let emailSent = false;
        try {
          await sendOtpEmail({
            toEmail: userEmail,
            toName: userName,
            phone: input.phone,
            code,
            expiresMinutes: 10,
          });
          emailSent = true;
        } catch (emailErr) {
          console.error(`[OTP] Email send failed for ${userEmail}:`, emailErr);
        }
        if (!emailSent) {
          // If RESEND_API_KEY is missing, still allow dev/testing by logging the code
          const hasResend = !!process.env.RESEND_API_KEY;
          if (hasResend) {
            // Real failure — inform the user
            throw new Error("Failed to send OTP email. Please try again in a moment.");
          }
          // Dev mode: log the OTP so developers can test without Resend
          console.log(`[OTP DEV] Phone: ${input.phone} | Email: ${userEmail} | Code: ${code}`);
        } else {
          console.log(`[OTP] Sent to ${userEmail} for phone ${input.phone}`);
        }
        // Return the masked email so the frontend can show a hint
        const maskedEmail = userEmail.replace(/(.{2}).+(@.+)/, '$1***$2');
        return { success: true, expiresAt, maskedEmail };
      }),

    // Verify OTP code entered by user
    verify: protectedProcedure
      .input(z.object({
        phone: z.string().min(10).max(20).trim(),
        code: z.string().length(6).trim(),
        profileType: z.enum(["tutor", "student"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const otp = await getLatestOtp(input.phone);
        if (!otp) throw new Error("No OTP found. Please request a new one.");
        if (otp.verified === "yes") throw new Error("This OTP has already been used.");
        if (new Date(otp.expiresAt) < new Date()) throw new Error("OTP has expired. Please request a new one.");
        if (otp.code !== input.code) throw new Error("Incorrect OTP. Please try again.");
        // Mark OTP as used
        await markOtpVerified(otp.id);
        // Mark the profile's phone as verified
        if (input.profileType === "tutor") {
          await markTutorPhoneVerified(ctx.user.id);
        } else {
          await markStudentPhoneVerified(ctx.user.id);
        }
        return { success: true, verified: true };
      }),
  }),

  // ─── Demo Slots ─────────────────────────────────────────────────────────────
  demoSlot: router({
    // Student: get their demo slots
    mySlots: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getStudentProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return getDemoSlotsByStudent(profile.id);
    }),

    // Tutor: get their demo slots (schedule)
    tutorSlots: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getTutorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return getDemoSlotsByTutor(profile.id);
    }),

    // Student: schedule a confirmed demo slot
    schedule: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        scheduledDate: z.string().min(1).max(32).trim(),
        scheduledTime: z.string().min(1).max(32).trim(),
        notes: z.string().max(500).trim().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify the student owns this slot
        const profile = await getStudentProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Student profile not found.");
        const slots = await getDemoSlotsByStudent(profile.id);
        const slot = slots.find(s => s.id === input.slotId);
        if (!slot) throw new Error("Demo slot not found or access denied.");
        await updateDemoSlotSchedule(input.slotId, input.scheduledDate, input.scheduledTime, input.notes);
        // Notify owner
        await notifyOwner({
          title: `📅 Demo Slot Scheduled`,
          content: `Student Profile #${profile.id} scheduled a demo on **${input.scheduledDate}** at **${input.scheduledTime}**.\nTutor Profile ID: ${slot.tutorProfileId}\nNotes: ${input.notes ?? 'None'}`,
        }).catch(() => {});
        return { success: true };
      }),

    // Admin: list all demo slots
    listAll: adminProcedure.query(async () => getAllDemoSlots()),

    // Admin: update slot status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending_schedule", "scheduled", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await updateDemoSlotStatus(input.id, input.status);
        return { success: true };
      }),

    // Tutor or Student: set proceed intent after demo completes
    // party is inferred from the user's role (tutor profile vs student profile)
    setProceedIntent: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        intent: z.enum(["yes", "no"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // Determine if caller is tutor or student by checking their profile
        const tutorProfile = await getTutorProfileByUserId(ctx.user.id);
        const studentProfile = await getStudentProfileByUserId(ctx.user.id);

        if (!tutorProfile && !studentProfile) {
          throw new Error("No profile found. Please complete your profile first.");
        }

        // Verify the slot belongs to this user
        let party: "tutor" | "student";
        if (tutorProfile) {
          const tutorSlots = await getDemoSlotsByTutor(tutorProfile.id);
          if (!tutorSlots.find(s => s.id === input.slotId)) {
            throw new Error("Demo slot not found or access denied.");
          }
          party = "tutor";
        } else {
          const studentSlots = await getDemoSlotsByStudent(studentProfile!.id);
          if (!studentSlots.find(s => s.id === input.slotId)) {
            throw new Error("Demo slot not found or access denied.");
          }
          party = "student";
        }

        // Update intent
        const updatedSlot = await setDemoSlotProceedIntent(input.slotId, party, input.intent);
        if (!updatedSlot) throw new Error("Failed to update proceed intent.");

        // Check if both parties have now said yes → create confirmed match
        if (updatedSlot.tutorProceedIntent === "yes" && updatedSlot.studentProceedIntent === "yes") {
          // Avoid duplicate matches
          const existing = await getConfirmedMatchBySlotId(input.slotId);
          if (!existing) {
            // Always look up profiles by the slot's profile IDs (not by current user)
            // so both tutor and student get correct data regardless of who clicked last
            const allTutors = await getAllTutorProfiles();
            const allStudents = await getAllStudentProfiles();
            const tProfile = allTutors.find(t => t.id === updatedSlot.tutorProfileId) ?? null;
            const sProfile = allStudents.find(s => s.id === updatedSlot.studentProfileId) ?? null;

            // Look up user emails for both parties
            const tutorUser = tProfile ? await getUserById(tProfile.userId) : null;
            const studentUser = sProfile ? await getUserById(sProfile.userId) : null;

            console.log(`[Match] Creating confirmed match: tutor=${tProfile?.name} (${tutorUser?.email}), student=${sProfile?.name} (${studentUser?.email})`);

            await createConfirmedMatch({
              demoSlotId: input.slotId,
              tutorProfileId: updatedSlot.tutorProfileId,
              studentProfileId: updatedSlot.studentProfileId,
              tutorName: tProfile?.name ?? null,
              tutorEmail: tutorUser?.email ?? null,
              tutorPhone: tProfile?.phone ?? null,
              studentName: sProfile?.name ?? null,
              studentEmail: studentUser?.email ?? null,
              studentPhone: sProfile?.phone ?? null,
              studentArea: sProfile?.area ?? null,
              studentGrade: sProfile?.grade ?? null,
              studentSubjects: sProfile?.subjects ?? null,
            });

            // Send contact reveal emails to both parties
            if (tutorUser?.email && tProfile) {
              sendContactRevealToTutor({
                tutorEmail: tutorUser.email,
                tutorName: tProfile.name ?? "Tutor",
                studentName: sProfile?.name ?? "Student",
                studentEmail: studentUser?.email ?? "",
                studentPhone: sProfile?.phone ?? "",
                studentArea: sProfile?.area ?? "",
                studentGrade: sProfile?.grade ?? "",
                studentSubjects: sProfile?.subjects ?? "",
              }).catch(() => {});
            }
            if (studentUser?.email && sProfile) {
              sendContactRevealToStudent({
                studentEmail: studentUser.email,
                studentName: sProfile.name ?? "Student",
                tutorName: tProfile?.name ?? "Tutor",
                tutorEmail: tutorUser?.email ?? "",
                tutorPhone: tProfile?.phone ?? "",
                tutorQualification: tProfile?.qualification ?? "",
                tutorSubjects: tProfile?.subjects ?? "",
                tutorArea: tProfile?.area ?? "",
                tutorMode: tProfile?.mode ?? "online",
                tutorBio: tProfile?.bio ?? undefined,
              }).catch(() => {});
            }

            // Notify owner
            await notifyOwner({
              title: `🎉 New Confirmed Match!`,
              content: `Tutor Profile #${updatedSlot.tutorProfileId} and Student Profile #${updatedSlot.studentProfileId} have both agreed to proceed after their demo class. Contact details have been shared via email.`,
            }).catch(() => {});

            return { success: true, matched: true };
          }
        }

        return { success: true, matched: false };
      }),
  }),

  // ─── Confirmed Matches (Admin) ───────────────────────────────────────────────
  confirmedMatch: router({
    listAll: adminProcedure.query(async () => getAllConfirmedMatches()),
  }),

  // ─── Session Logs ─────────────────────────────────────────────────────────────
  sessionLog: router({
    /** Tutor: get or create session log for a confirmed match */
    getOrCreate: protectedProcedure
      .input(z.object({ matchId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        // Verify the match exists and belongs to this tutor
        const match = await getAllConfirmedMatches().then(all => all.find(m => m.id === input.matchId));
        if (!match) throw new Error("Match not found");
        return getOrCreateSessionLog(input.matchId, {
          tutorProfileId: match.tutorProfileId,
          studentProfileId: match.studentProfileId,
          tutorName: match.tutorName,
          studentName: match.studentName,
        });
      }),

    /** Get session log by matchId (tutor or student) */
    getByMatchId: protectedProcedure
      .input(z.object({ matchId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getSessionLogByMatchId(input.matchId);
      }),

    /** Tutor: get all session logs for their profile */
    myLogs: protectedProcedure.query(async ({ ctx }) => {
      const profile = await import("./db").then(m => m.getTutorProfileByUserId(ctx.user.id));
      if (!profile) return [];
      return getSessionLogsByTutor(profile.id);
    }),

    /** Student: get all session logs for their profile */
    myStudentLogs: protectedProcedure.query(async ({ ctx }) => {
      const profile = await import("./db").then(m => m.getStudentProfileByUserId(ctx.user.id));
      if (!profile) return [];
      return getSessionLogsByStudent(profile.id);
    }),

    /** Tutor: upload completed sheet (S3 URL) */
    uploadSheet: protectedProcedure
      .input(z.object({
        logId: z.number().int().positive(),
        uploadedSheetUrl: z.string().url().max(2048),
      }))
      .mutation(async ({ input }) => {
        await updateSessionLogSheet(input.logId, input.uploadedSheetUrl);
        // Notify owner
        await notifyOwner({
          title: "📋 Session Sheet Uploaded",
          content: `A tutor has uploaded their completed session log sheet (Log #${input.logId}). Please review and approve payment.`,
        }).catch(() => {});
        return { success: true };
      }),

    /** Admin: list all session logs */
    listAll: adminProcedure.query(async () => getAllSessionLogs()),

    /** Admin: approve payment */
    approvePayment: adminProcedure
      .input(z.object({ logId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await updateSessionLogPaymentStatus(input.logId, "payment_processed");
        return { success: true };
      }),

    /** Admin: reset to sheet_uploaded (undo) */
    resetPayment: adminProcedure
      .input(z.object({ logId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await updateSessionLogPaymentStatus(input.logId, "sheet_uploaded");
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
