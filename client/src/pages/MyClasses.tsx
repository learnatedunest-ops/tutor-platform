/**
 * EduNest — My Classes (Student / Parent)
 * Shows all confirmed matches for the student with:
 *  - Tutor details
 *  - Session log sheet link (view/print)
 *  - Payment status (shown once tutor uploads the sheet)
 *  - Payment instructions
 */
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  ArrowLeft, FileText, CreditCard, ExternalLink,
  Loader2, BookOpen, User, CheckCircle2, GraduationCap,
  Phone, Mail, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyClasses() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) startLogin();
  }, [loading, isAuthenticated]);

  const { data: myProfile, isLoading: profileLoading } = trpc.studentProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // All confirmed matches
  const { data: allMatches, isLoading: matchesLoading } = trpc.confirmedMatch.listAll.useQuery(
    undefined,
    { enabled: isAuthenticated && !!myProfile }
  );

  // Filter to only this student's matches
  const myMatches = allMatches?.filter((m: any) => m.studentProfileId === myProfile?.id) ?? [];

  // Session logs for this student
  const { data: mySessionLogs, isLoading: logsLoading } = trpc.sessionLog.myStudentLogs.useQuery(
    undefined,
    { enabled: isAuthenticated && !!myProfile }
  );

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.98 0.01 80)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.68 0.18 50)" }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.98 0.01 80)", fontFamily: "'Nunito', sans-serif" }}>
      <SEO title="My Classes — EduNest" description="View your ongoing tuition classes and payment status" />

      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center gap-4">
        <Link href="/portal">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> My Portal
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
            📚 My Classes
          </h1>
          <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
            Your ongoing tuition classes and payment information
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {matchesLoading || logsLoading ? (
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
              Classes will appear here once both you and a tutor agree to proceed after a demo.
            </p>
            <Link href="/portal">
              <Button size="sm" style={{ backgroundColor: "oklch(0.68 0.18 50)" }} className="text-white">
                Go to My Portal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Poppins', sans-serif" }}>
              {myMatches.length} ongoing class{myMatches.length !== 1 ? "es" : ""}
            </p>
            {myMatches.map((match: any) => {
              const log = mySessionLogs?.find((l: any) => l.matchId === match.id);
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl shadow-sm border p-5"
                  style={{ borderColor: "oklch(0.92 0.005 80)" }}
                >
                  {/* Tutor info */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
                      <GraduationCap size={18} style={{ color: "oklch(0.68 0.18 50)" }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>
                        {match.tutorName ?? `Tutor #${match.tutorProfileId}`}
                      </h3>
                      <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
                        Classes started {match.matchedAt ? new Date(match.matchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  </div>

                  {/* Tutor contact (revealed after match) */}
                  {(match.tutorPhone || match.tutorEmail) && (
                    <div className="rounded-xl p-3 mb-4 space-y-1.5" style={{ backgroundColor: "oklch(0.97 0.03 50)" }}>
                      <p className="text-xs font-bold" style={{ color: "oklch(0.55 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                        Tutor Contact
                      </p>
                      {match.tutorPhone && (
                        <a href={`tel:${match.tutorPhone}`} className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.35 0.02 270)" }}>
                          <Phone size={12} style={{ color: "oklch(0.68 0.18 50)" }} /> {match.tutorPhone}
                        </a>
                      )}
                      {match.tutorEmail && (
                        <a href={`mailto:${match.tutorEmail}`} className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.35 0.02 270)" }}>
                          <Mail size={12} style={{ color: "oklch(0.68 0.18 50)" }} /> {match.tutorEmail}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Session sheet & payment */}
                  <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "oklch(0.97 0.01 80)" }}>
                    <p className="text-xs font-bold" style={{ color: "oklch(0.35 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                      💳 Session Sheet & Payment
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {/* View session sheet */}
                      <a
                        href={`/session-log/${match.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                      >
                        <FileText size={13} /> View / Print Session Sheet
                      </a>

                      {/* Payment status badge */}
                      {log ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                          log.paymentStatus === "payment_processed"
                            ? "bg-green-100 text-green-700"
                            : log.paymentStatus === "sheet_uploaded"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          <CreditCard size={13} />
                          {log.paymentStatus === "payment_processed"
                            ? "✅ Payment Processed"
                            : log.paymentStatus === "sheet_uploaded"
                            ? "⏳ Payment Pending — Please make payment"
                            : "Awaiting Session Sheet from Tutor"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500">
                          <CreditCard size={13} /> Awaiting Session Sheet from Tutor
                        </span>
                      )}

                      {/* View uploaded sheet */}
                      {log?.uploadedSheetUrl && (
                        <a
                          href={log.uploadedSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          <ExternalLink size={13} /> View Submitted Sheet
                        </a>
                      )}
                    </div>

                    {/* Payment instructions */}
                    {log?.paymentStatus === "sheet_uploaded" && (
                      <div className="rounded-lg p-3 bg-yellow-50 border border-yellow-200">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">📢 Payment Required</p>
                        <p className="text-xs text-yellow-700">
                          Your tutor has submitted the session log sheet. Please make the payment as agreed and contact EduNest to confirm.
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          📧 <a href="mailto:learn.at.edunest@gmail.com" className="underline">learn.at.edunest@gmail.com</a>
                          {" · "}📞 <a href="tel:+918618635627" className="underline">+91-8618635627</a>
                        </p>
                      </div>
                    )}
                    {log?.paymentStatus === "payment_processed" && (
                      <p className="text-xs text-green-600 font-semibold">
                        🎉 Payment confirmed by EduNest. Thank you!
                      </p>
                    )}
                    {!log && (
                      <p className="text-xs" style={{ color: "oklch(0.65 0.01 270)" }}>
                        The session sheet will be submitted by your tutor after classes are complete. You will see the payment status here.
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
