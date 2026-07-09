/**
 * EduNest About Page
 * Design: Warm Academic Energy
 */

import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";

const team = [
  { name: "Amogha", role: "Founder & CEO", initials: "AM", color: "#F47920" },
  { name: "Meera Singh", role: "Head of Tutors", initials: "MS", color: "#6C63FF" },
  { name: "Rohit Sharma", role: "CTO", initials: "RS", color: "#F47920" },
  { name: "Kavita Joshi", role: "Head of Operations", initials: "KJ", color: "#6C63FF" },
];

const values = [
  { icon: Target, title: "Our Mission", desc: "To make quality education accessible to every student in India by connecting them with the best tutors at affordable prices." },
  { icon: Eye, title: "Our Vision", desc: "A world where every child has access to a dedicated mentor who helps them reach their full academic potential." },
  { icon: Heart, title: "Our Values", desc: "We believe in trust, transparency, and transformative education. Every interaction on our platform is guided by these principles." },
];

export default function About() {
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
            About EduNest
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            We're on a mission to make quality education accessible to every student in Bengaluru. EduNest connects students with the best local tutors for personalized, results-driven learning.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
            <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="oklch(0.99 0.01 80)" />
          </svg>
        </div>
      </section>

      {/* Story */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.99 0.01 80)" }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Our Story</p>
              <h2 className="section-title mb-6">From a Small Idea to 5,000+ Students</h2>
              <p className="leading-relaxed mb-4" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                EduNest was born out of a simple frustration: finding a good home tutor in Bengaluru was unnecessarily hard. Parents spent weeks asking around, and qualified tutors had no easy way to reach students who needed them.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                We built EduNest to solve this — a platform where Bengaluru students and tutors can connect instantly, with full transparency on qualifications, pricing, and reviews.
              </p>
              <p className="leading-relaxed mb-8" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                Today, we serve over 5,000 students across 15+ areas in Bengaluru, with 200+ verified tutors covering every subject from pre-primary to competitive exams.
              </p>
              <Link href="/find-tutor" className="btn-primary">
                Find a Tutor <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "5,000+", label: "Students Served" },
                { num: "200+", label: "Expert Tutors" },
                { num: "15+", label: "Areas in Bengaluru" },
                { num: "4.9★", label: "Average Rating" },
              ].map(({ num, label }) => (
                <div key={label} className="card-hover bg-white rounded-2xl p-6 text-center border border-[oklch(0.9_0.005_80)]">
                  <div className="text-3xl font-extrabold mb-1" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>{num}</div>
                  <div className="text-xs font-medium" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.96 0.01 80)" }}>
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover bg-white rounded-2xl p-8 border border-[oklch(0.9_0.005_80)]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: "oklch(0.95 0.03 50)" }}>
                  <Icon size={26} style={{ color: "oklch(0.68 0.18 50)" }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20" style={{ backgroundColor: "oklch(0.99 0.01 80)" }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>The People</p>
            <h2 className="section-title orange-underline mb-4">Meet Our Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map(({ name, role, initials, color }) => (
              <div key={name} className="card-hover bg-white rounded-2xl p-6 text-center border border-[oklch(0.9_0.005_80)]">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                  style={{ backgroundColor: color, fontFamily: "'Poppins', sans-serif" }}
                >
                  {initials}
                </div>
                <h4 className="font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{name}</h4>
                <p className="text-xs" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.75 0.16 55) 100%)" }}
      >
        <div className="container text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Whether you're a student, parent, or tutor — there's a place for you at EduNest.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/find-tutor" className="btn-white">Find a Tutor <ArrowRight size={16} /></Link>
            <Link href="/become-tutor" className="btn-outline" style={{ borderColor: "white", color: "white" }}>Become a Tutor</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
