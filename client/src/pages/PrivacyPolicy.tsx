/**
 * EduNest Privacy Policy Page
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you use EduNest, we collect the following types of information:

**Personal Information:** Name, email address, phone number, city/area in Bengaluru, and educational details provided during registration or when contacting us.

**Usage Information:** Pages visited, search queries, tutor profiles viewed, and other interactions with our website.

**Communication Data:** Messages sent through our contact form or email correspondence with our team.

We do not collect payment information directly — all payments are handled between students and tutors.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

- Match students with suitable tutors based on subject, location, and requirements
- Contact you regarding your tutor inquiry or registration
- Send relevant updates about EduNest services (you can opt out at any time)
- Improve our platform and user experience
- Respond to customer support requests
- Comply with legal obligations

We do not sell, rent, or share your personal information with third parties for marketing purposes.`,
  },
  {
    title: "3. Information Sharing",
    content: `We share your information only in the following circumstances:

**With Tutors:** When you book a demo class or express interest in a tutor, we share your name and contact number with the relevant tutor so they can reach you.

**With Service Providers:** We may share data with trusted service providers who assist us in operating our website (e.g., hosting, analytics). These providers are bound by confidentiality agreements.

**Legal Requirements:** We may disclose information if required by law or to protect the rights, safety, or property of EduNest, our users, or the public.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your personal information, including:

- Secure HTTPS connections for all data transmission
- Regular security audits of our systems
- Limited access to personal data on a need-to-know basis
- Secure storage of all user data

However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`,
  },
  {
    title: "5. Cookies",
    content: `EduNest uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us:

- Remember your preferences and settings
- Understand how you use our website
- Improve our services based on usage patterns

You can control cookie settings through your browser. Disabling cookies may affect some functionality of our website.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the following rights regarding your personal data:

- **Access:** Request a copy of the personal data we hold about you
- **Correction:** Request correction of inaccurate or incomplete data
- **Deletion:** Request deletion of your personal data (subject to legal obligations)
- **Opt-out:** Unsubscribe from marketing communications at any time

To exercise any of these rights, contact us at learn.at.edunest@gmail.com.`,
  },
  {
    title: "7. Children's Privacy",
    content: `EduNest serves students of all ages, including minors. We do not knowingly collect personal information directly from children under 13. All registrations and inquiries for minor students must be made by a parent or guardian.

Parents and guardians can contact us to review, update, or delete information related to their child.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we make significant changes, we will notify users via email or a prominent notice on our website. Your continued use of EduNest after changes are posted constitutes acceptance of the updated policy.

This policy was last updated on June 1, 2025.`,
  },
  {
    title: "9. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:

**EduNest**
Email: learn.at.edunest@gmail.com
Phone: +91-8618635627
Address: Bengaluru, Karnataka, India 560001
Support Hours: Mon–Sat, 9:00 AM – 7:00 PM IST`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <Navbar />

      {/* Header */}
      <section className="py-12" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.75 0.16 55) 100%)" }}>
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Privacy Policy</h1>
          <p className="text-white/90" style={{ fontFamily: "'Nunito', sans-serif" }}>Last updated: June 1, 2025</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
            <path d="M0 50 C360 0 1080 0 1440 50 L1440 50 L0 50 Z" fill="oklch(0.99 0.005 80)" />
          </svg>
        </div>
      </section>

      <main className="flex-1 container py-12 max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[oklch(0.68_0.18_50)]" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl border border-[oklch(0.92_0.005_80)] p-8 mb-6">
          <p className="leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
            At EduNest, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-[oklch(0.92_0.005_80)] p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.content.split("\n\n").map((para, i) => {
                  if (para.startsWith("**") && para.includes(":**")) {
                    const parts = para.split(":**");
                    return (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                        <strong style={{ color: "oklch(0.14 0.02 270)" }}>{parts[0].replace("**", "")}:</strong>{parts[1]}
                      </p>
                    );
                  }
                  if (para.includes("\n- ")) {
                    const [intro, ...items] = para.split("\n- ");
                    return (
                      <div key={i}>
                        {intro && <p className="text-sm mb-2" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{intro}</p>}
                        <ul className="space-y-1 ml-4">
                          {items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "oklch(0.68 0.18 50)" }} />
                              {item.replace(/\*\*(.*?)\*\*/g, "$1")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="text-sm leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                      {para.replace(/\*\*(.*?)\*\*/g, "$1")}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/terms" className="btn-primary text-sm">View Terms of Service</Link>
          <Link href="/contact" className="btn-outline text-sm">Contact Us</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
