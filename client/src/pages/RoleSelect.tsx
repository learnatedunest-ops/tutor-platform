/**
 * RoleSelect — shown immediately after first OAuth login when userRole is null.
 * User picks "I am a Tutor" or "I am a Student / Parent".
 * On selection, saves the role via tRPC then redirects to the appropriate setup page.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { GraduationCap, BookOpen, ArrowRight, Loader2 } from "lucide-react";

export default function RoleSelect() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selected, setSelected] = useState<"tutor" | "student" | null>(null);
  const [saving, setSaving] = useState(false);

  const setRoleMutation = trpc.auth.setRole.useMutation({
    onSuccess: (data) => {
      if (data.userRole === "tutor") {
        navigate("/tutor-setup");
      } else {
        navigate("/student-setup");
      }
    },
    onError: () => {
      setSaving(false);
    },
  });

  const handleContinue = () => {
    if (!selected) return;
    setSaving(true);
    setRoleMutation.mutate({ userRole: selected });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.98_0.01_80)]">
        <Loader2 className="animate-spin text-[oklch(0.68_0.18_50)]" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.98_0.01_80)]">
        <div className="text-center">
          <p className="text-[oklch(0.4_0.02_270)] mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Please log in to continue.
          </p>
          <a
            href="/"
            className="text-[oklch(0.68_0.18_50)] font-semibold hover:underline"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "oklch(0.98 0.01 80)" }}
    >
      {/* Logo + Home */}
      <div className="flex items-center justify-between w-full max-w-lg mb-10">
        <div className="flex items-center gap-2">
          <img
            src="/api/img/edunest-logo-small_2b84d7c3.png"
            alt="EduNest"
            className="w-10 h-10 object-contain"
          />
          <span
            className="text-3xl font-extrabold"
            style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)", letterSpacing: "-0.02em" }}
          >
            Edu<span style={{ color: "oklch(0.14 0.02 270)" }}>Nest</span>
          </span>
        </div>
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
          style={{ backgroundColor: "oklch(0.68 0.18 50)", color: "#fff", fontFamily: "'Poppins', sans-serif" }}
        >
          ⌂ Home
        </a>
      </div>

      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <h1
            className="text-2xl md:text-3xl font-bold text-center mb-2"
            style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}
          >
            Welcome to EduNest! 🎉
          </h1>
          <p
            className="text-center text-[oklch(0.5_0.02_270)] mb-8"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Tell us who you are so we can personalise your experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Tutor Card */}
            <button
              onClick={() => setSelected("tutor")}
              className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left ${
                selected === "tutor"
                  ? "border-[oklch(0.68_0.18_50)] bg-[oklch(0.97_0.03_50)] shadow-md"
                  : "border-[oklch(0.9_0.005_80)] bg-white hover:border-[oklch(0.8_0.08_50)] hover:bg-[oklch(0.99_0.01_80)]"
              }`}
            >
              {selected === "tutor" && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[oklch(0.68_0.18_50)] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.95 0.05 50)" }}
              >
                <GraduationCap size={32} style={{ color: "oklch(0.68 0.18 50)" }} />
              </div>
              <div>
                <p
                  className="font-bold text-lg text-center"
                  style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}
                >
                  I am a Tutor
                </p>
                <p
                  className="text-sm text-center mt-1"
                  style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.02 270)" }}
                >
                  Teach students near you, set your schedule and earn
                </p>
              </div>
            </button>

            {/* Student / Parent Card */}
            <button
              onClick={() => setSelected("student")}
              className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left ${
                selected === "student"
                  ? "border-[oklch(0.68_0.18_50)] bg-[oklch(0.97_0.03_50)] shadow-md"
                  : "border-[oklch(0.9_0.005_80)] bg-white hover:border-[oklch(0.8_0.08_50)] hover:bg-[oklch(0.99_0.01_80)]"
              }`}
            >
              {selected === "student" && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[oklch(0.68_0.18_50)] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.95 0.05 50)" }}
              >
                <BookOpen size={32} style={{ color: "oklch(0.68 0.18 50)" }} />
              </div>
              <div>
                <p
                  className="font-bold text-lg text-center"
                  style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}
                >
                  I am a Student / Parent
                </p>
                <p
                  className="text-sm text-center mt-1"
                  style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.02 270)" }}
                >
                  Find the best tutors near your home for your child
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: selected ? "oklch(0.68 0.18 50)" : "oklch(0.8 0.05 80)",
            }}
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /> Setting up your account…</>
            ) : (
              <>Continue <ArrowRight size={18} /></>
            )}
          </button>

          <p
            className="text-center text-xs mt-4"
            style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.6 0.02 270)" }}
          >
            You can only set this once. Choose carefully!
          </p>
        </div>
      </div>
    </div>
  );
}
