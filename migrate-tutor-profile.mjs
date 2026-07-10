/**
 * One-time migration: replace Schedule & Fees columns with Education & Work Experience
 * in the tutor_profiles table.
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log("Checking existing columns...");
  const [cols] = await connection.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tutor_profiles'"
  );
  const existing = cols.map(c => c.COLUMN_NAME);
  console.log("Existing columns:", existing.join(", "));

  // Add new columns if they don't exist
  if (!existing.includes("education")) {
    await connection.execute("ALTER TABLE tutor_profiles ADD COLUMN education TEXT NULL AFTER bio");
    console.log("✓ Added education column");
  } else {
    console.log("- education column already exists");
  }

  if (!existing.includes("workExperience")) {
    await connection.execute("ALTER TABLE tutor_profiles ADD COLUMN workExperience TEXT NULL AFTER education");
    console.log("✓ Added workExperience column");
  } else {
    console.log("- workExperience column already exists");
  }

  // Drop old columns if they exist
  const toDrop = ["demoTime", "regularTime", "sessionDuration", "daysPerWeek", "firstMonthFee", "nextMonthFee"];
  for (const col of toDrop) {
    if (existing.includes(col)) {
      await connection.execute(`ALTER TABLE tutor_profiles DROP COLUMN \`${col}\``);
      console.log(`✓ Dropped ${col} column`);
    } else {
      console.log(`- ${col} column already gone`);
    }
  }

  console.log("\n✅ Migration complete!");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await connection.end();
}
