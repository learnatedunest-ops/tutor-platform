/**
 * EduConnect Become a Tutor Page
 * Design: Warm Academic Energy — Registration form + benefits
 */

import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle2,
  ArrowRight,
  IndianRupee,
  Clock,
  Users,
  Star,
  Shield,
  Smartphone,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

const benefits = [
  {
    icon: IndianRupee,
    title: "Earn ₹500–₹2000/hr",
    desc: "Set your own rates based on your expertise and experience. Get paid after every session.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    desc: "Teach on your own terms. Choose your availability and accept only the sessions that suit you.",
  },
  {
    icon: Users,
    title: "Access 100K+ Students",
    desc: "Tap into our massive student network across 50+ cities in India.",
  },
  {
    icon: Shield,
    title: "Verified & Trusted",
    desc: "Get a verified badge on your profile to build trust and attract more students.",
  },
  {
    icon: Smartphone,
    title: "Easy App Management",
    desc: "Manage your schedule, communicate with students, and track earnings all from our app.",
  },
  {
    icon: Star,
    title: "Build Your Reputation",
    desc: "Collect reviews and ratings to grow your profile and command higher rates over time.",
  },
];

const steps = [
  { step: "01", title: "Create Your Profile", desc: "Sign up and fill in your qualifications, subjects, and teaching experience." },
  { step: "02", title: "Get Verified", desc: "Submit your documents for a quick background and qualification check." },
  { step: "03", title: "Set Your Rates", desc: "Choose your hourly rate and availability. You're in full control." },
  { step: "04", title: "Start Earning", desc: "Receive student requests, conduct sessions, and get paid instantly." },
];

export default function BecomeTutor() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", experience: "", city: "", mode: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Application submitted! We'll contact you within 24 hours.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.14 0.02 270) 0%, oklch(0.22 0.04 270) 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, oklch(0.68 0.18 50) 0%, transparent 60%)" }} />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: "oklch(0.68 0.18 50 / 0.2)", color: "oklch(0.82 0.14 75)", fontFamily: "'Nunito', sans-serif" }}>
                <Star size={14} fill="oklch(0.82 0.14 75)" /> Join 2,500+ Active Tutors
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Share Your Knowledge.<br />
                <span style={{ color: "oklch(0.68 0.18 50)" }}>Earn on Your Terms.</span>
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "oklch(0.7 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                Join EduConnect and connect with thousands of students who need your expertise. Set your schedule, choose your students, and earn ₹500–₹2000 per hour.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {["Free to join", "No commission on first month", "Instant payouts"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.75 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    <CheckCircle2 size={16} style={{ color: "oklch(0.68 0.18 50)" }} />
                    {item}
                  </div>
                ))}
              </div>
              <img
                src="/manus-storage/tutor-benefit_cb974077.png"
                alt="Tutor"
                className="rounded-2xl w-full object-cover shadow-xl hidden lg:block"
                style={{ maxHeight: "300px" }}
              />
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "oklch(0.95 0.03 50)" }}>
                    <CheckCircle2 size={40} style={{ color: "oklch(0.68 0.18 50)" }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                    Application Submitted!
                  </h3>
                  <p className="mb-6" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    Our team will review your profile and contact you within 24 hours.
                  </p>
                  <Link href="/" className="btn-primary">Back to Home</Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                    Register as a Tutor
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    Fill in your details and we'll get you started within 24 hours.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                      { key: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
                      { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
                      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
                      { key: "city", label: "City", type: "text", placeholder: "e.g. Jaipur, Delhi, Mumbai" },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                          {label}
                        </label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          required
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                          style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
                          onFocus={(e) => (e.target.style.borderColor = "oklch(0.68 0.18 50)")}
                          onBlur={(e) => (e.target.style.borderColor = "oklch(0.9 0.005 80)")}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                        Subject(s) You Teach
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mathematics, Physics, English"
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                          Experience
                        </label>
                        <select
                          required
                          value={form.experience}
                          onChange={(e) => setForm({ ...form, experience: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-white"
                          style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
                        >
                          <option value="">Select</option>
                          <option>Less than 1 year</option>
                          <option>1-3 years</option>
                          <option>3-5 years</option>
                          <option>5+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                          Teaching Mode
                        </label>
                        <select
                          required
                          value={form.mode}
                          onChange={(e) => setForm({ ...form, mode: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-white"
                          style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
                        >
                          <option value="">Select</option>
                          <option>Home Tuition</option>
                          <option>Online</option>
                          <option>Both</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center text-base py-3">
                      Submit Application <ArrowRight size={18} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.99 0.01 80)" }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
              Why EduConnect
            </p>
            <h2 className="section-title orange-underline mb-4">Why Tutors Love EduConnect</h2>
            <p className="section-subtitle max-w-2xl mx-auto mt-6">
              We make it easy for talented educators to build a thriving tutoring career on their own terms.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover bg-white rounded-2xl p-6 border border-[oklch(0.9_0.005_80)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "oklch(0.95 0.03 50)" }}>
                  <Icon size={22} style={{ color: "oklch(0.68 0.18 50)" }} />
                </div>
                <h4 className="font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for tutors */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.96 0.01 80)" }}>
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="section-title orange-underline mb-4">How to Get Started</h2>
            <p className="section-subtitle max-w-xl mx-auto mt-6">Start earning in 4 simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="card-hover bg-white rounded-2xl p-6 text-center border border-[oklch(0.9_0.005_80)]">
                <div className="text-4xl font-extrabold mb-3" style={{ color: "oklch(0.9 0.03 50)", fontFamily: "'Poppins', sans-serif" }}>{step}</div>
                <h4 className="font-bold mb-2 text-sm" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
