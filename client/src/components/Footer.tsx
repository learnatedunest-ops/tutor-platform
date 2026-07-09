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
                { href: "/refer", label: "Refer a Friend" },
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

            {/* WhatsApp CTA */}
            <div className="mt-6">
              <a
                href="https://wa.me/918618635627?text=Hi%20EduNest%2C%20I%20want%20to%20book%20a%20free%20demo%20class"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#25D366", color: "white", fontFamily: "'Poppins', sans-serif" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
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
