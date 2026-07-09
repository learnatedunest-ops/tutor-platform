/**
 * EduNest Terms of Service Page
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using the EduNest platform (website and services), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users including students, parents, and tutors.",
  },
  {
    title: "2. Description of Services",
    content: "EduNest is an online platform that connects students and parents with home tutors in Bengaluru, Karnataka. We facilitate the discovery and booking of tutors but are not directly involved in the tutoring sessions themselves. EduNest acts as an intermediary and does not employ tutors.",
  },
  {
    title: "3. User Accounts & Registration",
    content: `When registering on EduNest, you agree to:
- Provide accurate, current, and complete information
- Maintain and promptly update your information
- Keep your contact details confidential
- Notify us immediately of any unauthorized use of your account
- Be responsible for all activities that occur under your account

You must be at least 18 years old to register. Parents may register on behalf of their minor children.`,
  },
  {
    title: "4. Tutor Verification & Standards",
    content: `All tutors on EduNest undergo a verification process. However, EduNest does not guarantee the accuracy of tutor-provided information beyond our verification checks. Users are encouraged to:
- Conduct their own due diligence before engaging a tutor
- Use the free demo class to evaluate the tutor
- Report any concerns about a tutor to our team immediately

EduNest reserves the right to remove any tutor from the platform at any time for violations of our standards.`,
  },
  {
    title: "5. Payments & Fees",
    content: `Payments for tutoring sessions are made directly between students/parents and tutors. EduNest does not process or hold payments. Fee arrangements are agreed upon between the tutor and student/parent.

EduNest does not charge students or parents any platform fee. Tutors may be subject to a platform commission after the first month, as communicated during registration.

EduNest is not responsible for any payment disputes between students and tutors.`,
  },
  {
    title: "6. Demo Class Policy",
    content: "The first demo class with any tutor on EduNest is free of charge. This is a trial session to evaluate compatibility. There is no obligation to continue after the demo class. If you choose to continue, fee arrangements are made directly with the tutor.",
  },
  {
    title: "7. Code of Conduct",
    content: `All users of EduNest must:
- Treat all other users with respect and professionalism
- Not engage in harassment, discrimination, or inappropriate behavior
- Not misuse the platform for any illegal or unauthorized purpose
- Not post false, misleading, or defamatory information
- Not attempt to circumvent EduNest's platform by directly soliciting tutors found through EduNest for sessions outside the platform

Violations may result in immediate account suspension or termination.`,
  },
  {
    title: "8. Limitation of Liability",
    content: "EduNest provides its services 'as is' without warranties of any kind. We are not liable for: the quality or outcome of tutoring sessions, any disputes between students and tutors, any loss or damage arising from use of our platform, or any inaccuracies in tutor profiles. Our total liability to any user shall not exceed ₹1,000.",
  },
  {
    title: "9. Intellectual Property",
    content: "All content on the EduNest website, including text, graphics, logos, and software, is the property of EduNest and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.",
  },
  {
    title: "10. Termination",
    content: "EduNest reserves the right to suspend or terminate any user account at any time, with or without notice, for violations of these Terms or for any other reason at our sole discretion. Users may also delete their accounts by contacting us at learn.at.edunest@gmail.com.",
  },
  {
    title: "11. Governing Law",
    content: "These Terms of Service are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.",
  },
  {
    title: "12. Changes to Terms",
    content: "EduNest reserves the right to modify these Terms at any time. We will notify users of significant changes via email or a notice on our website. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. These terms were last updated on June 1, 2025.",
  },
  {
    title: "13. Contact",
    content: `For questions about these Terms of Service, contact us:

EduNest
Email: learn.at.edunest@gmail.com
Phone: +91-8618635627
Address: Bengaluru, Karnataka, India 560001`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <Navbar />

      <section className="py-12 relative" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.75 0.16 55) 100%)" }}>
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Terms of Service</h1>
          <p className="text-white/90" style={{ fontFamily: "'Nunito', sans-serif" }}>Last updated: June 1, 2025</p>
        </div>
      </section>

      <main className="flex-1 container py-12 max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[oklch(0.68_0.18_50)]" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl border border-[oklch(0.92_0.005_80)] p-8 mb-6">
          <p className="leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
            Please read these Terms of Service carefully before using EduNest. These terms govern your use of our platform and services. By using EduNest, you agree to these terms.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-[oklch(0.92_0.005_80)] p-6">
              <h2 className="text-lg font-bold mb-3" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                {section.title}
              </h2>
              {section.content.includes("\n-") ? (
                <div>
                  {section.content.split("\n-").map((part, i) => {
                    if (i === 0) return <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{part}</p>;
                    return (
                      <div key={i} className="flex items-start gap-2 mb-1.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "oklch(0.68 0.18 50)" }} />
                        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{part.trim()}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                  {section.content}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/privacy" className="btn-primary text-sm">View Privacy Policy</Link>
          <Link href="/contact" className="btn-outline text-sm">Contact Us</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
