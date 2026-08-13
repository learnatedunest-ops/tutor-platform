/**
 * EduNest — Student / Parent Profile Setup
 * Post-login page for students/parents to register their tuition requirement.
 * Collects all details matching the Otoo-style requirement format + GPS location.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { startLogin } from "@/const";
import LoginWall from "@/components/LoginWall";
import ParentTermsModal from "@/components/ParentTermsModal";
import PhoneOtpVerifier from "@/components/PhoneOtpVerifier";
import TimeRangePicker from "@/components/TimeRangePicker";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  MapPin, User, Phone, BookOpen, GraduationCap,
  Clock, IndianRupee, CheckCircle2, Loader2, Navigation,
  ChevronRight, ChevronLeft, AlertCircle, Users, Home
} from "lucide-react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun"
};

const GRADES = [
  "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "Undergraduate", "Other"
];

const STEPS = [
  { id: 1, label: "Your Details" },
  { id: 2, label: "Requirement" },
  { id: 3, label: "Schedule" },
  { id: 4, label: "Location" },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: "student" | "parent";
  studentName: string;
  grade: string;
  board: "CBSE" | "ICSE" | "State" | "IB" | "IGCSE" | "Other";
  subjects: string;
  mode: "home_tuition" | "online" | "both";
  demoTime: string;
  regularTime: string;
  daysPerWeek: string[];
  sessionsPerWeek: string;
  sessionDuration: string;
  budget: string;
  specialRequirements: string;
  latitude: number | null;
  longitude: number | null;
  fullAddress: string;
  area: string;
  tutorGenderPreference: "male" | "female" | "no_preference";
}

const INITIAL: FormData = {
  name: "", email: "", phone: "", role: "parent", studentName: "",
  grade: "Class 5", board: "CBSE", subjects: "", mode: "home_tuition",
  demoTime: "", regularTime: "", daysPerWeek: ["mon", "tue", "wed", "thu", "fri"],
  sessionsPerWeek: "5", sessionDuration: "1 hr", budget: "",
  specialRequirements: "", latitude: null, longitude: null, fullAddress: "", area: "",
  tutorGenderPreference: "no_preference",
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
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name ?? "";
          onLocation(latitude, longitude, address);
          setStatus("success");
        } catch {
          onLocation(latitude, longitude, "");
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

export default function StudentSetup() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showParentTerms, setShowParentTerms] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const { data: existingProfile } = trpc.studentProfile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (existingProfile) {
      if (existingProfile.phoneVerified === "yes") setPhoneVerified(true);
      setForm(prev => ({
        ...prev,
        name: existingProfile.name,
        email: existingProfile.email,
        phone: existingProfile.phone,
        role: existingProfile.role,
        studentName: existingProfile.studentName ?? "",
        grade: existingProfile.grade,
        board: existingProfile.board,
        subjects: existingProfile.subjects,
        mode: existingProfile.mode,
        demoTime: existingProfile.demoTime ?? "",
        regularTime: existingProfile.regularTime ?? "",
        daysPerWeek: existingProfile.daysPerWeek ? existingProfile.daysPerWeek.split(",").map(d => d.trim()) : ["mon", "tue", "wed", "thu", "fri"],
        sessionsPerWeek: existingProfile.sessionsPerWeek ?? "5",
        sessionDuration: existingProfile.sessionDuration ?? "1 hr",
        budget: existingProfile.budget ?? "",
        specialRequirements: existingProfile.specialRequirements ?? "",
        latitude: null,
        longitude: null,
        fullAddress: "",
        area: existingProfile.area ?? "",
      }));
    }
  }, [existingProfile]);

  const utils = trpc.useUtils();
  const setRoleMutation = trpc.auth.setRole.useMutation({
    onSuccess: () => { utils.auth.getRole.invalidate(); },
  });
  const saveMutation = trpc.studentProfile.save.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Requirement submitted! We'll match you with a tutor soon.");
      // Ensure userRole is set to 'student' so AuthGate doesn't redirect to /role-select
      if (userRole === null) {
        setRoleMutation.mutate({ userRole: "student" });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit. Please try again.");
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
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms & Conditions before submitting.");
      return;
    }
    if (!form.name || !form.phone || !form.subjects || !form.grade) {
      toast.error("Please fill in all required fields.");
      return;
    }
    saveMutation.mutate({
      ...form,
      daysPerWeek: form.daysPerWeek.join(", "),
      latitude: form.latitude ?? undefined,
      longitude: form.longitude ?? undefined,
      fullAddress: form.latitude !== null && form.longitude !== null ? form.fullAddress || undefined : undefined,
    });
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
      </div>
    );
  }

  // Role gate: if logged in but not a student, redirect to tutor setup
  useEffect(() => {
    if (!roleLoading && isAuthenticated && userRole === "tutor") {
      navigate("/tutor-setup");
    }
  }, [roleLoading, isAuthenticated, userRole, navigate]);

  if (!isAuthenticated) {
    return <LoginWall role="student" />;
  }

  if (submitted || existingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <SEO title="Requirement Submitted — EduNest" description="Your tuition requirement has been submitted." url="https://edunest.courses/student-setup" />
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#DCFCE7" }}>
            <CheckCircle2 size={32} style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Requirement Submitted! 🎉
          </h2>
          <p className="text-gray-500 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Your tuition requirement has been received. The EduNest team will match you with a verified tutor near your location within 24 hours.
          </p>
          {existingProfile && (
            <div className="rounded-xl p-4 mb-6 text-left" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Your Requirement Summary</p>
              <div className="space-y-1 text-sm" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                <p>📚 <strong>Class:</strong> {existingProfile.grade} ({existingProfile.board})</p>
                <p>📖 <strong>Subjects:</strong> {existingProfile.subjects}</p>
                <p>🏠 <strong>Mode:</strong> {existingProfile.mode === "home_tuition" ? "Home Tuition" : existingProfile.mode === "online" ? "Online" : "Both"}</p>
                {existingProfile.regularTime && <p>⏰ <strong>Regular Time:</strong> {existingProfile.regularTime}</p>}
                {existingProfile.daysPerWeek && <p>📅 <strong>Days:</strong> {existingProfile.daysPerWeek}</p>}
                {existingProfile.budget && <p>💸 <strong>Budget:</strong> ₹{existingProfile.budget}/month</p>}
                {existingProfile.hasPrivateLocation && <p>📍 <strong>Location:</strong> Saved privately for nearby matching</p>}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/nearby-tutors")}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
            >
              View Nearby Tutors →
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-3 rounded-xl font-semibold transition-all"
              style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}
            >
              Edit
            </button>
          </div>
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
      <SEO title="Find a Tutor — EduNest" description="Submit your tuition requirement and get matched with a verified tutor near you in Bengaluru." url="https://edunest.courses/student-setup" />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <img src="/api/img/edunest-logo-small_2b84d7c3.png" alt="EduNest" className="w-10 h-10 object-contain" />
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
              Register Your Tuition Requirement
            </h1>
            <p className="text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              Tell us what you need — we'll match you with the best tutor nearby
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

          {/* Step 1: Your Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                <User size={18} className="inline mr-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                Your Details
              </h2>
              <div>
                <label className={labelCls} style={labelStyle}>I am a *</label>
                <div className="flex gap-3">
                  {(["parent", "student"] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set("role", r)}
                      className="flex-1 py-3 rounded-xl font-semibold transition-all capitalize"
                      style={{
                        backgroundColor: form.role === r ? "oklch(0.68 0.18 50)" : "white",
                        color: form.role === r ? "white" : "oklch(0.45 0.01 270)",
                        border: form.role === r ? "none" : "1px solid oklch(0.88 0.005 80)",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {r === "parent" ? "👨‍👩‍👧 Parent" : "🎓 Student"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Your Full Name *</label>
                <input className={inputCls} style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Rajesh Kumar" />
              </div>
              {form.role === "parent" && (
                <div>
                  <label className={labelCls} style={labelStyle}>Student's Name</label>
                  <input className={inputCls} style={inputStyle} value={form.studentName} onChange={e => set("studentName", e.target.value)} placeholder="e.g. Aarav Kumar" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Phone *</label>
                  <input className={inputCls} style={inputStyle} type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 9876543210" />
                  <PhoneOtpVerifier
                    phone={form.phone}
                    profileType="student"
                    onVerified={() => setPhoneVerified(true)}
                    alreadyVerified={phoneVerified}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Email *</label>
                  <input className={inputCls} style={inputStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" />
                </div>
              </div>
              {/* Tutor Gender Preference */}
              <div>
                <label className={labelCls} style={labelStyle}>Preferred Tutor Gender</label>
                <select
                  className={inputCls}
                  style={inputStyle}
                  value={form.tutorGenderPreference}
                  onChange={e => set("tutorGenderPreference", e.target.value as "male" | "female" | "no_preference")}
                >
                  <option value="no_preference">No Preference</option>
                  <option value="male">Male Tutor</option>
                  <option value="female">Female Tutor</option>
                </select>
                <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Select your preferred gender for the tutor teaching your child.</p>
              </div>
            </div>
          )}

          {/* Step 2: Requirement */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                <BookOpen size={18} className="inline mr-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                Tuition Requirement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Class / Grade *</label>
                  <select className={inputCls} style={inputStyle} value={form.grade} onChange={e => set("grade", e.target.value)}>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Board *</label>
                  <select className={inputCls} style={inputStyle} value={form.board} onChange={e => set("board", e.target.value as FormData["board"])}>
                    {["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Subjects Needed *</label>
                <input className={inputCls} style={inputStyle} value={form.subjects} onChange={e => set("subjects", e.target.value)} placeholder="e.g. English, Social Studies, Mathematics, Kannada" />
                <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Separate multiple subjects with commas</p>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Teaching Mode *</label>
                <div className="flex gap-3">
                  {([["home_tuition", "🏠 Home Tuition"], ["online", "💻 Online"], ["both", "🔄 Both"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => set("mode", val)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: form.mode === val ? "oklch(0.68 0.18 50)" : "white",
                        color: form.mode === val ? "white" : "oklch(0.45 0.01 270)",
                        border: form.mode === val ? "none" : "1px solid oklch(0.88 0.005 80)",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Budget (per month)</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.65 0.01 270)" }} />
                  <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2rem" }} type="number" min="0" value={form.budget} onChange={e => set("budget", e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 3000" />
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Special Requirements</label>
                <textarea
                  className={inputCls}
                  style={{ ...inputStyle, resize: "none" }}
                  rows={2}
                  value={form.specialRequirements}
                  onChange={e => set("specialRequirements", e.target.value)}
                  placeholder="Any specific requirements, preferences, or notes for the tutor..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                <Clock size={18} className="inline mr-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                Preferred Schedule
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <TimeRangePicker
                    label="Demo Class Time"
                    value={form.demoTime}
                    onChange={v => set("demoTime", v)}
                    placeholder="e.g. 10:00 AM - 12:00 PM"
                  />
                </div>
                <div>
                  <TimeRangePicker
                    label="Regular Class Time"
                    value={form.regularTime}
                    onChange={v => set("regularTime", v)}
                    placeholder="e.g. 04:30 PM - 05:30 PM"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Sessions per Week</label>
                  <input className={inputCls} style={inputStyle} value={form.sessionsPerWeek} onChange={e => set("sessionsPerWeek", e.target.value)} placeholder="e.g. 5" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Session Duration</label>
                  <input className={inputCls} style={inputStyle} value={form.sessionDuration} onChange={e => set("sessionDuration", e.target.value)} placeholder="e.g. 1 hr" />
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Preferred Days</label>
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
                We use your location to find tutors near you. Your exact address is shared with matched tutors only after you confirm.
              </p>
              <LocationPicker
                onLocation={(lat, lng, address) => {
                  set("latitude", lat);
                  set("longitude", lng);
                  set("fullAddress", address);
                }}
              />
              {form.latitude !== null && form.longitude !== null && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#F0FDF4" }}>
                  <p className="text-sm font-semibold" style={{ color: "#15803D", fontFamily: "'Nunito', sans-serif" }}>
                    Your precise location is saved securely for nearby matching and is visible only to EduNest administrators.
                  </p>
                </div>
              )}
              <div>
                <label className={labelCls} style={labelStyle}>Your Area / Locality</label>
                <input className={inputCls} style={inputStyle} value={form.area} onChange={e => set("area", e.target.value)} placeholder="e.g. Koramangala, Bengaluru" />
              </div>

              {/* T&C Checkbox — step 4 */}
              <ParentTermsModal open={showParentTerms} onClose={() => setShowParentTerms(false)} />
              <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: agreedToTerms ? "#22C55E" : "oklch(0.88 0.005 80)", backgroundColor: agreedToTerms ? "#F0FDF4" : "oklch(0.97 0.005 80)" }}>
                <input
                  type="checkbox"
                  id="student-terms"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer"
                />
                <label htmlFor="student-terms" className="text-sm cursor-pointer" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                  I have read and agree to the{" "}
                  <button type="button" onClick={() => setShowParentTerms(true)} className="font-bold underline" style={{ color: "oklch(0.68 0.18 50)", background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    EduNest Parent Terms &amp; Conditions
                  </button>
                  .
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
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
                  if (step === 1 && (!form.name || !form.phone || !form.email)) {
                    toast.error("Please fill in Name, Phone, and Email.");
                    return;
                  }
                  if (step === 1 && !phoneVerified) {
                    toast.error("Please verify your phone number with OTP before proceeding.");
                    return;
                  }
                  if (step === 2 && (!form.subjects || !form.grade)) {
                    toast.error("Please fill in Grade and Subjects.");
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
                  <><CheckCircle2 size={16} /> Submit Requirement</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
