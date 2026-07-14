/**
 * Seed script: 100 bot tutor profiles + 100 bot student profiles across Bengaluru
 * Run: node scripts/seed-bot-profiles.mjs
 *
 * Each bot gets:
 *   - A users row (userRole = tutor | student, role = user)
 *   - A tutor_profiles or student_profiles row with realistic Bengaluru data
 *   - Tutor profiles: status = 'approved'
 *   - Student profiles: isActive = 'yes'
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

// ─── Bengaluru areas with realistic lat/lng ────────────────────────────────────
const AREAS = [
  { area: "Koramangala", lat: 12.9352, lng: 77.6245 },
  { area: "Indiranagar", lat: 12.9784, lng: 77.6408 },
  { area: "HSR Layout", lat: 12.9116, lng: 77.6474 },
  { area: "Whitefield", lat: 12.9698, lng: 77.7499 },
  { area: "Jayanagar", lat: 12.9308, lng: 77.5838 },
  { area: "BTM Layout", lat: 12.9166, lng: 77.6101 },
  { area: "Marathahalli", lat: 12.9591, lng: 77.6974 },
  { area: "Yelahanka", lat: 13.1005, lng: 77.5963 },
  { area: "Rajajinagar", lat: 12.9907, lng: 77.5530 },
  { area: "Banashankari", lat: 12.9255, lng: 77.5468 },
  { area: "JP Nagar", lat: 12.9063, lng: 77.5857 },
  { area: "Electronic City", lat: 12.8399, lng: 77.6770 },
  { area: "Hebbal", lat: 13.0354, lng: 77.5970 },
  { area: "Malleswaram", lat: 13.0035, lng: 77.5660 },
  { area: "Basavanagudi", lat: 12.9425, lng: 77.5740 },
  { area: "Bellandur", lat: 12.9257, lng: 77.6760 },
  { area: "Sarjapur Road", lat: 12.9010, lng: 77.6850 },
  { area: "Bannerghatta Road", lat: 12.8900, lng: 77.5975 },
  { area: "Vijayanagar", lat: 12.9719, lng: 77.5350 },
  { area: "Nagarbhavi", lat: 12.9560, lng: 77.5090 },
];

const SUBJECTS_LIST = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Hindi", "Kannada", "Social Science", "Computer Science",
  "Accountancy", "Economics", "Business Studies", "History", "Geography",
  "Mathematics, Physics", "Mathematics, Chemistry", "Physics, Chemistry",
  "Mathematics, Physics, Chemistry", "English, Hindi",
  "Science, Mathematics", "Social Science, English",
];

const QUALIFICATIONS = [
  "B.Sc Mathematics", "B.Tech Computer Science", "M.Sc Physics",
  "B.Ed", "M.Sc Chemistry", "B.Com", "M.A. English", "B.Sc Biology",
  "M.Tech", "MBA", "B.Sc Statistics", "M.Sc Mathematics",
  "B.A. History", "B.Sc Computer Science", "M.Com",
];

const EXPERIENCES = ["1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "10 years"];
const BOARDS = ["CBSE", "ICSE", "CBSE, ICSE", "CBSE, State", "ICSE, IB", "CBSE, ICSE, State"];
const MODES = ["home_tuition", "online", "both"];
const GENDERS = ["male", "female"];
const GRADES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
const BOARD_ENUM = ["CBSE", "ICSE", "State", "IB", "IGCSE"];
const GENDER_PREFS = ["male", "female", "no_preference"];
const BUDGETS = ["₹3,000/month", "₹4,000/month", "₹5,000/month", "₹6,000/month", "₹8,000/month", "₹10,000/month", "₹12,000/month"];

// Indian names
const MALE_FIRST = ["Arjun", "Rahul", "Vikram", "Suresh", "Kiran", "Ravi", "Anil", "Deepak", "Sanjay", "Manoj",
  "Pradeep", "Rajesh", "Vinod", "Sunil", "Ramesh", "Naresh", "Ganesh", "Mahesh", "Dinesh", "Lokesh",
  "Ajay", "Vijay", "Srinivas", "Venkatesh", "Prasad", "Harish", "Girish", "Suresh", "Nagaraj", "Manjunath"];
const FEMALE_FIRST = ["Priya", "Kavya", "Ananya", "Divya", "Pooja", "Swathi", "Meghna", "Rekha", "Sunita", "Lakshmi",
  "Deepa", "Nandita", "Asha", "Usha", "Geetha", "Savitha", "Radha", "Sujatha", "Manjula", "Vidya",
  "Archana", "Bhavana", "Chandana", "Deepthi", "Eshwari", "Fathima", "Gayathri", "Hema", "Indira", "Jyothi"];
const LAST_NAMES = ["Sharma", "Kumar", "Reddy", "Nair", "Rao", "Gupta", "Singh", "Patel", "Iyer", "Menon",
  "Hegde", "Gowda", "Naik", "Shetty", "Kamath", "Bhat", "Joshi", "Verma", "Agarwal", "Pillai"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function jitter(base, range) { return base + (Math.random() - 0.5) * range; }

function genName(gender) {
  const first = gender === "male" ? rand(MALE_FIRST) : rand(FEMALE_FIRST);
  return `${first} ${rand(LAST_NAMES)}`;
}

function genEmail(name, idx) {
  return `edunest.bot.${idx}@example-edunest.com`;
}

function genPhone(idx) {
  // Fake Indian mobile numbers (not real)
  return `+91900${String(1000000 + idx).slice(1)}`;
}

function genOpenId(prefix, idx) {
  return `bot_${prefix}_${String(idx).padStart(4, "0")}`;
}

async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log("Connected to DB");

  let tutorCount = 0;
  let studentCount = 0;

  // ─── Seed 100 Tutor Profiles ────────────────────────────────────────────────
  console.log("Seeding 100 tutor profiles...");
  for (let i = 1; i <= 100; i++) {
    const gender = i % 3 === 0 ? "female" : "male";
    const name = genName(gender);
    const email = genEmail(name, 10000 + i);
    const phone = genPhone(10000 + i);
    const openId = genOpenId("tutor", i);
    const areaObj = AREAS[i % AREAS.length];
    const lat = jitter(areaObj.lat, 0.02);
    const lng = jitter(areaObj.lng, 0.02);
    const subjects = rand(SUBJECTS_LIST);
    const qualification = rand(QUALIFICATIONS);
    const experience = rand(EXPERIENCES);
    const boards = rand(BOARDS);
    const mode = rand(MODES);

    try {
      // Insert user
      await conn.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, userRole, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, 'bot', 'user', 'tutor', NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [openId, name, email]
      );
      const [userRows] = await conn.execute(`SELECT id FROM users WHERE openId = ?`, [openId]);
      const userId = userRows[0].id;

      // Insert tutor profile
      await conn.execute(
        `INSERT INTO tutor_profiles
         (userId, name, email, phone, qualification, subjects, experience, boards, languages, mode, bio,
          latitude, longitude, fullAddress, area, gender, phoneVerified, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'English, Kannada', ?, ?, ?, ?, ?, ?, ?, 'no', 'approved', NOW(), NOW())
         ON DUPLICATE KEY UPDATE name=VALUES(name), status='approved'`,
        [
          userId, name, email, phone, qualification, subjects, experience, boards, mode,
          `Experienced ${subjects} tutor in ${areaObj.area}, Bengaluru.`,
          lat.toFixed(7), lng.toFixed(7),
          `${areaObj.area}, Bengaluru, Karnataka`,
          areaObj.area, gender,
        ]
      );
      tutorCount++;
    } catch (err) {
      console.warn(`Tutor ${i} error:`, err.message);
    }
  }

  // ─── Seed 100 Student Profiles ──────────────────────────────────────────────
  console.log("Seeding 100 student profiles...");
  for (let i = 1; i <= 100; i++) {
    const isParent = i % 3 === 0;
    const gender = i % 4 === 0 ? "female" : "male";
    const name = genName(gender);
    const childName = isParent ? genName(i % 2 === 0 ? "female" : "male") : null;
    const email = genEmail(name, 20000 + i);
    const phone = genPhone(20000 + i);
    const openId = genOpenId("student", i);
    const areaObj = AREAS[(i + 5) % AREAS.length];
    const lat = jitter(areaObj.lat, 0.02);
    const lng = jitter(areaObj.lng, 0.02);
    const subjects = rand(SUBJECTS_LIST);
    const grade = rand(GRADES);
    const board = rand(BOARD_ENUM);
    const mode = rand(MODES);
    const budget = rand(BUDGETS);
    const genderPref = rand(GENDER_PREFS);

    try {
      // Insert user
      await conn.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, userRole, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, 'bot', 'user', 'student', NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [openId, name, email]
      );
      const [userRows] = await conn.execute(`SELECT id FROM users WHERE openId = ?`, [openId]);
      const userId = userRows[0].id;

      // Insert student profile
      await conn.execute(
        `INSERT INTO student_profiles
         (userId, name, email, phone, role, studentName, grade, board, subjects, mode,
          demoTime, regularTime, daysPerWeek, sessionsPerWeek, sessionDuration, budget,
          latitude, longitude, fullAddress, area, tutorGenderPreference, phoneVerified, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '10:00 AM', '5:00 PM', 'Mon, Wed, Fri', '3', '1 hr', ?,
                 ?, ?, ?, ?, ?, 'no', 'yes', NOW(), NOW())
         ON DUPLICATE KEY UPDATE name=VALUES(name), isActive='yes'`,
        [
          userId, name, email, phone,
          isParent ? "parent" : "student",
          childName,
          grade, board, subjects, mode, budget,
          lat.toFixed(7), lng.toFixed(7),
          `${areaObj.area}, Bengaluru, Karnataka`,
          areaObj.area, genderPref,
        ]
      );
      studentCount++;
    } catch (err) {
      console.warn(`Student ${i} error:`, err.message);
    }
  }

  await conn.end();
  console.log(`\n✅ Done! Seeded ${tutorCount} tutor profiles and ${studentCount} student profiles.`);
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
