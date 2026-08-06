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
  CreditCard, ExternalLink, Upload, Loader2,
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

/** Fetches a presigned S3 URL for the uploaded session sheet and opens it in a new tab.
 *  This avoids the 404 error caused by the /api/img/ path not being accessible in production. */
function ViewSheetButton({ logId }: { logId: number }) {
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await utils.sessionLog.getSignedSheetUrl.fetch({ logId });
      if (result?.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Sheet URL not available.');
      }
    } catch (err) {
      console.error('Failed to get sheet URL:', err);
      alert('Failed to open sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
      {loading ? 'Opening...' : 'View Uploaded Sheet'}
    </button>
  );
}

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"inquiries" | "tutors" | "referrals" | "tutorProfiles" | "studentProfiles" | "interests" | "demoInterests" | "demoSlots" | "confirmedMatches" | "sessionLogs" | "cancellations" | "cancelledDemos" | "cancelledClasses" | "smartPairs" | "addUser" | "holdManagement">("inquiries");
  // Add User form state
  const [addUserType, setAddUserType] = useState<"tutor" | "student">("tutor");
  const [addTutorForm, setAddTutorForm] = useState({ name: "", email: "", phone: "", qualification: "", subjects: "", experience: "", boards: "CBSE, ICSE", languages: "English, Kannada", mode: "both" as "home_tuition" | "online" | "both", bio: "", area: "", gender: "" as "male" | "female" | "other" | "", upiId: "" });
  const [addStudentForm, setAddStudentForm] = useState({ name: "", email: "", phone: "", role: "parent" as "student" | "parent", studentName: "", grade: "", board: "CBSE" as "CBSE" | "ICSE" | "State" | "IB" | "IGCSE" | "Other", subjects: "", mode: "home_tuition" as "home_tuition" | "online" | "both", area: "", budget: "", demoTime: "", regularTime: "", daysPerWeek: "", sessionsPerWeek: "", sessionDuration: "", specialRequirements: "", tutorGenderPreference: "no_preference" as "male" | "female" | "no_preference" });
  // Hold management state
  const [holdReason, setHoldReason] = useState("");
  const [holdTargetId, setHoldTargetId] = useState<number | null>(null);
  const [holdTargetType, setHoldTargetType] = useState<"tutor" | "student" | null>(null);
  const [tutorForm, setTutorForm] = useState<typeof EMPTY_TUTOR>(EMPTY_TUTOR);
  const [editingTutorId, setEditingTutorId] = useState<number | null>(null);
  const [showTutorForm, setShowTutorForm] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "admin";

  // One-time bootstrap: promotes the owner account to admin if they aren't one yet
  const ensureOwnerAdmin = trpc.auth.ensureOwnerAdmin.useMutation({
    onSuccess: (data) => {
      if (data.promoted) {
        toast.success("Admin access granted! Refreshing...");
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error(`Could not grant admin: ${data.reason}`);
      }
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

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
  // Admin approval removed — interests go directly to student/tutor

  // Student Demo Interests — must be before early returns
  const { data: studentDemoInterestsList, isLoading: loadingDemoInterests, refetch: refetchDemoInterests } =
    trpc.studentDemoInterest.listAll.useQuery(undefined, { enabled: isAdmin });
  const updateDemoInterestStatus = trpc.studentDemoInterest.updateStatus.useMutation({
    onSuccess: () => { refetchDemoInterests(); toast.success("Student interest status updated"); },
    onError: () => toast.error("Failed to update student interest status"),
  });
  // Admin approval removed — interests go directly to tutor

  // Demo Slots (scheduled demo classes) — must be before early returns
  const { data: demoSlotsList, isLoading: loadingDemoSlots, refetch: refetchDemoSlots } =
    trpc.demoSlot.listAll.useQuery(undefined, { enabled: isAdmin });
  const updateDemoSlotStatusMutation = trpc.demoSlot.updateStatus.useMutation({
    onSuccess: () => { refetchDemoSlots(); toast.success("Demo slot status updated"); },
    onError: () => toast.error("Failed to update demo slot status"),
  });
  const forceClassStartedMutation = trpc.demoSlot.adminForceClassStarted.useMutation({
    onSuccess: (data) => {
      refetchDemoSlots();
      refetchMatches();
      if (data.alreadyExisted) {
        toast.success(`Confirmed match already existed (Match #${data.matchId}). No duplicate created.`);
      } else {
        toast.success(`✅ Class started! Confirmed Match #${data.matchId} created. Contact details sent to both parties.`);
      }
    },
    onError: (err) => toast.error(`Failed to start class: ${err.message}`),
  });

  // Confirmed Matches — must be before early returns
  const { data: confirmedMatchesList, isLoading: loadingMatches, refetch: refetchMatches } =
    trpc.confirmedMatch.listAll.useQuery(undefined, { enabled: isAdmin });

  const markGotAClassMutation = trpc.confirmedMatch.markGotAClass.useMutation({
    onSuccess: () => { refetchMatches(); toast.success('✅ Marked as Got a Class!'); },
    onError: () => toast.error('Failed to update class status'),
  });
  const resetClassStatusMutation = trpc.confirmedMatch.resetClassStatus.useMutation({
    onSuccess: () => { refetchMatches(); toast.success('Status reset to Matched.'); },
    onError: () => toast.error('Failed to reset class status'),
  });

  const { data: sessionLogsList, isLoading: loadingSessionLogs, refetch: refetchSessionLogs } =
    trpc.sessionLog.listAll.useQuery(undefined, { enabled: isAdmin });

  const approvePaymentMutation = trpc.sessionLog.approvePayment.useMutation({
    onSuccess: () => { refetchSessionLogs(); toast.success('✅ Payment approved and status updated!'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to approve payment'),
  });

  const resetPaymentMutation = trpc.sessionLog.resetPayment.useMutation({
    onSuccess: () => { refetchSessionLogs(); toast.success('Status reset to Sheet Uploaded.'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to reset status'),
  });

  const adminMarkAsPaidMutation = trpc.sessionLog.adminMarkAsPaid.useMutation({
    onSuccess: () => { refetchSessionLogs(); toast.success('✅ Marked as Paid! Both tutor and parent have been notified.'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to mark as paid'),
  });

  // Cancellation Requests
  const { data: cancellationRequests, isLoading: loadingCancellations, refetch: refetchCancellations } =
    trpc.confirmedMatch.listCancellationRequests.useQuery(undefined, { enabled: isAdmin });
  const approveCancellationMutation = trpc.confirmedMatch.adminApproveCancellation.useMutation({
    onSuccess: () => { refetchCancellations(); refetchMatches(); toast.success('Class cancelled. Both parties have been notified.'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to approve cancellation'),
  });

  // Cancelled Demos (parent-cancelled with pending ₹350 fee)
  const { data: cancelledDemosList, isLoading: loadingCancelledDemos, refetch: refetchCancelledDemos } =
    trpc.demoSlot.adminGetCancelledDemos.useQuery(undefined, { enabled: isAdmin });
  const clearCancellationFeeMutation = trpc.demoSlot.adminClearCancellationFee.useMutation({
    onSuccess: () => { refetchCancelledDemos(); toast.success('✅ Cancellation fee cleared. Parent has been notified.'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to clear fee'),
  });

  // Cancelled Classes (confirmed matches that were cancelled)
  const { data: cancelledClassesList, isLoading: loadingCancelledClasses } =
    trpc.cancelledClasses.list.useQuery(undefined, { enabled: isAdmin && activeTab === 'cancelledClasses' });

  // Smart Pairs (unmatched student+tutor within 10km, gender match, subject overlap)
  const { data: smartPairsList, isLoading: loadingSmartPairs, refetch: refetchSmartPairs, dataUpdatedAt: smartPairsUpdatedAt } =
    trpc.smartPairs.list.useQuery(undefined, { enabled: isAdmin && activeTab === 'smartPairs', refetchInterval: 5 * 60 * 1000 });
  const { data: smartPairContactsList, refetch: refetchSmartPairContacts } =
    trpc.smartPairs.listContacted.useQuery(undefined, { enabled: isAdmin && activeTab === 'smartPairs', refetchInterval: 5 * 60 * 1000 });
  const markContactedMutation = trpc.smartPairs.markContacted.useMutation({
    onSuccess: () => { void refetchSmartPairContacts(); toast.success('✅ Pair marked as contacted!'); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to mark as contacted'),
  });
  const sendTutorEmailMutation = trpc.smartPairs.sendTutorEmail.useMutation({
    onSuccess: () => toast.success('📧 Email sent to tutor!'),
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to send tutor email'),
  });
  const sendStudentEmailMutation = trpc.smartPairs.sendStudentEmail.useMutation({
    onSuccess: () => toast.success('📧 Email sent to student/parent!'),
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to send student email'),
  });
  const moveToDemoSlotMutation = trpc.smartPairs.moveToDemoSlot.useMutation({
    onSuccess: (data) => toast.success(`📅 Demo slot #${data.slotId} created! Both parties will see it in their dashboards.`),
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to create demo slot'),
  });

  // ── Admin Manage: Hold / Register ──────────────────────────────────────────
  const utils = trpc.useUtils();
  const { data: heldProfiles, refetch: refetchHeld } = trpc.adminManage.getHeldProfiles.useQuery(
    undefined, { enabled: isAdmin && activeTab === 'holdManagement' }
  );
  const holdTutorMutation = trpc.adminManage.holdTutor.useMutation({
    onSuccess: () => { toast.success('Tutor put on hold'); setHoldReason(''); setHoldTargetId(null); setHoldTargetType(null); utils.tutorProfile.listAll.invalidate(); refetchHeld(); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to hold tutor'),
  });
  const unholdTutorMutation = trpc.adminManage.unholdTutor.useMutation({
    onSuccess: () => { toast.success('Tutor hold removed'); utils.tutorProfile.listAll.invalidate(); refetchHeld(); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to unhold tutor'),
  });
  const holdStudentMutation = trpc.adminManage.holdStudent.useMutation({
    onSuccess: () => { toast.success('Student/Parent put on hold'); setHoldReason(''); setHoldTargetId(null); setHoldTargetType(null); utils.studentProfile.listAll.invalidate(); refetchHeld(); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to hold student'),
  });
  const unholdStudentMutation = trpc.adminManage.unholdStudent.useMutation({
    onSuccess: () => { toast.success('Student/Parent hold removed'); utils.studentProfile.listAll.invalidate(); refetchHeld(); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to unhold student'),
  });
  const adminCreateTutorMutation = trpc.adminManage.createTutor.useMutation({
    onSuccess: () => { toast.success('Tutor profile created successfully!'); setAddTutorForm({ name: '', email: '', phone: '', qualification: '', subjects: '', experience: '', boards: 'CBSE, ICSE', languages: 'English, Kannada', mode: 'both', bio: '', area: '', gender: '', upiId: '' }); utils.tutorProfile.listAll.invalidate(); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to create tutor'),
  });
  const adminCreateStudentMutation = trpc.adminManage.createStudent.useMutation({
    onSuccess: () => { toast.success('Student/Parent profile created successfully!'); setAddStudentForm({ name: '', email: '', phone: '', role: 'parent', studentName: '', grade: '', board: 'CBSE', subjects: '', mode: 'home_tuition', area: '', budget: '', demoTime: '', regularTime: '', daysPerWeek: '', sessionsPerWeek: '', sessionDuration: '', specialRequirements: '', tutorGenderPreference: 'no_preference' }); utils.studentProfile.listAll.invalidate(); },
    onError: (err: { message?: string }) => toast.error(err.message ?? 'Failed to create student'),
  });
  const [showOnlyUncontacted, setShowOnlyUncontacted] = useState(true);
  const [demoModalPair, setDemoModalPair] = useState<null | {
    tutorProfileId: number; studentProfileId: number;
    tutorName: string; tutorEmail: string;
    studentName: string; studentEmail: string;
  }>(null);
  const [demoDate, setDemoDate] = useState('');
  const [demoTime, setDemoTime] = useState('');
  const [demoMode, setDemoMode] = useState<'home_tuition' | 'online' | 'both'>('home_tuition');
  const [demoNotes, setDemoNotes] = useState('');

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
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <ShieldAlert size={48} className="mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            Admin Access Required
          </h1>
          <p className="text-gray-500 mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Your account does not have admin privileges yet.
          </p>
          <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            If you are the site owner, click the button below to grant yourself admin access.
          </p>
          <button
            onClick={() => ensureOwnerAdmin.mutate()}
            disabled={ensureOwnerAdmin.isPending}
            className="w-full py-3 rounded-xl font-bold text-white mb-3 transition-all disabled:opacity-60"
            style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
          >
            {ensureOwnerAdmin.isPending ? "Granting access..." : "🔑 Grant Admin Access (Owner Only)"}
          </button>
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
  const pendingPayments = sessionLogsList?.filter((l: { paymentStatus: string }) => l.paymentStatus === 'sheet_uploaded').length ?? 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/api/img/edunest-logo-small_2b84d7c3.png" alt="EduNest" className="w-8 h-8 object-contain" />
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
          {(["inquiries", "tutors", "referrals", "tutorProfiles", "studentProfiles", "interests", "demoInterests", "demoSlots", "confirmedMatches", "sessionLogs", "cancellations", "cancelledDemos", "cancelledClasses", "smartPairs", "addUser", "holdManagement"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? "text-white shadow-sm" : "bg-white text-gray-500 hover:text-gray-700"}`}
              style={activeTab === tab ? { backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" } : { fontFamily: "'Poppins', sans-serif" }}
            >
              {tab === "inquiries" ? (
                <span className="flex items-center gap-2"><MessageSquare size={15} /> Contact Inquiries {newInquiries > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{newInquiries}</span>}</span>
              ) : tab === "referrals" ? (
                <span className="flex items-center gap-2"><Gift size={15} /> Referrals {pendingReferrals > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingReferrals}</span>}</span>
              ) : tab === "tutorProfiles" ? (
                <span className="flex items-center gap-2"><GraduationCap size={15} /> Tutor Profiles {pendingTutorProfiles > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingTutorProfiles}</span>}</span>
              ) : tab === "studentProfiles" ? (
                <span className="flex items-center gap-2"><Users size={15} /> Student Profiles <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "studentProfiles" ? "bg-white/30" : "bg-gray-100 text-gray-600"}`}>{studentProfilesList?.length ?? 0}</span></span>
              ) : tab === "interests" ? (
                <span className="flex items-center gap-2"><CheckCircle2 size={15} /> Tutor Interests {pendingInterests > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingInterests}</span>}</span>
              ) : tab === "demoInterests" ? (
                <span className="flex items-center gap-2"><BookOpen size={15} /> Student Interests {pendingDemoInterests > 0 && <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingDemoInterests}</span>}</span>
              ) : tab === "demoSlots" ? (
                <span className="flex items-center gap-2"><Clock size={15} /> Demo Slots {pendingDemoSlots > 0 && <span className="bg-white text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingDemoSlots}</span>}</span>
              ) : tab === "confirmedMatches" ? (
                <span className="flex items-center gap-2"><CheckCircle2 size={15} /> Confirmed Matches <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "confirmedMatches" ? "bg-white/30" : "bg-gray-100 text-gray-600"}`}>{confirmedMatchesList?.length ?? 0}</span></span>
              ) : tab === "sessionLogs" ? (
                <span className="flex items-center gap-2"><CreditCard size={15} /> Session Payments {pendingPayments > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "sessionLogs" ? "bg-white/30" : "bg-orange-100 text-orange-700"}`}>{pendingPayments} pending</span>}</span>
              ) : tab === "cancellations" ? (
                <span className="flex items-center gap-2">🚫 Cancellation Requests {(cancellationRequests?.length ?? 0) > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "cancellations" ? "bg-white/30" : "bg-red-100 text-red-700"}`}>{cancellationRequests?.length}</span>}</span>
              ) : tab === "cancelledDemos" ? (
                <span className="flex items-center gap-2">❌ Cancelled Demos {(cancelledDemosList?.length ?? 0) > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "cancelledDemos" ? "bg-white/30" : "bg-red-100 text-red-700"}`}>{cancelledDemosList?.length} pending fee</span>}</span>
              ) : tab === "cancelledClasses" ? (
                <span className="flex items-center gap-2">🚫 Cancelled Classes <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "cancelledClasses" ? "bg-white/30" : "bg-red-100 text-red-700"}`}>{cancelledClassesList?.length ?? 0}</span></span>
              ) : tab === "smartPairs" ? (
                <span className="flex items-center gap-2">🧠 Smart Pairs <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "smartPairs" ? "bg-white/30" : "bg-green-100 text-green-700"}`}>{smartPairsList?.length ?? 0}</span></span>
              ) : tab === "addUser" ? (
                <span className="flex items-center gap-2"><Plus size={15} /> Add User</span>
              ) : tab === "holdManagement" ? (
                <span className="flex items-center gap-2"><ShieldAlert size={15} /> Hold Management {(heldProfiles?.tutors?.length ?? 0) + (heldProfiles?.students?.length ?? 0) > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "holdManagement" ? "bg-white/30" : "bg-red-100 text-red-700"}`}>{(heldProfiles?.tutors?.length ?? 0) + (heldProfiles?.students?.length ?? 0)} held</span>}</span>
              ) : (
                <span className="flex items-center gap-2"><UserCheck size={15} /> Manage Tutors <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "tutors" ? "bg-white/30" : "bg-gray-100"}`}>{adminTutors?.length ?? 0}</span></span>
              )}
            </button>
          ))}
          <button
            onClick={() => { refetchInquiries(); refetchTutors(); refetchReferrals(); refetchTutorProfiles(); refetchStudentProfiles(); refetchInterests(); refetchDemoInterests(); refetchDemoSlots(); refetchMatches(); }}
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
                          <td className="px-4 py-4 text-gray-400 font-mono text-xs">T{t.id}</td>
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
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">S{sp.id}</td>
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
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">T{p.id}</td>
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
              <p className="text-xs text-gray-400 mt-0.5">Tutors who expressed interest in a student. Approve to forward to the student, or reject to dismiss.</p>
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
                      {["#", "Tutor Profile", "Student Profile", "Message", "Admin Status", "Student Response", "Submitted", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tutorInterestsList.map((interest: {
                      id: number; tutorProfileId: number; studentProfileId: number;
                      message?: string | null; status: string; adminApprovalStatus?: string; createdAt: Date | string;
                    }) => (
                      <tr key={interest.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{interest.id}</td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg font-mono">Tutor T{interest.tutorProfileId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-mono">Student S{interest.studentProfileId}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 max-w-[200px]">
                          {interest.message ? <p className="line-clamp-2">{interest.message}</p> : <span className="text-gray-300">No message</span>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                            interest.status === "accepted" ? "bg-green-50 text-green-700 border-green-200" :
                            interest.status === "declined" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-gray-50 text-gray-500 border-gray-200"
                          }`}>{interest.status === "pending" ? "Awaiting student" : interest.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(interest.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-gray-400 italic">Direct to student</span>
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
                <p className="text-sm text-gray-400 mt-1">Confirm a student interest in the "Student Interests" tab to create a slot</p>
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.005 80)" }}>
                    {(demoSlotsList as Array<{ id: number; studentProfileId: number; tutorProfileId: number; mode: string; scheduledDate?: string | null; scheduledTime?: string | null; notes?: string | null; status: string; createdAt: Date | number }>).map((slot) => (
                      <tr key={slot.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-4 font-semibold text-gray-400 text-xs">D{slot.id}</td>
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
                        <td className="px-4 py-4">
                          {slot.status === 'completed' || slot.status === 'scheduled' ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Mark Demo Slot D${slot.id} as class started?\n\nThis will:\n• Force both tutor and student proceed intent to "Yes"\n• Create a Confirmed Match (if not already done)\n• Send contact details to both parties\n\nOnly use this if both parties agreed but forgot to click the button.`))
                                  forceClassStartedMutation.mutate({ slotId: slot.id });
                              }}
                              disabled={forceClassStartedMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle2 size={12} />
                              {forceClassStartedMutation.isPending ? 'Processing…' : 'Mark Started'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Schedule first</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Student Interests Tab ── */}
        {activeTab === "demoInterests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Student Interests ({studentDemoInterestsList?.length ?? 0})
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Students/parents who showed interest in a tutor. Approve to forward to the tutor, or reject to dismiss.</p>
              </div>
            </div>
            {loadingDemoInterests ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !studentDemoInterestsList || studentDemoInterestsList.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                <p className="text-gray-500 font-medium">No student interests yet</p>
                <p className="text-sm text-gray-400 mt-1">Students who click "Show Interest" on a tutor's profile will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor Profile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor Response</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.005 80)" }}>
                    {studentDemoInterestsList.map((demo: { id: number; studentProfileId: number; tutorProfileId: number; message?: string | null; status: string; adminApprovalStatus?: string; createdAt: Date | number }) => (
                      <tr key={demo.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{demo.id}</td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-mono">Student S{demo.studentProfileId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg font-mono">Tutor T{demo.tutorProfileId}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 max-w-xs truncate text-xs">{demo.message || <span className="text-gray-400 italic">No message</span>}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                            demo.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200" :
                            demo.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-gray-50 text-gray-500 border-gray-200"
                          }`}>{demo.status === "pending" ? "Awaiting tutor" : demo.status}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(demo.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-gray-400 italic">Direct to tutor</span>
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
              <p className="text-sm text-gray-500">Both tutor and student/parent agreed to proceed. Mark as "Got a Class" once the class arrangement is confirmed.</p>
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
                  <div key={match.id} className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: match.classStatus === 'got_a_class' ? 'oklch(0.75 0.18 145)' : 'oklch(0.88 0.12 145)' }}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">🎉 Class C{match.id}</span>
                      {match.classStatus === 'got_a_class' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">🎓 Got a Class!</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">⏳ Matched</span>
                      )}
                      <span className="text-xs text-gray-400">{new Date(match.matchedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="text-xs text-gray-400 ml-auto">Demo Slot #{match.demoSlotId}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tutor Details */}
                      <div className="p-4 rounded-xl border" style={{ borderColor: "oklch(0.92 0.005 80)", backgroundColor: "oklch(0.98 0.005 80)" }}>
                        <h3 className="font-bold text-sm mb-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>👨‍🏫 Tutor Details</h3>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Profile ID</span><span className="font-semibold">T{match.tutorProfileId}</span></div>
                          {match.tutorName && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Name</span><span className="font-semibold">{match.tutorName}</span></div>}
                          {match.tutorEmail && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Email</span><a href={`mailto:${match.tutorEmail}`} className="font-semibold text-blue-600 hover:underline">{match.tutorEmail}</a></div>}
                          {match.tutorPhone && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Phone</span><a href={`tel:${match.tutorPhone}`} className="font-semibold text-green-700">{match.tutorPhone}</a></div>}
                        </div>
                      </div>
                      {/* Student/Parent Details */}
                      <div className="p-4 rounded-xl border" style={{ borderColor: "oklch(0.92 0.005 80)", backgroundColor: "oklch(0.98 0.005 80)" }}>
                        <h3 className="font-bold text-sm mb-3" style={{ color: "oklch(0.55 0.18 270)", fontFamily: "'Poppins', sans-serif" }}>👨‍👧 Student / Parent Details</h3>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Profile ID</span><span className="font-semibold">S{match.studentProfileId}</span></div>
                          {match.studentName && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Name</span><span className="font-semibold">{match.studentName}</span></div>}
                          {match.studentEmail && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Email</span><a href={`mailto:${match.studentEmail}`} className="font-semibold text-blue-600 hover:underline">{match.studentEmail}</a></div>}
                          {match.studentPhone && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Phone</span><a href={`tel:${match.studentPhone}`} className="font-semibold text-green-700">{match.studentPhone}</a></div>}
                          {match.studentArea && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Area</span><span>{match.studentArea}</span></div>}
                          {match.studentGrade && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Grade</span><span>{match.studentGrade}</span></div>}
                          {match.studentSubjects && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Subjects</span><span>{match.studentSubjects}</span></div>}
                          {match.paymentAmount && <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Budget</span><span className="font-semibold text-orange-700">₹{match.paymentAmount}</span></div>}
                        </div>
                      </div>
                    </div>
                    {/* Admin action: Mark Got a Class */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                      {match.classStatus !== 'got_a_class' ? (
                        <button
                          onClick={() => markGotAClassMutation.mutate({ matchId: match.id })}
                          disabled={markGotAClassMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                          style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
                        >
                          {markGotAClassMutation.isPending ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={14} />}
                          Mark as Got a Class
                        </button>
                      ) : (
                        <button
                          onClick={() => resetClassStatusMutation.mutate({ matchId: match.id })}
                          disabled={resetClassStatusMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                          style={{ borderColor: "#d1d5db", color: "#6b7280" }}
                        >
                          <XCircle size={14} /> Undo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ── Session Logs / Payment Approval ── */}
        {activeTab === "sessionLogs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                Session Logs & Payment Approval ({sessionLogsList?.length ?? 0})
              </h2>
              <button onClick={() => refetchSessionLogs()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border hover:bg-gray-50 transition-colors">
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
            {loadingSessionLogs ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : !sessionLogsList || sessionLogsList.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No session logs yet</p>
                <p className="text-sm mt-1">Session logs appear after tutors upload their completed attendance sheets.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(sessionLogsList as Array<any>).map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl shadow-sm border p-6" style={{
                    borderColor: log.paymentStatus === 'payment_processed' ? 'oklch(0.88 0.12 145)'
                      : log.paymentStatus === 'parent_paid' ? 'oklch(0.82 0.15 290)'
                      : log.paymentStatus === 'sheet_uploaded' ? 'oklch(0.88 0.12 50)'
                      : 'oklch(0.92 0.005 80)'
                  }}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Class C{log.confirmedMatchId ?? log.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.paymentStatus === 'payment_processed' ? 'bg-green-100 text-green-700' :
                        log.paymentStatus === 'parent_paid' ? 'bg-purple-100 text-purple-700' :
                        log.paymentStatus === 'sheet_uploaded' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.paymentStatus === 'payment_processed' ? '✅ Payment Processed — Tutor Notified' :
                         log.paymentStatus === 'parent_paid' ? '💰 Parent Paid — Awaiting Your Approval' :
                         log.paymentStatus === 'sheet_uploaded' ? '📋 Sheet Uploaded — Awaiting Parent Payment' :
                         '⏳ Pending Sheet Upload'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">Created {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                        <p className="text-xs font-bold text-orange-700 mb-1">👨‍🏫 Tutor</p>
                        <p className="text-sm font-semibold">{log.tutorName || `Profile #${log.tutorProfileId}`}</p>
                        <p className="text-xs text-gray-500">Profile ID: T{log.tutorProfileId}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 mb-1">👨‍👧 Student / Parent</p>
                        <p className="text-sm font-semibold">{log.studentName || `Profile #${log.studentProfileId}`}</p>
                        <p className="text-xs text-gray-500">Profile ID: S{log.studentProfileId}</p>
                      </div>
                    </div>
                    {/* Parent payment details */}
                    {log.parentPaid && (
                      <div className="mb-4 p-3 rounded-xl border" style={{ borderColor: 'oklch(0.82 0.15 290)', backgroundColor: 'oklch(0.97 0.03 290)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: 'oklch(0.4 0.15 290)' }}>💳 Parent Payment Details</p>
                        <p className="text-sm text-gray-700">Parent marked payment done via UPI</p>
                        {log.parentPaidAt && (
                          <p className="text-xs text-gray-500 mt-0.5">Paid at: {new Date(log.parentPaidAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                        {log.parentPaymentNote && (
                          <p className="text-xs text-gray-600 mt-1">Note: {log.parentPaymentNote}</p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* View uploaded sheet — use presigned URL to avoid 404 in production */}
                      {log.uploadedSheetUrl ? (
                        <ViewSheetButton logId={log.id} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400">
                          <Upload size={13} /> No sheet uploaded yet
                        </span>
                      )}
                      {/* Approve payment button — only when parent has marked paid */}
                      {log.paymentStatus === 'parent_paid' && (
                        <button
                          onClick={() => approvePaymentMutation.mutate({ logId: log.id })}
                          disabled={approvePaymentMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50"
                          style={{ backgroundColor: 'oklch(0.55 0.18 145)' }}
                        >
                          {approvePaymentMutation.isPending ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={13} />}
                          ✅ Approve & Notify Tutor
                        </button>
                      )}
                      {/* Admin force-mark as paid (bypasses parent step) — available when sheet uploaded but parent hasn't marked yet */}
                      {log.uploadedSheetUrl && (log.paymentStatus === 'sheet_uploaded' || log.paymentStatus === 'parent_paid') && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Mark this session as PAID for both ${log.tutorName ?? 'tutor'} and ${log.studentName ?? 'student'}? Both will receive a notification email.`)) {
                              adminMarkAsPaidMutation.mutate({ logId: log.id });
                            }
                          }}
                          disabled={adminMarkAsPaidMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 145), oklch(0.45 0.18 145))' }}
                        >
                          {adminMarkAsPaidMutation.isPending ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>💰</span>}
                          Mark as Paid (Both Parties)
                        </button>
                      )}
                      {/* Undo payment (reset to sheet_uploaded) */}
                      {log.paymentStatus === 'payment_processed' && (
                        <button
                          onClick={() => resetPaymentMutation.mutate({ logId: log.id })}
                          disabled={resetPaymentMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={13} /> Undo Approval
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Cancellation Requests ── */}
        {activeTab === "cancellations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>Cancellation Requests</h2>
              <button onClick={() => refetchCancellations()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><RefreshCw size={14} /> Refresh</button>
            </div>
            {loadingCancellations ? (
              <div className="text-center py-12"><div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : !cancellationRequests?.length ? (
              <div className="bg-white rounded-2xl shadow-sm border p-10 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                <p className="text-gray-400 text-sm">No cancellation requests at this time.</p>
              </div>
            ) : (
              cancellationRequests.map((req: any) => (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "#fca5a5" }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                          {req.tutorName ?? 'Tutor'} ↔ {req.studentName ?? 'Student'}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⏳ Cancellation Requested</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Requested by: <strong>{req.cancellationRequestedBy === 'tutor' ? 'Tutor' : 'Parent'}</strong>
                        {req.cancellationRequestedAt && <> on {new Date(req.cancellationRequestedAt).toLocaleDateString()}</>}
                      </p>
                      {req.cancellationNote && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-1">
                          💬 Reason: {req.cancellationNote}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => approveCancellationMutation.mutate({ matchId: req.id })}
                      disabled={approveCancellationMutation.isPending}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                      {approveCancellationMutation.isPending ? 'Processing...' : '❌ Approve Cancellation'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Cancelled Demos (parent-cancelled, ₹350 fee pending) ── */}
        {activeTab === "cancelledDemos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>❌ Cancelled Demos — Pending ₹350 Fee</h2>
              <button onClick={() => refetchCancelledDemos()} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors"><RefreshCw size={14} /> Refresh</button>
            </div>
            {loadingCancelledDemos ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-orange-400" /><p className="text-gray-400">Loading cancelled demos...</p></div>
            ) : !cancelledDemosList?.length ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-400 opacity-50" />
                <h3 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No pending cancellation fees</h3>
                <p className="text-gray-400">All demo cancellation fees have been cleared.</p>
              </div>
            ) : (
              cancelledDemosList.map((demo: any) => (
                <div key={demo.id} className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">❌ Demo Cancelled by Parent</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">⚠️ ₹350 Fee Pending</span>
                      </div>
                      <p className="text-base font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                        Demo Slot #{demo.id} · Student Profile S{String(demo.studentProfileId).padStart(3, '0')}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Tutor Profile T{String(demo.tutorProfileId).padStart(3, '0')} · {demo.mode === 'online' ? '💻 Online' : '🏠 Home Tuition'}
                      </p>
                      {demo.scheduledDate && demo.scheduledTime && (
                        <p className="text-sm text-gray-500">📅 Was scheduled: {demo.scheduledDate} at {demo.scheduledTime}</p>
                      )}
                      {demo.demoCancelledAt && (
                        <p className="text-xs text-gray-400 mt-1">Cancelled: {new Date(demo.demoCancelledAt).toLocaleString()}</p>
                      )}
                    </div>
                    <button
                      onClick={() => clearCancellationFeeMutation.mutate({ slotId: demo.id })}
                      disabled={clearCancellationFeeMutation.isPending}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      {clearCancellationFeeMutation.isPending ? 'Processing...' : '✅ Clear Fee'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Cancelled Classes Tab ── */}
        {activeTab === "cancelledClasses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>🚫 Cancelled Classes</h2>
              <span className="text-sm text-gray-500">{cancelledClassesList?.length ?? 0} cancelled</span>
            </div>
            {loadingCancelledClasses ? (
              <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin" /></div>
            ) : !cancelledClassesList?.length ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>No cancelled classes yet.</p>
              </div>
            ) : (
              cancelledClassesList.map((cls) => (
                <div key={cls.id} className="bg-white rounded-2xl shadow-sm p-5 border border-red-100">
                  <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 mb-2">🚫 Cancelled</span>
                      {cls.cancellationNote && <p className="text-sm text-gray-500 italic mt-1">"{cls.cancellationNote}"</p>}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(cls.matchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">🎓 Tutor</p>
                      <p className="font-semibold text-gray-800">{cls.tutorName ?? '—'}</p>
                      <p className="text-sm text-gray-500">{cls.tutorEmail ?? '—'}</p>
                      <p className="text-sm text-gray-500">{cls.tutorPhone ?? '—'}</p>
                      <p className="text-sm text-gray-400">{cls.tutorArea ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-1">{cls.tutorSubjects ?? '—'}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">👨‍🎓 Student</p>
                      <p className="font-semibold text-gray-800">{cls.studentName ?? '—'}</p>
                      <p className="text-sm text-gray-500">{cls.studentEmail ?? '—'}</p>
                      <p className="text-sm text-gray-500">{cls.studentPhone ?? '—'}</p>
                      <p className="text-sm text-gray-400">{cls.studentArea ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-1">Grade: {cls.studentGrade ?? '—'} | {cls.studentSubjects ?? '—'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Smart Pairs Tab ── */}
        {activeTab === "smartPairs" && (() => {
          const contactedSet = new Set(
            (smartPairContactsList ?? []).map(c => `${c.tutorProfileId}-${c.studentProfileId}`)
          );
          const contactedMap = new Map<string, { contactedAt: Date; contactedBy: string | null }>();
          for (const c of (smartPairContactsList ?? [])) {
            const key = `${c.tutorProfileId}-${c.studentProfileId}`;
            if (!contactedMap.has(key)) contactedMap.set(key, { contactedAt: c.contactedAt, contactedBy: c.contactedBy ?? null });
          }
          const filteredPairs = showOnlyUncontacted
            ? (smartPairsList ?? []).filter(p => !contactedSet.has(`${p.tutorProfileId}-${p.studentProfileId}`))
            : (smartPairsList ?? []);
          return (
            <div className="space-y-4">
              {/* Demo Slot Modal */}
              {demoModalPair && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDemoModalPair(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>📅 Schedule Demo Slot</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      <span className="font-semibold text-blue-700">{demoModalPair.tutorName}</span> ↔ <span className="font-semibold text-orange-700">{demoModalPair.studentName}</span>
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                        <input type="date" value={demoDate} onChange={e => setDemoDate(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                          style={{ borderColor: 'oklch(0.88 0.005 80)' }} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                        <input type="time" value={demoTime} onChange={e => setDemoTime(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                          style={{ borderColor: 'oklch(0.88 0.005 80)' }} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Mode</label>
                        <select value={demoMode} onChange={e => setDemoMode(e.target.value as 'home_tuition' | 'online' | 'both')}
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                          style={{ borderColor: 'oklch(0.88 0.005 80)' }}>
                          <option value="home_tuition">Home Tuition</option>
                          <option value="online">Online</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                        <textarea value={demoNotes} onChange={e => setDemoNotes(e.target.value)}
                          placeholder="Any notes for the demo..."
                          rows={2}
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                          style={{ borderColor: 'oklch(0.88 0.005 80)' }} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          if (!demoDate || !demoTime) { toast.error('Please set date and time'); return; }
                          moveToDemoSlotMutation.mutate({
                            tutorProfileId: demoModalPair.tutorProfileId,
                            studentProfileId: demoModalPair.studentProfileId,
                            scheduledDate: demoDate,
                            scheduledTime: demoTime,
                            mode: demoMode,
                            notes: demoNotes || undefined,
                            tutorName: demoModalPair.tutorName,
                            tutorEmail: demoModalPair.tutorEmail || undefined,
                            studentName: demoModalPair.studentName,
                            studentEmail: demoModalPair.studentEmail || undefined,
                          }, { onSuccess: () => { setDemoModalPair(null); setDemoDate(''); setDemoTime(''); setDemoNotes(''); } });
                        }}
                        disabled={moveToDemoSlotMutation.isPending}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {moveToDemoSlotMutation.isPending ? 'Scheduling...' : '📅 Schedule Demo'}
                      </button>
                      <button onClick={() => setDemoModalPair(null)}
                        className="px-4 py-2 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderColor: 'oklch(0.88 0.005 80)' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>🧠 Smart Pairs</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Unmatched student–tutor pairs within 10 km · gender preference met · subject overlap</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowOnlyUncontacted(v => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                      showOnlyUncontacted
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {showOnlyUncontacted ? '🔴 Fresh Leads Only' : '🟢 Show All Pairs'}
                  </button>
                  <button
                    onClick={() => { void refetchSmartPairs(); void refetchSmartPairContacts(); }}
                    disabled={loadingSmartPairs}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingSmartPairs ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" /> : '🔄'} Refresh
                  </button>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">{filteredPairs.length} / {smartPairsList?.length ?? 0} shown</span>
                    {smartPairsUpdatedAt > 0 && (
                      <span className="text-xs text-gray-400">Updated {new Date(smartPairsUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · auto-refreshes every 5 min</span>
                    )}
                  </div>
                </div>
              </div>
              {loadingSmartPairs ? (
                <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-[oklch(0.68_0.18_50)] border-t-transparent rounded-full animate-spin" /></div>
              ) : !filteredPairs.length ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {showOnlyUncontacted ? 'All pairs have been contacted! Toggle to see all pairs.' : 'No smart pairs found within 10 km matching all criteria.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Pairs appear when both tutor and student have set their location, gender preference, and subjects.</p>
                </div>
              ) : (
                filteredPairs.map((pair, idx) => {
                  const pairKey = `${pair.tutorProfileId}-${pair.studentProfileId}`;
                  const isContacted = contactedSet.has(pairKey);
                  const contactRecord = contactedMap.get(pairKey);
                  return (
                    <div key={pairKey} className={`bg-white rounded-2xl shadow-sm p-5 border ${isContacted ? 'border-green-400 bg-green-50/30' : 'border-green-100'}`}>
                      {/* Header row */}
                      <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">📍 {pair.distanceKm} km away</span>
                        {pair.tutorGenderPreference && pair.tutorGenderPreference !== 'no_preference' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Gender: {pair.tutorGenderPreference}</span>
                        )}
                        {isContacted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                            ✅ Contacted {contactRecord ? `· ${new Date(contactRecord.contactedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : ''}
                          </span>
                        ) : (
                          <button
                            onClick={() => markContactedMutation.mutate({ tutorProfileId: pair.tutorProfileId, studentProfileId: pair.studentProfileId })}
                            disabled={markContactedMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {markContactedMutation.isPending ? '...' : '📞 Mark as Contacted'}
                          </button>
                        )}
                      </div>

                      {/* Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tutor card */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">🎓 Tutor</p>
                          <p className="font-semibold text-gray-800">{pair.tutorName ?? '—'}</p>
                          <p className="text-sm text-gray-500">{pair.tutorEmail ?? '—'}</p>
                          <p className="text-sm text-gray-500">{pair.tutorPhone ?? '—'}</p>
                          <p className="text-sm text-gray-400">{pair.tutorArea ?? '—'}</p>
                          <p className="text-xs text-gray-400 mt-1">Subjects: {pair.tutorSubjects ?? '—'}</p>
                          {pair.tutorGender && <p className="text-xs text-gray-400">Gender: {pair.tutorGender}</p>}
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-blue-200">
                            {pair.tutorPhone && (
                              <a href={`tel:${pair.tutorPhone}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                📞 Call Tutor
                              </a>
                            )}
                            {pair.tutorPhone && (
                              <a
                                href={`https://wa.me/91${pair.tutorPhone.replace(/^\+91/, '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${pair.tutorName ?? 'there'}, we found a great student for you on EduNest! Can we connect?`)}`}
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors">
                                💬 WhatsApp
                              </a>
                            )}
                            {pair.tutorEmail && (
                              <button
                                onClick={() => sendTutorEmailMutation.mutate({
                                  tutorProfileId: pair.tutorProfileId,
                                  studentProfileId: pair.studentProfileId,
                                  tutorEmail: pair.tutorEmail!,
                                  tutorName: pair.tutorName ?? 'Tutor',
                                  studentName: pair.studentName ?? 'Student',
                                  studentGrade: pair.studentGrade ?? '',
                                  studentSubjects: pair.studentSubjects ?? '',
                                  studentArea: pair.studentArea ?? '',
                                  distanceKm: pair.distanceKm,
                                })}
                                disabled={sendTutorEmailMutation.isPending}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                📧 Email Tutor
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Student / Parent card */}
                        <div className="bg-orange-50 rounded-xl p-4">
                          <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">👨‍🎓 Student / Parent</p>
                          <p className="font-semibold text-gray-800">{pair.studentName ?? '—'}</p>
                          <p className="text-sm text-gray-500">{pair.studentEmail ?? '—'}</p>
                          <p className="text-sm text-gray-500">{pair.studentPhone ?? '—'}</p>
                          <p className="text-sm text-gray-400">{pair.studentArea ?? '—'}</p>
                          <p className="text-xs text-gray-400 mt-1">Grade: {pair.studentGrade ?? '—'}</p>
                          <p className="text-xs text-gray-400">Subjects: {pair.studentSubjects ?? '—'}</p>
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-orange-200">
                            {pair.studentPhone && (
                              <a href={`tel:${pair.studentPhone}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                                📞 Call Parent
                              </a>
                            )}
                            {pair.studentPhone && (
                              <a
                                href={`https://wa.me/91${pair.studentPhone.replace(/^\+91/, '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${pair.studentName ?? 'there'}, we found a great tutor for you on EduNest! Can we connect?`)}`}
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors">
                                💬 WhatsApp
                              </a>
                            )}
                            {pair.studentEmail && (
                              <button
                                onClick={() => sendStudentEmailMutation.mutate({
                                  tutorProfileId: pair.tutorProfileId,
                                  studentProfileId: pair.studentProfileId,
                                  studentEmail: pair.studentEmail!,
                                  studentName: pair.studentName ?? 'Student',
                                  tutorName: pair.tutorName ?? 'Tutor',
                                  tutorSubjects: pair.tutorSubjects ?? '',
                                  tutorArea: pair.tutorArea ?? '',
                                  tutorQualification: '',
                                  distanceKm: pair.distanceKm,
                                })}
                                disabled={sendStudentEmailMutation.isPending}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                📧 Email Parent
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Move to Demo Slot */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setDemoModalPair({
                              tutorProfileId: pair.tutorProfileId,
                              studentProfileId: pair.studentProfileId,
                              tutorName: pair.tutorName ?? 'Tutor',
                              tutorEmail: pair.tutorEmail ?? '',
                              studentName: pair.studentName ?? 'Student',
                              studentEmail: pair.studentEmail ?? '',
                            });
                            setDemoDate('');
                            setDemoTime('');
                            setDemoMode('home_tuition');
                            setDemoNotes('');
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm cursor-pointer"
                        >
                          📅 Move to Demo Slot
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}

        {/* ── Add User Tab ─────────────────────────────────────────────────────────────── */}
        {activeTab === "addUser" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>Add User Manually</h2>
              <div className="flex gap-2">
                <button onClick={() => setAddUserType("tutor")} className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${addUserType === "tutor" ? "text-white shadow-sm" : "bg-white text-gray-500"}`} style={addUserType === "tutor" ? { backgroundColor: "oklch(0.68 0.18 50)" } : {}}>
                  <span className="flex items-center gap-2"><GraduationCap size={15} /> Add Tutor</span>
                </button>
                <button onClick={() => setAddUserType("student")} className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${addUserType === "student" ? "text-white shadow-sm" : "bg-white text-gray-500"}`} style={addUserType === "student" ? { backgroundColor: "oklch(0.68 0.18 50)" } : {}}>
                  <span className="flex items-center gap-2"><Users size={15} /> Add Student/Parent</span>
                </button>
              </div>
            </div>

            {addUserType === "tutor" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-700 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>New Tutor Profile</h3>
                <form onSubmit={(e) => { e.preventDefault(); adminCreateTutorMutation.mutate({ ...addTutorForm, gender: addTutorForm.gender || undefined, bio: addTutorForm.bio || undefined, area: addTutorForm.area || undefined, upiId: addTutorForm.upiId || undefined }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.name} onChange={e => setAddTutorForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rahul Sharma" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label><input required type="email" className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.email} onChange={e => setAddTutorForm(f => ({ ...f, email: e.target.value }))} placeholder="tutor@email.com" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.phone} onChange={e => setAddTutorForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Qualification *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.qualification} onChange={e => setAddTutorForm(f => ({ ...f, qualification: e.target.value }))} placeholder="e.g. B.Tech, M.Sc" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Subjects *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.subjects} onChange={e => setAddTutorForm(f => ({ ...f, subjects: e.target.value }))} placeholder="e.g. Maths, Physics" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Experience *</label><select required className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" value={addTutorForm.experience} onChange={e => setAddTutorForm(f => ({ ...f, experience: e.target.value }))}><option value="">Select</option><option>Less than 1 year</option><option>1-3 years</option><option>3-5 years</option><option>5+ years</option></select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Teaching Mode *</label><select required className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" value={addTutorForm.mode} onChange={e => setAddTutorForm(f => ({ ...f, mode: e.target.value as typeof addTutorForm.mode }))}><option value="home_tuition">Home Tuition</option><option value="online">Online</option><option value="both">Both</option></select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Area in Bengaluru</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.area} onChange={e => setAddTutorForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. Koramangala" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Boards</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.boards} onChange={e => setAddTutorForm(f => ({ ...f, boards: e.target.value }))} placeholder="CBSE, ICSE" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Languages</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.languages} onChange={e => setAddTutorForm(f => ({ ...f, languages: e.target.value }))} placeholder="English, Kannada" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label><select className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" value={addTutorForm.gender} onChange={e => setAddTutorForm(f => ({ ...f, gender: e.target.value as typeof addTutorForm.gender }))}><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">UPI ID</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addTutorForm.upiId} onChange={e => setAddTutorForm(f => ({ ...f, upiId: e.target.value }))} placeholder="tutor@upi" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Bio / About</label><textarea rows={3} className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none" value={addTutorForm.bio} onChange={e => setAddTutorForm(f => ({ ...f, bio: e.target.value }))} placeholder="Brief description of teaching style and experience..." /></div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={adminCreateTutorMutation.isPending} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                      {adminCreateTutorMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Tutor Profile</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {addUserType === "student" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-700 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>New Student / Parent Profile</h3>
                <form onSubmit={(e) => { e.preventDefault(); adminCreateStudentMutation.mutate({ ...addStudentForm, studentName: addStudentForm.studentName || undefined, area: addStudentForm.area || undefined, budget: addStudentForm.budget || undefined, demoTime: addStudentForm.demoTime || undefined, regularTime: addStudentForm.regularTime || undefined, daysPerWeek: addStudentForm.daysPerWeek || undefined, sessionsPerWeek: addStudentForm.sessionsPerWeek || undefined, sessionDuration: addStudentForm.sessionDuration || undefined, specialRequirements: addStudentForm.specialRequirements || undefined }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.name} onChange={e => setAddStudentForm(f => ({ ...f, name: e.target.value }))} placeholder="Parent or student name" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label><input required type="email" className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.email} onChange={e => setAddStudentForm(f => ({ ...f, email: e.target.value }))} placeholder="parent@email.com" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.phone} onChange={e => setAddStudentForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Role *</label><select required className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" value={addStudentForm.role} onChange={e => setAddStudentForm(f => ({ ...f, role: e.target.value as "student" | "parent" }))}><option value="parent">Parent</option><option value="student">Student</option></select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Student Name (if parent)</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.studentName} onChange={e => setAddStudentForm(f => ({ ...f, studentName: e.target.value }))} placeholder="Child's name" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Grade / Class *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.grade} onChange={e => setAddStudentForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. Class 10, Grade 8" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Board *</label><select required className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" value={addStudentForm.board} onChange={e => setAddStudentForm(f => ({ ...f, board: e.target.value as typeof addStudentForm.board }))}><option>CBSE</option><option>ICSE</option><option>State</option><option>IB</option><option>IGCSE</option><option>Other</option></select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Subjects Needed *</label><input required className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.subjects} onChange={e => setAddStudentForm(f => ({ ...f, subjects: e.target.value }))} placeholder="e.g. Maths, Science" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mode *</label><select required className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" value={addStudentForm.mode} onChange={e => setAddStudentForm(f => ({ ...f, mode: e.target.value as typeof addStudentForm.mode }))}><option value="home_tuition">Home Tuition</option><option value="online">Online</option><option value="both">Both</option></select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Area in Bengaluru</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.area} onChange={e => setAddStudentForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. Koramangala" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Budget</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.budget} onChange={e => setAddStudentForm(f => ({ ...f, budget: e.target.value }))} placeholder="e.g. ₹2000-3000/month" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Demo Time Preference</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.demoTime} onChange={e => setAddStudentForm(f => ({ ...f, demoTime: e.target.value }))} placeholder="e.g. Weekday evenings" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Regular Class Time</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.regularTime} onChange={e => setAddStudentForm(f => ({ ...f, regularTime: e.target.value }))} placeholder="e.g. Mon/Wed/Fri 5-6pm" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Days Per Week</label><input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" value={addStudentForm.daysPerWeek} onChange={e => setAddStudentForm(f => ({ ...f, daysPerWeek: e.target.value }))} placeholder="e.g. 3 days" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tutor Gender Preference</label><select className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white" value={addStudentForm.tutorGenderPreference} onChange={e => setAddStudentForm(f => ({ ...f, tutorGenderPreference: e.target.value as typeof addStudentForm.tutorGenderPreference }))}><option value="no_preference">No Preference</option><option value="male">Male Tutor</option><option value="female">Female Tutor</option></select></div>
                  <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Special Requirements</label><textarea rows={3} className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none" value={addStudentForm.specialRequirements} onChange={e => setAddStudentForm(f => ({ ...f, specialRequirements: e.target.value }))} placeholder="Any special needs or notes..." /></div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={adminCreateStudentMutation.isPending} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                      {adminCreateStudentMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Student Profile</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── Hold Management Tab ──────────────────────────────────────────────────────────── */}
        {activeTab === "holdManagement" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-xl" style={{ fontFamily: "'Poppins', sans-serif" }}>Hold Management</h2>
              <span className="text-sm text-gray-500">Put any tutor or student/parent on hold for any reason. They will see a hold notice on their dashboard.</span>
            </div>

            {/* Hold a Tutor */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}><GraduationCap size={18} style={{ color: "oklch(0.68 0.18 50)" }} /> Hold a Tutor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2 px-3 text-gray-500 font-semibold">Name</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Email</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Status</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Hold Reason</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Action</th></tr></thead>
                  <tbody>
                    {(tutorProfiles ?? []).map((tp: { id: number; name: string; email: string; holdStatus: string | null; holdReason: string | null }) => (
                      <tr key={tp.id} className={`border-b hover:bg-gray-50 ${tp.holdStatus === 'held' ? 'bg-red-50' : ''}`}>
                        <td className="py-2 px-3 font-medium">{tp.name}</td>
                        <td className="py-2 px-3 text-gray-500">{tp.email}</td>
                        <td className="py-2 px-3">
                          {tp.holdStatus === 'held'
                            ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">ON HOLD</span>
                            : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs max-w-xs truncate">{tp.holdReason ?? '—'}</td>
                        <td className="py-2 px-3">
                          {tp.holdStatus === 'held' ? (
                            <button onClick={() => unholdTutorMutation.mutate({ id: tp.id })} disabled={unholdTutorMutation.isPending} className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                              Remove Hold
                            </button>
                          ) : (
                            <button onClick={() => { setHoldTargetId(tp.id); setHoldTargetType('tutor'); setHoldReason(''); }} className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                              Put on Hold
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hold a Student/Parent */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}><Users size={18} style={{ color: "oklch(0.68 0.18 50)" }} /> Hold a Student / Parent</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2 px-3 text-gray-500 font-semibold">Name</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Email</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Grade</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Status</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Hold Reason</th><th className="text-left py-2 px-3 text-gray-500 font-semibold">Action</th></tr></thead>
                  <tbody>
                    {(studentProfilesList ?? []).map(sp => (
                      <tr key={sp.id} className={`border-b hover:bg-gray-50 ${sp.holdStatus === 'held' ? 'bg-red-50' : ''}`}>
                        <td className="py-2 px-3 font-medium">{sp.name}</td>
                        <td className="py-2 px-3 text-gray-500">{sp.email}</td>
                        <td className="py-2 px-3 text-gray-500">{sp.grade}</td>
                        <td className="py-2 px-3">
                          {sp.holdStatus === 'held'
                            ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">ON HOLD</span>
                            : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs max-w-xs truncate">{sp.holdReason ?? '—'}</td>
                        <td className="py-2 px-3">
                          {sp.holdStatus === 'held' ? (
                            <button onClick={() => unholdStudentMutation.mutate({ id: sp.id })} disabled={unholdStudentMutation.isPending} className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                              Remove Hold
                            </button>
                          ) : (
                            <button onClick={() => { setHoldTargetId(sp.id); setHoldTargetType('student'); setHoldReason(''); }} className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                              Put on Hold
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Currently Held */}
            {((heldProfiles?.tutors?.length ?? 0) + (heldProfiles?.students?.length ?? 0)) > 0 && (
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h3 className="font-bold text-red-700 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>🛑 Currently On Hold ({(heldProfiles?.tutors?.length ?? 0) + (heldProfiles?.students?.length ?? 0)} profiles)</h3>
                <div className="space-y-3">
                  {heldProfiles?.tutors?.map(tp => (
                    <div key={tp.id} className="bg-white rounded-xl p-4 border border-red-200 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{tp.name} <span className="text-xs text-gray-400">(Tutor)</span></div>
                        <div className="text-xs text-red-600 mt-0.5">Reason: {tp.holdReason}</div>
                        <div className="text-xs text-gray-400">Held by: {tp.heldBy} · {tp.heldAt ? new Date(tp.heldAt).toLocaleString('en-IN') : ''}</div>
                      </div>
                      <button onClick={() => unholdTutorMutation.mutate({ id: tp.id })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200">Remove Hold</button>
                    </div>
                  ))}
                  {heldProfiles?.students?.map(sp => (
                    <div key={sp.id} className="bg-white rounded-xl p-4 border border-red-200 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{sp.name} <span className="text-xs text-gray-400">(Student/Parent)</span></div>
                        <div className="text-xs text-red-600 mt-0.5">Reason: {sp.holdReason}</div>
                        <div className="text-xs text-gray-400">Held by: {sp.heldBy} · {sp.heldAt ? new Date(sp.heldAt).toLocaleString('en-IN') : ''}</div>
                      </div>
                      <button onClick={() => unholdStudentMutation.mutate({ id: sp.id })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200">Remove Hold</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hold Reason Modal */}
        {holdTargetId !== null && holdTargetType !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>🛑 Put on Hold</h3>
              <p className="text-sm text-gray-500 mb-4">Please provide a reason for putting this {holdTargetType} on hold. They will see this reason on their dashboard.</p>
              <textarea
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none mb-4"
                rows={4}
                placeholder="e.g. Payment dispute pending, Complaint under review, Verification required..."
                value={holdReason}
                onChange={e => setHoldReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!holdReason.trim()) { toast.error('Please enter a reason'); return; }
                    if (holdTargetType === 'tutor') holdTutorMutation.mutate({ id: holdTargetId, reason: holdReason });
                    else holdStudentMutation.mutate({ id: holdTargetId, reason: holdReason });
                  }}
                  disabled={holdTutorMutation.isPending || holdStudentMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-60"
                  style={{ backgroundColor: "oklch(0.55 0.2 25)" }}
                >
                  {holdTutorMutation.isPending || holdStudentMutation.isPending ? 'Holding...' : 'Confirm Hold'}
                </button>
                <button onClick={() => { setHoldTargetId(null); setHoldTargetType(null); setHoldReason(''); }} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
