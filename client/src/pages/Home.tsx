/**
 * EduNest Home Page — Enhanced
 * Design: Warm Academic Energy — Orange hero with diagonal cuts, recurring wave motifs,
 * asymmetric layouts, action-led CTAs, animated stats
 * Fonts: Poppins (headings), Nunito (body)
 * Primary: oklch(0.68 0.18 50) — EduNest Orange
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star,
  CheckCircle2,
  BookOpen,
  Users,
  Award,
  GraduationCap,
  FlaskConical,
  Calculator,
  Palette,
  Languages,
  Trophy,
  Music,
  Building2,
  ArrowRight,
  Play,
  Phone,
  Sparkles,
} from "lucide-react";

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

// ─── Counter animation hook ───────────────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, started]);

  return { count, ref };
}

// ─── Subject categories ───────────────────────────────────────────────────────
const subjects = [
  { icon: BookOpen, label: "Pre-Primary to 10th", color: "#F47920", bg: "#FFF0E6" },
  { icon: Building2, label: "School Faculty", color: "#6C63FF", bg: "#F0EEFF" },
  { icon: Calculator, label: "Commerce & Accounts", color: "#F47920", bg: "#FFF0E6" },
  { icon: FlaskConical, label: "Science", color: "#6C63FF", bg: "#F0EEFF" },
  { icon: Palette, label: "Arts & Crafts", color: "#F47920", bg: "#FFF0E6" },
  { icon: GraduationCap, label: "CBSE / ICSE / IB / State Board", color: "#6C63FF", bg: "#F0EEFF" },
  { icon: Languages, label: "English, French, German", color: "#F47920", bg: "#FFF0E6" },
  { icon: Trophy, label: "Competitive Exams (JEE/NEET)", color: "#6C63FF", bg: "#F0EEFF" },
  { icon: Music, label: "Non-Academic Learning", color: "#F47920", bg: "#FFF0E6" },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Class 10 Student",
    subject: "Mathematics",
    text: "EduNest helped me find an amazing math tutor within 24 hours. My grades went from C to A in just two months. The tutor explains concepts so clearly!",
    rating: 5,
    avatar: "PS",
    avatarBg: "#F47920",
  },
  {
    name: "Rahul Mehta",
    role: "Physics Tutor",
    subject: "Physics & Chemistry",
    text: "As a tutor, EduNest has given me a steady stream of serious students. The platform is easy to use and the support team is very responsive.",
    rating: 5,
    avatar: "RM",
    avatarBg: "#6C63FF",
  },
  {
    name: "Sunita Patel",
    role: "Parent of Class 8 Student",
    subject: "Science",
    text: "My daughter was struggling with science. Within a week of joining EduNest, she had a wonderful tutor who made learning fun. Highly recommend!",
    rating: 5,
    avatar: "SP",
    avatarBg: "#F47920",
  },
];

// ─── How it works ─────────────────────────────────────────────────────────────
const steps = [
  { step: "01", title: "Tell Us Your Needs", desc: "Share your subject, grade level, location, and schedule. We match you with the right tutors.", icon: BookOpen },
  { step: "02", title: "Browse & Choose", desc: "Review tutor profiles, qualifications, experience, and student reviews. Pick the one that fits.", icon: Users },
  { step: "03", title: "Book a Free Demo", desc: "Get a free trial session to ensure the tutor's teaching style matches your learning needs.", icon: Play },
  { step: "04", title: "Start Learning", desc: "Begin your personalized learning journey — online or at home — at your convenient time.", icon: GraduationCap },
];

// ─── Stat Item ────────────────────────────────────────────────────────────────
function StatItem({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(target);
  return (
    <div ref={ref} className="text-center px-4">
      <div className="text-5xl md:text-6xl font-extrabold mb-2 tabular-nums" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)" }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Wave Divider ─────────────────────────────────────────────────────────────
function WaveDivider({ fill, fromColor }: { fill: string; fromColor: string }) {
  return (
    <div style={{ backgroundColor: fromColor, marginBottom: "-1px", lineHeight: 0 }}>
      <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block", height: "70px" }}>
        <path d="M0,35 C240,70 480,0 720,35 C960,70 1200,0 1440,35 L1440,70 L0,70 Z" fill={fill} />
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const subjectsRef = useScrollReveal();
  const servicesRef = useScrollReveal();
  const howRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const [activeTab, setActiveTab] = useState<"students" | "tutors">("students");

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.62 0.19 48) 0%, oklch(0.70 0.18 52) 45%, oklch(0.78 0.15 58) 100%)",
          minHeight: "620px",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute" style={{ top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute" style={{ bottom: "-60px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div className="absolute" style={{ top: "40%", left: "38%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div className="container relative z-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "white", fontFamily: "'Nunito', sans-serif", backdropFilter: "blur(8px)" }}>
                <Sparkles size={14} /> Trusted by 5,000+ Students Across Bengaluru
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}>
                Your Child's Best<br />
                <span style={{ color: "oklch(0.14 0.02 270)" }}>Teacher</span> Is One<br />
                Click Away
              </h1>
              <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Connect with verified, experienced home tutors for personalized one-on-one sessions — online or at your doorstep. CBSE, ICSE, IB, and all boards covered.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/find-tutor" className="btn-white text-base px-8 py-3.5 shadow-lg">
                  Find My Tutor <ArrowRight size={18} />
                </Link>
                <a href="tel:+918618635627" className="inline-flex items-center gap-2 text-base px-8 py-3.5 rounded-lg font-semibold transition-all duration-150" style={{ border: "2px solid rgba(255,255,255,0.5)", color: "white", fontFamily: "'Poppins', sans-serif" }}>
                  <Phone size={16} /> Call Us Now
                </a>
              </div>
              <div className="flex flex-wrap gap-5">
                {[
                  { icon: CheckCircle2, text: "Free Demo Class" },
                  { icon: CheckCircle2, text: "Verified Tutors" },
                  { icon: CheckCircle2, text: "Online & Home Tuition" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-white/90 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    <Icon size={16} className="text-white" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Image with floating cards */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(255,255,255,0.12)", transform: "rotate(4deg) scale(0.95)", backdropFilter: "blur(4px)" }} />
              <img
                src="/manus-storage/hero-tutor-student_bfec5a06.png"
                alt="Tutor with student"
                className="relative z-10 rounded-3xl w-full object-cover shadow-2xl"
                style={{ maxHeight: "480px", transform: "rotate(-1deg)" }}
              />
              {/* Floating badge — bottom left */}
              <div className="absolute -bottom-5 -left-5 z-20 bg-white rounded-2xl p-4 shadow-2xl" style={{ minWidth: "160px" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF0E6" }}>
                    <Award size={20} style={{ color: "#F47920" }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>200+ Tutors</div>
                    <div className="text-xs" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Ready to teach today</div>
                  </div>
                </div>
              </div>
              {/* Floating badge — top right */}
              <div className="absolute -top-5 -right-5 z-20 bg-white rounded-2xl p-4 shadow-2xl" style={{ minWidth: "160px" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF0E6" }}>
                    <Star size={20} style={{ color: "#F47920" }} fill="#F47920" />
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>4.9 / 5 Rating</div>
                    <div className="text-xs" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>From 50,000+ reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider to next section */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block", height: "80px" }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="oklch(0.99 0.01 80)" />
          </svg>
        </div>
      </section>

      {/* ── SUBJECTS ─────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.99 0.01 80)" }}>
        <div className="container">
          <div ref={subjectsRef} className="fade-up text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#F47920", fontFamily: "'Poppins', sans-serif" }}>
              What We Cover
            </p>
            <h2 className="section-title mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Tutors for Every Subject & Board
            </h2>
            <div className="w-16 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "#F47920" }} />
            <p className="section-subtitle max-w-2xl mx-auto">
              From pre-primary to competitive exams, we have experienced tutors across all subjects, boards, and learning styles.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {subjects.map(({ icon: Icon, label, color, bg }) => (
              <Link
                key={label}
                href="/find-tutor"
                className="card-hover rounded-2xl p-6 flex flex-col items-center gap-3 text-center border group"
                style={{ backgroundColor: "white", borderColor: "oklch(0.92 0.005 80)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={26} style={{ color }} />
                </div>
                <span className="text-sm font-semibold leading-tight" style={{ color: "oklch(0.2 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <WaveDivider fill="oklch(0.14 0.02 270)" fromColor="oklch(0.99 0.01 80)" />

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "oklch(0.14 0.02 270)" }} className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/10">
            <StatItem target={5000} suffix="+" label="Happy Students" />
            <StatItem target={200} suffix="+" label="Expert Tutors" />
            <StatItem target={15} suffix="+" label="Areas in Bengaluru" />
            <StatItem target={98} suffix="%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <WaveDivider fill="oklch(0.99 0.01 80)" fromColor="oklch(0.14 0.02 270)" />

      {/* ── SERVICES ─────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.99 0.01 80)" }}>
        <div className="container">
          <div ref={servicesRef} className="fade-up text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#F47920", fontFamily: "'Poppins', sans-serif" }}>
              Our Services
            </p>
            <h2 className="section-title mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Experienced Tutors for Everyone
            </h2>
            <div className="w-16 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "#F47920" }} />
            <p className="section-subtitle max-w-2xl mx-auto">
              Whether you're a student seeking personal attention or an institution looking for qualified faculty, we have the right solution.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl p-1.5" style={{ backgroundColor: "oklch(0.94 0.01 80)", border: "1px solid oklch(0.9 0.005 80)" }}>
              {(["students", "tutors"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    backgroundColor: activeTab === tab ? "#F47920" : "transparent",
                    color: activeTab === tab ? "white" : "oklch(0.4 0.02 270)",
                    boxShadow: activeTab === tab ? "0 4px 12px rgba(244,121,32,0.35)" : "none",
                  }}
                >
                  {tab === "students" ? "For Students & Parents" : "For Tutors"}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "students" ? (
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, #F47920 0%, #FFB347 100%)", transform: "rotate(3deg) scale(0.97)", opacity: 0.15 }} />
                <img
                  src="/manus-storage/student-benefit_13c705d9.png"
                  alt="Student learning"
                  className="relative z-10 rounded-3xl w-full object-cover shadow-xl"
                  style={{ maxHeight: "420px" }}
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                  Personalized Tutoring Services
                </h3>
                <p className="mb-6 leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                  Access a network of top-notch tutors who are experts in their fields. Get a tutor who teaches online or at your doorstep according to your convenient timing.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Competent and experienced tutors for every subject",
                    "Study from the comfort of your home — online or offline",
                    "Affordable and flexible timing",
                    "Free demo class before you commit",
                    "Engaging, personalized learning experience",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "#F47920" }} />
                      <span className="text-sm" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/find-tutor" className="btn-primary">
                  Find My Tutor <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                  Start Teaching Today
                </h3>
                <p className="mb-6 leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                  Join thousands of tutors who earn on their own terms. Set your own schedule, choose your students, and teach from anywhere.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Earn ₹500–₹2000 per hour based on expertise",
                    "Flexible schedule — teach online or at home",
                    "Access to thousands of students in your city",
                    "Dedicated support and profile promotion",
                    "Instant payment after each session",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "#F47920" }} />
                      <span className="text-sm" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/become-tutor" className="btn-primary">
                  Start Teaching Today <ArrowRight size={16} />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, #6C63FF 0%, #F47920 100%)", transform: "rotate(-3deg) scale(0.97)", opacity: 0.15 }} />
                <img
                  src="/manus-storage/tutor-benefit_cb974077.png"
                  alt="Tutor teaching"
                  className="relative z-10 rounded-3xl w-full object-cover shadow-xl"
                  style={{ maxHeight: "420px" }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Wave divider */}
      <WaveDivider fill="oklch(0.96 0.01 80)" fromColor="oklch(0.99 0.01 80)" />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.96 0.01 80)" }}>
        <div className="container">
          <div ref={howRef} className="fade-up text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#F47920", fontFamily: "'Poppins', sans-serif" }}>
              Simple Process
            </p>
            <h2 className="section-title mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              How EduNest Works
            </h2>
            <div className="w-16 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "#F47920" }} />
            <p className="section-subtitle max-w-2xl mx-auto">
              Getting the perfect tutor for your child takes less than 24 hours. Here's how simple it is.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 z-0" style={{ left: "calc(50% + 2.5rem)", width: "calc(100% - 5rem)", height: "2px", background: "linear-gradient(90deg, #F47920 0%, rgba(244,121,32,0.2) 100%)" }} />
                )}
                <div className="card-hover bg-white rounded-2xl p-6 text-center relative z-10 border" style={{ borderColor: "oklch(0.9 0.005 80)" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#FFF0E6" }}>
                    <Icon size={28} style={{ color: "#F47920" }} />
                  </div>
                  <div className="text-4xl font-extrabold mb-2" style={{ color: "rgba(244,121,32,0.2)", fontFamily: "'Poppins', sans-serif" }}>
                    {step}
                  </div>
                  <h4 className="font-bold mb-2 text-sm" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                    {title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/find-tutor" className="btn-primary text-base px-10 py-4">
              Book a Free Demo Class <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <WaveDivider fill="oklch(0.99 0.01 80)" fromColor="oklch(0.96 0.01 80)" />

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.99 0.01 80)" }}>
        <div className="container">
          <div ref={testimonialsRef} className="fade-up text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#F47920", fontFamily: "'Poppins', sans-serif" }}>
              Success Stories
            </p>
            <h2 className="section-title mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              What Our Community Says
            </h2>
            <div className="w-16 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "#F47920" }} />
            <p className="section-subtitle max-w-2xl mx-auto">
              Real results from real students, parents, and tutors across India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map(({ name, role, subject, text, rating, avatar, avatarBg }) => (
              <div key={name} className="card-hover bg-white rounded-2xl p-6 border" style={{ borderColor: "oklch(0.9 0.005 80)" }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#F47920" style={{ color: "#F47920" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: avatarBg, fontFamily: "'Poppins', sans-serif" }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{name}</div>
                    <div className="text-xs" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{role} · {subject}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <WaveDivider fill="oklch(0.14 0.02 270)" fromColor="oklch(0.99 0.01 80)" />

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "oklch(0.14 0.02 270)" }} className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #F47920 0%, transparent 60%)" }} />
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: "rgba(244,121,32,0.15)", color: "#F47920", fontFamily: "'Nunito', sans-serif" }}>
            <Sparkles size={14} /> First demo class is completely free
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
            Join over 5,000 students who found their perfect tutor on EduNest in Bengaluru. No commitment — just better learning.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/find-tutor" className="btn-primary text-base px-10 py-4">
              Find My Tutor <ArrowRight size={18} />
            </Link>
            <Link href="/become-tutor" className="inline-flex items-center gap-2 text-base px-10 py-4 rounded-lg font-semibold transition-all duration-150" style={{ border: "2px solid rgba(255,255,255,0.3)", color: "white", fontFamily: "'Poppins', sans-serif" }}>
              Start Teaching Today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
