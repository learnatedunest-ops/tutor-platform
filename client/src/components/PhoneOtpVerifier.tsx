/**
 * PhoneOtpVerifier — inline OTP verification widget
 * Shows a "Verify Phone" button next to the phone input.
 * When clicked, sends a 6-digit OTP to the user's registered email address.
 * If email delivery is restricted (Resend test sender), shows the code directly in the UI.
 * On success, shows a green "Verified ✓" badge.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Mail, ShieldCheck, Eye } from "lucide-react";

interface PhoneOtpVerifierProps {
  phone: string;
  profileType: "tutor" | "student";
  onVerified: () => void;
  alreadyVerified?: boolean;
}

export default function PhoneOtpVerifier({
  phone,
  profileType,
  onVerified,
  alreadyVerified = false,
}: PhoneOtpVerifierProps) {
  const [stage, setStage] = useState<"idle" | "sent" | "verified">(
    alreadyVerified ? "verified" : "idle"
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  // fallbackCode is returned when Resend can't deliver to arbitrary emails (test sender)
  const [fallbackCode, setFallbackCode] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  // Sync verified state when alreadyVerified prop changes (async profile load)
  useEffect(() => {
    if (alreadyVerified && stage !== "verified") {
      setStage("verified");
    }
  }, [alreadyVerified]);

  // Reset to idle when phone number changes (user edited the field)
  const [lastPhone, setLastPhone] = useState(phone);
  useEffect(() => {
    if (phone !== lastPhone && stage === "sent") {
      setStage("idle");
      setCode("");
      setError("");
      setCountdown(0);
      setMaskedEmail(null);
      setFallbackCode(null);
      setShowFallback(false);
    }
    setLastPhone(phone);
  }, [phone]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = trpc.otp.send.useMutation({
    onSuccess: (data) => {
      setStage("sent");
      setCountdown(60);
      setError("");
      setMaskedEmail(data.maskedEmail ?? null);
      // If server returns a fallback code (email can't reach arbitrary recipients), show it in UI
      if (data.fallbackCode) {
        setFallbackCode(data.fallbackCode);
      }
    },
    onError: (e) => setError(e.message),
  });

  const verifyOtp = trpc.otp.verify.useMutation({
    onSuccess: () => {
      setStage("verified");
      setError("");
      onVerified();
    },
    onError: (e) => setError(e.message),
  });

  if (!phone || phone.length < 10) return null;

  if (stage === "verified") {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-1">
        <CheckCircle2 className="w-4 h-4" />
        Phone Verified
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {stage === "idle" && (
        <div className="space-y-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-300 hover:bg-orange-50 gap-2"
            onClick={() => sendOtp.mutate({ phone })}
            disabled={sendOtp.isPending}
          >
            {sendOtp.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Mail className="w-3 h-3" />
            )}
            {sendOtp.isPending ? "Sending…" : "Verify Phone via Email OTP"}
          </Button>
          <p className="text-xs text-muted-foreground">
            A 6-digit code will be sent to your registered email address.
          </p>
        </div>
      )}

      {stage === "sent" && (
        <div className="space-y-2">
          {fallbackCode ? (
            // Fallback: email couldn't be delivered to arbitrary recipients — show code in UI
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2">
              <p className="text-sm text-orange-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                Your verification code is ready
              </p>
              <p className="text-xs text-orange-600">
                Email delivery is currently in test mode. Your OTP code is shown below — enter it to verify your phone number.
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 rounded-md border border-orange-300 bg-white px-3 py-2 text-center font-mono text-2xl font-bold tracking-[0.3em] text-orange-600 select-all"
                  style={{ letterSpacing: "0.3em" }}
                >
                  {showFallback ? fallbackCode : "••••••"}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 gap-1.5"
                  onClick={() => setShowFallback(v => !v)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showFallback ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>
                A 6-digit OTP was sent to{" "}
                <strong>{maskedEmail ?? "your registered email"}</strong>
                {" "}to verify phone <strong>{phone}</strong>.
                Check your inbox (and spam folder).
              </span>
            </p>
          )}

          <div className="flex gap-2 items-center">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-32 text-center text-lg tracking-widest font-mono"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => verifyOtp.mutate({ phone, code, profileType })}
              disabled={code.length !== 6 || verifyOtp.isPending}
            >
              {verifyOtp.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                className="text-orange-500 underline hover:no-underline"
                onClick={() => {
                  setFallbackCode(null);
                  setShowFallback(false);
                  sendOtp.mutate({ phone });
                }}
                disabled={sendOtp.isPending}
              >
                {sendOtp.isPending ? "Sending…" : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
}
