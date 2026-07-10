/**
 * LoginWall — Full-page login/signup prompt shown when a user tries to access
 * a protected page without being logged in.
 * Supports an optional `role` prop to pre-select tutor or student after login.
 */

import { GraduationCap, BookOpen, ArrowRight, Shield, Star, Users } from "lucide-react";
import { startLogin } from "@/const";

interface LoginWallProps {
  role?: "tutor" | "student";
  title?: string;
  subtitle?: string;
}

const TUTOR_BENEFITS = [
  "Get matched with students near your location",
  "Set your own schedule and fee structure",
  "Receive demo class requests directly",
  "Verified profile visible to 5,000+ parents",
];

const STUDENT_BENEFITS = [
  "Find verified tutors within 5 km of your home",
  "Free demo class before you commit",
  "CBSE, ICSE, IB, and State board covered",
  "Transparent fee structure — no hidden charges",
];

export default function LoginWall({ role, title, subtitle }: LoginWallProps) {
  const isTutor = role === "tutor";
  const benefits = isTutor ? TUTOR_BENEFITS : STUDENT_BENEFITS;
  const Icon = isTutor ? GraduationCap : BookOpen;

  const defaultTitle = isTutor
    ? "Join EduNest as a Tutor"
    : "Find the Perfect Tutor Near You";

  const defaultSubtitle = isTutor
    ? "Create your free account to start receiving student leads near your location."
    : "Sign up free to submit your requirement and get matched with a verified tutor.";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "oklch(0.98 0.01 80)" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-md"
            style={{ background: "oklch(0.68 0.18 50)" }}
          >
            <Icon size={40} color="white" />
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}
          >
            {title ?? defaultTitle}
          </h1>
          <p
            className="text-lg max-w-md mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.02 270)" }}
          >
            {subtitle ?? defaultSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Benefits strip */}
          <div
            className="px-8 py-6"
            style={{ background: "oklch(0.97 0.03 50)" }}
          >
            <p
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)" }}
            >
              What you get
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "oklch(0.68 0.18 50)" }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span
                    className="text-sm"
                    style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.3 0.02 270)" }}
                  >
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-8 py-8">
            <button
              onClick={() => startLogin()}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md"
              style={{
                background: "oklch(0.68 0.18 50)",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <span>Sign Up / Log In — It's Free</span>
              <ArrowRight size={20} />
            </button>

            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-1.5">
                <Shield size={14} style={{ color: "oklch(0.5 0.02 270)" }} />
                <span className="text-xs" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.02 270)" }}>
                  Secure login
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={14} style={{ color: "oklch(0.5 0.02 270)" }} />
                <span className="text-xs" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.02 270)" }}>
                  4.6/5 rated platform
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} style={{ color: "oklch(0.5 0.02 270)" }} />
                <span className="text-xs" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.02 270)" }}>
                  5,000+ families
                </span>
              </div>
            </div>

            <p
              className="text-center text-xs mt-4"
              style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.65 0.02 270)" }}
            >
              Already have an account? Logging in will take you straight to your dashboard.
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <a
            href="/"
            className="text-sm font-medium hover:underline"
            style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.02 270)" }}
          >
            ← Back to Home
          </a>
        </p>
      </div>
    </div>
  );
}
