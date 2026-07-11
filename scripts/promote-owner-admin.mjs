/**
 * One-time script: promote the OWNER_OPEN_ID user to admin role.
 * Run with: node scripts/promote-owner-admin.mjs
 */
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}
if (!OWNER_OPEN_ID) {
  console.error("❌ OWNER_OPEN_ID not set");
  process.exit(1);
}

console.log(`Promoting owner (openId: ${OWNER_OPEN_ID}) to admin...`);

const conn = await createConnection(DATABASE_URL);

try {
  // Check if user exists
  const [rows] = await conn.execute(
    "SELECT id, openId, name, role FROM users WHERE openId = ?",
    [OWNER_OPEN_ID]
  );

  if (rows.length === 0) {
    console.log("⚠️  User not found in database yet. They need to log in first.");
    console.log("   After logging in, run this script again.");
  } else {
    const user = rows[0];
    console.log(`Found user: ${user.name ?? "(no name)"} — current role: ${user.role}`);

    if (user.role === "admin") {
      console.log("✅ User is already an admin. No changes needed.");
    } else {
      await conn.execute(
        "UPDATE users SET role = 'admin' WHERE openId = ?",
        [OWNER_OPEN_ID]
      );
      console.log("✅ Successfully promoted to admin!");
    }
  }
} finally {
  await conn.end();
}
