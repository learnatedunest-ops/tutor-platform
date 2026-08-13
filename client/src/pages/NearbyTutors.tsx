/**
 * EduNest — Nearby Tutors
 * For logged-in students/parents: shows approved tutors sorted by distance.
 * Uses browser geolocation. Requires student profile to be set up first.
 * Includes full-profile modal with education, work experience, and Book Demo button.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { startLogin } from "@/const";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, BookOpen, Clock, GraduationCap,
  Loader2, Navigation, AlertCircle, RefreshCw, Users,
  CheckCircle2, Star, Calendar, Home, Send, Briefcase,
  Phone, Globe, X, ChevronRight
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TutorRow = {
  id: number;
  name: string;
  phone: string;
  qualification: string;
  subjects: string;
  experience: string;
  mode: string;
  boards: string | null;
  languages: string | null;
  bio: string | null;
  area: string | null;
  education: string | null;
  workExperience: string | null;
  phoneVerified?: string | null;
  distKm: number | string;
};

// ─── Book Demo Button ─────────────────────────────────────────────────────────
function BookDemoButton({ tutorProfileId }: { tutorProfileId: number }) {
  const utils = trpc.useUtils();
  const { data: existingInterest, isLoading: statusLoading } =
    trpc.studentDemoInterest.getStatusForTutor.useQuery({ tutorProfileId });

  const bookMutation = trpc.studentDemoInterest.bookDemo.useMutation({
    onSuccess: () => {
      utils.studentDemoInterest.getStatusForTutor.invalidate({ tutorProfileId });
      toast.success("Demo class request sent! EduNest will contact you to confirm the time.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send request. Please try again.");
    },
  });

  if (statusLoading) {
    return (
      <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm opacity-60" style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
        <Loader2 size={14} className="animate-spin" /> Checking...
      </button>
    );
  }

  if (existingInterest) {
    if (existingInterest.status === 'confirmed') {
      return (
        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: "oklch(0.96 0.04 145)", color: "oklch(0.45 0.14 145)", fontFamily: "'Poppins', sans-serif" }}>
            <CheckCircle2 size={14} /> Demo Scheduled!
          </div>
          <Link
            href="/parent-dashboard"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80 active:scale-95"
            style={{ borderColor: "oklch(0.68 0.18 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            📅 Schedule Demo → Go to Dashboard
          </Link>
        </div>
      );
    }
    const statusConfig = {
      pending: { label: "Request Sent — Awaiting Confirmation", bg: "oklch(0.96 0.04 85)", color: "oklch(0.55 0.12 60)", icon: Send },
      cancelled: { label: "Request Cancelled", bg: "oklch(0.96 0.01 0)", color: "oklch(0.55 0.10 20)", icon: AlertCircle },
    };
    const cfg = statusConfig[existingInterest.status as keyof typeof statusConfig] ?? statusConfig.pending;
    const Icon = cfg.icon;
    return (
      <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: cfg.bg, color: cfg.color, fontFamily: "'Poppins', sans-serif" }}>
        <Icon size={14} /> {cfg.label}
      </div>
    );
  }

  return (
    <button
      onClick={() => bookMutation.mutate({ tutorProfileId })}
      disabled={bookMutation.isPending}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
      style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
    >
      {bookMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
      {bookMutation.isPending ? "Sending Request..." : "Book Free Demo Class"}
    </button>
  );
}

// ─── Mode Label ───────────────────────────────────────────────────────────────
function ModeLabel({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    home_tuition: "Home Tuition",
    online: "Online",
    both: "Both (Home & Online)",
  };
  return <span>{map[mode] ?? mode}</span>;
}

// ─── Full Profile Modal ───────────────────────────────────────────────────────
function TutorProfileModal({
  tutor,
  open,
  onClose,
}: {
  tutor: TutorRow | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!tutor) return null;

  const initials = tutor.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-2xl" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {/* Header band */}
        <div className="px-6 pt-6 pb-4" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.60 0.20 45) 100%)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "#fff", fontFamily: "'Poppins', sans-serif" }}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {tutor.name}
                </h2>
                <p className="text-sm text-white/80">{tutor.qualification}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-white/70" />
                  <span className="text-xs text-white/80">{tutor.area ?? "Bengaluru"} · {tutor.distKm} km away</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors mt-0.5"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
              <ModeLabel mode={tutor.mode} />
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
              {tutor.experience}
            </span>
            {tutor.boards && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
                {tutor.boards}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 space-y-5">

            {/* Subjects */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                Subjects
              </p>
              <p className="text-sm text-gray-700">{tutor.subjects}</p>
            </div>

            {/* Languages */}
            {tutor.languages && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                  Languages
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.languages.split(",").map((l) => (
                    <span key={l.trim()} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {l.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {tutor.bio && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                  About
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{tutor.bio}</p>
              </div>
            )}

            {/* Education */}
            {tutor.education && (
              <div className="rounded-xl p-4" style={{ backgroundColor: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.92 0.005 80)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={15} style={{ color: "oklch(0.68 0.18 50)" }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                    Education
                  </p>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {tutor.education}
                </pre>
              </div>
            )}



            {/* Contact hint */}
            <div className="rounded-xl p-3 text-xs text-center" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
              Express your interest below — EduNest will review and facilitate a free demo class.
            </div>

            {/* Book Demo CTA */}
            <BookDemoButton tutorProfileId={tutor.id} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NearbyTutors() {
  const [, navigate] = useLocation();
  const { loading, isAuthenticated } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(30);
  const [selectedTutor, setSelectedTutor] = useState<TutorRow | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [localityFilter, setLocalityFilter] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "home_tuition" | "online" | "both">("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [sortBy, setSortBy] = useState<"best_match" | "distance" | "experience">("best_match");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("edunest-parent-tutor-search-filters") ?? "{}");
      setSubjectFilter(saved.subjectFilter ?? "");
      setLocalityFilter(saved.localityFilter ?? "");
      setModeFilter(saved.modeFilter ?? "all");
      setGenderFilter(saved.genderFilter ?? "all");
      setSortBy(saved.sortBy ?? "best_match");
    } catch {
      // Saved filters are optional; start with a clean search if browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("edunest-parent-tutor-search-filters", JSON.stringify({ subjectFilter, localityFilter, modeFilter, genderFilter, sortBy }));
    } catch {
      // Search works normally when storage is unavailable.
    }
  }, [subjectFilter, localityFilter, modeFilter, genderFilter, sortBy]);

  // Check if student has a profile
  const { data: myProfile, isLoading: profileLoading } = trpc.studentProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Get nearby tutors
  const { data: nearbyTutors, isLoading: tutorsLoading, refetch } =
    trpc.studentProfile.getNearbyTutors.useQuery(
      { latitude: location?.lat ?? 0, longitude: location?.lng ?? 0, radiusKm },
      { enabled: !!location }
    );

  // Get active tutor IDs (tutors already in active class with this parent — hide from browsing)
  const { data: activeTutorIds, refetch: refetchActiveTutors } = trpc.confirmedMatch.getActiveTutorIds.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const activeTutorIdSet = new Set<number>(activeTutorIds ?? []);

  // Get confirmed matches for the student (to show active class cards with cancel option)
  const { data: myConfirmedMatches, refetch: refetchMatches } = trpc.confirmedMatch.getMineForStudent.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const activeMatches = (myConfirmedMatches ?? []).filter((m: any) => m.classStatus !== 'cancelled');

  // Cancel class state
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [cancelNote, setCancelNote] = useState("");

  const requestCancellation = trpc.confirmedMatch.requestCancellation.useMutation({
    onSuccess: () => {
      toast.success("Cancellation request submitted. EduNest will review and process it.");
      setCancelConfirmId(null);
      setCancelNote("");
      refetchMatches();
      refetchActiveTutors();
    },
    onError: (err) => toast.error(err.message || "Failed to submit cancellation request."),
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocLoading(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        setLocError(
          err.code === 1
            ? "Location access denied. Please allow location access in your browser settings."
            : "Unable to get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Role gate: only students can access this page
  useEffect(() => {
    if (!roleLoading && isAuthenticated && userRole === "tutor") {
      navigate("/tutor-dashboard");
    }
  }, [roleLoading, isAuthenticated, userRole, navigate]);

  if (loading || profileLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <Users size={48} className="mx-auto mb-4" style={{ color: "oklch(0.68 0.18 50)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Login to Find Tutors
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Please log in to find verified tutors near you.
          </p>
          <button
            onClick={() => startLogin()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <BookOpen size={48} className="mx-auto mb-4" style={{ color: "oklch(0.68 0.18 50)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Register Your Requirement First
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Please complete your tuition requirement form so we can match you with the right tutor.
          </p>
          <button
            onClick={() => navigate("/student-setup")}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            Register Requirement →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
      <SEO title="Tutors Near Me — EduNest" description="Find verified tutors near you on EduNest." url="https://edunest.courses/nearby-tutors" />

      {/* Full Profile Modal */}
      <TutorProfileModal
        tutor={selectedTutor}
        open={!!selectedTutor}
        onClose={() => setSelectedTutor(null)}
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/api/img/edunest-logo-small_2b84d7c3.png" alt="EduNest" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>Tutors Near Me</p>
              <p className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                {myProfile.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/student-setup")}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
            >
              My Requirement
            </button>
            <button
              onClick={() => navigate("/portal")}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
            >
              My Portal
            </button>
            <Link href="/">
              <button
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
                style={{ backgroundColor: "oklch(0.68 0.18 50)", color: "#fff", fontFamily: "'Poppins', sans-serif" }}
              >
                <Home size={13} /> Home
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Requirement Summary */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-5" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Your Requirement</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
              <GraduationCap size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
              <span>{myProfile.grade} · {myProfile.board}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
              <BookOpen size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
              <span>{myProfile.subjects}</span>
            </div>
            {myProfile.area && (
              <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
                <MapPin size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
                <span>{myProfile.area}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Controls */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-base mb-0.5" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                Verified Tutors Near You
              </h2>
              <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
                {location ? `Showing within ${radiusKm} km of your current location` : "Share your location to find nearby tutors"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {location && (
                <>
                  <select
                    value={radiusKm}
                    onChange={e => setRadiusKm(Number(e.target.value))}
                    className="text-sm px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: "oklch(0.88 0.005 80)", fontFamily: "'Nunito', sans-serif" }}
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={15}>15 km</option>
                    <option value={20}>20 km</option>
                    <option value={25}>25 km</option>
                    <option value={30}>30 km</option>
                  </select>
                  <button
                    onClick={() => refetch()}
                    className="p-2 rounded-lg border transition-all hover:bg-gray-50"
                    style={{ borderColor: "oklch(0.88 0.005 80)" }}
                    title="Refresh"
                  >
                    <RefreshCw size={16} style={{ color: "oklch(0.65 0.01 270)" }} />
                  </button>
                </>
              )}
              {!location && (
                <button
                  onClick={getLocation}
                  disabled={locLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                  style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                >
                  {locLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                  {locLoading ? "Getting location..." : "Share My Location"}
                </button>
              )}
            </div>
          </div>
          {locError && (
            <div className="flex items-start gap-2 mt-3 p-3 rounded-xl" style={{ backgroundColor: "#FEF2F2" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
              <p className="text-xs" style={{ color: "#DC2626" }}>{locError}</p>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 mt-3">
              <CheckCircle2 size={14} style={{ color: "#16A34A" }} />
              <p className="text-xs" style={{ color: "#15803D" }}>
                Location active — used privately to find tutors near you
              </p>
              <button onClick={getLocation} className="text-xs underline ml-1" style={{ color: "oklch(0.68 0.18 50)" }}>Update</button>
            </div>
          )}
        </div>

        {/* Tutor Cards */}
        {!location && (
          <div className="text-center py-16">
            <Navigation size={48} className="mx-auto mb-4 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="text-base font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>
              Share your location to find nearby tutors
            </p>
            <p className="text-sm" style={{ color: "oklch(0.65 0.01 270)" }}>
              Click "Share My Location" above to find verified tutors near you
            </p>
          </div>
        )}

        {location && tutorsLoading && (
          <div className="text-center py-16">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="text-sm" style={{ color: "oklch(0.65 0.01 270)" }}>Finding tutors near you...</p>
          </div>
        )}

        {location && !tutorsLoading && nearbyTutors && nearbyTutors.length === 0 && (
          <div className="text-center py-16">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="text-base font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>
              No tutors found within {radiusKm} km
            </p>
            <p className="text-sm mb-4" style={{ color: "oklch(0.65 0.01 270)" }}>
              Try increasing the search radius or contact us directly
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setRadiusKm(r => Math.min(r + 5, 30))}
                className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
              >
                Expand to {Math.min(radiusKm + 5, 30)} km
              </button>
              <a
                href="tel:+918618635627"
                className="px-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}
              >
                Call Us
              </a>
            </div>
          </div>
        )}

        {/* Active Class Cards — shown above the tutor list */}
        {activeMatches.length > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Your Active Classes</p>
            {activeMatches.map((match: any) => {
              const isCancellationRequested = match.classStatus === 'cancellation_requested';
              const isCancelled = match.classStatus === 'cancelled';
              return (
                <div key={match.id} className="bg-white rounded-2xl shadow-sm border p-5" style={{ borderColor: isCancellationRequested ? "#f59e0b" : isCancelled ? "#ef4444" : "oklch(0.88 0.02 50)" }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{match.tutorName}</span>
                        {isCancellationRequested ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⏳ Cancellation Under Review</span>
                        ) : isCancelled ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">🚫 Class Stopped</span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅ Active Class</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{match.tutorSubjects ?? match.tutorQualification ?? ''} • Since {match.matchedAt ? new Date(match.matchedAt).toLocaleDateString() : ''}</p>
                    </div>
                    {!isCancellationRequested && !isCancelled && (
                      cancelConfirmId === match.id ? (
                        <div className="flex flex-col gap-2 w-full mt-3">
                          <p className="text-sm font-semibold text-red-600">Are you sure you want to request cancellation?</p>
                          <textarea
                            value={cancelNote}
                            onChange={e => setCancelNote(e.target.value)}
                            placeholder="Reason for cancellation (optional)"
                            className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => requestCancellation.mutate({ matchId: match.id, requestedBy: 'parent', note: cancelNote })}
                              disabled={requestCancellation.isPending}
                              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                            >
                              {requestCancellation.isPending ? 'Submitting...' : 'Yes, Request Cancellation'}
                            </button>
                            <button
                              onClick={() => { setCancelConfirmId(null); setCancelNote(''); }}
                              className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              No, Keep Class
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCancelConfirmId(match.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Request Cancellation
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {location && nearbyTutors && nearbyTutors.length > 0 && (
          <div className="space-y-4">
            {(() => {
              const filteredTutors = nearbyTutors
                .filter((t: any) => !activeTutorIdSet.has(t.id))
                .filter((t: any) => !subjectFilter.trim() || `${t.subjects ?? ""} ${t.qualification ?? ""}`.toLowerCase().includes(subjectFilter.trim().toLowerCase()))
                .filter((t: any) => !localityFilter.trim() || String(t.area ?? "").toLowerCase().includes(localityFilter.trim().toLowerCase()))
                .filter((t: any) => modeFilter === "all" || t.mode === "both" || t.mode === modeFilter)
                .filter((t: any) => genderFilter === "all" || t.gender === genderFilter)
                .sort((a: any, b: any) => {
                  if (sortBy === "distance") return Number(a.distKm) - Number(b.distKm);
                  if (sortBy === "experience") return (parseFloat(b.experience) || 0) - (parseFloat(a.experience) || 0);
                  return Number(b.matchScore ?? 0) - Number(a.matchScore ?? 0) || Number(a.distKm) - Number(b.distKm);
                });
              if (!filteredTutors.length) return (
                <div className="text-center py-8">
                  <MapPin size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <p className="text-sm font-semibold" style={{ color: "oklch(0.35 0.02 270)" }}>No new tutors available</p>
                  <p className="text-xs text-gray-400 mt-1">Try expanding the radius or check back later.</p>
                </div>
              );
              return (<>
            <div className="rounded-2xl border p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" style={{ borderColor: "oklch(0.92 0.005 80)", backgroundColor: "oklch(0.99 0.005 80)" }}>
              <input value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} placeholder="Filter by subject" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "oklch(0.88 0.005 80)" }} />
              <input value={localityFilter} onChange={e => setLocalityFilter(e.target.value)} placeholder="Filter by locality" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "oklch(0.88 0.005 80)" }} />
              <select value={modeFilter} onChange={e => setModeFilter(e.target.value as typeof modeFilter)} className="rounded-xl border px-3 py-2 text-sm bg-white" style={{ borderColor: "oklch(0.88 0.005 80)" }}><option value="all">All teaching modes</option><option value="home_tuition">Home tuition</option><option value="online">Online</option></select>
              <select value={genderFilter} onChange={e => setGenderFilter(e.target.value as typeof genderFilter)} className="rounded-xl border px-3 py-2 text-sm bg-white" style={{ borderColor: "oklch(0.88 0.005 80)" }}><option value="all">All tutors</option><option value="female">Female tutors</option><option value="male">Male tutors</option></select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="rounded-xl border px-3 py-2 text-sm bg-white" style={{ borderColor: "oklch(0.88 0.005 80)" }}><option value="best_match">Sort: Best match</option><option value="distance">Sort: Nearest</option><option value="experience">Sort: Experience</option></select>
            </div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>
              {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""} found within {radiusKm} km
            </p>
            {filteredTutors.map((tutor: any) => (
              <div
                key={tutor.id}
                className="bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md"
                style={{ borderColor: "oklch(0.92 0.005 80)" }}
              >
                {/* Card body — clickable to open modal */}
                <button
                  className="w-full text-left p-5 focus:outline-none"
                  onClick={() => setSelectedTutor({ ...tutor, distKm: String(tutor.distKm) } as TutorRow)}
                  aria-label={`View full profile of ${tutor.name}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                        {tutor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                            {tutor.name}
                          </h3>
                          {tutor.phoneVerified === "yes" && (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>
                              <CheckCircle2 size={10} />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>{tutor.qualification}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end" style={{ color: "oklch(0.68 0.18 50)" }}>
                        <MapPin size={12} />
                        <span className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{typeof tutor.distKm === 'number' ? tutor.distKm.toFixed(1) : tutor.distKm} km</span>
                      </div>
                      <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>away</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {Number(tutor.matchScore ?? 0) > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#DCFCE7", color: "#15803D", fontFamily: "'Poppins', sans-serif" }}>
                        Best match{tutor.matchReasons?.length ? ` · ${tutor.matchReasons[0]}` : ""}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                      <ModeLabel mode={tutor.mode} />
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", fontFamily: "'Poppins', sans-serif" }}>
                      {tutor.experience}
                    </span>
                    {tutor.boards && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#F0FDF4", color: "#15803D", fontFamily: "'Poppins', sans-serif" }}>
                        {tutor.boards}
                      </span>
                    )}
                    {tutor.gender && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: tutor.gender === 'female' ? '#FDF2F8' : '#EFF6FF', color: tutor.gender === 'female' ? '#9D174D' : '#1E40AF', fontFamily: "'Poppins', sans-serif" }}>
                        {tutor.gender === 'male' ? '👨 Male' : tutor.gender === 'female' ? '👩 Female' : tutor.gender}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <BookOpen size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span className="truncate">{tutor.subjects}</span>
                    </div>
                    {tutor.area && (
                      <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                        <MapPin size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                        <span>{tutor.area}</span>
                      </div>
                    )}
                  </div>

                  {tutor.education && (
                    <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Education</p>
                      <p className="text-xs line-clamp-1" style={{ color: "oklch(0.45 0.01 270)" }}>{tutor.education}</p>
                    </div>
                  )}

                  {tutor.bio && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: "oklch(0.45 0.01 270)" }}>{tutor.bio}</p>
                  )}

                  {/* View full profile hint */}
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "oklch(0.68 0.18 50)" }}>
                    <ChevronRight size={13} />
                    View full profile
                  </div>
                </button>

                {/* Book Demo — separate from modal trigger */}
                <div className="px-5 pb-5">
                  <BookDemoButton tutorProfileId={tutor.id} />
                </div>
              </div>
            ))}
            </>);
              })()}
          </div>
        )}
      </div>
    </div>
  );
}
