/**
 * EduNest Find Tutor Page
 * Design: Warm Academic Energy — Search interface with tutor cards
 */

import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  BookOpen,
  Clock,
  ArrowRight,
  Filter,
  GraduationCap,
  Award,
} from "lucide-react";

const subjects = [
  "All Subjects", "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "History", "Geography", "Commerce", "Accounts",
  "French", "German", "Computer Science", "JEE/NEET Prep",
];

const grades = [
  "All Grades", "Pre-Primary", "Class 1-5", "Class 6-8",
  "Class 9-10", "Class 11-12", "Competitive Exams",
];

const modes = ["All Modes", "Home Tuition", "Online", "At Tutor's Place"];

const tutors = [
  {
    name: "Priya Verma",
    subject: "Mathematics & Physics",
    experience: "6 years",
    rating: 4.9,
    reviews: 124,
    location: "Bengaluru, Karnataka",
    mode: ["Home Tuition", "Online"],
    grades: "Class 9-12",
    rate: "₹600/hr",
    initials: "PV",
    color: "#F47920",
    verified: true,
    bio: "B.Tech from IIT Bombay. Specializes in making complex math and physics concepts simple and intuitive.",
  },
  {
    name: "Rahul Sharma",
    subject: "Chemistry & Biology",
    experience: "8 years",
    rating: 4.8,
    reviews: 98,
    location: "Bengaluru, Karnataka",
    mode: ["Home Tuition"],
    grades: "Class 10-12, NEET",
    rate: "₹700/hr",
    initials: "RS",
    color: "#6C63FF",
    verified: true,
    bio: "M.Sc Chemistry from Bangalore University. Helped 50+ students crack NEET with personalized study plans.",
  },
  {
    name: "Anita Gupta",
    subject: "English Language & Literature",
    experience: "10 years",
    rating: 5.0,
    reviews: 210,
    location: "Bengaluru, Karnataka",
    mode: ["Home Tuition", "Online"],
    grades: "Class 5-12",
    rate: "₹500/hr",
    initials: "AG",
    color: "#F47920",
    verified: true,
    bio: "MA English from Christ University, Bengaluru. Expert in CBSE, ICSE, and IB English curriculum.",
  },
  {
    name: "Vikram Singh",
    subject: "Mathematics (JEE Prep)",
    experience: "5 years",
    rating: 4.7,
    reviews: 76,
    location: "Bengaluru, Karnataka",
    mode: ["Online"],
    grades: "Class 11-12, JEE",
    rate: "₹800/hr",
    initials: "VS",
    color: "#6C63FF",
    verified: true,
    bio: "IIT Madras graduate. Specialized in JEE Advanced preparation with a 90% success rate.",
  },
  {
    name: "Sunita Patel",
    subject: "Commerce & Accounts",
    experience: "7 years",
    rating: 4.9,
    reviews: 88,
    location: "Bengaluru, Karnataka",
    mode: ["Home Tuition", "Online"],
    grades: "Class 11-12",
    rate: "₹550/hr",
    initials: "SP",
    color: "#F47920",
    verified: true,
    bio: "CA qualified with 7 years of teaching experience in Bengaluru. Makes accounts and economics easy to understand.",
  },
  {
    name: "Deepak Joshi",
    subject: "Science (Class 6-10)",
    experience: "4 years",
    rating: 4.6,
    reviews: 54,
    location: "Bengaluru, Karnataka",
    mode: ["Home Tuition"],
    grades: "Class 6-10",
    rate: "₹450/hr",
    initials: "DJ",
    color: "#6C63FF",
    verified: false,
    bio: "B.Sc Physics. Passionate about making science fun and relatable for middle and high school students.",
  },
];

export default function FindTutor() {
  const [searchSubject, setSearchSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedMode, setSelectedMode] = useState("All Modes");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.75 0.16 55) 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Find Your Perfect Tutor
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Browse 200+ verified tutors across all subjects and grades in Bengaluru. First demo class is free.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4">
              <Search size={18} style={{ color: "oklch(0.68 0.18 50)" }} />
              <input
                type="text"
                placeholder="Search by subject, tutor name..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
            <div className="flex items-center gap-2 px-4 border-l border-[oklch(0.9_0.005_80)]">
              <MapPin size={16} style={{ color: "oklch(0.68 0.18 50)" }} />
              <input
                type="text"
                placeholder="Area in Bengaluru"
                className="outline-none text-sm bg-transparent w-28"
                style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
            <button className="btn-primary text-sm py-2 px-6 shrink-0">
              Search
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
            <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="oklch(0.96 0.01 80)" />
          </svg>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="py-12 flex-1" style={{ backgroundColor: "oklch(0.96 0.01 80)" }}>
        <div className="container">
          <div className="flex flex-wrap gap-3 mb-8 items-center">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
              <Filter size={16} /> Filters:
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm border bg-white outline-none"
              style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.3 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
            >
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm border bg-white outline-none"
              style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.3 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
            >
              {grades.map((g) => <option key={g}>{g}</option>)}
            </select>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm border bg-white outline-none"
              style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.3 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
            >
              {modes.map((m) => <option key={m}>{m}</option>)}
            </select>
            <span className="ml-auto text-sm" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              Showing <strong>{tutors.length}</strong> tutors
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tutors.map((tutor) => (
              <div key={tutor.name} className="card-hover bg-white rounded-2xl overflow-hidden border border-[oklch(0.9_0.005_80)]">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                      style={{ backgroundColor: tutor.color, fontFamily: "'Poppins', sans-serif" }}
                    >
                      {tutor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                          {tutor.name}
                        </h3>
                        {tutor.verified && (
                          <CheckCircle2 size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                        {tutor.subject}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} fill="oklch(0.68 0.18 50)" style={{ color: "oklch(0.68 0.18 50)" }} />
                        <span className="text-xs font-semibold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{tutor.rating}</span>
                        <span className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>({tutor.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>{tutor.rate}</div>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed mb-4" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    {tutor.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "oklch(0.96 0.01 80)", color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <Clock size={10} /> {tutor.experience}
                    </div>
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "oklch(0.96 0.01 80)", color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <GraduationCap size={10} /> {tutor.grades}
                    </div>
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "oklch(0.96 0.01 80)", color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <MapPin size={10} /> {tutor.location.split(",")[0]}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {tutor.mode.map((m) => (
                      <span key={m} className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: "oklch(0.95 0.03 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Nunito', sans-serif" }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-6 pb-5 flex gap-2">
                  <Link href="/contact" className="flex-1 btn-primary text-xs py-2 text-center justify-center">
                    Book Demo Class
                  </Link>
                  <Link href="/contact" className="flex-1 btn-outline text-xs py-2 text-center justify-center">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          <div className="text-center mt-10">
            <button className="btn-outline text-sm px-8 py-3">
              Load More Tutors <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
