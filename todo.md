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
- [x] Add session timeout hook (30 min inactivity auto-logout) for logged-in tutors and students
- [x] Remove "Tutors Near Me" and "Tutor Dashboard" from Resources dropdown in Navbar
- [x] Update About Us page: Amogha Amange (Founder & CEO), Myra Raj (Head of Tutors), Kabir Panth (CTO), Sanjay Sangyal (Head of Operations)
- [x] Add student_demo_interests table to schema (studentProfileId, tutorProfileId, status, createdAt)
- [x] Add tRPC procedures: bookDemo, getMyDemoInterests (student), getAllDemoInterests (admin), updateDemoInterestStatus (admin)
- [x] Fix NearbyTutors Book Free Demo button — show real status (pending/confirmed/cancelled) after click
- [x] Add Student Demo Interests tab to Admin Dashboard
- [x] Run pnpm test (14 passing), 0 TypeScript errors
- [x] Save checkpoint and publish

## Round 12 — TutorDashboard Fixes
- [x] Fix Edit Profile button in TutorDashboard — open editable form pre-filled with saved tutor details
- [x] Remove My Profile button from Navbar for tutor accounts
- [x] Fix Express Interest persistence — show "Interest Expressed" state after page refresh (query existing interest on load)
- [x] Run pnpm test (14 passing), 0 TypeScript errors
- [x] Save checkpoint

## Round 14 — Full Profile Modal, Admin Education Display, Interest Bug Fix, Security
- [x] Add full tutor profile modal on NearbyTutors page (all details + education + workExperience + Book Demo button)
- [x] Add education/workExperience display in Admin Tutor Profiles tab (expandable section)
- [x] Fix tutor interest approval bug: show accepted/declined status in TutorDashboard instead of generic "Interest Expressed"
- [x] Security hardening: helmet.js, rate limiting, input validation, CORS tightening, CSP headers

## Round 16

- [x] Email OTP integration for phone verification (free via Resend — OTP sent to user's registered email)
- [x] Admin Demo Slots panel with status management (pending_schedule/scheduled/completed/cancelled)

## Round 17 — Post-Demo Proceed Flow & Confirmed Matches

- [x] Add tutorProceedIntent and studentProceedIntent fields to demo_slots table
- [x] Add confirmed_matches table (demoSlotId, tutorProfileId, studentProfileId, matchedAt)
- [x] Run db:push for schema changes
- [x] Backend: demoSlot.setProceedIntent tRPC procedure (tutor/student sets yes/no)
- [x] Backend: auto-create confirmed_match when both parties say yes, send contact reveal emails
- [x] Backend: confirmedMatch.listAll admin procedure
- [x] Email: sendContactRevealEmail (tutor gets student details, student gets tutor details)
- [x] TutorDashboard: show "Demo Scheduled ✓" status label, "Proceed?" buttons after demo completes
- [x] StudentPortal: show "Demo Confirmed ✓" status label, "Proceed?" buttons after demo completes
- [x] Admin: Confirmed Matches tab with full student + tutor details

## Round 18 — Session Log Sheet & Payment Tracking

- [x] DB: add session_logs table (matchId FK, tutorName, studentName, uploadedSheetUrl, paymentStatus, adminApprovedAt)
- [x] DB: run db:push
- [x] Backend: sessionLog.getOrCreate (by matchId), sessionLog.uploadSheet, sessionLog.getByMatch, sessionLog.updatePaymentStatus (admin)
- [x] Frontend: printable /session-log/:matchId page — Daily Tuition Time Duration sheet (20-row table, tutor name, student name, date/in-time/out-time/duration/parent signature columns)
- [x] TutorDashboard: "Download Session Sheet" link + "Upload Completed Sheet" button + Pending/Payment Processed badge per confirmed match
- [x] StudentPortal: payment icon (Pending/Payment Processed) shown once tutor uploads the sheet
- [x] Admin: Session Logs tab — view uploaded sheet, approve payment button, update status
- [x] 14+ tests passing, 0 TypeScript errors

## Round 19 — Bug Fixes & Ongoing Classes

- [x] Fix S3 upload endpoint: accept image types (JPEG/PNG/HEIC/WebP), increase size to 10MB, fix auth
- [x] Fix contact reveal email: ensure parent/student receives tutor details email when both say yes
- [x] Reduce session log sheet from 30 to 20 rows, fix A4 print layout
- [x] Show payment pending badge only after successful sheet upload (not before)
- [x] TutorDashboard: Ongoing Classes section — dedicated /ongoing-classes page with upload + payment
- [x] StudentPortal: My Classes section — dedicated /my-classes page with payment info + tutor contact
## Round 21 — Gmail SMTP & Budget Fix
- [x] Install nodemailer + @types/nodemailer
- [x] Store GMAIL_APP_PASSWORD as project secret
- [x] Rewrite server/email.ts: OTP + contact reveal emails use Gmail SMTP (Nodemailer), owner notifications keep Resend
- [x] Remove OTP fallback code display from PhoneOtpVerifier.tsx — Gmail SMTP delivers to any email
- [x] Remove fallbackCode from routers.ts OTP send response
- [x] Fix Budget (per month) input in StudentSetup to number-only (type=number, min=0, strip non-digits)
- [x] Update email.test.ts to validate GMAIL_APP_PASSWORD env and all email functions
- [x] 15/15 tests passing, 0 TypeScript errors
## Round 22 — Full Workflow Redesign
- [x] Fix StudentSetup "View Nearby Tutors" button to navigate to /nearby-tutors (not /student-portal)
- [x] Admin: rename "Demo Requests" tab to "Student Interests"; remove old Demo Bookings tab
- [x] DB schema: add adminApprovalStatus to tutorInterests and studentDemoInterests (pending_admin/admin_approved/admin_rejected)
- [x] DB schema: add interestDirection to demoSlots (tutor_to_student / student_to_tutor) and store parent's mode preference
- [x] DB schema: add parentAccepted field to demoSlots (for tutor-initiated interest, parent must accept before scheduling)
- [x] DB schema: add paymentAmount to confirmedMatches (copied from student budget at match time)
- [x] DB: run db:push for schema changes
- [x] Backend: tutorInterest.express now sets adminApprovalStatus=pending_admin; admin approves → student sees it in dashboard
- [x] Backend: studentDemoInterest.bookDemo now sets adminApprovalStatus=pending_admin; admin approves → tutor sees it in dashboard
- [x] Backend: student/parent can accept or reject admin-approved tutor interest
- [x] Backend: tutor can accept or reject admin-approved student demo interest
- [x] Backend: after acceptance, only parent sets demo date/time; tutor receives full contact details (address + phone) on scheduling
- [x] Backend: demo mode comes from student's registered preference (not hardcoded "online")
- [x] Backend: post-demo question — both parties see "Would you like to continue?" (no mention of contact sharing)
- [x] Backend: admin marks demo as completed; both parties see "Got a Class!" status
- [x] Backend: confirmed match stores paymentAmount from student's registered budget
- [x] TutorDashboard: show admin-approved student interests (accept/reject); show correct demo mode from student profile
- [x] TutorDashboard: after accepting student interest, show demo details with student full address + phone
- [x] TutorDashboard: post-demo "Would you like to continue with this student?" (no contact-sharing mention)
- [x] StudentPortal: show admin-approved tutor interests (accept/reject); show tutor info (id, experience, qualification, subjects, mode) but NOT contact/work details
- [x] StudentPortal: after accepting tutor interest, parent sets demo date/time
- [x] StudentPortal: post-demo "Would you like to continue with this tutor?" (no contact-sharing mention)
- [x] StudentPortal: "Got a Class!" status once admin marks completed; show payment amount from registered budget
- [x] NearbyTutors: tutor profile modal — hide work experience and contact details; show id, experience years, subjects, mode, qualification
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 23 — My Classes + Site Audit
- [x] Add getMineForStudent confirmed matches procedure with tutor profile join (name, subjects, experience, mode, area, qualification)
- [x] Add My Classes tab to StudentPortal showing confirmed class summary cards (tutor name, subjects, schedule, monthly fee, session log status)
- [x] Full site audit: browser console errors, network errors, TypeScript errors, broken links
- [x] Fix all errors found: bad oklch value (5018 → 50), 7 nested Link > a patterns in StudentPortal
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 24 — Simplified Direct Interest Workflow (No Admin Gate)
- [x] DB: add tutorConfirmedComing (varchar) to demo_slots table; run db:push
- [x] Backend: tutorInterest.express — interest goes directly to student (no adminApprovalStatus gate); student sees it immediately in Tutor Interests tab
- [x] Backend: studentDemoInterest.bookDemo — interest goes directly to tutor (no adminApprovalStatus gate); tutor sees it immediately in Student Interests tab
- [x] Backend: getApprovedForMe procedures now return all interests (no admin filter)
- [x] Backend: demoSlot.schedule — when parent schedules demo, share full student address + phone with tutor via email notification
- [x] Backend: add demoSlot.tutorConfirmComing procedure — tutor clicks "Coming for Demo"; parent gets notified under their demo tab
- [x] Admin panel: remove Approve/Reject buttons from Tutor Interests and Student Interests tabs (admin is read-only observer)
- [x] StudentPortal Tutor Interests tab: show ALL tutor interests directly; accepted interest shows inline demo scheduler
- [x] TutorDashboard Student Interests tab: show ALL student interests directly; always visible with empty state
- [x] TutorDashboard Demo Slots: add "I'm Coming for Demo" Yes/No button on scheduled slots
- [x] StudentPortal Demo tab: show "Tutor has confirmed they are coming" badge when tutor clicks coming
- [x] Show student profile info (grade, subjects, mode, area) in student interest cards in TutorDashboard
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 25 — Tutor Availability Confirmation & Google Maps Link
- [x] TutorDashboard: on scheduled demo slots, add "I'm Available / Coming" button and "Unavailable — Suggest New Time" button with a time picker
- [x] Backend: add demoSlot.suggestReschedule procedure — tutor proposes a new date/time; parent sees it and can accept or keep original
- [x] StudentPortal: show tutor's suggested reschedule time with Accept/Keep Original buttons
- [x] Replace student lat/lng coordinates in contact reveal email with a Google Maps navigation link (https://maps.google.com/?q=lat,lng or address)
- [x] Replace student lat/lng in TutorDashboard demo slot card with a clickable Google Maps link
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 25 — Tutor Availability Confirmation + Google Maps Navigation
- [x] Add tutorSuggestedDate and tutorSuggestedTime columns to demo_slots schema; run db:push
- [x] Add updateDemoSlotTutorReschedule and updateDemoSlotParentRescheduleResponse db helpers
- [x] Add demoSlot.suggestReschedule procedure (tutor proposes new date/time; parent notified)
- [x] Add demoSlot.parentRespondReschedule procedure (parent accepts or keeps original time)
- [x] TutorDashboard: fix tutorConfirmedComing guard to treat 'pending' as actionable
- [x] TutorDashboard: "Are you available?" card with "Yes, I'm Available" and "Suggest New Time" buttons
- [x] TutorDashboard: inline date/time picker for tutor to suggest a new demo time
- [x] TutorDashboard: show parent's response to reschedule suggestion (accepted/declined/waiting)
- [x] TutorDashboard: replace raw address text with Google Maps navigation link (uses lat/lng if available, falls back to address string)
- [x] StudentPortal: replace static 'contact EduNest' message with reschedule suggestion UI
- [x] StudentPortal: show tutor's suggested date/time with Accept New Time / Keep Original buttons
- [x] StudentPortal: add parentRespondReschedule mutation
- [x] email.ts: add studentFullAddress, studentLat, studentLng to sendContactRevealToTutor; include Google Maps navigation button in email
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 26 — Fix React #310 Error + Demo Schedule in Tutor Interests Card
- [x] Fix React error #310: extract IIFE with useState (showReschedule, suggestDate, suggestTime) inside demo slot map in TutorDashboard into a proper DemoSlotAvailabilityCard sub-component
- [x] Add demo schedule date/time to accepted Tutor Interests card in StudentPortal (show "Demo scheduled for [date] at [time]" once parent has scheduled)
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 27 — Session Log Upload Fix + Full Student Details for Tutor
- [x] Fix session log PDF upload bug — root cause was wrong cookie name ('session=' vs 'app_session_id=') in upload auth check; fixed in server/_core/index.ts
- [x] Show full student/parent details in tutor demo slot card: name (with child name if parent), grade, subjects, area, budget (fees), phone, address, Google Maps link
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 28 — Fix Sheet Upload + Tutor My Classes Section
- [x] Fix session log sheet upload — file selected but not received by server; replace busboy multipart with tRPC base64 upload to avoid multipart parsing issues in production
- [x] Add My Classes section to Tutor Dashboard — show completed demo cards with full student details and upload sheet UI
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 29 — Manual UPI Payment Flow
- [x] DB: add upiId field to tutor_profiles table; run db:push
- [x] DB: add parentPaid (boolean), parentPaidAt (timestamp), parentPaymentNote to session_logs; run db:push
- [x] Backend: sessionLog.markParentPaid procedure (parent marks they've paid)
- [x] Backend: sessionLog.adminApprovePayment procedure — sets paymentStatus=payment_processed, notifies tutor via email
- [x] Backend: sessionLog.myLogsAsStudent procedure (student/parent can query their session logs)
- [x] TutorSetup: add UPI ID field (step 1 or step 4) with validation
- [x] StudentPortal: after tutor uploads sheet, show "Pay Now" card with EduNest UPI ID (8618635627@yescred), UPI QR code, amount, and "I've Paid — Notify EduNest" button
- [x] StudentPortal: after parent marks paid, show "Payment Under Review by EduNest" state
- [x] StudentPortal: after admin approves, show "Payment Processed ✅ — EduNest has paid your tutor" state
- [x] Admin Session Payments tab: list all sessions with parentPaid=true and paymentStatus=sheet_uploaded; show Approve Payment button
- [x] Admin approval: set paymentStatus=payment_processed, send tutor fee-paid email with their UPI ID
- [x] TutorDashboard My Classes: show "Fee Pending" until admin approves, then "Fee Paid ✅" (never show parent paid status)
- [x] Email: parent gets pay-now email when tutor uploads sheet (with EduNest UPI + amount)
- [x] Email: tutor gets fee-paid email when admin approves (with their UPI ID + amount)
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 30 — Portal Cleanup + Cancel Class Flow
- [x] DB: add cancellationRequestedBy, cancellationRequestedAt, cancellationNote to confirmedMatches; run db:push
- [x] Backend: confirmedMatch.requestCancellation procedure (tutor or parent can request)
- [x] Backend: confirmedMatch.adminApproveCancellation procedure (sets classStatus=cancelled, notifies both parties)
- [x] Backend: update getNearbyStudents to exclude students already in active class with requesting tutor
- [x] Backend: update getNearbyTutors to exclude tutors already in active class with requesting parent
- [x] StudentPortal: remove "My Demo Bookings" tab
- [x] Remove /my-classes standalone route from App.tsx and Navbar
- [x] TutorDashboard Find Students: hide students with active confirmed class with this tutor
- [x] NearbyTutors: block browsing new tutors if parent has active class; show active class card with Cancel option
- [x] NearbyTutors: Cancel Class button → confirmation dialog → Under Review state
- [x] TutorDashboard My Classes: Cancel Class button → confirmation dialog → Under Review state
- [x] Both sides: show "Class Stopped" badge when admin cancels; unlock find-tutor/find-student
- [x] Admin panel: show cancellation requests with Approve Cancellation button
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 31 — WhatsApp Alerts + T&C + Conduct Guidelines
- [x] Scrape Otoo T&C and draft EduNest Terms & Conditions page with custom clauses
- [x] Build /terms page with full T&C (40% deduction first month, ₹350 demo cancellation fee, conduct guidelines)
- [x] Add T&C checkbox to TutorSetup (step 1) with link to /terms
- [x] Add T&C checkbox to StudentSetup (step 1) with link to /terms
- [x] Add WhatsApp alert helper: sendWhatsAppAlert(adminNumber, message, replyToNumber) using wa.me deep link in owner notification email
- [x] WhatsApp alert: when parent schedules demo — message to admin with parent's WhatsApp link
- [x] WhatsApp alert: when tutor uploads sheet — message to admin with tutor's WhatsApp link
- [x] WhatsApp alert: when parent marks payment — message to admin with parent's WhatsApp link
- [x] WhatsApp alert: when cancellation is requested — message to admin with requester's WhatsApp link
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 32 — T&C Split, Fields, IDs, Privacy, WhatsApp Fix
- [x] Split T&C: TutorSetup shows only tutor-specific T&C (conduct, UPI, 40% deduction); StudentSetup shows only parent-specific T&C (demo cancellation ₹350, payment terms)
- [x] Parent T&C: demo cancellation = ₹350 charge regardless of when they cancel (before or after class)
- [x] DB: add gender (male/female/other) to tutor_profiles; add tutorGenderPreference (male/female/no_preference) to student_profiles; run db:push
- [x] TutorSetup: make UPI ID mandatory (required field with validation); add gender dropdown
- [x] StudentSetup: add tutor gender preference dropdown (Male / Female / No Preference)
- [x] Session log sheet: replace "EduNest" text header with EduNest logo image; fix to single A4 page (reduce rows or font size)
- [x] ID display prefixes: show student IDs as S001, S002; tutor IDs as T001, T002; class/match IDs as C001, C002 in admin panel
- [x] Active class privacy: in NearbyStudents (tutor find-students), hide student profiles that have an active class with ANY tutor (not just this tutor)
- [x] Fix WhatsApp alerts: send real WhatsApp message to admin number 8618635627 — use wa.me link in email body prominently + also trigger owner notification with direct wa.me link
- [x] 15/15 tests passing, 0 TypeScript errors



## Round 33 — Gender Badge & Demo Cancellation Flow
- [x] NearbyTutors: show gender badge (Male/Female) on tutor cards and in full profile modal
- [x] DB: add demoCancelledBy, demoCancelledAt, demoCancellationFeeCleared to demo_slots; run db:push
- [x] Backend: demoSlot.cancelDemo procedure (parent cancels scheduled demo)
- [x] Backend: admin clearCancellationFee procedure (marks fee as cleared)
- [x] Backend: getNearbyTutors blocks re-booking if student has pending cancellation fee
- [x] StudentPortal: Cancel Demo button on scheduled demo cards → ₹350 fee notice → blocked from re-booking
- [x] Admin: Cancelled Demos tab with ₹350 fee pending and Clear Fee button
- [x] 15/15 tests passing, 0 TypeScript errors



## Round 34 — Google OAuth (Replace Manus OAuth)
- [x] Install googleapis package
- [x] Create server/_core/googleOAuth.ts with /api/auth/google and /api/auth/callback/google routes
- [x] Add Google env vars to server/_core/env.ts (googleClientId, googleClientSecret, googleAdminEmail)
- [x] Register Google OAuth routes in server/_core/index.ts
- [x] Update client/src/const.ts — startLogin() now redirects to /api/auth/google
- [x] Update client/src/main.tsx — remove Manus sessionStorage fallback from tRPC client headers
- [x] Update client/src/_core/hooks/useAuth.ts — remove Manus sessionStorage references
- [x] Fix sdk.ts authenticateRequest — skip Manus OAuth fallback for google_ users
- [x] Update LoginWall component with Google Sign-In button (white button with Google logo)
- [x] Update Navbar login buttons to say "Sign in with Google"
- [x] Update Admin.tsx login button from "Log In with Manus" to "Sign in with Google"
- [x] Update ManusDialog component to say "Sign in with Google"
- [x] Update DashboardLayout sign-in button to say "Sign in with Google"
- [x] Update ensureOwnerAdmin procedure to check Google admin email (learn.at.edunest@gmail.com) instead of OWNER_OPEN_ID
- [x] 15/15 tests passing, 0 TypeScript errors

## Round 35 — 8 Bug Fixes

- [x] Fix T&C modal styling (TutorTermsModal + ParentTermsModal) — proper scrollable modal with fixed header/footer
- [x] Fix post-approval navigation: tutor "Go to My Dashboard" → /tutor-dashboard (not role-select)
- [x] Fix post-approval navigation: parent "Find Nearby Tutors" → /nearby-tutors (not role-select)
- [x] Flexible class registration in TutorSetup — dynamic multi-row entries (grade range + subjects + fee)
- [x] Privacy: strip phone + address from getNearbyStudents, getNearbyTutors, getDemoSlotsByTutor
- [x] Remove phone/address display from TutorDashboard demo slot card and student interests card
- [x] NearbyTutors "Demo Class Confirmed!" card — add "Go to Dashboard to Schedule" link
- [x] TutorDashboard Student Interests — add "View Demo Details" link for confirmed interests
- [x] TutorDashboard demo slot card — show "Go to My Classes" button when both parties accept, dismiss card on click
- [x] StudentPortal demo slot card — show "Go to My Classes" button when both parties accept, dismiss card on click
- [x] Admin "View Uploaded Sheet" — fix 404 by using presigned S3 URL via ViewSheetButton component

## Round 36 — UX Improvements

- [x] Simplify tutor class registration: two text areas (grades + subjects), remove fee input
- [x] Parent dashboard: replace "Schedule your demo below" with a link; show tutor name + contact in confirmed demo card
- [x] My Classes: show full party details (tutor info to parent, parent info to tutor)
- [x] Post-payment: add direct-payment message to both parties when fee is processed
- [x] Reflect class cancellation by admin in My Classes cards for both parties
- [x] Move T&C content inside modal only — remove any inline display outside

## Round 38 — Blog Local Guides + Google Analytics 4
- [x] Add 5 SEO blog posts (Local Guides category) to Blog.tsx: Koramangala, Indiranagar, HSR Layout, Whitefield, Jayanagar/JP Nagar
- [x] Add "Local Guides" category to blog filter
- [x] Write full article content (~800-1000 words each) for all 5 Local Guides posts in BlogPost.tsx
- [x] Update sitemap to include all 5 new blog post URLs with priority 0.8
- [x] Add Google Analytics 4 placeholder script to client/index.html with setup instructions
- [x] 20/20 tests passing, 0 TypeScript errors
