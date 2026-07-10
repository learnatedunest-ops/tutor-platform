/**
 * EduNest — Tutor Dashboard
 * For approved tutors: shows nearby active student requirements sorted by distance.
 * Uses browser geolocation to find the tutor's current position.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  MapPin, BookOpen, GraduationCap, Clock, IndianRupee,
  Loader2, Navigation, AlertCircle, RefreshCw, User,
  ChevronRight, CheckCircle2, Calendar
} from "lucide-react";

function ModeLabel({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    home_tuition: "Home Tuition",
    online: "Online",
    both: "Both",
  };
  return <span>{map[mode] ?? mode}</span>;
}

export default function TutorDashboard() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);

  // Get tutor's own profile
  const { data: myProfile, isLoading: profileLoading } = trpc.tutorProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Get nearby students (only runs once location is available)
  const { data: nearbyStudents, isLoading: studentsLoading, refetch } =
    trpc.tutorProfile.getNearbyStudents.useQuery(
      { latitude: location?.lat ?? 0, longitude: location?.lng ?? 0, radiusKm },
      { enabled: !!location && myProfile?.status === "approved" }
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

  if (loading || profileLoading) {
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
          <GraduationCap size={48} className="mx-auto mb-4" style={{ color: "oklch(0.68 0.18 50)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Login Required
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Please log in to access your tutor dashboard.
          </p>
          <button
            onClick={() => startLogin()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <User size={48} className="mx-auto mb-4" style={{ color: "oklch(0.68 0.18 50)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Complete Your Profile First
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            You need to complete your tutor profile before accessing the dashboard.
          </p>
          <button
            onClick={() => navigate("/tutor-setup")}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            Complete Profile →
          </button>
        </div>
      </div>
    );
  }

  if (myProfile.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
            <Clock size={32} style={{ color: "oklch(0.68 0.18 50)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Profile Under Review
          </h1>
          <p className="text-gray-500 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Your tutor profile is being reviewed by the EduNest team. You'll be notified once it's approved — typically within 24 hours.
          </p>
          <p className="text-sm mb-6" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Nunito', sans-serif" }}>
            Logged in as: <strong>{user?.name ?? user?.email}</strong>
          </p>
          <button
            onClick={() => navigate("/tutor-setup")}
            className="text-sm underline"
            style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}
          >
            Edit my profile
          </button>
        </div>
      </div>
    );
  }

  if (myProfile.status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Profile Not Approved
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Your profile was not approved. Please contact EduNest at +91-8618635627 or update your profile and resubmit.
          </p>
          <button
            onClick={() => navigate("/tutor-setup")}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            Update & Resubmit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
      <SEO title="Tutor Dashboard — EduNest" description="View nearby student requirements on EduNest." url="https://edu-nest.manus.space/tutor-dashboard" />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/manus-storage/edunest-logo-v3_f012b9fe.png" alt="EduNest" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Tutor Dashboard</p>
              <p className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                {myProfile.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#DCFCE7", color: "#15803D", fontFamily: "'Poppins', sans-serif" }}>
              ✓ Approved
            </span>
            <button
              onClick={() => navigate("/tutor-setup")}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Summary */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
              <BookOpen size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
              <span>{myProfile.subjects}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
              <GraduationCap size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
              <span>{myProfile.experience} experience</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
              <MapPin size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
              <span>{myProfile.area ?? "Location set"}</span>
            </div>
            {myProfile.firstMonthFee && (
              <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
                <IndianRupee size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
                <span>₹{myProfile.firstMonthFee} first month</span>
              </div>
            )}
          </div>
        </div>

        {/* Location & Radius Controls */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-base mb-0.5" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                Nearby Student Requirements
              </h2>
              <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
                {location ? `Showing within ${radiusKm} km of your current location` : "Share your location to see nearby students"}
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
              <p className="text-xs" style={{ color: "#DC2626", fontFamily: "'Nunito', sans-serif" }}>{locError}</p>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 mt-3">
              <CheckCircle2 size={14} style={{ color: "#16A34A" }} />
              <p className="text-xs" style={{ color: "#15803D", fontFamily: "'Nunito', sans-serif" }}>
                Location active — {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
              <button onClick={getLocation} className="text-xs underline ml-1" style={{ color: "oklch(0.68 0.18 50)" }}>Update</button>
            </div>
          )}
        </div>

        {/* Student Cards */}
        {!location && (
          <div className="text-center py-16">
            <Navigation size={48} className="mx-auto mb-4 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="text-base font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>
              Share your location to see nearby students
            </p>
            <p className="text-sm" style={{ color: "oklch(0.65 0.01 270)" }}>
              Click "Share My Location" above to find students near you
            </p>
          </div>
        )}

        {location && studentsLoading && (
          <div className="text-center py-16">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="text-sm" style={{ color: "oklch(0.65 0.01 270)" }}>Finding students near you...</p>
          </div>
        )}

        {location && !studentsLoading && nearbyStudents && nearbyStudents.length === 0 && (
          <div className="text-center py-16">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="text-base font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>
              No students found within {radiusKm} km
            </p>
            <p className="text-sm mb-4" style={{ color: "oklch(0.65 0.01 270)" }}>
              Try increasing the search radius
            </p>
            <button
              onClick={() => setRadiusKm(r => Math.min(r + 5, 30))}
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
            >
              Expand to {Math.min(radiusKm + 5, 30)} km
            </button>
          </div>
        )}

        {location && nearbyStudents && nearbyStudents.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>
              {nearbyStudents.length} student{nearbyStudents.length !== 1 ? "s" : ""} found within {radiusKm} km
            </p>
            {nearbyStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl shadow-sm border p-5 transition-all hover:shadow-md"
                style={{ borderColor: "oklch(0.92 0.005 80)" }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                        {student.board}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", fontFamily: "'Poppins', sans-serif" }}>
                        <ModeLabel mode={student.mode} />
                      </span>
                    </div>
                    <h3 className="text-base font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                      {student.grade} — {student.subjects}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end" style={{ color: "oklch(0.68 0.18 50)" }}>
                      <MapPin size={12} />
                      <span className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{student.distKm} km</span>
                    </div>
                    <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>away</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                  {student.regularTime && (
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <Clock size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span>{student.regularTime}</span>
                    </div>
                  )}
                  {student.daysPerWeek && (
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <Calendar size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span>{student.daysPerWeek}</span>
                    </div>
                  )}
                  {student.sessionDuration && student.sessionsPerWeek && (
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <BookOpen size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span>{student.sessionDuration}/day · {student.sessionsPerWeek} days/week</span>
                    </div>
                  )}
                  {student.budget && (
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <IndianRupee size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span>Budget: ₹{student.budget}/month</span>
                    </div>
                  )}
                  {student.area && (
                    <div className="flex items-center gap-1.5" style={{ color: "oklch(0.45 0.01 270)" }}>
                      <MapPin size={12} style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span>{student.area}</span>
                    </div>
                  )}
                </div>

                {student.specialRequirements && (
                  <div className="rounded-lg px-3 py-2 mb-4 text-xs" style={{ backgroundColor: "oklch(0.97 0.005 80)", color: "oklch(0.45 0.01 270)" }}>
                    <span className="font-semibold" style={{ color: "oklch(0.68 0.18 50)" }}>Special: </span>
                    {student.specialRequirements}
                  </div>
                )}

                {/* Express Interest */}
                <button
                  onClick={() => {
                    toast.success("Interest expressed! EduNest will contact you with this student's details.");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                >
                  Express Interest <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
