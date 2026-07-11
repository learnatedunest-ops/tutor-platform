import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { requestIdMiddleware, securityLogger } from "./security";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ─── Rate Limiters ────────────────────────────────────────────────────────────
/** General API rate limit: 300 requests per 15 minutes per IP */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => process.env.NODE_ENV === "development",
});

/** Strict limiter for OAuth endpoints: 20 per 15 minutes per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later." },
  skip: (req) => process.env.NODE_ENV === "development",
});

/** Very strict limiter for mutation-heavy tRPC calls: 60 per minute */
const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many write requests, please slow down." },
  skip: (req) => process.env.NODE_ENV === "development" || req.method === "GET",
});

// ─── CORS Policy ─────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://edu-nest.manus.space",
  "https://edututor-zmz25qz7.manus.space",
  // Dev origins
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman in dev)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24h preflight cache
};

// ─── Server Bootstrap ─────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust the first proxy hop (needed for accurate IP in rate limiters on Manus hosting)
  app.set("trust proxy", 1);

  // ── Request tracing & security event logging ────────────────────────────────
  app.use(requestIdMiddleware);
  app.use(securityLogger);

  // ── Security headers via Helmet ──────────────────────────────────────────
  app.use(
    helmet({
      // Content-Security-Policy: restrict resource loading
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for Vite HMR in dev; tightened in prod
            "https://fonts.googleapis.com",
            "https://maps.googleapis.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Tailwind injects inline styles
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
          connectSrc: [
            "'self'",
            "https://api.manus.im",
            "https://*.manus.space",
            "wss:", // WebSocket for Vite HMR
          ],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
        },
      },
      // Strict Transport Security: 1 year, include subdomains
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Prevent MIME-type sniffing
      noSniff: true,
      // Prevent clickjacking
      frameguard: { action: "deny" },
      // Disable X-Powered-By header
      hidePoweredBy: true,
      // Referrer policy
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      // Permissions policy (disable unnecessary browser features)
      permittedCrossDomainPolicies: false,
      crossOriginEmbedderPolicy: false, // Needed for Google Maps / external resources
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Allow OAuth popups
    })
  );

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions)); // Handle preflight for all routes

  // ── Body parsers (limit size to prevent DoS) ────────────────────────────────
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // ── Apply rate limiters ─────────────────────────────────────────────────────
  app.use("/api/oauth", authLimiter);
  app.use("/api/trpc", apiLimiter);
  app.use("/api/trpc", mutationLimiter);

  // ── Storage proxy & OAuth routes ────────────────────────────────────────────
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // ─── Sitemap ────────────────────────────────────────────────────────────────
  const SITE_URL = "https://edu-nest.manus.space";
  const PAGES = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/find-tutor", priority: "0.9", changefreq: "weekly" },
    { url: "/subjects", priority: "0.9", changefreq: "monthly" },
    { url: "/become-tutor", priority: "0.8", changefreq: "monthly" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/blog", priority: "0.8", changefreq: "weekly" },
    { url: "/faq", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/privacy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
    { url: "/seo-guide", priority: "0.4", changefreq: "monthly" },
    { url: "/refer", priority: "0.7", changefreq: "monthly" },
  ];

  app.get("/sitemap.xml", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const urls = PAGES.map(
      ({ url, priority, changefreq }) =>
        `  <url>\n    <loc>${SITE_URL}${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    res.set("Content-Type", "application/xml");
    res.send(xml);
  });

  // ─── Robots.txt ─────────────────────────────────────────────────────────────
  app.get("/robots.txt", (_req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  });

  // ── Session Sheet Upload Endpoint ──────────────────────────────────────────
  // Accepts multipart/form-data with a 'file' field (image/pdf up to 10MB), uploads to S3, returns { url }
  // NOTE: No body-parser middleware here — busboy reads directly from the raw request stream
  app.post("/api/upload-session-sheet", async (req, res) => {
    // Validate content-type before touching the stream
    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.includes('multipart/form-data')) {
      res.status(400).json({ error: 'Expected multipart/form-data' });
      return;
    }

    const ALLOWED_MIME = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/heic', 'image/heif', 'application/pdf',
    ];
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    try {
      const Busboy = (await import('busboy')).default;
      const bb = Busboy({
        headers: req.headers as Record<string, string>,
        limits: { files: 1, fileSize: MAX_SIZE },
      });

      let fileBuffer: Buffer | null = null;
      let mimeType = 'image/jpeg';
      let fileName = `sheet_${Date.now()}.jpg`;
      let fileTooLarge = false;

      await new Promise<void>((resolve, reject) => {
        bb.on('file', (_field: string, fileStream: any, info: any) => {
          const rawMime: string = (info.mimeType ?? '').toLowerCase();
          // Accept any image/* or pdf regardless of exact subtype (handles HEIC from iOS)
          const isAllowed = rawMime.startsWith('image/') || rawMime === 'application/pdf';
          if (!isAllowed) {
            fileStream.resume(); // drain to avoid hanging
            return reject(new Error(`File type not allowed: ${rawMime}`));
          }
          mimeType = rawMime || 'image/jpeg';
          fileName = info.filename ?? fileName;

          const chunks: Buffer[] = [];
          fileStream.on('data', (chunk: Buffer) => chunks.push(chunk));
          fileStream.on('limit', () => { fileTooLarge = true; fileStream.resume(); });
          fileStream.on('end', () => {
            if (!fileTooLarge) fileBuffer = Buffer.concat(chunks);
          });
        });
        bb.on('finish', resolve);
        bb.on('error', (err: Error) => reject(err));
        req.pipe(bb);
      });

      if (fileTooLarge) {
        res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
        return;
      }
      if (!fileBuffer || (fileBuffer as Buffer).length === 0) {
        res.status(400).json({ error: 'No file received. Please select a photo or PDF.' });
        return;
      }

      // Derive extension from mime type for clean S3 keys
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
        'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif',
        'application/pdf': 'pdf',
      };
      const ext = extMap[mimeType] ?? (fileName.includes('.') ? fileName.split('.').pop() : 'jpg');
      const key = `session-sheets/sheet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { storagePut } = await import('../storage');
      const { url } = await storagePut(key, fileBuffer as Buffer, mimeType);
      console.log(`[Upload] Session sheet uploaded: ${key} (${(fileBuffer as Buffer).length} bytes)`);
      res.json({ url });
    } catch (err: any) {
      console.error('[Upload] Session sheet upload error:', err?.message ?? err);
      const msg = err?.message?.includes('not allowed')
        ? err.message
        : 'Upload failed. Please try again with a JPEG, PNG, or PDF file.';
      res.status(500).json({ error: msg });
    }
  });

  // ── tRPC API ────────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        // Log server errors but don't leak stack traces to clients
        if (error.code === "INTERNAL_SERVER_ERROR") {
          console.error(`[tRPC] Internal error on ${path}:`, error.message);
        }
      },
    })
  );

  // ── Catch-all security headers for non-API routes ──────────────────────────
  app.use((_req, res, next) => {
    // Additional security headers not covered by helmet defaults
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  // ── Static / Vite ───────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
