/**
 * EduNest Terms & Conditions Page
 * Adapted from Otoo Tuitions T&C with EduNest-specific clauses
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.005 80)", fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <section className="py-16 text-white" style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 50) 0%, oklch(0.68 0.18 50) 100%)" }}>
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Terms &amp; Conditions</h1>
          <p className="text-orange-100 text-lg">Last updated: July 2025 &nbsp;|&nbsp; EduNest Tuitions, Bengaluru</p>
        </div>
      </section>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12 space-y-10" style={{ borderColor: "oklch(0.92 0.005 80)" }}>

          {/* Intro */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions (<strong>"Terms"</strong>) govern the use of services made available on or through{" "}
              <strong>edu-nest.manus.space</strong> (the <strong>"Platform"</strong>). These Terms also include our Privacy Policy and any
              guidelines, additional, or supplemental terms issued by us from time to time. By registering on the Platform, you confirm
              that you have read, understood, and agree to be bound by these Terms.
            </p>
          </section>

          {/* 1. Ownership */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>1. Ownership</h2>
            <p className="text-gray-700 leading-relaxed">
              EduNest Tuitions is owned and operated by <strong>Amogha Amange</strong>, with its principal place of business in
              Bengaluru, Karnataka, India. The Platform is engaged in the business of providing education consultancy and home tuition
              matching services and is the sole author and publisher of the internet resource <strong>edu-nest.manus.space</strong>.
            </p>
          </section>

          {/* 2. Service */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>2. Service Description</h2>
            <p className="text-gray-700 leading-relaxed">
              EduNest is a platform that connects qualified tutors with students and parents for home and online tuition in Bengaluru.
              When a student needs educational assistance, EduNest helps them find a suitable tutor, and vice versa. EduNest acts solely
              as a <strong>connecting platform</strong> and does not hold any responsibility for any mishap that may happen between
              either party. Anything unrelated to our matching and scheduling services will not be entertained by the company or its
              associates.
            </p>
          </section>

          {/* 3. Account Creation */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>3. Account Creation</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>To avail of the Services, you must create an account on the Platform. You must be at least 18 years of age.</li>
              <li>You warrant that all information furnished in connection with your Account is and shall remain accurate and true.</li>
              <li>You agree to promptly update your details in the event of any change.</li>
              <li>You are solely responsible for maintaining the security and confidentiality of your Account.</li>
              <li>You are liable and accountable for all activities that take place through your Account.</li>
              <li>You agree to receive communications from us regarding payments, platform updates, promotional offers, and other matters related to the Services.</li>
            </ul>
          </section>

          {/* 4. Fee & Payment Policy */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>4. Fee &amp; Payment Policy</h2>

            <h3 className="text-base font-bold mb-2 text-orange-600">For Tutors</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                <strong>First Month Deduction:</strong> EduNest will deduct <strong>40% of the agreed tuition fee</strong> for the first
                month as a platform service charge. This covers the cost of student matching, demo scheduling, and administrative support.
              </li>
              <li>
                <strong>From the Second Month Onwards:</strong> No deductions will be made. The full tuition fee agreed between the tutor
                and parent will be paid directly to the tutor's registered UPI ID without any platform deduction.
              </li>
              <li>
                Tutors must provide a valid UPI ID during registration. EduNest will transfer fees to this UPI ID after admin approval.
              </li>
              <li>
                Tutors must upload a completed session sheet at the end of each billing cycle to trigger the payment process.
              </li>
              <li>
                EduNest reserves the right to withhold payment if the session sheet is not uploaded or if there are unresolved disputes.
              </li>
            </ul>

            <h3 className="text-base font-bold mb-2 text-orange-600">For Parents / Students</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Free Demo Class:</strong> EduNest provides one free demo class per tutor-student match. The demo class is
                completely free of charge if the parent/student proceeds with the tutor after the demo.
              </li>
              <li>
                <strong>Demo Cancellation Fee:</strong> If the parent cancels a scheduled demo class without providing at least 24 hours'
                notice, a <strong>cancellation fee of ₹350</strong> will be charged. This fee is non-refundable and will be collected
                before any further demo bookings are permitted.
              </li>
              <li>
                Payments for tuition fees must be made to EduNest's UPI ID as displayed on the platform. Direct payments to tutors
                bypassing the EduNest platform are strictly prohibited during the first month.
              </li>
              <li>
                All payments are subject to admin review and approval before being released to the tutor.
              </li>
            </ul>
          </section>

          {/* 5. Tutor Conduct Guidelines */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>5. Tutor Conduct Guidelines</h2>
            <p className="text-gray-600 mb-4 text-sm italic">
              As a representative of EduNest, tutors are expected to maintain the highest standards of professionalism. Please read
              these guidelines carefully before your first class.
            </p>

            <h3 className="text-base font-bold mb-2 text-green-700">✅ What Tutors Must Do</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>Dress professionally:</strong> Wear neat, clean, and formal or semi-formal attire. Avoid casual wear such as shorts, sleeveless tops, or torn clothing. First impressions matter — dress as you would for a job interview.</li>
              <li><strong>Arrive on time:</strong> Be punctual for every class. Inform the parent/student at least 1 hour in advance if you are running late or need to reschedule.</li>
              <li><strong>Be prepared:</strong> Come with a lesson plan, relevant study materials, and a clear understanding of the student's syllabus and current level.</li>
              <li><strong>Communicate professionally:</strong> Use respectful, clear language at all times. Maintain a positive and encouraging tone with students.</li>
              <li><strong>Maintain boundaries:</strong> Keep all interactions strictly professional. Do not share personal social media handles or personal contact numbers with students or parents outside the platform.</li>
              <li><strong>Report issues promptly:</strong> If you face any problems — unsafe environment, harassment, or misconduct — report it to EduNest at <strong>learn.at.edunest@gmail.com</strong> within 48 hours.</li>
              <li><strong>Upload session sheets:</strong> Upload the completed session sheet at the end of each billing cycle to ensure timely payment processing.</li>
              <li><strong>Provide feedback:</strong> Give honest, constructive monthly feedback on the student's progress to the parent through the EduNest platform.</li>
            </ul>

            <h3 className="text-base font-bold mb-2 text-red-600">❌ What Tutors Must NOT Do</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Do not bypass EduNest:</strong> Never make private financial arrangements with parents outside the platform during the first month. This is a violation of these Terms and will result in immediate termination.</li>
              <li><strong>Do not cancel without notice:</strong> Do not cancel classes at the last minute without a valid reason. Repeated cancellations may result in suspension from the platform.</li>
              <li><strong>Do not share student information:</strong> Student details (name, address, phone, academic records) are confidential. Do not share this information with any third party.</li>
              <li><strong>Do not engage in inappropriate behaviour:</strong> Any form of physical, verbal, or emotional misconduct towards students or parents will result in immediate removal from the platform and may be reported to authorities.</li>
              <li><strong>Do not use the platform for any purpose other than tutoring:</strong> Using student contact details for marketing, sales, or any non-tutoring purpose is strictly prohibited.</li>
              <li><strong>Do not misrepresent qualifications:</strong> Providing false information about your educational qualifications, experience, or certifications is a serious violation and grounds for immediate account termination.</li>
            </ul>
          </section>

          {/* 6. Parent / Student Conduct Guidelines */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>6. Parent &amp; Student Conduct Guidelines</h2>
            <p className="text-gray-600 mb-4 text-sm italic">
              EduNest is committed to creating a safe and respectful environment for all tutors. Parents and students are expected to
              uphold the following standards.
            </p>

            <h3 className="text-base font-bold mb-2 text-green-700">✅ What Parents / Students Must Do</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>Provide a safe, clean environment:</strong> Ensure the tutoring space is clean, well-lit, and appropriate. For home tuition, a dedicated study area is strongly recommended.</li>
              <li><strong>Be punctual:</strong> Ensure the student is ready at the scheduled class time. Inform the tutor at least 1 hour in advance if you need to reschedule.</li>
              <li><strong>Treat tutors with respect:</strong> Tutors are professionals. Treat them with courtesy and respect at all times. Rude, dismissive, or disrespectful behaviour will not be tolerated.</li>
              <li><strong>Pay on time:</strong> Process payments through the EduNest platform promptly at the end of each billing cycle. Delayed payments may result in the tutor discontinuing classes.</li>
              <li><strong>Provide honest feedback:</strong> Share constructive feedback about the tutor's performance through the EduNest platform so we can maintain quality standards.</li>
              <li><strong>Report concerns promptly:</strong> If you have any concerns about the tutor's conduct, report them to EduNest at <strong>learn.at.edunest@gmail.com</strong> within 48 hours.</li>
            </ul>

            <h3 className="text-base font-bold mb-2 text-red-600">❌ What Parents / Students Must NOT Do</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Do not bypass EduNest:</strong> Do not make direct payment arrangements with tutors outside the platform during the first month. This violates these Terms and may result in account suspension.</li>
              <li><strong>Do not cancel demos without notice:</strong> Cancelling a scheduled demo class without at least 24 hours' notice will incur a ₹350 cancellation fee.</li>
              <li><strong>Do not harass or abuse tutors:</strong> Any form of harassment, abuse, or inappropriate behaviour towards tutors will result in immediate account suspension and may be reported to authorities.</li>
              <li><strong>Do not share tutor information:</strong> Tutor contact details and personal information shared through the platform are confidential. Do not share this with third parties.</li>
              <li><strong>Do not engage tutors for non-academic purposes:</strong> Tutors are engaged solely for academic tutoring. Requesting tutors to perform tasks outside the scope of tutoring is strictly prohibited.</li>
              <li><strong>Do not discriminate:</strong> EduNest prohibits discrimination against tutors based on race, religion, caste, national origin, disability, sexual orientation, sex, marital status, gender identity, or age.</li>
            </ul>
          </section>

          {/* 7. Bypass Clause */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>7. Platform Bypass Prohibition</h2>
            <p className="text-gray-700 leading-relaxed">
              In any circumstances, if a tutor, parent, or student bypasses EduNest and its guidelines and makes a deal, pact,
              agreement, or any kind of financial arrangement without official information to the company, then EduNest is not liable
              and responsible for any situation that arises. The company will not provide any legal help or assistance in such cases.
              Both parties will be removed from the platform immediately upon discovery of such bypass.
            </p>
          </section>

          {/* 8. Data & Privacy */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>8. Data Collection &amp; Privacy</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>You agree that EduNest may collect and use your personal data in accordance with our Privacy Policy.</li>
              <li>Information may be shared with affiliates or third-party service providers as necessary to provide the Services.</li>
              <li>EduNest may use cookies to remember your choices and data field contents.</li>
              <li>EduNest may be directed by law enforcement agencies or the government to disclose data about you in connection with criminal or civil proceedings.</li>
              <li>Your location data (GPS coordinates) is used solely for the purpose of matching you with nearby tutors or students and is not shared with any third party for commercial purposes.</li>
            </ul>
          </section>

          {/* 9. Prohibited Activities */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>9. Prohibited Activities</h2>
            <p className="text-gray-700 mb-3">No user shall perform any of the following while using the Platform:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Making available any content that is misleading, unlawful, harmful, threatening, abusive, defamatory, vulgar, obscene, or otherwise objectionable.</li>
              <li>Stalking, intimidating, and/or harassing another user or inciting another to commit violence.</li>
              <li>Transmitting material that encourages anyone to commit a criminal offence or that results in civil liability.</li>
              <li>Interfering with any other person's use or enjoyment of the Platform.</li>
              <li>Impersonating any person or entity, or falsely stating your affiliation with a person or entity.</li>
              <li>Infringing any proprietary rights, including copyrights, patents, trademarks, or trade secrets.</li>
              <li>Transmitting data containing viruses, Trojan horses, worms, spyware, adware, or any other harmful programs.</li>
              <li>Using any robot, spider, or other automated device to monitor or copy the Platform.</li>
              <li>Using the Services in any unlawful manner or for fraudulent or malicious activities.</li>
              <li>Decompiling, reverse engineering, or disassembling the Platform.</li>
            </ul>
          </section>

          {/* 10. Intellectual Property */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>10. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              You may not make any content originating from EduNest available for public access by any means without obtaining prior
              written permission from EduNest. You may not modify, reproduce, distribute, create derivative works of, publicly display,
              or in any way exploit any of the content, software, and materials available on the Platform. If found guilty of
              intellectual property violation, legal actions shall be taken.
            </p>
          </section>

          {/* 11. Disclaimer */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>11. Disclaimer &amp; Limitation of Liability</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>EduNest makes every effort to offer current, correct, and clearly expressed information. Nevertheless, inadvertent errors may occur.</li>
              <li>EduNest disclaims any responsibility for errors and accuracy of information on the Platform.</li>
              <li>No warranty or guarantee is provided as to the accuracy, timeliness, performance, completeness, or suitability of information for any particular purpose.</li>
              <li>EduNest excludes liability for any inaccuracies or errors to the fullest extent permitted by law.</li>
              <li>If you enter into correspondence or commercial transactions with third parties in connection with your use of EduNest, such activity is solely between you and the applicable third party. EduNest shall have no liability for any such activity.</li>
              <li>EduNest does not hold any responsibility for any mishap that may happen between a tutor and parent/student. EduNest is a connecting platform only.</li>
            </ul>
          </section>

          {/* 12. Termination */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>12. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              EduNest reserves the right to suspend or terminate your account at any time, with or without notice, for conduct that
              violates these Terms or is harmful to other users, EduNest, or third parties, or for any other reason at EduNest's sole
              discretion. Upon termination, your right to use the Platform will immediately cease.
            </p>
          </section>

          {/* 13. Governing Law */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>13. Governing Law &amp; Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in
              connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.
              If any provision of these Terms is held invalid by any law or regulation of any government, or by any court or arbitrator,
              the parties agree that such provision will be replaced with a new provision that accomplishes the original business
              purpose, and the other provisions of the Terms will remain in full force and effect.
            </p>
          </section>

          {/* 14. Contact */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: "oklch(0.14 0.02 270)" }}>14. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions, concerns, or reports regarding these Terms, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="font-semibold text-gray-800">EduNest Tuitions</p>
              <p className="text-gray-600">Bengaluru, Karnataka, India</p>
              <p className="text-gray-600">Email: <a href="mailto:learn.at.edunest@gmail.com" className="text-orange-600 hover:underline">learn.at.edunest@gmail.com</a></p>
              <p className="text-gray-600">Phone: <a href="tel:+918618635627" className="text-orange-600 hover:underline">+91-8618635627</a></p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
