import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ServiceLevelAgreement() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Service Level Agreement</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Version:</strong> 1.0</p>
              <p><strong>Effective date:</strong> November 26, 2025</p>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This Service Level Agreement ("SLA") is part of the Terms of Service between Axolop ("Provider", "we", "us")
                and the Customer ("you") and describes our commitment to service availability and performance.
              </p>
              <p>
                This SLA applies to paid subscription plans only. Free tier accounts are not covered by this SLA.
              </p>
            </div>
          </section>

          {/* Service Availability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Availability Commitment</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">2.1 Uptime Commitment</h3>
              <p>
                Axolop commits to maintaining the following uptime percentages for paid plans:
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-b">Plan</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Monthly Uptime</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Max Downtime/Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3">Starter</td>
                      <td className="px-4 py-3">99.5%</td>
                      <td className="px-4 py-3">~3.6 hours</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3">Professional</td>
                      <td className="px-4 py-3">99.9%</td>
                      <td className="px-4 py-3">~43 minutes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Business</td>
                      <td className="px-4 py-3">99.95%</td>
                      <td className="px-4 py-3">~22 minutes</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3">Enterprise</td>
                      <td className="px-4 py-3">99.99%</td>
                      <td className="px-4 py-3">~4.3 minutes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">2.2 Uptime Calculation</h3>
              <p>
                Monthly Uptime Percentage is calculated as:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mt-2">
                ((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) × 100
              </div>
            </div>
          </section>

          {/* Service Credits */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Credits</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If we fail to meet our uptime commitment, eligible customers may receive service credits as follows:
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-b">Monthly Uptime</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Service Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3">&lt; Committed % but ≥ 99.0%</td>
                      <td className="px-4 py-3">10% of monthly fee</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3">&lt; 99.0% but ≥ 95.0%</td>
                      <td className="px-4 py-3">25% of monthly fee</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">&lt; 95.0% but ≥ 90.0%</td>
                      <td className="px-4 py-3">50% of monthly fee</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3">&lt; 90.0%</td>
                      <td className="px-4 py-3">100% of monthly fee</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">3.1 Credit Request Process</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Credits must be requested within 30 days of the incident</li>
                <li>Submit requests to <a href="mailto:support@axolop.com" className="text-[#3F0D28] hover:underline">support@axolop.com</a></li>
                <li>Include your account ID and description of the downtime</li>
                <li>Credits are applied to future invoices (not cash refunds)</li>
                <li>Maximum credit per month: 100% of that month's fees</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">3.2 Credit Limitations</h3>
              <p>Service credits are your sole and exclusive remedy for downtime.</p>
            </div>
          </section>

          {/* Exclusions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Exclusions</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The following are not counted as downtime for SLA purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Scheduled Maintenance:</strong> Pre-announced maintenance windows (minimum 48 hours notice)</li>
                <li><strong>Emergency Maintenance:</strong> Critical security patches or urgent fixes</li>
                <li><strong>Force Majeure:</strong> Events beyond our reasonable control (natural disasters, war, government actions)</li>
                <li><strong>Third-Party Issues:</strong> Failures of third-party services, internet connectivity, or DNS</li>
                <li><strong>Customer Actions:</strong> Downtime caused by customer's actions, code, or configurations</li>
                <li><strong>Beta Features:</strong> Features explicitly marked as beta or experimental</li>
                <li><strong>API Abuse:</strong> Excessive API calls exceeding rate limits</li>
                <li><strong>Suspension:</strong> Service suspended due to Terms of Service violations</li>
                <li><strong>Free Accounts:</strong> Free tier accounts are not covered by this SLA</li>
              </ul>
            </div>
          </section>

          {/* Maintenance Windows */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Maintenance Windows</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">5.1 Scheduled Maintenance</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Standard maintenance window: Sundays 2:00 AM - 6:00 AM UTC</li>
                <li>Notification: At least 48 hours in advance via email and status page</li>
                <li>Most maintenance is performed with zero downtime</li>
                <li>Maintenance requiring downtime will be minimized and communicated</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">5.2 Emergency Maintenance</h3>
              <p>
                Emergency maintenance for critical security issues or system stability may be performed with
                shorter or no notice. We will communicate via status page and email as soon as possible.
              </p>
            </div>
          </section>

          {/* Support Response Times */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Support Response Times</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-b">Severity</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Description</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Initial Response</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Update Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3 font-semibold text-red-600">Critical (P1)</td>
                      <td className="px-4 py-3">Service completely unavailable or major feature broken</td>
                      <td className="px-4 py-3">1 hour</td>
                      <td className="px-4 py-3">Every 30 minutes</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-orange-600">High (P2)</td>
                      <td className="px-4 py-3">Significant feature impaired, workaround available</td>
                      <td className="px-4 py-3">4 hours</td>
                      <td className="px-4 py-3">Every 4 hours</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 font-semibold text-yellow-600">Medium (P3)</td>
                      <td className="px-4 py-3">Minor feature issue, limited impact</td>
                      <td className="px-4 py-3">1 business day</td>
                      <td className="px-4 py-3">Every 24 hours</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-[#3F0D28]">Low (P4)</td>
                      <td className="px-4 py-3">General questions, feature requests</td>
                      <td className="px-4 py-3">2 business days</td>
                      <td className="px-4 py-3">As needed</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                * Business hours: Monday-Friday, 9:00 AM - 6:00 PM EST (excluding US holidays)
              </p>
              <p className="text-sm text-gray-600">
                * Enterprise plans include 24/7 support for P1 and P2 issues
              </p>
            </div>
          </section>

          {/* Performance Standards */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Performance Standards</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>We target the following performance metrics:</p>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-b">Metric</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3">API Response Time (95th percentile)</td>
                      <td className="px-4 py-3">&lt; 500ms</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3">Page Load Time (95th percentile)</td>
                      <td className="px-4 py-3">&lt; 3 seconds</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Email Delivery (to gateway)</td>
                      <td className="px-4 py-3">&lt; 30 seconds</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3">Form Submission Processing</td>
                      <td className="px-4 py-3">&lt; 2 seconds</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Data Backup Frequency</td>
                      <td className="px-4 py-3">Every 24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Note: These are targets, not guarantees. Performance may vary based on factors including
                your internet connection, browser, and geographic location.
              </p>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Protection and Recovery</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">8.1 Backup Schedule</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Full database backups: Daily</li>
                <li>Incremental backups: Every 6 hours</li>
                <li>Transaction log backups: Continuous</li>
                <li>Backup retention: 30 days (90 days for Enterprise)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">8.2 Recovery Objectives</h3>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-b">Metric</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Standard</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3">Recovery Time Objective (RTO)</td>
                      <td className="px-4 py-3">4 hours</td>
                      <td className="px-4 py-3">1 hour</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3">Recovery Point Objective (RPO)</td>
                      <td className="px-4 py-3">24 hours</td>
                      <td className="px-4 py-3">1 hour</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Security Commitments */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Security Commitments</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.2+ in transit</li>
                <li><strong>Access Control:</strong> Role-based access control (RBAC)</li>
                <li><strong>Monitoring:</strong> 24/7 infrastructure monitoring</li>
                <li><strong>Vulnerability Scanning:</strong> Weekly automated scans</li>
                <li><strong>Penetration Testing:</strong> Annual third-party assessment</li>
                <li><strong>Incident Response:</strong> Documented incident response plan</li>
              </ul>
            </div>
          </section>

          {/* Status Page */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Status and Communication</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Current service status is available at our status page. During incidents, we provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Real-time status updates</li>
                <li>Incident timeline and impact assessment</li>
                <li>Estimated time to resolution</li>
                <li>Post-incident reports for major outages</li>
              </ul>
              <p className="mt-4">
                Subscribe to status updates via email at{' '}
                <Link to="/status" className="text-[#3F0D28] hover:underline">axolop.com/status</Link>
              </p>
            </div>
          </section>

          {/* SLA Modifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. SLA Modifications</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may modify this SLA with 30 days' notice. Changes will not reduce service levels for
                active subscription periods. The current SLA version is always available on our website.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>For SLA-related inquiries or credit requests:</p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p><strong>Email:</strong> <a href="mailto:support@axolop.com" className="text-[#3F0D28] hover:underline">support@axolop.com</a></p>
                <p><strong>Subject Line:</strong> SLA Credit Request - [Account ID]</p>
              </div>
            </div>
          </section>

          {/* Related Documents */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Documents</h2>
            <div className="space-y-2 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><Link to="/terms" className="text-[#3F0D28] hover:underline">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="text-[#3F0D28] hover:underline">Privacy Policy</Link></li>
                <li><Link to="/dpa" className="text-[#3F0D28] hover:underline">Data Processing Agreement</Link></li>
                <li><Link to="/security" className="text-[#3F0D28] hover:underline">Security Practices</Link></li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
