/**
 * useUserRole — fetches the current user's userRole (tutor | student | null).
 * Returns loading state so consumers can wait before redirecting.
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function useUserRole() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data, isLoading } = trpc.auth.getRole.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  return {
    userRole: data?.userRole ?? null,
    loading: authLoading || (isAuthenticated && isLoading),
  };
}
