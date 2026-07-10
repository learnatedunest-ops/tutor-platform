/**
 * PhoneOtpVerifier — inline OTP verification widget
 * Shows a "Verify Phone" button next to the phone input.
 * When clicked, sends OTP and shows a 6-digit input field.
 * On success, shows a green "Verified ✓" badge.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";

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

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = trpc.otp.send.useMutation({
    onSuccess: () => {
      setStage("sent");
      setCountdown(60);
      setError("");
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
            <Phone className="w-3 h-3" />
          )}
          Verify Phone Number
        </Button>
      )}

      {stage === "sent" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            Enter the 6-digit OTP sent to <strong>{phone}</strong>
          </p>
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
                onClick={() => sendOtp.mutate({ phone })}
                disabled={sendOtp.isPending}
              >
                Resend OTP
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
