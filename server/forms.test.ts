import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module so tests don't need a real DB connection
vi.mock("./db", () => ({
  createInquiry: vi.fn().mockResolvedValue(undefined),
  getAllInquiries: vi.fn().mockResolvedValue([]),
  updateInquiryStatus: vi.fn().mockResolvedValue(undefined),
  createTutorApplication: vi.fn().mockResolvedValue(undefined),
  getAllTutorApplications: vi.fn().mockResolvedValue([]),
  updateTutorApplicationStatus: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "amogha@edunest.in",
      name: "Amogha",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "student@example.com",
      name: "Student",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Inquiry tests ────────────────────────────────────────────────────────────

describe("inquiry.submit", () => {
  it("accepts a valid student inquiry and returns success", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.inquiry.submit({
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "9876543210",
      role: "student",
      subject: "Mathematics",
      area: "Koramangala",
      message: "I need a tutor for Class 10 maths for my daughter.",
    });
    expect(result).toEqual({ success: true });
  });

  it("accepts a parent inquiry without optional fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.inquiry.submit({
      name: "Suresh Patel",
      email: "suresh@example.com",
      phone: "9123456789",
      role: "parent",
      message: "Looking for an English tutor in Indiranagar.",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects inquiry with invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.inquiry.submit({
        name: "Test User",
        email: "not-an-email",
        phone: "9876543210",
        role: "student",
        message: "Test message that is long enough.",
      })
    ).rejects.toThrow();
  });

  it("rejects inquiry with message too short", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.inquiry.submit({
        name: "Test User",
        email: "test@example.com",
        phone: "9876543210",
        role: "student",
        message: "Short",
      })
    ).rejects.toThrow();
  });
});

describe("inquiry.list", () => {
  it("returns empty array for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.inquiry.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for non-admin user (restricted)", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.inquiry.list()).rejects.toThrow();
  });
});

// ─── Tutor application tests ──────────────────────────────────────────────────

describe("tutorApplication.submit", () => {
  it("accepts a valid tutor application and returns success", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.tutorApplication.submit({
      name: "Kavitha Reddy",
      email: "kavitha@example.com",
      phone: "9988776655",
      qualification: "Ph.D Physics, IISc Bengaluru",
      subjects: "Physics, Chemistry",
      experience: "5+ years",
      area: "Electronic City",
      mode: "home_tuition",
      about: "Experienced physics tutor with a passion for making concepts simple.",
    });
    expect(result).toEqual({ success: true });
  });

  it("accepts online-only tutor application", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.tutorApplication.submit({
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "9876543210",
      qualification: "B.Tech IIT Madras",
      subjects: "Mathematics, JEE Prep",
      experience: "3-5 years",
      area: "Whitefield",
      mode: "online",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects application with invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.tutorApplication.submit({
        name: "Test Tutor",
        email: "bad-email",
        phone: "9876543210",
        qualification: "B.Sc",
        subjects: "Maths",
        experience: "1-3 years",
        area: "Koramangala",
        mode: "both",
      })
    ).rejects.toThrow();
  });
});

describe("tutorApplication.list", () => {
  it("returns empty array for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.tutorApplication.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for non-admin user (restricted)", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.tutorApplication.list()).rejects.toThrow();
  });
});
