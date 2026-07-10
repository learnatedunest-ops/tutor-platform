import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { sendDemoBookingEmail, sendInquiryEmail, sendTutorApplicationEmail } from "./email";
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
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(10),
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
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(10),
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

    // Admin: update status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await updateStudentDemoInterestStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
