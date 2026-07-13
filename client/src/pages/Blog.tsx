/**
 * EduNest Blog Page
 * Design: Warm Academic Energy — Articles, study tips, exam guides
 */

import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Clock, User, Tag, Search } from "lucide-react";

export const blogPosts = [
  {
    id: "how-to-choose-right-tutor",
    title: "How to Choose the Right Home Tutor for Your Child",
    excerpt: "Finding the perfect tutor can be overwhelming. Here's a step-by-step guide to help parents in Bengaluru make the right choice for their child's academic success.",
    category: "Parenting Tips",
    author: "Amogha",
    date: "June 28, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    featured: true,
    tags: ["Home Tuition", "Parenting", "Bengaluru"],
  },
  {
    id: "cracking-neet-2026-guide",
    title: "Cracking NEET 2026: A Complete Study Plan for Bengaluru Students",
    excerpt: "A structured 12-month study plan for NEET aspirants, with subject-wise tips, recommended resources, and how a good tutor can make the difference.",
    category: "Exam Prep",
    author: "Rahul Sharma",
    date: "June 20, 2025",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    featured: true,
    tags: ["NEET", "Exam Prep", "Biology", "Chemistry"],
  },
  {
    id: "jee-maths-tips",
    title: "Top 10 JEE Maths Tips Every Class 11 Student Must Know",
    excerpt: "JEE Mathematics is one of the most challenging sections. Our expert tutors share their top 10 tips to score 90+ percentile in JEE Mains Maths.",
    category: "Exam Prep",
    author: "Priya Verma",
    date: "June 15, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80",
    featured: false,
    tags: ["JEE", "Mathematics", "Class 11"],
  },
  {
    id: "online-vs-home-tuition",
    title: "Online Tuition vs Home Tuition: Which is Better for Your Child?",
    excerpt: "Both modes have their advantages. We break down the pros and cons of online and home tuition to help you decide what works best for your child.",
    category: "Parenting Tips",
    author: "Amogha",
    date: "June 10, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&q=80",
    featured: false,
    tags: ["Online Tuition", "Home Tuition", "Learning"],
  },
  {
    id: "cbse-board-exam-preparation",
    title: "CBSE Class 10 Board Exam Preparation: A Month-by-Month Guide",
    excerpt: "With board exams approaching, here's a detailed month-by-month preparation strategy for Class 10 students to score above 90%.",
    category: "Exam Prep",
    author: "Anita Gupta",
    date: "June 5, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    featured: false,
    tags: ["CBSE", "Class 10", "Board Exams"],
  },
  {
    id: "importance-of-demo-class",
    title: "Why the First Demo Class with a Tutor is So Important",
    excerpt: "The demo class is your chance to evaluate a tutor's teaching style, communication, and compatibility with your child. Here's what to look for.",
    category: "Parenting Tips",
    author: "Amogha",
    date: "May 30, 2025",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&q=80",
    featured: false,
    tags: ["Demo Class", "Tutor Selection", "Tips"],
  },
  {
    id: "study-habits-for-students",
    title: "7 Proven Study Habits That Top Students in Bengaluru Swear By",
    excerpt: "We interviewed 50 top-scoring students across Bengaluru schools to find out what study habits they follow. The results might surprise you.",
    category: "Study Tips",
    author: "Priya Verma",
    date: "May 25, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    featured: false,
    tags: ["Study Tips", "Habits", "Academic Success"],
  },
  {
    id: "karnataka-cet-guide",
    title: "Karnataka CET 2026: Everything You Need to Know",
    excerpt: "A comprehensive guide to Karnataka CET — eligibility, syllabus, important dates, and how to prepare effectively with the right tutor.",
    category: "Exam Prep",
    author: "Vikram Singh",
    date: "May 20, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&q=80",
    featured: false,
    tags: ["Karnataka CET", "Exam Prep", "Engineering"],
  },
  {
    id: "best-home-tutors-koramangala",
    title: "Best Home Tutors in Koramangala, Bengaluru (2025 Guide)",
    excerpt: "Looking for a home tutor in Koramangala? Here's everything parents need to know — from finding verified tutors to what to expect from a first demo class in one of Bengaluru's most sought-after neighbourhoods.",
    category: "Local Guides",
    author: "EduNest Team",
    date: "July 1, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80",
    featured: true,
    tags: ["Koramangala", "Home Tutor", "Bengaluru"],
  },
  {
    id: "home-tutor-indiranagar",
    title: "Find the Perfect Home Tutor in Indiranagar, Bengaluru",
    excerpt: "Indiranagar parents — here's your complete guide to finding a qualified, verified home tutor for CBSE, ICSE, and IB boards. Includes tips on what to ask during the demo class.",
    category: "Local Guides",
    author: "EduNest Team",
    date: "July 3, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    featured: false,
    tags: ["Indiranagar", "Home Tutor", "Bengaluru"],
  },
  {
    id: "home-tutor-hsr-layout",
    title: "Home Tutors in HSR Layout: How to Find the Best One for Your Child",
    excerpt: "HSR Layout is one of Bengaluru's fastest-growing residential areas. Discover how EduNest connects families in HSR Layout with experienced, background-verified tutors for all subjects and boards.",
    category: "Local Guides",
    author: "EduNest Team",
    date: "July 5, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
    featured: false,
    tags: ["HSR Layout", "Home Tutor", "Bengaluru"],
  },
  {
    id: "home-tutor-whitefield",
    title: "Home Tutors in Whitefield, Bengaluru — A Parent's Complete Guide",
    excerpt: "Whitefield's booming tech community means high academic expectations. Learn how to find the right home tutor for Maths, Science, English, and competitive exams in Whitefield.",
    category: "Local Guides",
    author: "EduNest Team",
    date: "July 7, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
    featured: false,
    tags: ["Whitefield", "Home Tutor", "Bengaluru"],
  },
  {
    id: "home-tutor-jayanagar",
    title: "Best Home Tutors in Jayanagar & JP Nagar, Bengaluru (2025)",
    excerpt: "Jayanagar and JP Nagar have some of Bengaluru's top schools. Find out how to choose a home tutor who matches your child's school curriculum and learning pace in these neighbourhoods.",
    category: "Local Guides",
    author: "EduNest Team",
    date: "July 9, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80",
    featured: false,
    tags: ["Jayanagar", "JP Nagar", "Home Tutor", "Bengaluru"],
  },
];

const categories = ["All", "Local Guides", "Exam Prep", "Parenting Tips", "Study Tips"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featured = blogPosts.filter((p) => p.featured);
  const filtered = blogPosts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>EduNest Blog</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Study Tips & Exam Guides
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Expert advice from our tutors to help students and parents navigate academics, exams, and learning in Bengaluru.
          </p>
          {/* Search */}
          <div className="max-w-md mx-auto bg-white rounded-xl p-2 shadow-xl flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={16} style={{ color: "oklch(0.68 0.18 50)" }} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
            <button className="btn-primary text-sm px-5 py-2">Search</button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ marginBottom: "-1px" }}>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
            <path d="M0 50 C360 0 1080 0 1440 50 L1440 50 L0 50 Z" fill="oklch(0.99 0.005 80)" />
          </svg>
        </div>
      </section>

      <main className="flex-1 container py-12">
        {/* Featured Posts */}
        {!searchQuery && activeCategory === "All" && (
          <div className="mb-14">
            <h2 className="text-2xl font-extrabold mb-6" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <div className="group bg-white rounded-2xl overflow-hidden border border-[oklch(0.92_0.005_80)] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                    <div className="relative overflow-hidden h-52">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "oklch(0.68 0.18 50)", color: "white", fontFamily: "'Poppins', sans-serif" }}>
                          ⭐ Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full mb-3 inline-block" style={{ backgroundColor: "oklch(0.95 0.03 50)", color: "oklch(0.68 0.18 50)" }}>
                        {post.category}
                      </span>
                      <h3 className="text-lg font-bold mb-2 leading-snug group-hover:text-[oklch(0.68_0.18_50)] transition-colors" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                        {post.title}
                      </h3>
                      <p className="text-sm mb-4 leading-relaxed" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                        {post.excerpt.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                          <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                        </div>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" style={{ color: "oklch(0.68 0.18 50)" }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150"
              style={{
                backgroundColor: activeCategory === cat ? "oklch(0.68 0.18 50)" : "white",
                color: activeCategory === cat ? "white" : "oklch(0.4 0.02 270)",
                border: `2px solid ${activeCategory === cat ? "oklch(0.68 0.18 50)" : "oklch(0.9 0.005 80)"}`,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* All Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <div className="group bg-white rounded-2xl overflow-hidden border border-[oklch(0.92_0.005_80)] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col">
                <div className="relative overflow-hidden h-44">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-3 inline-block w-fit" style={{ backgroundColor: "oklch(0.95 0.03 50)", color: "oklch(0.68 0.18 50)" }}>
                    {post.category}
                  </span>
                  <h3 className="font-bold mb-2 leading-snug flex-1 group-hover:text-[oklch(0.68_0.18_50)] transition-colors" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                    {post.title}
                  </h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                    {post.excerpt.substring(0, 80)}...
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[oklch(0.93_0.005_80)]">
                    <div className="flex items-center gap-3 text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                      <span className="flex items-center gap-1"><User size={11} /> {post.author}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                    </div>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" style={{ color: "oklch(0.68 0.18 50)" }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>No articles found</h3>
            <p style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>Try a different search term or category.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
