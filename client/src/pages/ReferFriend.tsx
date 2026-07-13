/**
 * EduNest — Refer a Friend Page
 * Parents refer other parents; both get a discount on the next booking.
 */

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Gift, Users, CheckCircle2, Copy, Share2,
  Star, ArrowRight, Phone, Mail, User
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "1",
    icon: Share2,
    title: "Share with a Friend",
    desc: "Fill in your friend's details below. We'll reach out to them on your behalf.",
    color: "#F47920",
  },
  {
    step: "2",
    icon: Users,
    title: "Friend Joins EduNest",
    desc: "When your friend registers and books their first demo class, the referral is confirmed.",
    color: "#6C63FF",
  },
  {
    step: "3",
    icon: Gift,
    title: "Both Get Rewarded",
    desc: "You get ₹200 off your next booking, and your friend gets ₹200 off their first booking.",
    color: "#10B981",
  },
];

const BENEFITS = [
  "₹200 discount for you on your next booking",
  "₹200 discount for your friend on their first booking",
  "No limit — refer as many friends as you want",
  "Discount applied automatically — no coupon needed",
  "Valid for home tuition and online sessions",
];

export default function ReferFriend() {
  const [form, setForm] = useState({
    referrerName: "",
    referrerEmail: "",
    referrerPhone: "",
    refereeName: "",
    refereeEmail: "",
    refereePhone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  const submitMutation = trpc.referral.submit.useMutation({
    onSuccess: (data) => {
      setReferralCode(data.referralCode);
      setSubmitted(true);
      toast.success("Referral submitted successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.referrerName || !form.referrerEmail || !form.refereeName || !form.refereeEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate(form);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Hey! I'm using EduNest for quality home tutoring in Bengaluru. Use my referral code ${referralCode} when you sign up to get ₹200 off your first booking! 🎓 https://edunest.courses`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Share message copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <SEO
        title="Refer a Friend — EduNest | Earn ₹200 Discount"
        description="Refer a friend to EduNest and both of you get ₹200 off your next tutor booking in Bengaluru. No limit on referrals!"
        keywords="refer a friend EduNest, tutor referral Bengaluru, home tuition discount"
        url="https://edunest.courses/refer"
      />
      <Navbar />

      {/* Hero */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.58 0.20 40) 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
          paddingBottom: "6rem",
        }}
      >
        <div className="container relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            <Gift size={16} /> Referral Programme
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Refer a Friend,<br />Both Save ₹200
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Know a parent looking for a great tutor in Bengaluru? Refer them to EduNest and both of you get a ₹200 discount on your next booking.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16" style={{ marginTop: "-2rem" }}>
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-[oklch(0.92_0.005_80)] shadow-sm text-center relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-lg font-extrabold" style={{ backgroundColor: color, fontFamily: "'Poppins', sans-serif" }}>
                  {step}
                </div>
                <Icon size={28} className="mx-auto mb-3" style={{ color }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
                <p className="text-sm" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Benefits */}
            <div className="bg-white rounded-2xl p-8 border border-[oklch(0.92_0.005_80)] shadow-sm">
              <h3 className="text-xl font-bold mb-6" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                What You Get
              </h3>
              <ul className="space-y-3 mb-8">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                    <span className="text-sm" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-xl p-4" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={16} fill="#F47920" style={{ color: "#F47920" }} />
                  <span className="text-sm font-bold" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Trusted by 5,000+ families in Bengaluru</span>
                </div>
                <p className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                  Join the EduNest community and help more families find the right tutor.
                </p>
              </div>
            </div>

            {/* Form / Success */}
            {submitted ? (
              <div className="bg-white rounded-2xl p-8 border border-[oklch(0.92_0.005_80)] shadow-sm text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#DCFCE7" }}>
                  <CheckCircle2 size={32} style={{ color: "#16A34A" }} />
                </div>
                <h3 className="text-2xl font-extrabold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                  Referral Submitted!
                </h3>
                <p className="text-sm mb-6" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                  We'll reach out to your friend shortly. Once they join and book a demo class, both of you will receive your ₹200 discount.
                </p>

                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>YOUR REFERRAL CODE</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-extrabold tracking-widest" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                      {referralCode}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: copied ? "#DCFCE7" : "white", border: "1px solid oklch(0.88 0.005 80)" }}
                    >
                      {copied ? <CheckCircle2 size={16} style={{ color: "#16A34A" }} /> : <Copy size={16} style={{ color: "oklch(0.55 0.01 270)" }} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all active:scale-95"
                    style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Share2 size={16} /> Share via WhatsApp
                  </button>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ referrerName: "", referrerEmail: "", referrerPhone: "", refereeName: "", refereeEmail: "", refereePhone: "" }); }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all active:scale-95"
                    style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    Refer Another Friend
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-[oklch(0.92_0.005_80)] shadow-sm">
                <h3 className="text-xl font-bold mb-6" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                  Refer a Friend Now
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Your Details */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Your Details</p>
                    <div className="space-y-3">
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                        <input
                          name="referrerName"
                          value={form.referrerName}
                          onChange={handleChange}
                          placeholder="Your Name *"
                          required
                          className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
                          style={{ borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                        <input
                          name="referrerEmail"
                          value={form.referrerEmail}
                          onChange={handleChange}
                          type="email"
                          placeholder="Your Email *"
                          required
                          className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
                          style={{ borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                        <input
                          name="referrerPhone"
                          value={form.referrerPhone}
                          onChange={handleChange}
                          type="tel"
                          placeholder="Your Phone (optional)"
                          className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
                          style={{ borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Friend's Details */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#6C63FF", fontFamily: "'Poppins', sans-serif" }}>Friend's Details</p>
                    <div className="space-y-3">
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                        <input
                          name="refereeName"
                          value={form.refereeName}
                          onChange={handleChange}
                          placeholder="Friend's Name *"
                          required
                          className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
                          style={{ borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                        <input
                          name="refereeEmail"
                          value={form.refereeEmail}
                          onChange={handleChange}
                          type="email"
                          placeholder="Friend's Email *"
                          required
                          className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
                          style={{ borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                        <input
                          name="refereePhone"
                          value={form.refereePhone}
                          onChange={handleChange}
                          type="tel"
                          placeholder="Friend's Phone (optional)"
                          className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
                          style={{ borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {submitMutation.isPending ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><Gift size={16} /> Submit Referral <ArrowRight size={16} /></>
                    )}
                  </button>

                  <p className="text-xs text-center" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    By submitting, you confirm your friend's consent to be contacted by EduNest.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
