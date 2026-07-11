import { describe, expect, it } from "vitest";

/**
 * Validates that the Resend API key is configured and the email module
 * initialises without throwing. We do NOT send a real email in tests —
 * we just verify the key is present and the helper can be imported.
 */
describe("email helper", () => {
  it("RESEND_API_KEY is set in the environment", () => {
    const key = process.env.RESEND_API_KEY;
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("GMAIL_APP_PASSWORD is set in the environment (for OTP delivery)", () => {
    const pass = process.env.GMAIL_APP_PASSWORD;
    expect(pass).toBeDefined();
    expect(typeof pass).toBe("string");
    expect(pass!.length).toBeGreaterThan(0);
  });

  it("email module imports without error", async () => {
    // Dynamic import so the module is evaluated after env is set
    const mod = await import("./email");
    expect(typeof mod.sendInquiryEmail).toBe("function");
    expect(typeof mod.sendTutorApplicationEmail).toBe("function");
    expect(typeof mod.sendDemoBookingEmail).toBe("function");
    expect(typeof mod.sendOtpEmail).toBe("function");
    expect(typeof mod.sendContactRevealToTutor).toBe("function");
    expect(typeof mod.sendContactRevealToStudent).toBe("function");
  });
});
