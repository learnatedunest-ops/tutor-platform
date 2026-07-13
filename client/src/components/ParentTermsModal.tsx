/**
 * ParentTermsModal — shown during parent/student registration
 * Contains ONLY parent-specific T&C: demo cancellation fee, payment terms, parent conduct
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ParentTermsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ParentTermsModal({ open, onClose }: ParentTermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden flex flex-col" style={{ maxHeight: "85vh" }}>
        {/* Fixed header */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-600">
              EduNest Parent / Student Terms &amp; Conditions
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Please read carefully before registering</p>
          </DialogHeader>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div className="space-y-5 text-sm text-foreground">

            {/* Section 1 — Agreement */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">1. Agreement to Terms</h3>
              <p className="text-muted-foreground leading-relaxed">By registering on EduNest as a parent or student, you agree to abide by these terms and conditions in full. EduNest reserves the right to update these terms at any time with notice provided via email.</p>
            </section>

            {/* Section 2 — Demo Class Policy */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">2. Demo Class Policy</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <p className="font-semibold text-red-800 text-sm">⚠️ Important: Demo Cancellation Charge</p>
                <p className="mt-1 text-red-700 text-sm leading-relaxed">
                  Demo classes are provided <strong>free of charge</strong>. However, if you cancel a scheduled demo class for any reason — <strong>regardless of when you cancel (before or after the scheduled time)</strong> — a cancellation charge of <strong>₹350</strong> will be levied. This charge is non-negotiable and non-refundable.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                <li>You are entitled to one free demo class per tutor.</li>
                <li>The demo class is scheduled by you (the parent) after the tutor confirms availability.</li>
                <li>After the demo, both you and the tutor will be asked if you wish to continue. Only if both agree will an ongoing class be confirmed.</li>
                <li>EduNest will not be held responsible if the tutor is not a good fit — the demo is specifically designed to help you evaluate the tutor before committing.</li>
              </ul>
            </section>

            {/* Section 3 — Payment Terms */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">3. Payment Terms</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                <li>Tuition fees are to be paid monthly to EduNest via UPI (UPI ID: <strong>8618635627@yescred</strong>).</li>
                <li>Payment must be made within 5 days of receiving the session sheet from the tutor.</li>
                <li>EduNest will process the payment to the tutor after verifying your payment.</li>
                <li>Do not pay the tutor directly — all payments must go through EduNest.</li>
                <li>Late payments may result in suspension of tuition sessions until the dues are cleared.</li>
                <li>No refunds will be issued once a session has been conducted.</li>
              </ul>
            </section>

            {/* Section 4 — Parent Conduct Guidelines */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">4. Parent Conduct Guidelines</h3>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-2 text-green-800">✅ What To Do</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Ensure a quiet, distraction-free environment for your child's tuition sessions.</li>
                    <li>Be available or have a responsible adult present during home tuition sessions.</li>
                    <li>Communicate your child's academic needs and challenges clearly to the tutor.</li>
                    <li>Provide timely feedback to EduNest if you have concerns about the tutor.</li>
                    <li>Respect the tutor's scheduled time — be ready at the agreed time.</li>
                    <li>Pay fees on time to ensure uninterrupted tuition for your child.</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-2 text-red-800">❌ What NOT To Do</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Do not negotiate fees directly with the tutor — all fee discussions must go through EduNest.</li>
                    <li>Do not ask the tutor to conduct classes outside the EduNest platform.</li>
                    <li>Do not share the tutor's personal contact details with others without their consent.</li>
                    <li>Do not make unreasonable demands on the tutor's time outside scheduled sessions.</li>
                    <li>Do not use abusive or disrespectful language with the tutor.</li>
                    <li>Do not cancel demo classes without understanding that a ₹350 cancellation charge applies.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 — Privacy */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">5. Privacy &amp; Data</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                <li>Your personal information (address, phone, student details) will only be shared with the matched tutor after a confirmed demo is scheduled.</li>
                <li>EduNest will not sell or share your data with third parties.</li>
                <li>You may request deletion of your account and data by contacting <strong>learn.at.edunest@gmail.com</strong>.</li>
              </ul>
            </section>

            {/* Section 6 — Cancellation of Ongoing Classes */}
            <section>
              <h3 className="font-bold text-base text-orange-600 mb-2 pb-1 border-b border-orange-100">6. Cancellation of Ongoing Classes</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                <li>If you wish to cancel an ongoing class, you must submit a cancellation request through the EduNest platform.</li>
                <li>Cancellation requests are subject to EduNest admin review and approval.</li>
                <li>Once a class is cancelled by admin, you are free to find a new tutor on the platform.</li>
                <li>Any pending fees for sessions already conducted must be paid before cancellation is processed.</li>
              </ul>
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
