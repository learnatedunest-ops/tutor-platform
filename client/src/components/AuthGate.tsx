/**
 * AuthGate — wraps the entire app router.
 * After OAuth login completes, checks if the user has a userRole set.
 * If not, redirects to /role-select.
 * If yes, redirects to the appropriate setup/dashboard page if they haven't completed setup.
 *
 * This component does NOT block rendering — it just fires a redirect as a side effect.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

// Pages that should NOT trigger the role-select redirect (public pages, admin, etc.)
const EXEMPT_PATHS = [
  "/role-select",
  "/tutor-setup",
  "/student-setup",
  "/admin",
  "/",
  "/find-tutor",
  "/become-tutor",
  "/about",
  "/contact",
  "/subjects",
  "/blog",
  "/faq",
  "/privacy",
  "/terms",
  "/refer",
  "/seo-guide",
  "/404",
];

function isExempt(path: string): boolean {
  if (EXEMPT_PATHS.includes(path)) return true;
  if (path.startsWith("/blog/")) return true;
  if (path.startsWith("/tutor/")) return true;
  return false;
}

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [location, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();

  // Auto-logout after 30 minutes of inactivity for logged-in users with a role
  useSessionTimeout(isAuthenticated, userRole);

  useEffect(() => {
    // Wait until both auth and role are resolved
    if (authLoading || roleLoading) return;
    // Only act on authenticated users
    if (!isAuthenticated) return;
    // Don't redirect from exempt pages
    if (isExempt(location)) return;

    // If no role set yet, send to role selection
    if (userRole === null) {
      navigate("/role-select");
      return;
    }

    // If tutor visiting student-only pages, redirect to tutor dashboard
    if (userRole === "tutor" && (location === "/nearby-tutors" || location === "/portal")) {
      navigate("/tutor-dashboard");
      return;
    }

    // If student visiting tutor-only pages, redirect to nearby tutors
    if (userRole === "student" && location === "/tutor-dashboard") {
      navigate("/nearby-tutors");
      return;
    }
  }, [authLoading, roleLoading, isAuthenticated, userRole, location, navigate]);

  return <>{children}</>;
}
