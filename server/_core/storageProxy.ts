import type { Express, Request, Response } from "express";
import { ENV } from "./env";

// Mime type map for common image/asset extensions
const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  pdf: "application/pdf",
};

async function serveStorageFile(key: string, req: Request, res: Response) {
  if (!key) {
    res.status(400).send("Missing storage key");
    return;
  }

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    res.status(500).send("Storage proxy not configured");
    return;
  }

  try {
    // Step 1: get a presigned CDN URL from the forge API
    const forgeUrl = new URL(
      "v1/storage/presign/get",
      ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
    );
    forgeUrl.searchParams.set("path", key);

    const forgeResp = await fetch(forgeUrl, {
      headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
    });

    if (!forgeResp.ok) {
      const body = await forgeResp.text().catch(() => "");
      console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
      res.status(502).send("Storage backend error");
      return;
    }

    const { url } = (await forgeResp.json()) as { url: string };
    if (!url) {
      res.status(502).send("Empty signed URL from backend");
      return;
    }

    // Step 2: fetch the actual bytes from CDN and stream them directly to the
    // browser. This avoids a cross-origin 307 redirect which some browsers
    // block when loading images from a same-origin path.
    const cdnResp = await fetch(url);
    if (!cdnResp.ok) {
      console.error(`[StorageProxy] CDN fetch error: ${cdnResp.status}`);
      res.status(502).send("CDN fetch error");
      return;
    }

    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType =
      MIME_TYPES[ext] ??
      cdnResp.headers.get("content-type") ??
      "application/octet-stream";
    const contentLength = cdnResp.headers.get("content-length");

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400"); // 24h browser cache
    res.set("Access-Control-Allow-Origin", "*");
    if (contentLength) res.set("Content-Length", contentLength);

    const buffer = await cdnResp.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error("[StorageProxy] failed:", err);
    res.status(502).send("Storage proxy error");
  }
}

export function registerStorageProxy(app: Express) {
  // Primary path: /api/img/* — not cached by Cloudflare CDN
  app.get("/api/img/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    await serveStorageFile(key, req, res);
  });

  // Legacy path: /manus-storage/* — kept for backward compatibility
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    await serveStorageFile(key, req, res);
  });
}
