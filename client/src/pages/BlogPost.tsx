/**
 * EduNest Blog Post Detail Page
 * Design: Warm Academic Energy — Article reading experience
 */

import { Link, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, User, Calendar, Tag, ArrowRight, Share2, BookOpen } from "lucide-react";
import { blogPosts } from "./Blog";
import { toast } from "sonner";

const fullContent: Record<string, string> = {
  "how-to-choose-right-tutor": `Finding the right home tutor for your child is one of the most important decisions you'll make as a parent. A good tutor doesn't just teach — they inspire, motivate, and build confidence. Here's how to make the right choice.

## 1. Define Your Child's Needs First

Before searching for a tutor, sit down with your child and identify:
- Which subjects need the most attention?
- Is the goal to improve grades, prepare for an exam, or build foundational skills?
- Does your child prefer a strict, structured approach or a more relaxed, conversational style?

Understanding these needs will help you filter tutors more effectively.

## 2. Check Qualifications and Experience

A tutor's academic background matters, but teaching experience matters even more. Look for:
- Relevant degree or qualification in the subject
- At least 2-3 years of tutoring experience
- Experience with your child's specific board (CBSE, ICSE, State Board)
- Track record with competitive exams if needed (JEE, NEET, CET)

## 3. Always Take a Demo Class

Never commit to a tutor without a demo class. During the demo, observe:
- How clearly they explain concepts
- Whether they engage with your child or just lecture
- Their patience when the child doesn't understand
- The teaching materials and methods they use

At EduNest, every tutor offers a free first demo class — use it wisely.

## 4. Assess Compatibility

Academic qualifications aside, the tutor-student relationship is crucial. A tutor who connects well with your child will naturally be more effective. After the demo class, ask your child:
- Did you understand the explanations?
- Did you feel comfortable asking questions?
- Would you like to continue with this tutor?

## 5. Discuss Expectations Clearly

Before starting regular sessions, have a clear conversation with the tutor about:
- Session frequency and duration
- Homework and assignments
- Progress tracking and feedback
- Fee structure and payment terms

## 6. Monitor Progress Regularly

Once sessions begin, stay involved. Review your child's progress every 2-3 weeks. A good tutor will proactively share updates and adjust their approach based on your child's progress.

## Final Thoughts

The right tutor can transform your child's academic journey. Take your time, use the demo class, and trust your child's feedback. At EduNest, we carefully verify all our tutors and make it easy for you to find the perfect match in Bengaluru.`,

  "cracking-neet-2026-guide": `NEET 2026 is one of the most competitive medical entrance exams in India. With over 20 lakh applicants competing for limited MBBS seats, preparation needs to be strategic, consistent, and well-guided. Here's a complete 12-month study plan.

## Understanding the NEET Syllabus

NEET covers Physics, Chemistry, and Biology from Class 11 and 12 NCERT. The distribution is:
- Biology: 90 questions (360 marks) — Botany + Zoology
- Chemistry: 45 questions (180 marks)
- Physics: 45 questions (180 marks)

Biology carries the most weight, but Physics and Chemistry can make or break your rank.

## Month-by-Month Study Plan

**Months 1-3 (Foundation Phase)**
Focus on building strong NCERT foundations. Read every line of NCERT Biology — most questions come directly from it. For Chemistry, focus on Physical Chemistry concepts. For Physics, strengthen your Class 11 mechanics and thermodynamics.

**Months 4-6 (Concept Deepening)**
Move to Class 12 topics. Start solving NCERT exemplar problems. Begin topic-wise mock tests. Identify weak areas and spend extra time on them.

**Months 7-9 (Practice Phase)**
Start full-length mock tests every week. Analyze each test thoroughly — don't just check scores, understand why you got questions wrong. Revise high-weightage topics like Human Physiology, Genetics, and Organic Chemistry.

**Months 10-12 (Revision & Final Push)**
Intensive revision of all topics. Solve previous 10 years' NEET papers. Focus on speed and accuracy. Take at least 2 full mock tests per week.

## The Role of a Good Tutor

A NEET tutor can make a significant difference by:
- Creating a personalized study plan based on your strengths and weaknesses
- Explaining complex concepts (especially Organic Chemistry mechanisms)
- Conducting regular topic tests and providing detailed feedback
- Keeping you motivated during the long preparation journey

At EduNest, we have 25+ NEET-specialized tutors in Bengaluru with proven track records.

## Key Resources

- NCERT Biology (Class 11 & 12) — Read multiple times
- DC Pandey for Physics
- OP Tandon for Chemistry
- Previous year NEET papers (2015-2025)
- NTA Mock Tests

Start early, stay consistent, and get the right guidance. NEET 2026 is yours to crack!`,
};

export default function BlogPost() {
  const params = useParams<{ id: string }>();
  const postId = params.id || "how-to-choose-right-tutor";
  const post = blogPosts.find((p) => p.id === postId) || blogPosts[0];
  const content = fullContent[postId] || fullContent["how-to-choose-right-tutor"];
  const related = blogPosts.filter((p) => p.id !== postId && p.category === post.category).slice(0, 2);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Article link copied to clipboard!");
  };

  // Render markdown-like content
  const renderContent = (text: string) => {
    return text.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-bold mt-8 mb-3" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
            {block.replace("## ", "")}
          </h2>
        );
      }
      if (block.startsWith("**") && block.endsWith("**")) {
        return (
          <p key={i} className="font-bold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
            {block.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (block.includes("\n- ")) {
        const [intro, ...items] = block.split("\n- ");
        return (
          <div key={i} className="mb-4">
            {intro && <p className="mb-2" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>{intro}</p>}
            <ul className="space-y-1.5 ml-4">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "oklch(0.68 0.18 50)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      return (
        <p key={i} className="leading-relaxed mb-4" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
          {block}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "oklch(0.99 0.005 80)" }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[oklch(0.92_0.005_80)]">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
            <Link href="/" className="hover:text-[oklch(0.68_0.18_50)] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[oklch(0.68_0.18_50)] transition-colors">Blog</Link>
            <span>/</span>
            <span style={{ color: "oklch(0.68 0.18 50)" }} className="truncate max-w-xs">{post.title}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-[oklch(0.68_0.18_50)]" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
              <ArrowLeft size={16} /> Back to Blog
            </Link>

            {/* Category */}
            <span className="text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block" style={{ backgroundColor: "oklch(0.95 0.03 50)", color: "oklch(0.68 0.18 50)" }}>
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-[oklch(0.92_0.005_80)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "oklch(0.68 0.18 50)" }}>
                  {post.author.charAt(0)}
                </div>
                <span className="text-sm font-semibold" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>{post.author}</span>
              </div>
              <span className="flex items-center gap-1 text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                <Calendar size={14} /> {post.date}
              </span>
              <span className="flex items-center gap-1 text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                <Clock size={14} /> {post.readTime}
              </span>
              <button onClick={handleShare} className="flex items-center gap-1 text-sm ml-auto transition-colors hover:text-[oklch(0.68_0.18_50)]" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                <Share2 size={14} /> Share
              </button>
            </div>

            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden mb-8 h-64 md:h-80">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="prose-content">
              {renderContent(content)}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[oklch(0.92_0.005_80)]">
              <span className="flex items-center gap-1 text-sm" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                <Tag size={14} /> Tags:
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "oklch(0.95 0.005 80)", color: "oklch(0.4 0.02 270)" }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 rounded-2xl p-6" style={{ background: "linear-gradient(135deg, oklch(0.68 0.18 50), oklch(0.75 0.16 55))" }}>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Ready to Find Your Perfect Tutor?
              </h3>
              <p className="text-white/90 mb-4 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Connect with 200+ verified tutors in Bengaluru. First demo class is free.
              </p>
              <Link href="/find-tutor" className="btn-white text-sm">
                Find a Tutor <ArrowRight size={16} />
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related Posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-[oklch(0.92_0.005_80)]">
                <h3 className="font-bold mb-4" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Related Articles</h3>
                <div className="space-y-4">
                  {related.map((p) => (
                    <Link key={p.id} href={`/blog/${p.id}`}>
                      <div className="group flex gap-3 cursor-pointer">
                        <img src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold leading-snug mb-1 group-hover:text-[oklch(0.68_0.18_50)] transition-colors" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>
                            {p.title}
                          </h4>
                          <span className="text-xs" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>{p.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div className="bg-white rounded-2xl p-5 border border-[oklch(0.92_0.005_80)]">
              <h3 className="font-bold mb-4" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>More Articles</h3>
              <div className="space-y-3">
                {blogPosts.filter((p) => p.id !== postId).slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/blog/${p.id}`}>
                    <div className="group flex items-start gap-2 cursor-pointer py-2 border-b border-[oklch(0.95_0.005_80)] last:border-0">
                      <BookOpen size={14} className="mt-0.5 shrink-0" style={{ color: "oklch(0.68 0.18 50)" }} />
                      <span className="text-sm leading-snug group-hover:text-[oklch(0.68_0.18_50)] transition-colors" style={{ color: "oklch(0.4 0.02 270)", fontFamily: "'Nunito', sans-serif" }}>
                        {p.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/blog" className="flex items-center gap-1 text-sm font-semibold mt-4 transition-colors hover:text-[oklch(0.68_0.18_50)]" style={{ color: "oklch(0.68 0.18 50)", fontFamily: "'Poppins', sans-serif" }}>
                View All Articles <ArrowRight size={14} />
              </Link>
            </div>

            {/* Quick CTA */}
            <div className="rounded-2xl p-5 border-2" style={{ borderColor: "oklch(0.68 0.18 50)", backgroundColor: "oklch(0.99 0.01 60)" }}>
              <h3 className="font-bold mb-2" style={{ color: "oklch(0.14 0.02 270)", fontFamily: "'Poppins', sans-serif" }}>Need a Tutor?</h3>
              <p className="text-sm mb-4" style={{ color: "oklch(0.55 0.01 270)", fontFamily: "'Nunito', sans-serif" }}>
                Find the perfect tutor in Bengaluru. First demo class is free!
              </p>
              <Link href="/find-tutor" className="btn-primary text-sm w-full text-center block">
                Find a Tutor
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
