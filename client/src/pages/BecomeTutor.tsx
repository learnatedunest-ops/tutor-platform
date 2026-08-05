/**
 * EduNest Become a Tutor Page
 * Design: Warm Academic Energy — Registration form + benefits
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import LoginWall from "@/components/LoginWall";
import SEO from "@/components/SEO";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

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
    title: "Access 5,000+ Students",
    desc: "Tap into our growing student network across 15+ areas in Bengaluru.",
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
  const { isAuthenticated, loading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const [, navigate] = useLocation();
  const { data: tutorProfile } = trpc.tutorProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated && userRole === "tutor" }
  );

  // Redirect logged-in tutors to their dashboard or setup
  useEffect(() => {
    if (!loading && !roleLoading && isAuthenticated) {
      if (userRole === "tutor") {
        if (tutorProfile) {
          navigate("/tutor-dashboard");
        } else {
          navigate("/tutor-setup");
        }
      } else if (userRole === "student") {
        navigate("/student-setup");
      } else if (userRole === null) {
        navigate("/role-select");
      }
    }
  }, [loading, roleLoading, isAuthenticated, userRole, tutorProfile, navigate]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    subjects: "",
    experience: "",
    area: "",
    mode: "" as "home_tuition" | "online" | "both" | "",
    about: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.tutorApplication.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Application submitted! We'll contact you within 24 hours.");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mode) {
      toast.error("Please select your teaching mode.");
      return;
    }
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      qualification: form.qualification,
      subjects: form.subjects,
      experience: form.experience,
      area: form.area,
      mode: form.mode,
      about: form.about || undefined,
    });
  };

  // Show login wall for unauthenticated users
  if (!loading && !isAuthenticated) {
    return <LoginWall role="tutor" title="Join EduNest as a Tutor" subtitle="Create your free account to complete your tutor profile and start receiving student leads near you." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Become a Home Tutor in Bengaluru | Tutor Jobs — EduNest"
        description="Register as a home tutor in Bengaluru on EduNest. Get student leads near you, flexible timings, earn ₹500–₹2000/hour. Join 200+ verified tutors. Free registration."
        keywords="home tutor jobs Bengaluru, become a tutor Bengaluru, tutor registration Bengaluru, online teaching jobs Bengaluru, part time tutor jobs Bengaluru, private tutor Bengaluru, tuition teacher jobs Bengaluru, CBSE tutor jobs, ICSE tutor jobs, physics tutor jobs Bengaluru, maths tutor jobs Bengaluru"
        url="https://edunest.courses/become-tutor"
      />
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
                <Star size={14} fill="oklch(0.82 0.14 75)" /> Join 200+ Active Tutors
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Share Your Knowledge.<br />
                <span style={{ color: "oklch(0.68 0.18 50)" }}>Earn on Your Terms.</span>
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "oklch(0.7 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                Join EduNest and connect with students in Bengaluru who need your expertise. Set your schedule, choose your students, and earn ₹500–₹2000 per hour.
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
                src="/api/img/tutor-benefit_cb974077.png"
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
                  <p className="mb-2" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    Thank you, <strong>{form.name}</strong>! Our team will review your profile and contact you within 24 hours.
                  </p>
                  <p className="text-sm mb-6" style={{ color: "oklch(0.6 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    For urgent queries, call us at{" "}
                    <a href="tel:+918618635627" className="font-semibold" style={{ color: "oklch(0.68 0.18 50)" }}>+91-8618635627</a>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Full Name *</label>
                        <input type="text" placeholder="Your full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Phone *</label>
                        <input type="tel" placeholder="+91 98765 43210" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Email Address *</label>
                      <input type="email" placeholder="your@email.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Highest Qualification *</label>
                      <input type="text" placeholder="e.g. B.Tech IIT, M.Sc Mathematics, B.Ed" required value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Subject(s) You Teach *</label>
                      <input type="text" placeholder="e.g. Mathematics, Physics, English" required value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Experience *</label>
                        <select required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                          <option value="">Select</option>
                          <option value="Less than 1 year">Less than 1 year</option>
                          <option value="1-3 years">1-3 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5+ years">5+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Teaching Mode *</label>
                        <select required value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as typeof form.mode })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                          <option value="">Select</option>
                          <option value="home_tuition">Home Tuition</option>
                          <option value="online">Online</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Area in Bengaluru *</label>
                      <input type="text" placeholder="e.g. Koramangala, Indiranagar, HSR Layout" required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>About Yourself</label>
                      <textarea placeholder="Tell us about your teaching style and experience..." rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: "oklch(0.9 0.005 80)", color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }} />
                    </div>
                    <button type="submit" disabled={submitMutation.isPending} className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60">
                      {submitMutation.isPending ? (
                        <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                      ) : (
                        <>Submit Application <ArrowRight size={18} /></>
                      )}
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
              Why EduNest
            </p>
            <h2 className="section-title orange-underline mb-4">Why Tutors Love EduNest</h2>
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
