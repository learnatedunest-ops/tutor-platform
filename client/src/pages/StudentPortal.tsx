/**
 * EduNest Student/Parent Portal
 * Requires Manus login — shows demo bookings, tuition requirement (editable), and profile
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import {
  BookOpen, Clock, CheckCircle2, XCircle, Calendar,
  GraduationCap, MapPin, User, LogIn, RefreshCw, Phone, Mail,
  Home, FileText, Edit2, Save, X, CalendarCheck, Loader2,
  CreditCard, ExternalLink,
} from "lucide-react";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const BOOKING_STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: Clock },
  confirmed: { label: "Confirmed", bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   icon: CheckCircle2 },
  completed: { label: "Completed", bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  icon: CheckCircle2 },
  cancelled: { label: "Cancelled", bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200",    icon: XCircle },
};

export default function StudentPortal() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "demos" | "interests" | "classes" | "requirement" | "profile">("bookings");
  const [editingReq, setEditingReq] = useState(false);
  const [reqForm, setReqForm] = useState<Record<string, string>>({});
  // Demo slot scheduling state
  const [schedulingSlotId, setSchedulingSlotId] = useState<number | null>(null);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedNotes, setSchedNotes] = useState("");

  const { data: myBookings, isLoading: loadingBookings, refetch } =
    trpc.myBookings.list.useQuery(undefined, { enabled: isAuthenticated });

  const { data: myProfile } = trpc.studentProfile.getMyProfile.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  // Demo slots for scheduling
  const utils = trpc.useUtils();
  const { data: myDemoSlots, isLoading: slotsLoading } = trpc.demoSlot.mySlots.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const pendingSlots = useMemo(() => myDemoSlots?.filter(s => s.status === "pending_schedule") ?? [], [myDemoSlots]);

  const scheduleMutation = trpc.demoSlot.schedule.useMutation({
    onSuccess: () => {
      utils.demoSlot.mySlots.invalidate();
      setSchedulingSlotId(null);
      setSchedDate("");
      setSchedTime("");
      setSchedNotes("");
      toast.success("Demo class scheduled! EduNest will confirm with your tutor.");
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Failed to schedule. Please try again."),
  });

  // Session logs for this student
  const { data: mySessionLogs } = trpc.sessionLog.myStudentLogs.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  // Confirmed matches for this student (to show Got a Class status)
  const { data: myConfirmedMatches, refetch: refetchConfirmedMatches } = trpc.confirmedMatch.getMineForStudent.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  // Post-demo proceed intent
  const setProceedIntent = trpc.demoSlot.setProceedIntent.useMutation({
    onSuccess: (data) => {
      utils.demoSlot.mySlots.invalidate();
      refetchConfirmedMatches();
      if (data.matched) {
        toast.success("🎉 Great news! Both parties agreed. You've got a class!");
      } else {
        toast.success("Your response has been recorded.");
      }
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Failed to record response"),
  });

  // Admin-approved tutor interests for this student/parent to respond to
  const { data: approvedTutorInterests, refetch: refetchApprovedInterests } = trpc.tutorInterest.getApprovedForMe.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const respondToTutorInterest = trpc.tutorInterest.respondToInterest.useMutation({
    onSuccess: () => {
      refetchApprovedInterests();
      utils.demoSlot.mySlots.invalidate();
      toast.success("Response recorded!");
    },
    onError: (err: { message?: string }) => toast.error(err.message ?? "Failed to respond"),
  });

  const updateProfileMutation = trpc.studentProfile.save.useMutation({
    onSuccess: () => {
      toast.success("Requirement updated successfully!");
      setEditingReq(false);
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Failed to update requirement"),
  });

  const startEdit = () => {
    if (myProfile) {
      setReqForm({
        name: myProfile.name ?? "",
        phone: myProfile.phone ?? "",
        grade: myProfile.grade ?? "",
        board: myProfile.board ?? "",
        subjects: myProfile.subjects ?? "",
        mode: myProfile.mode ?? "",
        demoTime: myProfile.demoTime ?? "",
        regularTime: myProfile.regularTime ?? "",
        sessionsPerWeek: String(myProfile.sessionsPerWeek ?? ""),
        sessionDuration: String(myProfile.sessionDuration ?? ""),
        budget: String(myProfile.budget ?? ""),
        specialRequirements: myProfile.specialRequirements ?? "",
      });
      setEditingReq(true);
    }
  };

  const saveEdit = () => {
    if (!myProfile) return;
    updateProfileMutation.mutate({
      name: reqForm.name,
      email: myProfile.email,
      phone: reqForm.phone,
      role: myProfile.role as "student" | "parent",
      studentName: myProfile.studentName ?? undefined,
      grade: reqForm.grade,
      board: reqForm.board as "CBSE" | "ICSE" | "State" | "IB" | "IGCSE" | "Other",
      subjects: reqForm.subjects,
      mode: reqForm.mode as "home_tuition" | "online" | "both",
      demoTime: reqForm.demoTime || undefined,
      regularTime: reqForm.regularTime || undefined,
      sessionsPerWeek: reqForm.sessionsPerWeek || undefined,
      sessionDuration: reqForm.sessionDuration || undefined,
      budget: reqForm.budget || undefined,
      specialRequirements: reqForm.specialRequirements || undefined,
      latitude: myProfile.latitude ? Number(myProfile.latitude) : undefined,
      longitude: myProfile.longitude ? Number(myProfile.longitude) : undefined,
      fullAddress: myProfile.area ?? undefined,
      area: myProfile.area ?? undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
              <LogIn size={32} style={{ color: "oklch(0.68 0.18 50)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
              Student / Parent Portal
            </h1>
            <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Log in to view your demo class bookings, track tutor matches, and manage your sessions.
            </p>
            <button
              onClick={() => startLogin()}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95 mb-3"
              style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
            >
              Log In to Your Portal
            </button>
            <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  const pendingCount   = myBookings?.filter(b => b.status === "pending").length ?? 0;
  const pendingDemoCount = pendingSlots.length;
  const confirmedCount = myBookings?.filter(b => b.status === "confirmed").length ?? 0;
  const completedCount = myBookings?.filter(b => b.status === "completed").length ?? 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
        <div className="max-w-5xl mx-auto">

          {/* Welcome Banner */}
          <div className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.58 0.20 40) 100%)" }}>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold mb-1">Welcome back,</p>
                <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {user.name ?? "Student"}
                </h1>
                <p className="text-orange-100 text-sm">{user.email}</p>
              </div>
              {/* Header buttons */}
              <div className="flex items-center gap-2">
                <Link href="/my-classes" className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-semibold transition-all backdrop-blur-sm">
                  📚 My Classes
                </Link>
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-semibold transition-all backdrop-blur-sm">
                  <Home size={16} /> Home
                </Link>
              </div>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
              <GraduationCap size={100} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: myBookings?.length ?? 0, color: "oklch(0.68 0.18 50)", icon: BookOpen },
              { label: "Confirmed",      value: confirmedCount,          color: "#3b82f6",              icon: CheckCircle2 },
              { label: "Completed",      value: completedCount,          color: "#22c55e",              icon: CheckCircle2 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{value}</div>
                  <div className="text-xs text-gray-500 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
                        {(["bookings", "demos", "interests", "classes", "requirement", "profile"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? "text-white shadow-sm" : "bg-white text-gray-500 hover:text-gray-700"}`}
                style={activeTab === tab ? { backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" } : { fontFamily: "'Poppins', sans-serif" }}
              >
                {tab === "bookings" ? (
                  <span className="flex items-center gap-2">
                    <BookOpen size={15} /> My Demo Bookings
                    {pendingCount > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                  </span>
                ) : tab === "demos" ? (
                  <span className="flex items-center gap-2">
                    <CalendarCheck size={15} /> Schedule Demo
                    {pendingDemoCount > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingDemoCount}</span>}
                  </span>
                ) : tab === "interests" ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={15} /> Tutor Interests
                    {approvedTutorInterests?.filter((i: any) => i.status === 'pending').length ? (
                      <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {approvedTutorInterests.filter((i: any) => i.status === 'pending').length}
                      </span>
                    ) : null}
                  </span>
                ) : tab === "classes" ? (
                  <span className="flex items-center gap-2">
                    <GraduationCap size={15} /> My Classes
                    {myConfirmedMatches?.filter((m: any) => m.classStatus === 'got_a_class').length ? (
                      <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {myConfirmedMatches.filter((m: any) => m.classStatus === 'got_a_class').length}
                      </span>
                    ) : null}
                  </span>
                ) : tab === "requirement" ? (
                  <span className="flex items-center gap-2"><FileText size={15} /> My Requirement</span>
                ) : (
                  <span className="flex items-center gap-2"><User size={15} /> My Profile</span>
                )}
              </button>
            ))}
            <button
              onClick={() => refetch()}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              {loadingBookings ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading your bookings...
                </div>
              ) : !myBookings?.length ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-20" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No bookings yet</h3>
                  <p className="text-gray-400 mb-6">You haven't booked any demo classes yet. Once EduNest matches you with a tutor, your demo class will appear here.</p>
                  <Link href="/nearby-tutors" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                    <MapPin size={18} /> Find Tutors Near Me
                  </Link>
                </div>
              ) : (
                myBookings.map(bk => {
                  const cfg = BOOKING_STATUS_CONFIG[bk.status] ?? BOOKING_STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={bk.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                        {bk.tutorName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{bk.tutorName}</h3>
                            <div className="flex items-center gap-3 flex-wrap mt-1">
                              <span className="flex items-center gap-1 text-sm text-gray-500"><BookOpen size={13} /> {bk.subject}</span>
                              <span className="flex items-center gap-1 text-sm text-gray-500"><GraduationCap size={13} /> {bk.grade}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{bk.mode.replace("_", " ")}</span>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <StatusIcon size={12} /> {cfg.label}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-orange-400 flex-shrink-0" />
                            <span><strong>Date:</strong> {bk.preferredDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} className="text-orange-400 flex-shrink-0" />
                            <span><strong>Time:</strong> {bk.preferredTime}</span>
                          </div>
                          {bk.message && (
                            <div className="sm:col-span-2 text-sm text-gray-500 italic">"{bk.message}"</div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs text-gray-400">Booked on {formatDate(bk.createdAt)}</span>
                          {bk.status === "pending" && (
                            <a href={`https://wa.me/918618635627?text=Hi%2C%20I%20booked%20a%20demo%20with%20${encodeURIComponent(bk.tutorName)}%20on%20${encodeURIComponent(bk.preferredDate)}.%20Booking%20ID%3A%20${bk.id}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                              <Phone size={12} /> Follow up on WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Demo Scheduling Tab */}
          {activeTab === "demos" && (
            <div className="space-y-4">
              {slotsLoading ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <p className="text-gray-400">Loading demo slots...</p>
                </div>
              ) : !myDemoSlots?.length ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <CalendarCheck size={48} className="mx-auto mb-4 opacity-20" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No demo classes yet</h3>
                  <p className="text-gray-400 mb-6">Once EduNest confirms a demo class with a tutor, you can schedule the date and time here.</p>
                </div>
              ) : (
                myDemoSlots.map(slot => (
                  <div key={slot.id} className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            slot.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                            slot.status === "completed" ? "bg-green-100 text-green-700" :
                            slot.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {slot.status === "pending_schedule" ? "⏳ Awaiting Your Schedule" :
                             slot.status === "scheduled" ? "📅 Demo Confirmed ✓" :
                             slot.status === "completed" ? "🎓 Demo Completed" : "❌ Cancelled"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Tutor Profile #{slot.tutorProfileId} · {slot.mode === "online" ? "Online" : "Home Tuition"}</p>
                      </div>
                      {slot.scheduledDate && slot.scheduledTime && (
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{slot.scheduledDate}</p>
                          <p className="text-xs text-gray-500">{slot.scheduledTime}</p>
                        </div>
                      )}
                    </div>

                    {slot.status === "pending_schedule" && (
                      schedulingSlotId === slot.id ? (
                        <div className="space-y-3 p-4 rounded-xl" style={{ backgroundColor: "oklch(0.97 0.005 80)", border: "1px solid oklch(0.92 0.005 80)" }}>
                          <p className="text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>Pick a date and time for your demo class:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                              <input
                                type="date"
                                value={schedDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={e => setSchedDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Time *</label>
                              <input
                                type="time"
                                value={schedTime}
                                onChange={e => setSchedTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                            <input
                              type="text"
                              value={schedNotes}
                              onChange={e => setSchedNotes(e.target.value)}
                              placeholder="Any special requests or topics to cover..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => scheduleMutation.mutate({ slotId: slot.id, scheduledDate: schedDate, scheduledTime: schedTime, notes: schedNotes || undefined })}
                              disabled={!schedDate || !schedTime || scheduleMutation.isPending}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                              style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                            >
                              {scheduleMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CalendarCheck size={14} />}
                              Confirm Schedule
                            </button>
                            <button
                              onClick={() => setSchedulingSlotId(null)}
                              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSchedulingSlotId(slot.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                          style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                        >
                          <Calendar size={14} /> Pick Date & Time
                        </button>
                      )
                    )}

                    {slot.notes && slot.status !== "pending_schedule" && (
                      <p className="text-xs text-gray-500 mt-2">Note: {slot.notes}</p>
                    )}

                    {/* Post-demo proceed intent UI */}
                    {slot.status === "completed" && !(slot as any).studentProceedIntent && (
                      <div className="mt-4 p-4 rounded-xl border-2" style={{ borderColor: "oklch(0.88 0.12 50)", backgroundColor: "oklch(0.98 0.03 50)" }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                          🎓 Would you like to continue with this tutor?
                        </p>
                        <p className="text-xs mb-3 text-gray-500">
                          Let us know if you'd like to start regular classes with this tutor.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setProceedIntent.mutate({ slotId: slot.id, intent: "yes" })}
                            disabled={setProceedIntent.isPending}
                            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
                          >
                            {setProceedIntent.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : "✔ Yes, Proceed"}
                          </button>
                          <button
                            onClick={() => setProceedIntent.mutate({ slotId: slot.id, intent: "no" })}
                            disabled={setProceedIntent.isPending}
                            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all hover:bg-red-50"
                            style={{ borderColor: "#fca5a5", color: "#dc2626" }}
                          >
                            ✕ No Thanks
                          </button>
                        </div>
                      </div>
                    )}
                    {slot.status === "completed" && (slot as any).studentProceedIntent === "yes" && !(slot as any).tutorProceedIntent && (
                      <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700">⏳ You said Yes! Waiting for the tutor to respond...</p>
                      </div>
                    )}
                    {slot.status === "completed" && (slot as any).studentProceedIntent === "yes" && (slot as any).tutorProceedIntent === "yes" && (() => {
                      const confirmedMatch = myConfirmedMatches?.find((m: any) => m.demoSlotId === slot.id);
                      const isGotAClass = confirmedMatch?.classStatus === 'got_a_class';
                      return (
                      <div className={`mt-4 p-3 rounded-xl border ${isGotAClass ? 'bg-emerald-50 border-emerald-300' : 'bg-green-50 border-green-200'}`}>
                        <p className={`text-xs font-semibold ${isGotAClass ? 'text-emerald-700' : 'text-green-700'}`}>
                          {isGotAClass ? '🎓 Got a Class! EduNest has confirmed your class arrangement.' : '🎉 Great news! Both parties agreed. You\'ve got a class!'}
                        </p>
                        {isGotAClass && confirmedMatch?.paymentAmount && (
                          <p className="text-xs text-emerald-700 mt-1 font-semibold">💰 Monthly Fee: ₹{confirmedMatch.paymentAmount}</p>
                        )}
                        {/* Payment Status Icon */}
                        {(() => {
                          const log = mySessionLogs?.find((l: any) => l.studentProfileId === (slot as any).studentProfileId);
                          if (!log) return null;
                          return (
                            <div className="mt-3 border-t border-green-200 pt-3">
                              <p className="text-xs font-bold text-green-800 mb-2">💳 Payment Status</p>
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                  log.paymentStatus === 'payment_processed'
                                    ? 'bg-green-100 text-green-700'
                                    : log.paymentStatus === 'sheet_uploaded'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  <CreditCard size={13} />
                                  {log.paymentStatus === 'payment_processed' ? '✅ Payment Processed' :
                                   log.paymentStatus === 'sheet_uploaded' ? '⏳ Session Sheet Submitted — Payment Pending' :
                                   '⏳ Awaiting Session Sheet from Tutor'}
                                </span>
                                {/* View uploaded sheet */}
                                {log.uploadedSheetUrl && (
                                  <a
                                    href={log.uploadedSheetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                  >
                                    <ExternalLink size={13} /> View Session Sheet
                                  </a>
                                )}
                              </div>
                              {log.paymentStatus === 'payment_processed' && (
                                <p className="text-xs text-green-600 mt-1">✔️ EduNest has confirmed payment to your tutor. Thank you!</p>
                              )}
                            </div>
                          );
                            })()}
                      </div>
                      );
                    })()}
                    {slot.status === "completed" && (slot as any).studentProceedIntent === "no" && (
                      <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500">You chose not to continue. You can find another tutor in Find a Tutor.</p>
                      </div>
                    )}
                    {slot.status === "completed" && (slot as any).studentProceedIntent === "yes" && (slot as any).tutorProceedIntent === "no" && (
                      <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500">The tutor chose not to continue. EduNest will help you find another tutor.</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tutor Interests Tab */}
          {activeTab === "interests" && (
            <div className="space-y-4">
              {!approvedTutorInterests?.length ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No tutor interests yet</h3>
                  <p className="text-gray-400">When a tutor expresses interest in your requirement and EduNest approves it, you'll see it here to accept or decline.</p>
                </div>
              ) : (
                approvedTutorInterests.map((interest: any) => (
                  <div key={interest.id} className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                            Tutor Interest
                          </span>
                          {interest.adminApprovalStatus === 'admin_approved' && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                              ✔ EduNest Approved
                            </span>
                          )}
                        </div>
                        <p className="text-base font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                          {interest.tutorName ?? `Tutor #${interest.tutorProfileId}`}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {interest.tutorQualification && (
                            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-100">
                              <GraduationCap size={10} /> {interest.tutorQualification}
                            </span>
                          )}
                          {interest.tutorExperience && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                              <Clock size={10} /> {interest.tutorExperience}
                            </span>
                          )}
                          {interest.tutorMode && (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                              {interest.tutorMode === 'online' ? '💻 Online' : interest.tutorMode === 'home_tuition' ? '🏠 Home Tuition' : '🏠💻 Both'}
                            </span>
                          )}
                          {interest.tutorArea && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
                              <MapPin size={10} /> {interest.tutorArea}
                            </span>
                          )}
                        </div>
                        {interest.tutorSubjects && (
                          <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Subjects:</span> {interest.tutorSubjects}</p>
                        )}
                        {interest.tutorEducation && (
                          <p className="text-xs text-gray-500 mb-1"><span className="font-semibold">Education:</span> {interest.tutorEducation.split('\n')[0]}</p>
                        )}
                        {interest.message && (
                          <p className="text-sm text-gray-500 mb-1 italic">"{interest.message}"</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Received: {new Date(interest.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      {interest.status === 'pending' ? (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => respondToTutorInterest.mutate({ interestId: interest.id, response: 'accepted' })}
                            disabled={respondToTutorInterest.isPending}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
                          >
                            ✔ Accept
                          </button>
                          <button
                            onClick={() => respondToTutorInterest.mutate({ interestId: interest.id, response: 'declined' })}
                            disabled={respondToTutorInterest.isPending}
                            className="px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:bg-red-50"
                            style={{ borderColor: "#fca5a5", color: "#dc2626" }}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                          interest.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {interest.status === 'accepted' ? '✔ Accepted — Demo being scheduled' : '✕ Declined'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Classes Tab */}
          {activeTab === "classes" && (
            <div className="space-y-4">
              {!myConfirmedMatches?.length ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <GraduationCap size={48} className="mx-auto mb-4 opacity-20" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No confirmed classes yet</h3>
                  <p className="text-gray-400">Once both you and your tutor agree to proceed after a demo class, your confirmed class will appear here.</p>
                </div>
              ) : (
                myConfirmedMatches.map((match: any) => {
                  const isGotAClass = match.classStatus === 'got_a_class';
                  return (
                    <div key={match.id} className={`rounded-2xl shadow-sm border p-6 transition-all ${
                      isGotAClass
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
                        : 'bg-white border-gray-100'
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          {match.tutorPhoto ? (
                            <img src={match.tutorPhoto} alt={match.tutorName} className="w-12 h-12 rounded-full object-cover border-2 border-orange-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                              {(match.tutorName ?? 'T').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {match.tutorName ?? `Tutor #${match.tutorProfileId}`}
                            </h3>
                            <p className="text-xs text-gray-500">Tutor ID #{match.tutorProfileId}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                          isGotAClass
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {isGotAClass ? '🎓 Got a Class!' : '⏳ Awaiting Confirmation'}
                        </span>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {match.tutorSubjects && (
                          <div className="flex items-start gap-2">
                            <BookOpen size={14} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Subjects</p>
                              <p className="text-sm font-semibold text-gray-800">{match.tutorSubjects}</p>
                            </div>
                          </div>
                        )}
                        {match.tutorExperience && (
                          <div className="flex items-start gap-2">
                            <Clock size={14} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Experience</p>
                              <p className="text-sm font-semibold text-gray-800">{match.tutorExperience}</p>
                            </div>
                          </div>
                        )}
                        {match.tutorQualification && (
                          <div className="flex items-start gap-2">
                            <GraduationCap size={14} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Qualification</p>
                              <p className="text-sm font-semibold text-gray-800">{match.tutorQualification}</p>
                            </div>
                          </div>
                        )}
                        {(match.scheduledDate || match.demoMode) && (
                          <div className="flex items-start gap-2">
                            <Calendar size={14} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Demo Class</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {match.scheduledDate ? `${match.scheduledDate}${match.scheduledTime ? ` at ${match.scheduledTime}` : ''}` : 'Scheduled'}
                                {match.demoMode && <span className="ml-1 text-xs text-gray-500">({match.demoMode === 'online' ? 'Online' : match.demoMode === 'home_tuition' ? 'Home Tuition' : 'Home + Online'})</span>}
                              </p>
                            </div>
                          </div>
                        )}
                        {match.tutorArea && (
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Location</p>
                              <p className="text-sm font-semibold text-gray-800">{match.tutorArea}</p>
                            </div>
                          </div>
                        )}
                        {match.paymentAmount && (
                          <div className="flex items-start gap-2">
                            <CreditCard size={14} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Monthly Fee</p>
                              <p className="text-sm font-bold" style={{ color: "oklch(0.55 0.18 145)" }}>₹{match.paymentAmount}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Session log / payment status */}
                      {match.sessionLogId && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              match.paymentStatus === 'payment_processed'
                                ? 'bg-green-100 text-green-700'
                                : match.paymentStatus === 'sheet_uploaded'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              <CreditCard size={12} />
                              {match.paymentStatus === 'payment_processed' ? '✅ Payment Processed' :
                               match.paymentStatus === 'sheet_uploaded' ? '⏳ Session Sheet Submitted — Payment Pending' :
                               '⏳ Awaiting Session Sheet from Tutor'}
                            </span>
                            {match.uploadedSheetUrl && (
                              <a
                                href={match.uploadedSheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                <ExternalLink size={12} /> View Session Sheet
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Matched date */}
                      <p className="text-xs text-gray-400 mt-3">
                        Matched on {new Date(match.matchedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* My Requirement Tab */}
          {activeTab === "requirement" && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-800 text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>My Tuition Requirement</h2>
                {myProfile && !editingReq && (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Edit2 size={14} /> Edit Requirement
                  </button>
                )}
              </div>

              {!myProfile ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 opacity-20" style={{ color: "oklch(0.68 0.18 50)" }} />
                  <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No requirement submitted yet</h3>
                  <p className="text-gray-400 mb-6">Complete your student profile to get matched with the right tutor near you.</p>
                  <Link href="/student-setup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                    <GraduationCap size={18} /> Complete My Profile
                  </Link>
                </div>
              ) : editingReq ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Your Name" },
                      { key: "phone", label: "Phone Number" },
                      { key: "grade", label: "Grade / Class" },
                      { key: "subjects", label: "Subjects Needed" },
                      { key: "demoTime", label: "Preferred Demo Time" },
                      { key: "regularTime", label: "Regular Class Time" },
                      { key: "sessionsPerWeek", label: "Sessions per Week", type: "number" },
                      { key: "sessionDuration", label: "Session Duration (mins)", type: "number" },
                      { key: "budget", label: "Monthly Budget (₹)", type: "number" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{label}</label>
                        <input
                          type={type ?? "text"}
                          value={reqForm[key] ?? ""}
                          onChange={e => setReqForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Board</label>
                      <select
                        value={reqForm.board ?? ""}
                        onChange={e => setReqForm(f => ({ ...f, board: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Teaching Mode</label>
                      <select
                        value={reqForm.mode ?? ""}
                        onChange={e => setReqForm(f => ({ ...f, mode: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        <option value="home_tuition">Home Tuition</option>
                        <option value="online">Online</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Special Requirements</label>
                    <textarea
                      value={reqForm.specialRequirements ?? ""}
                      onChange={e => setReqForm(f => ({ ...f, specialRequirements: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveEdit}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                      style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                    >
                      <Save size={16} /> {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditingReq(false)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Requirement details display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Name", value: myProfile.name },
                      { label: "Phone", value: myProfile.phone },
                      { label: "Grade", value: myProfile.grade },
                      { label: "Board", value: myProfile.board },
                      { label: "Subjects", value: myProfile.subjects },
                      { label: "Mode", value: myProfile.mode?.replace("_", " ") },
                      { label: "Demo Time", value: myProfile.demoTime },
                      { label: "Regular Time", value: myProfile.regularTime },
                      { label: "Sessions/Week", value: myProfile.sessionsPerWeek ? String(myProfile.sessionsPerWeek) : undefined },
                      { label: "Session Duration", value: myProfile.sessionDuration ? `${myProfile.sessionDuration} mins` : undefined },
                      { label: "Monthly Budget", value: myProfile.budget ? `₹${myProfile.budget}` : undefined },
                      { label: "Area", value: myProfile.area },
                    ].filter(item => item.value).map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                        <div className="text-sm font-semibold text-gray-700 capitalize">{value}</div>
                      </div>
                    ))}
                  </div>
                  {myProfile.specialRequirements && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Special Requirements</div>
                      <div className="text-sm text-gray-700">{myProfile.specialRequirements}</div>
                    </div>
                  )}
                  <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#22c55e18" }}>
                      <CheckCircle2 size={16} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</div>
                      <div className="text-sm font-semibold" style={{ color: "#16a34a" }}>Active — Visible to tutors</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="font-bold text-gray-800 text-xl mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>My Profile</h2>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                  {(user.name ?? "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{user.name ?? "Student"}</h3>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1"><Mail size={14} /> {user.email ?? "No email"}</p>
                  <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700 capitalize">{user.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Total Bookings", value: myBookings?.length ?? 0 },
                  { label: "Pending",        value: pendingCount },
                  { label: "Completed",      value: completedCount },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
                    <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)" }}>{value}</div>
                    <div className="text-sm text-gray-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                  <Home size={16} /> Go to Home
                </Link>
                <Link href="/contact" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                  <Mail size={16} /> Contact EduNest Support
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
