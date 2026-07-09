# EduNest Tutor Platform — TODO

## Core Pages
- [x] Home page with hero, subjects grid, stats, services tabs, how it works, testimonials, CTA
- [x] Find a Tutor page with search, filters, tutor cards
- [x] Become a Tutor page with registration form and benefits
- [x] About Us page with team, mission, stats
- [x] Contact page with form and contact info
- [x] Tutor Profile Detail page
- [x] Subjects/Categories page
- [x] Blog listing page
- [x] Blog Post detail page
- [x] FAQ page
- [x] Privacy Policy page
- [x] Terms of Service page

## Branding & Content
- [x] EduNest brand name throughout
- [x] Amogha as CEO on About page
- [x] Bengaluru location everywhere
- [x] Phone: +91-8618635627
- [x] Email: learn.at.edunest@gmail.com
- [x] Realistic stats (5,000+ students, 200+ tutors, 15+ areas)

## Features
- [x] Floating WhatsApp button (global, all pages)
- [x] Bengaluru area filters on Find a Tutor (Koramangala, Indiranagar, HSR Layout, Whitefield, Jayanagar, BTM Layout, etc.)
- [x] Full-stack upgrade (tRPC + MySQL database)
- [x] Contact form wired to database (inquiry table)
- [x] Become a Tutor form wired to database (tutor_applications table)
- [x] Input validation with Zod on both forms
- [x] Loading states and error handling on forms
- [x] Admin-only inquiry and application list endpoints
- [x] Vitest tests for all form API routes (12 tests passing)

## Navigation & UI
- [x] Sticky navbar with announcement bar
- [x] Resources dropdown (Blog, FAQ, Subjects)
- [x] Footer with all page links, contact info, app download badges
- [x] Wave/diagonal section dividers
- [x] Scroll-reveal animations
- [x] Animated stats counter
- [x] Responsive design (mobile-first)

## SEO & Social
- [x] Open Graph meta tags (og:title, og:description, og:image, og:url) in index.html
- [x] Twitter Card meta tags
- [x] Per-page SEO meta tags (title, description, keywords) using react-helmet or dynamic head
- [x] City-specific keywords for Bengaluru neighbourhoods

## Admin Dashboard
- [x] Admin-only tRPC procedures to list/update inquiries
- [x] Admin-only tRPC procedures to list/update tutor applications
- [x] Protected /admin route (requires Manus login + admin role)
- [x] Admin dashboard UI: inquiries table with status management
- [x] Admin dashboard UI: tutor applications table with status management
- [x] Status update mutation (new → contacted → resolved / pending → approved → rejected)

## Next Steps Round 3
- [x] Auto-grant admin role to owner (Amogha) on first login via ENV.ownerOpenId
- [x] Email notification to learn.at.edunest@gmail.com on new inquiry submission
- [x] Email notification to learn.at.edunest@gmail.com on new tutor application
- [x] Generate /sitemap.xml endpoint listing all public pages
- [x] Add robots.txt pointing to sitemap

## Next Steps Round 4
- [x] Add demo_bookings table to schema and run db:push
- [x] Add createDemoBooking and getAllDemoBookings DB helpers
- [x] Add demoBooking.submit tRPC procedure with notifyOwner
- [x] Build BookDemoModal component with date/time picker and form
- [x] Wire BookDemoModal to tutor cards on FindTutor page
- [x] Wire BookDemoModal to TutorProfile page
- [x] Integrate Resend API for Gmail email delivery on inquiry submit
- [x] Integrate Resend API for Gmail email delivery on tutor application submit
- [x] Integrate Resend API for Gmail email delivery on demo booking submit
- [x] Add Demo Bookings tab to Admin Dashboard
