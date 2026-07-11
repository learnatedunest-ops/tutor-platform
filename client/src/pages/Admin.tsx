/**
 * EduNest Admin Dashboard
 * Protected route — requires Manus login + admin role
 * Tabs: Contact Inquiries | Tutor Applications | Demo Bookings | Manage Tutors
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import {
  Users, BookOpen, Mail, Phone, MapPin, Clock,
  CheckCircle2, XCircle, MessageSquare, GraduationCap,
  RefreshCw, LogOut, ShieldAlert, Plus, Pencil, Trash2, UserCheck, Gift,
} from "lucide-react";

type InquiryStatus = "new" | "contacted" | "resolved";
type ApplicationStatus = "pending" | "approved" | "rejected";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type TutorMode = "home_tuition" | "online" | "both";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const EMPTY_TUTOR = {
  name: "", email: "", phone: "", photo: "", subjects: "",
  qualification: "", experience: "", area: "", areas: "",
  mode: "both" as TutorMode, rating: "4.5", reviewCount: 0,
  bio: "", languages: "English, Kannada", boards: "CBSE, ICSE",
  isVerified: "yes" as "yes" | "no", isActive: "yes" as "yes" | "no",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"inquiries" | "bookings" | "tutors" | "referrals" | "tutorProfiles" | "studentProfiles" | "interests" | "demoInterests" | "demoSlots" | "confirmedMatches">("inquiries");
  const [tutorForm, setTutorForm] = useState<typeof EMPTY_TUTOR>(EMPTY_TUTOR);
  const [editingTutorId, setEditingTutorId] = useState<number | null>(null);
  const [showTutorForm, setShowTutorForm] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "admin";

  // Fetch data
  const { data: adminTutors, isLoading: loadingTutors, refetch: refetchTutors } =
    trpc.tutor.listAdmin.useQuery(undefined, { enabled: isAdmin });
  const { data: inquiries, isLoading: loadingInquiries, refetch: refetchInquiries } =
    trpc.inquiry.list.useQuery(undefined, { enabled: isAdmin });
  // Student Profiles (self-registered) — must be declared before any early returns
  const { data: studentProfilesList, isLoading: loadingStudentProfiles, refetch: refetchStudentProfiles } =
    trpc.studentProfile.listAll.useQuery(undefined, { enabled: isAdmin });
  const { data: bookings, isLoading: loadingBookings, refetch: refetchBookings } =
    trpc.demoBooking.list.useQuery(undefined, { enabled: isAdmin });

  // Mutations
  const updateInquiryStatus = trpc.inquiry.updateStatus.useMutation({
    onSuccess: () => { refetchInquiries(); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });
  const updateBookingStatus = trpc.demoBooking.updateStatus.useMutation({
    onSuccess: () => { refetchBookings(); toast.success("Booking status updated"); },
    onError: () => toast.error("Failed to update booking status"),
  });
  // (Tutor Applications removed — use Tutor Profiles tab instead)
  const createTutor = trpc.tutor.create.useMutation({
    onSuccess: () => { refetchTutors(); setShowTutorForm(false); setTutorForm(EMPTY_TUTOR); setEditingTutorId(null); toast.success("Tutor added!"); },
    onError: () => toast.error("Failed to add tutor"),
  });
  const updateTutorMutation = trpc.tutor.update.useMutation({
    onSuccess: () => { refetchTutors(); setShowTutorForm(false); setTutorForm(EMPTY_TUTOR); setEditingTutorId(null); toast.success("Tutor updated!"); },
    onError: () => toast.error("Failed to update tutor"),
  });
  const deleteTutorMutation = trpc.tutor.delete.useMutation({
    onSuccess: () => { refetchTutors(); toast.success("Tutor deleted"); },
    onError: () => toast.error("Failed to delete tutor"),
  });

  // (Student Requirements removed — use Student Profiles tab instead)

  // Referrals — must be declared before any early returns (Rules of Hooks)
  const { data: referrals, isLoading: loadingReferrals, refetch: refetchReferrals } =
    trpc.referral.list.useQuery(undefined, { enabled: isAdmin });
  const updateReferralStatus = trpc.referral.updateStatus.useMutation({
    onSuccess: () => { refetchReferrals(); toast.success("Referral status updated"); },
    onError: () => toast.error("Failed to update referral status"),
  });

  // Tutor Profiles (self-registered) — must be declared before any early returns
  const { data: tutorProfiles, isLoading: loadingTutorProfiles, refetch: refetchTutorProfiles } =
    trpc.tutorProfile.listAll.useQuery(undefined, { enabled: isAdmin });
  const updateTutorProfileStatus = trpc.tutorProfile.updateStatus.useMutation({
    onSuccess: () => { refetchTutorProfiles(); toast.success("Tutor profile status updated"); },
    onError: () => toast.error("Failed to update tutor profile status"),
  });

  // Tutor Interests (Express Interest records) — must be before early returns
  const { data: tutorInterestsList, isLoading: loadingInterests, refetch: refetchInterests } =
    trpc.tutorInterest.list.useQuery(undefined, { enabled: isAdmin });
  const updateInterestStatus = trpc.tutorInterest.updateStatus.useMutation({
    onSuccess: () => { refetchInterests(); toast.success("Interest status updated"); },
    onError: () => toast.error("Failed to update interest status"),
  });

  // Student Demo Interests — must be before early returns
  const { data: studentDemoInterestsList, isLoading: loadingDemoInterests, refetch: refetchDemoInterests } =
    trpc.studentDemoInterest.listAll.useQuery(undefined, { enabled: isAdmin });
  const updateDemoInterestStatus = trpc.studentDemoInterest.updateStatus.useMutation({
    onSuccess: () => { refetchDemoInterests(); toast.success("Demo interest status updated"); },
    onError: () => toast.error("Failed to update demo interest status"),
  });

  // Demo Slots (scheduled demo classes) — must be before early returns
  const { data: demoSlotsList, isLoading: loadingDemoSlots, refetch: refetchDemoSlots } =
    trpc.demoSlot.listAll.useQuery(undefined, { enabled: isAdmin });
  const updateDemoSlotStatusMutation = trpc.demoSlot.updateStatus.useMutation({
    onSuccess: () => { refetchDemoSlots(); toast.success("Demo slot status updated"); },
    onError: () => toast.error("Failed to update demo slot status"),
  });

  // Confirmed Matches — must be before early returns
  const { data: confirmedMatchesList, isLoading: loadingMatches, refetch: refetchMatches } =
    trpc.confirmedMatch.listAll.useQuery(undefined, { enabled: isAdmin });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <ShieldAlert size={48} className="mx-auto mb-4" style={{ color: "oklch(0.68 0.18 50)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Admin Access Required
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Please log in with your EduNest admin account to access the dashboard.
          </p>
          <button
            onClick={() => startLogin()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            Log In with Manus
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <XCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Access Denied
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Your account does not have admin privileges. Please contact the site owner.
          </p>
          <button onClick={() => logout()} className="w-full py-3 rounded-xl font-bold text-white bg-gray-700 transition-all hover:bg-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  const newInquiries = inquiries?.filter(i => i.status === "new").length ?? 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length ?? 0;
  const activeTutors = adminTutors?.filter(t => t.isActive === "yes").length ?? 0;
  const pendingReferrals = referrals?.filter((r: { status: string }) => r.status === "pending").length ?? 0;
  const pendingTutorProfiles = tutorProfiles?.filter((p: { status: string }) => p.status === "pending").length ?? 0;
  const pendingInterests = tutorInterestsList?.filter((i: { status: string }) => i.status === "pending").length ?? 0;
  const pendingDemoInterests = studentDemoInterestsList?.filter((d: { status: string }) => d.status === "pending").length ?? 0;
  const pendingDemoSlots = demoSlotsList?.filter((s: { status: string }) => s.status === "pending_schedule").length ?? 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/manus-storage/edunest-logo-v3_f012b9fe.png" alt="EduNest" className="w-8 h-8 object-contain" />
            <div>
              <span className="text-lg font-extrabold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)" }}>
                Edu<span style={{ color: "oklch(0.14 0.02 270)" }}>Nest</span>
              </span>
              <span className="ml-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">Welcome, <strong>{user.name ?? "Admin"}</strong></span>
            <button onClick={() => logout()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              <LogOut size={16} /><span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total Inquiries", value: inquiries?.length ?? 0, icon: MessageSquare, color: "oklch(0.68 0.18 50)" },
            { label: "New Inquiries", value: newInquiries, icon: Mail, color: "#3b82f6" },
            { label: "Tutor Profiles", value: tutorProfiles?.length ?? 0, icon: GraduationCap, color: "oklch(0.14 0.02 270)" },
            { label: "Pending Tutors", value: pendingTutorProfiles, icon: Clock, color: "#f59e0b" },
            { label: "Demo Bookings", value: bookings?.length ?? 0, icon: BookOpen, color: "#22c55e" },
            { label: "Active Tutors", value: activeTutors, icon: UserCheck, color: "#8b5cf6" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>{value}</div>
                <div className="text-xs text-gray-500 font-medium leading-tight">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["inquiries", "bookings", "tutors", "referrals", "tutorProfiles", "studentProfiles", "interests", "demoInterests", "demoSlots", "confirmedMatches"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? "text-white shadow-sm" : "bg-white text-gray-500 hover:text-gray-700"}`}
              style={activeTab === tab ? { backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" } : { fontFamily: "'Poppins', sans-serif" }}
            >
              {tab === "inquiries" ? (
                <span className="flex items-center gap-2"><MessageSquare size={15} /> Contact Inquiries {newInquiries > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{newInquiries}</span>}</span>
              ) : tab === "bookings" ? (
                <span className="flex items-center gap-2"><BookOpen size={15} /> Demo Bookings {pendingBookings > 0 && <span className="bg-white text-green-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingBookings}</span>}</span>
              ) : tab === "referrals" ? (
                <span className="flex items-center gap-2"><Gift size={15} /> Referrals {pendingReferrals > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingReferrals}</span>}</span>
              ) : tab === "tutorProfiles" ? (
                <span className="flex items-center gap-2"><GraduationCap size={15} /> Tutor Profiles {pendingTutorProfiles > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingTutorProfiles}</span>}</span>
              ) : tab === "studentProfiles" ? (
                <span className="flex items-center gap-2"><Users size={15} /> Student Profiles <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "studentProfiles" ? "bg-white/30" : "bg-gray-100 text-gray-600"}`}>{studentProfilesList?.length ?? 0}</span></span>
              ) : tab === "interests" ? (
                <span className="flex items-center gap-2"><CheckCircle2 size={15} /> Tutor Interests {pendingInterests > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingInterests}</span>}</span>
              ) : tab === "demoInterests" ? (
                <span className="flex items-center gap-2"><BookOpen size={15} /> Demo Requests {pendingDemoInterests > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingDemoInterests}</span>}</span>
              ) : tab === "demoSlots" ? (
                <span className="flex items-center gap-2"><Clock size={15} /> Demo Slots {pendingDemoSlots > 0 && <span className="bg-white text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingDemoSlots}</span>}</span>
              ) : tab === "confirmedMatches" ? (
                <span className="flex items-center gap-2"><CheckCircle2 size={15} /> Confirmed Matches <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "confirmedMatches" ? "bg-white/30" : "bg-gray-100 text-gray-600"}`}>{confirmedMatchesList?.length ?? 0}</span></span>
              ) : (
                <span className="flex items-center gap-2"><UserCheck size={15} /> Manage Tutors <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "tutors" ? "bg-white/30" : "bg-gray-100"}`}>{adminTutors?.length ?? 0}</span></span>
              )}
            </button>
          ))}
          <button
            onClick={() => { refetchInquiries(); refetchBookings(); refetchTutors(); refetchReferrals(); refetchTutorProfiles(); refetchStudentProfiles(); refetchInterests(); refetchDemoInterests(); refetchDemoSlots(); refetchMatches(); }}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* ── Tutors Management ── */}
        {activeTab === "tutors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Manage Tutors ({adminTutors?.length ?? 0})
              </h2>
              <button
                onClick={() => { setTutorForm(EMPTY_TUTOR); setEditingTutorId(null); setShowTutorForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
              >
                <Plus size={15} /> Add Tutor
              </button>
            </div>

            {showTutorForm && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {editingTutorId ? "Edit Tutor" : "Add New Tutor"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {([
                    { key: "name", label: "Full Name *", placeholder: "e.g. Priya Sharma" },
                    { key: "subjects", label: "Subjects *", placeholder: "e.g. Mathematics, Physics" },
                    { key: "qualification", label: "Qualification *", placeholder: "e.g. B.Tech IIT Bombay" },
                    { key: "experience", label: "Experience *", placeholder: "e.g. 5 years" },
                    { key: "area", label: "Primary Area *", placeholder: "e.g. Koramangala" },
                    { key: "areas", label: "All Areas", placeholder: "e.g. Koramangala, Indiranagar" },
                    { key: "email", label: "Email", placeholder: "tutor@email.com" },
                    { key: "phone", label: "Phone", placeholder: "+91 9876543210" },
                    { key: "photo", label: "Photo URL", placeholder: "https://..." },
                    { key: "rating", label: "Rating", placeholder: "4.5" },
                    { key: "languages", label: "Languages", placeholder: "English, Kannada" },
                    { key: "boards", label: "Boards", placeholder: "CBSE, ICSE" },
                  ] as { key: keyof typeof EMPTY_TUTOR; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                      <input
                        type="text"
                        value={String(tutorForm[key] ?? "")}
                        onChange={e => setTutorForm(f => ({ ...f, [key]: key === "reviewCount" ? Number(e.target.value) : e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mode</label>
                    <select value={tutorForm.mode} onChange={e => setTutorForm(f => ({ ...f, mode: e.target.value as TutorMode }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                      <option value="both">Home + Online</option>
                      <option value="home_tuition">Home Tuition Only</option>
                      <option value="online">Online Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Verified</label>
                    <select value={tutorForm.isVerified} onChange={e => setTutorForm(f => ({ ...f, isVerified: e.target.value as "yes" | "no" }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Active</label>
                    <select value={tutorForm.isActive} onChange={e => setTutorForm(f => ({ ...f, isActive: e.target.value as "yes" | "no" }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Bio</label>
                  <textarea
                    value={tutorForm.bio}
                    onChange={e => setTutorForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Short bio about the tutor..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => {
                      if (!tutorForm.name || !tutorForm.subjects || !tutorForm.qualification || !tutorForm.experience || !tutorForm.area) {
                        toast.error("Please fill in all required fields"); return;
                      }
                      const payload = { ...tutorForm, photo: tutorForm.photo || undefined, email: tutorForm.email || undefined, phone: tutorForm.phone || undefined };
                      if (editingTutorId) { updateTutorMutation.mutate({ id: editingTutorId, ...payload }); }
                      else { createTutor.mutate(payload); }
                    }}
                    disabled={createTutor.isPending || updateTutorMutation.isPending}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {createTutor.isPending || updateTutorMutation.isPending ? "Saving..." : editingTutorId ? "Update Tutor" : "Add Tutor"}
                  </button>
                  <button
                    onClick={() => { setShowTutorForm(false); setTutorForm(EMPTY_TUTOR); setEditingTutorId(null); }}
                    className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold transition-all hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {loadingTutors ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading tutors...
                </div>
              ) : !adminTutors?.length ? (
                <div className="p-12 text-center text-gray-400">
                  <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No tutors added yet. Click "Add Tutor" to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        {["#", "Name", "Subjects", "Area", "Experience", "Mode", "Rating", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {adminTutors.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-gray-400 font-mono text-xs">{t.id}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                                {t.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800 whitespace-nowrap">{t.name}</div>
                                {t.isVerified === "yes" && <div className="flex items-center gap-1 text-xs text-orange-500"><CheckCircle2 size={10} /> Verified</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600 max-w-32"><p className="line-clamp-2">{t.subjects}</p></td>
                          <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap"><div className="flex items-center gap-1"><MapPin size={11} /> {t.area}</div></td>
                          <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">{t.experience}</td>
                          <td className="px-4 py-4 text-xs text-gray-600 capitalize whitespace-nowrap">{t.mode.replace("_", " ")}</td>
                          <td className="px-4 py-4 text-xs font-semibold" style={{ color: "oklch(0.68 0.18 50)" }}>⭐ {t.rating}</td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${t.isActive === "yes" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                              {t.isActive === "yes" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setTutorForm({
                                    name: t.name, email: t.email ?? "", phone: t.phone ?? "", photo: t.photo ?? "",
                                    subjects: t.subjects, qualification: t.qualification, experience: t.experience,
                                    area: t.area, areas: t.areas ?? "", mode: t.mode, rating: t.rating,
                                    reviewCount: t.reviewCount, bio: t.bio ?? "", languages: t.languages ?? "",
                                    boards: t.boards ?? "", isVerified: t.isVerified, isActive: t.isActive,
                                  });
                                  setEditingTutorId(t.id);
                                  setShowTutorForm(true);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete tutor "${t.name}"? This cannot be undone.`)) {
                                    deleteTutorMutation.mutate({ id: t.id });
                                  }
                                }}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Delete"
                                disabled={deleteTutorMutation.isPending}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Contact Inquiries ── */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Contact Inquiries ({inquiries?.length ?? 0})
              </h2>
            </div>
            {loadingInquiries ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading inquiries...
              </div>
            ) : !inquiries?.length ? (
              <div className="p-12 text-center text-gray-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p>No inquiries yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Name", "Contact", "Role", "Subject / Area", "Message", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inquiries.map(inq => (
                      <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{inq.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{inq.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Mail size={11} /> {inq.email}</a>
                            <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs"><Phone size={11} /> {inq.phone}</a>
                          </div>
                        </td>
                        <td className="px-4 py-4"><span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{inq.role}</span></td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {inq.subject && <div className="flex items-center gap-1"><BookOpen size={11} /> {inq.subject}</div>}
                          {inq.area && <div className="flex items-center gap-1 text-gray-400"><MapPin size={11} /> {inq.area}</div>}
                        </td>
                        <td className="px-4 py-4 max-w-[200px]"><p className="text-gray-600 text-xs line-clamp-2">{inq.message}</p></td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(inq.createdAt)}</td>
                        <td className="px-4 py-4">
                          <select
                            value={inq.status}
                            onChange={e => updateInquiryStatus.mutate({ id: inq.id, status: e.target.value as InquiryStatus })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateInquiryStatus.isPending}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Demo Bookings ── */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Demo Class Bookings ({bookings?.length ?? 0})</h2>
            </div>
            {loadingBookings ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading bookings...
              </div>
            ) : !bookings?.length ? (
              <div className="p-12 text-center text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>No demo bookings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Student", "Contact", "Tutor", "Subject / Grade", "Schedule", "Mode", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map(bk => (
                      <tr key={bk.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{bk.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{bk.studentName}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${bk.studentEmail}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Mail size={11} /> {bk.studentEmail}</a>
                            <a href={`tel:${bk.studentPhone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs"><Phone size={11} /> {bk.studentPhone}</a>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-700 font-medium whitespace-nowrap">{bk.tutorName}</td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1"><BookOpen size={11} /> {bk.subject}</div>
                          <div className="text-gray-400 mt-0.5">{bk.grade}</div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-700">
                          <div className="font-semibold">{bk.preferredDate}</div>
                          <div className="text-gray-400 flex items-center gap-1"><Clock size={10} /> {bk.preferredTime}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{bk.mode.replace("_", " ")}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                            bk.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                            bk.status === "confirmed" ? "bg-blue-100 text-blue-700 border-blue-200" :
                            bk.status === "completed" ? "bg-green-100 text-green-700 border-green-200" :
                            "bg-red-100 text-red-700 border-red-200"
                          }`}>{bk.status}</span>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={bk.status}
                            onChange={e => updateBookingStatus.mutate({ id: bk.id, status: e.target.value as BookingStatus })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
                            disabled={updateBookingStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Student Profiles ── */}
        {activeTab === "studentProfiles" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Student Profiles — Self Registered ({studentProfilesList?.length ?? 0})</h2>
              <p className="text-xs text-gray-400 mt-0.5">Parents and students who signed up and completed their profile. Match them with approved tutors.</p>
            </div>
            {loadingStudentProfiles ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading student profiles...
              </div>
            ) : !studentProfilesList?.length ? (
              <div className="p-12 text-center text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold mb-1">No student profiles yet.</p>
                <p className="text-sm">When parents/students sign up and complete their profile, they'll appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Name", "Contact", "Role", "Grade / Board", "Subjects", "Mode", "Schedule", "Budget", "Location", "Registered"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentProfilesList.map((sp: {
                      id: number; name: string; email: string; phone: string; role: string;
                      studentName?: string | null; grade: string; board: string; subjects: string;
                      mode: string; demoTime?: string | null; regularTime?: string | null;
                      sessionsPerWeek?: string | null; budget?: string | null;
                      area?: string | null; fullAddress?: string | null; isActive: string;
                      createdAt: Date;
                    }) => (
                      <tr key={sp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{sp.id}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-800 whitespace-nowrap">{sp.name}</div>
                          {sp.studentName && <div className="text-xs text-gray-400">Student: {sp.studentName}</div>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${sp.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Mail size={11} /> {sp.email}</a>
                            <a href={`tel:${sp.phone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs"><Phone size={11} /> {sp.phone}</a>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            sp.role === "parent" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}>{sp.role}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          <div className="font-medium">{sp.grade}</div>
                          <div className="text-gray-400">{sp.board}</div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]"><p className="line-clamp-2">{sp.subjects}</p></td>
                        <td className="px-4 py-4 text-xs text-gray-600 capitalize whitespace-nowrap">{sp.mode.replace("_", " ")}</td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {sp.demoTime && <div>Demo: {sp.demoTime}</div>}
                          {sp.regularTime && <div>Regular: {sp.regularTime}</div>}
                          {sp.sessionsPerWeek && <div className="text-gray-400">{sp.sessionsPerWeek} sessions/wk</div>}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">{sp.budget ? `₹${sp.budget}` : "—"}</td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[160px]">
                          {sp.area && <div className="flex items-center gap-1"><MapPin size={11} /> {sp.area}</div>}
                          {sp.fullAddress && <p className="text-gray-400 line-clamp-2 mt-0.5">{sp.fullAddress}</p>}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(sp.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* ── Referrals ── */}
        {activeTab === "referrals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Referrals ({referrals?.length ?? 0})
              </h2>
            </div>
            {loadingReferrals ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !referrals?.length ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Gift size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400" style={{ fontFamily: "'Nunito', sans-serif" }}>No referrals yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Referrer", "Referee", "Code", "Status", "Discount", "Date", "Action"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {referrals.map((ref: { id: number; referrerName: string; referrerEmail: string; referrerPhone?: string | null; refereeName: string; refereeEmail: string; refereePhone?: string | null; referralCode: string; status: string; discountApplied: string; createdAt: Date | string }) => (
                      <tr key={ref.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-800 text-xs">{ref.referrerName}</div>
                          <div className="text-gray-400 text-xs">{ref.referrerEmail}</div>
                          {ref.referrerPhone && <div className="text-gray-400 text-xs">{ref.referrerPhone}</div>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-800 text-xs">{ref.refereeName}</div>
                          <div className="text-gray-400 text-xs">{ref.refereeEmail}</div>
                          {ref.refereePhone && <div className="text-gray-400 text-xs">{ref.refereePhone}</div>}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs font-bold tracking-wider px-2 py-1 rounded-lg" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)" }}>{ref.referralCode}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                            ref.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                            ref.status === "joined" ? "bg-blue-100 text-blue-700 border-blue-200" :
                            "bg-green-100 text-green-700 border-green-200"
                          }`}>{ref.status}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            ref.discountApplied === "yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>{ref.discountApplied === "yes" ? "Applied" : "Pending"}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(ref.createdAt)}</td>
                        <td className="px-4 py-4">
                          <select
                            value={ref.status}
                            onChange={e => updateReferralStatus.mutate({ id: ref.id, status: e.target.value as "pending" | "joined" | "rewarded", discountApplied: e.target.value === "rewarded" ? "yes" : undefined })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateReferralStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="joined">Joined</option>
                            <option value="rewarded">Rewarded</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tutor Profiles (Self-Registered) ── */}
        {activeTab === "tutorProfiles" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Tutor Profiles — Self Registered ({tutorProfiles?.length ?? 0})</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tutors who signed up and completed their profile. Approve to make them visible to students.</p>
            </div>
            {loadingTutorProfiles ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading tutor profiles...
              </div>
            ) : !tutorProfiles?.length ? (
              <div className="p-12 text-center text-gray-400">
                <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                <p>No tutor profiles submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Name", "Contact", "Qualification", "Subjects", "Experience", "Mode", "Location", "Education & Experience", "Status", "Submitted", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tutorProfiles.map((p: {
                      id: number; name: string; phone: string; email?: string | null;
                      qualification: string; subjects: string; experience: string;
                      mode: string; area?: string | null; latitude?: string | null; longitude?: string | null;
                      education?: string | null; workExperience?: string | null;
                      bio?: string | null; boards?: string | null; languages?: string | null;
                      status: string; createdAt: Date | string;
                    }) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{p.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{p.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Mail size={11} /> {p.email}</a>}
                            <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs"><Phone size={11} /> {p.phone}</a>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[120px]"><p className="line-clamp-2">{p.qualification}</p></td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]"><p className="line-clamp-2">{p.subjects}</p></td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">{p.experience}</td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap capitalize">{p.mode.replace("_", " ")}</td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]">
                          {p.area ? <p className="line-clamp-1">{p.area}</p> : (
                            p.latitude ? <span className="text-gray-400">{parseFloat(p.latitude).toFixed(4)}, {parseFloat(p.longitude ?? "0").toFixed(4)}</span> : <span className="text-gray-300">Not set</span>
                          )}
                        </td>
                        {/* Education & Work Experience — expandable */}
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[220px]">
                          {(p.education || p.workExperience) ? (
                            <details className="group">
                              <summary className="cursor-pointer text-orange-600 font-semibold hover:text-orange-700 list-none flex items-center gap-1 select-none">
                                <span className="group-open:hidden">▶ View</span>
                                <span className="hidden group-open:inline">▼ Hide</span>
                              </summary>
                              <div className="mt-2 space-y-2">
                                {p.education && (
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">Education</p>
                                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{p.education}</p>
                                  </div>
                                )}
                                {p.workExperience && (
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-0.5">Work Experience</p>
                                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{p.workExperience}</p>
                                  </div>
                                )}
                              </div>
                            </details>
                          ) : (
                            <span className="text-gray-300">Not provided</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-4">
                          <select
                            value={p.status}
                            onChange={e => updateTutorProfileStatus.mutate({ id: p.id, status: e.target.value as "pending" | "approved" | "rejected" })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateTutorProfileStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tutor Interests ── */}
        {activeTab === "interests" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Tutor Interests ({tutorInterestsList?.length ?? 0})</h2>
              <p className="text-xs text-gray-400 mt-0.5">Approved tutors who expressed interest in student requirements. Accept to connect them.</p>
            </div>
            {loadingInterests ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading interests...
              </div>
            ) : !tutorInterestsList?.length ? (
              <div className="p-12 text-center text-gray-400">
                <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
                <p>No tutor interests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Tutor Profile ID", "Student Profile ID", "Message", "Status", "Submitted", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tutorInterestsList.map((interest: {
                      id: number; tutorProfileId: number; studentProfileId: number;
                      message?: string | null; status: string; createdAt: Date | string;
                    }) => (
                      <tr key={interest.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{interest.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-800">
                          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg font-mono">Tutor #{interest.tutorProfileId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-mono">Student #{interest.studentProfileId}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[200px]">
                          {interest.message ? <p className="line-clamp-2">{interest.message}</p> : <span className="text-gray-300">No message</span>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                            interest.status === "accepted" ? "bg-green-50 text-green-700 border-green-200" :
                            interest.status === "declined" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>{interest.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(interest.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <select
                            value={interest.status}
                            onChange={e => updateInterestStatus.mutate({ id: interest.id, status: e.target.value as "pending" | "accepted" | "declined" })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateInterestStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* ── Demo Slots Tab ── */}
        {activeTab === "demoSlots" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Demo Class Slots ({demoSlotsList?.length ?? 0})
              </h2>
              <p className="text-sm text-gray-500">Confirmed demo requests become slots. Students schedule them; tutors see them on their dashboard.</p>
            </div>
            {loadingDemoSlots ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !demoSlotsList || demoSlotsList.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Clock size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                <p className="text-gray-500 font-medium">No demo slots yet</p>
                <p className="text-sm text-gray-400 mt-1">Confirm a demo request in the "Demo Requests" tab to create a slot</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor Profile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.005 80)" }}>
                    {(demoSlotsList as Array<{ id: number; studentProfileId: number; tutorProfileId: number; mode: string; scheduledDate?: string | null; scheduledTime?: string | null; notes?: string | null; status: string; createdAt: Date | number }>).map((slot) => (
                      <tr key={slot.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-4 font-semibold text-gray-400 text-xs">#{slot.id}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <Users size={11} /> #{slot.studentProfileId}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <GraduationCap size={11} /> #{slot.tutorProfileId}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 capitalize">{slot.mode.replace("_", " ")}</td>
                        <td className="px-4 py-4 text-gray-700 font-medium">
                          {slot.scheduledDate ? (
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" />{slot.scheduledDate}</span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Not scheduled yet</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-600">{slot.scheduledTime ?? <span className="text-gray-400 italic text-xs">—</span>}</td>
                        <td className="px-4 py-4 text-gray-500 max-w-[160px] truncate">{slot.notes ?? <span className="text-gray-300 italic text-xs">—</span>}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            slot.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                            slot.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                            slot.status === "scheduled" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>{slot.status.replace("_", " ")}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(slot.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-4">
                          <select
                            value={slot.status}
                            onChange={e => updateDemoSlotStatusMutation.mutate({ id: slot.id, status: e.target.value as "pending_schedule" | "scheduled" | "completed" | "cancelled" })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                            disabled={updateDemoSlotStatusMutation.isPending}
                          >
                            <option value="pending_schedule">Pending Schedule</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Student Demo Interests Tab ── */}
        {activeTab === "demoInterests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Student Demo Requests ({studentDemoInterestsList?.length ?? 0})
              </h2>
            </div>
            {loadingDemoInterests ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !studentDemoInterestsList || studentDemoInterestsList.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                <p className="text-gray-500 font-medium">No demo requests yet</p>
                <p className="text-sm text-gray-400 mt-1">Students who click "Book Free Demo Class" will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor Profile ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.005 80)" }}>
                    {studentDemoInterestsList.map((demo: { id: number; studentProfileId: number; tutorProfileId: number; message?: string | null; status: string; createdAt: Date | number }) => (
                      <tr key={demo.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-4 font-semibold text-gray-800">#{demo.studentProfileId}</td>
                        <td className="px-4 py-4 text-gray-600">#{demo.tutorProfileId}</td>
                        <td className="px-4 py-4 text-gray-600 max-w-xs truncate">{demo.message || <span className="text-gray-400 italic">No message</span>}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            demo.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200" :
                            demo.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>{demo.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(demo.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <select
                            value={demo.status}
                            onChange={e => updateDemoInterestStatus.mutate({ id: demo.id, status: e.target.value as "pending" | "confirmed" | "cancelled" })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateDemoInterestStatus.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      {/* ── Confirmed Matches Tab ── */}
        {activeTab === "confirmedMatches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Confirmed Matches ({confirmedMatchesList?.length ?? 0})
              </h2>
              <p className="text-sm text-gray-500">Both tutor and student/parent agreed to proceed. Contact details have been shared via email.</p>
            </div>
            {loadingMatches ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !confirmedMatchesList || confirmedMatchesList.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.55 0.18 145)" }} />
                <p className="text-gray-500 font-medium">No confirmed matches yet</p>
                <p className="text-sm text-gray-400 mt-1">When both tutor and student/parent agree to proceed after a demo, the match will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {confirmedMatchesList.map((match: any) => (
                  <div key={match.id} className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "oklch(0.88 0.12 145)" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">🎉 Confirmed Match #{match.id}</span>
                      <span className="text-xs text-gray-400">{new Date(match.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="text-xs text-gray-400 ml-auto">Demo Slot #{match.demoSlotId}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tutor Details */}
                      <div className="p-4 rounded-xl border" style={{ borderColor: "oklch(0.92 0.005 80)", backgroundColor: "oklch(0.98 0.005 80)" }}>
                        <h3 className="font-bold text-sm mb-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>👨‍🏫 Tutor Details</h3>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Profile ID</span><span className="font-semibold">#{match.tutorProfileId}</span></div>
                          {match.tutorName && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Name</span><span className="font-semibold">{match.tutorName}</span></div>}
                          {match.tutorEmail && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Email</span><a href={`mailto:${match.tutorEmail}`} className="font-semibold text-blue-600 hover:underline">{match.tutorEmail}</a></div>}
                          {match.tutorPhone && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Phone</span><a href={`tel:${match.tutorPhone}`} className="font-semibold text-green-700">{match.tutorPhone}</a></div>}
                        </div>
                      </div>
                      {/* Student/Parent Details */}
                      <div className="p-4 rounded-xl border" style={{ borderColor: "oklch(0.92 0.005 80)", backgroundColor: "oklch(0.98 0.005 80)" }}>
                        <h3 className="font-bold text-sm mb-3" style={{ color: "oklch(0.55 0.18 270)", fontFamily: "'Poppins', sans-serif" }}>👨‍👧 Student / Parent Details</h3>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Profile ID</span><span className="font-semibold">#{match.studentProfileId}</span></div>
                          {match.studentName && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Name</span><span className="font-semibold">{match.studentName}</span></div>}
                          {match.studentEmail && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Email</span><a href={`mailto:${match.studentEmail}`} className="font-semibold text-blue-600 hover:underline">{match.studentEmail}</a></div>}
                          {match.studentPhone && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Phone</span><a href={`tel:${match.studentPhone}`} className="font-semibold text-green-700">{match.studentPhone}</a></div>}
                          {match.studentArea && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Area</span><span>{match.studentArea}</span></div>}
                          {match.studentGrade && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Grade</span><span>{match.studentGrade}</span></div>}
                          {match.studentSubjects && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Subjects</span><span>{match.studentSubjects}</span></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
