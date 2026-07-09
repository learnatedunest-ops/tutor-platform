/**
 * EduConnect Navbar
 * Design: Warm Academic Energy — Orange primary, Poppins headings, sticky with scroll-aware bg
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/find-tutor", label: "Find Tutor" },
    { href: "/become-tutor", label: "Become a Tutor" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[oklch(0.14_0.02_270)] text-white text-center py-2 text-sm font-medium" style={{ fontFamily: "'Nunito', sans-serif" }}>
        Over <strong className="text-[oklch(0.82_0.14_75)]">100,000 Students</strong> and <strong className="text-[oklch(0.82_0.14_75)]">2,500 Tutors</strong> trust EduConnect every month
        <a href="tel:+918107008788" className="ml-4 inline-flex items-center gap-1 text-[oklch(0.82_0.14_75)] hover:text-white transition-colors">
          <Phone size={12} /> +91-8107008788
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
                src="/manus-storage/logo-symbol_3af76bb4.png"
                alt="EduConnect"
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
                Edu<span style={{ color: "oklch(0.14 0.02 270)" }}>Connect</span>
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

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/become-tutor" className="btn-outline text-sm py-2 px-5">
                Become a Tutor
              </Link>
              <Link href="/find-tutor" className="btn-primary text-sm py-2 px-5">
                Find a Tutor
              </Link>
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
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[oklch(0.9_0.005_80)]">
                <Link href="/become-tutor" className="btn-outline text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Become a Tutor
                </Link>
                <Link href="/find-tutor" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Find a Tutor
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
