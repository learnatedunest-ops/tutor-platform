import { and, desc, eq, ne, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { DemoBooking, demoBookings, InsertDemoBooking, InsertInquiry, InsertStudentRequirement, InsertTutor, InsertTutorApplication, inquiries, InsertUser, StudentRequirement, studentRequirements, tutorApplications, tutors, Tutor, User, users, TutorInterest, tutorInterests, StudentProfile, studentProfiles, TutorProfile, tutorProfiles, InsertTutorProfile, InsertStudentProfile, StudentDemoInterest, studentDemoInterests, OtpVerification, otpVerifications, DemoSlot, demoSlots, ConfirmedMatch, confirmedMatches, SessionLog, sessionLogs } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(openId: string, role: 'admin' | 'user'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ role }).where(eq(users.openId, openId));
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export async function createInquiry(data: InsertInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inquiries).values(data);
}

export async function getAllInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

export async function updateInquiryStatus(id: number, status: "new" | "contacted" | "resolved") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
}

// ─── Tutor Applications ───────────────────────────────────────────────────────

export async function createTutorApplication(data: InsertTutorApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tutorApplications).values(data);
}

export async function getAllTutorApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorApplications).orderBy(desc(tutorApplications.createdAt));
}

export async function updateTutorApplicationStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tutorApplications).set({ status }).where(eq(tutorApplications.id, id));
}

// ─── Demo Bookings ────────────────────────────────────────────────────────────────

export async function createDemoBooking(data: InsertDemoBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(demoBookings).values(data);
}

export async function getAllDemoBookings(): Promise<DemoBooking[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(demoBookings).orderBy(desc(demoBookings.createdAt));
}

export async function updateDemoBookingStatus(id: number, status: "pending" | "confirmed" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(demoBookings).set({ status }).where(eq(demoBookings.id, id));
}

// ─── Tutors ───────────────────────────────────────────────────────────────────

export async function createTutor(data: InsertTutor): Promise<Tutor> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tutors).values(data);
  const result = await db.select().from(tutors).orderBy(desc(tutors.createdAt)).limit(1);
  return result[0]!;
}

export async function getAllTutors(): Promise<Tutor[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutors).where(eq(tutors.isActive, "yes")).orderBy(desc(tutors.createdAt));
}

export async function getAllTutorsAdmin(): Promise<Tutor[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutors).orderBy(desc(tutors.createdAt));
}

export async function getTutorById(id: number): Promise<Tutor | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tutors).where(eq(tutors.id, id)).limit(1);
  return result[0];
}

export async function updateTutor(id: number, data: Partial<InsertTutor>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tutors).set(data).where(eq(tutors.id, id));
}

export async function deleteTutor(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tutors).where(eq(tutors.id, id));
}

export async function getDemoBookingsByEmail(email: string): Promise<DemoBooking[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(demoBookings).where(eq(demoBookings.studentEmail, email)).orderBy(desc(demoBookings.createdAt));
}

// ─── Student Requirements ────────────────────────────────────────────────────────────────────────────────

export async function createStudentRequirement(data: InsertStudentRequirement): Promise<StudentRequirement> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(studentRequirements).values(data);
  const result = await db.select().from(studentRequirements).orderBy(desc(studentRequirements.createdAt)).limit(1);
  return result[0]!;
}

export async function getAllStudentRequirements(): Promise<StudentRequirement[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentRequirements).orderBy(desc(studentRequirements.createdAt));
}

export async function updateStudentRequirementStatus(
  id: number,
  status: "new" | "matching" | "matched" | "closed",
  matchData?: { matchedTutorId?: number; matchedTutorName?: string; matchNotes?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(studentRequirements).set({ status, ...matchData }).where(eq(studentRequirements.id, id));
}

// ─── Referrals ────────────────────────────────────────────────────────────────

import { referrals, InsertReferral, Referral } from "../drizzle/schema";

export async function createReferral(data: Omit<InsertReferral, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(referrals).values(data);
}

export async function getAllReferrals(): Promise<Referral[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referrals).orderBy(desc(referrals.createdAt));
}

export async function updateReferralStatus(
  id: number,
  status: "pending" | "joined" | "rewarded",
  discountApplied?: "yes" | "no"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (discountApplied) updateData.discountApplied = discountApplied;
  await db.update(referrals).set(updateData as Partial<InsertReferral>).where(eq(referrals.id, id));
}

// ─── Tutor Profiles ───────────────────────────────────────────────────────────

// (imports consolidated at top of file)

export async function upsertTutorProfile(
  userId: number,
  data: Omit<InsertTutorProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<TutorProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(tutorProfiles).set({ ...data, updatedAt: new Date() }).where(eq(tutorProfiles.userId, userId));
  } else {
    await db.insert(tutorProfiles).values({ userId, ...data });
  }
  const result = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getTutorProfileByUserId(userId: number): Promise<TutorProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function getTutorProfileById(id: number): Promise<TutorProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tutorProfiles).where(eq(tutorProfiles.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllTutorProfiles(): Promise<TutorProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorProfiles).orderBy(desc(tutorProfiles.createdAt));
}

export async function updateTutorProfileStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  tutorTableId?: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Partial<InsertTutorProfile> = { status };
  if (tutorTableId !== undefined) updateData.tutorTableId = tutorTableId;
  await db.update(tutorProfiles).set(updateData).where(eq(tutorProfiles.id, id));
}

// ─── Student Profiles ─────────────────────────────────────────────────────────

export async function upsertStudentProfile(
  userId: number,
  data: Omit<InsertStudentProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<StudentProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(studentProfiles).set({ ...data, updatedAt: new Date() }).where(eq(studentProfiles.userId, userId));
  } else {
    await db.insert(studentProfiles).values({ userId, ...data });
  }
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getStudentProfileById(id: number): Promise<StudentProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getStudentProfileByUserId(userId: number): Promise<StudentProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function getActiveStudentProfiles(): Promise<StudentProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentProfiles)
    .where(eq(studentProfiles.isActive, "yes"))
    .orderBy(desc(studentProfiles.createdAt));
}

export async function getApprovedTutorProfiles(): Promise<TutorProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorProfiles)
    .where(eq(tutorProfiles.status, "approved"))
    .orderBy(desc(tutorProfiles.createdAt));
}

export async function setUserRole(userId: number, userRole: "tutor" | "student"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ userRole }).where(eq(users.id, userId));
}

export async function getUserById(id: number): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

// ─── Tutor Interests ─────────────────────────────────────────────────────────────────────────────────

export async function createTutorInterest(
  tutorProfileId: number,
  studentProfileId: number,
  message?: string
): Promise<TutorInterest> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Prevent duplicate interests
  const existing = await db.select().from(tutorInterests)
    .where(and(eq(tutorInterests.tutorProfileId, tutorProfileId), eq(tutorInterests.studentProfileId, studentProfileId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(tutorInterests).values({ tutorProfileId, studentProfileId, message });
  const result = await db.select().from(tutorInterests)
    .where(and(eq(tutorInterests.tutorProfileId, tutorProfileId), eq(tutorInterests.studentProfileId, studentProfileId)))
    .limit(1);
  return result[0];
}

export async function getTutorInterestsByTutor(tutorProfileId: number): Promise<TutorInterest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorInterests)
    .where(eq(tutorInterests.tutorProfileId, tutorProfileId))
    .orderBy(desc(tutorInterests.createdAt));
}

export async function getAllTutorInterests(): Promise<TutorInterest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorInterests).orderBy(desc(tutorInterests.createdAt));
}

export async function updateTutorInterestStatus(
  id: number,
  status: "pending" | "accepted" | "declined"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tutorInterests).set({ status }).where(eq(tutorInterests.id, id));
}

/** @deprecated admin gate removed — kept for compatibility, now a no-op */
export async function updateTutorInterestAdminStatus(
  _id: number,
  _adminApprovalStatus: string
): Promise<void> {
  // No-op: adminApprovalStatus column removed from schema
}

/** Get tutor interests that admin has approved — visible to the student */
export async function getAdminApprovedTutorInterestsByStudent(studentProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: tutorInterests.id,
      tutorProfileId: tutorInterests.tutorProfileId,
      studentProfileId: tutorInterests.studentProfileId,
      message: tutorInterests.message,
      status: tutorInterests.status,
      createdAt: tutorInterests.createdAt,
      // Tutor profile info (no contact details)
      tutorName: tutorProfiles.name,
      tutorQualification: tutorProfiles.qualification,
      tutorSubjects: tutorProfiles.subjects,
      tutorExperience: tutorProfiles.experience,
      tutorMode: tutorProfiles.mode,
      tutorArea: tutorProfiles.area,
      tutorEducation: tutorProfiles.education,
    })
    .from(tutorInterests)
    .leftJoin(tutorProfiles, eq(tutorProfiles.id, tutorInterests.tutorProfileId))
    .where(eq(tutorInterests.studentProfileId, studentProfileId))
    .orderBy(desc(tutorInterests.createdAt));
  return rows;
}

/** Get all student demo interests for a tutor — no admin gate, direct visibility */
export async function getAllDemoInterestsByTutor(tutorProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: studentDemoInterests.id,
      studentProfileId: studentDemoInterests.studentProfileId,
      tutorProfileId: studentDemoInterests.tutorProfileId,
      message: studentDemoInterests.message,
      status: studentDemoInterests.status,
      createdAt: studentDemoInterests.createdAt,
      updatedAt: studentDemoInterests.updatedAt,
      // Student profile info (no contact details until demo scheduled)
      studentName: studentProfiles.name,
      studentGrade: studentProfiles.grade,
      studentSubjects: studentProfiles.subjects,
      studentMode: studentProfiles.mode,
      studentArea: studentProfiles.area,
      studentBoard: studentProfiles.board,
    })
    .from(studentDemoInterests)
    .leftJoin(studentProfiles, eq(studentProfiles.id, studentDemoInterests.studentProfileId))
    .where(eq(studentDemoInterests.tutorProfileId, tutorProfileId))
    .orderBy(desc(studentDemoInterests.createdAt));
  return rows;
}

export async function getAllStudentProfiles(): Promise<StudentProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentProfiles).orderBy(desc(studentProfiles.createdAt));
}

// ─── Student Demo Interests ────────────────────────────────────────────────
export async function createStudentDemoInterest(
  studentProfileId: number,
  tutorProfileId: number,
  message?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(studentDemoInterests).values({ studentProfileId, tutorProfileId, message: message ?? null });
}

export async function getStudentDemoInterestsByStudent(studentProfileId: number): Promise<StudentDemoInterest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentDemoInterests)
    .where(eq(studentDemoInterests.studentProfileId, studentProfileId))
    .orderBy(desc(studentDemoInterests.createdAt));
}

export async function getStudentDemoInterestByPair(
  studentProfileId: number,
  tutorProfileId: number
): Promise<StudentDemoInterest | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(studentDemoInterests)
    .where(and(
      eq(studentDemoInterests.studentProfileId, studentProfileId),
      eq(studentDemoInterests.tutorProfileId, tutorProfileId)
    ));
  return rows[0] ?? null;
}

export async function getAllStudentDemoInterests(): Promise<StudentDemoInterest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentDemoInterests).orderBy(desc(studentDemoInterests.createdAt));
}

export async function updateStudentDemoInterestStatus(
  id: number,
  status: "pending" | "confirmed" | "cancelled"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(studentDemoInterests).set({ status }).where(eq(studentDemoInterests.id, id));
}

/** @deprecated admin gate removed — kept for compatibility, now a no-op */
export async function updateStudentDemoInterestAdminStatus(
  _id: number,
  _adminApprovalStatus: string
): Promise<void> {
  // No-op: adminApprovalStatus column removed from schema
}

/** @deprecated use getAllDemoInterestsByTutor instead — admin gate removed */
export async function getAdminApprovedDemoInterestsByTutor(tutorProfileId: number): Promise<StudentDemoInterest[]> {
  return getAllDemoInterestsByTutor(tutorProfileId) as any;
}

// ─── OTP Verifications ─────────────────────────────────────────────────────────
export async function createOtp(phone: string, code: string, expiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(otpVerifications).values({ phone, code, expiresAt, verified: "no" });
}

export async function getLatestOtp(phone: string): Promise<OtpVerification | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(otpVerifications)
    .where(eq(otpVerifications.phone, phone))
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function markOtpVerified(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(otpVerifications).set({ verified: "yes" }).where(eq(otpVerifications.id, id));
}

export async function markTutorPhoneVerified(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tutorProfiles).set({ phoneVerified: "yes" }).where(eq(tutorProfiles.userId, userId));
}

export async function markStudentPhoneVerified(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(studentProfiles).set({ phoneVerified: "yes" }).where(eq(studentProfiles.userId, userId));
}

// ─── Demo Slots ────────────────────────────────────────────────────────────────
export async function createDemoSlot(
  studentDemoInterestId: number,
  studentProfileId: number,
  tutorProfileId: number,
  mode: "home_tuition" | "online" | "both",
  interestDirection: "tutor_to_student" | "student_to_tutor" = "student_to_tutor"
): Promise<DemoSlot> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // For student-initiated, parentAccepted is 'yes' (they already initiated)
  // For tutor-initiated, parentAccepted starts as 'pending' (parent must accept first)
  const parentAccepted = interestDirection === "student_to_tutor" ? "yes" : "pending";
  await db.insert(demoSlots).values({
    studentDemoInterestId,
    studentProfileId,
    tutorProfileId,
    mode,
    status: "pending_schedule",
    interestDirection,
    parentAccepted,
  });
  const rows = await db.select().from(demoSlots)
    .where(eq(demoSlots.studentDemoInterestId, studentDemoInterestId))
    .limit(1);
  return rows[0]!;
}

export async function updateDemoSlotParentAccepted(
  id: number,
  parentAccepted: "yes" | "no"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(demoSlots).set({ parentAccepted }).where(eq(demoSlots.id, id));
}

export async function getDemoSlotByInterestId(studentDemoInterestId: number): Promise<DemoSlot | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(demoSlots)
    .where(eq(demoSlots.studentDemoInterestId, studentDemoInterestId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getDemoSlotsByTutor(tutorProfileId: number): Promise<(DemoSlot & { confirmedMatchId: number | null; studentAddress: string | null; studentPhone: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: demoSlots.id,
      studentDemoInterestId: demoSlots.studentDemoInterestId,
      tutorProfileId: demoSlots.tutorProfileId,
      studentProfileId: demoSlots.studentProfileId,
      scheduledDate: demoSlots.scheduledDate,
      scheduledTime: demoSlots.scheduledTime,
      notes: demoSlots.notes,
      status: demoSlots.status,
      mode: demoSlots.mode,
      interestDirection: demoSlots.interestDirection,
      parentAccepted: demoSlots.parentAccepted,
      tutorConfirmedComing: demoSlots.tutorConfirmedComing,
      tutorSuggestedDate: demoSlots.tutorSuggestedDate,
      tutorSuggestedTime: demoSlots.tutorSuggestedTime,
      parentRescheduleResponse: demoSlots.parentRescheduleResponse,
      tutorProceedIntent: demoSlots.tutorProceedIntent,
      studentProceedIntent: demoSlots.studentProceedIntent,
      demoCancelledBy: demoSlots.demoCancelledBy,
      demoCancelledAt: demoSlots.demoCancelledAt,
      demoCancellationFeeCleared: demoSlots.demoCancellationFeeCleared,
      createdAt: demoSlots.createdAt,
      updatedAt: demoSlots.updatedAt,
      confirmedMatchId: confirmedMatches.id,
      studentAddress: studentProfiles.fullAddress,
      studentPhone: studentProfiles.phone,
      studentLat: studentProfiles.latitude,
      studentLng: studentProfiles.longitude,
      studentName: studentProfiles.name,
      studentChildName: studentProfiles.studentName,
      studentGrade: studentProfiles.grade,
      studentSubjects: studentProfiles.subjects,
      studentBudget: studentProfiles.budget,
      studentArea: studentProfiles.area,
      studentRole: studentProfiles.role,
    })
    .from(demoSlots)
    .leftJoin(confirmedMatches, eq(confirmedMatches.demoSlotId, demoSlots.id))
    .leftJoin(studentProfiles, eq(studentProfiles.id, demoSlots.studentProfileId))
    .where(eq(demoSlots.tutorProfileId, tutorProfileId))
    .orderBy(desc(demoSlots.createdAt));
  return rows.map(r => ({
    ...r,
    confirmedMatchId: r.confirmedMatchId ?? null,
    studentAddress: r.studentAddress ?? null,
    studentPhone: r.studentPhone ?? null,
    studentLat: r.studentLat ?? null,
    studentLng: r.studentLng ?? null,
    studentName: r.studentName ?? null,
    studentChildName: r.studentChildName ?? null,
    studentGrade: r.studentGrade ?? null,
    studentSubjects: r.studentSubjects ?? null,
    studentBudget: r.studentBudget ?? null,
    studentArea: r.studentArea ?? null,
    studentRole: r.studentRole ?? null,
  }));
}

export async function getDemoSlotsByStudent(studentProfileId: number): Promise<(DemoSlot & { confirmedMatchId: number | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: demoSlots.id,
      studentDemoInterestId: demoSlots.studentDemoInterestId,
      tutorProfileId: demoSlots.tutorProfileId,
      studentProfileId: demoSlots.studentProfileId,
      scheduledDate: demoSlots.scheduledDate,
      scheduledTime: demoSlots.scheduledTime,
      notes: demoSlots.notes,
      status: demoSlots.status,
      mode: demoSlots.mode,
      interestDirection: demoSlots.interestDirection,
      parentAccepted: demoSlots.parentAccepted,
      tutorConfirmedComing: demoSlots.tutorConfirmedComing,
      tutorSuggestedDate: demoSlots.tutorSuggestedDate,
      tutorSuggestedTime: demoSlots.tutorSuggestedTime,
      parentRescheduleResponse: demoSlots.parentRescheduleResponse,
      tutorProceedIntent: demoSlots.tutorProceedIntent,
      studentProceedIntent: demoSlots.studentProceedIntent,
      demoCancelledBy: demoSlots.demoCancelledBy,
      demoCancelledAt: demoSlots.demoCancelledAt,
      demoCancellationFeeCleared: demoSlots.demoCancellationFeeCleared,
      createdAt: demoSlots.createdAt,
      updatedAt: demoSlots.updatedAt,
      confirmedMatchId: confirmedMatches.id,
    })
    .from(demoSlots)
    .leftJoin(confirmedMatches, eq(confirmedMatches.demoSlotId, demoSlots.id))
    .where(eq(demoSlots.studentProfileId, studentProfileId))
    .orderBy(desc(demoSlots.createdAt));
  return rows.map(r => ({ ...r, confirmedMatchId: r.confirmedMatchId ?? null }));
}

export async function updateDemoSlotTutorConfirmedComing(
  id: number,
  value: "yes" | "no"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(demoSlots).set({ tutorConfirmedComing: value }).where(eq(demoSlots.id, id));
}

export async function updateDemoSlotTutorReschedule(
  id: number,
  suggestedDate: string,
  suggestedTime: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(demoSlots).set({
    tutorSuggestedDate: suggestedDate,
    tutorSuggestedTime: suggestedTime,
    tutorConfirmedComing: "no",
    parentRescheduleResponse: null,
  }).where(eq(demoSlots.id, id));
}

export async function updateDemoSlotParentRescheduleResponse(
  id: number,
  response: "accepted" | "declined"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (response === "accepted") {
    // Accept: copy tutor's suggested time into the scheduled fields
    const rows = await db.select().from(demoSlots).where(eq(demoSlots.id, id)).limit(1);
    const slot = rows[0];
    if (slot?.tutorSuggestedDate && slot?.tutorSuggestedTime) {
      await db.update(demoSlots).set({
        scheduledDate: slot.tutorSuggestedDate,
        scheduledTime: slot.tutorSuggestedTime,
        parentRescheduleResponse: "accepted",
        tutorConfirmedComing: "yes",
      }).where(eq(demoSlots.id, id));
    }
  } else {
    await db.update(demoSlots).set({ parentRescheduleResponse: "declined" }).where(eq(demoSlots.id, id));
  }
}

export async function updateDemoSlotSchedule(
  id: number,
  scheduledDate: string,
  scheduledTime: string,
  notes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(demoSlots).set({
    scheduledDate,
    scheduledTime,
    notes: notes ?? null,
    status: "scheduled",
  }).where(eq(demoSlots.id, id));
}

export async function updateDemoSlotStatus(
  id: number,
  status: "pending_schedule" | "scheduled" | "completed" | "cancelled"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(demoSlots).set({ status }).where(eq(demoSlots.id, id));
}

export async function getAllDemoSlots(): Promise<DemoSlot[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(demoSlots).orderBy(desc(demoSlots.createdAt));
}

// ─── Proceed Intent & Confirmed Matches ─────────────────────────────────────

/** Set tutor or student proceed intent on a demo slot */
export async function setDemoSlotProceedIntent(
  id: number,
  party: "tutor" | "student",
  intent: "yes" | "no"
): Promise<DemoSlot | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (party === "tutor") {
    await db.update(demoSlots).set({ tutorProceedIntent: intent }).where(eq(demoSlots.id, id));
  } else {
    await db.update(demoSlots).set({ studentProceedIntent: intent }).where(eq(demoSlots.id, id));
  }
  const rows = await db.select().from(demoSlots).where(eq(demoSlots.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Get a single demo slot by ID */
export async function getDemoSlotById(id: number): Promise<DemoSlot | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(demoSlots).where(eq(demoSlots.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Check if a confirmed match already exists for a demo slot */
export async function getConfirmedMatchBySlotId(demoSlotId: number): Promise<ConfirmedMatch | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(confirmedMatches).where(eq(confirmedMatches.demoSlotId, demoSlotId)).limit(1);
  return rows[0] ?? null;
}

/** Create a confirmed match record */
export async function createConfirmedMatch(data: {
  demoSlotId: number;
  tutorProfileId: number;
  studentProfileId: number;
  tutorName?: string | null;
  tutorEmail?: string | null;
  tutorPhone?: string | null;
  studentName?: string | null;
  studentEmail?: string | null;
  studentPhone?: string | null;
  studentArea?: string | null;
  studentGrade?: string | null;
  studentSubjects?: string | null;
  paymentAmount?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(confirmedMatches).values(data);
}

/** List all confirmed matches (admin) */
export async function getAllConfirmedMatches(): Promise<ConfirmedMatch[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(confirmedMatches).orderBy(desc(confirmedMatches.matchedAt));
}

/** Get confirmed matches for a specific tutor profile */
export async function getConfirmedMatchesByTutor(tutorProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      // confirmed match fields
      id: confirmedMatches.id,
      demoSlotId: confirmedMatches.demoSlotId,
      tutorProfileId: confirmedMatches.tutorProfileId,
      studentProfileId: confirmedMatches.studentProfileId,
      tutorName: confirmedMatches.tutorName,
      studentName: confirmedMatches.studentName,
      matchedAt: confirmedMatches.matchedAt,
      classStatus: confirmedMatches.classStatus,
      paymentAmount: confirmedMatches.paymentAmount,
      // student profile info
      studentPhone: studentProfiles.phone,
      studentEmail: studentProfiles.email,
      studentGrade: studentProfiles.grade,
      studentSubjects: studentProfiles.subjects,
      studentArea: studentProfiles.area,
      studentBudget: studentProfiles.budget,
      studentAddress: studentProfiles.fullAddress,
      studentLatitude: studentProfiles.latitude,
      studentLongitude: studentProfiles.longitude,
      // demo slot schedule info
      scheduledDate: demoSlots.scheduledDate,
      scheduledTime: demoSlots.scheduledTime,
      demoMode: demoSlots.mode,
      // cancellation info
      cancellationRequestedBy: confirmedMatches.cancellationRequestedBy,
      cancellationNote: confirmedMatches.cancellationNote,
      // session log info (per match)
      sessionLogId: sessionLogs.id,
      paymentStatus: sessionLogs.paymentStatus,
      uploadedSheetUrl: sessionLogs.uploadedSheetUrl,
    })
    .from(confirmedMatches)
    .leftJoin(studentProfiles, eq(studentProfiles.id, confirmedMatches.studentProfileId))
    .leftJoin(demoSlots, eq(demoSlots.id, confirmedMatches.demoSlotId))
    .leftJoin(sessionLogs, eq(sessionLogs.matchId, confirmedMatches.id))
    .where(eq(confirmedMatches.tutorProfileId, tutorProfileId))
    .orderBy(desc(confirmedMatches.matchedAt));
  return rows;
}

/** Update classStatus of a confirmed match (admin) */
export async function updateConfirmedMatchClassStatus(matchId: number, classStatus: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(confirmedMatches).set({ classStatus }).where(eq(confirmedMatches.id, matchId));
}

/** Request cancellation of a confirmed match (tutor or parent) */
export async function requestMatchCancellation(
  matchId: number,
  requestedBy: 'tutor' | 'parent',
  note?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(confirmedMatches)
    .set({
      classStatus: 'cancellation_requested',
      cancellationRequestedBy: requestedBy,
      cancellationRequestedAt: new Date(),
      cancellationNote: note ?? null,
    })
    .where(eq(confirmedMatches.id, matchId));
}

/** Admin: approve cancellation — sets classStatus to cancelled */
export async function approveMatchCancellation(matchId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(confirmedMatches)
    .set({ classStatus: 'cancelled' })
    .where(eq(confirmedMatches.id, matchId));
}

/** Check if a student has any active (non-cancelled) confirmed match with a given tutor */
export async function hasActiveMatchBetween(tutorProfileId: number, studentProfileId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: confirmedMatches.id })
    .from(confirmedMatches)
    .where(
      and(
        eq(confirmedMatches.tutorProfileId, tutorProfileId),
        eq(confirmedMatches.studentProfileId, studentProfileId),
        ne(confirmedMatches.classStatus, 'cancelled')
      )
    )
    .limit(1);
  return rows.length > 0;
}

/** Get all active confirmed match student IDs for a tutor (to exclude from find-students) */
export async function getActiveStudentIdsForTutor(tutorProfileId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ studentProfileId: confirmedMatches.studentProfileId })
    .from(confirmedMatches)
    .where(
      and(
        eq(confirmedMatches.tutorProfileId, tutorProfileId),
        ne(confirmedMatches.classStatus, 'cancelled')
      )
    );
  return rows.map(r => r.studentProfileId);
}

/** Get all active confirmed match tutor IDs for a student/parent (to block browsing) */
export async function getActiveTutorIdsForStudent(studentProfileId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ tutorProfileId: confirmedMatches.tutorProfileId })
    .from(confirmedMatches)
    .where(
      and(
        eq(confirmedMatches.studentProfileId, studentProfileId),
        ne(confirmedMatches.classStatus, 'cancelled')
      )
    );
  return rows.map(r => r.tutorProfileId);
}

/** Get all confirmed matches with cancellation_requested status (admin) */
export async function getCancellationRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(confirmedMatches)
    .where(eq(confirmedMatches.classStatus, 'cancellation_requested'))
    .orderBy(desc(confirmedMatches.cancellationRequestedAt));
}

/** Get confirmed matches for a specific student profile — enriched with tutor profile + session log */
export async function getConfirmedMatchesByStudent(studentProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      // confirmed match fields
      id: confirmedMatches.id,
      demoSlotId: confirmedMatches.demoSlotId,
      tutorProfileId: confirmedMatches.tutorProfileId,
      studentProfileId: confirmedMatches.studentProfileId,
      tutorName: confirmedMatches.tutorName,
      studentName: confirmedMatches.studentName,
      matchedAt: confirmedMatches.matchedAt,
      classStatus: confirmedMatches.classStatus,
      paymentAmount: confirmedMatches.paymentAmount,
      // tutor profile info (no contact details)
      tutorQualification: tutorProfiles.qualification,
      tutorSubjects: tutorProfiles.subjects,
      tutorExperience: tutorProfiles.experience,
      tutorMode: tutorProfiles.mode,
      tutorArea: tutorProfiles.area,
      tutorEducation: tutorProfiles.education,
      tutorPhoto: tutorProfiles.photo,
      // demo slot schedule info
      scheduledDate: demoSlots.scheduledDate,
      scheduledTime: demoSlots.scheduledTime,
      demoMode: demoSlots.mode,
      // cancellation info
      cancellationRequestedBy: confirmedMatches.cancellationRequestedBy,
      cancellationNote: confirmedMatches.cancellationNote,
      // session log info
      sessionLogId: sessionLogs.id,
      paymentStatus: sessionLogs.paymentStatus,
      uploadedSheetUrl: sessionLogs.uploadedSheetUrl,
    })
    .from(confirmedMatches)
    .leftJoin(tutorProfiles, eq(tutorProfiles.id, confirmedMatches.tutorProfileId))
    .leftJoin(demoSlots, eq(demoSlots.id, confirmedMatches.demoSlotId))
    .leftJoin(sessionLogs, eq(sessionLogs.matchId, confirmedMatches.id))
    .where(eq(confirmedMatches.studentProfileId, studentProfileId))
    .orderBy(desc(confirmedMatches.matchedAt));
  return rows;
}

// ─── Session Logs ────────────────────────────────────────────────────────────

/** Get or create a session log for a confirmed match */
export async function getOrCreateSessionLog(matchId: number, data: {
  tutorProfileId: number;
  studentProfileId: number;
  tutorName?: string | null;
  studentName?: string | null;
}): Promise<SessionLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(sessionLogs).where(eq(sessionLogs.matchId, matchId)).limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(sessionLogs).values({
    matchId,
    tutorProfileId: data.tutorProfileId,
    studentProfileId: data.studentProfileId,
    tutorName: data.tutorName ?? null,
    studentName: data.studentName ?? null,
    paymentStatus: "pending",
  });
  const created = await db.select().from(sessionLogs).where(eq(sessionLogs.matchId, matchId)).limit(1);
  return created[0];
}

/** Get session log by matchId */
export async function getSessionLogByMatchId(matchId: number): Promise<SessionLog | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(sessionLogs).where(eq(sessionLogs.matchId, matchId)).limit(1);
  return rows[0] ?? null;
}

/** Get session log by id */
export async function getSessionLogById(id: number): Promise<SessionLog | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(sessionLogs).where(eq(sessionLogs.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Update session log with uploaded sheet URL */
export async function updateSessionLogSheet(id: number, uploadedSheetUrl: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessionLogs)
    .set({ uploadedSheetUrl, uploadedAt: new Date(), paymentStatus: "sheet_uploaded" })
    .where(eq(sessionLogs.id, id));
}

/** Parent: mark that they have paid EduNest */
export async function markSessionLogParentPaid(id: number, note?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessionLogs)
    .set({ parentPaid: true, parentPaidAt: new Date(), parentPaymentNote: note ?? null, paymentStatus: "parent_paid" })
    .where(eq(sessionLogs.id, id));
}

/** Admin: update payment status */
export async function updateSessionLogPaymentStatus(id: number, status: "pending" | "sheet_uploaded" | "parent_paid" | "payment_processed"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Partial<SessionLog> = { paymentStatus: status };
  if (status === "payment_processed") updates.adminApprovedAt = new Date();
  await db.update(sessionLogs).set(updates).where(eq(sessionLogs.id, id));
}

/** List all session logs (admin) */
export async function getAllSessionLogs(): Promise<SessionLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionLogs).orderBy(desc(sessionLogs.createdAt));
}

/** Get session logs for a tutor */
export async function getSessionLogsByTutor(tutorProfileId: number): Promise<SessionLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionLogs).where(eq(sessionLogs.tutorProfileId, tutorProfileId)).orderBy(desc(sessionLogs.createdAt));
}

/** Get session logs for a student */
export async function getSessionLogsByStudent(studentProfileId: number): Promise<SessionLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionLogs).where(eq(sessionLogs.studentProfileId, studentProfileId)).orderBy(desc(sessionLogs.createdAt));
}

/** Get ALL student profile IDs that have an active (non-cancelled) confirmed class with any tutor */
export async function getAllActiveStudentIds(): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ studentProfileId: confirmedMatches.studentProfileId })
    .from(confirmedMatches)
    .where(ne(confirmedMatches.classStatus, 'cancelled'));
  return Array.from(new Set(rows.map(r => r.studentProfileId)));
}

/** Parent cancels a scheduled demo — sets demoCancelledBy, demoCancelledAt, status=cancelled */
export async function cancelDemoByParent(slotId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(demoSlots).set({
    demoCancelledBy: 'parent',
    demoCancelledAt: new Date(),
    demoCancellationFeeCleared: false,
    status: 'cancelled',
    updatedAt: new Date(),
  }).where(eq(demoSlots.id, slotId));
}

/** Admin clears the ₹350 cancellation fee for a demo slot */
export async function clearDemoCancellationFee(slotId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(demoSlots).set({
    demoCancellationFeeCleared: true,
    updatedAt: new Date(),
  }).where(eq(demoSlots.id, slotId));
}

/** Get all demo slots cancelled by parent with fee not yet cleared (for admin) */
export async function getCancelledDemosWithPendingFee(): Promise<DemoSlot[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(demoSlots)
    .where(and(eq(demoSlots.demoCancelledBy, 'parent'), eq(demoSlots.demoCancellationFeeCleared, false)))
    .orderBy(desc(demoSlots.demoCancelledAt));
}
