/**
 * useSessionTimeout
 * Auto-logs out the user after TIMEOUT_MS of inactivity (no mouse/keyboard/touch events).
 * Only active when the user is authenticated AND has a role (tutor or student).
 * Shows a 60-second warning toast before logging out.
 */

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 60 * 1000;       // warn 1 minute before

export function useSessionTimeout(isAuthenticated: boolean, userRole: string | null | undefined) {
  const logoutMutation = trpc.auth.logout.useMutation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningToastId = useRef<string | number | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (warningToastId.current) toast.dismiss(warningToastId.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated || !userRole) return;
    clearTimers();

    // Warning toast 1 minute before logout
    warningRef.current = setTimeout(() => {
      warningToastId.current = toast.warning(
        "You will be logged out in 1 minute due to inactivity.",
        { duration: WARNING_MS, id: "session-warning" }
      );
    }, TIMEOUT_MS - WARNING_MS);

    // Auto-logout
    timeoutRef.current = setTimeout(async () => {
      toast.dismiss("session-warning");
      toast.info("You have been logged out due to inactivity.", { duration: 5000 });
      try {
        await logoutMutation.mutateAsync();
      } catch {
        // ignore — redirect anyway
      }
      window.location.href = "/";
    }, TIMEOUT_MS);
  }, [isAuthenticated, userRole, clearTimers, logoutMutation]);

  useEffect(() => {
    if (!isAuthenticated || !userRole) {
      clearTimers();
      return;
    }

    // Start the timer
    resetTimer();

    // Reset on any user activity
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const handleActivity = () => resetTimer();

    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      clearTimers();
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [isAuthenticated, userRole, resetTimer, clearTimers]);
}
