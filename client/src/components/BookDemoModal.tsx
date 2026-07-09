import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";

interface BookDemoModalProps {
  open: boolean;
  onClose: () => void;
  tutorName: string;
  tutorSubject: string;
}

const GRADES = [
  "Class 1–2", "Class 3–4", "Class 5–6", "Class 7–8",
  "Class 9–10 (CBSE)", "Class 9–10 (ICSE)", "Class 9–10 (IB)",
  "Class 11–12 (Science)", "Class 11–12 (Commerce)", "Class 11–12 (Arts)",
  "Undergraduate", "Competitive Exams (JEE/NEET)", "Other",
];

const TIME_SLOTS = [
  "6:00 AM – 7:00 AM", "7:00 AM – 8:00 AM", "8:00 AM – 9:00 AM",
  "9:00 AM – 10:00 AM", "10:00 AM – 11:00 AM", "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM", "2:00 PM – 3:00 PM", "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM", "5:00 PM – 6:00 PM", "6:00 PM – 7:00 PM",
  "7:00 PM – 8:00 PM", "8:00 PM – 9:00 PM",
];

// Generate next 14 days for date selection
function getAvailableDates() {
  const dates: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
    const value = d.toLocaleDateString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    dates.push({ label, value });
  }
  return dates;
}

export default function BookDemoModal({ open, onClose, tutorName, tutorSubject }: BookDemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    grade: "",
    subject: tutorSubject,
    preferredDate: "",
    preferredTime: "",
    mode: "" as "home_tuition" | "online" | "",
    message: "",
  });

  const submitMutation = trpc.demoBooking.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to book demo class. Please try again.");
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.grade || !form.preferredDate || !form.preferredTime || !form.mode) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      tutorName,
      tutorSubject,
      studentName: form.studentName,
      studentEmail: form.studentEmail,
      studentPhone: form.studentPhone,
      grade: form.grade,
      subject: form.subject,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      mode: form.mode as "home_tuition" | "online",
      message: form.message || undefined,
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({
      studentName: "", studentEmail: "", studentPhone: "",
      grade: "", subject: tutorSubject, preferredDate: "",
      preferredTime: "", mode: "", message: "",
    });
    onClose();
  };

  const dates = getAvailableDates();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Demo Class Booked!
            </DialogTitle>
            <p className="text-gray-600 max-w-xs">
              Your demo class with <strong>{tutorName}</strong> has been requested. We'll confirm your slot via WhatsApp or call within 2 hours.
            </p>
            <p className="text-sm text-orange-600 font-medium">
              📞 For urgent queries, call us at +91-8618635627
            </p>
            <Button
              onClick={handleClose}
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                Book a Free Demo Class
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Book a free demo with <strong className="text-orange-600">{tutorName}</strong> — {tutorSubject}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Student Details */}
              <div className="bg-orange-50 rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-1">
                  <User className="w-3 h-3" /> Student / Parent Details
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="studentName" className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="studentName"
                      placeholder="Your name or student's name"
                      value={form.studentName}
                      onChange={e => handleChange("studentName", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="studentPhone" className="text-sm font-medium text-gray-700">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="studentPhone"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.studentPhone}
                        onChange={e => handleChange("studentPhone", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentEmail" className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={form.studentEmail}
                        onChange={e => handleChange("studentEmail", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Details */}
              <div className="bg-blue-50 rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Class Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Grade / Class <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.grade} onValueChange={v => handleChange("grade", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Mathematics"
                      value={form.subject}
                      onChange={e => handleChange("subject", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Mode of Teaching <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-3 mt-1">
                    {[
                      { value: "home_tuition", label: "🏠 Home Tuition" },
                      { value: "online", label: "💻 Online" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("mode", opt.value)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          form.mode === opt.value
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-green-50 rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Preferred Schedule
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.preferredDate} onValueChange={v => handleChange("preferredDate", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pick a date" />
                      </SelectTrigger>
                      <SelectContent>
                        {dates.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Time Slot <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.preferredTime} onValueChange={v => handleChange("preferredTime", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pick a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(t => (
                          <SelectItem key={t} value={t}>
                            <Clock className="w-3 h-3 inline mr-1" />{t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Optional message */}
              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Additional Notes <span className="text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Any specific topics, learning goals, or requirements..."
                  value={form.message}
                  onChange={e => handleChange("message", e.target.value)}
                  rows={2}
                  className="mt-1 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-base"
              >
                {submitMutation.isPending ? "Booking..." : "Book Free Demo Class →"}
              </Button>
              <p className="text-xs text-center text-gray-400">
                100% Free • No commitment required • Confirmation within 2 hours
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
