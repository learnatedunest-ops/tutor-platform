import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { DemoBooking, demoBookings, InsertDemoBooking, InsertInquiry, InsertStudentRequirement, InsertTutor, InsertTutorApplication, inquiries, InsertUser, StudentRequirement, studentRequirements, tutorApplications, tutors, Tutor, User, users, TutorInterest, tutorInterests } from "../drizzle/schema";
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

import { tutorProfiles, InsertTutorProfile, TutorProfile, studentProfiles, InsertStudentProfile, StudentProfile } from "../drizzle/schema";

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
