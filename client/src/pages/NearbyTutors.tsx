/**
 * EduNest — Nearby Tutors
 * For logged-in students/parents: shows approved tutors sorted by distance.
 * Uses browser geolocation. Requires student profile to be set up first.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { startLogin } from "@/const";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  MapPin, BookOpen, GraduationCap, Clock, IndianRupee,
  Loader2, Navigation, AlertCircle, RefreshCw, Users,
  CheckCircle2, Star, Calendar
} from "lucide-react";

function ModeLabel({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    home_tuition: "Home Tuition",
    online: "Online",
    both: "Both",
  };
  return <span>{map[mode] ?? mode}</span>;
}

export default function NearbyTutors() {
  const [, navigate] = useLocation();
  const { loading, isAuthenticated } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);

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

  if (loading || profileLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
      </div>
    );
  }

  // Role gate: only students can access this page
  useEffect(() => {
    if (!roleLoading && isAuthenticated && userRole === "tutor") {
      navigate("/tutor-dashboard");
    }
  }, [roleLoading, isAuthenticated, userRole, navigate]);

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
      <SEO title="Tutors Near Me — EduNest" description="Find verified tutors near you on EduNest." url="https://edu-nest.manus.space/nearby-tutors" />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/manus-storage/edunest-logo-v3_f012b9fe.png" alt="EduNest" className="w-8 h-8 object-contain" />
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
              onClick={() => navigate("/my-portal")}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
            >
              My Bookings
            </button>
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
                Location active — {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
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

        {location && nearbyTutors && nearbyTutors.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>
              {nearbyTutors.length} tutor{nearbyTutors.length !== 1 ? "s" : ""} found within {radiusKm} km
            </p>
            {nearbyTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white rounded-2xl shadow-sm border p-5 transition-all hover:shadow-md"
                style={{ borderColor: "oklch(0.92 0.005 80)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                      {tutor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                        {tutor.name}
                      </h3>
                      <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>{tutor.qualification}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end" style={{ color: "oklch(0.68 0.18 50)" }}>
                      <MapPin size={12} />
                      <span className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{tutor.distKm} km</span>
                    </div>
                    <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>away</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
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
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
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
                  {tutor.regularTime && (
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <Clock size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span>{tutor.regularTime}</span>
                    </div>
                  )}
                  {tutor.daysPerWeek && (
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <Calendar size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span>{tutor.daysPerWeek}</span>
                    </div>
                  )}
                </div>

                {(tutor.firstMonthFee || tutor.nextMonthFee) && (
                  <div className="flex gap-4 mb-4 p-3 rounded-xl" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
                    {tutor.firstMonthFee && (
                      <div className="text-center">
                        <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>First Month</p>
                        <p className="text-sm font-bold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>₹{tutor.firstMonthFee}</p>
                      </div>
                    )}
                    {tutor.nextMonthFee && (
                      <div className="text-center">
                        <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>Next Month</p>
                        <p className="text-sm font-bold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>₹{tutor.nextMonthFee}</p>
                      </div>
                    )}
                  </div>
                )}

                {tutor.bio && (
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: "oklch(0.45 0.01 270)" }}>{tutor.bio}</p>
                )}

                <button
                  onClick={() => {
                    toast.success("Demo class request sent! EduNest will contact you to confirm the time.");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                >
                  <Star size={14} /> Book Free Demo Class
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
