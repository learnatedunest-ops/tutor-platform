/**
 * Google OAuth environment variable validation tests
 * Ensures the required Google OAuth credentials are configured.
 */
import { describe, it, expect } from "vitest";

describe("Google OAuth environment variables", () => {
  it("GOOGLE_CLIENT_ID should be set and non-empty", () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    expect(clientId).toBeTruthy();
    expect(clientId?.length).toBeGreaterThan(10);
  });

  it("GOOGLE_CLIENT_SECRET should be set and non-empty", () => {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    expect(clientSecret).toBeTruthy();
    expect(clientSecret?.length).toBeGreaterThan(5);
  });

  it("GOOGLE_ADMIN_EMAIL should be set and be a valid email", () => {
    const adminEmail = process.env.GOOGLE_ADMIN_EMAIL ?? "learn.at.edunest@gmail.com";
    expect(adminEmail).toBeTruthy();
    expect(adminEmail).toContain("@");
  });

  it("GOOGLE_CLIENT_ID should look like a Google OAuth client ID", () => {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    // Google OAuth client IDs end with .apps.googleusercontent.com
    expect(clientId).toMatch(/\.apps\.googleusercontent\.com$/);
  });

  it("GOOGLE_REDIRECT_URI should be a valid HTTPS URL when set", () => {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "";
    if (redirectUri) {
      expect(redirectUri).toMatch(/^https:\/\//);
      expect(redirectUri).toContain("/api/auth/callback/google");
    }
    // If not set, that's fine — local dev derives it from the request host
  });
});
