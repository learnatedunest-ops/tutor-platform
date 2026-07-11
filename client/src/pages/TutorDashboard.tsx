/**
 * EduNest — Tutor Dashboard
 * For approved tutors: shows nearby active student requirements sorted by distance.
 * Uses browser geolocation to find the tutor's current position.
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
  MapPin, BookOpen, GraduationCap, Clock, IndianRupee,
  Loader2, Navigation, AlertCircle, RefreshCw, User,
  ChevronRight, CheckCircle2, Calendar, Home, ShieldCheck,
  Upload, FileText, CreditCard, ExternalLink
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
  const { userRole, loading: roleLoading } = useUserRole();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);

  // Get tutor's own profile
  const { data: myProfile, isLoading: profileLoading } = trpc.tutorProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Get demo slots for this tutor
  const { data: demoSlots, isLoading: slotsLoading, refetch: refetchSlots } = trpc.demoSlot.tutorSlots.useQuery(
    undefined,
    { enabled: isAuthenticated && myProfile?.status === "approved" }
  );

  // All student interests for this tutor to respond to (no admin gate)
  const { data: approvedStudentInterests, refetch: refetchApprovedInterests } = trpc.studentDemoInterest.getApprovedForMe.useQuery(
    undefined,
    { enabled: isAuthenticated && myProfile?.status === "approved" }
  );
  const respondToStudentInterest = trpc.studentDemoInterest.respondToInterest.useMutation({
    onSuccess: () => { refetchApprovedInterests(); refetchSlots(); toast.success("Response recorded!"); },
    onError: (err) => toast.error(err.message ?? "Failed to respond"),
  });

  const tutorConfirmComing = trpc.demoSlot.tutorConfirmComing.useMutation({
    onSuccess: () => { refetchSlots(); toast.success("Confirmed! The student will be notified."); },
    onError: (err) => toast.error(err.message ?? "Failed to confirm"),
  });

  // Session logs for this tutor
  const { data: mySessionLogs, refetch: refetchSessionLogs } = trpc.sessionLog.myLogs.useQuery(
    undefined,
    { enabled: isAuthenticated && myProfile?.status === "approved" }
  );

  // Get or create session log mutation
  const getOrCreateLog = trpc.sessionLog.getOrCreate.useMutation({
    onSuccess: () => refetchSessionLogs(),
    onError: (err) => toast.error(err.message ?? "Failed to create session log"),
  });

  // Upload sheet mutation
  const uploadSheet = trpc.sessionLog.uploadSheet.useMutation({
    onSuccess: () => {
      refetchSessionLogs();
      toast.success("✅ Sheet uploaded! EduNest will review and process your payment.");
    },
    onError: (err) => toast.error(err.message ?? "Upload failed"),
  });

  // Proceed intent mutation
  const setProceedIntent = trpc.demoSlot.setProceedIntent.useMutation({
    onSuccess: (data) => {
      refetchSlots();
      refetchConfirmedMatches();
      if (data.matched) {
        toast.success("🎉 Great news! Both parties agreed. You've got a class!");
      } else {
        toast.success("Your response has been recorded.");
      }
    },
    onError: (err) => toast.error(err.message ?? "Failed to record response"),
  });

  // Confirmed matches for this tutor (to show Got a Class status)
  const { data: myConfirmedMatches, refetch: refetchConfirmedMatches } = trpc.confirmedMatch.getMineForTutor.useQuery(
    undefined,
    { enabled: isAuthenticated && myProfile?.status === "approved" }
  );

  // Get nearby students (only runs once location is available)
  const { data: nearbyStudents, isLoading: studentsLoading, refetch } =
    trpc.tutorProfile.getNearbyStudents.useQuery(
      { latitude: location?.lat ?? 0, longitude: location?.lng ?? 0, radiusKm },
      { enabled: !!location && myProfile?.status === "approved" }
    );

  // Load existing interests from DB so state persists across refreshes
  const { data: myInterests } = trpc.tutorInterest.getMyInterests.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Build a map of studentProfileId → status from DB data + local optimistic adds
  // This lets us show accepted/declined states after admin approval
  const [localExpressedIds, setLocalExpressedIds] = useState<Set<number>>(new Set());
  const interestStatusMap = new Map<number, string>(
    myInterests?.map(i => [i.studentProfileId, i.status]) ?? []
  );
  // Locally added (optimistic) ones not yet in DB response default to 'pending'
  Array.from(localExpressedIds).forEach(id => {
    if (!interestStatusMap.has(id)) interestStatusMap.set(id, 'pending');
  });

  // Express Interest mutation
  const expressInterest = trpc.tutorInterest.express.useMutation({
    onSuccess: (_, vars) => {
      setLocalExpressedIds(prev => new Set(prev).add(vars.studentProfileId));
      toast.success("Interest expressed! EduNest will contact you with this student's details.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to express interest. Please try again.");
    },
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

  // Role gate: only tutors can access this page — MUST be before any early return
  useEffect(() => {
    if (!roleLoading && isAuthenticated && userRole === "student") {
      navigate("/nearby-tutors");
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
            {myProfile.phoneVerified === "yes" && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", fontFamily: "'Poppins', sans-serif" }}>
                <ShieldCheck size={12} /> Phone Verified
              </span>
            )}
            <button
              onClick={() => navigate("/ongoing-classes")}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.55 0.18 50)", border: "1px solid oklch(0.88 0.08 50)", fontFamily: "'Poppins', sans-serif" }}
            >
              📚 My Classes
            </button>
            <button
              onClick={() => navigate("/tutor-setup?edit=true")}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:bg-gray-50"
              style={{ border: "1px solid oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}
            >
              ✏️ Edit Profile
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
            {myProfile.education && (
              <div className="flex items-center gap-1.5" style={{ color: "oklch(0.35 0.02 270)" }}>
                <BookOpen size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
                <span className="truncate max-w-xs">{myProfile.education.split("\n")[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Demo Schedule Panel */}
        {(slotsLoading || (demoSlots && demoSlots.length > 0)) && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} style={{ color: "oklch(0.68 0.18 50)" }} />
              <h2 className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>My Demo Classes</h2>
              {demoSlots && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)" }}>
                  {demoSlots.length} slot{demoSlots.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {slotsLoading && (
              <div className="flex items-center gap-2 py-4">
                <Loader2 size={16} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
                <span className="text-sm" style={{ color: "oklch(0.65 0.01 270)" }}>Loading schedule...</span>
              </div>
            )}
            {demoSlots && demoSlots.length > 0 && (
              <div className="space-y-3">
                {demoSlots.map(slot => (
                  <div key={slot.id} className="rounded-xl p-4 border" style={{ borderColor: "oklch(0.92 0.005 80)", backgroundColor: "oklch(0.98 0.005 80)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            slot.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                            slot.status === "completed" ? "bg-green-100 text-green-700" :
                            slot.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {slot.status === "pending_schedule" ? "Awaiting Schedule" :
                             slot.status === "scheduled" ? "📅 Demo Scheduled ✓" :
                             slot.status === "completed" ? "Demo Completed" : "Cancelled"}
                          </span>
                          <span className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
                            Student Profile #{slot.studentProfileId}
                          </span>
                        </div>
                        {slot.scheduledDate && slot.scheduledTime ? (
                          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                            <Calendar size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
                            {slot.scheduledDate} at {slot.scheduledTime}
                          </div>
                        ) : (
                          <p className="text-sm" style={{ color: "oklch(0.65 0.01 270)" }}>Waiting for student to schedule a time</p>
                        )}
                        {slot.notes && (
                          <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.01 270)" }}>Note: {slot.notes}</p>
                        )}
                        <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.01 270)" }}>
                          Mode: {slot.mode === "online" ? "Online" : slot.mode === "home_tuition" ? "Home Tuition" : "Home + Online"}
                        </p>
                        {/* Show student contact details once demo is scheduled — tutor needs address/phone to go there */}
                        {(slot.status === "scheduled" || slot.status === "completed") && ((slot as any).studentAddress || (slot as any).studentPhone) && (
                          <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                            <p className="text-xs font-bold text-blue-700 mb-1">📍 Student Contact Details</p>
                            {(slot as any).studentAddress && (
                              <p className="text-xs text-blue-800">🏠 {(slot as any).studentAddress}</p>
                            )}
                            {(slot as any).studentPhone && (
                              <p className="text-xs text-blue-800">📞 <a href={`tel:${(slot as any).studentPhone}`} className="underline">{(slot as any).studentPhone}</a></p>
                            )}
                          </div>
                        )}

                        {/* Tutor: Confirm Coming for Demo */}
                        {slot.status === "scheduled" && !(slot as any).tutorConfirmedComing && (
                          <div className="mt-3 p-3 rounded-xl border-2" style={{ borderColor: "oklch(0.88 0.12 145)", backgroundColor: "oklch(0.97 0.03 145)" }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                              🚗 Are you coming for the demo?
                            </p>
                            <p className="text-xs mb-3" style={{ color: "oklch(0.55 0.01 270)" }}>Confirm so the student/parent knows to expect you.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => tutorConfirmComing.mutate({ slotId: slot.id, response: 'yes' })}
                                disabled={tutorConfirmComing.isPending}
                                className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                                style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
                              >
                                {tutorConfirmComing.isPending ? <span className="animate-pulse">...</span> : "✔ Yes, I'm Coming"}
                              </button>
                              <button
                                onClick={() => tutorConfirmComing.mutate({ slotId: slot.id, response: 'no' })}
                                disabled={tutorConfirmComing.isPending}
                                className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all hover:bg-red-50"
                                style={{ borderColor: "oklch(0.88 0.12 20)", color: "oklch(0.55 0.18 20)" }}
                              >
                                ✕ Can't Make It
                              </button>
                            </div>
                          </div>
                        )}
                        {slot.status === "scheduled" && (slot as any).tutorConfirmedComing === 'yes' && (
                          <div className="mt-3 p-2 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-xs font-semibold text-green-700">✔ You confirmed you're coming. The student has been notified.</p>
                          </div>
                        )}
                        {slot.status === "scheduled" && (slot as any).tutorConfirmedComing === 'no' && (
                          <div className="mt-3 p-2 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-xs font-semibold text-red-700">❌ You indicated you can't make it. Please contact EduNest support to reschedule.</p>
                          </div>
                        )}

                        {/* Post-demo proceed intent UI */}
                        {slot.status === "completed" && !(slot as any).tutorProceedIntent && (
                          <div className="mt-3 p-3 rounded-xl border-2" style={{ borderColor: "oklch(0.88 0.12 50)", backgroundColor: "oklch(0.98 0.03 50)" }}>
                            <p className="text-sm font-semibold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                              🎓 Would you like to continue with this student?
                            </p>
                            <p className="text-xs mb-3" style={{ color: "oklch(0.55 0.01 270)" }}>
                              Let us know if you'd like to take regular classes with this student.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setProceedIntent.mutate({ slotId: slot.id, intent: "yes" })}
                                disabled={setProceedIntent.isPending}
                                className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                                style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
                              >
                                {setProceedIntent.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : "✔ Yes, Proceed"}
                              </button>
                              <button
                                onClick={() => setProceedIntent.mutate({ slotId: slot.id, intent: "no" })}
                                disabled={setProceedIntent.isPending}
                                className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all hover:bg-red-50"
                                style={{ borderColor: "oklch(0.88 0.12 20)", color: "oklch(0.55 0.18 20)" }}
                              >
                                ✕ No Thanks
                              </button>
                            </div>
                          </div>
                        )}
                        {slot.status === "completed" && (slot as any).tutorProceedIntent === "yes" && !(slot as any).studentProceedIntent && (
                          <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <p className="text-xs font-semibold text-blue-700">⏳ You said Yes! Waiting for the student/parent to respond...</p>
                          </div>
                        )}
                        {slot.status === "completed" && (slot as any).tutorProceedIntent === "yes" && (slot as any).studentProceedIntent === "yes" && (() => {
                          const confirmedMatch = myConfirmedMatches?.find((m: any) => m.demoSlotId === slot.id);
                          const isGotAClass = confirmedMatch?.classStatus === 'got_a_class';
                          return (
                          <div className={`mt-3 p-3 rounded-xl border ${isGotAClass ? 'bg-emerald-50 border-emerald-300' : 'bg-green-50 border-green-200'}`}>
                            <p className={`text-xs font-semibold ${isGotAClass ? 'text-emerald-700' : 'text-green-700'}`}>
                              {isGotAClass ? '🎓 Got a Class! EduNest has confirmed your class arrangement.' : '🎉 Great news! Both parties agreed. You\'ve got a class!'}
                            </p>
                            {/* Session Log Sheet & Payment Section */}
                            {(() => {
                              // Find session log for THIS specific confirmed match
                              const matchId = (slot as any).confirmedMatchId;
                              const log = mySessionLogs?.find((l: any) => l.matchId === matchId);
                              return (
                                <div className="mt-3 border-t border-green-200 pt-3 space-y-2">
                                  <p className="text-xs font-bold text-green-800">📋 Session Log Sheet</p>
                                  <div className="flex flex-wrap gap-2">
                                    <a
                                      href={`/session-log/${(slot as any).confirmedMatchId ?? ''}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                                    >
                                      <FileText size={13} /> Download / Print Sheet
                                    </a>
                                    {log ? (
                                      <>
                                        {/* Payment status badge — only show after sheet is uploaded */}
                                        {(log.paymentStatus === 'sheet_uploaded' || log.paymentStatus === 'payment_processed') && (
                                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                            log.paymentStatus === 'payment_processed'
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-yellow-100 text-yellow-700'
                                          }`}>
                                            <CreditCard size={13} />
                                            {log.paymentStatus === 'payment_processed' ? '✅ Payment Processed' : '⏳ Payment Pending'}
                                          </span>
                                        )}
                                        {/* Upload new sheet if not yet processed */}
                                        {log.paymentStatus !== 'payment_processed' && (
                                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors cursor-pointer">
                                            <Upload size={13} />
                                            {log.paymentStatus === 'sheet_uploaded' ? 'Re-upload Sheet' : 'Upload Completed Sheet'}
                                            <input
                                              type="file"
                                              accept="image/*,application/pdf"
                                              className="hidden"
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                // Reset input so same file can be re-selected
                                                e.target.value = '';
                                                // Validate file size client-side (10 MB)
                                                if (file.size > 10 * 1024 * 1024) {
                                                  toast.error('File too large. Maximum size is 10 MB.');
                                                  return;
                                                }
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                try {
                                                  toast.info('Uploading sheet...');
                                                  const res = await fetch('/api/upload-session-sheet', {
                                                    method: 'POST',
                                                    body: formData,
                                                    credentials: 'include',
                                                  });
                                                  const json = await res.json().catch(() => ({}));
                                                  if (!res.ok) {
                                                    throw new Error(json?.error ?? `Upload failed (${res.status})`);
                                                  }
                                                  const { url } = json;
                                                  if (!url) throw new Error('No URL returned from server');
                                                  uploadSheet.mutate({ logId: log.id, uploadedSheetUrl: url });
                                                } catch (err: any) {
                                                  toast.error(err?.message ?? 'Upload failed. Please try again with a JPEG, PNG, or PDF.');
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                        {/* View uploaded sheet */}
                                        {log.uploadedSheetUrl && (
                                          <a
                                            href={log.uploadedSheetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                          >
                                            <ExternalLink size={13} /> View Uploaded Sheet
                                          </a>
                                        )}
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          const matchId = (slot as any).confirmedMatchId;
                                          if (matchId) getOrCreateLog.mutate({ matchId });
                                          else toast.error('Match ID not found. Please refresh.');
                                        }}
                                        disabled={getOrCreateLog.isPending}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                                      >
                                        {getOrCreateLog.isPending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                                        Upload Completed Sheet
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          );
                        })()}
                        {slot.status === "completed" && (slot as any).tutorProceedIntent === "no" && (
                          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500">You chose not to continue with this student.</p>
                          </div>
                        )}
                        {slot.status === "completed" && (slot as any).tutorProceedIntent === "yes" && (slot as any).studentProceedIntent === "no" && (
                          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500">The student/parent chose not to continue. Better luck next time!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Interests — Tutor must Accept/Reject (no admin gate) */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6" style={{ borderColor: "oklch(0.88 0.12 145)" }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} style={{ color: "oklch(0.55 0.18 145)" }} />
            <h2 className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>Student Interests</h2>
            {approvedStudentInterests && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "oklch(0.95 0.05 145)", color: "oklch(0.35 0.12 145)" }}>
                {approvedStudentInterests.filter((i: any) => i.status === 'pending').length} pending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">Students who are interested in learning from you. Accept to create a demo slot (parent will set the timing), or decline if unavailable.</p>
          {!approvedStudentInterests?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No student interests yet. Once a student shows interest in you, it will appear here.</p>
          ) : (
            <div className="space-y-3">
              {approvedStudentInterests.map((interest: any) => (
                <div key={interest.id} className="rounded-xl p-4 border" style={{ borderColor: "oklch(0.92 0.005 80)", backgroundColor: "oklch(0.98 0.005 80)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                        {interest.studentName ?? `Student #${interest.studentProfileId}`}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1 mb-1">
                        {interest.studentGrade && (
                          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-100">
                            Grade: {interest.studentGrade}
                          </span>
                        )}
                        {interest.studentSubjects && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {interest.studentSubjects}
                          </span>
                        )}
                        {interest.studentMode && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                            {interest.studentMode === 'online' ? '💻 Online' : interest.studentMode === 'home_tuition' ? '🏠 Home Tuition' : '🏠💻 Both'}
                          </span>
                        )}
                        {interest.studentArea && (
                          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
                            📍 {interest.studentArea}
                          </span>
                        )}
                      </div>
                      {interest.message && (
                        <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.01 270)" }}>Message: {interest.message}</p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.01 270)" }}>
                        Received: {new Date(interest.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    {interest.status === 'pending' ? (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => respondToStudentInterest.mutate({ interestId: interest.id, response: 'confirmed' })}
                          disabled={respondToStudentInterest.isPending}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                          style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
                        >
                          ✔ Accept
                        </button>
                        <button
                          onClick={() => respondToStudentInterest.mutate({ interestId: interest.id, response: 'cancelled' })}
                          disabled={respondToStudentInterest.isPending}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-red-50"
                          style={{ borderColor: "oklch(0.88 0.12 20)", color: "oklch(0.55 0.18 20)" }}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        interest.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {interest.status === 'confirmed' ? '✔ Accepted' : '✕ Declined'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

                {/* Express Interest — shows real status from DB after admin action */}
                {interestStatusMap.has(student.id) ? (
                  (() => {
                    const status = interestStatusMap.get(student.id)!;
                    if (status === 'accepted') {
                      return (
                        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: "#DCFCE7", color: "#15803D", fontFamily: "'Poppins', sans-serif" }}>
                          <CheckCircle2 size={14} /> Interest Accepted — EduNest will contact you!
                        </div>
                      );
                    }
                    if (status === 'declined') {
                      return (
                        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: "#FEE2E2", color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                          <AlertCircle size={14} /> Interest Declined
                        </div>
                      );
                    }
                    // pending (default)
                    return (
                      <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: "oklch(0.95 0.05 145)", color: "oklch(0.35 0.12 145)", fontFamily: "'Poppins', sans-serif" }}>
                        <CheckCircle2 size={14} /> Interest Expressed — Awaiting Review
                      </div>
                    );
                  })()
                ) : (
                  <button
                    onClick={() => expressInterest.mutate({ studentProfileId: student.id })}
                    disabled={expressInterest.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {expressInterest.isPending ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                    Express Interest
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
