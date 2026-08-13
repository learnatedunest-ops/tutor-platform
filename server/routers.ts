import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sendContactRevealToStudent, sendContactRevealToTutor, sendDemoBookingEmail, sendInquiryEmail, sendOtpEmail, sendParentPayNowEmail, sendSmartPairEmailToTutor, sendSmartPairEmailToStudent, sendTutorApplicationEmail, sendTutorFeePaidEmail } from "./email";
import { notifyAdminDemoScheduled, notifyAdminSheetUploaded, notifyAdminParentPaid, notifyAdminCancellationRequested } from "./whatsapp";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { redactPrivateLocation } from "./profilePrivacy";
import { scoreStudentMatch, scoreTutorMatch } from "./matching";

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
  updateTutorInterestAdminStatus,
  getAdminApprovedTutorInterestsByStudent,
  createStudentDemoInterest,
  getStudentDemoInterestsByStudent,
  getStudentDemoInterestByPair,
  getAllStudentDemoInterests,
  updateStudentDemoInterestStatus,
  updateStudentDemoInterestAdminStatus,
  getAdminApprovedDemoInterestsByTutor,
  getAllDemoInterestsByTutor,
  updateDemoSlotTutorConfirmedComing,
  updateDemoSlotTutorReschedule,
  updateDemoSlotParentRescheduleResponse,
  updateDemoSlotParentAccepted,
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
  updateConfirmedMatchClassStatus,
  getConfirmedMatchesByTutor,
  getConfirmedMatchesByStudent,
  requestMatchCancellation,
  approveMatchCancellation,
  getActiveStudentIdsForTutor,
  getActiveTutorIdsForStudent,
  getAllActiveStudentIds,
  getCancellationRequests,
  // Session logs
  getOrCreateSessionLog,
  getSessionLogByMatchId,
  getSessionLogById,
  getSessionLogEntries,
  createSessionLogEntry,
  submitOnlineSessionLog,
  updateSessionLogSheet,
  updateSessionLogPaymentStatus,
  markSessionLogParentPaid,
  getAllSessionLogs,
  getAllOnlineSessionLogEntries,
  getSessionLogsByTutor,
  getSessionLogsByStudent,
  updateUserRole,
  cancelDemoByParent,
  clearDemoCancellationFee,
  getCancelledDemosWithPendingFee,
  getCancelledConfirmedMatches,
  getSmartPairs,
  markSmartPairContacted,
  getSmartPairContacts,
  markSmartPairTutorEmailSent,
  markSmartPairStudentEmailSent,
  adminCreateDemoSlotForPair,
  holdTutorProfile,
  unholdTutorProfile,
  holdStudentProfile,
  unholdStudentProfile,
  getAllHeldProfiles,
  adminCreateTutorProfile,
  adminCreateStudentProfile,
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

    // Called once after first login to ensure the admin account has admin role.
    // Checks Google admin email OR legacy OWNER_OPEN_ID. Safe to call multiple times — idempotent.
    ensureOwnerAdmin: protectedProcedure.mutation(async ({ ctx }) => {
      const adminEmail = ENV.googleAdminEmail;
      const ownerOpenId = process.env.OWNER_OPEN_ID ?? '';
      const isAdminByEmail = adminEmail && ctx.user.email?.toLowerCase() === adminEmail.toLowerCase();
      const isAdminByOpenId = ownerOpenId && ctx.user.openId === ownerOpenId;
      if (!isAdminByEmail && !isAdminByOpenId) {
        return { promoted: false, reason: 'Not the admin account' };
      }
      if (ctx.user.role === 'admin') {
        return { promoted: false, reason: 'Already admin' };
      }
      await updateUserRole(ctx.user.openId, 'admin');
      return { promoted: true };
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
        stream: z.string().max(128).optional(),
        subjects: z.string().min(2).max(512),
        area: z.string().min(2).max(128),
        mode: z.enum(["home_tuition", "online", "both"]),
        budget: z.string().max(64).optional(),
        preferredTime: z.string().max(128).optional(),
        additionalNotes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        await createStudentRequirement(input);
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
      return redactPrivateLocation(await getTutorProfileByUserId(ctx.user.id));
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
        upiId: z.string().max(64).optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await upsertTutorProfile(ctx.user.id, {
          ...input,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          status: "pending",
        });
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
        radiusKm: z.number().min(1).max(50).default(30),
      }))
      .query(async ({ ctx, input }) => {
        // Verify tutor is approved
        const myProfile = await getTutorProfileByUserId(ctx.user.id);
        if (!myProfile || myProfile.status !== "approved") return [];
        const students = await getActiveStudentProfiles();
        // Get ALL student IDs that have an active class with ANY tutor (not just this tutor)
        const allActiveStudentIds = await getAllActiveStudentIds();
        const activeSet = new Set(allActiveStudentIds);
        // Haversine distance filter
        const R = 6371;
        return students
          .filter(s => s.latitude && s.longitude && !activeSet.has(s.id))
          .map(s => {
            const lat1 = input.latitude * Math.PI / 180;
            const lat2 = parseFloat(s.latitude!) * Math.PI / 180;
            const dLat = (parseFloat(s.latitude!) - input.latitude) * Math.PI / 180;
            const dLon = (parseFloat(s.longitude!) - input.longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
            const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const compatibility = scoreStudentMatch(myProfile, s);
            // Strip all exact-location data and contact details from non-admin responses.
            const { phone: _p, fullAddress: _fa, email: _e, latitude: _lat, longitude: _lng, ...safeStudent } = s;
            return { ...safeStudent, ...compatibility, distKm: Math.round(distKm * 10) / 10 };
          })
          .filter(s => s.distKm <= input.radiusKm)
          .sort((a, b) => b.matchScore - a.matchScore || a.distKm - b.distKm);
      }),
  }),

  // ─── Student Profiles ─────────────────────────────────────────────────────
  studentProfile: router({
    // Get the logged-in student/parent's own profile
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return redactPrivateLocation(await getStudentProfileByUserId(ctx.user.id));
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
        stream: z.string().max(128).optional(),
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
        tutorGenderPreference: z.enum(["male", "female", "no_preference"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await upsertStudentProfile(ctx.user.id, {
          ...input,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          isActive: "yes",
        });
        return { success: true, profile };
      }),

    // Get nearby approved tutors (for students)
    getNearbyTutors: protectedProcedure
      .input(z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radiusKm: z.number().min(1).max(50).default(30),
      }))
      .query(async ({ input, ctx }) => {
        const tutorList = await getApprovedTutorProfiles();
        const student = await getStudentProfileByUserId(ctx.user.id);
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
            const compatibility = student ? scoreTutorMatch(student, t) : { matchScore: 0, matchReasons: [] };
            // Strip all exact-location data and contact details from non-admin responses.
            const { phone: _p, fullAddress: _fa, upiId: _u, latitude: _lat, longitude: _lng, ...safeTutor } = t;
            return { ...safeTutor, ...compatibility, distKm: Math.round(distKm * 10) / 10 };
          })
          .filter(t => t.distKm <= input.radiusKm)
          .sort((a, b) => b.matchScore - a.matchScore || a.distKm - b.distKm);
      }),
  }),

  // --- Tutor Interests ---
  tutorInterest: router({
    // Tutor expresses interest in a student requirement — goes DIRECTLY to student (no admin gate)
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
        return { success: true, interest };
      }),

    // Get all interests expressed by the logged-in tutor
    getMyInterests: protectedProcedure.query(async ({ ctx }) => {
      const myProfile = await getTutorProfileByUserId(ctx.user.id);
      if (!myProfile) return [];
      return getTutorInterestsByTutor(myProfile.id);
    }),

    // Student: get ALL tutor interests for their profile (no admin gate)
    getApprovedForMe: protectedProcedure.query(async ({ ctx }) => {
      const myProfile = await getStudentProfileByUserId(ctx.user.id);
      if (!myProfile) return [];
      return getAdminApprovedTutorInterestsByStudent(myProfile.id);
    }),

    // Student: accept or decline a tutor interest directly
    // When accepted, a demo slot is created and the tutor is notified
    respondToInterest: protectedProcedure
      .input(z.object({
        interestId: z.number(),
        response: z.enum(["accepted", "declined"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const myProfile = await getStudentProfileByUserId(ctx.user.id);
        if (!myProfile) throw new Error("Student profile not found.");
        // Verify the interest belongs to this student
        const allInterests = await getAdminApprovedTutorInterestsByStudent(myProfile.id);
        const interest = allInterests.find(i => i.id === input.interestId);
        if (!interest) throw new Error("Interest not found.");
        await updateTutorInterestStatus(input.interestId, input.response);
        if (input.response === "accepted") {
          // Create a demo slot — parent will set the timing
          // Use the student's preferred mode
          const mode = (myProfile.mode as "home_tuition" | "online" | "both") ?? "online";
          const existing = await getDemoSlotByInterestId(input.interestId);
          if (!existing) {
            const newSlot = await createDemoSlot(
              input.interestId,
              myProfile.id,
              interest.tutorProfileId,
              mode,
              "tutor_to_student"
            );
            // Parent accepted the interest, so immediately mark parentAccepted=yes
            // so the schedule procedure allows them to set the demo timing
            if (newSlot?.id) {
              await updateDemoSlotParentAccepted(newSlot.id, "yes");
            }
          } else {
            // Slot already exists (e.g. from a previous attempt) — ensure parentAccepted=yes
            await updateDemoSlotParentAccepted(existing.id, "yes");
          }
        }
        return { success: true };
      }),

    // Admin: list all tutor interests
    list: adminProcedure.query(async () => getAllTutorInterests()),

    // Admin: approve or reject a tutor interest (before student sees it)
    adminApprove: adminProcedure
      .input(z.object({
        id: z.number(),
        adminApprovalStatus: z.enum(["admin_approved", "admin_rejected"]),
      }))
      .mutation(async ({ input }) => {
        await updateTutorInterestAdminStatus(input.id, input.adminApprovalStatus);
        return { success: true };
      }),

    // Admin: update student-facing status (legacy, kept for compatibility)
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
    // Student/parent shows interest in a nearby tutor — goes DIRECTLY to tutor (no admin gate)
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
        return { success: true, status: "pending", alreadyExists: false };
      }),

    // Student checks their own demo interest status for a specific tutor
    getStatusForTutor: protectedProcedure
      .input(z.object({ tutorProfileId: z.number() }))
      .query(async ({ ctx, input }) => {
        const studentProfile = await getStudentProfileByUserId(ctx.user.id);
        if (!studentProfile) return null;
        const record = await getStudentDemoInterestByPair(studentProfile.id, input.tutorProfileId);
        if (!record) return null;
        // If confirmed, also fetch the associated demoSlot ID so the parent can navigate to it
        let demoSlotId: number | null = null;
        if (record.status === 'confirmed') {
          const slot = await getDemoSlotByInterestId(record.id);
          demoSlotId = slot?.id ?? null;
        }
        return { ...record, demoSlotId };
      }),

    // Student sees all their demo interests
    myInterests: protectedProcedure.query(async ({ ctx }) => {
      const studentProfile = await getStudentProfileByUserId(ctx.user.id);
      if (!studentProfile) return [];
      return getStudentDemoInterestsByStudent(studentProfile.id);
    }),

    // Tutor: get ALL student interests for their profile (no admin gate)
    getApprovedForMe: protectedProcedure.query(async ({ ctx }) => {
      const myProfile = await getTutorProfileByUserId(ctx.user.id);
      if (!myProfile) return [];
      return getAllDemoInterestsByTutor(myProfile.id);
    }),

    // Tutor: accept or decline a student interest directly (no admin gate)
    // When accepted, a demo slot is created; parent will then set the timing
    respondToInterest: protectedProcedure
      .input(z.object({
        interestId: z.number(),
        response: z.enum(["confirmed", "cancelled"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const myProfile = await getTutorProfileByUserId(ctx.user.id);
        if (!myProfile) throw new Error("Tutor profile not found.");
        // Verify the interest belongs to this tutor
        const allInterests = await getAllDemoInterestsByTutor(myProfile.id);
        const interest = allInterests.find(i => i.id === input.interestId);
        if (!interest) throw new Error("Interest not found.");
        await updateStudentDemoInterestStatus(input.interestId, input.response);
        if (input.response === "confirmed") {
          // Create a demo slot — parent will set the timing
          // Use the student's preferred mode
          const allStudents = await getAllStudentProfiles();
          const sProfile = allStudents.find(s => s.id === interest.studentProfileId);
          const mode = (sProfile?.mode as "home_tuition" | "online" | "both") ?? "online";
          const existing = await getDemoSlotByInterestId(input.interestId);
          if (!existing) {
            await createDemoSlot(
              input.interestId,
              interest.studentProfileId,
              myProfile.id,
              mode,
              "student_to_tutor"
            );
          }
        }
        return { success: true };
      }),

    // Admin: list all student interests
    listAll: adminProcedure.query(async () => getAllStudentDemoInterests()),

    // Admin: approve or reject a student interest (before tutor sees it)
    adminApprove: adminProcedure
      .input(z.object({
        id: z.number(),
        adminApprovalStatus: z.enum(["admin_approved", "admin_rejected"]),
      }))
      .mutation(async ({ input }) => {
        await updateStudentDemoInterestAdminStatus(input.id, input.adminApprovalStatus);
        return { success: true };
      }),

    // Admin: legacy status update (kept for compatibility)
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

    // Student: check if they have a pending demo cancellation fee (blocks re-booking)
    hasPendingCancellationFee: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getStudentProfileByUserId(ctx.user.id);
      if (!profile) return false;
      const slots = await getDemoSlotsByStudent(profile.id);
      return slots.some(s => s.demoCancelledBy === 'parent' && !s.demoCancellationFeeCleared);
    }),

    // Parent: cancel a scheduled demo (triggers ₹350 fee)
    cancelDemo: protectedProcedure
      .input(z.object({ slotId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getStudentProfileByUserId(ctx.user.id);
        if (!profile) throw new Error('Student profile not found.');
        const slots = await getDemoSlotsByStudent(profile.id);
        const slot = slots.find(s => s.id === input.slotId);
        if (!slot) throw new Error('Demo slot not found or access denied.');
        if (slot.status === 'cancelled') throw new Error('Demo is already cancelled.');
        if (slot.demoCancelledBy) throw new Error('Cancellation already submitted.');
        // Mark as cancelled with fee pending
        await cancelDemoByParent(input.slotId);
        return { success: true };
      }),

    // Admin: clear the ₹350 cancellation fee for a demo slot
    adminClearCancellationFee: adminProcedure
      .input(z.object({ slotId: z.number() }))
      .mutation(async ({ input }) => {
        await clearDemoCancellationFee(input.slotId);
        return { success: true };
      }),

    // Admin: get all cancelled demos with pending fee
    adminGetCancelledDemos: adminProcedure.query(async () => {
      return getCancelledDemosWithPendingFee();
    }),

    // Tutor: get their demo slots (schedule)
    tutorSlots: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getTutorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return getDemoSlotsByTutor(profile.id);
    }),

    // Parent: accept a tutor-initiated interest slot (unlocks scheduling)
    parentAccept: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        response: z.enum(["yes", "no"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getStudentProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Student profile not found.");
        const slots = await getDemoSlotsByStudent(profile.id);
        const slot = slots.find(s => s.id === input.slotId);
        if (!slot) throw new Error("Demo slot not found or access denied.");
        if (slot.interestDirection !== "tutor_to_student") {
          throw new Error("This slot does not require parent acceptance.");
        }
        await updateDemoSlotParentAccepted(input.slotId, input.response);
        if (input.response === "yes") {
        }
        return { success: true };
      }),

    // Parent/Student: schedule a confirmed demo slot (only parent sets timing)
    schedule: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        scheduledDate: z.string().min(1).max(32).trim(),
        scheduledTime: z.string().min(1).max(32).trim(),
        notes: z.string().max(500).trim().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify the student/parent owns this slot
        const profile = await getStudentProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Student profile not found.");
        const slots = await getDemoSlotsByStudent(profile.id);
        const slot = slots.find(s => s.id === input.slotId);
        if (!slot) throw new Error("Demo slot not found or access denied.");
        // For tutor-initiated slots, parent must have accepted first
        if (slot.interestDirection === "tutor_to_student" && slot.parentAccepted !== "yes") {
          throw new Error("Please accept the tutor's interest before scheduling.");
        }
        await updateDemoSlotSchedule(input.slotId, input.scheduledDate, input.scheduledTime, input.notes);
        // After scheduling, send the tutor the student's full contact details (address + phone)
        const allTutors = await getAllTutorProfiles();
        const tProfile = allTutors.find(t => t.id === slot.tutorProfileId);
        const tutorUser = tProfile ? await getUserById(tProfile.userId) : null;
        if (tutorUser?.email && tProfile) {
          const studentAddress = profile.fullAddress ?? profile.area ?? "Not provided";
          const studentPhone = profile.phone;
          const studentName = profile.studentName ?? profile.name;
          // Send email to tutor with full student contact details for demo visit
          sendContactRevealToTutor({
            tutorEmail: tutorUser.email,
            tutorName: tProfile.name ?? "Tutor",
            studentName,
            studentEmail: "",  // not revealed yet
            studentPhone,
            studentArea: studentAddress,
            studentGrade: profile.grade,
            studentSubjects: profile.subjects,
          }).catch(() => {});
        }
        // WhatsApp alert to admin
        if (tProfile && profile) {
          const studentName = profile.studentName ?? profile.name;
          notifyAdminDemoScheduled({
            parentName: profile.name,
            parentPhone: profile.phone,
            tutorName: tProfile.name ?? "Tutor",
            tutorPhone: tProfile.phone ?? "",
            studentName,
            subject: profile.subjects ?? "General",
            demoDate: `${input.scheduledDate} at ${input.scheduledTime}`,
          }).catch(() => {});
        }
        return { success: true };
      }),

    // Tutor: confirm they are coming for the demo
    tutorConfirmComing: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        response: z.enum(["yes", "no"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getTutorProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Tutor profile not found.");
        const slots = await getDemoSlotsByTutor(profile.id);
        const slot = slots.find(s => s.id === input.slotId);
        if (!slot) throw new Error("Demo slot not found or access denied.");
        await updateDemoSlotTutorConfirmedComing(input.slotId, input.response);
        if (input.response === "yes") {
        }
        return { success: true };
      }),

    // Tutor: suggest a new reschedule time when they can't make the parent's chosen time
    suggestReschedule: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        suggestedDate: z.string().min(1).max(32).trim(),
        suggestedTime: z.string().min(1).max(32).trim(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getTutorProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Tutor profile not found.");
        const slots = await getDemoSlotsByTutor(profile.id);
        const slot = slots.find(s => s.id === input.slotId);
        if (!slot) throw new Error("Demo slot not found or access denied.");
        await updateDemoSlotTutorReschedule(input.slotId, input.suggestedDate, input.suggestedTime);
        return { success: true };
      }),

    // Parent: accept or decline tutor's suggested reschedule
    parentRespondReschedule: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        response: z.enum(["accepted", "declined"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getStudentProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Student profile not found.");
        const slots = await getDemoSlotsByStudent(profile.id);
        const slot = slots.find(s => s.id === input.slotId);
        if (!slot) throw new Error("Demo slot not found or access denied.");
        await updateDemoSlotParentRescheduleResponse(input.slotId, input.response);
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

    /**
     * Admin: manually force both parties to "yes" and create a confirmed match.
     * Use this when tutor/student forget to click "Would you like to continue?".
     */
    adminForceClassStarted: adminProcedure
      .input(z.object({ slotId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const slot = await getDemoSlotById(input.slotId);
        if (!slot) throw new Error('Demo slot not found.');

        // Force both proceed intents to yes
        await setDemoSlotProceedIntent(input.slotId, 'tutor', 'yes');
        const updatedSlot = await setDemoSlotProceedIntent(input.slotId, 'student', 'yes');
        if (!updatedSlot) throw new Error('Failed to update proceed intents.');

        // Avoid duplicate confirmed matches
        const existing = await getConfirmedMatchBySlotId(input.slotId);
        if (existing) return { success: true, matchId: existing.id, alreadyExisted: true };

        // Look up profiles for contact snapshot
        const allTutors = await getAllTutorProfiles();
        const allStudents = await getAllStudentProfiles();
        const tProfile = allTutors.find(t => t.id === updatedSlot.tutorProfileId) ?? null;
        const sProfile = allStudents.find(s => s.id === updatedSlot.studentProfileId) ?? null;
        const tutorUser = tProfile ? await getUserById(tProfile.userId) : null;
        const studentUser = sProfile ? await getUserById(sProfile.userId) : null;

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
          paymentAmount: sProfile?.budget ?? null,
        });

        // Send contact reveal emails
        if (tutorUser?.email && tProfile) {
          sendContactRevealToTutor({
            tutorEmail: tutorUser.email,
            tutorName: tProfile.name ?? 'Tutor',
            studentName: sProfile?.name ?? 'Student',
            studentEmail: studentUser?.email ?? '',
            studentPhone: sProfile?.phone ?? '',
            studentArea: sProfile?.area ?? '',
            studentGrade: sProfile?.grade ?? '',
            studentSubjects: sProfile?.subjects ?? '',
          }).catch(() => {});
        }
        if (studentUser?.email && sProfile) {
          sendContactRevealToStudent({
            studentEmail: studentUser.email,
            studentName: sProfile.name ?? 'Student',
            tutorName: tProfile?.name ?? 'Tutor',
            tutorEmail: tutorUser?.email ?? '',
            tutorPhone: tProfile?.phone ?? '',
            tutorQualification: tProfile?.qualification ?? '',
            tutorSubjects: tProfile?.subjects ?? '',
            tutorArea: tProfile?.area ?? '',
            tutorMode: tProfile?.mode ?? 'online',
            tutorBio: tProfile?.bio ?? undefined,
          }).catch(() => {});
        }


        const newMatch = await getConfirmedMatchBySlotId(input.slotId);
        return { success: true, matchId: newMatch?.id ?? null, alreadyExisted: false };
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
              paymentAmount: sProfile?.budget ?? null,
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


            return { success: true, matched: true };
          }
        }

        return { success: true, matched: false };
      }),
  }),

  // ─── Confirmed Matches (Admin) ───────────────────────────────────────────────
  confirmedMatch: router({
    listAll: adminProcedure.query(async () => getAllConfirmedMatches()),

    /** Admin: mark a confirmed match as 'got_a_class' */
    markGotAClass: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ input }) => {
        await updateConfirmedMatchClassStatus(input.matchId, 'got_a_class');
        return { success: true };
      }),

    /** Admin: reset class status back to 'matched' */
    resetClassStatus: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ input }) => {
        await updateConfirmedMatchClassStatus(input.matchId, 'matched');
        return { success: true };
      }),

    /** Tutor: get confirmed matches for their own profile */
    getMineForTutor: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getTutorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return getConfirmedMatchesByTutor(profile.id);
    }),

    /** Student: get confirmed matches for their own profile */
    getMineForStudent: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getStudentProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return getConfirmedMatchesByStudent(profile.id);
    }),

    /** Tutor or parent: request cancellation of a confirmed match */
    requestCancellation: protectedProcedure
      .input(z.object({
        matchId: z.number().int().positive(),
        requestedBy: z.enum(['tutor', 'parent']),
        note: z.string().max(512).optional(),
      }))
      .mutation(async ({ input }) => {
        await requestMatchCancellation(input.matchId, input.requestedBy, input.note);
        // WhatsApp alert to admin — look up both parties
        const allMatches = await getAllConfirmedMatches();
        const theMatch = allMatches.find(m => m.id === input.matchId);
        if (theMatch) {
          const { getTutorProfileById: getTutorProfForCancel, getStudentProfileById: getStudentProfForCancel } = await import('./db');
          const tProf = await getTutorProfForCancel(theMatch.tutorProfileId).catch(() => null);
          const sProf = await getStudentProfForCancel(theMatch.studentProfileId).catch(() => null);
          if (tProf && sProf) {
            const isParent = input.requestedBy === 'parent';
            notifyAdminCancellationRequested({
              requestedBy: input.requestedBy,
              requesterName: isParent ? sProf.name : tProf.name,
              requesterPhone: isParent ? (sProf.phone ?? '') : (tProf.phone ?? ''),
              otherPartyName: isParent ? tProf.name : sProf.name,
              otherPartyPhone: isParent ? (tProf.phone ?? '') : (sProf.phone ?? ''),
              studentName: theMatch.studentName ?? sProf.studentName ?? 'Student',
              reason: input.note,
            }).catch(() => {});
          }
        }
        return { success: true };
      }),

    /** Admin: approve cancellation — sets classStatus to 'cancelled' */
    adminApproveCancellation: adminProcedure
      .input(z.object({ matchId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await approveMatchCancellation(input.matchId);
        return { success: true };
      }),

    /** Admin: list all cancellation requests */
    listCancellationRequests: adminProcedure.query(async () => getCancellationRequests()),

    /** Tutor: get active student IDs (to exclude from find-students) */
    getActiveStudentIds: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getTutorProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return getActiveStudentIdsForTutor(profile.id);
    }),

    /** Student/parent: get active tutor IDs (to block browsing) */
    getActiveTutorIds: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getStudentProfileByUserId(ctx.user.id);
      if (!profile) return [];
      return getActiveTutorIdsForStudent(profile.id);
    }),
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

    /** Tutor or parent/student: view digital session entries for their own class. */
    getOnlineEntries: protectedProcedure
      .input(z.object({ matchId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const log = await getSessionLogByMatchId(input.matchId);
        if (!log) return [];
        if (ctx.user.role !== "admin") {
          const [tutor, student] = await Promise.all([
            getTutorProfileByUserId(ctx.user.id),
            getStudentProfileByUserId(ctx.user.id),
          ]);
          const isParticipant = tutor?.id === log.tutorProfileId || student?.id === log.studentProfileId;
          if (!isParticipant) throw new Error("Not authorised to view this session log");
        }
        return getSessionLogEntries(log.id);
      }),

    /** Tutor: record one completed online teaching session. */
    addOnlineEntry: protectedProcedure
      .input(z.object({
        matchId: z.number().int().positive(),
        sessionDate: z.string().min(4).max(32),
        duration: z.string().min(1).max(64),
        topicsCovered: z.string().min(2).max(3000),
        homeworkNotes: z.string().max(3000).optional(),
        tutorNotes: z.string().max(3000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const [tutor, match] = await Promise.all([
          getTutorProfileByUserId(ctx.user.id),
          getAllConfirmedMatches().then(all => all.find(item => item.id === input.matchId)),
        ]);
        if (!tutor || !match || match.tutorProfileId !== tutor.id) throw new Error("Not authorised to update this session log");
        const log = await getOrCreateSessionLog(input.matchId, {
          tutorProfileId: match.tutorProfileId,
          studentProfileId: match.studentProfileId,
          tutorName: match.tutorName,
          studentName: match.studentName,
        });
        if (log.paymentStatus === "payment_processed") throw new Error("This session log has already been paid and is locked");
        const entry = await createSessionLogEntry({ ...input, sessionLogId: log.id });
        return { success: true, entry, logId: log.id };
      }),

    /** Tutor: submit recorded online sessions for parent payment and EduNest review. */
    submitOnlineLog: protectedProcedure
      .input(z.object({ matchId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const [tutor, match] = await Promise.all([
          getTutorProfileByUserId(ctx.user.id),
          getAllConfirmedMatches().then(all => all.find(item => item.id === input.matchId)),
        ]);
        if (!tutor || !match || match.tutorProfileId !== tutor.id) throw new Error("Not authorised to submit this session log");
        const log = await getOrCreateSessionLog(input.matchId, {
          tutorProfileId: match.tutorProfileId,
          studentProfileId: match.studentProfileId,
          tutorName: match.tutorName,
          studentName: match.studentName,
        });
        const entries = await getSessionLogEntries(log.id);
        if (entries.length === 0) throw new Error("Add at least one session before submitting the online log");
        if (log.paymentStatus === "payment_processed") throw new Error("This session log has already been paid and is locked");
        await submitOnlineSessionLog(log.id);

        const student = await import("./db").then(m => m.getStudentProfileById(match.studentProfileId));
        if (student?.email) {
          await sendParentPayNowEmail({
            parentEmail: student.email,
            parentName: student.name ?? "Parent",
            tutorName: tutor.name,
            amount: student.budget ? String(student.budget) : null,
          }).catch(() => {});
        }
        notifyAdminSheetUploaded({
          tutorName: tutor.name,
          tutorPhone: tutor.phone ?? "",
          parentName: student?.name ?? "Parent",
          parentPhone: student?.phone ?? "",
          studentName: match.studentName ?? student?.studentName ?? "Student",
          sheetUrl: "Online session log submitted",
        }).catch(() => {});
        return { success: true, logId: log.id, entryCount: entries.length };
      }),

    /** Admin/Tutor/Student: get a presigned URL for the uploaded sheet */
    getSignedSheetUrl: protectedProcedure
      .input(z.object({ logId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const log = await getSessionLogById(input.logId);
        if (!log?.uploadedSheetUrl) return { url: null };
        const rawUrl = log.uploadedSheetUrl;
        // If already a full HTTP URL (legacy), return as-is
        if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
          return { url: rawUrl };
        }
        // Extract key from /manus-storage/{key} path
        const key = rawUrl.replace(/^\/manus-storage\//, '');
        try {
          const { storageGetSignedUrl } = await import('./storage');
          const signedUrl = await storageGetSignedUrl(key);
          return { url: signedUrl };
        } catch {
          // Fallback to relative path (works in dev)
          return { url: rawUrl };
        }
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
        return { success: true };
      }),

    /**
     * Tutor: upload completed session sheet via base64 (tRPC-native, no multipart).
     * Accepts base64-encoded file data, uploads to S3, updates the session log.
     */
    uploadSheetFile: protectedProcedure
      .input(z.object({
        matchId: z.number().int().positive(),
        fileBase64: z.string().min(1).max(15 * 1024 * 1024), // ~10 MB in base64
        mimeType: z.string().max(64).default('image/jpeg'),
        fileName: z.string().max(256).default('sheet.jpg'),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify tutor owns this match
        const profile = await getTutorProfileByUserId(ctx.user.id);
        if (!profile) throw new Error('Tutor profile not found');
        const match = await getAllConfirmedMatches().then(all => all.find(m => m.id === input.matchId));
        if (!match) throw new Error('Match not found');
        if (match.tutorProfileId !== profile.id) throw new Error('Not authorised to upload for this match');

        // Decode base64 → Buffer
        const buffer = Buffer.from(input.fileBase64, 'base64');
        if (buffer.length === 0) throw new Error('Empty file received');
        if (buffer.length > 10 * 1024 * 1024) throw new Error('File too large (max 10 MB)');

        // Derive extension
        const extMap: Record<string, string> = {
          'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
          'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif',
          'application/pdf': 'pdf',
        };
        const ext = extMap[input.mimeType] ?? 'jpg';
        const key = `session-sheets/sheet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

        const { storagePut } = await import('./storage');
        const { url } = await storagePut(key, buffer, input.mimeType);
        console.log(`[Upload] Session sheet uploaded via tRPC: ${key} (${buffer.length} bytes)`);

        // Get or create session log, then update with URL
        const log = await getOrCreateSessionLog(input.matchId, {
          tutorProfileId: match.tutorProfileId,
          studentProfileId: match.studentProfileId,
          tutorName: match.tutorName,
          studentName: match.studentName,
        });
        await updateSessionLogSheet(log.id, url);


        // Email parent/student to pay now + WhatsApp alert to admin
        const { getStudentProfileById } = await import('./db');
        const studentProf = await getStudentProfileById(match.studentProfileId).catch(() => null);
        if (studentProf?.email) {
          await sendParentPayNowEmail({
            parentEmail: studentProf.email,
            parentName: studentProf.name ?? 'Parent',
            tutorName: profile.name,
            amount: studentProf.budget ? String(studentProf.budget) : null,
          }).catch(() => {});
        }
        // WhatsApp alert to admin
        notifyAdminSheetUploaded({
          tutorName: profile.name,
          tutorPhone: profile.phone ?? '',
          parentName: studentProf?.name ?? 'Parent',
          parentPhone: studentProf?.phone ?? '',
          studentName: match.studentName ?? studentProf?.studentName ?? 'Student',
          sheetUrl: url,
        }).catch(() => {});

        return { success: true, url };
      }),

    /**
     * Parent/Student: mark that they have paid EduNest via UPI.
     * Sets paymentStatus → parent_paid; admin will then approve and notify tutor.
     */
    markParentPaid: protectedProcedure
      .input(z.object({
        logId: z.number().int().positive(),
        note: z.string().max(256).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify the log belongs to this student
        const log = await getSessionLogById(input.logId);
        if (!log) throw new Error('Session log not found');
        const profile = await getStudentProfileByUserId(ctx.user.id);
        if (!profile || log.studentProfileId !== profile.id) throw new Error('Not authorised');
        if (log.paymentStatus !== 'sheet_uploaded') throw new Error('Sheet must be uploaded before payment can be marked');
        await markSessionLogParentPaid(input.logId, input.note);
        // WhatsApp alert to admin
        const { getTutorProfileById: getTutorProfById } = await import('./db');
        const tutorProfForPayment = await getTutorProfById(log.tutorProfileId).catch(() => null);
        notifyAdminParentPaid({
          parentName: profile.name,
          parentPhone: profile.phone ?? '',
          tutorName: tutorProfForPayment?.name ?? 'Tutor',
          tutorPhone: tutorProfForPayment?.phone ?? '',
          studentName: log.studentName ?? 'Student',
        }).catch(() => {});
        return { success: true };
      }),

    /** Admin: list all session logs */
    listAll: adminProcedure.query(async () => getAllSessionLogs()),

    /** Admin: list all individual online session entries for review and export. */
    listAllOnlineEntries: adminProcedure.query(async () => getAllOnlineSessionLogEntries()),

    /** Admin: force-mark payment as paid (bypasses parent step) — sets parent_paid then payment_processed */
    adminMarkAsPaid: adminProcedure
      .input(z.object({ logId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const log = await getSessionLogById(input.logId);
        if (!log) throw new Error('Session log not found');
        // Allow marking paid from any non-processed status (sheet_uploaded or parent_paid)
        if (log.paymentStatus === 'payment_processed') throw new Error('Payment already processed');
        const onlineEntries = await getSessionLogEntries(log.id);
        if (!log.uploadedSheetUrl && onlineEntries.length === 0) throw new Error('An uploaded sheet or online session log is required before marking as paid');
        // Directly set to payment_processed
        await updateSessionLogPaymentStatus(input.logId, 'payment_processed');
        // Email tutor
        const { getTutorProfileById } = await import('./db');
        const tutorProfile = await getTutorProfileById(log.tutorProfileId).catch(() => null);
        if (tutorProfile?.email) {
          await sendTutorFeePaidEmail({
            tutorEmail: tutorProfile.email,
            tutorName: tutorProfile.name,
            studentName: log.studentName ?? 'your student',
            upiId: (tutorProfile as any).upiId ?? null,
            amount: null,
          }).catch(() => {});
        }
        // Email student/parent
        const { getStudentProfileById } = await import('./db');
        const studentProfile = await getStudentProfileById(log.studentProfileId).catch(() => null);
        if (studentProfile?.email) {
          const { sendPaymentConfirmedToParentEmail } = await import('./email');
          await sendPaymentConfirmedToParentEmail({
            parentEmail: studentProfile.email,
            parentName: studentProfile.name ?? 'Parent',
            tutorName: tutorProfile?.name ?? 'your tutor',
          }).catch(() => {});
        }
        return { success: true };
      }),

    /** Admin: approve payment — sets payment_processed and emails tutor */
    approvePayment: adminProcedure
      .input(z.object({ logId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const log = await getSessionLogById(input.logId);
        if (!log) throw new Error('Session log not found');
        await updateSessionLogPaymentStatus(input.logId, 'payment_processed');
        // Look up tutor's UPI ID and email to notify them
        const { getTutorProfileById } = await import('./db');
        const tutorProfile = await getTutorProfileById(log.tutorProfileId).catch(() => null);
        if (tutorProfile?.email) {
          await sendTutorFeePaidEmail({
            tutorEmail: tutorProfile.email,
            tutorName: tutorProfile.name,
            studentName: log.studentName ?? 'your student',
            upiId: (tutorProfile as any).upiId ?? null,
            amount: null, // amount not stored separately yet
          }).catch(() => {});
        }
        return { success: true };
      }),

    /** Admin: reset to sheet_uploaded (undo) */
    resetPayment: adminProcedure
      .input(z.object({ logId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await updateSessionLogPaymentStatus(input.logId, 'sheet_uploaded');
        return { success: true };
      }),
  }),

  // ─── Admin: Cancelled Classes ──────────────────────────────────────────────
  cancelledClasses: router({
    list: adminProcedure.query(async () => getCancelledConfirmedMatches()),
  }),

  // ─── Admin: Smart Pairs ────────────────────────────────────────────────────
  smartPairs: router({
    list: adminProcedure.query(async () => getSmartPairs()),

    listContacted: adminProcedure.query(async () => getSmartPairContacts()),

    markContacted: adminProcedure
      .input(z.object({
        tutorProfileId: z.number(),
        studentProfileId: z.number(),
        notes: z.string().optional(),
        contactedBy: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminName = ctx.user.name ?? 'Admin';
        await markSmartPairContacted(
          input.tutorProfileId,
          input.studentProfileId,
          input.contactedBy ?? adminName,
          input.notes,
        );
        return { success: true };
      }),

    sendTutorEmail: adminProcedure
      .input(z.object({
        tutorProfileId: z.number(),
        studentProfileId: z.number(),
        tutorEmail: z.string().email(),
        tutorName: z.string(),
        studentName: z.string(),
        studentGrade: z.string(),
        studentSubjects: z.string(),
        studentArea: z.string(),
        distanceKm: z.number(),
      }))
      .mutation(async ({ input }) => {
        await sendSmartPairEmailToTutor({
          tutorEmail: input.tutorEmail,
          tutorName: input.tutorName,
          studentName: input.studentName,
          studentGrade: input.studentGrade,
          studentSubjects: input.studentSubjects,
          studentArea: input.studentArea,
          distanceKm: input.distanceKm,
        });
        await markSmartPairTutorEmailSent(input.tutorProfileId, input.studentProfileId);
        return { success: true };
      }),

    sendStudentEmail: adminProcedure
      .input(z.object({
        tutorProfileId: z.number(),
        studentProfileId: z.number(),
        studentEmail: z.string().email(),
        studentName: z.string(),
        tutorName: z.string(),
        tutorSubjects: z.string(),
        tutorArea: z.string(),
        tutorQualification: z.string(),
        distanceKm: z.number(),
      }))
      .mutation(async ({ input }) => {
        await sendSmartPairEmailToStudent({
          studentEmail: input.studentEmail,
          studentName: input.studentName,
          tutorName: input.tutorName,
          tutorSubjects: input.tutorSubjects,
          tutorArea: input.tutorArea,
          tutorQualification: input.tutorQualification,
          distanceKm: input.distanceKm,
        });
        await markSmartPairStudentEmailSent(input.tutorProfileId, input.studentProfileId);
        return { success: true };
      }),

    /**
     * Admin: move a Smart Pair directly to a scheduled demo slot.
     * Creates the demo interest + demo slot without either party needing to act.
     */
    moveToDemoSlot: adminProcedure
      .input(z.object({
        tutorProfileId: z.number(),
        studentProfileId: z.number(),
        scheduledDate: z.string().min(1).max(32).trim(),
        scheduledTime: z.string().min(1).max(32).trim(),
        mode: z.enum(['home_tuition', 'online', 'both']).default('home_tuition'),
        notes: z.string().max(500).trim().optional(),
        // For notification emails
        tutorName: z.string().optional(),
        tutorEmail: z.string().email().optional(),
        studentName: z.string().optional(),
        studentEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const slot = await adminCreateDemoSlotForPair(
          input.studentProfileId,
          input.tutorProfileId,
          input.scheduledDate,
          input.scheduledTime,
          input.mode,
          input.notes,
        );


        // Send notification emails to both parties if emails are provided
        if (input.tutorEmail && input.tutorName && input.studentName) {
          sendSmartPairEmailToTutor({
            tutorEmail: input.tutorEmail,
            tutorName: input.tutorName,
            studentName: input.studentName,
            studentGrade: '',
            studentSubjects: '',
            studentArea: '',
            distanceKm: 0,
          }).catch(() => {});
        }
        if (input.studentEmail && input.studentName && input.tutorName) {
          sendSmartPairEmailToStudent({
            studentEmail: input.studentEmail,
            studentName: input.studentName,
            tutorName: input.tutorName,
            tutorSubjects: '',
            tutorArea: '',
            tutorQualification: '',
            distanceKm: 0,
          }).catch(() => {});
        }

        return { success: true, slotId: slot.id };
      }),
  }),

  // ── Admin: Hold Management & Manual Registration ───────────────────────────────────
  adminManage: router({
    // Hold a tutor profile
    holdTutor: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().min(3).max(500) }))
      .mutation(async ({ ctx, input }) => {
        await holdTutorProfile(input.id, input.reason, ctx.user.name ?? 'Admin');
        return { success: true };
      }),

    // Unhold a tutor profile
    unholdTutor: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await unholdTutorProfile(input.id);
        return { success: true };
      }),

    // Hold a student/parent profile
    holdStudent: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().min(3).max(500) }))
      .mutation(async ({ ctx, input }) => {
        await holdStudentProfile(input.id, input.reason, ctx.user.name ?? 'Admin');
        return { success: true };
      }),

    // Unhold a student/parent profile
    unholdStudent: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await unholdStudentProfile(input.id);
        return { success: true };
      }),

    // Get all currently held profiles
    getHeldProfiles: adminProcedure.query(async () => getAllHeldProfiles()),

    // Admin manually creates a tutor profile (bypasses OAuth)
    createTutor: adminProcedure
      .input(z.object({
        name: z.string().min(2).max(128),
        email: z.string().email(),
        phone: z.string().min(10).max(20),
        qualification: z.string().min(2).max(256),
        subjects: z.string().min(2).max(512),
        experience: z.string().min(1).max(64),
        boards: z.string().max(256).optional(),
        languages: z.string().max(256).optional(),
        mode: z.enum(['home_tuition', 'online', 'both']),
        bio: z.string().max(2000).optional(),
        area: z.string().max(128).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        upiId: z.string().max(64).optional(),
        fullAddress: z.string().max(500).optional(),
        latitude: z.string().max(32).optional(),
        longitude: z.string().max(32).optional(),
      }))
      .mutation(async ({ input }) => {
        const profile = await adminCreateTutorProfile(input);
        return { success: true, profile };
      }),

    // Admin manually creates a student/parent profile (bypasses OAuth)
    createStudent: adminProcedure
      .input(z.object({
        name: z.string().min(2).max(128),
        email: z.string().email(),
        phone: z.string().min(10).max(20),
        role: z.enum(['student', 'parent']),
        studentName: z.string().max(128).optional(),
        grade: z.string().min(1).max(64),
        board: z.enum(['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other']),
        stream: z.string().max(128).optional(),
        subjects: z.string().min(2).max(512),
        mode: z.enum(['home_tuition', 'online', 'both']),
        area: z.string().max(128).optional(),
        budget: z.string().max(64).optional(),
        demoTime: z.string().max(128).optional(),
        regularTime: z.string().max(128).optional(),
        daysPerWeek: z.string().max(128).optional(),
        sessionsPerWeek: z.string().max(32).optional(),
        sessionDuration: z.string().max(64).optional(),
        specialRequirements: z.string().max(2000).optional(),
        tutorGenderPreference: z.enum(['male', 'female', 'no_preference']).optional(),
        fullAddress: z.string().max(500).optional(),
        latitude: z.string().max(32).optional(),
        longitude: z.string().max(32).optional(),
      }))
      .mutation(async ({ input }) => {
        const profile = await adminCreateStudentProfile(input);
        return { success: true, profile };
      }),
  }),
});
export type AppRouter = typeof appRouter;
