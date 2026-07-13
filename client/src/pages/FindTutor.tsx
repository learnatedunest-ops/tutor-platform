/**
 * Find a Tutor — Requirement Registration Form
 * Parents/students post their requirements here.
 * EduNest admin then matches them with a verified registered tutor.
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useLocation } from "wouter";
import LoginWall from "@/components/LoginWall";
import {
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Star,
  GraduationCap,
  Phone,
  Laptop,
  Home,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const requirementSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(128),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number").max(20),
  role: z.enum(["student", "parent"]),
  studentName: z.string().max(128).optional(),
  grade: z.string().min(1, "Please select a grade"),
  board: z.enum(["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"]),
  subjects: z.string().min(2, "Please enter at least one subject").max(512),
  area: z.string().min(2, "Please select your area").max(128),
  mode: z.enum(["home_tuition", "online", "both"]),
  budget: z.string().max(64).optional(),
  preferredTime: z.string().max(128).optional(),
  additionalNotes: z.string().max(2000).optional(),
});

type RequirementForm = z.infer<typeof requirementSchema>;

const BENGALURU_AREAS = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar",
  "BTM Layout", "Electronic City", "Marathahalli", "Bannerghatta Road",
  "JP Nagar", "Rajajinagar", "Malleshwaram", "Hebbal", "Yelahanka",
  "Sarjapur Road", "Banashankari", "Vijayanagar", "RT Nagar", "Other",
];

const GRADES = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "Undergraduate", "Competitive Exam Prep",
];

const BUDGET_OPTIONS = [
  "Rs.500-Rs.800 / hour",
  "Rs.800-Rs.1,200 / hour",
  "Rs.1,200-Rs.1,800 / hour",
  "Rs.1,800-Rs.2,500 / hour",
  "Rs.2,500+ / hour",
  "Open to discussion",
];

const TIME_OPTIONS = [
  "Morning (6 AM - 10 AM)",
  "Afternoon (12 PM - 4 PM)",
  "Evening (4 PM - 8 PM)",
  "Weekends only",
  "Flexible",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: BookOpen,
    title: "Post Your Requirement",
    desc: "Fill in your subject, grade, area, and preferred mode. Takes less than 2 minutes.",
  },
  {
    step: "02",
    icon: Users,
    title: "We Find the Best Match",
    desc: "Our team reviews your requirement and matches you with a verified tutor from our network.",
  },
  {
    step: "03",
    icon: Phone,
    title: "We Connect You",
    desc: "We call or WhatsApp you within 24 hours with the best tutor match for your needs.",
  },
  {
    step: "04",
    icon: Star,
    title: "Start Learning",
    desc: "Meet your tutor for a free demo class. If you are happy, start regular sessions.",
  },
];

const TRUST_POINTS = [
  { icon: CheckCircle2, text: "100% Verified Tutors" },
  { icon: GraduationCap, text: "Qualified and Experienced" },
  { icon: MapPin, text: "All Bengaluru Areas" },
  { icon: Clock, text: "Response within 24 hours" },
];

export default function FindTutor() {
  const { isAuthenticated, loading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const [, navigate] = useLocation();
  const { data: studentProfile } = trpc.studentProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated && userRole === "student" }
  );

  // Redirect logged-in users to the right page
  useEffect(() => {
    if (!loading && !roleLoading && isAuthenticated) {
      if (userRole === "student") {
        if (studentProfile) {
          navigate("/nearby-tutors");
        } else {
          navigate("/student-setup");
        }
      } else if (userRole === "tutor") {
        navigate("/tutor-dashboard");
      } else if (userRole === null) {
        navigate("/role-select");
      }
    }
  }, [loading, roleLoading, isAuthenticated, userRole, studentProfile, navigate]);

  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.studentRequirement.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Requirement submitted! We will contact you within 24 hours.");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequirementForm>({
    resolver: zodResolver(requirementSchema),
    defaultValues: { role: "parent", mode: "both" },
  });

  const onSubmit = (data: RequirementForm) => {
    submitMutation.mutate(data);
  };

  // Show login wall for unauthenticated users
  if (!loading && !isAuthenticated) {
    return <LoginWall role="student" title="Find the Perfect Tutor Near You" subtitle="Create your free account to submit your tuition requirement and get matched with a verified tutor near your home." />;
  }

  return (
    <>
      <SEO
        title="Find a Tutor in Bengaluru | EduNest"
        description="Post your tuition requirement and get matched with a verified home tutor in Bengaluru within 24 hours. CBSE, ICSE, IB, all subjects covered."
        keywords="find tutor Bengaluru, home tuition near me, CBSE tutor Bengaluru, hire tutor Bengaluru"
        url="https://edunest.courses/find-tutor"
      />
      <Navbar />

      <section className="bg-gradient-to-br from-[#F47920] to-[#e06010] text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Free to post - No sign-up required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-['Poppins'] mb-4 leading-tight">
            Find Your Perfect Tutor
            <br />
            <span className="text-yellow-200">in Bengaluru</span>
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Tell us what you need - subject, grade, area, and budget. Our team will personally match you with a verified tutor and connect you within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm">
                <Icon className="w-4 h-4 text-yellow-200" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-['Poppins'] text-gray-800 text-center mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-100 transition-colors">
                  <Icon className="w-7 h-7 text-[#F47920]" />
                </div>
                <div className="text-xs font-bold text-[#F47920] mb-1">STEP {step}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold font-['Poppins'] text-gray-800 mb-3">
                Requirement Submitted!
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Thank you! Our team will review your requirement and call or WhatsApp you within{" "}
                <strong>24 hours</strong> with the best tutor match.
              </p>
              <div className="bg-orange-50 rounded-2xl p-5 mb-6 text-left space-y-2">
                <p className="text-sm font-semibold text-gray-700">What happens next?</p>
                {[
                  "Our team reviews your requirement and finds the best matching tutor",
                  "We call/WhatsApp you within 24 hours with tutor details",
                  "You get a free demo class before committing to regular sessions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <ChevronRight className="w-4 h-4 text-[#F47920] mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Need immediate help?{" "}
                <a
                  href="https://wa.me/918618635627?text=Hi%2C%20I%20just%20submitted%20my%20tutor%20requirement%20on%20EduNest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F47920] font-semibold hover:underline"
                >
                  WhatsApp us now
                </a>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#F47920] to-[#e06010] px-8 py-6 text-white">
                <h2 className="text-xl font-bold font-['Poppins']">Post Your Tutor Requirement</h2>
                <p className="text-white/80 text-sm mt-1">Free - Takes 2 minutes - We will match you within 24 hours</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">I am a *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["parent", "student"] as const).map((r) => (
                      <label
                        key={r}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium capitalize ${
                          watch("role") === r
                            ? "border-[#F47920] bg-orange-50 text-[#F47920]"
                            : "border-gray-200 text-gray-600 hover:border-orange-200"
                        }`}
                      >
                        <input type="radio" value={r} {...register("role")} className="sr-only" />
                        {r === "parent" ? <Users className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                        {r === "parent" ? "Parent" : "Student"}
                      </label>
                    ))}
                  </div>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                    <input
                      {...register("name")}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  {watch("role") === "parent" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Student's Name</label>
                      <input
                        {...register("studentName")}
                        placeholder="e.g. Arjun Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      {...register("phone")}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Grade / Class *</label>
                    <select
                      {...register("grade")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                    >
                      <option value="">Select grade</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Board *</label>
                    <select
                      {...register("board")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                    >
                      <option value="">Select board</option>
                      {["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {errors.board && <p className="text-red-500 text-xs mt-1">{errors.board.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject(s) Needed *</label>
                  <input
                    {...register("subjects")}
                    placeholder="e.g. Mathematics, Physics, Chemistry"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate multiple subjects with commas</p>
                  {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Area in Bengaluru *</label>
                  <select
                    {...register("area")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                  >
                    <option value="">Select your area</option>
                    {BENGALURU_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Mode *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: "home_tuition", label: "Home Tuition", icon: Home },
                      { value: "online", label: "Online", icon: Laptop },
                      { value: "both", label: "Either", icon: Star },
                    ] as const).map(({ value, label, icon: Icon }) => (
                      <label
                        key={value}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all text-xs font-medium ${
                          watch("mode") === value
                            ? "border-[#F47920] bg-orange-50 text-[#F47920]"
                            : "border-gray-200 text-gray-600 hover:border-orange-200"
                        }`}
                      >
                        <input type="radio" value={value} {...register("mode")} className="sr-only" />
                        <Icon className="w-5 h-5" />
                        {label}
                      </label>
                    ))}
                  </div>
                  {errors.mode && <p className="text-red-500 text-xs mt-1">{errors.mode.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Budget (optional)</label>
                    <select
                      {...register("budget")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                    >
                      <option value="">Select budget range</option>
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Time (optional)</label>
                    <select
                      {...register("preferredTime")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                    >
                      <option value="">Select preferred time</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes (optional)</label>
                  <textarea
                    {...register("additionalNotes")}
                    rows={3}
                    placeholder="Any specific requirements, learning goals, or details that would help us find the right tutor..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitMutation.isPending}
                  className="w-full bg-[#F47920] hover:bg-[#e06010] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Find My Tutor
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By submitting, you agree to be contacted by EduNest regarding tutor matching. We never share your details with third parties.
                </p>
              </form>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold font-['Poppins'] text-gray-800 text-center mb-10">
            Why Parents Choose EduNest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: "Personally Verified Tutors",
                desc: "Every tutor on our platform is background-checked, qualification-verified, and personally interviewed by our team.",
              },
              {
                icon: Clock,
                title: "24-Hour Matching",
                desc: "Post your requirement today and receive a matched tutor recommendation by tomorrow - guaranteed.",
              },
              {
                icon: Star,
                title: "Free Demo Class",
                desc: "Meet your tutor for a free 30-minute demo class before committing to any paid sessions.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-orange-50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6 text-[#F47920]" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
