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

## Next Steps Round 5
- [x] Add tutors table to DB schema and run db:push
- [x] Add tutor DB helpers (create, list, getById, update, delete)
- [x] Add tutor tRPC procedures (public list/getById, admin CRUD)
- [x] Admin Dashboard: Tutors tab with add/edit/delete tutor management
- [x] Replace static tutor cards on FindTutor with live DB data
- [x] Replace static tutor profile on TutorProfile with live DB data
- [x] Student/parent login portal (Manus OAuth)
- [x] My Bookings page: show logged-in user's demo booking history
- [x] Add Google Search Console guide page at /seo-guide (handled via instructions to user)
- [x] Update sitemap.xml to include new pages

## Next Steps Round 6
- [x] Add student_requirements table to DB schema and run db:push
- [x] Add studentRequirement tRPC procedures (submit, admin list, update status, match tutor)
- [x] Rewrite Find a Tutor page as a parent/student requirement registration form
- [x] Add Requirements tab to Admin Dashboard with tutor matching UI
- [x] Fix unrealistic ratings (4.9/5 everywhere) to realistic varied values
- [x] Add Refer a Friend feature with referral link generation
- [x] Add referrals table to DB schema and run db:push
- [x] Add referral tRPC procedures (submit, admin list, update status)
- [x] Build ReferFriend.tsx page at /refer with form, success state, copy/share referral code
- [x] Add /refer route to App.tsx
- [x] Add Referrals tab to Admin Dashboard (6th tab)
- [x] Add Refer a Friend link to Navbar Resources dropdown and Footer Quick Links
- [x] Add /refer to sitemap.xml
- [x] All 14 tests passing, 0 TypeScript errors

## Round 7 — Location-Based Signup & Matching

### DB Schema
- [x] Add tutor_profiles table (userId FK, all tutor details, lat/lng, full address, status)
- [x] Add student_profiles table (userId FK, student details, lat/lng, full address, schedule fields)
- [x] Run db:push

### Backend (tRPC)
- [x] tutor profile: createOrUpdate, getMyProfile, getNearbyStudents (Haversine)
- [x] student profile: createOrUpdate, getMyProfile, getNearbyTutors (Haversine)
- [x] Admin: list tutor_profiles, approve/reject tutor profile

### Frontend — Tutor Flow
- [x] TutorSetup.tsx: full 4-step profile form with GPS location, all Otoo-style fields
- [x] TutorDashboard.tsx: shows nearby student requirements sorted by distance, Express Interest button
- [x] Pending/rejected/approved states handled

### Frontend — Student/Parent Flow
- [x] StudentSetup.tsx: 4-step profile form with GPS location, Otoo-style fields
- [x] NearbyTutors.tsx: shows nearby approved tutors sorted by distance, Book Demo button

### Navigation & Admin
- [x] Add /tutor-setup, /tutor-dashboard, /student-setup, /nearby-tutors routes to App.tsx
- [x] Update Navbar: Tutor Dashboard link, Find a Tutor CTA → /student-setup
- [x] notifyOwner called on tutor profile save and student requirement save

### Tests & Deploy
- [x] 14/14 tests passing, 0 TypeScript errors
- [x] Checkpoint saved

## Round 8 — Role-Aware Signup & Login Flow
- [x] Add userRole field (tutor | student | null) to users table in schema.ts, run db:push
- [x] Add setRole tRPC procedure (protectedProcedure, saves tutor/student to users.userRole)
- [x] Add getUserRole tRPC procedure (returns current user's userRole)
- [x] Build RoleSelect.tsx page at /role-select — shown after first OAuth login if no role set
- [x] After OAuth callback, redirect to /role-select if userRole is null (via AuthGate)
- [x] After role is saved, redirect to /tutor-setup (tutor) or /student-setup (student)
- [x] Gate /tutor-setup and /tutor-dashboard to userRole === 'tutor' only
- [x] Gate /student-setup and /nearby-tutors to userRole === 'student' only
- [x] Update Navbar CTAs to be role-aware (tutor sees Tutor Dashboard, student sees Find Tutors)
- [x] Update Become a Tutor CTA to trigger login + role-select flow (via Sign Up / Log In button)
- [x] Update Find a Tutor CTA to trigger login + role-select flow (via Sign Up / Log In button)
- [x] Run pnpm test (14 passing), 0 TypeScript errors
- [x] Save checkpoint

## Round 9 — Signup Gate, Admin Tutor Profiles, Express Interest, Notifications
- [x] Fix signup gate: show proper login/signup wall on /become-tutor and /find-tutor CTAs before any form
- [x] BecomeTutor page: if not logged in, show login prompt with role pre-set to tutor
- [x] FindTutor page: if not logged in, show login prompt with role pre-set to student
- [x] TutorSetup: if not logged in, show full-page login/signup wall (not just a small prompt)
- [x] StudentSetup: if not logged in, show full-page login/signup wall (not just a small prompt)
- [x] Add Tutor Profiles tab to Admin Dashboard (list all tutor_profiles, approve/reject)
- [x] Add tutor_interests table to schema (tutorId, studentProfileId, status, message, createdAt)
- [x] Add tRPC procedures: expressInterest, getMyInterests, getAllInterests (admin)
- [x] Wire Express Interest button in TutorDashboard to real DB mutation
- [x] Add Interests tab to Admin Dashboard
- [x] Add notifyOwner calls for: new tutor profile submitted, new student requirement submitted, new express interest
- [x] Run pnpm test (14 passing), 0 TypeScript errors
- [x] Save checkpoint

## Round 11 — Session Timeout, Nav Cleanup, About Us, Demo Interest Flow
- [ ] Add session timeout hook (30 min inactivity auto-logout) for logged-in tutors and students
- [ ] Remove "Tutors Near Me" and "Tutor Dashboard" from Resources dropdown in Navbar
- [ ] Update About Us page: Amogha Amange (Founder & CEO), Myra Raj (Head of Tutors), Kabir Panth (CTO), Sanjay Sangyal (Head of Operations)
- [ ] Add student_demo_interests table to schema (studentProfileId, tutorProfileId, status, createdAt)
- [ ] Add tRPC procedures: bookDemo, getMyDemoInterests (student), getAllDemoInterests (admin), updateDemoInterestStatus (admin)
- [ ] Fix NearbyTutors Book Free Demo button — show real status (pending/confirmed/cancelled) after click
- [ ] Add Student Demo Interests tab to Admin Dashboard
- [ ] Run pnpm test (14+ passing), 0 TypeScript errors
- [ ] Save checkpoint and publish
