/**
 * EduNest Tutor Profile Detail Page
 * Design: Warm Academic Energy — Full profile with booking, reviews, availability
 * Fonts: Poppins (headings), Nunito (body)
 * Primary: oklch(0.68 0.18 50) — EduNest Orange
 */

import { useState } from "react";
import { Link, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star, MapPin, Clock, BookOpen, CheckCircle2, Award, GraduationCap,
  Phone, MessageSquare, ArrowLeft, Heart, Share2, ChevronDown, ChevronUp,
  Calendar, Users, ThumbsUp, Briefcase
} from "lucide-react";
import { toast } from "sonner";

const tutorsData: Record<string, {
  id: string; name: string; subject: string; experience: string; rating: number;
  reviews: number; location: string; mode: string[]; grades: string; rate: string;
  initials: string; color: string; verified: boolean; bio: string;
  education: string[]; languages: string[]; subjects: string[];
  availability: string[]; totalStudents: number; successRate: number;
  about: string; teachingStyle: string; achievements: string[];
  reviewsList: { name: string; rating: number; date: string; text: string; subject: string }[];
}> = {
  "priya-verma": {
    id: "priya-verma",
    name: "Priya Verma",
    subject: "Mathematics & Physics",
    experience: "6 years",
    rating: 4.9,
    reviews: 124,
    location: "Koramangala, Bengaluru",
    mode: ["Home Tuition", "Online"],
    grades: "Class 9-12",
    rate: "₹600/hr",
    initials: "PV",
    color: "#F47920",
    verified: true,
    bio: "B.Tech from IIT Bombay. Specializes in making complex math and physics concepts simple and intuitive.",
    education: ["B.Tech (Electrical Engineering) — IIT Bombay, 2017", "Class 12 — CBSE, 98.4%"],
    languages: ["English", "Hindi", "Kannada"],
    subjects: ["Mathematics", "Physics", "Statistics", "JEE Maths"],
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    totalStudents: 87,
    successRate: 96,
    about: "I'm Priya, a passionate educator with 6 years of experience teaching Mathematics and Physics to Class 9-12 students. I completed my B.Tech from IIT Bombay and have since dedicated myself to making STEM subjects accessible and enjoyable for every student.\n\nMy teaching philosophy centers on building strong conceptual foundations rather than rote memorization. I use real-world examples, visual aids, and problem-solving techniques to help students truly understand the 'why' behind every formula.",
    teachingStyle: "I believe in Socratic teaching — asking questions that guide students to discover answers themselves. Each session begins with a quick revision of the previous topic, followed by concept explanation, worked examples, and practice problems. I provide detailed notes after every class.",
    achievements: [
      "87 students taught, 96% showed grade improvement",
      "15+ students cracked JEE Mains with 90+ percentile",
      "Developed custom study materials for CBSE Class 10-12",
      "Top-rated tutor on EduNest for 3 consecutive years",
    ],
    reviewsList: [
      { name: "Aryan K.", rating: 5, date: "March 2025", text: "Priya ma'am is exceptional! She explained integration in a way that finally made sense. My board exam score jumped from 72 to 94.", subject: "Mathematics" },
      { name: "Sneha R.", rating: 5, date: "February 2025", text: "Best physics tutor I've had. She connects theory to real-life examples which makes it so easy to remember. Highly recommend!", subject: "Physics" },
      { name: "Rohan M.", rating: 5, date: "January 2025", text: "Cleared my JEE Mains with 97 percentile in Maths. Priya ma'am's structured approach and regular mock tests were key.", subject: "JEE Maths" },
      { name: "Divya S.", rating: 4, date: "December 2024", text: "Very patient and thorough. Sometimes sessions run a bit long but the quality is excellent. Would definitely recommend.", subject: "Mathematics" },
    ],
  },
  "rahul-sharma": {
    id: "rahul-sharma",
    name: "Rahul Sharma",
    subject: "Chemistry & Biology",
    experience: "8 years",
    rating: 4.8,
    reviews: 98,
    location: "Indiranagar, Bengaluru",
    mode: ["Home Tuition"],
    grades: "Class 10-12, NEET",
    rate: "₹700/hr",
    initials: "RS",
    color: "#6C63FF",
    verified: true,
    bio: "M.Sc Chemistry from Bangalore University. Helped 50+ students crack NEET with personalized study plans.",
    education: ["M.Sc (Organic Chemistry) — Bangalore University, 2015", "B.Sc (Chemistry, Biology) — St. Joseph's College, 2013"],
    languages: ["English", "Hindi", "Kannada", "Telugu"],
    subjects: ["Chemistry", "Biology", "NEET Chemistry", "NEET Biology", "Class 10 Science"],
    availability: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
    totalStudents: 112,
    successRate: 94,
    about: "I'm Rahul, a dedicated science educator with 8 years of experience specializing in Chemistry and Biology for Class 10-12 and NEET aspirants. My passion for science started in school and grew through my M.Sc studies at Bangalore University.\n\nI have helped over 50 students crack NEET with personalized study plans tailored to each student's strengths and weaknesses. I believe every student can excel in science with the right guidance and consistent practice.",
    teachingStyle: "My approach is highly personalized. I start with a diagnostic assessment to understand each student's current level, then create a customized study plan. I use mnemonics, flowcharts, and visual diagrams extensively for Biology, and focus on reaction mechanisms and problem-solving for Chemistry.",
    achievements: [
      "50+ NEET qualifiers, including 3 students with AIR under 1000",
      "112 students taught across 8 years",
      "Developed NEET-specific revision modules used by 200+ students",
      "Guest lecturer at Bengaluru coaching institutes",
    ],
    reviewsList: [
      { name: "Kavya N.", rating: 5, date: "April 2025", text: "Rahul sir helped me crack NEET with AIR 847! His organic chemistry explanations are crystal clear and his biology mnemonics are gold.", subject: "NEET" },
      { name: "Aditya P.", rating: 5, date: "March 2025", text: "Excellent teacher. Very systematic approach to NEET preparation. The weekly tests he conducts are very helpful.", subject: "Chemistry" },
      { name: "Meghna T.", rating: 4, date: "February 2025", text: "Good teacher, very knowledgeable. Sometimes goes into too much depth for board exams but great for NEET.", subject: "Biology" },
      { name: "Siddharth L.", rating: 5, date: "January 2025", text: "Best chemistry tutor in Bengaluru. Scored 185/180 in Chemistry in NEET thanks to his guidance!", subject: "NEET Chemistry" },
    ],
  },
};

// Default tutor for unknown IDs
const defaultTutor = tutorsData["priya-verma"];

export default function TutorProfile() {
  const params = useParams<{ id: string }>();
  const tutorId = params.id || "priya-verma";
  const tutor = tutorsData[tutorId] || defaultTutor;

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "availability">("about");

  const displayedReviews = showAllReviews ? tutor.reviewsList : tutor.reviewsList.slice(0, 2);

  const handleBookDemo = () => {
    toast.success("Demo class request sent! Priya will contact you within 2 hours.", {
      description: "Check your phone for a confirmation SMS.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[oklch(0.92_0.005_80)]">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
            <Link href="/" className="hover:text-[oklch(0.68_0.18_50)] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/find-tutor" className="hover:text-[oklch(0.68_0.18_50)] transition-colors">Find Tutor</Link>
            <span>/</span>
            <span style={{ color: "oklch(0.68 0.18 50)" }}>{tutor.name}</span>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Profile Header */}
        <section className="bg-white border-b border-[oklch(0.92_0.005_80)] py-8">
          <div className="container">
            <Link href="/find-tutor" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-[oklch(0.68_0.18_50)]" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              <ArrowLeft size={16} /> Back to Tutors
            </Link>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar + Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6 items-start flex-1">
                <div className="relative shrink-0">
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shadow-lg"
                    style={{ backgroundColor: tutor.color, fontFamily: "'Poppins', sans-serif" }}
                  >
                    {tutor.initials}
                  </div>
                  {tutor.verified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                      <CheckCircle2 size={20} style={{ color: "#22C55E" }} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                      {tutor.name}
                    </h1>
                    {tutor.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </div>

                  <p className="text-base font-semibold mb-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                    {tutor.subject}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={16} fill="#F47920" style={{ color: "#F47920" }} />
                      <span className="font-bold text-sm" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{tutor.rating}</span>
                      <span className="text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>({tutor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={16} style={{ color: "oklch(0.55 0.01 270)" }} />
                      <span className="text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{tutor.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={16} style={{ color: "oklch(0.55 0.01 270)" }} />
                      <span className="text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{tutor.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={16} style={{ color: "oklch(0.55 0.01 270)" }} />
                      <span className="text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{tutor.grades}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tutor.mode.map((m) => (
                      <span key={m} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "oklch(0.95 0.03 50)", color: "oklch(0.68 0.18 50)" }}>
                        {m}
                      </span>
                    ))}
                    {tutor.subjects.slice(0, 3).map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "oklch(0.95 0.005 80)", color: "oklch(0.4 0.02 270)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="bg-white rounded-2xl border border-[oklch(0.9_0.005_80)] shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-extrabold" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>{tutor.rate}</span>
                      <span className="text-sm ml-1" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>per session</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLiked(!liked)}
                        className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-150 hover:scale-110"
                        style={{ borderColor: liked ? "#F47920" : "oklch(0.9 0.005 80)", color: liked ? "#F47920" : "oklch(0.55 0.01 270)" }}
                      >
                        <Heart size={16} fill={liked ? "#F47920" : "none"} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-150 hover:scale-110"
                        style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.55 0.01 270)" }}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <CheckCircle2 size={15} style={{ color: "#22C55E" }} /> First demo class is FREE
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <CheckCircle2 size={15} style={{ color: "#22C55E" }} /> No commitment required
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <CheckCircle2 size={15} style={{ color: "#22C55E" }} /> Responds within 2 hours
                    </div>
                  </div>

                  <button
                    onClick={handleBookDemo}
                    className="w-full btn-primary text-base py-3.5 mb-3"
                  >
                    <Calendar size={18} /> Book Free Demo Class
                  </button>

                  <a
                    href="tel:+918618635627"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150 border-2"
                    style={{ borderColor: "oklch(0.68 0.18 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Phone size={16} /> Call EduNest
                  </a>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { icon: Users, label: "Students Taught", value: `${tutor.totalStudents}+` },
                    { icon: ThumbsUp, label: "Success Rate", value: `${tutor.successRate}%` },
                    { icon: Star, label: "Avg Rating", value: `${tutor.rating}/5` },
                    { icon: Clock, label: "Experience", value: tutor.experience },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white rounded-xl p-3 border border-[oklch(0.92_0.005_80)] text-center">
                      <Icon size={18} className="mx-auto mb-1" style={{ color: "oklch(0.68 0.18 50)" }} />
                      <div className="text-base font-extrabold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{value}</div>
                      <div className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="container py-8">
          <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-[oklch(0.92_0.005_80)] w-fit">
            {(["about", "reviews", "availability"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab ? "oklch(0.68 0.18 50)" : "transparent",
                  color: activeTab === tab ? "white" : "oklch(0.4 0.02 270)",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {tab === "about" ? "About" : tab === "reviews" ? `Reviews (${tutor.reviews})` : "Availability"}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* About Tab */}
              {activeTab === "about" && (
                <div className="space-y-8">
                  {/* About */}
                  <div className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)]">
                    <h2 className="text-lg font-bold mb-4" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>About {tutor.name}</h2>
                    {tutor.about.split("\n\n").map((para, i) => (
                      <p key={i} className="leading-relaxed mb-3 last:mb-0" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{para}</p>
                    ))}
                  </div>

                  {/* Teaching Style */}
                  <div className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)]">
                    <h2 className="text-lg font-bold mb-4" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Teaching Style</h2>
                    <p className="leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{tutor.teachingStyle}</p>
                  </div>

                  {/* Education */}
                  <div className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)]">
                    <h2 className="text-lg font-bold mb-4" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Education</h2>
                    <ul className="space-y-3">
                      {tutor.education.map((edu, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <GraduationCap size={18} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                          <span className="text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Achievements */}
                  <div className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)]">
                    <h2 className="text-lg font-bold mb-4" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Achievements</h2>
                    <ul className="space-y-3">
                      {tutor.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Award size={18} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                          <span className="text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {/* Rating Summary */}
                  <div className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)] flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold mb-1" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>{tutor.rating}</div>
                      <div className="flex gap-0.5 justify-center mb-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#F47920" style={{ color: "#F47920" }} />)}
                      </div>
                      <div className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{tutor.reviews} reviews</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5,4,3,2,1].map(star => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs w-4 text-right" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{star}</span>
                          <Star size={12} fill="#F47920" style={{ color: "#F47920" }} />
                          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "oklch(0.93 0.005 80)" }}>
                            <div className="h-full rounded-full" style={{ backgroundColor: "#F47920", width: star === 5 ? "80%" : star === 4 ? "14%" : star === 3 ? "4%" : "1%" }} />
                          </div>
                          <span className="text-xs w-8" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{star === 5 ? "80%" : star === 4 ? "14%" : star === 3 ? "4%" : "1%"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {displayedReviews.map((review, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{review.name}</div>
                            <div className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{review.subject} · {review.date}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, s) => <Star key={s} size={14} fill="#F47920" style={{ color: "#F47920" }} />)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{review.text}</p>
                    </div>
                  ))}

                  {tutor.reviewsList.length > 2 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 border-2"
                      style={{ borderColor: "oklch(0.68 0.18 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                    >
                      {showAllReviews ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> Show All {tutor.reviews} Reviews</>}
                    </button>
                  )}
                </div>
              )}

              {/* Availability Tab */}
              {activeTab === "availability" && (
                <div className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)]">
                  <h2 className="text-lg font-bold mb-6" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Weekly Availability</h2>
                  <div className="grid grid-cols-7 gap-2 mb-6">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const available = tutor.availability.includes(day);
                      return (
                        <div key={day} className="text-center">
                          <div className="text-xs font-semibold mb-2" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>{day}</div>
                          <div
                            className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: available ? "oklch(0.95 0.03 50)" : "oklch(0.95 0.005 80)",
                              color: available ? "oklch(0.68 0.18 50)" : "oklch(0.75 0.005 80)",
                            }}
                          >
                            {available ? "✓" : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "oklch(0.97 0.01 80)" }}>
                    <p className="text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <strong>Preferred timings:</strong> 4:00 PM – 8:00 PM on weekdays, 9:00 AM – 6:00 PM on weekends. Exact schedule is agreed upon during the free demo class.
                    </p>
                  </div>
                  <button onClick={handleBookDemo} className="btn-primary w-full mt-5">
                    <Calendar size={18} /> Book Free Demo Class
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Subjects */}
              <div className="bg-white rounded-2xl p-5 border border-[oklch(0.92_0.005_80)]">
                <h3 className="font-bold mb-3 text-sm" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Subjects Taught</h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "oklch(0.95 0.03 50)", color: "oklch(0.68 0.18 50)" }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-2xl p-5 border border-[oklch(0.92_0.005_80)]">
                <h3 className="font-bold mb-3 text-sm" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.languages.map((l) => (
                    <span key={l} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "oklch(0.95 0.005 80)", color: "oklch(0.4 0.02 270)" }}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Teaching Mode */}
              <div className="bg-white rounded-2xl p-5 border border-[oklch(0.92_0.005_80)]">
                <h3 className="font-bold mb-3 text-sm" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Teaching Mode</h3>
                <div className="space-y-2">
                  {tutor.mode.map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <CheckCircle2 size={15} style={{ color: "#22C55E" }} />
                      <span className="text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact CTA */}
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50), oklch(0.75 0.16 55))" }}>
                <h3 className="font-bold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Have Questions?</h3>
                <p className="text-sm text-white/90 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Our team is here to help you find the perfect tutor match.</p>
                <a href="tel:+918618635627" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-white transition-all duration-150 hover:bg-white/90" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                  <Phone size={15} /> +91-8618635627
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
