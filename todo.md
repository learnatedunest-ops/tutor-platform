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
