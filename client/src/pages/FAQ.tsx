/**
 * EduNest FAQ Page
 * Design: Warm Academic Energy — Accordion-style Q&A
 */

import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, ArrowRight, Phone, Mail } from "lucide-react";

const faqCategories = [
  {
    category: "For Students & Parents",
    icon: "🎓",
    faqs: [
      {
        q: "How do I find a tutor on EduNest?",
        a: "Simply visit our 'Find a Tutor' page, enter your subject and area in Bengaluru, and browse through verified tutor profiles. You can filter by subject, grade, teaching mode (home/online), and budget. Once you find a suitable tutor, click 'Book Demo Class' to schedule a free first session.",
      },
      {
        q: "Is the first demo class really free?",
        a: "Yes, absolutely! Every tutor on EduNest offers a free first demo class with no commitment required. This gives you the opportunity to evaluate the tutor's teaching style and compatibility with your child before deciding to continue.",
      },
      {
        q: "How are tutors verified on EduNest?",
        a: "All tutors go through a thorough verification process that includes: identity verification (Aadhaar/PAN), educational qualification check, a teaching demo evaluation by our team, and background screening. Only tutors who pass all checks receive the 'Verified' badge.",
      },
      {
        q: "What subjects and grades does EduNest cover?",
        a: "EduNest covers all subjects from Pre-Primary to Class 12, including Mathematics, Science (Physics, Chemistry, Biology), English, Commerce, Computer Science, Languages (Hindi, Kannada, French, German), and competitive exam preparation (JEE, NEET, Karnataka CET, NTSE).",
      },
      {
        q: "Can I get both home tuition and online tuition?",
        a: "Yes! EduNest tutors offer both home tuition (tutor visits your home in Bengaluru) and online tuition (via video call). You can filter tutors by teaching mode on the Find a Tutor page. Some tutors offer both options.",
      },
      {
        q: "What is the typical fee range for tutors?",
        a: "Tutor fees on EduNest typically range from ₹300–₹1,000 per hour depending on the subject, grade level, tutor's experience and qualifications, and teaching mode. You can see each tutor's rate on their profile before booking.",
      },
      {
        q: "How do I pay the tutor?",
        a: "Payment is made directly to the tutor. You can pay via UPI, bank transfer, or cash as agreed with the tutor. EduNest does not charge any platform fee to students or parents.",
      },
      {
        q: "What if I'm not satisfied with the tutor after the demo?",
        a: "If you're not satisfied after the demo class, simply don't continue — there's no obligation. You can search for another tutor on EduNest. Our team is also happy to help you find a better match if you contact us.",
      },
      {
        q: "Which areas in Bengaluru does EduNest serve?",
        a: "EduNest currently has tutors across 15+ areas in Bengaluru including Koramangala, Indiranagar, HSR Layout, Whitefield, Jayanagar, JP Nagar, Bannerghatta Road, Electronic City, Marathahalli, Hebbal, Yelahanka, Rajajinagar, Malleshwaram, BTM Layout, and Sarjapur Road.",
      },
    ],
  },
  {
    category: "For Tutors",
    icon: "👩‍🏫",
    faqs: [
      {
        q: "How do I register as a tutor on EduNest?",
        a: "Visit our 'Become a Tutor' page and fill in the registration form with your details, qualifications, subjects, and teaching experience. Our team will review your application and contact you within 24 hours for a verification call and teaching demo.",
      },
      {
        q: "Is there a fee to join EduNest as a tutor?",
        a: "No, joining EduNest is completely free. We do not charge any registration fee. For the first month, there is also no commission on your earnings. After the first month, a small platform fee applies to help us maintain and grow the platform.",
      },
      {
        q: "How will I receive student inquiries?",
        a: "Once your profile is live, you will receive student inquiries directly via phone call or WhatsApp from our team. We match students to tutors based on subject, location, and availability, and connect you directly.",
      },
      {
        q: "Can I set my own rates?",
        a: "Yes, tutors on EduNest set their own hourly rates. We provide guidance on market rates in Bengaluru to help you price competitively, but the final decision is entirely yours.",
      },
      {
        q: "How quickly can I start getting students?",
        a: "Most tutors receive their first student inquiry within 3-7 days of their profile going live, depending on the subject demand in their area. High-demand subjects like Mathematics, Science, and JEE/NEET prep tend to get inquiries faster.",
      },
    ],
  },
  {
    category: "Platform & Technical",
    icon: "⚙️",
    faqs: [
      {
        q: "Is EduNest available as a mobile app?",
        a: "Our mobile app is currently in development and will be available on Android and iOS soon. In the meantime, our website is fully mobile-responsive and works perfectly on all smartphones.",
      },
      {
        q: "How do I contact EduNest support?",
        a: "You can reach us at +91-8618635627 (Mon–Sat, 9 AM – 7 PM IST) or email us at learn.at.edunest@gmail.com. We typically respond within 2-4 hours during business hours.",
      },
      {
        q: "Is my personal information safe on EduNest?",
        a: "Yes. We take data privacy seriously. Your personal information is never shared with third parties without your consent. We use industry-standard security measures to protect all data. Please read our Privacy Policy for full details.",
      },
    ],
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <Navbar />

      {/* Hero */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50) 0%, oklch(0.75 0.16 55) 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
        <div className="container relative z-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>Help Center</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Everything you need to know about EduNest — for students, parents, and tutors.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
            <path d="M0 50 C360 0 1080 0 1440 50 L1440 50 L0 50 Z" fill="oklch(0.99 0.005 80)" />
          </svg>
        </div>
      </section>

      <main className="flex-1 container py-12 max-w-4xl mx-auto">
        {faqCategories.map((cat) => (
          <div key={cat.category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="text-2xl font-extrabold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                {cat.category}
              </h2>
            </div>
            <div className="space-y-3">
              {cat.faqs.map((faq, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = openItems[key];
                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl border overflow-hidden transition-all duration-200"
                    style={{ borderColor: isOpen ? "oklch(0.68 0.18 50)" : "oklch(0.92 0.005 80)" }}
                  >
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between p-5 text-left transition-colors"
                      style={{ backgroundColor: isOpen ? "oklch(0.98 0.02 55)" : "white" }}
                    >
                      <span className="font-semibold pr-4 text-sm md:text-base" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                        {faq.q}
                      </span>
                      {isOpen
                        ? <ChevronUp size={20} className="shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                        : <ChevronDown size={20} className="shrink-0" style={{ color: "oklch(0.55 0.01 270)" }} />
                      }
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still Have Questions */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50), oklch(0.75 0.16 55))" }}>
          <h2 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Still Have Questions?
          </h2>
          <p className="text-white/90 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Our team is available Mon–Sat, 9 AM – 7 PM IST to help you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+918618635627" className="btn-white text-sm">
              <Phone size={16} /> +91-8618635627
            </a>
            <a href="mailto:learn.at.edunest@gmail.com" className="btn-outline text-sm" style={{ borderColor: "white", color: "white" }}>
              <Mail size={16} /> Email Us
            </a>
            <Link href="/contact" className="btn-outline text-sm" style={{ borderColor: "white", color: "white" }}>
              Contact Page <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
