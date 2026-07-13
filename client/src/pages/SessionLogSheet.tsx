/**
 * SessionLogSheet — Daily Tuition Time Duration Sheet
 * Printable single A4 page with EduNest logo header.
 * URL: /session-log/:matchId
 * - Tutor & student can both view and print this page.
 * - 26 rows for session entries (date, in-time, out-time, duration, parent signature).
 * - Print button triggers window.print(); CSS hides everything except the sheet.
 * - Designed to fit exactly one A4 page when printed.
 */
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS = 26;
const LOGO_URL = "/manus-storage/edunest-logo-small_2b84d7c3.png";

export default function SessionLogSheet() {
  const { matchId } = useParams<{ matchId: string }>();
  const matchIdNum = parseInt(matchId ?? "0", 10);

  const { data: sessionLog, isLoading } = trpc.sessionLog.getByMatchId.useQuery(
    { matchId: matchIdNum },
    { enabled: !!matchIdNum }
  );

  // We also need the confirmed match for tutor/student names
  const { data: matches } = trpc.confirmedMatch.listAll.useQuery(undefined, {
    retry: false,
  });
  const match = matches?.find((m: any) => m.id === matchIdNum);

  const tutorName = sessionLog?.tutorName ?? match?.tutorName ?? "___________________________";
  const studentName = sessionLog?.studentName ?? match?.studentName ?? "___________________________";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* ── Toolbar (hidden on print) ── */}
      <div className="no-print bg-white border-b shadow-sm px-6 py-3 flex items-center gap-4">
        <Link href="/tutor-dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex-1" />
        <p className="text-sm text-gray-500">
          Class C{matchIdNum} · Session Log Sheet
        </p>
        <Button
          onClick={() => window.print()}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          size="sm"
        >
          <Printer size={16} /> Print / Save as PDF
        </Button>
      </div>

      {/* ── A4 Sheet ── */}
      <div
        className="session-sheet mx-auto my-8 bg-white shadow-lg print:shadow-none print:my-0"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "8mm 10mm 6mm 10mm",
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "9.5pt",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Header — Logo left, Teacher/Student right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4mm" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
            <img
              src={LOGO_URL}
              alt="EduNest"
              style={{ height: "14mm", width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Title center */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <p style={{ fontSize: "12pt", fontWeight: "bold", margin: 0, letterSpacing: "0.5px" }}>
              Daily Tuition Time Duration Sheet
            </p>
            <p style={{ fontSize: "8pt", color: "#555", margin: "1mm 0 0 0" }}>
              Class ID: C{matchIdNum}
            </p>
          </div>

          {/* Teacher / Student names */}
          <div style={{ textAlign: "right", fontSize: "9pt", minWidth: "70mm" }}>
            <p style={{ margin: "0 0 2mm 0" }}>
              <strong>Teacher:</strong>{" "}
              <span style={{ borderBottom: "1px solid #000", minWidth: "45mm", display: "inline-block", paddingLeft: "3px", marginBottom: "1px" }}>
                {tutorName}
              </span>
            </p>
            <p style={{ margin: 0 }}>
              <strong>Student:</strong>{" "}
              <span style={{ borderBottom: "1px solid #000", minWidth: "45mm", display: "inline-block", paddingLeft: "3px", marginBottom: "1px" }}>
                {studentName}
              </span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "2px solid #000", marginBottom: "3mm" }} />

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "8.5pt",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: "9mm" }} />
            <col style={{ width: "28mm" }} />
            <col style={{ width: "26mm" }} />
            <col style={{ width: "26mm" }} />
            <col style={{ width: "36mm" }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              {[
                "S.No",
                "Date",
                "In Time",
                "Out Time",
                "Total Duration\n(Out − In)",
                "Parent / Guardian Signature",
              ].map((label, i) => (
                <th
                  key={i}
                  style={{
                    border: "1px solid #000",
                    padding: "1.5mm 2mm",
                    textAlign: "center",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    whiteSpace: "pre-line",
                    lineHeight: "1.3",
                    fontSize: "8.5pt",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #000", padding: "0 2mm", textAlign: "center", fontSize: "7.5pt", color: "#555", height: "8mm", verticalAlign: "middle" }}>
                  {i + 1}
                </td>
                <td style={{ border: "1px solid #000", height: "8mm" }} />
                <td style={{ border: "1px solid #000", height: "8mm" }} />
                <td style={{ border: "1px solid #000", height: "8mm" }} />
                <td style={{ border: "1px solid #000", height: "8mm" }} />
                <td style={{ border: "1px solid #000", height: "8mm" }} />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: "4mm", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "8.5pt" }}>
          <div>
            <p style={{ borderTop: "1px solid #000", paddingTop: "2mm", minWidth: "55mm", margin: 0 }}>
              Tutor Signature
            </p>
          </div>
          <div style={{ textAlign: "center", fontSize: "7.5pt", color: "#666" }}>
            <p style={{ margin: "0 0 1mm 0" }}>EduNest · learn.at.edunest@gmail.com · +91-8618635627</p>
            <p style={{ margin: 0 }}>Bengaluru, Karnataka</p>
          </div>
          <div>
            <p style={{ borderTop: "1px solid #000", paddingTop: "2mm", minWidth: "55mm", textAlign: "right", margin: 0 }}>
              Parent / Guardian Signature
            </p>
          </div>
        </div>
      </div>

      {/* Print CSS — single A4 page, no page breaks */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          html, body { margin: 0; padding: 0; background: white; }
          .session-sheet {
            margin: 0 !important;
            box-shadow: none !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
