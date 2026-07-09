/**
 * EduNest Footer
 * Design: Warm Academic Energy — Dark charcoal bg, orange accents
 */

import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "oklch(0.14 0.02 270)", color: "oklch(0.85 0.005 80)" }}>
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/manus-storage/edunest-logo-v3_f012b9fe.png" alt="EduNest" className="w-8 h-8 object-contain" />
              <span className="text-2xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.68 0.18 50)" }}>
                Edu<span className="text-white">Nest</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              Bengaluru's trusted home tuition platform. Connecting passionate educators with curious learners across the city.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
                  style={{ backgroundColor: "oklch(0.22 0.02 270)", color: "oklch(0.68 0.18 50)" }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/find-tutor", label: "Find a Tutor" },
                { href: "/subjects", label: "All Subjects" },
                { href: "/become-tutor", label: "Become a Tutor" },
                { href: "/about", label: "About Us" },
                { href: "/blog", label: "Blog & Study Tips" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-[oklch(0.68_0.18_50)]"
                    style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Popular Subjects
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Mathematics", href: "/find-tutor?subject=Mathematics" },
                { label: "Science (Physics/Chemistry)", href: "/find-tutor?subject=Science" },
                { label: "English Language", href: "/find-tutor?subject=English" },
                { label: "Commerce & Accounts", href: "/find-tutor?subject=Commerce" },
                { label: "JEE / NEET Prep", href: "/find-tutor?subject=Competitive+Exams" },
                { label: "Computer Science", href: "/find-tutor?subject=Computer+Science" },
              ].map((subject) => (
                <li key={subject.label}>
                  <Link
                    href={subject.href}
                    className="text-sm transition-colors hover:text-[oklch(0.68_0.18_50)]"
                    style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {subject.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Get In Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                <a href="tel:+918618635627" className="text-sm hover:text-[oklch(0.68_0.18_50)] transition-colors" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                  +91-8618635627
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                <a href="mailto:learn.at.edunest@gmail.com" className="text-sm hover:text-[oklch(0.68_0.18_50)] transition-colors" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                  learn.at.edunest@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                <span className="text-sm" style={{ color: "oklch(0.65 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                  Bengaluru, Karnataka, India
                </span>
              </li>
            </ul>

            {/* App Download */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-white mb-3 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Download Our App</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: "oklch(0.22 0.02 270)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
                  <span className="text-base">📱</span> Google Play Store
                </a>
                <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: "oklch(0.22 0.02 270)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
                  <span className="text-base">🍎</span> Apple App Store
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid oklch(0.22 0.02 270)" }}>
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
            © 2025 EduNest. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "FAQ", href: "/faq" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="text-xs transition-colors hover:text-[oklch(0.68_0.18_50)]" style={{ color: "oklch(0.5 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
