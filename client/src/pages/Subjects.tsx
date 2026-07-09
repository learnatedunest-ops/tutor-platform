/**
 * EduNest Subjects Page
 * Design: Warm Academic Energy — Subject categories with tutor counts
 */

import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Users, Star } from "lucide-react";

const subjectCategories = [
  {
    category: "Mathematics",
    icon: "📐",
    color: "#F47920",
    bgColor: "#FFF4EC",
    tutors: 42,
    rating: 4.9,
    description: "From basic arithmetic to advanced calculus, JEE Maths, and Statistics.",
    subjects: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics", "JEE Maths", "Class 1-12"],
    popular: true,
  },
  {
    category: "Science",
    icon: "🔬",
    color: "#6C63FF",
    bgColor: "#F0EEFF",
    tutors: 38,
    rating: 4.8,
    description: "Physics, Chemistry, and Biology for CBSE, ICSE, and NEET preparation.",
    subjects: ["Physics", "Chemistry", "Biology", "NEET Prep", "Class 6-12", "Practical Labs"],
    popular: true,
  },
  {
    category: "English",
    icon: "📖",
    color: "#10B981",
    bgColor: "#ECFDF5",
    tutors: 29,
    rating: 4.8,
    description: "Grammar, literature, writing skills, and spoken English for all levels.",
    subjects: ["Grammar", "Literature", "Creative Writing", "Spoken English", "IELTS", "TOEFL"],
    popular: false,
  },
  {
    category: "Commerce & Accounts",
    icon: "📊",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    tutors: 18,
    rating: 4.7,
    description: "Accountancy, Business Studies, and Economics for Class 11-12 and CA Foundation.",
    subjects: ["Accountancy", "Business Studies", "Economics", "CA Foundation", "Class 11-12"],
    popular: false,
  },
  {
    category: "Computer Science",
    icon: "💻",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    tutors: 22,
    rating: 4.8,
    description: "Programming, data structures, web development, and school computer science.",
    subjects: ["Python", "Java", "C++", "Web Development", "Data Structures", "Class 9-12 CS"],
    popular: false,
  },
  {
    category: "Languages",
    icon: "🌐",
    color: "#EC4899",
    bgColor: "#FDF2F8",
    tutors: 15,
    rating: 4.7,
    description: "Hindi, Kannada, French, German, and other languages for all boards.",
    subjects: ["Hindi", "Kannada", "French", "German", "Sanskrit", "Tamil"],
    popular: false,
  },
  {
    category: "Competitive Exams",
    icon: "🏆",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    tutors: 25,
    rating: 4.9,
    description: "JEE, NEET, CET, NTSE, Olympiads, and other competitive exam preparation.",
    subjects: ["JEE Mains & Advanced", "NEET", "Karnataka CET", "NTSE", "Olympiads", "KVPY"],
    popular: true,
  },
  {
    category: "Social Studies",
    icon: "🗺️",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    tutors: 12,
    rating: 4.6,
    description: "History, Geography, Political Science, and Civics for all boards.",
    subjects: ["History", "Geography", "Political Science", "Economics", "Civics", "Class 6-12"],
    popular: false,
  },
  {
    category: "Arts & Crafts",
    icon: "🎨",
    color: "#F97316",
    bgColor: "#FFF7ED",
    tutors: 8,
    rating: 4.8,
    description: "Drawing, painting, craft, and fine arts for school students and hobbyists.",
    subjects: ["Drawing", "Painting", "Craft", "Fine Arts", "Sketching", "Watercolour"],
    popular: false,
  },
  {
    category: "Music",
    icon: "🎵",
    color: "#14B8A6",
    bgColor: "#F0FDFA",
    tutors: 10,
    rating: 4.9,
    description: "Carnatic music, keyboard, guitar, and vocal training for all ages.",
    subjects: ["Carnatic Vocals", "Keyboard", "Guitar", "Tabla", "Flute", "Western Vocals"],
    popular: false,
  },
  {
    category: "Pre-Primary",
    icon: "🌟",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    tutors: 14,
    rating: 4.9,
    description: "Playful, engaging learning for kindergarten and early primary students.",
    subjects: ["Phonics", "Numbers", "Reading", "Writing", "EVS", "Activity-based Learning"],
    popular: false,
  },
  {
    category: "Sports & Fitness",
    icon: "⚽",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    tutors: 6,
    rating: 4.7,
    description: "Physical education, yoga, and sports coaching for students.",
    subjects: ["Yoga", "Physical Education", "Cricket Coaching", "Badminton", "Swimming"],
    popular: false,
  },
];

export default function Subjects() {
  const popular = subjectCategories.filter((s) => s.popular);
  const all = subjectCategories;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <Navbar />

      {/* Hero */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.75 0.16 55) 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
        <div className="container relative z-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>What We Teach</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Tutors for Every Subject
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            From pre-primary to competitive exams, EduNest has expert tutors for every subject and every board in Bengaluru.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
            <path d="M0 50 C360 0 1080 0 1440 50 L1440 50 L0 50 Z" fill="oklch(0.99 0.005 80)" />
          </svg>
        </div>
      </section>

      <main className="flex-1 container py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: BookOpen, label: "Subjects Covered", value: "30+" },
            { icon: Users, label: "Verified Tutors", value: "200+" },
            { icon: Star, label: "Avg Tutor Rating", value: "4.8★" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-[oklch(0.92_0.005_80)] text-center shadow-sm">
              <Icon size={22} className="mx-auto mb-2" style={{ color: "oklch(0.68 0.18 50)" }} />
              <div className="text-2xl font-extrabold mb-1" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{value}</div>
              <div className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Most Popular</h2>
          <p className="mb-6" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Highest demand subjects among EduNest students in Bengaluru</p>
          <div className="grid md:grid-cols-3 gap-6">
            {popular.map((cat) => (
              <Link key={cat.category} href={`/find-tutor?subject=${encodeURIComponent(cat.category)}`}>
                <div
                  className="group rounded-2xl p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                  style={{ backgroundColor: cat.bgColor, borderColor: cat.color + "40" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{cat.icon}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                      🔥 Popular
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{cat.category}</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <span className="flex items-center gap-1"><Users size={12} /> {cat.tutors} tutors</span>
                      <span className="flex items-center gap-1"><Star size={12} fill={cat.color} style={{ color: cat.color }} /> {cat.rating}</span>
                    </div>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" style={{ color: cat.color }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>All Subject Categories</h2>
          <p className="mb-6" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Browse all subjects and find the right tutor for your needs</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {all.map((cat) => (
              <Link key={cat.category} href={`/find-tutor?subject=${encodeURIComponent(cat.category)}`}>
                <div className="group bg-white rounded-2xl p-5 border border-[oklch(0.92_0.005_80)] cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[oklch(0.68_0.18_50)] hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: cat.bgColor }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{cat.category}</h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                        <span className="flex items-center gap-1"><Users size={11} /> {cat.tutors} tutors</span>
                        <span className="flex items-center gap-1"><Star size={11} fill="#F47920" style={{ color: "#F47920" }} /> {cat.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cat.subjects.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: cat.bgColor, color: cat.color }}>
                        {s}
                      </span>
                    ))}
                    {cat.subjects.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "oklch(0.95 0.005 80)", color: "oklch(0.55 0.01 270)" }}>
                        +{cat.subjects.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{cat.description.substring(0, 50)}...</span>
                    <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: "oklch(0.68 0.18 50)" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl p-10 text-center" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50), oklch(0.75 0.16 55))" }}>
          <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Can't Find Your Subject?
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            We have tutors for almost every subject. Contact us and we'll match you with the right tutor within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-white">
              Contact Us <ArrowRight size={16} />
            </Link>
            <Link href="/find-tutor" className="btn-outline" style={{ borderColor: "white", color: "white" }}>
              Browse All Tutors
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
