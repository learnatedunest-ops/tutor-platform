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
  ChevronRight, CheckCircle2, Calendar, Home, ShieldCheck, ShieldAlert,
  Upload, FileText, CreditCard, ExternalLink, BookMarked, Phone
} from "lucide-react";

function ModeLabel({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    home_tuition: "Home Tuition",
    online: "Online",
    both: "Both",
  };
  return <span>{map[mode] ?? mode}</span>;
}

/** Reusable button that fetches a presigned S3 URL before opening the sheet */
function ViewSheetButton({ logId, label = 'View Uploaded Sheet', className }: { logId: number; label?: string; className?: string }) {
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
    } catch {
      alert('Failed to open sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className ?? 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60'}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
      {loading ? 'Opening...' : label}
    </button>
  );
}

/** Sub-component: availability confirmation + reschedule suggestion for a single demo slot */
function DemoSlotAvailabilityCard({ slot, onDone }: { slot: any; onDone: () => void }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [suggestDate, setSuggestDate] = useState("");
  const [suggestTime, setSuggestTime] = useState("");

  const tutorConfirmComing = trpc.demoSlot.tutorConfirmComing.useMutation({
    onSuccess: () => { onDone(); toast.success("Confirmed! The student will be notified."); },
    onError: (err) => toast.error(err.message ?? "Failed to confirm"),
  });
  const suggestReschedule = trpc.demoSlot.suggestReschedule.useMutation({
    onSuccess: () => { setShowReschedule(false); onDone(); toast.success("Reschedule suggestion sent to parent!"); },
    onError: (err) => toast.error(err.message ?? "Failed to send suggestion"),
  });

  return (
    <div className="mt-3 p-3 rounded-xl border-2" style={{ borderColor: "oklch(0.88 0.12 145)", backgroundColor: "oklch(0.97 0.03 145)" }}>
      <p className="text-sm font-semibold mb-1" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
        🚗 Are you available for this demo?
      </p>
      <p className="text-xs mb-3" style={{ color: "oklch(0.55 0.01 270)" }}>Confirm so the parent knows to expect you, or suggest a new time if you can't make it.</p>
      {!showReschedule ? (
        <div className="flex gap-2">
          <button
            onClick={() => tutorConfirmComing.mutate({ slotId: slot.id, response: 'yes' })}
            disabled={tutorConfirmComing.isPending}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
          >
            {tutorConfirmComing.isPending ? <span className="animate-pulse">...</span> : "✔ Yes, I'm Available"}
          </button>
          <button
            onClick={() => setShowReschedule(true)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all hover:bg-orange-50"
            style={{ borderColor: "oklch(0.88 0.12 50)", color: "oklch(0.55 0.18 50)" }}
          >
            🔄 Suggest New Time
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold" style={{ color: "oklch(0.14 0.02 270)" }}>Suggest a time that works for you:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "oklch(0.45 0.01 270)" }}>Date</label>
              <input
                type="date"
                value={suggestDate}
                onChange={e => setSuggestDate(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                style={{ borderColor: "oklch(0.88 0.05 50)" }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "oklch(0.45 0.01 270)" }}>Time</label>
              <input
                type="time"
                value={suggestTime}
                onChange={e => setSuggestTime(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                style={{ borderColor: "oklch(0.88 0.05 50)" }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => suggestReschedule.mutate({ slotId: slot.id, suggestedDate: suggestDate, suggestedTime: suggestTime })}
              disabled={!suggestDate || !suggestTime || suggestReschedule.isPending}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: "oklch(0.68 0.18 50)" }}
            >
              {suggestReschedule.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Send Suggestion to Parent"}
            </button>
            <button
              onClick={() => setShowReschedule(false)}
              className="px-3 py-2 rounded-lg text-sm border"
              style={{ borderColor: "oklch(0.88 0.05 50)", color: "oklch(0.55 0.01 270)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Sub-component: My Classes card for a single confirmed match (completed demo) */
function MyClassCard({ slot, mySessionLogs, onRefreshLogs, onRefreshMatches }: { slot: any; mySessionLogs: any[]; onRefreshLogs: () => void; onRefreshMatches?: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState("");

  const requestCancellation = trpc.confirmedMatch.requestCancellation.useMutation({
    onSuccess: () => {
      toast.success("Cancellation request submitted. EduNest will review and process it.");
      setCancelConfirmOpen(false);
      setCancelNote("");
      onRefreshMatches?.();
    },
    onError: (err) => toast.error(err.message || "Failed to submit cancellation request."),
  });

  const uploadSheetFile = trpc.sessionLog.uploadSheetFile.useMutation({
    onSuccess: (data) => {
      setIsUploading(false);
      onRefreshLogs();
      toast.success("✅ Sheet uploaded successfully! EduNest will review and process your payment.");
    },
    onError: (err) => {
      setIsUploading(false);
      toast.error(err.message ?? "Upload failed. Please try again.");
    },
  });

  // Support both old demo-slot shape (confirmedMatchId) and new enriched confirmed-match shape (id)
  const matchId: number | null = (slot as any).confirmedMatchId ?? (slot as any).id ?? null;

  // Session log: prefer inline fields from enriched match query, fall back to mySessionLogs lookup
  const inlineLog = (slot as any).sessionLogId != null ? {
    id: (slot as any).sessionLogId as number,
    matchId: matchId,
    paymentStatus: (slot as any).paymentStatus as string | null,
    uploadedSheetUrl: (slot as any).uploadedSheetUrl as string | null,
  } : null;
  const log = inlineLog ?? (matchId ? mySessionLogs?.find((l: any) => l.matchId === matchId) : null);

  const parentName = (slot as any).studentName as string | undefined;
  const childName = (slot as any).studentChildName as string | undefined;
  const role = (slot as any).studentRole as string | undefined;
  const displayName = role === 'parent' && childName ? `${childName}` : (parentName ?? 'Student');
  const parentLabel = role === 'parent' && parentName ? `Parent: ${parentName}` : null;

  const grade = (slot as any).studentGrade as string | undefined;
  const subjects = (slot as any).studentSubjects as string | undefined;
  const budget = (slot as any).studentBudget ?? (slot as any).paymentAmount as string | undefined;
  const area = (slot as any).studentArea as string | undefined;
  const phone = (slot as any).studentPhone as string | undefined;
  const addr = (slot as any).studentAddress as string | undefined;
  const mapsUrl = addr
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`
    : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10 MB.');
      return;
    }

    if (!matchId) {
      toast.error('Match ID not found. Please refresh the page.');
      return;
    }

    setIsUploading(true);
    toast.info('Uploading sheet...');

    try {
      // Read file as base64
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const fileBase64 = btoa(binary);

      uploadSheetFile.mutate({
        matchId,
        fileBase64,
        mimeType: file.type || 'image/jpeg',
        fileName: file.name || 'sheet.jpg',
      });
    } catch (err: any) {
      setIsUploading(false);
      toast.error(err?.message ?? 'Failed to read file. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
      {/* Card header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "oklch(0.95 0.005 80)", backgroundColor: "oklch(0.99 0.01 145)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "oklch(0.95 0.05 145)" }}>
              <User size={18} style={{ color: "oklch(0.45 0.18 145)" }} />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                {displayName}
              </h3>
              {parentLabel && (
                <p className="text-xs" style={{ color: "oklch(0.55 0.01 270)" }}>{parentLabel}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {slot.classStatus === 'cancellation_requested' ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                ⏳ Cancellation Under Review
              </span>
            ) : slot.classStatus === 'cancelled' ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                🚫 Class Stopped
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={11} /> Got a Class
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Student details */}
        <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "oklch(0.97 0.01 240)" }}>
          <p className="text-xs font-bold" style={{ color: "oklch(0.35 0.08 240)", fontFamily: "'Poppins', sans-serif" }}>📋 Student Details</p>
          <div className="flex flex-wrap gap-2">
            {grade && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">📚 {grade}</span>
            )}
            {subjects && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">📖 {subjects}</span>
            )}
            {area && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">📍 {area}</span>
            )}
            {budget && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">💰 ₹{budget}/month</span>
            )}
          </div>
          {/* Full contact details — shown in My Classes after class is confirmed */}
          {phone && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-gray-600">📞 Phone:</span>
              <a href={`tel:${phone}`} className="text-blue-700 underline hover:text-blue-900 font-medium">{phone}</a>
            </div>
          )}
          {addr && (
            <div className="mt-1 flex items-start gap-1.5 text-xs">
              <span className="font-semibold text-gray-600 shrink-0">🏠 Address:</span>
              <span className="text-gray-700">{addr}</span>
            </div>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "oklch(0.45 0.18 240)" }}
            >
              <ExternalLink size={12} /> Open in Google Maps
            </a>
          )}
        </div>

        {/* Demo info */}
        {slot.scheduledDate && slot.scheduledTime && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.45 0.01 270)" }}>
            <Calendar size={13} style={{ color: "oklch(0.68 0.18 50)" }} />
            <span>Demo was on <strong>{slot.scheduledDate} at {slot.scheduledTime}</strong></span>
          </div>
        )}

        {/* Session Log Sheet */}
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "oklch(0.97 0.01 80)" }}>
          <p className="text-xs font-bold" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
            📋 Session Log Sheet
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Download/Print */}
            {matchId && (
              <a
                href={`/session-log/${matchId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                <FileText size={13} /> Download / Print Sheet
              </a>
            )}

            {/* Payment badge — tutor only sees sheet_uploaded and payment_processed; parent_paid is hidden */}
            {log && (log.paymentStatus === 'sheet_uploaded' || log.paymentStatus === 'parent_paid' || log.paymentStatus === 'payment_processed') && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                log.paymentStatus === 'payment_processed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <CreditCard size={13} />
                {log.paymentStatus === 'payment_processed'
                  ? '✅ Fee Paid — EduNest has processed your payment'
                  : '⏳ Fee Pending — Awaiting EduNest Processing'}
              </span>
            )}

            {/* Upload button — shown unless payment is processed */}
            {(!log || log.paymentStatus !== 'payment_processed') && (
              <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isUploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}>
                {isUploading ? (
                  <><Loader2 size={13} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={13} /> {log?.paymentStatus === 'sheet_uploaded' ? 'Re-upload Sheet' : 'Upload Completed Sheet'}</>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf,.pdf"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileChange}
                />
              </label>
            )}

            {/* View uploaded sheet */}
            {log?.uploadedSheetUrl && log?.id && (
              <ViewSheetButton logId={log.id} />
            )}
          </div>

          {/* Instructions */}
          {(!log || log.paymentStatus === 'pending') && (
            <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
              After all sessions are complete, take a clear photo of the signed sheet and upload it here. EduNest will verify and process your payment.
            </p>
          )}
          {(log?.paymentStatus === 'sheet_uploaded' || log?.paymentStatus === 'parent_paid') && (
            <p className="text-xs text-yellow-700">
              ⏳ Sheet received! EduNest is processing your payment. You'll receive an email once the fee is transferred to your UPI ID.
            </p>
          )}
          {log?.paymentStatus === 'payment_processed' && (
            <div className="space-y-2">
              <p className="text-xs text-green-600 font-semibold">
                🎉 Your fee has been processed by EduNest and sent to your UPI ID. Thank you!
              </p>
              <div className="rounded-lg p-3 border" style={{ backgroundColor: "oklch(0.97 0.02 145)", borderColor: "oklch(0.85 0.08 145)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.35 0.12 145)" }}>ℹ️ From the next month onwards:</p>
                <p className="text-xs" style={{ color: "oklch(0.40 0.08 145)" }}>
                  Payment will be made directly by the parent to you — without the involvement of EduNest. Please coordinate with the parent for future payments.
                </p>
                <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.05 270)" }}>
                  For any concerns or disputes, contact EduNest at <a href="mailto:learn.at.edunest@gmail.com" className="underline font-semibold">learn.at.edunest@gmail.com</a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Class section */}
        {slot.classStatus !== 'cancelled' && slot.classStatus !== 'cancellation_requested' && (
          <div className="border-t pt-4" style={{ borderColor: "oklch(0.93 0.005 80)" }}>
            {cancelConfirmOpen ? (
              <div className="space-y-2">
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
                    onClick={() => matchId && requestCancellation.mutate({ matchId, requestedBy: 'tutor', note: cancelNote })}
                    disabled={requestCancellation.isPending || !matchId}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {requestCancellation.isPending ? 'Submitting...' : 'Yes, Request Cancellation'}
                  </button>
                  <button
                    onClick={() => { setCancelConfirmOpen(false); setCancelNote(''); }}
                    className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    No, Keep Class
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCancelConfirmOpen(true)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                Request Cancellation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TutorDashboard() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [activeTab, setActiveTab] = useState<'demos' | 'classes' | 'interests' | 'find'>('demos');

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

  // Session logs for this tutor
  const { data: mySessionLogs, refetch: refetchSessionLogs } = trpc.sessionLog.myLogs.useQuery(
    undefined,
    { enabled: isAuthenticated && myProfile?.status === "approved" }
  );

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

  // Get active student IDs (students already in active class with this tutor — hide from Find Students)
  const { data: activeStudentIds } = trpc.confirmedMatch.getActiveStudentIds.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const activeStudentIdSet = new Set<number>(activeStudentIds ?? []);

  // Load existing interests from DB so state persists across refreshes
  const { data: myInterests } = trpc.tutorInterest.getMyInterests.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Track dismissed demo slot cards (after user clicks "Go to My Classes")
  const [dismissedDemoSlotIds, setDismissedDemoSlotIds] = useState<Set<number>>(new Set());

  // Build a map of studentProfileId → status from DB data + local optimistic adds
  const [localExpressedIds, setLocalExpressedIds] = useState<Set<number>>(new Set());
  const interestStatusMap = new Map<number, string>(
    myInterests?.map(i => [i.studentProfileId, i.status]) ?? []
  );
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

  // Derive "My Classes" slots: completed demos where both parties said yes
  const myClassSlots = demoSlots?.filter((slot: any) =>
    slot.status === "completed" &&
    slot.tutorProceedIntent === "yes" &&
    slot.studentProceedIntent === "yes"
  ) ?? [];

  // Count pending student interests
  const pendingInterestsCount = approvedStudentInterests?.filter((i: any) => i.status === 'pending').length ?? 0;

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

  // Hold check — admin has put this tutor on hold
  if ((myProfile as any).holdStatus === "held") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border-2 border-red-200">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
            <ShieldAlert size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-700" style={{ fontFamily: "'Poppins', sans-serif" }}>Account On Hold</h1>
          <p className="text-gray-500 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Your account has been temporarily put on hold by the EduNest team. You cannot access the dashboard or take any actions until the hold is removed.</p>
          {(myProfile as any).holdReason && (
            <div className="bg-red-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-xs font-bold text-red-600 mb-1">Reason:</p>
              <p className="text-sm text-red-700">{(myProfile as any).holdReason}</p>
            </div>
          )}
          <p className="text-sm text-gray-400" style={{ fontFamily: "'Nunito', sans-serif" }}>Please contact EduNest at <a href="tel:+918618635627" className="text-orange-600 font-semibold">+91-8618635627</a> or <a href="mailto:learn.at.edunest@gmail.com" className="text-orange-600 font-semibold">learn.at.edunest@gmail.com</a>.</p>
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
      <SEO title="Tutor Dashboard — EduNest" description="View nearby student requirements on EduNest." url="https://edunest.courses/tutor-dashboard" />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/api/img/edunest-logo-small_2b84d7c3.png" alt="EduNest" className="w-8 h-8 object-contain" />
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border mb-6 overflow-hidden" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
          <div className="flex border-b" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
            {([
              { id: 'demos', label: '📅 Demo Classes', count: demoSlots?.filter((s: any) => s.status !== 'completed' || (s.tutorProceedIntent !== 'yes' || s.studentProceedIntent !== 'yes')).length },
              { id: 'classes', label: '🎓 My Classes', count: myClassSlots.length },
              { id: 'interests', label: '👥 Student Interests', count: pendingInterestsCount },
              { id: 'find', label: '🔍 Find Students', count: null },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-3 text-xs font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: "oklch(0.68 0.18 50)" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab: Demo Classes ─────────────────────────────────────────── */}
        {activeTab === 'demos' && (
          <div>
            {slotsLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                <p className="text-sm text-gray-500">Loading demo schedule...</p>
              </div>
            ) : !demoSlots?.length ? (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                <Calendar size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                <p className="font-semibold text-sm mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>No demo classes yet</p>
                <p className="text-xs text-gray-400">Demo slots will appear here once students schedule with you.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {demoSlots
                  .filter((slot: any) => !dismissedDemoSlotIds.has(slot.id))
                  .map((slot: any) => (
                  <div key={slot.id} className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
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

                        {/* Student contact details once demo is scheduled */}
                        {(slot.status === "scheduled" || slot.status === "completed") && (() => {
                          const addr = (slot as any).studentAddress as string | undefined;
                          const mapsUrl = addr
                            ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`
                            : null;
                          const parentName = (slot as any).studentName as string | undefined;
                          const childName = (slot as any).studentChildName as string | undefined;
                          const role = (slot as any).studentRole as string | undefined;
                          const displayName = role === 'parent' && childName ? `${childName} (Parent: ${parentName})` : (parentName ?? 'Student');
                          const grade = (slot as any).studentGrade as string | undefined;
                          const subjects = (slot as any).studentSubjects as string | undefined;
                          const budget = (slot as any).studentBudget as string | undefined;
                          const area = (slot as any).studentArea as string | undefined;
                          return (
                            <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
                              <p className="text-xs font-bold text-blue-800">📋 Student / Parent Details</p>
                              <p className="text-xs text-blue-900 font-semibold">👤 {displayName}</p>
                              <div className="flex flex-wrap gap-2">
                                {grade && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">📚 {grade}</span>}
                                {subjects && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">📖 {subjects}</span>}
                                {area && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">📍 {area}</span>}
                              </div>
                              {budget && (
                                <p className="text-xs font-semibold" style={{ color: 'oklch(0.45 0.18 50)' }}>💰 Budget: ₹{budget}/month</p>
                              )}
                              {/* Address and phone are private — EduNest shares contact details directly */}
                              {mapsUrl && (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                                  style={{ backgroundColor: "oklch(0.45 0.18 240)" }}
                                >
                                  <ExternalLink size={12} /> Open in Google Maps
                                </a>
                              )}
                            </div>
                          );
                        })()}

                        {/* Tutor: Confirm Coming for Demo */}
                        {slot.status === "scheduled" && (slot as any).tutorConfirmedComing === 'pending' && (
                          <DemoSlotAvailabilityCard slot={slot} onDone={refetchSlots} />
                        )}
                        {slot.status === "scheduled" && (slot as any).tutorConfirmedComing === 'yes' && (
                          <div className="mt-3 p-2 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-xs font-semibold text-green-700">✔ You confirmed you're available. The parent has been notified.</p>
                          </div>
                        )}
                        {slot.status === "scheduled" && (slot as any).tutorConfirmedComing === 'no' && (() => {
                          const suggestedDate = (slot as any).tutorSuggestedDate;
                          const suggestedTime = (slot as any).tutorSuggestedTime;
                          const parentResponse = (slot as any).parentRescheduleResponse;
                          return (
                            <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                              {suggestedDate && suggestedTime ? (
                                <>
                                  <p className="text-xs font-semibold text-orange-800 mb-1">🔄 Reschedule Suggestion Sent</p>
                                  <p className="text-xs text-orange-700">You suggested: <strong>{suggestedDate} at {suggestedTime}</strong></p>
                                  {parentResponse === 'accepted' && <p className="text-xs text-green-700 font-semibold mt-1">✔ Parent accepted your suggested time.</p>}
                                  {parentResponse === 'declined' && <p className="text-xs text-red-700 font-semibold mt-1">✕ Parent kept their original time. Please contact EduNest if needed.</p>}
                                  {!parentResponse && <p className="text-xs text-orange-600 mt-1">⏳ Waiting for parent's response...</p>}
                                </>
                              ) : (
                                <p className="text-xs font-semibold text-red-700">❌ You indicated you can't make it. Use the "Suggest New Time" option above to propose an alternative.</p>
                              )}
                            </div>
                          );
                        })()}

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
                        {slot.status === "completed" && (slot as any).tutorProceedIntent === "yes" && (slot as any).studentProceedIntent === "yes" && (
                          <div className="mt-3 p-3 rounded-xl border-2" style={{ borderColor: "oklch(0.88 0.18 145)", backgroundColor: "oklch(0.96 0.04 145)" }}>
                            <p className="text-sm font-bold mb-1" style={{ color: "oklch(0.35 0.12 145)", fontFamily: "'Poppins', sans-serif" }}>
                              🎉 Both parties agreed to proceed!
                            </p>
                            <p className="text-xs mb-3" style={{ color: "oklch(0.45 0.08 145)" }}>Your class has been confirmed. Go to My Classes to track sessions and manage payments.</p>
                            <button
                              onClick={() => {
                                setDismissedDemoSlotIds(prev => new Set(prev).add(slot.id));
                                setActiveTab('classes');
                              }}
                              className="w-full py-2 px-4 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                              style={{ backgroundColor: "oklch(0.55 0.18 145)" }}
                            >
                              📚 Go to My Classes →
                            </button>
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

        {/* ── Tab: My Classes ───────────────────────────────────────────── */}
        {activeTab === 'classes' && (
          <div>
            {!myConfirmedMatches ? (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                <p className="text-sm text-gray-500">Loading your classes...</p>
              </div>
            ) : myConfirmedMatches.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                <BookMarked size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                <p className="font-semibold text-sm mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>No confirmed classes yet</p>
                <p className="text-xs text-gray-400 mb-3">Classes appear here once both you and the student/parent agree to proceed after a demo.</p>
                <button
                  onClick={() => setActiveTab('demos')}
                  className="text-xs px-4 py-2 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: "oklch(0.68 0.18 50)" }}
                >
                  View Demo Classes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>
                  {myConfirmedMatches.length} confirmed class{myConfirmedMatches.length !== 1 ? "es" : ""}
                </p>
                {myConfirmedMatches.map((match: any) => (
                  <MyClassCard
                    key={match.id}
                    slot={match}
                    mySessionLogs={mySessionLogs ?? []}
                    onRefreshLogs={refetchSessionLogs}
                    onRefreshMatches={refetchConfirmedMatches}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Student Interests ────────────────────────────────────── */}
        {activeTab === 'interests' && (
          <div className="bg-white rounded-2xl shadow-sm border p-5" style={{ borderColor: "oklch(0.88 0.12 145)" }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} style={{ color: "oklch(0.55 0.18 145)" }} />
              <h2 className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>Student Interests</h2>
              {approvedStudentInterests && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "oklch(0.95 0.05 145)", color: "oklch(0.35 0.12 145)" }}>
                  {pendingInterestsCount} pending
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
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-red-50 disabled:opacity-50"
                            style={{ borderColor: "oklch(0.88 0.12 20)", color: "oklch(0.55 0.18 20)" }}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      ) : interest.status === 'confirmed' ? (
                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">
                            ✔ Accepted
                          </span>
                          {interest.demoSlotId && (
                            <button
                              onClick={() => setActiveTab('demos')}
                              className="text-xs px-2.5 py-1 rounded-full font-semibold border transition-all hover:opacity-80"
                              style={{ borderColor: "oklch(0.68 0.18 50)", color: "oklch(0.68 0.18 50)" }}
                            >
                              📅 View Demo Details
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 bg-red-100 text-red-700">
                          ✕ Declined
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Find Students ────────────────────────────────────────── */}
        {activeTab === 'find' && (
          <div>
            {/* Location & Radius Controls */}
            <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Navigation size={18} style={{ color: "oklch(0.68 0.18 50)" }} />
                <h2 className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>Find Nearby Students</h2>
              </div>
              <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.01 270)" }}>
                Allow location access to see students looking for tutors in your area.
              </p>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs font-semibold" style={{ color: "oklch(0.45 0.01 270)" }}>Search Radius:</label>
                <select
                  value={radiusKm}
                  onChange={e => setRadiusKm(Number(e.target.value))}
                  className="border rounded-lg px-2 py-1 text-sm"
                  style={{ borderColor: "oklch(0.88 0.005 80)" }}
                >
                  {[5, 10, 15, 20, 30].map(r => (
                    <option key={r} value={r}>{r} km</option>
                  ))}
                </select>
              </div>
              {!location ? (
                <button
                  onClick={getLocation}
                  disabled={locLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                  style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                >
                  {locLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                  {locLoading ? "Getting Location..." : "Allow Location Access"}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-semibold">✔ Location active</span>
                  <button
                    onClick={() => refetch()}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all hover:bg-gray-50"
                    style={{ borderColor: "oklch(0.88 0.005 80)", color: "oklch(0.45 0.01 270)" }}
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              )}
              {locError && (
                <p className="text-xs text-red-500 mt-2">{locError}</p>
              )}
            </div>

            {/* Nearby Students List */}
            {location && (
              <div>
                {studentsLoading ? (
                  <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "oklch(0.68 0.18 50)" }} />
                    <p className="text-sm text-gray-500">Searching for students nearby...</p>
                  </div>
                ) : !nearbyStudents?.length ? (
                  <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                    <MapPin size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                    <p className="font-semibold text-sm mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>No students found nearby</p>
                    <p className="text-xs text-gray-400">Try increasing the search radius or check back later.</p>
                  </div>
) : (
                  <div className="space-y-3">
                    {(() => {
                      const filteredStudents = (nearbyStudents ?? []).filter((s: any) => !activeStudentIdSet.has(s.id));
                      if (!filteredStudents.length) return (
                        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                          <MapPin size={40} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
                          <p className="font-semibold text-sm mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>No new students available</p>
                          <p className="text-xs text-gray-400">Students already in your active classes are hidden. Try increasing the radius or check back later.</p>
                        </div>
                      );
                      return (<>
                    <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>
                      {filteredStudents.length} new student{filteredStudents.length !== 1 ? "s" : ""} within {radiusKm} km
                    </p>
                    {filteredStudents.map((student: any) => {
                      const status = interestStatusMap.get(student.id);
                      return (
                        <div key={student.id} className="bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                                  {student.role === "parent" ? "Parent" : "Student"} — {student.grade ?? "Grade N/A"}
                                </span>
                                {(student as any).distKm != null && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: "oklch(0.97 0.03 50)", color: "oklch(0.68 0.18 50)" }}>
                                    <MapPin size={10} />
                                    {(student as any).distKm < 1 ? `${Math.round((student as any).distKm * 1000)} m away` : `${((student as any).distKm as number).toFixed(1)} km away`}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {student.subjects && (
                                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                                    {student.subjects}
                                  </span>
                                )}
                                {student.mode && (
                                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                                    <ModeLabel mode={student.mode} />
                                  </span>
                                )}
                                {student.area && (
                                  <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
                                    📍 {student.area}
                                  </span>
                                )}
                              </div>
                              {student.budget && (
                                <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.45 0.01 270)" }}>
                                  <IndianRupee size={12} />
                                  <span>Budget: ₹{student.budget}/month</span>
                                </div>
                              )}
                            </div>
                            <div className="shrink-0">
                              {!status ? (
                                <button
                                  onClick={() => expressInterest.mutate({ studentProfileId: student.id })}
                                  disabled={expressInterest.isPending}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                                  style={{ backgroundColor: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}
                                >
                                  {expressInterest.isPending ? <Loader2 size={13} className="animate-spin" /> : <ChevronRight size={13} />}
                                  Express Interest
                                </button>
                              ) : (
                                <span className={`text-xs px-2.5 py-1.5 rounded-full font-semibold ${
                                  status === 'accepted' ? 'bg-green-100 text-green-700' :
                                  status === 'declined' ? 'bg-red-100 text-red-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {status === 'accepted' ? '✔ Accepted' :
                                   status === 'declined' ? '✕ Declined' :
                                   '⏳ Pending'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>);
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
