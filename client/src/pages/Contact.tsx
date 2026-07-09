/**
 * EduNest Contact Page
 * Design: Warm Academic Energy
 * Form submissions are saved to the database via tRPC
 */

import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const inputClass =
  "w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 transition-all";
const inputStyle = {
  borderColor: "oklch(0.9 0.005 80)",
  color: "oklch(0.14 0.02 270)",
  fontFamily: "'Nunito', sans-serif",
};
const labelStyle = {
  color: "oklch(0.3 0.02 270)",
  fontFamily: "'Poppins', sans-serif",
};

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "" as "student" | "parent" | "tutor" | "institution" | "",
    subject: "",
    area: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.inquiry.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) {
      toast.error("Please select your role.");
      return;
    }
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      subject: form.subject || undefined,
      area: form.area || undefined,
      message: form.message,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.75 0.16 55) 100%)" }}
      >
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Get In Touch
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Have a question? We're here to help. Reach out and our team will respond within 24 hours.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
            <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="oklch(0.99 0.01 80)" />
          </svg>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 flex-1" style={{ backgroundColor: "oklch(0.99 0.01 80)" }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Left: Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                We'd Love to Hear From You
              </h2>
              <p className="leading-relaxed mb-8" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                Whether you're looking for a tutor, want to join as a tutor, or have any questions about our platform — our friendly team is ready to help.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  { icon: Phone, label: "Phone", value: "+91-8618635627", href: "tel:+918618635627" },
                  { icon: Mail, label: "Email", value: "learn.at.edunest@gmail.com", href: "mailto:learn.at.edunest@gmail.com" },
                  { icon: MapPin, label: "Address", value: "Bengaluru, Karnataka, India 560001", href: "#" },
                  { icon: Clock, label: "Support Hours", value: "Mon–Sat, 9:00 AM – 7:00 PM IST", href: "#" },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "oklch(0.95 0.03 50)" }}>
                      <Icon size={18} style={{ color: "oklch(0.68 0.18 50)" }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>{label}</div>
                      <a href={href} className="text-sm font-medium hover:text-[oklch(0.68_0.18_50)] transition-colors" style={{ color: "oklch(0.2 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                        {value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl p-6 border border-[oklch(0.9_0.005_80)]">
                <h3 className="font-bold mb-4 text-sm" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <Link href="/find-tutor" className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-[oklch(0.96_0.01_80)] group">
                    <span className="text-sm font-medium" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>Find a Tutor</span>
                    <ArrowRight size={16} style={{ color: "oklch(0.68 0.18 50)" }} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/become-tutor" className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-[oklch(0.96_0.01_80)] group">
                    <span className="text-sm font-medium" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>Register as a Tutor</span>
                    <ArrowRight size={16} style={{ color: "oklch(0.68 0.18 50)" }} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href="tel:+918618635627" className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-[oklch(0.96_0.01_80)] group">
                    <span className="text-sm font-medium" style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>Call Us Directly</span>
                    <ArrowRight size={16} style={{ color: "oklch(0.68 0.18 50)" }} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[oklch(0.9_0.005_80)]">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "oklch(0.95 0.03 50)" }}>
                    <CheckCircle2 size={40} style={{ color: "oklch(0.68 0.18 50)" }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                    Message Sent!
                  </h3>
                  <p className="mb-2" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    Thank you, <strong>{form.name}</strong>! We've received your message and will get back to you within 24 hours.
                  </p>
                  <p className="text-sm mb-6" style={{ color: "oklch(0.6 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    For urgent queries, call us at{" "}
                    <a href="tel:+918618635627" className="font-semibold" style={{ color: "oklch(0.68 0.18 50)" }}>+91-8618635627</a>
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/" className="btn-primary">Back to Home</Link>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", role: "", subject: "", area: "", message: "" }); }}
                      className="btn-outline"
                    >
                      Send Another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                    Send Us a Message
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    Fill in the form and we'll respond within 24 hours.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Full Name *</label>
                        <input
                          type="text"
                          placeholder="Your name"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Phone *</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Email Address *</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>I am a... *</label>
                      <select
                        required
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
                        className={`${inputClass} bg-white`}
                        style={inputStyle}
                      >
                        <option value="">Select your role</option>
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                        <option value="tutor">Tutor</option>
                        <option value="institution">Academic Institution</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Subject</label>
                        <input
                          type="text"
                          placeholder="e.g. Mathematics"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Area in Bengaluru</label>
                        <input
                          type="text"
                          placeholder="e.g. Koramangala"
                          value={form.area}
                          onChange={(e) => setForm({ ...form, area: e.target.value })}
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Message *</label>
                      <textarea
                        placeholder="Tell us how we can help you..."
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={`${inputClass} resize-none`}
                        style={inputStyle}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60"
                    >
                      {submitMutation.isPending ? (
                        <><Loader2 size={18} className="animate-spin" /> Sending...</>
                      ) : (
                        <>Send Message <ArrowRight size={18} /></>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
