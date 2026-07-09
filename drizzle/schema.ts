import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contact / student inquiry form submissions
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: mysqlEnum("role", ["student", "parent", "tutor", "institution"]).notNull(),
  subject: varchar("subject", { length: 128 }),
  area: varchar("area", { length: 128 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "resolved"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Tutor registration / application form submissions
 */
export const tutorApplications = mysqlTable("tutor_applications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  qualification: varchar("qualification", { length: 256 }).notNull(),
  subjects: varchar("subjects", { length: 512 }).notNull(),
  experience: varchar("experience", { length: 64 }).notNull(),
  area: varchar("area", { length: 128 }).notNull(),
  mode: mysqlEnum("mode", ["home_tuition", "online", "both"]).notNull(),
  about: text("about"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutorApplication = typeof tutorApplications.$inferSelect;
export type InsertTutorApplication = typeof tutorApplications.$inferInsert;

/**
 * Demo class booking requests
 */
export const demoBookings = mysqlTable("demo_bookings", {
  id: int("id").autoincrement().primaryKey(),
  tutorName: varchar("tutorName", { length: 128 }).notNull(),
  tutorSubject: varchar("tutorSubject", { length: 128 }).notNull(),
  studentName: varchar("studentName", { length: 128 }).notNull(),
  studentEmail: varchar("studentEmail", { length: 320 }).notNull(),
  studentPhone: varchar("studentPhone", { length: 20 }).notNull(),
  grade: varchar("grade", { length: 64 }).notNull(),
  subject: varchar("subject", { length: 128 }).notNull(),
  preferredDate: varchar("preferredDate", { length: 32 }).notNull(),
  preferredTime: varchar("preferredTime", { length: 32 }).notNull(),
  mode: mysqlEnum("mode", ["home_tuition", "online"]).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DemoBooking = typeof demoBookings.$inferSelect;
export type InsertDemoBooking = typeof demoBookings.$inferInsert;

/**
 * Verified tutor profiles displayed on the platform
 */
export const tutors = mysqlTable("tutors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  photo: varchar("photo", { length: 512 }),
  subjects: varchar("subjects", { length: 512 }).notNull(),
  qualification: varchar("qualification", { length: 256 }).notNull(),
  experience: varchar("experience", { length: 64 }).notNull(),
  area: varchar("area", { length: 128 }).notNull(),
  areas: varchar("areas", { length: 512 }),
  mode: mysqlEnum("mode", ["home_tuition", "online", "both"]).default("both").notNull(),
  rating: varchar("rating", { length: 8 }).default("4.8").notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  bio: text("bio"),
  languages: varchar("languages", { length: 256 }).default("English, Kannada"),
  boards: varchar("boards", { length: 256 }).default("CBSE, ICSE"),
  isVerified: mysqlEnum("isVerified", ["yes", "no"]).default("yes").notNull(),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = typeof tutors.$inferInsert;
