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

  "best-home-tutors-koramangala": `Koramangala is one of Bengaluru's most vibrant and sought-after neighbourhoods — home to thousands of families, top schools, and a culture that values academic excellence. If you're a parent in Koramangala looking for a reliable home tutor, this guide covers everything you need to know.

## Why Koramangala Parents Choose Home Tutors

Koramangala is densely populated with students from CBSE, ICSE, and IGCSE schools. With competitive environments at schools like Inventure Academy, Greenwood High, and DPS, parents increasingly turn to home tutors to give their children a personalised edge. Home tuition offers:
- One-on-one attention that classroom teaching cannot provide
- Flexible scheduling around school and activity hours
- Targeted focus on weak subjects without wasting time on what the child already knows
- Consistent progress tracking and parent feedback

## What to Look for in a Home Tutor in Koramangala

Not all tutors are equal. Here's what experienced Koramangala parents recommend:

**Verify Qualifications**: Ensure the tutor holds a relevant degree — B.Sc, B.E, B.Com, or B.Ed — and has at least 2 years of tutoring experience with your child's board.

**Board Familiarity**: CBSE and ICSE have different question patterns and marking schemes. A tutor experienced with your child's specific board will be far more effective.

**Communication Skills**: A tutor who explains concepts clearly and patiently, and who keeps parents informed, is invaluable.

**Demo Class**: Always insist on a free demo class before committing. Use it to observe how the tutor interacts with your child.

## Subjects Available Through EduNest in Koramangala

EduNest tutors in Koramangala cover a wide range of subjects:
- Mathematics (Class 1 to Class 12, JEE, CET)
- Science (Physics, Chemistry, Biology — Class 6 to 12, NEET)
- English (Grammar, Literature, Writing Skills)
- Social Studies and History
- Computer Science and Coding
- Commerce (Accountancy, Economics, Business Studies)
- Languages (Kannada, Hindi, French)

## How EduNest Works

EduNest is Bengaluru's trusted home tuition platform. Here's how it works:

1. Register as a Parent: Create a free account and describe your child's requirements — grade, subjects, preferred schedule.
2. Browse Verified Tutors: View tutor profiles with qualifications, teaching experience, and subject expertise. All tutors are manually reviewed by our team.
3. Book a Free Demo Class: Schedule a demo directly through the platform. The tutor visits your home in Koramangala for a free first session.
4. Confirm and Start: If you're happy with the demo, confirm the tutor and begin regular sessions.

## How to Book a Free Demo

Booking is simple. Visit edunest.courses, register as a parent, and browse tutors available in Koramangala. You can filter by subject, grade, and availability. Once you find a tutor you like, request a demo class — it's completely free and there's no obligation to continue.

Give your child the personalised attention they deserve. Find a verified home tutor in Koramangala today at edunest.courses.`,

  "home-tutor-indiranagar": `Indiranagar is one of Bengaluru's most well-connected and family-friendly neighbourhoods. With prestigious schools like Baldwin Boys' High School, St. Joseph's Boys' High School, and several CBSE institutions nearby, academic competition is high. Home tuition has become a popular choice for Indiranagar parents who want to give their children a focused, personalised learning experience.

## Why Home Tuition Works in Indiranagar

Indiranagar families are busy — parents often work in IT or corporate sectors, and children juggle school, sports, and extracurricular activities. Home tuition fits seamlessly into this lifestyle:
- Sessions happen at home, saving commute time
- Tutors adapt to the child's pace — no rushing through topics
- Parents can monitor sessions and stay involved
- Ideal for students preparing for board exams, NEET, JEE, or CET

## Choosing the Right Tutor in Indiranagar

Here's a practical checklist for Indiranagar parents:

**Step 1 — Define the Goal**: Is your child struggling with a specific subject, or do you want overall academic support? Knowing this helps you find a tutor with the right focus.

**Step 2 — Check the Board**: CBSE, ICSE, and IB boards each have distinct syllabi. Make sure your tutor is experienced with your child's board.

**Step 3 — Ask the Right Questions During the Demo**: How do you assess a student's current level? How do you handle a student who is not understanding a concept? How often will you share progress updates with parents?

**Step 4 — Involve Your Child**: After the demo class, ask your child how they felt. A tutor your child likes will naturally be more effective.

## Subjects Covered by EduNest Tutors in Indiranagar

Our verified tutors in and around Indiranagar cover:
- Maths and Science for Classes 6 to 12
- Physics, Chemistry, Biology for NEET and board exams
- English language and literature
- Commerce subjects (Accountancy, Economics)
- Computer Science and Python programming
- Spoken English and communication skills
- Competitive exam coaching (JEE, NEET, Karnataka CET)

## How EduNest Verifies Tutors

Every tutor on EduNest goes through a manual review process. We check qualifications, teaching experience, and subject expertise before approving any tutor profile. This means you can browse with confidence, knowing that every tutor you see has been vetted by our team.

## Book a Free Demo Class in Indiranagar

Getting started is easy. Register at edunest.courses, describe your requirements, and browse available tutors in Indiranagar. Request a free demo class — the tutor comes to your home, teaches a sample session, and you decide if it's a good fit. No pressure, no commitment.

Find your child's perfect tutor in Indiranagar today.`,

  "home-tutor-hsr-layout": `HSR Layout has grown into one of Bengaluru's most popular residential areas, attracting young families, tech professionals, and students from across the city. With a mix of CBSE, ICSE, and State Board schools in and around HSR Layout, the demand for quality home tutors has never been higher.

## Why HSR Layout Families Choose Home Tuition

HSR Layout's rapid growth means more families, more schools, and more academic pressure. Home tuition has emerged as the preferred solution for parents who want:
- Personalised attention for their child without the distractions of a group class
- Flexible scheduling that works around school, sports, and other activities
- A tutor who understands the specific curriculum and exam patterns of their child's school
- Regular feedback and progress updates

## Finding a Verified Tutor in HSR Layout

With so many tutors advertising in HSR Layout, it can be difficult to know who to trust. Here's what to look for:

**Qualifications**: A good tutor should have a relevant degree and demonstrable experience teaching students at your child's grade level.

**Board Experience**: Whether your child is in CBSE, ICSE, or State Board, the tutor should be familiar with the specific syllabus, question patterns, and marking schemes.

**Teaching Approach**: The best tutors don't just repeat what the textbook says — they use examples, analogies, and practice problems to build genuine understanding.

**References or Reviews**: Ask for references from other parents in HSR Layout, or check the tutor's profile on EduNest for verified information.

## Subjects Available in HSR Layout

EduNest tutors in HSR Layout cover all major subjects:
- Mathematics (all grades, JEE, CET preparation)
- Science — Physics, Chemistry, Biology (Class 6 to 12, NEET)
- English (grammar, writing, literature)
- Social Studies
- Commerce (Accountancy, Business Studies, Economics)
- Computer Science and Coding
- Languages (Hindi, Kannada, French)

## How EduNest Makes It Easy

EduNest is designed specifically for Bengaluru families. Our platform lists only manually verified tutors, allows you to filter by subject, grade, and availability, offers a free demo class with every tutor before you commit, and provides a secure, transparent process from booking to payment.

## Book a Free Demo in HSR Layout

Ready to find the right tutor for your child in HSR Layout? Register at edunest.courses, browse verified tutors, and book a free demo class. The tutor comes to your home — no travel, no hassle. If you're happy with the session, you can confirm and start regular classes right away.

Give your child the academic support they need, right in HSR Layout.`,

  "home-tutor-whitefield": `Whitefield has transformed from a quiet suburb into one of Bengaluru's most dynamic residential and tech hubs. With a large population of IT professionals and their families, Whitefield is home to students who face high academic expectations — and parents who want the best possible support for their children.

## The Academic Landscape in Whitefield

Whitefield is served by several well-regarded schools, including Inventure Academy, Greenwood High, Ryan International, and various CBSE and ICSE schools. Students in Whitefield often aim for top engineering and medical colleges, making competitive exam preparation a priority alongside regular academics.

## Why Home Tuition is Popular in Whitefield

For Whitefield families, home tuition offers several practical advantages:
- No commute: Tutors come to the student's home, saving time in Whitefield's traffic
- Personalised pace: Unlike coaching centres, home tutors adapt entirely to the student's learning speed
- Exam-focused preparation: Tutors experienced with JEE, NEET, and Karnataka CET can provide targeted coaching
- Flexible timing: Sessions can be scheduled around school, sports, and other commitments

## What Subjects Do Whitefield Students Need?

Based on demand from Whitefield families on EduNest, the most sought-after subjects are:
- Mathematics: From Class 6 foundations to JEE Advanced level
- Physics and Chemistry: For board exams and competitive entrance tests
- Biology: NEET preparation and Class 11-12 board exams
- English: Writing skills, grammar, and literature for CBSE and ICSE
- Computer Science: Python, Java, and school-level programming
- Commerce: Accountancy and Economics for Class 11-12

## How to Choose the Right Tutor in Whitefield

Here are the key factors Whitefield parents should consider:

**Experience with Competitive Exams**: If your child is targeting JEE or NEET, look for a tutor who has specifically coached students for these exams and has a track record of results.

**Proximity**: While tutors travel to your home, choosing someone based in or near Whitefield ensures reliability and punctuality.

**Teaching Style**: Some students thrive with a structured, textbook-focused approach; others need more conceptual, discussion-based teaching. Match the tutor's style to your child's learning preference.

**Demo Class**: Always use the free demo class to evaluate the tutor before committing.

## How EduNest Works for Whitefield Families

Register as a parent at edunest.courses, describe your child's grade, subjects, and goals, browse verified tutors available in Whitefield, book a free demo class — the tutor comes to your home, and confirm and start regular sessions if you're satisfied.

All EduNest tutors are manually reviewed and verified before their profiles go live. You can browse with confidence.

## Start Today

Find a verified home tutor in Whitefield at edunest.courses. Book a free demo class and see the difference personalised tuition can make for your child.`,

  "home-tutor-jayanagar": `Jayanagar and JP Nagar are among Bengaluru's most established and education-conscious neighbourhoods. Home to some of the city's top schools — including National Public School (NPS), Vijaya High School, and several CBSE and ICSE institutions — these areas have a long tradition of academic excellence. Home tuition has always been a cornerstone of how Jayanagar and JP Nagar families support their children's education.

## The Education Culture in Jayanagar and JP Nagar

Jayanagar and JP Nagar parents are known for being deeply invested in their children's academics. The neighbourhoods are served by a mix of Kannada medium, English medium, CBSE, and ICSE schools. Students here often pursue a dual track — excelling in school exams while also preparing for competitive entrance tests like Karnataka CET, NEET, and JEE.

Home tuition fits naturally into this culture, providing the focused, one-on-one support that helps students stay ahead.

## Why Choose a Home Tutor in Jayanagar or JP Nagar?

- Curriculum alignment: A local tutor familiar with your child's school and board will align sessions with the exact syllabus being taught in class
- Exam preparation: Dedicated coaching for Karnataka CET, NEET, JEE, and board exams
- Consistent support: Regular sessions build habits and discipline that translate into better results
- Parent involvement: Home tuition allows parents to stay closely involved in their child's progress

## Subjects Covered by EduNest Tutors in Jayanagar and JP Nagar

Our verified tutors in Jayanagar and JP Nagar cover:
- Mathematics (all grades, JEE, CET, Olympiad preparation)
- Science — Physics, Chemistry, Biology (Class 6 to 12, NEET)
- English language and literature (CBSE and ICSE)
- Social Studies and History
- Commerce — Accountancy, Economics, Business Studies
- Computer Science and Programming
- Kannada and Hindi languages
- Spoken English and communication skills

## How to Find the Right Tutor for Your Child

**Match the Board**: Jayanagar and JP Nagar have a mix of CBSE, ICSE, State Board, and Kannada medium schools. Ensure your tutor is experienced with your child's specific board.

**Check Teaching Experience**: A tutor with 3+ years of experience teaching students at your child's grade level will be significantly more effective than someone new to tutoring.

**Use the Demo Class**: EduNest offers a free demo class with every tutor. Use it to assess teaching style, communication, and compatibility with your child.

**Ask About Progress Tracking**: A good tutor will proactively share updates with parents and adjust their approach based on the student's progress.

## How EduNest Works

EduNest is Bengaluru's trusted home tuition platform. Register as a parent at edunest.courses, describe your child's grade, subjects, and preferred schedule, browse verified tutors — all manually reviewed and approved by our team, book a free demo class — the tutor comes to your home in Jayanagar or JP Nagar, and start regular sessions if you're happy with the demo.

## Book a Free Demo Class Today

Your child deserves the best academic support. Find a verified home tutor in Jayanagar or JP Nagar at edunest.courses. Book your free demo class today — no commitment required.`,
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
