/**
 * EduNest Find Tutor Page
 * Design: Warm Academic Energy — Search interface with tutor cards
 * Features: Subject, Grade, Mode, and Bengaluru Area filters
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookDemoModal from "@/components/BookDemoModal";
import { trpc } from "@/lib/trpc";
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  X,
  ChevronDown,
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

const bengaluruAreas = [
  "All Areas",
  "Koramangala",
  "Indiranagar",
  "HSR Layout",
  "Whitefield",
  "Jayanagar",
  "JP Nagar",
  "Banashankari",
  "Marathahalli",
  "Electronic City",
  "Hebbal",
  "Malleshwaram",
  "Rajajinagar",
  "Yelahanka",
  "Sarjapur Road",
  "BTM Layout",
  "Bellandur",
  "Basavanagudi",
];

const tutors = [
  {
    id: "priya-verma",
    name: "Priya Verma",
    subject: "Mathematics & Physics",
    subjectKey: "Mathematics",
    experience: "6 years",
    rating: 4.9,
    reviews: 124,
    area: "Koramangala",
    mode: ["Home Tuition", "Online"],
    grades: "Class 9-12",
    gradeKey: "Class 9-10",
    rate: "₹600/hr",
    initials: "PV",
    color: "#F47920",
    verified: true,
    bio: "B.Tech from IIT Bombay. Specializes in making complex math and physics concepts simple and intuitive.",
  },
  {
    id: "rahul-sharma",
    name: "Rahul Sharma",
    subject: "Chemistry & Biology",
    subjectKey: "Chemistry",
    experience: "8 years",
    rating: 4.8,
    reviews: 98,
    area: "Indiranagar",
    mode: ["Home Tuition"],
    grades: "Class 10-12, NEET",
    gradeKey: "Class 11-12",
    rate: "₹700/hr",
    initials: "RS",
    color: "#6C63FF",
    verified: true,
    bio: "M.Sc Chemistry from Bangalore University. Helped 50+ students crack NEET with personalized study plans.",
  },
  {
    id: "anita-gupta",
    name: "Anita Gupta",
    subject: "English Language & Literature",
    subjectKey: "English",
    experience: "10 years",
    rating: 5.0,
    reviews: 210,
    area: "HSR Layout",
    mode: ["Home Tuition", "Online"],
    grades: "Class 5-12",
    gradeKey: "Class 6-8",
    rate: "₹500/hr",
    initials: "AG",
    color: "#F47920",
    verified: true,
    bio: "MA English from Christ University, Bengaluru. Expert in CBSE, ICSE, and IB English curriculum.",
  },
  {
    id: "vikram-singh",
    name: "Vikram Singh",
    subject: "Mathematics (JEE Prep)",
    subjectKey: "JEE/NEET Prep",
    experience: "5 years",
    rating: 4.7,
    reviews: 76,
    area: "Whitefield",
    mode: ["Online"],
    grades: "Class 11-12, JEE",
    gradeKey: "Class 11-12",
    rate: "₹800/hr",
    initials: "VS",
    color: "#6C63FF",
    verified: true,
    bio: "IIT Madras graduate. Specialized in JEE Advanced preparation with a 90% success rate.",
  },
  {
    id: "sunita-patel",
    name: "Sunita Patel",
    subject: "Commerce & Accounts",
    subjectKey: "Commerce",
    experience: "7 years",
    rating: 4.9,
    reviews: 88,
    area: "Jayanagar",
    mode: ["Home Tuition", "Online"],
    grades: "Class 11-12",
    gradeKey: "Class 11-12",
    rate: "₹550/hr",
    initials: "SP",
    color: "#F47920",
    verified: true,
    bio: "CA qualified with 7 years of teaching experience in Bengaluru. Makes accounts and economics easy to understand.",
  },
  {
    id: "deepak-joshi",
    name: "Deepak Joshi",
    subject: "Science (Class 6-10)",
    subjectKey: "Biology",
    experience: "4 years",
    rating: 4.6,
    reviews: 54,
    area: "JP Nagar",
    mode: ["Home Tuition"],
    grades: "Class 6-10",
    gradeKey: "Class 6-8",
    rate: "₹450/hr",
    initials: "DJ",
    color: "#6C63FF",
    verified: false,
    bio: "B.Sc Physics. Passionate about making science fun and relatable for middle and high school students.",
  },
  {
    id: "meera-krishnan",
    name: "Meera Krishnan",
    subject: "Mathematics & Science",
    subjectKey: "Mathematics",
    experience: "9 years",
    rating: 4.9,
    reviews: 163,
    area: "Banashankari",
    mode: ["Home Tuition", "Online"],
    grades: "Class 1-10",
    gradeKey: "Class 1-5",
    rate: "₹500/hr",
    initials: "MK",
    color: "#F47920",
    verified: true,
    bio: "M.Ed from Bangalore University. Specializes in building strong foundations for primary and middle school students.",
  },
  {
    id: "arjun-nair",
    name: "Arjun Nair",
    subject: "Computer Science & Coding",
    subjectKey: "Computer Science",
    experience: "3 years",
    rating: 4.8,
    reviews: 42,
    area: "Marathahalli",
    mode: ["Online", "At Tutor's Place"],
    grades: "Class 8-12",
    gradeKey: "Class 9-10",
    rate: "₹650/hr",
    initials: "AN",
    color: "#6C63FF",
    verified: true,
    bio: "Software engineer at a Bengaluru startup. Teaches Python, Java, and web development with real-world projects.",
  },
  {
    id: "kavitha-reddy",
    name: "Kavitha Reddy",
    subject: "Physics & Chemistry",
    subjectKey: "Physics",
    experience: "12 years",
    rating: 4.9,
    reviews: 201,
    area: "Electronic City",
    mode: ["Home Tuition"],
    grades: "Class 9-12, JEE/NEET",
    gradeKey: "Class 11-12",
    rate: "₹750/hr",
    initials: "KR",
    color: "#F47920",
    verified: true,
    bio: "Ph.D Physics from IISc Bengaluru. 12 years of experience coaching students for JEE and NEET with outstanding results.",
  },
];

export default function FindTutor() {
  const [demoModal, setDemoModal] = useState<{ open: boolean; tutorName: string; tutorSubject: string }>({
    open: false, tutorName: "", tutorSubject: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedMode, setSelectedMode] = useState("All Modes");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);

  // Fetch live tutors from DB, fall back to static data if empty
  const { data: dbTutors, isLoading: tutorsLoading } = trpc.tutor.list.useQuery();
  const liveTutors = useMemo(() => {
    if (dbTutors && dbTutors.length > 0) {
      return dbTutors.map((t) => ({
        id: String(t.id),
        name: t.name,
        subject: t.subjects,
        subjectKey: t.subjects.split(",")[0]?.trim() ?? t.subjects,
        experience: t.experience,
        rating: parseFloat(t.rating),
        reviews: t.reviewCount,
        area: t.area,
        mode: t.mode === "both" ? ["Home Tuition", "Online"] : t.mode === "home_tuition" ? ["Home Tuition"] : ["Online"],
        grades: "",
        gradeKey: "All Grades",
        rate: "",
        initials: t.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        color: "#F47920",
        verified: t.isVerified === "yes",
        bio: t.bio ?? "",
        photo: t.photo,
      }));
    }
    return tutors; // fall back to static data
  }, [dbTutors]);

  // Active filter chips
  const activeFilters = [
    selectedSubject !== "All Subjects" && { key: "subject", label: selectedSubject, clear: () => setSelectedSubject("All Subjects") },
    selectedGrade !== "All Grades" && { key: "grade", label: selectedGrade, clear: () => setSelectedGrade("All Grades") },
    selectedMode !== "All Modes" && { key: "mode", label: selectedMode, clear: () => setSelectedMode("All Modes") },
    selectedArea !== "All Areas" && { key: "area", label: selectedArea, clear: () => setSelectedArea("All Areas") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const filteredTutors = useMemo(() => {
    return liveTutors.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject =
        selectedSubject === "All Subjects" || t.subjectKey === selectedSubject;
      const matchesGrade =
        selectedGrade === "All Grades" || t.gradeKey === selectedGrade;
      const matchesMode =
        selectedMode === "All Modes" || t.mode.includes(selectedMode);
      const matchesArea =
        selectedArea === "All Areas" || t.area === selectedArea;
      return matchesSearch && matchesSubject && matchesGrade && matchesMode && matchesArea;
    });
  }, [searchQuery, selectedSubject, selectedGrade, selectedMode, selectedArea]);

  const clearAll = () => {
    setSearchQuery("");
    setSelectedSubject("All Subjects");
    setSelectedGrade("All Grades");
    setSelectedMode("All Modes");
    setSelectedArea("All Areas");
  };

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
                placeholder="Search by subject or tutor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
            {/* Area dropdown in search bar */}
            <div className="relative flex items-center gap-2 px-4 border-l border-[oklch(0.9_0.005_80)]">
              <MapPin size={16} style={{ color: "oklch(0.68 0.18 50)" }} />
              <button
                onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
                className="flex items-center gap-1 text-sm outline-none bg-transparent whitespace-nowrap"
                style={{ color: selectedArea === "All Areas" ? "oklch(0.6 0.01 270)" : "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
              >
                {selectedArea === "All Areas" ? "Area in Bengaluru" : selectedArea}
                <ChevronDown size={14} className={`transition-transform ${areaDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {areaDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-[oklch(0.9_0.005_80)] py-2 w-52 z-50 max-h-64 overflow-y-auto">
                  {bengaluruAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => { setSelectedArea(area); setAreaDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[oklch(0.97_0.01_80)] ${
                        selectedArea === area ? "font-semibold" : ""
                      }`}
                      style={{
                        color: selectedArea === area ? "oklch(0.68 0.18 50)" : "oklch(0.3 0.02 270)",
                        fontFamily: "'Nunito', sans-serif",
                      }}
                    >
                      {area === "All Areas" ? "📍 All Areas" : `📌 ${area}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-primary text-sm py-2 px-6 shrink-0">
              Search
            </button>
          </div>

          {/* Popular area quick-picks */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar", "BTM Layout"].map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area === selectedArea ? "All Areas" : area)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${
                  selectedArea === area
                    ? "bg-white text-[oklch(0.68_0.18_50)] font-bold shadow"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {area}
              </button>
            ))}
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
          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
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
            {/* Area filter dropdown */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm border bg-white outline-none"
              style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.3 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
            >
              {bengaluruAreas.map((a) => <option key={a}>{a}</option>)}
            </select>
            <span className="ml-auto text-sm" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              {tutorsLoading ? "Loading tutors..." : <><strong>{filteredTutors.length}</strong> of {liveTutors.length} tutors</>}
            </span>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <span className="text-xs font-medium" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Active:</span>
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ backgroundColor: "oklch(0.95 0.03 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Nunito', sans-serif" }}
                >
                  {f.key === "area" && <MapPin size={10} />}
                  {f.label}
                  <button onClick={f.clear} className="hover:opacity-70 transition-opacity">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAll}
                className="text-xs underline transition-colors"
                style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Tutor Cards */}
          {filteredTutors.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "oklch(0.2 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                No tutors found
              </h3>
              <p className="text-sm mb-6" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                Try adjusting your filters or{" "}
                <a href="tel:+918618635627" className="underline" style={{ color: "oklch(0.68 0.18 50)" }}>
                  call us
                </a>{" "}
                and we'll find the right tutor for you.
              </p>
              <button onClick={clearAll} className="btn-primary text-sm px-6 py-2">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTutors.map((tutor) => (
                <div key={tutor.id} className="card-hover bg-white rounded-2xl overflow-hidden border border-[oklch(0.9_0.005_80)]">
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

                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "oklch(0.96 0.01 80)", color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                        <Clock size={10} /> {tutor.experience}
                      </div>
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "oklch(0.96 0.01 80)", color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                        <GraduationCap size={10} /> {tutor.grades}
                      </div>
                      {/* Area badge — highlighted if filtered */}
                      <div
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium"
                        style={{
                          backgroundColor: selectedArea === tutor.area ? "oklch(0.95 0.03 50)" : "oklch(0.96 0.01 80)",
                          color: selectedArea === tutor.area ? "oklch(0.68 0.18 50)" : "oklch(0.4 0.02 270)",
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      >
                        <MapPin size={10} /> {tutor.area}, Bengaluru
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
                    <button
                      onClick={() => setDemoModal({ open: true, tutorName: tutor.name, tutorSubject: tutor.subject })}
                      className="flex-1 btn-primary text-xs py-2 text-center justify-center"
                    >
                      Book Demo Class
                    </button>
                    <Link href={`/tutor/${tutor.id}`} className="flex-1 btn-outline text-xs py-2 text-center justify-center">
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Book Demo Modal */}
          <BookDemoModal
            open={demoModal.open}
            onClose={() => setDemoModal({ open: false, tutorName: "", tutorSubject: "" })}
            tutorName={demoModal.tutorName}
            tutorSubject={demoModal.tutorSubject}
          />

          {/* Load more */}
          {filteredTutors.length > 0 && (
            <div className="text-center mt-10">
              <p className="text-sm mb-4" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                Can't find the right tutor? We'll personally match you with the best fit.
              </p>
              <a
                href="tel:+918618635627"
                className="btn-primary text-sm px-8 py-3 inline-flex items-center gap-2"
              >
                📞 Call Us — We'll Find Your Tutor
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
