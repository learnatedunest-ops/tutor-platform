import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  userRole: mysqlEnum("userRole", ["tutor", "student"]),
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
  rating: varchar("rating", { length: 8 }).default("4.5").notNull(),
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

/**
 * Student / parent tutor requirement registrations
 * Submitted via the Find a Tutor page — admin matches them to tutors
 */
export const studentRequirements = mysqlTable("student_requirements", {
  id: int("id").autoincrement().primaryKey(),
  // Who is registering
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: mysqlEnum("role", ["student", "parent"]).notNull(),
  // Student details
  studentName: varchar("studentName", { length: 128 }),  // if parent is registering
  grade: varchar("grade", { length: 64 }).notNull(),
  board: mysqlEnum("board", ["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"]).notNull(),
  // Requirement details
  subjects: varchar("subjects", { length: 512 }).notNull(),
  area: varchar("area", { length: 128 }).notNull(),
  mode: mysqlEnum("mode", ["home_tuition", "online", "both"]).notNull(),
  budget: varchar("budget", { length: 64 }),
  preferredTime: varchar("preferredTime", { length: 128 }),
  additionalNotes: text("additionalNotes"),
  // Matching
  status: mysqlEnum("status", ["new", "matching", "matched", "closed"]).default("new").notNull(),
  matchedTutorId: int("matchedTutorId"),  // FK to tutors.id once matched
  matchedTutorName: varchar("matchedTutorName", { length: 128 }),
  matchNotes: text("matchNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentRequirement = typeof studentRequirements.$inferSelect;
export type InsertStudentRequirement = typeof studentRequirements.$inferInsert;

/**
 * Referrals — tracks who referred whom and discount status
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerName: varchar("referrerName", { length: 128 }).notNull(),
  referrerEmail: varchar("referrerEmail", { length: 320 }).notNull(),
  referrerPhone: varchar("referrerPhone", { length: 20 }),
  refereeName: varchar("refereeName", { length: 128 }).notNull(),
  refereeEmail: varchar("refereeEmail", { length: 320 }).notNull(),
  refereePhone: varchar("refereePhone", { length: 20 }),
  referralCode: varchar("referralCode", { length: 16 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "joined", "rewarded"]).default("pending").notNull(),
  discountApplied: mysqlEnum("discountApplied", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Tutor self-registration profiles (linked to users table via userId)
 * Created when a tutor completes their profile after login.
 * Pending admin approval before they appear in the tutors table.
 */
export const tutorProfiles = mysqlTable("tutor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),          // FK → users.id
  tutorTableId: int("tutorTableId"),                 // FK → tutors.id (set after admin approval)
  // Personal
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  photo: varchar("photo", { length: 512 }),
  // Academic
  qualification: varchar("qualification", { length: 256 }).notNull(),
  subjects: varchar("subjects", { length: 512 }).notNull(),
  experience: varchar("experience", { length: 64 }).notNull(),
  boards: varchar("boards", { length: 256 }).default("CBSE, ICSE").notNull(),
  languages: varchar("languages", { length: 256 }).default("English, Kannada").notNull(),
  mode: mysqlEnum("mode", ["home_tuition", "online", "both"]).default("both").notNull(),
  bio: text("bio"),
  // Education & Work Experience
  education: text("education"),        // e.g. "B.Tech IIT Bombay (2015-2019), M.Sc Mathematics Delhi University (2019-2021)"
  workExperience: text("workExperience"), // e.g. "Senior Maths Tutor at Byju's (2021-2023), Freelance tutor (2023-present)"
  // Location
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  fullAddress: text("fullAddress"),
  area: varchar("area", { length: 128 }),
  // Payment
  upiId: varchar("upiId", { length: 64 }),              // Tutor's UPI ID for receiving payment
  // Phone verification
  phoneVerified: mysqlEnum("phoneVerified", ["yes", "no"]).default("no").notNull(),
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutorProfile = typeof tutorProfiles.$inferSelect;
export type InsertTutorProfile = typeof tutorProfiles.$inferInsert;

/**
 * Tutor Interests — when an approved tutor expresses interest in a student requirement
 */
export const tutorInterests = mysqlTable("tutor_interests", {
  id: int("id").autoincrement().primaryKey(),
  tutorProfileId: int("tutorProfileId").notNull(),    // FK → tutor_profiles.id
  studentProfileId: int("studentProfileId").notNull(), // FK → student_profiles.id
  message: text("message"),
  // Interest goes directly to student — no admin gate
  // student accepts or declines directly
  status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TutorInterest = typeof tutorInterests.$inferSelect;
export type InsertTutorInterest = typeof tutorInterests.$inferInsert;

/**
 * Student / parent self-registration profiles (linked to users table via userId)
 * Created when a student/parent completes their profile after login.
 * Their requirement is immediately visible to nearby approved tutors.
 */
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),          // FK → users.id
  // Who is registering
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: mysqlEnum("role", ["student", "parent"]).notNull(),
  studentName: varchar("studentName", { length: 128 }), // if parent is registering
  // Academic requirement
  grade: varchar("grade", { length: 64 }).notNull(),
  board: mysqlEnum("board", ["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"]).notNull(),
  subjects: varchar("subjects", { length: 512 }).notNull(),
  mode: mysqlEnum("mode", ["home_tuition", "online", "both"]).notNull(),
  // Schedule
  demoTime: varchar("demoTime", { length: 128 }),       // preferred demo class time
  regularTime: varchar("regularTime", { length: 128 }), // preferred regular class time
  daysPerWeek: varchar("daysPerWeek", { length: 128 }),  // e.g. "mon, tue, wed"
  sessionsPerWeek: varchar("sessionsPerWeek", { length: 32 }), // e.g. "5"
  sessionDuration: varchar("sessionDuration", { length: 64 }), // e.g. "1 hr"
  // Budget
  budget: varchar("budget", { length: 64 }),
  specialRequirements: text("specialRequirements"),
  // Location
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  fullAddress: text("fullAddress"),
  area: varchar("area", { length: 128 }),
  // Phone verification
  phoneVerified: mysqlEnum("phoneVerified", ["yes", "no"]).default("no").notNull(),
  // Status
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

/**
 * Student Demo Interests — when a student/parent requests a free demo class from a nearby tutor
 * Created from the NearbyTutors page "Book Free Demo Class" button.
 */
export const studentDemoInterests = mysqlTable("student_demo_interests", {
  id: int("id").autoincrement().primaryKey(),
  studentProfileId: int("studentProfileId").notNull(),  // FK → student_profiles.id
  tutorProfileId: int("tutorProfileId").notNull(),       // FK → tutor_profiles.id
  message: text("message"),
  // Interest goes directly to tutor — no admin gate
  // tutor accepts or declines directly
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentDemoInterest = typeof studentDemoInterests.$inferSelect;
export type InsertStudentDemoInterest = typeof studentDemoInterests.$inferInsert;

/**
 * OTP Verifications — stores one-time passcodes for phone number verification.
 * A new row is created each time an OTP is requested; old rows are invalidated
 * by checking expiresAt. The phone field stores the E.164 number being verified.
 */
export const otpVerifications = mysqlTable("otp_verifications", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: mysqlEnum("verified", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

/**
 * Demo Slots — when admin confirms a student demo interest, a slot is created
 * so the student can pick a date/time and the tutor can see their schedule.
 */
export const demoSlots = mysqlTable("demo_slots", {
  id: int("id").autoincrement().primaryKey(),
  studentDemoInterestId: int("studentDemoInterestId").notNull().unique(), // FK → student_demo_interests.id
  studentProfileId: int("studentProfileId").notNull(),   // FK → student_profiles.id
  tutorProfileId: int("tutorProfileId").notNull(),        // FK → tutor_profiles.id
  scheduledDate: varchar("scheduledDate", { length: 32 }),  // e.g. "2024-08-15"
  scheduledTime: varchar("scheduledTime", { length: 32 }),  // e.g. "10:00 AM"
  // Mode comes from the student's registered preference (home_tuition / online / both)
  mode: mysqlEnum("mode", ["home_tuition", "online", "both"]).default("online").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending_schedule", "scheduled", "completed", "cancelled"]).default("pending_schedule").notNull(),
  // Which party initiated: tutor_to_student (tutor interest) or student_to_tutor (student demo interest)
  interestDirection: mysqlEnum("interestDirection", ["tutor_to_student", "student_to_tutor"]).default("student_to_tutor").notNull(),
  // For tutor-initiated: parent must accept before scheduling is unlocked
  parentAccepted: mysqlEnum("parentAccepted", ["yes", "no", "pending"]).default("pending").notNull(),
  // Tutor confirms they are coming for the demo
  tutorConfirmedComing: mysqlEnum("tutorConfirmedComing", ["yes", "no", "pending"]).default("pending").notNull(),
  // Tutor's suggested reschedule (when they can't make the parent's chosen time)
  tutorSuggestedDate: varchar("tutorSuggestedDate", { length: 32 }),
  tutorSuggestedTime: varchar("tutorSuggestedTime", { length: 32 }),
  // Parent's response to tutor's reschedule suggestion
  parentRescheduleResponse: mysqlEnum("parentRescheduleResponse", ["accepted", "declined"]),
  // Post-demo proceed intent: both parties express yes/no to continue
  tutorProceedIntent: mysqlEnum("tutorProceedIntent", ["yes", "no"]),
  studentProceedIntent: mysqlEnum("studentProceedIntent", ["yes", "no"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DemoSlot = typeof demoSlots.$inferSelect;
export type InsertDemoSlot = typeof demoSlots.$inferInsert;

/**
 * Confirmed matches — created when both tutor and student/parent say yes after a demo.
 * Contact details are shared between both parties at this point.
 */
export const confirmedMatches = mysqlTable("confirmed_matches", {
  id: int("id").autoincrement().primaryKey(),
  demoSlotId: int("demoSlotId").notNull().unique(),       // FK → demo_slots.id
  tutorProfileId: int("tutorProfileId").notNull(),        // FK → tutor_profiles.id
  studentProfileId: int("studentProfileId").notNull(),    // FK → student_profiles.id
  // Snapshot of contact details at time of match (for admin records)
  tutorName: varchar("tutorName", { length: 128 }),
  tutorEmail: varchar("tutorEmail", { length: 320 }),
  tutorPhone: varchar("tutorPhone", { length: 20 }),
  studentName: varchar("studentName", { length: 128 }),
  studentEmail: varchar("studentEmail", { length: 320 }),
  studentPhone: varchar("studentPhone", { length: 20 }),
  studentArea: varchar("studentArea", { length: 128 }),
  studentGrade: varchar("studentGrade", { length: 64 }),
  studentSubjects: text("studentSubjects"),
  // Payment amount from student's registered budget (shown to parent on payment request)
  paymentAmount: varchar("paymentAmount", { length: 64 }),
  // Admin sets this to 'got_a_class' once both parties confirmed and class is arranged
  // classStatus values: matched | got_a_class | cancellation_requested | cancelled
  classStatus: varchar("classStatus", { length: 32 }).default("matched"),
  // Cancellation request fields
  cancellationRequestedBy: mysqlEnum("cancellationRequestedBy", ["tutor", "parent"]),
  cancellationRequestedAt: timestamp("cancellationRequestedAt"),
  cancellationNote: text("cancellationNote"),
  matchedAt: timestamp("matchedAt").defaultNow().notNull(),
});

export type ConfirmedMatch = typeof confirmedMatches.$inferSelect;
export type InsertConfirmedMatch = typeof confirmedMatches.$inferInsert;

/**
 * Session Log Sheets — one per confirmed match.
 * Tutor prints the blank sheet, fills it with parent, then uploads the completed scan.
 * Admin approves payment after verifying the uploaded sheet.
 */
export const sessionLogs = mysqlTable("session_logs", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull().unique(),           // FK → confirmed_matches.id
  tutorProfileId: int("tutorProfileId").notNull(),
  studentProfileId: int("studentProfileId").notNull(),
  tutorName: varchar("tutorName", { length: 128 }),
  studentName: varchar("studentName", { length: 128 }),
  // Uploaded completed sheet (S3 key / URL)
  uploadedSheetUrl: text("uploadedSheetUrl"),
  uploadedAt: timestamp("uploadedAt"),
  // Payment status: pending → sheet_uploaded → parent_paid → payment_processed
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "sheet_uploaded", "parent_paid", "payment_processed"]).default("pending").notNull(),
  // Parent payment tracking
  parentPaid: boolean("parentPaid").default(false).notNull(),
  parentPaidAt: timestamp("parentPaidAt"),
  parentPaymentNote: varchar("parentPaymentNote", { length: 256 }),
  adminApprovedAt: timestamp("adminApprovedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SessionLog = typeof sessionLogs.$inferSelect;
export type InsertSessionLog = typeof sessionLogs.$inferInsert;
