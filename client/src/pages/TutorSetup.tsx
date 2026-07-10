/**
 * EduNest — Tutor Profile Setup
 * Post-login page for tutors to complete their profile.
 * Collects all mandatory details + GPS location.
 * Profile is submitted for admin approval before going live.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { startLogin } from "@/const";
import LoginWall from "@/components/LoginWall";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  MapPin, User, Phone, Mail, BookOpen, GraduationCap,
  Clock, IndianRupee, CheckCircle2, Loader2, Navigation,
  ChevronRight, ChevronLeft, AlertCircle, Home
} from "lucide-react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun"
};

const STEPS = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Teaching Details" },
  { id: 3, label: "Schedule & Fees" },
  { id: 4, label: "Location" },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  subjects: string;
  experience: string;
  boards: string;
  languages: string;
  mode: "home_tuition" | "online" | "both";
  bio: string;
  demoTime: string;
  regularTime: string;
  sessionDuration: string;
  daysPerWeek: string[];
  firstMonthFee: string;
  nextMonthFee: string;
  latitude: number | null;
  longitude: number | null;
  fullAddress: string;
  area: string;
}

const INITIAL: FormData = {
  name: "", email: "", phone: "", qualification: "", subjects: "",
  experience: "", boards: "CBSE, ICSE", languages: "English, Kannada",
  mode: "both", bio: "", demoTime: "", regularTime: "",
  sessionDuration: "1 hr/day", daysPerWeek: ["mon", "tue", "wed", "thu", "fri"],
  firstMonthFee: "", nextMonthFee: "", latitude: null, longitude: null,
  fullAddress: "", area: "",
};

function LocationPicker({ onLocation }: { onLocation: (lat: number, lng: number, address: string) => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using a free API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          onLocation(latitude, longitude, address);
          setStatus("success");
        } catch {
          onLocation(latitude, longitude, `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          setStatus("success");
        }
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === 1
            ? "Location access denied. Please allow location access in your browser settings."
            : "Unable to get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      {status === "idle" && (
        <button
          type="button"
          onClick={getLocation}
          className="flex items-center gap-3 w-full px-5 py-4 rounded-xl border-2 border-dashed font-semibold transition-all hover:border-orange-400 hover:bg-orange-50 active:scale-95"
          style={{ borderColor: "oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
        >
          <Navigation size={20} style={{ color: "oklch(0.68 0.18 50)" }} />
          <span>Tap to get my current location</span>
        </button>
      )}
      {status === "loading" && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl border" style={{ borderColor: "oklch(0.88 0.005 80)", backgroundColor: "oklch(0.97 0.03 50)" }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
          <span className="text-sm" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Getting your location...</span>
        </div>
      )}
      {status === "success" && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl border" style={{ borderColor: "#22C55E", backgroundColor: "#F0FDF4" }}>
          <CheckCircle2 size={20} style={{ color: "#16A34A" }} />
          <span className="text-sm font-semibold" style={{ color: "#15803D", fontFamily: "'Nunito', sans-serif" }}>Location captured successfully!</span>
          <button type="button" onClick={() => setStatus("idle")} className="ml-auto text-xs underline" style={{ color: "#16A34A" }}>Change</button>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
            <p className="text-sm" style={{ color: "#DC2626", fontFamily: "'Nunito', sans-serif" }}>{errorMsg}</p>
          </div>
          <button type="button" onClick={getLocation} className="text-sm underline" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Nunito', sans-serif" }}>Try again</button>
        </div>
      )}
    </div>
  );
}

export default function TutorSetup() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Pre-fill name and email from OAuth
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Check if already has profile
  const { data: existingProfile } = trpc.tutorProfile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (existingProfile) {
      // Pre-fill form with existing data
      setForm(prev => ({
        ...prev,
        name: existingProfile.name,
        email: existingProfile.email,
        phone: existingProfile.phone,
        qualification: existingProfile.qualification,
        subjects: existingProfile.subjects,
        experience: existingProfile.experience,
        boards: existingProfile.boards ?? "CBSE, ICSE",
        languages: existingProfile.languages ?? "English, Kannada",
        mode: existingProfile.mode,
        bio: existingProfile.bio ?? "",
        demoTime: existingProfile.demoTime ?? "",
        regularTime: existingProfile.regularTime ?? "",
        sessionDuration: existingProfile.sessionDuration ?? "1 hr/day",
        daysPerWeek: existingProfile.daysPerWeek ? existingProfile.daysPerWeek.split(",").map(d => d.trim()) : ["mon", "tue", "wed", "thu", "fri"],
        firstMonthFee: existingProfile.firstMonthFee ?? "",
        nextMonthFee: existingProfile.nextMonthFee ?? "",
        latitude: existingProfile.latitude ? parseFloat(existingProfile.latitude) : null,
        longitude: existingProfile.longitude ? parseFloat(existingProfile.longitude) : null,
        fullAddress: existingProfile.fullAddress ?? "",
        area: existingProfile.area ?? "",
      }));
    }
  }, [existingProfile]);

  const saveMutation = trpc.tutorProfile.save.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Profile submitted for review!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save profile. Please try again.");
    },
  });

  const set = (key: keyof FormData, value: string | number | null | string[]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      daysPerWeek: prev.daysPerWeek.includes(day)
        ? prev.daysPerWeek.filter(d => d !== day)
        : [...prev.daysPerWeek, day],
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.qualification || !form.subjects || !form.experience) {
      toast.error("Please fill in all required fields.");
      return;
    }
    saveMutation.mutate({
      ...form,
      daysPerWeek: form.daysPerWeek.join(", "),
      latitude: form.latitude ?? undefined,
      longitude: form.longitude ?? undefined,
    });
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
      </div>
    );
  }

  // Role gate: if logged in but not a tutor, redirect to student setup
  useEffect(() => {
    if (!roleLoading && isAuthenticated && userRole === "student") {
      navigate("/student-setup");
    }
  }, [roleLoading, isAuthenticated, userRole, navigate]);

  if (!isAuthenticated) {
    return <LoginWall role="tutor" />;
  }

  if (!editMode && (submitted || existingProfile?.status === "pending" || existingProfile?.status === "approved")) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <SEO title="Tutor Profile — EduNest" description="Complete your tutor profile on EduNest" url="https://edu-nest.manus.space/tutor-setup" />
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full text-center">
          {existingProfile?.status === "approved" ? (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#DCFCE7" }}>
                <CheckCircle2 size={32} style={{ color: "#16A34A" }} />
              </div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                Profile Approved! 🎉
              </h2>
              <p className="text-gray-500 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Your tutor profile is live. You can view nearby student requirements from your dashboard.
              </p>
              <button
                onClick={() => navigate("/tutor-dashboard")}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 mb-3"
                style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
              >
                Go to My Dashboard →
              </button>
              <button
                onClick={() => { setEditMode(true); setSubmitted(false); }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
              >
                ✏️ Edit My Profile
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
                <Clock size={32} style={{ color: "oklch(0.68 0.18 50)" }} />
              </div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                Profile Under Review
              </h2>
              <p className="text-gray-500 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Your profile has been submitted and is being reviewed by the EduNest team. You'll be notified once it's approved.
              </p>
              <p className="text-sm mb-4" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Nunito', sans-serif" }}>
                Typical review time: within 24 hours.
              </p>
              <button
                onClick={() => { setEditMode(true); setSubmitted(false); }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
              >
                ✏️ Edit My Profile
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[oklch(0.68_0.18_50)] focus:border-[oklch(0.68_0.18_50)]";
  const inputStyle = { borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif", color: "oklch(0.14 0.02 270)" };
  const labelCls = "block text-xs font-bold uppercase tracking-wider mb-1.5";
  const labelStyle = { color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
      <SEO title="Tutor Profile Setup — EduNest" description="Complete your tutor profile on EduNest to start receiving student leads in Bengaluru." url="https://edu-nest.manus.space/tutor-setup" />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <img src="/manus-storage/edunest-logo-v3_f012b9fe.png" alt="EduNest" className="w-10 h-10 object-contain" />
            <Link href="/">
              <button
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
                style={{ backgroundColor: "oklch(0.68 0.18 50)", color: "#fff", fontFamily: "'Poppins', sans-serif" }}
              >
                <Home size={13} /> Home
              </button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
              Complete Your Tutor Profile
            </h1>
            <p className="text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              Fill in your details to start receiving nearby student leads
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    backgroundColor: step >= s.id ? "oklch(0.68 0.18 50)" : "white",
                    color: step >= s.id ? "white" : "oklch(0.65 0.01 270)",
                    border: step >= s.id ? "none" : "2px solid oklch(0.88 0.005 80)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {step > s.id ? "✓" : s.id}
                </div>
                <span className="text-xs mt-1 hidden sm:block" style={{ color: step >= s.id ? "oklch(0.68 0.18 50)" : "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: step > s.id ? "oklch(0.68 0.18 50)" : "oklch(0.88 0.005 80)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8" style={{ borderColor: "oklch(0.92 0.005 80)" }}>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                <User size={18} className="inline mr-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                Personal Information
              </h2>
              <div>
                <label className={labelCls} style={labelStyle}>Full Name *</label>
                <input className={inputCls} style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Email *</label>
                  <input className={inputCls} style={inputStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Phone *</label>
                  <input className={inputCls} style={inputStyle} type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 9876543210" />
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Qualification *</label>
                <input className={inputCls} style={inputStyle} value={form.qualification} onChange={e => set("qualification", e.target.value)} placeholder="e.g. B.Tech IIT Bombay, M.Sc Mathematics" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>About Yourself</label>
                <textarea
                  className={inputCls}
                  style={{ ...inputStyle, resize: "none" }}
                  rows={3}
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder="Brief introduction about your teaching style and background..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Teaching Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                <BookOpen size={18} className="inline mr-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                Teaching Details
              </h2>
              <div>
                <label className={labelCls} style={labelStyle}>Subjects You Teach *</label>
                <input className={inputCls} style={inputStyle} value={form.subjects} onChange={e => set("subjects", e.target.value)} placeholder="e.g. Mathematics, Physics, Chemistry" />
                <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Separate multiple subjects with commas</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Experience *</label>
                  <input className={inputCls} style={inputStyle} value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="e.g. 5 years" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Teaching Mode *</label>
                  <select className={inputCls} style={inputStyle} value={form.mode} onChange={e => set("mode", e.target.value as FormData["mode"])}>
                    <option value="home_tuition">Home Tuition (visit student)</option>
                    <option value="online">Online Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Boards</label>
                  <input className={inputCls} style={inputStyle} value={form.boards} onChange={e => set("boards", e.target.value)} placeholder="e.g. CBSE, ICSE, State" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Languages</label>
                  <input className={inputCls} style={inputStyle} value={form.languages} onChange={e => set("languages", e.target.value)} placeholder="e.g. English, Kannada, Hindi" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule & Fees */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                <Clock size={18} className="inline mr-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                Schedule & Fees
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Demo Class Time</label>
                  <input className={inputCls} style={inputStyle} value={form.demoTime} onChange={e => set("demoTime", e.target.value)} placeholder="e.g. 10:00 AM - 12:00 PM" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Regular Class Time</label>
                  <input className={inputCls} style={inputStyle} value={form.regularTime} onChange={e => set("regularTime", e.target.value)} placeholder="e.g. 04:30 PM - 05:30 PM" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Session Duration</label>
                  <input className={inputCls} style={inputStyle} value={form.sessionDuration} onChange={e => set("sessionDuration", e.target.value)} placeholder="e.g. 1 hr/day" />
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Available Days</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: form.daysPerWeek.includes(day) ? "oklch(0.68 0.18 50)" : "white",
                        color: form.daysPerWeek.includes(day) ? "white" : "oklch(0.45 0.01 270)",
                        border: form.daysPerWeek.includes(day) ? "none" : "1px solid oklch(0.88 0.005 80)",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>First Month Fee (₹)</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                    <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2rem" }} value={form.firstMonthFee} onChange={e => set("firstMonthFee", e.target.value)} placeholder="e.g. 2700" />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Next Month Fee (₹)</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                    <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2rem" }} value={form.nextMonthFee} onChange={e => set("nextMonthFee", e.target.value)} placeholder="e.g. 4500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                <MapPin size={18} className="inline mr-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                Your Location
              </h2>
              <p className="text-sm" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                We use your location to show you nearby student requirements. Your exact address is never shown to students — only your general area.
              </p>
              <LocationPicker
                onLocation={(lat, lng, address) => {
                  set("latitude", lat);
                  set("longitude", lng);
                  set("fullAddress", address);
                }}
              />
              {form.fullAddress && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>DETECTED ADDRESS</p>
                  <p className="text-sm" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{form.fullAddress}</p>
                </div>
              )}
              <div>
                <label className={labelCls} style={labelStyle}>Your Area / Locality</label>
                <input className={inputCls} style={inputStyle} value={form.area} onChange={e => set("area", e.target.value)} placeholder="e.g. Koramangala, Bengaluru" />
                <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>This is shown to students when they search for tutors nearby.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!form.name || !form.phone || !form.qualification)) {
                    toast.error("Please fill in Name, Phone, and Qualification.");
                    return;
                  }
                  if (step === 2 && (!form.subjects || !form.experience)) {
                    toast.error("Please fill in Subjects and Experience.");
                    return;
                  }
                  setStep(s => s + 1);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
                style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
              >
                {saveMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle2 size={16} /> Submit Profile for Review</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
