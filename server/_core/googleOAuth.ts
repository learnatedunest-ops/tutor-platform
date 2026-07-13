import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { google } from "googleapis";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

/**
 * Returns the OAuth redirect URI.
 * Priority:
 *  1. GOOGLE_REDIRECT_URI env var (explicit override — required for production behind Cloud Run proxy)
 *  2. Derived from the incoming request host (works for local dev)
 */
function getRedirectUri(req: Request): string {
  if (ENV.googleRedirectUri) {
    return ENV.googleRedirectUri;
  }
  const protocol = ENV.isProduction ? "https" : req.protocol;
  const host = req.get("host") ?? "localhost:3000";
  return `${protocol}://${host}/api/auth/callback/google`;
}

function createOAuth2Client(req: Request) {
  return new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    getRedirectUri(req)
  );
}

export function registerGoogleOAuthRoutes(app: Express) {
  // Step 1: Redirect to Google consent screen
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const oauth2Client = createOAuth2Client(req);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
    });
    res.redirect(302, authUrl);
  });

  // Step 2: Handle Google callback
  app.get("/api/auth/callback/google", async (req: Request, res: Response) => {
    const code = req.query["code"];
    const error = req.query["error"];

    if (error || !code || typeof code !== "string") {
      console.error("[Google OAuth] Error or missing code:", error);
      res.redirect(302, "/?error=auth_failed");
      return;
    }

    try {
      const oauth2Client = createOAuth2Client(req);
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: googleUser } = await oauth2.userinfo.get();

      if (!googleUser.email || !googleUser.id) {
        res.status(400).json({ error: "Failed to get user info from Google" });
        return;
      }

      const googleId = `google_${googleUser.id}`;
      const email = googleUser.email;
      const name = googleUser.name || email.split("@")[0];

      // Determine role: admin if email matches GOOGLE_ADMIN_EMAIL
      const isAdmin = email.toLowerCase() === ENV.googleAdminEmail.toLowerCase();

      // Upsert user in DB
      await db.upsertUser({
        openId: googleId,
        name,
        email,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Promote to admin if this is the admin email
      if (isAdmin) {
        await db.updateUserRole(googleId, "admin");
      }

      // Create JWT session token
      const sessionToken = await sdk.createSessionToken(googleId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (err) {
      console.error("[Google OAuth] Callback failed:", err);
      res.redirect(302, "/?error=auth_failed");
    }
  });
}
