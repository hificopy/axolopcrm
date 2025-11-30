import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function GDPRPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="text-[#3F0D28] hover:underline text-sm mb-4 inline-block"
            >
              &larr; Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              GDPR Compliance
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Revised:</strong> November 26, 2025
              </p>
              <p>
                <strong>Effective date:</strong> November 26, 2025
              </p>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Commitment to GDPR
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                At Axolop, we are committed to protecting the privacy and
                personal data of our users. We comply with the General Data
                Protection Regulation (GDPR), the comprehensive data protection
                law in the European Union.
              </p>
              <p>
                This page outlines how we handle personal data in accordance
                with GDPR requirements and explains your rights as a data
                subject.
              </p>
            </div>
          </section>

          {/* Data Controller */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Controller
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop acts as the Data Controller for the personal data we
                collect and process. This means we determine the purposes and
                means of processing personal data.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>
                  <strong>Data Controller:</strong> Axolop
                </p>
                <p>
                  <strong>Contact Email:</strong>{" "}
                  <a
                    href="mailto:hello@axolop.com"
                    className="text-[#3F0D28] hover:underline"
                  >
                    hello@axolop.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Legal Basis */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Legal Basis for Processing
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>We process personal data under the following legal bases:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Consent:</strong> When you have given explicit consent
                  for processing your data for specific purposes.
                </li>
                <li>
                  <strong>Contract:</strong> When processing is necessary to
                  fulfill a contract with you or to take steps at your request
                  before entering into a contract.
                </li>
                <li>
                  <strong>Legal Obligation:</strong> When processing is
                  necessary to comply with legal requirements.
                </li>
                <li>
                  <strong>Legitimate Interest:</strong> When we have a
                  legitimate business interest that does not override your
                  fundamental rights and freedoms.
                </li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Rights Under GDPR
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>As a data subject, you have the following rights:</p>

              <div className="space-y-4 mt-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Right to Access
                  </h3>
                  <p>
                    You have the right to request access to your personal data
                    and to receive a copy of the data we hold about you.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Right to Rectification
                  </h3>
                  <p>
                    You have the right to request correction of inaccurate
                    personal data or completion of incomplete data.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Right to Erasure ("Right to be Forgotten")
                  </h3>
                  <p>
                    You have the right to request deletion of your personal data
                    under certain circumstances.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Right to Restrict Processing
                  </h3>
                  <p>
                    You have the right to request that we restrict the
                    processing of your personal data.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Right to Data Portability
                  </h3>
                  <p>
                    You have the right to receive your personal data in a
                    structured, commonly used, machine-readable format.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Right to Object
                  </h3>
                  <p>
                    You have the right to object to the processing of your
                    personal data based on legitimate interests or for direct
                    marketing purposes.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Right to Withdraw Consent
                  </h3>
                  <p>
                    Where we rely on consent for processing, you have the right
                    to withdraw that consent at any time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Personal Data We Collect
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may collect and process the following categories of personal
                data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Identity Data:</strong> Name, username, title
                </li>
                <li>
                  <strong>Contact Data:</strong> Email address, phone number,
                  address
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type,
                  device information
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you use our
                  website and services
                </li>
                <li>
                  <strong>Marketing Data:</strong> Preferences for receiving
                  marketing communications
                </li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Retention
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We retain personal data only for as long as necessary to fulfill
                the purposes for which it was collected, including satisfying
                legal, accounting, or reporting requirements.
              </p>
              <p>
                When determining retention periods, we consider the amount,
                nature, and sensitivity of the data, the potential risk of harm
                from unauthorized use or disclosure, and applicable legal
                requirements.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              International Data Transfers
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Your personal data may be transferred to and processed in
                countries outside the European Economic Area (EEA). When we
                transfer data outside the EEA, we ensure appropriate safeguards
                are in place, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Standard Contractual Clauses approved by the European
                  Commission
                </li>
                <li>Transfers to countries with an adequacy decision</li>
                <li>Other legally recognized transfer mechanisms</li>
              </ul>
            </div>
          </section>

          {/* Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Security
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We have implemented appropriate technical and organizational
                measures to protect your personal data against unauthorized
                access, alteration, disclosure, or destruction. These measures
                include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </div>
          </section>

          {/* Exercising Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Exercise Your Rights
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                To exercise any of your GDPR rights, please contact us using the
                information below. We will respond to your request within 30
                days.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:hello@axolop.com"
                    className="text-[#3F0D28] hover:underline"
                  >
                    hello@axolop.com
                  </a>
                </p>
                <p className="mt-2">
                  Please include "GDPR Request" in your subject line and provide
                  sufficient information to verify your identity.
                </p>
              </div>
            </div>
          </section>

          {/* Complaints */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Right to Lodge a Complaint
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you believe that we have not complied with your data
                protection rights, you have the right to lodge a complaint with
                a supervisory authority. You may do so in the EU member state of
                your habitual residence, place of work, or the place of the
                alleged infringement.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Updates to This Policy
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may update this GDPR compliance page from time to time. Any
                changes will be posted on this page with an updated revision
                date.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700">
              If you have any questions about GDPR or our data protection
              practices, please contact us at:
              <br />
              <strong>Email:</strong>{" "}
              <a
                href="mailto:hello@axolop.com"
                className="text-[#3F0D28] hover:underline"
              >
                hello@axolop.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
