/**
 * TutorTermsModal — shown during tutor registration
 * Contains ONLY tutor-specific T&C: conduct guidelines, UPI/payment terms, 40% deduction policy
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TutorTermsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TutorTermsModal({ open, onClose }: TutorTermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden flex flex-col" style={{ maxHeight: "85vh" }}>
        {/* Fixed header */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-600">
              EduNest Tutor Terms &amp; Conditions
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Please read carefully before registering as a tutor</p>
          </DialogHeader>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div className="space-y-5 text-sm text-foreground">

            {/* Section 1 — Agreement */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">1. Agreement to Terms</h3>
              <p className="text-muted-foreground leading-relaxed">By registering as a tutor on EduNest, you agree to abide by these terms and conditions in full. EduNest reserves the right to update these terms at any time with notice provided via email.</p>
            </section>

            {/* Section 2 — Fee & Payment Policy */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">2. Fee &amp; Payment Policy</h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                <p className="font-semibold text-orange-800 text-sm">⚠️ Important: First Month Deduction</p>
                <p className="mt-1 text-orange-700 text-sm leading-relaxed">
                  EduNest deducts <strong>40% of the tuition fee</strong> for the first month as a platform service charge. From the second month onwards, <strong>no deductions</strong> are made — you receive 100% of the agreed tuition fee directly.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                <li>Payment is processed by EduNest after the parent submits the session sheet payment.</li>
                <li>You must provide a valid UPI ID during registration to receive payments.</li>
                <li>Payments are transferred to your UPI ID within 3–5 business days of admin approval.</li>
                <li>EduNest is not responsible for delays caused by incorrect UPI IDs provided by the tutor.</li>
                <li>Demo classes are unpaid. Payment begins only after a confirmed ongoing class starts.</li>
              </ul>
            </section>

            {/* Section 3 — Conduct Guidelines */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">3. Tutor Conduct Guidelines</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-2">👔 Dress Code</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Always dress professionally and modestly for all classes (demo and ongoing).</li>
                    <li>Avoid casual or revealing clothing. Formal or smart-casual attire is required.</li>
                    <li>Maintain personal hygiene and a neat appearance at all times.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-2">🕐 Punctuality</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Arrive on time for every class. Being late by more than 10 minutes without prior notice is unacceptable.</li>
                    <li>If you cannot attend, notify EduNest and the parent at least 24 hours in advance.</li>
                    <li>Repeated cancellations or no-shows may result in account suspension.</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-2 text-green-800">✅ What To Do</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Prepare a lesson plan before each session.</li>
                    <li>Maintain a positive, encouraging, and patient attitude with students.</li>
                    <li>Fill in the session log sheet accurately after every class.</li>
                    <li>Communicate any concerns about the student's progress to EduNest promptly.</li>
                    <li>Respect the privacy of the student and their family at all times.</li>
                    <li>Conduct yourself professionally in the student's home or online environment.</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-2 text-red-800">❌ What NOT To Do</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Do not share the student's personal information (address, phone, school) with anyone.</li>
                    <li>Do not discuss politics, religion, or any controversial topics during sessions.</li>
                    <li>Do not use your mobile phone for personal use during class time.</li>
                    <li>Do not accept gifts, money, or favours directly from parents outside the EduNest platform.</li>
                    <li>Do not negotiate fees directly with parents — all fee discussions must go through EduNest.</li>
                    <li>Do not conduct classes outside the EduNest platform to bypass fees.</li>
                    <li>Do not use inappropriate language or behaviour with students or parents.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 — Demo Class Policy */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">4. Demo Class Policy</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                <li>Demo classes are free for parents and unpaid for tutors.</li>
                <li>You must confirm your attendance for the demo class at least 2 hours before the scheduled time.</li>
                <li>If you cancel a confirmed demo without 24 hours' notice, it may affect your profile rating.</li>
                <li>After the demo, both you and the parent will be asked if you wish to continue. Only if both agree will an ongoing class be confirmed.</li>
              </ul>
            </section>

            {/* Section 5 — Profile & Verification */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">5. Profile &amp; Verification</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                <li>All information provided during registration must be accurate and truthful.</li>
                <li>EduNest reserves the right to verify your qualifications and identity.</li>
                <li>Providing false information may result in immediate account termination.</li>
                <li>Your profile will only be visible to parents after EduNest admin approval.</li>
              </ul>
            </section>

            {/* Section 6 — Termination */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">6. Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">EduNest reserves the right to suspend or terminate your account for violation of these terms, misconduct, repeated cancellations, or any behaviour deemed harmful to students, parents, or the EduNest brand.</p>
            </section>

            {/* Section 7 — Governing Law */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">7. Governing Law</h3>
              <p className="text-muted-foreground leading-relaxed">These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>
            </section>

          </div>
        </div>

        {/* Fixed footer */}
        <div className="px-6 py-4 border-t bg-background flex-shrink-0">
          <Button onClick={onClose} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
            I Have Read &amp; Understood the Terms
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
