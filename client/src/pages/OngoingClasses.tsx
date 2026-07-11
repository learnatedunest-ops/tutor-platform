/**
 * EduNest — Ongoing Classes (Tutor)
 * Shows all confirmed matches for the tutor with:
 *  - Student details
 *  - Session log sheet download/print link
 *  - Upload completed sheet (image/PDF, max 10 MB)
 *  - Payment status badge (shown only after upload)
 */
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { startLogin } from "@/const";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  ArrowLeft, FileText, Upload, CreditCard, ExternalLink,
  Loader2, BookOpen, User, CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OngoingClasses() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!loading && !isAuthenticated) startLogin();
  }, [loading, isAuthenticated]);

  const { data: myProfile, isLoading: profileLoading } = trpc.tutorProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // All confirmed matches for this tutor
  const { data: allMatches, isLoading: matchesLoading } = trpc.confirmedMatch.listAll.useQuery(
    undefined,
    { enabled: isAuthenticated && myProfile?.status === "approved" }
  );

  // Filter to only this tutor's matches
  const myMatches = allMatches?.filter((m: any) => m.tutorProfileId === myProfile?.id) ?? [];

  // Session logs for this tutor
  const { data: mySessionLogs, refetch: refetchLogs } = trpc.sessionLog.myLogs.useQuery(
    undefined,
    { enabled: isAuthenticated && myProfile?.status === "approved" }
  );

  const getOrCreateLog = trpc.sessionLog.getOrCreate.useMutation({
    onSuccess: () => refetchLogs(),
    onError: (err) => toast.error(err.message ?? "Failed to initialise session log"),
  });

  const uploadSheet = trpc.sessionLog.uploadSheet.useMutation({
    onSuccess: () => {
      refetchLogs();
      toast.success("✅ Sheet uploaded! EduNest will review and process your payment.");
    },
    onError: (err) => toast.error(err.message ?? "Upload failed"),
  });

  if (loading || roleLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.98 0.01 80)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (myProfile?.status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "oklch(0.98 0.01 80)" }}>
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
          <p className="font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Profile not yet approved</p>
          <p className="text-sm text-gray-500 mb-4">Your tutor profile needs to be approved by EduNest before you can see ongoing classes.</p>
          <Link href="/tutor-dashboard">
            <Button variant="outline" size="sm" className="gap-2"><ArrowLeft size={14} /> Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.98 0.01 80)", fontFamily: "'Nunito', sans-serif" }}>
      <SEO title="Ongoing Classes — EduNest" description="Manage your ongoing tuition classes" />

      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center gap-4">
        <Link href="/tutor-dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            📚 My Ongoing Classes
          </h1>
          <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
            Manage session sheets and track payments for your confirmed students
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {matchesLoading ? (
          <div className="text-center py-16">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="text-sm text-gray-500">Loading your classes...</p>
          </div>
        ) : myMatches.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" style={{ color: "oklch(0.68 0.18 50)" }} />
            <p className="font-semibold text-base mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.35 0.02 270)" }}>
              No ongoing classes yet
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Classes will appear here once both you and a student/parent agree to proceed after a demo.
            </p>
            <Link href="/tutor-dashboard">
              <Button size="sm" style={{ backgroundColor: "oklch(0.68 0.18 50)" }} className="text-white">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>
              {myMatches.length} confirmed class{myMatches.length !== 1 ? "es" : ""}
            </p>
            {myMatches.map((match: any) => {
              const log = mySessionLogs?.find((l: any) => l.matchId === match.id);
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl shadow-sm border p-5"
                  style={{ borderColor: "oklch(0.92 0.005 80)" }}
                >
                  {/* Student info */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
                      <User size={18} style={{ color: "oklch(0.68 0.18 50)" }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                        {match.studentName ?? `Student #${match.studentProfileId}`}
                      </h3>
                      <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
                        Matched on {match.matchedAt ? new Date(match.matchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  </div>

                  {/* Session sheet actions */}
                  <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "oklch(0.97 0.01 80)" }}>
                    <p className="text-xs font-bold" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                      📋 Session Log Sheet
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {/* Download/Print sheet */}
                      <a
                        href={`/session-log/${match.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                      >
                        <FileText size={13} /> Download / Print Sheet
                      </a>

                      {log ? (
                        <>
                          {/* Payment badge — only after upload */}
                          {(log.paymentStatus === "sheet_uploaded" || log.paymentStatus === "payment_processed") && (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                              log.paymentStatus === "payment_processed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              <CreditCard size={13} />
                              {log.paymentStatus === "payment_processed" ? "✅ Payment Processed" : "⏳ Payment Pending"}
                            </span>
                          )}

                          {/* Upload / Re-upload button */}
                          {log.paymentStatus !== "payment_processed" && (
                            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors cursor-pointer">
                              <Upload size={13} />
                              {log.paymentStatus === "sheet_uploaded" ? "Re-upload Sheet" : "Upload Completed Sheet"}
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  e.target.value = "";
                                  if (file.size > 10 * 1024 * 1024) {
                                    toast.error("File too large. Maximum size is 10 MB.");
                                    return;
                                  }
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  try {
                                    toast.info("Uploading sheet...");
                                    const res = await fetch("/api/upload-session-sheet", {
                                      method: "POST",
                                      body: formData,
                                      credentials: "include",
                                    });
                                    const json = await res.json().catch(() => ({}));
                                    if (!res.ok) throw new Error(json?.error ?? `Upload failed (${res.status})`);
                                    const { url } = json;
                                    if (!url) throw new Error("No URL returned from server");
                                    uploadSheet.mutate({ logId: log.id, uploadedSheetUrl: url });
                                  } catch (err: any) {
                                    toast.error(err?.message ?? "Upload failed. Please try again with a JPEG, PNG, or PDF.");
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
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              <ExternalLink size={13} /> View Uploaded Sheet
                            </a>
                          )}
                        </>
                      ) : (
                        /* No log yet — initialise */
                        <button
                          onClick={() => getOrCreateLog.mutate({ matchId: match.id })}
                          disabled={getOrCreateLog.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                        >
                          {getOrCreateLog.isPending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                          Upload Completed Sheet
                        </button>
                      )}
                    </div>

                    {/* Upload instructions */}
                    {log?.paymentStatus !== "payment_processed" && (
                      <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
                        After all sessions are complete, take a clear photo of the signed sheet and upload it here. EduNest will verify and process your payment.
                      </p>
                    )}
                    {log?.paymentStatus === "payment_processed" && (
                      <p className="text-xs text-green-600 font-semibold">
                        🎉 Payment has been processed by EduNest. Thank you!
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
