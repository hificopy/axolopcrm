import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DataProcessingAgreement() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="text-[#3F0D28] hover:underline text-sm mb-4 inline-block">&larr; Back to Home</Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Processing Agreement</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Version:</strong> 2.0</p>
              <p><strong>Effective date:</strong> November 26, 2025</p>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This Data Processing Agreement ("DPA") forms part of the Terms of Service or other written or electronic
                agreement between Axolop ("Processor", "we", "us") and the Customer ("Controller", "you") for the
                provision of Axolop's services (the "Agreement").
              </p>
              <p>
                This DPA reflects the parties' agreement with regard to the Processing of Personal Data in accordance
                with the requirements of Data Protection Laws, including the EU General Data Protection Regulation
                ("GDPR"), the UK GDPR, the California Consumer Privacy Act as amended by the California Privacy Rights
                Act ("CCPA/CPRA"), and other applicable privacy laws.
              </p>
            </div>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>"Controller"</strong> means the entity that determines the purposes and means of Processing Personal Data.</p>
              <p><strong>"Data Protection Laws"</strong> means all applicable laws relating to data protection and privacy, including GDPR, UK GDPR, CCPA/CPRA, and other relevant legislation.</p>
              <p><strong>"Data Subject"</strong> means the identified or identifiable natural person to whom Personal Data relates.</p>
              <p><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</p>
              <p><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.</p>
              <p><strong>"Processor"</strong> means the entity that Processes Personal Data on behalf of the Controller.</p>
              <p><strong>"Sub-processor"</strong> means any third party engaged by Processor to Process Personal Data.</p>
              <p><strong>"Standard Contractual Clauses" or "SCCs"</strong> means the contractual clauses approved by the European Commission for international data transfers.</p>
            </div>
          </section>

          {/* Scope and Roles */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Scope and Roles</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">3.1 Relationship of the Parties</h3>
              <p>
                When Processing Personal Data in connection with the Services, the parties acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Customer is the Controller of Customer Personal Data</li>
                <li>Axolop is the Processor acting on behalf of Customer</li>
                <li>Customer's use of the Services determines the purposes and means of Processing</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">3.2 Customer Obligations</h3>
              <p>Customer represents and warrants that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>It has obtained all necessary consents and authorizations to provide Personal Data to Axolop</li>
                <li>Its instructions to Axolop comply with all applicable Data Protection Laws</li>
                <li>It has provided appropriate privacy notices to Data Subjects</li>
                <li>It has a lawful basis for Processing under applicable law</li>
              </ul>
            </div>
          </section>

          {/* Details of Processing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Details of Processing</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 font-semibold w-1/3">Subject Matter</td>
                      <td className="py-3">Provision of CRM, marketing automation, form building, and related services</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-semibold">Duration</td>
                      <td className="py-3">For the term of the Agreement plus data retention period</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-semibold">Nature and Purpose</td>
                      <td className="py-3">Storage, organization, retrieval, consultation, use, and erasure of Personal Data to provide the Services</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-semibold">Categories of Data Subjects</td>
                      <td className="py-3">Customer's contacts, leads, prospects, customers, and end users who interact with Customer's forms or communications</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Types of Personal Data</td>
                      <td className="py-3">Names, email addresses, phone numbers, addresses, form responses, communication history, and other data Customer chooses to store</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Processor Obligations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Processor Obligations</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Axolop shall:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process Personal Data only on documented instructions from Customer, unless required by law</li>
                <li>Ensure that persons authorized to Process Personal Data are bound by confidentiality obligations</li>
                <li>Implement appropriate technical and organizational security measures</li>
                <li>Respect the conditions for engaging Sub-processors</li>
                <li>Assist Customer in responding to Data Subject requests</li>
                <li>Assist Customer in ensuring compliance with security, breach notification, and impact assessment obligations</li>
                <li>Delete or return Personal Data at the end of the Agreement, at Customer's choice</li>
                <li>Make available information necessary to demonstrate compliance and allow for audits</li>
              </ul>
            </div>
          </section>

          {/* Security Measures */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Security Measures</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop implements and maintains appropriate technical and organizational measures to protect Personal Data, including:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">6.1 Technical Measures</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of Personal Data at rest (AES-256) and in transit (TLS 1.2+)</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security testing and vulnerability assessments</li>
                <li>Intrusion detection and prevention systems</li>
                <li>Regular backups and disaster recovery procedures</li>
                <li>Secure development practices</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">6.2 Organizational Measures</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Security awareness training for personnel</li>
                <li>Background checks for personnel with access to Personal Data</li>
                <li>Access limited to personnel who need it for their job functions</li>
                <li>Incident response procedures</li>
                <li>Business continuity and disaster recovery plans</li>
              </ul>
            </div>
          </section>

          {/* Sub-processors */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sub-processors</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">7.1 Authorization</h3>
              <p>
                Customer provides general authorization for Axolop to engage Sub-processors to Process Personal Data.
                Axolop maintains a list of current Sub-processors in its Privacy Policy.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">7.2 Sub-processor Changes</h3>
              <p>
                Axolop will notify Customer of any intended changes to Sub-processors at least 30 days before the change.
                Customer may object to the change within 14 days of notification by providing written notice with
                reasonable grounds for objection.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">7.3 Sub-processor Agreements</h3>
              <p>
                Axolop will enter into written agreements with all Sub-processors that impose data protection
                obligations no less protective than those in this DPA.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">7.4 Current Sub-processors</h3>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold border-b">Sub-processor</th>
                      <th className="px-4 py-2 text-left font-semibold border-b">Location</th>
                      <th className="px-4 py-2 text-left font-semibold border-b">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">Supabase Inc.</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Database hosting and authentication</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Twilio Inc.</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Email delivery (SendGrid), SMS, Voice</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Stripe Inc.</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Payment processing</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Google LLC</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Calendar integration, analytics</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">OpenAI Inc.</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">AI features and processing</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Vercel Inc.</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Website hosting and CDN</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Redis Labs</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Caching and session management</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Data Subject Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Subject Rights</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop will assist Customer in fulfilling its obligations to respond to Data Subject requests, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right of access to Personal Data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restriction of Processing</li>
                <li>Right to data portability</li>
                <li>Right to object to Processing</li>
                <li>Rights related to automated decision-making</li>
              </ul>
              <p className="mt-4">
                If Axolop receives a request directly from a Data Subject, Axolop will promptly notify Customer
                unless prohibited by law.
              </p>
            </div>
          </section>

          {/* Data Breach Notification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Breach Notification</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop will notify Customer without undue delay (and in any event within 72 hours) upon becoming
                aware of a Personal Data breach affecting Customer's data. The notification will include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Description of the nature of the breach</li>
                <li>Categories and approximate number of Data Subjects affected</li>
                <li>Categories and approximate number of records affected</li>
                <li>Likely consequences of the breach</li>
                <li>Measures taken or proposed to address the breach</li>
                <li>Contact point for more information</li>
              </ul>
            </div>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Personal Data may be transferred to and processed in countries outside the European Economic Area (EEA),
                United Kingdom, or Switzerland. When such transfers occur, Axolop ensures appropriate safeguards are in place:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">10.1 Transfer Mechanisms</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Standard Contractual Clauses:</strong> We use the EU Commission-approved SCCs for transfers to third countries</li>
                <li><strong>UK Addendum:</strong> For UK data transfers, we include the UK International Data Transfer Addendum</li>
                <li><strong>Adequacy Decisions:</strong> Where applicable, we rely on adequacy decisions</li>
                <li><strong>Supplementary Measures:</strong> We implement additional technical and organizational measures as needed</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">10.2 Government Access Requests</h3>
              <p>
                If Axolop receives a legally binding request from a government authority for access to Customer's Personal Data,
                Axolop will (unless prohibited by law):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Promptly notify Customer of the request</li>
                <li>Challenge the request if there are grounds to do so</li>
                <li>Provide only the minimum data legally required</li>
              </ul>
            </div>
          </section>

          {/* Audits */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Audits and Compliance</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop will make available to Customer information necessary to demonstrate compliance with this DPA and
                allow for and contribute to audits and inspections.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">11.1 Audit Reports</h3>
              <p>
                Upon request, Axolop will provide Customer with copies of relevant audit reports, certifications,
                and security assessments, subject to confidentiality obligations.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">11.2 On-Site Audits</h3>
              <p>
                Customer may conduct on-site audits with at least 30 days' prior written notice, during normal business hours,
                and subject to confidentiality obligations. Customer shall bear its own costs for such audits.
              </p>
            </div>
          </section>

          {/* Term and Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Term and Termination</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This DPA is effective from the date Customer accepts the Agreement and continues until the Agreement
                terminates or expires.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">12.1 Data Return or Deletion</h3>
              <p>
                Upon termination of the Agreement, Axolop will, at Customer's election:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Return all Personal Data to Customer in a commonly used format; or</li>
                <li>Delete all Personal Data within 90 days</li>
              </ul>
              <p className="mt-4">
                Axolop may retain Personal Data to the extent required by applicable law, in which case Axolop will
                continue to protect such data in accordance with this DPA.
              </p>
            </div>
          </section>

          {/* CCPA Addendum */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. California Consumer Privacy Act Addendum</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                For Personal Data subject to the CCPA/CPRA, the following additional terms apply:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Axolop is a "Service Provider" as defined in the CCPA</li>
                <li>Axolop will not sell or share Personal Data</li>
                <li>Axolop will not retain, use, or disclose Personal Data for any purpose other than providing the Services</li>
                <li>Axolop will not retain, use, or disclose Personal Data outside the direct business relationship with Customer</li>
                <li>Axolop certifies it understands and will comply with these restrictions</li>
                <li>Axolop will notify Customer if it determines it can no longer meet its obligations under the CCPA</li>
              </ul>
            </div>
          </section>

          {/* Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Liability</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Each party's liability under this DPA is subject to the limitations of liability set forth in the Agreement.
                Nothing in this DPA limits either party's liability for fraud, gross negligence, or willful misconduct.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>For questions about this DPA or data protection matters:</p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p><strong>Axolop Data Protection</strong></p>
                <p>Email: <a href="mailto:privacy@axolop.com" className="text-[#3F0D28] hover:underline">privacy@axolop.com</a></p>
                <p>General inquiries: <a href="mailto:hello@axolop.com" className="text-[#3F0D28] hover:underline">hello@axolop.com</a></p>
              </div>
            </div>
          </section>

          {/* Related Documents */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Documents</h2>
            <div className="space-y-2 text-gray-700">
              <p>This DPA should be read together with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><Link to="/terms" className="text-[#3F0D28] hover:underline">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="text-[#3F0D28] hover:underline">Privacy Policy</Link></li>
                <li><Link to="/sla" className="text-[#3F0D28] hover:underline">Service Level Agreement</Link></li>
                <li><Link to="/cookies" className="text-[#3F0D28] hover:underline">Cookie Policy</Link></li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
