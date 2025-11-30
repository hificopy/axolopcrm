import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Server, Eye, FileCheck, Users, Globe, AlertTriangle } from 'lucide-react';

export default function SecurityPractices() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Back to Home</Link>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">Security Practices</h1>
            </div>
            <p className="text-gray-600">
              Learn about how we protect your data and maintain the security of our platform.
            </p>
            <div className="text-sm text-gray-600 mt-4">
              <p><strong>Last Updated:</strong> November 26, 2025</p>
            </div>
          </div>

          {/* Trust Badges */}
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-800">256-bit Encryption</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-800">99.9% Uptime</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <FileCheck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-purple-800">GDPR Compliant</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <Eye className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-orange-800">24/7 Monitoring</p>
              </div>
            </div>
          </section>

          {/* Our Commitment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Security Commitment</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                At Axolop, security is not an afterthought—it's foundational to everything we build. We understand
                that you trust us with sensitive business data, and we take that responsibility seriously.
              </p>
              <p>
                Our security program is designed to protect the confidentiality, integrity, and availability of
                your data while meeting industry best practices and compliance requirements.
              </p>
            </div>
          </section>

          {/* Data Encryption */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-gray-700" />
              Data Encryption
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Encryption at Rest</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All data stored in our databases is encrypted using AES-256 encryption</li>
                <li>Database backups are encrypted</li>
                <li>File uploads and attachments are encrypted</li>
                <li>Encryption keys are managed using industry-standard key management practices</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Encryption in Transit</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All connections use TLS 1.2 or higher</li>
                <li>HTTPS is enforced across all services</li>
                <li>We use HSTS (HTTP Strict Transport Security) to prevent downgrade attacks</li>
                <li>API communications are encrypted end-to-end</li>
              </ul>
            </div>
          </section>

          {/* Infrastructure Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="h-6 w-6 text-gray-700" />
              Infrastructure Security
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Cloud Infrastructure</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Hosted on enterprise-grade cloud providers with SOC 2 Type II certification</li>
                <li>Geographically distributed data centers for redundancy</li>
                <li>Virtual private clouds (VPC) with network isolation</li>
                <li>DDoS protection and mitigation</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Network Security</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Web Application Firewall (WAF) protection</li>
                <li>Intrusion detection and prevention systems</li>
                <li>Network segmentation between services</li>
                <li>Regular network security assessments</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Availability</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>99.9% uptime SLA for paid plans</li>
                <li>Automated failover and disaster recovery</li>
                <li>Daily backups with 30-day retention</li>
                <li>Real-time replication across availability zones</li>
              </ul>
            </div>
          </section>

          {/* Access Control */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-gray-700" />
              Access Control
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Authentication</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Secure password hashing using bcrypt</li>
                <li>Support for two-factor authentication (2FA)</li>
                <li>OAuth 2.0 integration for social login</li>
                <li>Session timeout and automatic logout</li>
                <li>Brute-force protection and account lockout</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Authorization</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Role-based access control (RBAC)</li>
                <li>Principle of least privilege for all access</li>
                <li>Granular permissions for team members</li>
                <li>Audit logging of access events</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Employee Access</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Background checks for all employees with data access</li>
                <li>Mandatory security training</li>
                <li>Multi-factor authentication required for all internal systems</li>
                <li>Access reviews conducted quarterly</li>
                <li>Immediate access revocation upon termination</li>
              </ul>
            </div>
          </section>

          {/* Application Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-gray-700" />
              Application Security
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Secure Development</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Security-focused code reviews</li>
                <li>Static application security testing (SAST)</li>
                <li>Dynamic application security testing (DAST)</li>
                <li>Dependency vulnerability scanning</li>
                <li>OWASP Top 10 protection</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Input Validation</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Server-side input validation for all user inputs</li>
                <li>SQL injection prevention through parameterized queries</li>
                <li>XSS (Cross-Site Scripting) protection</li>
                <li>CSRF (Cross-Site Request Forgery) protection</li>
                <li>Content Security Policy (CSP) headers</li>
              </ul>
            </div>
          </section>

          {/* Monitoring and Response */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-gray-700" />
              Monitoring and Incident Response
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Continuous Monitoring</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>24/7 infrastructure and application monitoring</li>
                <li>Real-time alerting for security events</li>
                <li>Automated threat detection</li>
                <li>Performance and availability monitoring</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Incident Response</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Documented incident response procedures</li>
                <li>Dedicated security incident response team</li>
                <li>Customer notification within 72 hours of confirmed breach</li>
                <li>Post-incident analysis and remediation</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Logging and Auditing</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Comprehensive audit logs for all system access</li>
                <li>Log retention for compliance purposes</li>
                <li>Tamper-evident logging</li>
                <li>Regular log review and analysis</li>
              </ul>
            </div>
          </section>

          {/* Compliance */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-gray-700" />
              Compliance and Certifications
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Privacy Compliance</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>GDPR:</strong> Full compliance with EU General Data Protection Regulation</li>
                <li><strong>CCPA/CPRA:</strong> Compliance with California privacy laws</li>
                <li><strong>US State Laws:</strong> Compliance with Virginia, Colorado, Connecticut, and other state laws</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Industry Standards</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Infrastructure providers maintain SOC 2 Type II certification</li>
                <li>Following OWASP security guidelines</li>
                <li>Adherence to CIS security benchmarks</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Data Processing Agreements</h3>
              <p>
                We provide Data Processing Agreements (DPAs) to customers who require them for GDPR compliance.
                <Link to="/dpa" className="text-blue-600 hover:underline ml-1">View our DPA</Link>
              </p>
            </div>
          </section>

          {/* Security Testing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-gray-700" />
              Security Testing
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Regular Testing</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Weekly automated vulnerability scans</li>
                <li>Annual third-party penetration testing</li>
                <li>Continuous dependency monitoring</li>
                <li>Regular security architecture reviews</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Responsible Disclosure</h3>
              <p>
                We welcome security researchers to report vulnerabilities responsibly. If you discover a security
                issue, please report it to <a href="mailto:security@axolop.com" className="text-blue-600 hover:underline">security@axolop.com</a>.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Please provide detailed information about the vulnerability</li>
                <li>Allow reasonable time for us to address the issue before public disclosure</li>
                <li>Do not access or modify other users' data</li>
                <li>We commit to not taking legal action against researchers acting in good faith</li>
              </ul>
            </div>
          </section>

          {/* Physical Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-gray-700" />
              Data Center Security
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Our cloud infrastructure providers maintain physical security including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>24/7 on-site security personnel</li>
                <li>Biometric access controls</li>
                <li>Video surveillance</li>
                <li>Environmental controls (fire suppression, climate control)</li>
                <li>Redundant power systems</li>
                <li>Multiple internet connectivity providers</li>
              </ul>
            </div>
          </section>

          {/* Business Continuity */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Continuity</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Documented business continuity and disaster recovery plans</li>
                <li>Regular backup testing and restoration drills</li>
                <li>Geographically distributed backups</li>
                <li>Recovery Time Objective (RTO): 4 hours</li>
                <li>Recovery Point Objective (RPO): 24 hours</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Contacts</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Security Issues:</strong> <a href="mailto:security@axolop.com" className="text-blue-600 hover:underline">security@axolop.com</a></p>
                <p><strong>Privacy Inquiries:</strong> <a href="mailto:privacy@axolop.com" className="text-blue-600 hover:underline">privacy@axolop.com</a></p>
                <p><strong>General Support:</strong> <a href="mailto:hello@axolop.com" className="text-blue-600 hover:underline">hello@axolop.com</a></p>
              </div>
            </div>
          </section>

          {/* Related Documents */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Documents</h2>
            <div className="space-y-2 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link></li>
                <li><Link to="/dpa" className="text-blue-600 hover:underline">Data Processing Agreement</Link></li>
                <li><Link to="/sla" className="text-blue-600 hover:underline">Service Level Agreement</Link></li>
                <li><Link to="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link></li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
