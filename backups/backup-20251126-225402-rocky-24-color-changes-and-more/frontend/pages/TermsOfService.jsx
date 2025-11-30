import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Revised:</strong> November 26, 2025</p>
              <p><strong>Effective date:</strong> November 26, 2025</p>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Welcome to Axolop. These Terms of Service ("Terms") govern your access to and use of our website,
                products, and services (collectively, the "Service"). By accessing or using the Service, you agree
                to be bound by these Terms.
              </p>
              <p>
                Please read these Terms carefully before using our Service. If you do not agree to these Terms,
                you may not access or use the Service.
              </p>
            </div>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>"Company"</strong> (referred to as either "the Company", "We", "Us" or "Our") refers to Axolop.</p>
              <p><strong>"Service"</strong> refers to the Website, applications, and all related services.</p>
              <p><strong>"Website"</strong> refers to Axolop, accessible from https://axolop.com</p>
              <p><strong>"You"</strong> means the individual or entity accessing or using the Service.</p>
              <p><strong>"Account"</strong> means a unique account created for You to access our Service.</p>
              <p><strong>"Content"</strong> refers to text, images, or other information that can be posted, uploaded, linked to or otherwise made available.</p>
            </div>
          </section>

          {/* Account Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Terms</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>To use certain features of the Service, you must register for an account. When you register:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon or violate our intellectual property rights or others</li>
                <li>Transmit any malicious code, viruses, or harmful content</li>
                <li>Engage in unauthorized data collection or scraping</li>
                <li>Interfere with or circumvent the security features of the Service</li>
                <li>Harass, abuse, or harm another person or entity</li>
                <li>Send spam or unsolicited communications</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The Service and its original content, features, and functionality are and will remain the
                exclusive property of Axolop and its licensors. The Service is protected by copyright,
                trademark, and other laws.
              </p>
              <p>
                Our trademarks may not be used in connection with any product or service without the prior
                written consent of Axolop.
              </p>
            </div>
          </section>

          {/* User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Content</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You retain ownership of any content you submit to the Service. By submitting content,
                you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify,
                and distribute your content in connection with operating and improving the Service.
              </p>
              <p>
                You are solely responsible for your content and the consequences of posting or publishing it.
              </p>
            </div>
          </section>

          {/* Data Collection Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Collection Responsibilities</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                When you use Axolop to create forms, surveys, booking pages, or other data collection tools,
                you acknowledge and agree to the following:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Data Controller Status</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  You are the <strong>Data Controller</strong> for all personal data collected through forms,
                  surveys, booking pages, and other tools you create using our Service
                </li>
                <li>
                  Axolop acts solely as a <strong>Data Processor</strong> on your behalf, processing and
                  storing data according to your instructions
                </li>
                <li>
                  You are solely responsible for determining the purposes and means of processing personal data
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Your Compliance Obligations</h3>
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Comply with all applicable data protection and privacy laws, including but not limited to GDPR, CCPA, CPRA, VCDPA, CPA, UCPA, CTDPA, HIPAA (if applicable), and other relevant regulations</li>
                <li>Obtain valid consent or have another lawful basis for collecting and processing personal data</li>
                <li>Provide clear and conspicuous privacy notices to individuals whose data you collect</li>
                <li>Honor data subject rights requests (access, deletion, correction, etc.) from individuals whose data you collect</li>
                <li>Implement appropriate data retention policies and delete data when it is no longer necessary</li>
                <li>Not collect sensitive personal data (health, financial, biometric, etc.) without appropriate safeguards and legal basis</li>
                <li>Not use the Service to send unsolicited communications (spam) or violate anti-spam laws</li>
              </ul>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-red-800">
                  <strong>Important:</strong> Failure to comply with applicable data protection laws may result in
                  suspension or termination of your account and may expose you to legal liability.
                </p>
              </div>
            </div>
          </section>

          {/* Form Data Auto-Capture Acknowledgment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Form Data Auto-Capture</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service includes auto-capture functionality that saves form responses as users type, before they click submit.
                By using this feature, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You have informed visitors to your forms that their data may be captured before submission</li>
                <li>You have a legitimate business interest or other lawful basis for capturing partial form data</li>
                <li>You are responsible for any claims arising from the use of auto-capture functionality</li>
                <li>You will respect requests from individuals to delete their data, including partial form submissions</li>
              </ul>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You agree to defend, indemnify, and hold harmless Axolop, its affiliates, officers, directors,
                employees, agents, and licensors from and against any and all claims, damages, obligations,
                losses, liabilities, costs, or expenses (including but not limited to attorney's fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights, including privacy or intellectual property rights</li>
                <li>Your data collection practices and the forms, surveys, or booking pages you create</li>
                <li>Any claims by individuals whose data you have collected through the Service</li>
                <li>Your failure to comply with applicable data protection laws and regulations</li>
                <li>Your use of the auto-capture functionality and any claims arising therefrom</li>
                <li>Any content you submit, post, or transmit through the Service</li>
              </ul>
              <p>
                This indemnification obligation will survive the termination of these Terms and your use of the Service.
              </p>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Payment Terms</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Certain features of the Service may require payment. You agree to provide accurate billing
                information and authorize us to charge your payment method for any fees incurred.
              </p>
              <p>
                All fees are non-refundable unless otherwise stated. We reserve the right to change our
                pricing at any time with notice.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without
                prior notice or liability, for any reason, including breach of these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to
                terminate your account, you may do so by contacting us.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                To the maximum extent permitted by law, Axolop shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                whether incurred directly or indirectly.
              </p>
              <p>
                Our total liability shall not exceed the amount you paid us in the twelve (12) months
                preceding the claim.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Third-Party Data and Form Submissions</h3>
              <p>
                Without limiting the foregoing, Axolop shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Claims arising from data collected by Platform Users through forms, surveys, or booking pages</li>
                <li>Any misuse of data by Platform Users who have collected information through our Service</li>
                <li>Privacy or data protection claims brought by individuals whose data was collected through your forms</li>
                <li>Regulatory fines or penalties imposed on you for your data collection practices</li>
                <li>Loss of data caused by user error, unauthorized access to your account, or third-party actions</li>
              </ul>
            </div>
          </section>

          {/* Age Restrictions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12A. Age Restrictions</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The Service is not intended for use by individuals under the age of 18. By using the Service,
                you represent and warrant that you are at least 18 years of age.
              </p>
              <p>
                If you are a Platform User creating forms or data collection tools, you are responsible for
                ensuring that you do not knowingly collect personal data from children under 13 (or the applicable
                age of consent in your jurisdiction) without verifiable parental consent as required by law.
              </p>
              <p>
                If we become aware that we have collected personal data from a child under 13 without parental
                consent, we will take steps to delete that information.
              </p>
            </div>
          </section>

          {/* Email Marketing Compliance */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12B. Email Marketing Compliance</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>When using our email marketing features, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Only send emails to individuals who have provided valid consent or with whom you have an existing business relationship</li>
                <li>Include accurate sender identification and a valid physical mailing address in all marketing emails</li>
                <li>Honor opt-out and unsubscribe requests within 10 business days</li>
                <li>Not use deceptive subject lines or misleading header information</li>
                <li>Comply with CAN-SPAM, CASL, GDPR, and all other applicable anti-spam regulations</li>
                <li>Not purchase, rent, or use email lists from third parties without verified consent</li>
                <li>Maintain records of consent for all recipients</li>
              </ul>
              <p className="mt-4">
                Violation of email marketing compliance requirements may result in immediate suspension or termination of your account.
              </p>
            </div>
          </section>

          {/* Call Recording and Consent */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12C. Call Recording and Communications</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>When using our calling features, you acknowledge and agree that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are solely responsible for obtaining consent from all parties before recording any call</li>
                <li>Recording requirements vary by jurisdiction - you must comply with all applicable one-party and two-party consent laws</li>
                <li>You will clearly disclose to call participants when a call is being recorded</li>
                <li>You will not use call recordings for any unlawful purpose</li>
                <li>AI transcription and analysis features are provided "as is" and may contain errors</li>
                <li>You will verify the accuracy of any AI-generated transcripts before relying on them for important decisions</li>
              </ul>
              <p className="mt-4">
                Axolop is not liable for any claims arising from your failure to obtain proper consent for call recording
                or from errors in AI-generated transcriptions.
              </p>
            </div>
          </section>

          {/* AI Features and Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12D. AI Features and Limitations</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service includes various AI-powered features including but not limited to: lead scoring, call transcription,
                content suggestions, Local AI Second Brain, and intelligent automation. By using these AI features, you acknowledge:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>No Guarantee of Accuracy:</strong> AI-generated content, scores, and recommendations are estimates and may contain errors</li>
                <li><strong>Human Review Required:</strong> AI outputs should be reviewed by a human before making important business decisions</li>
                <li><strong>No Replacement for Professional Advice:</strong> AI features do not constitute legal, financial, medical, or other professional advice</li>
                <li><strong>Continuous Improvement:</strong> AI features may be updated, modified, or discontinued at any time</li>
                <li><strong>Data Processing:</strong> AI features may process your data to provide insights; see our Privacy Policy for details</li>
              </ul>

              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mt-4">
                <p className="text-gray-700">
                  <strong>AI Disclaimer:</strong> AXOLOP MAKES NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE ACCURACY,
                  RELIABILITY, OR SUITABILITY OF AI-GENERATED CONTENT FOR ANY PARTICULAR PURPOSE. YOU USE AI FEATURES AT YOUR OWN RISK.
                </p>
              </div>
            </div>
          </section>

          {/* Workflow Automation */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12E. Workflow Automation</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service includes workflow automation features that allow you to automate business processes.
                When using workflow automation:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for the actions taken by your automated workflows</li>
                <li>Test workflows thoroughly before deploying to production</li>
                <li>Ensure automated communications comply with applicable laws and regulations</li>
                <li>Monitor automated workflows for errors or unintended consequences</li>
                <li>Axolop is not liable for damages caused by misconfigured or malfunctioning workflows</li>
                <li>Automated actions are limited by your subscription tier and may be rate-limited</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Integrations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12F. Third-Party Integrations</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service integrates with third-party platforms and services. When connecting integrations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You authorize Axolop to access and interact with third-party services on your behalf</li>
                <li>Third-party services are governed by their own terms and privacy policies</li>
                <li>Axolop is not responsible for the availability, accuracy, or functionality of third-party services</li>
                <li>Changes to third-party APIs may affect integration functionality</li>
                <li>You are responsible for maintaining valid credentials for connected services</li>
                <li>Disconnecting an integration may result in loss of synced data</li>
              </ul>
              <p className="mt-4">
                Axolop does not endorse any third-party service and is not liable for any issues arising from your use
                of third-party integrations.
              </p>
            </div>
          </section>

          {/* SMS and Messaging */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12G. SMS and Text Messaging</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>When using SMS or text messaging features, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Obtain express written consent before sending text messages for marketing purposes</li>
                <li>Provide clear opt-out instructions in all text messages</li>
                <li>Honor opt-out requests immediately</li>
                <li>Comply with TCPA, CTIA guidelines, and all applicable messaging regulations</li>
                <li>Not send messages during prohibited hours as defined by applicable law</li>
                <li>Maintain records of consent for all recipients</li>
                <li>Not use text messaging for illegal purposes including harassment, threats, or fraud</li>
              </ul>
              <p className="mt-4">
                You acknowledge that carrier fees and message delivery rates may vary and are outside of Axolop's control.
                Axolop is not liable for failed message delivery or carrier-imposed restrictions.
              </p>
            </div>
          </section>

          {/* Acceptable Use Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Acceptable Use Policy</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                By using our Service, you agree to comply with this Acceptable Use Policy. Violation may result in immediate suspension or termination without refund.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Prohibited Content</h3>
              <p>You may not use the Service to create, store, send, or distribute content that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Is unlawful, defamatory, obscene, pornographic, or indecent</li>
                <li>Promotes violence, discrimination, or hate speech</li>
                <li>Infringes intellectual property rights of others</li>
                <li>Contains viruses, malware, or harmful code</li>
                <li>Impersonates another person or entity</li>
                <li>Makes false or misleading claims</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Prohibited Industries</h3>
              <p>The Service may not be used for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Illegal substances or drug paraphernalia</li>
                <li>Unlicensed pharmaceutical sales</li>
                <li>Adult content or escort services</li>
                <li>Unlicensed gambling</li>
                <li>Weapons or explosives</li>
                <li>MLM, pyramid schemes, or "get rich quick" schemes</li>
                <li>Payday loans or predatory lending</li>
                <li>Cryptocurrency pump-and-dump or unregistered securities</li>
                <li>Counterfeit goods</li>
                <li>Phishing or fraud</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Contact List Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All contacts must have explicitly opted-in</li>
                <li>Business cards do not constitute valid opt-in</li>
                <li>Purchased or scraped email lists are prohibited</li>
                <li>You must validate addresses before sending</li>
                <li>Cycling contacts to circumvent limits is prohibited</li>
              </ul>
            </div>
          </section>

          {/* Beta Features */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Beta and Preview Features</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Beta, preview, or experimental features are provided "AS IS" without warranties:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>May contain bugs, errors, or inaccuracies</li>
                <li>May be modified or discontinued without notice</li>
                <li>Data may be lost or corrupted</li>
                <li>Not covered by SLA or uptime guarantees</li>
                <li>Should not be used for mission-critical purposes</li>
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <p className="text-amber-800"><strong>Warning:</strong> Use Beta Features at your own risk.</p>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Service Availability</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>We target 99.9% uptime but do not guarantee uninterrupted access.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Scheduled maintenance may affect availability</li>
                <li>We will provide advance notice when possible</li>
                <li>Axolop is not liable for downtime-related damages</li>
              </ul>
            </div>
          </section>

          {/* Affiliate Program */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Affiliate and Referral Program</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Affiliates are independent contractors and must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Clearly disclose affiliate relationships</li>
                <li>Comply with FTC Endorsement Guidelines</li>
                <li>Not make false claims about Axolop</li>
                <li>Not bid on Axolop trademarks in ads</li>
                <li>Not use spam to promote</li>
              </ul>
              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mt-4">
                <p className="text-gray-700"><strong>No Income Guarantee:</strong> Axolop does not guarantee income or business success.</p>
              </div>
            </div>
          </section>

          {/* Funnel Builder */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Funnel and Landing Page Builder</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for all content on your pages</li>
                <li>Income claims require appropriate disclaimers</li>
                <li>Testimonials must comply with FTC guidelines</li>
                <li>You must ensure accessibility compliance</li>
                <li>High-traffic pages may be subject to limits</li>
              </ul>
            </div>
          </section>

          {/* API Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. API and Developer Terms</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Comply with documentation and rate limits</li>
                <li>Keep API credentials secure</li>
                <li>Do not circumvent authentication</li>
                <li>Do not create competing products</li>
                <li>API endpoints may change with notice</li>
              </ul>
            </div>
          </section>

          {/* White Label */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">19. White Label and Agency Use</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for client compliance</li>
                <li>You must have data processing agreements with clients</li>
                <li>You remain liable for all account activities</li>
                <li>You are the Data Controller for client workspaces</li>
              </ul>
            </div>
          </section>

          {/* Marketplace */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Marketplace and Templates</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Templates are provided "as is" without warranty</li>
                <li>You must customize for legal requirements</li>
                <li>Axolop is not responsible for third-party templates</li>
                <li>Template sellers grant Axolop distribution rights</li>
              </ul>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">21. Dispute Resolution and Arbitration</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-800 font-semibold">IMPORTANT: This affects your legal rights including jury trial rights.</p>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li><strong>Informal Resolution:</strong> Contact hello@axolop.com first</li>
                <li><strong>Binding Arbitration:</strong> Disputes resolved through AAA arbitration</li>
                <li><strong>Class Action Waiver:</strong> Claims must be brought individually, not as class actions</li>
                <li><strong>Exceptions:</strong> Small claims court and IP enforcement</li>
              </ul>
            </div>
          </section>

          {/* Force Majeure */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">22. Force Majeure</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Axolop is not liable for failures due to circumstances beyond control including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Natural disasters or extreme weather</li>
                <li>War, terrorism, or government actions</li>
                <li>Pandemic or public health emergencies</li>
                <li>Power or internet outages</li>
                <li>Third-party provider failures</li>
                <li>Cyberattacks or security incidents</li>
              </ul>
            </div>
          </section>

          {/* Data Export */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">23. Data Export and Portability</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Export your data anytime through our tools</li>
                <li>30 days to export after account termination</li>
                <li>Data provided in standard formats (CSV, JSON)</li>
                <li>We are not responsible for data loss if you fail to export</li>
              </ul>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">24. Disclaimer</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">25. Governing Law</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                United States, without regard to its conflict of law provisions.
              </p>
            </div>
          </section>

          {/* Changes */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">26. Changes to Terms</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of
                significant changes by posting the new Terms on this page and updating the "Effective date."
              </p>
              <p>
                Your continued use of the Service after any changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Proprietary Technology and Trade Secrets */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">27. Proprietary Technology and Trade Secrets</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                All text, graphics, user interfaces, visual interfaces, photographs, trademarks, logos, sounds, music, artwork,
                computer code, algorithms, methodologies, processes, and technical implementations (collectively, "Content") contained
                in the Service, including but not limited to the design, structure, selection, coordination, expression, and arrangement
                of such Content, is owned, controlled, or licensed by or to Axolop, and is protected by trade dress, copyright, patent,
                and trademark laws, and various other intellectual property rights and unfair competition laws.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Trade Secrets</h3>
              <p>
                The methods, algorithms, processes, and technical implementations used by Axolop to deliver the Service constitute
                proprietary trade secrets of Axolop. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Axolop's AI models, scoring algorithms, automation engines, and data processing methods are confidential trade secrets</li>
                <li>The specific mechanisms by which features operate are proprietary and not subject to disclosure</li>
                <li>You will not attempt to reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code or underlying algorithms of any part of the Service</li>
                <li>You will not probe, scan, or test the vulnerability of the Service or any network connected to the Service</li>
                <li>You will not breach or circumvent any security or authentication measures</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Automated Access Restrictions</h3>
              <p>You may not use any:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>"Deep-link," "page-scrape," "robot," "spider," or other automatic device, program, algorithm, or methodology</li>
                <li>Similar or equivalent manual process to access, acquire, copy, or monitor any portion of the Service</li>
                <li>Tools to reproduce or circumvent the navigational structure or presentation of the Service</li>
                <li>Means to obtain or attempt to obtain any materials, documents, or information not intentionally made available through the Service</li>
              </ul>

              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mt-4">
                <p className="text-gray-700">
                  <strong>Notice:</strong> Axolop reserves the right to bar any such activity and to pursue all available legal remedies
                  against violators, including but not limited to claims under the Computer Fraud and Abuse Act and equivalent state laws.
                </p>
              </div>
            </div>
          </section>

          {/* Platform Exclusivity and Ecosystem */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">28. Platform Exclusivity and Ecosystem</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop is designed as an integrated, unified platform that replaces the need for multiple disconnected tools.
                By using our Service, you acknowledge and agree to the following platform exclusivity terms:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Unified Ecosystem Design</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The Service is designed to operate as a self-contained ecosystem with internal integrations</li>
                <li>Features are optimized to work together within the Axolop platform and may not function independently</li>
                <li>External integrations are limited and available only through officially supported methods</li>
                <li>Third-party connections may require additional subscription tiers or enterprise agreements</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Integration Restrictions</h3>
              <p>
                No part of the Service, including any Content, features, or data, may be copied, reproduced, republished,
                uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, or used in any way in
                or with any other platform, service, or commercial enterprise without Axolop's express prior written consent.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Standard plans do not include API access or external integration capabilities</li>
                <li>Connecting Axolop data or features to competing platforms is prohibited</li>
                <li>Bulk data export or migration tools are limited to specific subscription tiers</li>
                <li>Third-party plugins, extensions, or modifications to the Service are not permitted without written authorization</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Competitive Use Prohibition</h3>
              <p>You may not use the Service or any information obtained from the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Develop, enhance, or operate a competing product or service</li>
                <li>Benchmark the Service against competitive offerings for publication or competitive analysis</li>
                <li>Assist any third party in developing a competing product or service</li>
                <li>Copy, imitate, or replicate any feature, function, or graphic of the Service</li>
              </ul>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <p className="text-amber-800">
                  <strong>Enterprise API Program:</strong> Businesses requiring API access, custom integrations, or data portability
                  beyond standard export options must contact us for Enterprise plan pricing and terms. Enterprise agreements include
                  additional terms and conditions.
                </p>
              </div>
            </div>
          </section>

          {/* Service Modifications and Feature Changes */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">29. Service Modifications and Feature Changes</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop reserves the right, in its sole discretion, to modify, suspend, or discontinue, temporarily or permanently,
                the Service or any features, functionality, or content thereof at any time, with or without notice. You agree that
                Axolop shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the
                Service or any part thereof.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Modifications Without Notice</h3>
              <p>Axolop may, at any time and without prior notice:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Make changes to any products, services, or features offered through the Service</li>
                <li>Modify or remove features, integrations, or capabilities</li>
                <li>Update the user interface, workflows, or operational processes</li>
                <li>Change the specifications, configuration, or performance of the Service</li>
                <li>Limit or restrict access to certain features based on subscription tier</li>
                <li>Implement new technologies or methodologies to deliver the Service</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">No Guarantee of Feature Availability</h3>
              <p>
                We do not guarantee that any specific feature, integration, or functionality will remain available. Features described
                in marketing materials, documentation, or communications are provided for informational purposes and do not constitute
                a commitment to maintain those features indefinitely.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Operational Discretion</h3>
              <p>
                The manner in which the Service operates, processes data, delivers results, and provides functionality is determined
                at Axolop's sole discretion. We may employ various methods, technologies, algorithms, and processes to deliver the
                Service, and these operational details are proprietary and not subject to user approval or disclosure.
              </p>
            </div>
          </section>

          {/* Feedback and Suggestions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">30. Feedback and Suggestions</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Any feedback, comments, ideas, improvements, or suggestions (collectively, "Suggestions") provided by you to Axolop
                with respect to the Service shall remain the sole and exclusive property of Axolop. Axolop shall be free to use,
                copy, modify, publish, or redistribute the Suggestions for any purpose and in any way without any credit or
                compensation to you.
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All Suggestions shall be deemed non-confidential and non-proprietary</li>
                <li>You hereby assign to Axolop all right, title, and interest in and to any Suggestions</li>
                <li>Axolop shall have an unrestricted, irrevocable, perpetual, worldwide license to use Suggestions for any purpose</li>
                <li>You waive any and all moral rights in any Suggestions</li>
                <li>You represent that you have the right to provide such Suggestions without restriction</li>
              </ul>

              <p className="mt-4">
                Axolop has no obligation to review, acknowledge, or respond to any Suggestions, nor any obligation to incorporate
                any Suggestions into the Service.
              </p>
            </div>
          </section>

          {/* Account Termination and Data Access */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">31. Account Termination and Data Access</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Upon termination of your account, whether by you or by Axolop, the following consequences shall apply:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Immediate Effects</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access to all features, data, and functionality of the Service will be immediately suspended</li>
                <li>Any sub-accounts, team members, or connected users under your account will lose access</li>
                <li>Scheduled automations, workflows, and campaigns will be immediately stopped</li>
                <li>API access (if applicable) will be immediately revoked</li>
                <li>Third-party integrations connected through your account will be disconnected</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Data Retention and Deletion</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will have 30 days from account termination to export your data through available export tools</li>
                <li>After the 30-day period, your data may be permanently deleted without further notice</li>
                <li>Some data may be retained as required by law or for legitimate business purposes</li>
                <li>Axolop is not responsible for any data loss resulting from account termination</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Irreversibility</h3>
              <p>
                Account deletion is permanent and irreversible under standard circumstances. Deleted accounts cannot be restored,
                and associated data, configurations, automations, and settings cannot be recovered. If you wish to use the Service
                again after account deletion, you must create a new account and start fresh.
              </p>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-red-800">
                  <strong>Warning:</strong> Terminating your Axolop account means you will not have access to the Service or any
                  products, features, or third-party services that you set up with that account. This action may be non-reversible.
                  Please ensure you have exported all necessary data before termination.
                </p>
              </div>
            </div>
          </section>

          {/* Enhanced Liability Cap */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">32. Enhanced Liability Limitations</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                IN ADDITION TO THE LIMITATIONS SET FORTH IN SECTION 12, THE FOLLOWING ENHANCED LIABILITY LIMITATIONS APPLY:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Maximum Liability Cap</h3>
              <p>
                NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, AXOLOP'S LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER,
                AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE GREATER OF: (A) THE AMOUNT PAID,
                IF ANY, BY YOU TO AXOLOP FOR THE SERVICE DURING THE SIX (6) MONTHS PRIOR TO ANY CAUSE OF ACTION ARISING, OR (B)
                ONE HUNDRED DOLLARS ($100.00).
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Excluded Damages</h3>
              <p>IN NO EVENT SHALL AXOLOP BE LIABLE FOR:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of data, revenue, profits, or business opportunities</li>
                <li>Loss of goodwill or reputation</li>
                <li>Cost of procurement of substitute goods or services</li>
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Damages arising from third-party claims</li>
                <li>Damages arising from your use of any third-party integrations</li>
                <li>Damages arising from unauthorized access to your account</li>
                <li>Damages arising from AI-generated content or recommendations</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Basis of the Bargain</h3>
              <p>
                THE LIMITATIONS OF LIABILITY SET FORTH IN THESE TERMS REFLECT THE ALLOCATION OF RISK BETWEEN THE PARTIES.
                THE LIMITATIONS SPECIFIED IN THIS SECTION WILL SURVIVE AND APPLY EVEN IF ANY LIMITED REMEDY SPECIFIED IN
                THESE TERMS IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
              </p>
            </div>
          </section>

          {/* Compliance and Monitoring */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">33. Compliance and Monitoring</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop reserves the right to monitor, review, screen, and/or remove any Content or activity on the Service
                at any time, without prior notice, in its sole discretion.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Monitoring Activities</h3>
              <p>Axolop may, but is not obligated to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Monitor or review any areas of the Service for compliance with these Terms</li>
                <li>Investigate violations of these Terms or applicable law</li>
                <li>Remove or disable access to any Content that violates these Terms</li>
                <li>Report activities that we suspect may violate any law to law enforcement</li>
                <li>Implement technical measures to detect and prevent prohibited activities</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Content Moderation</h3>
              <p>
                Axolop reserves the right to move, refuse, modify, and/or remove Content at any time, without prior notice
                and in its sole discretion, if it finds that such Content violates these Terms or is otherwise objectionable.
              </p>
            </div>
          </section>

          {/* Survival of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">34. Survival of Terms</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The following sections shall survive any termination or expiration of these Terms: Definitions, Intellectual
                Property, Proprietary Technology and Trade Secrets, Platform Exclusivity and Ecosystem, Feedback and Suggestions,
                Indemnification, Limitation of Liability, Enhanced Liability Limitations, Disclaimer, Dispute Resolution and
                Arbitration, Governing Law, and any other provision that by its nature should survive termination.
              </p>
            </div>
          </section>

          {/* Entire Agreement */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">35. Entire Agreement</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Terms, together with the Privacy Policy and any other legal notices published by Axolop on the Service,
                constitute the entire agreement between you and Axolop concerning the Service. These Terms supersede all prior
                or contemporaneous communications and proposals, whether electronic, oral, or written, between you and Axolop
                with respect to the Service.
              </p>
              <p>
                A printed version of these Terms and of any notice given in electronic form shall be admissible in judicial or
                administrative proceedings based upon or relating to these Terms to the same extent and subject to the same
                conditions as other business documents and records originally generated and maintained in printed form.
              </p>
            </div>
          </section>

          {/* Account Inactivity and Dormancy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">36. Account Inactivity and Dormancy</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may terminate or suspend accounts that remain inactive for extended periods. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Free accounts with no login activity for 90 or more consecutive days may be marked as dormant</li>
                <li>Dormant free accounts may be terminated and data deleted after 120 days of continuous inactivity</li>
                <li>We will attempt to notify you via email before terminating a dormant account</li>
                <li>Paid accounts remain active as long as subscription payments are current</li>
                <li>Suspended paid accounts with overdue payments may be terminated after 30 days</li>
              </ul>
              <p className="mt-4">
                Upon account termination due to inactivity, all associated data may be permanently deleted.
                We are not responsible for any data loss resulting from account inactivity termination.
              </p>
            </div>
          </section>

          {/* Late Payment and Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">37. Late Payment and Collection</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If any payment is not received by the due date, the following terms apply:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Late payments accrue interest at the rate of 1.5% per month (or the maximum rate permitted by law, whichever is lower) on the outstanding balance</li>
                <li>You are responsible for all costs of collection, including reasonable attorney's fees</li>
                <li>We may suspend access to the Service until all overdue amounts are paid in full</li>
                <li>Continued non-payment may result in account termination without refund</li>
                <li>We may report delinquent accounts to credit reporting agencies</li>
              </ul>
              <p className="mt-4">
                All fees are non-refundable unless otherwise expressly stated. Downgrades take effect at the next billing cycle,
                and no prorated refunds will be provided for early termination or downgrades.
              </p>
            </div>
          </section>

          {/* Contact List and Data Quality Requirements */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">38. Contact List and Data Quality Requirements</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                When using our CRM, email marketing, or communication features, you must maintain high-quality contact data:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Organic Contacts Only</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will not use purchased, rented, borrowed, or third-party contact lists</li>
                <li>All contacts must have been obtained through your own legitimate business activities</li>
                <li>You must have a documented relationship or consent from each contact</li>
                <li>Scraped, harvested, or co-registration contacts are prohibited</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">List Hygiene</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must regularly clean your contact lists to remove invalid or bouncing addresses</li>
                <li>High bounce rates (&gt;5%) may result in sending suspension</li>
                <li>High spam complaint rates (&gt;0.1%) may result in account suspension</li>
                <li>You must promptly remove contacts who unsubscribe or request deletion</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Consequences of Violation</h3>
              <p>
                Violation of these contact list requirements may result in immediate suspension of email sending capabilities,
                account termination, and liability for any damages, fines, or penalties incurred by Axolop as a result of your
                non-compliance.
              </p>
            </div>
          </section>

          {/* Deliverability and Communication Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">39. Deliverability and Communication Disclaimers</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop provides email, SMS, and other communication capabilities, but makes no guarantees regarding deliverability:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>No Delivery Guarantee:</strong> We do not guarantee that emails, SMS, or other messages will be delivered, opened, or read</li>
                <li><strong>Third-Party Networks:</strong> Message delivery depends on third-party networks, carriers, and email providers that are outside our control</li>
                <li><strong>Spam Filters:</strong> Messages may be filtered, blocked, or marked as spam by recipient email providers</li>
                <li><strong>Carrier Restrictions:</strong> SMS messages may be filtered or blocked by mobile carriers</li>
                <li><strong>Throttling:</strong> We may throttle sending at our discretion to maintain deliverability and comply with industry standards</li>
              </ul>

              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mt-4">
                <p className="text-gray-700">
                  <strong>Disclaimer:</strong> THE INTERNET AND TELECOMMUNICATIONS NETWORKS ARE INHERENTLY INSECURE.
                  AXOLOP SHALL HAVE NO LIABILITY FOR ANY CHANGES TO, INTERCEPTION OF, OR LOSS OF MESSAGES OR DATA WHILE IN TRANSIT.
                </p>
              </div>
            </div>
          </section>

          {/* Regulatory Compliance and Fines */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">40. Regulatory Compliance and Fines</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You are solely responsible for compliance with all applicable laws and regulations when using the Service.
                This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>TCPA, CAN-SPAM, CASL, GDPR, CCPA, and other privacy and communication laws</li>
                <li>Industry-specific regulations (HIPAA, FINRA, etc.) if applicable to your business</li>
                <li>Export control and sanctions regulations</li>
                <li>Local, state, and international telecommunications regulations</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Financial Responsibility</h3>
              <p>
                You agree to pay, and indemnify Axolop against, all costs, fines, penalties, and damages arising from or
                relating to your or your end users' use of the Service, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Regulatory fines or penalties from government agencies</li>
                <li>Carrier fines, surcharges, or penalties for messaging violations</li>
                <li>Legal fees, settlements, or judgments from third-party claims</li>
                <li>Costs of responding to regulatory inquiries or investigations</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Cooperation with Authorities</h3>
              <p>
                You agree to provide reasonable cooperation regarding information requests from law enforcement, regulators,
                telecommunications providers, or other authorities. Failure to cooperate may result in account suspension.
              </p>
            </div>
          </section>

          {/* Usage Limits and Fair Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">41. Usage Limits and Fair Use</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Your use of the Service is subject to fair use limitations. We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Impose limits on API calls, storage, bandwidth, or other resources based on your subscription tier</li>
                <li>Throttle or suspend accounts exhibiting unusual or excessive usage patterns</li>
                <li>Charge overage fees for usage exceeding your plan limits</li>
                <li>Require upgrades for accounts consistently exceeding plan limits</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Excessive Usage</h3>
              <p>
                If your usage of the Service materially exceeds the average usage of other customers on the same plan,
                or causes a disproportionate load on our infrastructure, we may:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact you to discuss usage optimization</li>
                <li>Require you to upgrade to a higher-tier plan</li>
                <li>Implement usage restrictions on your account</li>
                <li>Suspend your account until the issue is resolved</li>
              </ul>
            </div>
          </section>

          {/* Complaint Response Requirements */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">42. Complaint Response Requirements</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If we receive complaints about your use of the Service, you must respond promptly:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must respond to abuse complaints forwarded by Axolop within 48 hours</li>
                <li>You must respond to data subject requests (GDPR, CCPA) within legally required timeframes</li>
                <li>Failure to respond to complaints within 10 business days may result in disclosure of your contact information to complainants</li>
                <li>Repeated complaints may result in account suspension or termination</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Investigation Period</h3>
              <p>
                If we suspect your account is being used in violation of these Terms or applicable law, we may suspend
                your account for up to 30 days while we investigate. During this investigation period, you must provide
                all requested information to assist our investigation.
              </p>
            </div>
          </section>

          {/* Marketing and Publicity Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">43. Marketing and Publicity Rights</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Unless you notify us in writing otherwise, you grant Axolop the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Include your company name and logo in our customer lists and marketing materials</li>
                <li>Publicly identify you as a customer of Axolop</li>
                <li>Create and publish case studies about your use of the Service (with your approval of content)</li>
                <li>Reference your use of Axolop in press releases and investor communications</li>
              </ul>
              <p className="mt-4">
                To opt out of these marketing uses, contact us in writing at hello@axolop.com. Opting out will not
                affect your use of the Service but will prevent future marketing use of your name or likeness.
              </p>
            </div>
          </section>

          {/* Export Controls and Sanctions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">44. Export Controls and Sanctions</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The Service may be subject to export control and sanctions laws and regulations. You represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are not located in, under the control of, or a national or resident of any country subject to U.S. sanctions</li>
                <li>You are not on any U.S. government restricted parties list (SDN, Entity List, etc.)</li>
                <li>You will not export, re-export, or transfer the Service to prohibited destinations or parties</li>
                <li>You will comply with all applicable export control and sanctions laws</li>
              </ul>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-red-800">
                  <strong>Immediate Termination:</strong> Axolop may immediately terminate your access to the Service
                  without notice or liability if we reasonably believe you have violated export control or sanctions laws.
                </p>
              </div>
            </div>
          </section>

          {/* Subscription Auto-Renewal */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">45. Subscription Auto-Renewal and Cancellation</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Subscriptions automatically renew at the end of each billing period unless cancelled:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Auto-Renewal</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Monthly subscriptions renew each month on your billing date</li>
                <li>Annual subscriptions renew each year on your anniversary date</li>
                <li>Renewal fees are charged at the then-current rates unless otherwise specified</li>
                <li>We will provide at least 30 days' notice of material price increases</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Cancellation</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>No refunds are provided for partial billing periods</li>
                <li>Annual subscriptions cancelled mid-term do not receive prorated refunds</li>
                <li>You retain access to paid features until the end of your billing period</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Plan Changes</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upgrades take effect immediately with prorated charges</li>
                <li>Downgrades take effect at the start of your next billing period</li>
                <li>Some features may be lost when downgrading; data may be archived or deleted</li>
              </ul>
            </div>
          </section>

          {/* Two-Stage Data Deletion */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">46. Two-Stage Data Deletion Process</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Upon account termination or cancellation, your data undergoes a two-stage deletion process:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Stage 1: Data Archive (0-6 Months)</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your account is immediately suspended and access is revoked</li>
                <li>All user-generated content (forms, funnels, workflows, campaigns) is archived</li>
                <li>Lead and contact data collected through your forms remains in archive</li>
                <li>You may request data export during this period</li>
                <li>Account reactivation is possible during this window (may require payment of outstanding balances)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Stage 2: Permanent Deletion (6-12 Months)</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>After 6 months, all user-created content and collected data is irreversibly and automatically deleted</li>
                <li>After 12 months, your account record is permanently removed from our systems</li>
                <li>This deletion is irreversible and cannot be undone</li>
                <li>Some anonymized, aggregated data may be retained for analytics purposes</li>
              </ul>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <p className="text-amber-800">
                  <strong>Important:</strong> If you wish to preserve your data, you must export it before the 6-month
                  archive period expires. Axolop is not responsible for any data loss after this period.
                </p>
              </div>
            </div>
          </section>

          {/* Customer Eligibility and Account Restrictions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">47. Customer Eligibility and Account Restrictions</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The Service is intended for business and professional use. By creating an account, you represent that:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Eligibility Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are acting in your capacity as an entrepreneur, business owner, or professional</li>
                <li>You are at least 18 years of age and have the legal capacity to enter into contracts</li>
                <li>If registering on behalf of an organization, you have authority to bind that organization</li>
                <li>You will provide accurate company/business information, including tax identification numbers where required</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Account Restrictions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accounts are personal to the registered user or organization and may not be transferred, sold, or assigned</li>
                <li>You may not share login credentials or allow multiple individuals to access a single-user account</li>
                <li>Each team member must have their own seat/license as required by your subscription tier</li>
                <li>Circumventing seat limits or sharing accounts is a material breach of these Terms</li>
              </ul>
            </div>
          </section>

          {/* Template and Content Licensing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">48. Template and Content Licensing</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop provides templates, designs, and pre-built content for use within the Service. Your use of these
                materials is subject to the following licensing terms:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Permitted Use</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Templates may be used to create forms, funnels, landing pages, and campaigns within the Service</li>
                <li>You may customize templates for your business purposes</li>
                <li>Templates remain the property of Axolop or their respective licensors</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Prohibited Use</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Templates may not be exported, downloaded, or used outside of the Axolop platform</li>
                <li>You may not resell, redistribute, or sublicense templates to third parties</li>
                <li>You may not use templates to create competing products or template libraries</li>
                <li>Commercial resale of template-based work requires explicit written licensing agreement</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Licensing Fees</h3>
              <p>
                Commercial use of templates beyond the scope of your subscription, including resale, white-label distribution,
                or use in products sold to third parties, requires a separate licensing agreement. Unauthorized commercial use
                may result in licensing fees, account suspension, and legal action.
              </p>
            </div>
          </section>

          {/* Funnel and Form Content Responsibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">49. Funnel, Form, and Landing Page Content Responsibility</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You bear sole responsibility for all content created, published, or distributed through funnels, forms,
                landing pages, and other tools created using the Service. This includes:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Your Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ensuring all content complies with applicable laws and regulations in all jurisdictions where it is accessed</li>
                <li>Obtaining all necessary rights, licenses, and permissions for content you use (images, text, videos, etc.)</li>
                <li>Ensuring claims made in your content are truthful, accurate, and not misleading</li>
                <li>Including required legal disclosures (privacy notices, disclaimers, terms) on your pages</li>
                <li>Complying with advertising regulations, FTC guidelines, and industry-specific requirements</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Income and Results Claims</h3>
              <p>
                If your funnels or landing pages make income claims, testimonials, or results statements, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ensure all claims are truthful and can be substantiated</li>
                <li>Include appropriate earnings disclaimers as required by the FTC</li>
                <li>Clearly disclose that results are not typical if testimonials represent exceptional outcomes</li>
                <li>Not make guarantees of specific financial results</li>
              </ul>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-red-800">
                  <strong>Disclaimer:</strong> Axolop does not review, endorse, or verify the accuracy of content you create.
                  You indemnify Axolop against all claims arising from your content, including regulatory fines, legal fees,
                  and damages from third-party claims.
                </p>
              </div>
            </div>
          </section>

          {/* Material Changes and Objection Period */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">50. Material Changes and Objection Period</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may modify these Terms from time to time. Different notification and acceptance procedures apply
                depending on the nature of the changes:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Non-Material Changes</h3>
              <p>
                Minor clarifications, corrections of obvious errors, or updates that do not materially affect your rights
                or obligations may be made at any time by posting the updated Terms. Continued use of the Service
                constitutes acceptance.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Material Changes</h3>
              <p>
                For material changes that significantly affect your rights, obligations, or use of the Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We will notify you at least 30 days before the changes take effect</li>
                <li>You will have a six (6) week objection period from the date of notification</li>
                <li>If you do not object within the objection period, the changes are deemed approved and accepted</li>
                <li>If you object, we may terminate your account effective on the date the changes would take effect</li>
                <li>Continued use of the Service after changes take effect constitutes acceptance</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">How to Object</h3>
              <p>
                To object to material changes, you must notify us in writing at hello@axolop.com within the objection
                period, clearly stating your objection. Silence or continued use without objection constitutes acceptance.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">51. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at:<br />
              <strong>Email:</strong> <a href="mailto:hello@axolop.com" className="text-blue-600 hover:underline">hello@axolop.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
