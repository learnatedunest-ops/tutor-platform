/**
 * EduNest SEO Guide Page — Google Search Console Setup
 * Step-by-step guide for Amogha to submit EduNest to Google Search Console
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, ExternalLink, Search, Globe, BarChart3, FileText, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Go to Google Search Console",
    description: "Open your browser and navigate to Google Search Console. Sign in with your Google account (use the same account linked to learn.at.edunest@gmail.com).",
    link: "https://search.google.com/search-console",
    linkText: "Open Google Search Console →",
    tip: "Use the same Google account you use for Gmail so all your tools are linked.",
  },
  {
    number: "02",
    title: "Add Your Property",
    description: "Click the '+ Add property' button in the top-left dropdown. Choose 'URL prefix' and enter your full website URL.",
    code: "https://edu-nest.manus.space",
    tip: "Use 'URL prefix' (not Domain) — it's easier to verify for hosted platforms like Manus.",
  },
  {
    number: "03",
    title: "Verify Ownership",
    description: "Google will show you verification options. The easiest method is 'HTML tag' — copy the meta tag and send it to us so we can add it to your site's <head> section.",
    tip: "Alternatively, choose 'HTML file' download and send us the file — we'll upload it to your site.",
  },
  {
    number: "04",
    title: "Submit Your Sitemap",
    description: "Once verified, click 'Sitemaps' in the left sidebar. Enter your sitemap URL and click Submit.",
    code: "https://edu-nest.manus.space/sitemap.xml",
    tip: "A sitemap tells Google about all your pages so they get indexed faster.",
  },
  {
    number: "05",
    title: "Request Indexing",
    description: "Use the URL Inspection tool to manually request indexing for your most important pages. Enter each URL and click 'Request Indexing'.",
    pages: [
      "https://edu-nest.manus.space/",
      "https://edu-nest.manus.space/find-tutor",
      "https://edu-nest.manus.space/become-tutor",
      "https://edu-nest.manus.space/about",
      "https://edu-nest.manus.space/contact",
    ],
    tip: "Google typically indexes pages within 1–7 days after requesting.",
  },
  {
    number: "06",
    title: "Monitor Performance",
    description: "After a few days, check the 'Performance' tab to see which search queries are bringing visitors to EduNest. You'll see clicks, impressions, and average position for each keyword.",
    tip: "Look for keywords like 'home tutor Bengaluru', 'tutor near me Koramangala' — these are your target searches.",
  },
];

const keywords = [
  "home tutor Bengaluru",
  "home tuition near me",
  "best tutor Koramangala",
  "CBSE tutor Bengaluru",
  "online tutor Bengaluru",
  "maths tutor Indiranagar",
  "science tutor HSR Layout",
  "NEET tutor Bengaluru",
  "JEE tutor Bengaluru",
  "class 10 tutor Bengaluru",
  "class 12 tutor Bengaluru",
  "IB tutor Bengaluru",
];

export default function SEOGuide() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <Navbar />

      {/* Hero */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, oklch(0.14 0.02 270) 0%, oklch(0.22 0.03 270) 100%)" }}>
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: "oklch(0.68 0.18 50 / 0.2)", border: "1px solid oklch(0.68 0.18 50 / 0.4)" }}>
            <Search size={16} style={{ color: "oklch(0.68 0.18 50)" }} />
            <span className="text-sm font-semibold" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>SEO Setup Guide</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Get EduNest on Google
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "oklch(0.85 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
            Follow these steps to submit your site to Google Search Console so parents in Bengaluru can find EduNest when they search for tutors.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50), oklch(0.60 0.20 40))", fontFamily: "'Poppins', sans-serif" }}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                      {step.title}
                    </h3>
                    <p className="mb-4" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif", lineHeight: 1.7 }}>
                      {step.description}
                    </p>

                    {step.code && (
                      <div className="rounded-xl p-4 mb-4 font-mono text-sm" style={{ backgroundColor: "oklch(0.96 0.005 80)", color: "oklch(0.68 0.18 50)", border: "1px solid oklch(0.90 0.01 80)" }}>
                        {step.code}
                      </div>
                    )}

                    {step.pages && (
                      <div className="space-y-2 mb-4">
                        {step.pages.map((page, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm font-mono" style={{ color: "oklch(0.45 0.01 270)" }}>
                            <ArrowRight size={14} style={{ color: "oklch(0.68 0.18 50)" }} />
                            {page}
                          </div>
                        ))}
                      </div>
                    )}

                    {step.link && (
                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-sm transition-all hover:gap-3" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                        {step.linkText}
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <div className="mt-4 flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: "oklch(0.97 0.01 80)", border: "1px solid oklch(0.92 0.01 80)" }}>
                      <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.15 145)" }} />
                      <p className="text-sm" style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                        <strong>Tip:</strong> {step.tip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Keywords */}
      <section className="py-16" style={{ backgroundColor: "oklch(0.97 0.005 80)" }}>
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: "oklch(0.68 0.18 50 / 0.1)", border: "1px solid oklch(0.68 0.18 50 / 0.3)" }}>
              <BarChart3 size={16} style={{ color: "oklch(0.68 0.18 50)" }} />
              <span className="text-sm font-semibold" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>Target Keywords</span>
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
              Keywords to Track
            </h2>
            <p style={{ color: "oklch(0.45 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              Monitor these keywords in Google Search Console to track EduNest's ranking progress.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {keywords.map((kw, i) => (
              <span key={i} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "white", color: "oklch(0.14 0.02 270)", border: "1px solid oklch(0.88 0.01 80)", fontFamily: "'Nunito', sans-serif" }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
            Useful Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: "Google Search Console", desc: "Monitor your site's search performance", href: "https://search.google.com/search-console" },
              { icon: Globe, title: "EduNest Sitemap", desc: "Submit this URL to Google Search Console", href: "https://edu-nest.manus.space/sitemap.xml" },
              { icon: FileText, title: "Robots.txt", desc: "Check which pages Google is allowed to crawl", href: "https://edu-nest.manus.space/robots.txt" },
            ].map((item, i) => (
              <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 border transition-all hover:shadow-md hover:-translate-y-1 group" style={{ borderColor: "oklch(0.92 0.005 80)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "oklch(0.68 0.18 50 / 0.1)" }}>
                  <item.icon size={22} style={{ color: "oklch(0.68 0.18 50)" }} />
                </div>
                <h3 className="font-bold mb-1 flex items-center gap-1" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                  {item.title}
                  <ExternalLink size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "oklch(0.68 0.18 50)" }} />
                </h3>
                <p className="text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
