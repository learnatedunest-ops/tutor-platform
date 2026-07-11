/**
 * SessionLogSheet — Daily Tuition Time Duration Sheet
 * Printable A4 sheet matching the handwritten format in the reference image.
 * URL: /session-log/:matchId
 * - Tutor & student can both view and print this page.
 * - 20 rows for session entries (date, in-time, out-time, duration, parent signature).
 * - Print button triggers window.print(); CSS hides everything except the sheet.
 */
import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Printer, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS = 20;

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
          Match #{matchIdNum} · Session Log Sheet
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
            minHeight: "297mm",
            padding: "12mm 12mm",
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "10.5pt",
          }}
      >
        {/* Header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p style={{ fontSize: "10pt", marginBottom: "2mm" }}>
              <strong>EduNest</strong> — Daily Tuition Time Duration
            </p>
            <div className="flex items-end gap-2">
              <span style={{ fontSize: "10pt" }}>Daily Tuition time duration</span>
              <span
                style={{
                  borderBottom: "1px solid #000",
                  minWidth: "80mm",
                  display: "inline-block",
                  marginBottom: "1px",
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <p style={{ fontSize: "10pt" }}>
              <strong>Teacher Name</strong>{" "}
              <span
                style={{
                  borderBottom: "1px solid #000",
                  minWidth: "60mm",
                  display: "inline-block",
                  paddingLeft: "4px",
                  marginBottom: "1px",
                }}
              >
                {tutorName}
              </span>
            </p>
            <p style={{ fontSize: "9pt", marginTop: "2mm" }}>
              <strong>Student Name</strong>{" "}
              <span
                style={{
                  borderBottom: "1px solid #000",
                  minWidth: "55mm",
                  display: "inline-block",
                  paddingLeft: "4px",
                  marginBottom: "1px",
                }}
              >
                {studentName}
              </span>
            </p>
          </div>
        </div>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10pt",
          }}
        >
          <thead>
            <tr>
              {[
                { label: "S.No", width: "8mm" },
                { label: "Date", width: "28mm" },
                { label: "In Time", width: "28mm" },
                { label: "Out Time", width: "28mm" },
                { label: "Total time duration\n(Out Time - In Time)", width: "40mm" },
                { label: "Parents signature", width: "auto" },
              ].map((col, i) => (
                <th
                  key={i}
                  style={{
                    border: "1px solid #000",
                    padding: "2mm 2mm",
                    textAlign: "center",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    width: col.width,
                    whiteSpace: "pre-line",
                    lineHeight: "1.2",
                    fontSize: "9.5pt",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, i) => (
              <tr key={i}>
                {/* S.No */}
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5mm 2mm",
                    textAlign: "center",
                    fontSize: "8pt",
                    color: "#555",
                    verticalAlign: "top",
                    height: "10mm",
                  }}
                >
                  {i + 1}
                </td>
                {/* Date */}
                <td style={{ border: "1px solid #000", padding: "0.5mm 2mm", height: "10mm" }} />
                {/* In Time */}
                <td style={{ border: "1px solid #000", padding: "0.5mm 2mm", height: "10mm" }} />
                {/* Out Time */}
                <td style={{ border: "1px solid #000", padding: "0.5mm 2mm", height: "10mm" }} />
                {/* Duration */}
                <td style={{ border: "1px solid #000", padding: "0.5mm 2mm", height: "10mm" }} />
                {/* Parent Signature */}
                <td style={{ border: "1px solid #000", padding: "0.5mm 2mm", height: "10mm" }} />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-end" style={{ fontSize: "9pt" }}>
          <div>
            <p style={{ borderTop: "1px solid #000", paddingTop: "2mm", minWidth: "60mm" }}>
              Tutor Signature
            </p>
          </div>
          <div className="text-center" style={{ fontSize: "8pt", color: "#666" }}>
            <p>EduNest · learn.at.edunest@gmail.com · +91-8618635627</p>
            <p>Bengaluru, Karnataka</p>
          </div>
          <div>
            <p style={{ borderTop: "1px solid #000", paddingTop: "2mm", minWidth: "60mm", textAlign: "right" }}>
              Parent / Guardian Signature
            </p>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .session-sheet {
            margin: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
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
