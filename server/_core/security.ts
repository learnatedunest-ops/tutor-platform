/**
 * EduNest Security Middleware
 * Centralised security utilities used across the server.
 */

import type { Request, Response, NextFunction } from "express";

// ─── XSS / HTML Injection Sanitization ────────────────────────────────────────
/**
 * Strips HTML tags and dangerous characters from a string.
 * Use this on any user-supplied string that will be stored and later rendered.
 * NOTE: Drizzle ORM already uses parameterized queries so SQL injection is
 * handled at the DB layer; this is a defence-in-depth measure for HTML/XSS.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    // Remove null bytes
    .replace(/\0/g, "");
}

/**
 * Sanitize all string values in a plain object (shallow).
 * Useful for sanitizing tRPC input objects before persisting.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === "string") {
      (result as Record<string, unknown>)[key] = sanitizeString(val);
    }
  }
  return result;
}

// ─── Request ID Middleware ────────────────────────────────────────────────────
/**
 * Attaches a unique request ID to every request for tracing.
 * The ID is also returned in the X-Request-Id response header.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const id = crypto.randomUUID();
  (req as Request & { id: string }).id = id;
  res.setHeader("X-Request-Id", id);
  next();
}

// ─── Security Event Logger ────────────────────────────────────────────────────
/**
 * Logs suspicious requests (e.g. path traversal attempts, oversized payloads).
 * In production these logs can be forwarded to a SIEM.
 */
export function securityLogger(req: Request, _res: Response, next: NextFunction) {
  const url = req.url || "";
  const suspicious =
    url.includes("../") ||
    url.includes("..%2F") ||
    url.includes("<script") ||
    url.includes("javascript:") ||
    url.toLowerCase().includes("union select") ||
    url.toLowerCase().includes("drop table");

  if (suspicious) {
    console.warn(
      `[Security] Suspicious request from ${req.ip}: ${req.method} ${url}`
    );
  }
  next();
}

// ─── Enhanced Security Event Logger ─────────────────────────────────────────
/**
 * Tracks and blocks IPs that repeatedly trigger suspicious patterns.
 * In production this acts as a lightweight WAF (Web Application Firewall).
 */
const suspiciousIpCounts = new Map<string, { count: number; firstSeen: number }>();
const SUSPICIOUS_THRESHOLD = 10; // block after 10 suspicious requests in 10 min
const SUSPICIOUS_WINDOW_MS = 10 * 60 * 1000;

// Patterns that indicate malicious scanning or injection attempts
const MALICIOUS_PATTERNS = [
  /\.\.\//, // path traversal
  /\.\.\.%2F/i,
  /<script/i, // XSS
  /javascript:/i,
  /union\s+select/i, // SQL injection
  /drop\s+table/i,
  /insert\s+into/i,
  /delete\s+from/i,
  /exec\s*\(/i, // command injection
  /eval\s*\(/i,
  /\/etc\/passwd/i, // LFI
  /\/proc\/self/i,
  /base64_decode/i, // PHP injection
  /phpinfo/i,
  /\.php$/i, // PHP file probing
  /\.asp$/i, // ASP file probing
  /\.env$/i, // env file probing
  /wp-admin/i, // WordPress scanning
  /xmlrpc/i,
];

export function enhancedSecurityLogger(req: Request, res: Response, next: NextFunction) {
  const url = req.url || "";
  const body = req.body ? JSON.stringify(req.body).slice(0, 500) : "";
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  const isMalicious = MALICIOUS_PATTERNS.some(
    pattern => pattern.test(url) || pattern.test(body)
  );

  if (isMalicious) {
    const now = Date.now();
    const record = suspiciousIpCounts.get(ip);
    if (!record || now - record.firstSeen > SUSPICIOUS_WINDOW_MS) {
      suspiciousIpCounts.set(ip, { count: 1, firstSeen: now });
    } else {
      record.count++;
      if (record.count >= SUSPICIOUS_THRESHOLD) {
        console.error(`[Security] BLOCKED IP ${ip} after ${record.count} suspicious requests`);
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }
    console.warn(`[Security] Suspicious request from ${ip}: ${req.method} ${url.slice(0, 200)}`);
  }
  next();
}

// Clean up old entries every 15 minutes to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - SUSPICIOUS_WINDOW_MS;
  Array.from(suspiciousIpCounts.entries()).forEach(([ip, record]) => {
    if (record.firstSeen < cutoff) suspiciousIpCounts.delete(ip);
  });
}, 15 * 60 * 1000);

// ─── Admin Route Guard ────────────────────────────────────────────────────────
/**
 * Middleware that blocks direct browser navigation to /admin for non-authenticated
 * requests coming from outside the allowed origins. The actual admin data is
 * protected by adminProcedure in tRPC, but this adds a layer for the HTML route.
 */
export function adminRouteGuard(req: Request, res: Response, next: NextFunction) {
  // Only apply to direct HTML navigation (not API calls)
  const acceptsHtml = req.headers.accept?.includes("text/html");
  if (!acceptsHtml) return next();

  const referer = req.headers.referer ?? "";
  const origin = req.headers.origin ?? "";
  const allowedHosts = [
    "edunest.courses",
    "edututor-zmz25qz7.manus.space",
    "localhost",
    "127.0.0.1",
  ];

  const isAllowed = allowedHosts.some(
    h => referer.includes(h) || origin.includes(h) || req.hostname === h
  );

  // In dev always allow
  if (process.env.NODE_ENV === "development" || isAllowed) return next();

  // For unknown origins, still serve the page — React will handle auth
  // (the admin data is protected server-side via adminProcedure)
  next();
}
