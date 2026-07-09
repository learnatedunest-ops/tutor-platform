import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { DemoBooking, demoBookings, InsertDemoBooking, InsertInquiry, InsertTutor, InsertTutorApplication, inquiries, InsertUser, tutorApplications, tutors, Tutor, users } from "../drizzle/schema";
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
