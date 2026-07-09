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
  const [activeTab, setActiveTab] = useState<"inquiries" | "applications" | "bookings" | "tutors" | "requirements" | "referrals">("inquiries");
  const [tutorForm, setTutorForm] = useState<typeof EMPTY_TUTOR>(EMPTY_TUTOR);
  const [editingTutorId, setEditingTutorId] = useState<number | null>(null);
  const [showTutorForm, setShowTutorForm] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "admin";

  // Fetch data
  const { data: adminTutors, isLoading: loadingTutors, refetch: refetchTutors } =
    trpc.tutor.listAdmin.useQuery(undefined, { enabled: isAdmin });
  const { data: inquiries, isLoading: loadingInquiries, refetch: refetchInquiries } =
    trpc.inquiry.list.useQuery(undefined, { enabled: isAdmin });
  const { data: applications, isLoading: loadingApps, refetch: refetchApps } =
    trpc.tutorApplication.list.useQuery(undefined, { enabled: isAdmin });
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
  const updateAppStatus = trpc.tutorApplication.updateStatus.useMutation({
    onSuccess: () => { refetchApps(); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });
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
  const pendingApps = applications?.filter(a => a.status === "pending").length ?? 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length ?? 0;
  const activeTutors = adminTutors?.filter(t => t.isActive === "yes").length ?? 0;

  // Student requirements
  const { data: requirements, isLoading: loadingRequirements, refetch: refetchRequirements } =
    trpc.studentRequirement.list.useQuery(undefined, { enabled: isAdmin });
  const updateRequirementStatus = trpc.studentRequirement.updateStatus.useMutation({
    onSuccess: () => { refetchRequirements(); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });
  const newRequirements = requirements?.filter((r: { status: string }) => r.status === "new").length ?? 0;

  // Referrals
  const { data: referrals, isLoading: loadingReferrals, refetch: refetchReferrals } =
    trpc.referral.list.useQuery(undefined, { enabled: isAdmin });
  const updateReferralStatus = trpc.referral.updateStatus.useMutation({
    onSuccess: () => { refetchReferrals(); toast.success("Referral status updated"); },
    onError: () => toast.error("Failed to update referral status"),
  });
  const pendingReferrals = referrals?.filter((r: { status: string }) => r.status === "pending").length ?? 0;

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
            { label: "Applications", value: applications?.length ?? 0, icon: GraduationCap, color: "oklch(0.14 0.02 270)" },
            { label: "Pending Apps", value: pendingApps, icon: Clock, color: "#f59e0b" },
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
          {(["inquiries", "applications", "bookings", "requirements", "tutors", "referrals"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? "text-white shadow-sm" : "bg-white text-gray-500 hover:text-gray-700"}`}
              style={activeTab === tab ? { backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" } : { fontFamily: "'Poppins', sans-serif" }}
            >
              {tab === "inquiries" ? (
                <span className="flex items-center gap-2"><MessageSquare size={15} /> Contact Inquiries {newInquiries > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{newInquiries}</span>}</span>
              ) : tab === "applications" ? (
                <span className="flex items-center gap-2"><GraduationCap size={15} /> Tutor Applications {pendingApps > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingApps}</span>}</span>
              ) : tab === "bookings" ? (
                <span className="flex items-center gap-2"><BookOpen size={15} /> Demo Bookings {pendingBookings > 0 && <span className="bg-white text-green-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingBookings}</span>}</span>
              ) : tab === "requirements" ? (
                <span className="flex items-center gap-2"><Users size={15} /> Student Requirements {newRequirements > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{newRequirements}</span>}</span>
              ) : tab === "referrals" ? (
                <span className="flex items-center gap-2"><Gift size={15} /> Referrals {pendingReferrals > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingReferrals}</span>}</span>
              ) : (
                <span className="flex items-center gap-2"><UserCheck size={15} /> Manage Tutors <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "tutors" ? "bg-white/30" : "bg-gray-100"}`}>{adminTutors?.length ?? 0}</span></span>
              )}
            </button>
          ))}
          <button
            onClick={() => { refetchInquiries(); refetchApps(); refetchBookings(); refetchTutors(); refetchRequirements(); refetchReferrals(); }}
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

        {/* ── Tutor Applications ── */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Tutor Applications ({applications?.length ?? 0})</h2>
            </div>
            {loadingApps ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading applications...
              </div>
            ) : !applications?.length ? (
              <div className="p-12 text-center text-gray-400">
                <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                <p>No tutor applications yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Name", "Contact", "Qualification", "Subjects", "Experience", "Area / Mode", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{app.id}</td>
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{app.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${app.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Mail size={11} /> {app.email}</a>
                            <a href={`tel:${app.phone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs"><Phone size={11} /> {app.phone}</a>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]"><p className="line-clamp-2">{app.qualification}</p></td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]"><p className="line-clamp-2">{app.subjects}</p></td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">{app.experience}</td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1"><MapPin size={11} /> {app.area}</div>
                          <div className="text-gray-400 mt-0.5 capitalize">{app.mode.replace("_", " ")}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(app.createdAt)}</td>
                        <td className="px-4 py-4">
                          <select
                            value={app.status}
                            onChange={e => updateAppStatus.mutate({ id: app.id, status: e.target.value as ApplicationStatus })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateAppStatus.isPending}
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
        {/* ── Student Requirements ── */}
        {activeTab === "requirements" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Student Requirements ({requirements?.length ?? 0})
              </h2>
              <span className="text-xs text-gray-400">Match these with registered tutors from the Manage Tutors tab</span>
            </div>
            {loadingRequirements ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading requirements...
              </div>
            ) : !requirements?.length ? (
              <div className="p-12 text-center text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold mb-1">No requirements yet.</p>
                <p className="text-sm">When parents/students submit their tuition requirements, they'll appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["#", "Name", "Contact", "Role", "Grade / Board", "Subjects", "Area", "Mode", "Budget", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requirements.map((req: {
                      id: number; name: string; email: string; phone: string; role: string;
                      studentName?: string | null; grade: string; board: string; subjects: string;
                      area: string; mode: string; budget?: string | null; preferredTime?: string | null;
                      additionalNotes?: string | null; status: string; matchedTutorId?: number | null;
                      createdAt: Date;
                    }) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{req.id}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-800 whitespace-nowrap">{req.name}</div>
                          {req.studentName && <div className="text-xs text-gray-400">Student: {req.studentName}</div>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${req.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Mail size={11} /> {req.email}</a>
                            <a href={`tel:${req.phone}`} className="flex items-center gap-1 text-green-600 hover:underline text-xs"><Phone size={11} /> {req.phone}</a>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            req.role === "parent" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}>{req.role}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          <div className="font-medium">{req.grade}</div>
                          <div className="text-gray-400">{req.board}</div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[140px]"><p className="line-clamp-2">{req.subjects}</p></td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-1"><MapPin size={11} /> {req.area}</div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 capitalize whitespace-nowrap">{req.mode.replace("_", " ")}</td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">{req.budget || "—"}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                            req.status === "new" ? "bg-blue-100 text-blue-700 border-blue-200" :
                            req.status === "matched" ? "bg-green-100 text-green-700 border-green-200" :
                            req.status === "matching" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                            "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>{req.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                        <td className="px-4 py-4">
                          <select
                            value={req.status}
                            onChange={e => updateRequirementStatus.mutate({ id: req.id, status: e.target.value as "new" | "matching" | "matched" | "closed" })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                            disabled={updateRequirementStatus.isPending}
                          >
                            <option value="new">New</option>
                            <option value="matching">Matching</option>
                            <option value="matched">Matched</option>
                            <option value="closed">Closed</option>
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
      </main>
    </div>
  );
}
