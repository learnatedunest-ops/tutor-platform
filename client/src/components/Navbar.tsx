/**
 * EduNest Navbar
 * Design: Warm Academic Energy — Orange primary, Poppins headings, sticky with scroll-aware bg
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { startLogin } from "@/const";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { userRole } = useUserRole();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Build role-aware nav links
  const navLinks = [
    { href: "/", label: "Home", show: "always" },
    // Logged-out or student: show Find Tutor
    ...(!isAuthenticated || userRole === "student" || !userRole
      ? [{ href: "/find-tutor", label: "Find Tutor", show: "always" }]
      : []),
    // Logged-out or tutor: show Become a Tutor (right next to Find Tutor)
    ...(!isAuthenticated || userRole === "tutor" || !userRole
      ? [{ href: "/become-tutor", label: "Become a Tutor", show: "always" }]
      : []),
    { href: "/subjects", label: "Subjects", show: "always" },
    { href: "/about", label: "About Us", show: "always" },
    { href: "/contact", label: "Contact", show: "always" },
  ];

  const resourceLinks = [
    { href: "/blog", label: "📝 Blog & Study Tips" },
    { href: "/faq", label: "❓ FAQ" },
    { href: "/subjects", label: "📚 All Subjects" },
    { href: "/refer", label: "🎁 Refer a Friend" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[oklch(0.14_0.02_270)] text-white text-center py-2 text-sm font-medium" style={{ fontFamily: "'Nunito', sans-serif" }}>
        Over <strong className="text-[oklch(0.82_0.14_75)]">5,000 Students</strong> and <strong className="text-[oklch(0.82_0.14_75)]">200 Tutors</strong> trust EduNest every month
        <a href="tel:+918618635627" className="ml-4 inline-flex items-center gap-1 text-[oklch(0.82_0.14_75)] hover:text-white transition-colors">
          <Phone size={12} /> +91-8618635627
        </a>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-md"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/manus-storage/edunest-logo-small_2b84d7c3.png"
                alt="EduNest"
                className="w-9 h-9 object-contain"
              />
              <span
                className="text-2xl font-extrabold"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "oklch(0.68 0.18 50)",
                  letterSpacing: "-0.02em",
                }}
              >
                Edu<span style={{ color: "oklch(0.14 0.02 270)" }}>Nest</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 ${
                    isActive(link.href)
                      ? "text-[oklch(0.68_0.18_50)] bg-[oklch(0.95_0.03_50)]"
                      : "text-[oklch(0.3_0.02_270)] hover:text-[oklch(0.68_0.18_50)] hover:bg-[oklch(0.97_0.01_80)]"
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Resources Dropdown */}
            <div className="hidden lg:block relative" ref={resourcesRef}>
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 flex items-center gap-1 ${
                  location.startsWith("/blog") || location.startsWith("/faq")
                    ? "text-[oklch(0.68_0.18_50)] bg-[oklch(0.95_0.03_50)]"
                    : "text-[oklch(0.3_0.02_270)] hover:text-[oklch(0.68_0.18_50)] hover:bg-[oklch(0.97_0.01_80)]"
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Resources <ChevronDown size={14} className={`transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-[oklch(0.92_0.005_80)] py-2 w-52 z-50">
                  {resourceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center px-4 py-2.5 text-sm font-medium hover:bg-[oklch(0.97_0.01_80)] transition-colors"
                      style={{ color: "oklch(0.3 0.02 270)", fontFamily: "'Poppins', sans-serif" }}
                      onClick={() => setResourcesOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop CTAs — role-aware */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && userRole === "tutor" && (
                <Link href="/tutor-dashboard" className="btn-primary text-sm py-2 px-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  My Dashboard
                </Link>
              )}
              {isAuthenticated && userRole === "student" && (
                <>
                  <Link href="/nearby-tutors" className="text-sm font-semibold py-2 px-4 rounded-xl transition-all hover:bg-[oklch(0.96_0.01_80)]" style={{ color: 'oklch(0.14 0.02 270)', fontFamily: "'Poppins', sans-serif" }}>
                    Find Tutors
                  </Link>
                  <Link href="/portal" className="btn-outline text-sm py-2 px-5">
                    My Portal
                  </Link>
                </>
              )}
              {!isAuthenticated && (
                <button onClick={() => startLogin()} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </button>
              )}
              {isAuthenticated && !userRole && (
                <Link href="/role-select" className="btn-primary text-sm py-2 px-5">
                  Complete Setup
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 rounded-md text-[oklch(0.3_0.02_270)] hover:bg-[oklch(0.96_0.01_80)] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[oklch(0.9_0.005_80)] shadow-lg">
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-md text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? "text-[oklch(0.68_0.18_50)] bg-[oklch(0.95_0.03_50)]"
                      : "text-[oklch(0.3_0.02_270)] hover:bg-[oklch(0.97_0.01_80)]"
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[oklch(0.9_0.005_80)] mt-2 pt-2">
                <p className="px-4 py-1 text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Resources</p>
                {resourceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2.5 text-sm font-medium text-[oklch(0.3_0.02_270)] hover:bg-[oklch(0.97_0.01_80)] transition-colors"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[oklch(0.9_0.005_80)]">
                {isAuthenticated && userRole === "tutor" && (
                  <Link href="/tutor-dashboard" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                    My Dashboard
                  </Link>
                )}
                {isAuthenticated && userRole === "student" && (
                  <>
                    <Link href="/nearby-tutors" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                      Find Tutors Near Me
                    </Link>
                    <Link href="/portal" className="btn-outline text-sm text-center" onClick={() => setMobileOpen(false)}>
                      My Portal
                    </Link>
                  </>
                )}
                {!isAuthenticated && (
                  <button onClick={() => { startLogin(); setMobileOpen(false); }} className="btn-primary text-sm text-center flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Sign in with Google
                  </button>
                )}
                {isAuthenticated && !userRole && (
                  <Link href="/role-select" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                    Complete Setup
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
