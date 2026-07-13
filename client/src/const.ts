export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Google OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
// Redirects to /api/auth/google which initiates the Google OAuth flow.
export const startLogin = () => {
  window.location.href = "/api/auth/google";
};
