import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookiePolicy() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Revised:</strong> November 26, 2025</p>
              <p><strong>Effective date:</strong> November 26, 2025</p>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Cookies are small text files that are stored on your computer or mobile device when you
                visit a website. They are widely used to make websites work more efficiently and to
                provide information to the owners of the site.
              </p>
              <p>
                This Cookie Policy explains how Axolop ("we", "us", or "our") uses cookies and similar
                technologies on our website https://axolop.com (the "Service").
              </p>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>We use cookies for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</li>
                <li><strong>Analytics Cookies:</strong> These help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                <li><strong>Functionality Cookies:</strong> These cookies remember choices you make and provide enhanced, more personal features.</li>
                <li><strong>Marketing Cookies:</strong> These cookies track your online activity to help advertisers deliver more relevant advertising.</li>
              </ul>
            </div>
          </section>

          {/* Types of Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Essential Cookies</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b">
                    <td className="py-2">session_id</td>
                    <td className="py-2">Maintains user session</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">csrf_token</td>
                    <td className="py-2">Security protection</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2">auth_token</td>
                    <td className="py-2">Authentication</td>
                    <td className="py-2">7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Analytics Cookies</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b">
                    <td className="py-2">_ga</td>
                    <td className="py-2">Google Analytics - distinguishes users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="py-2">_gid</td>
                    <td className="py-2">Google Analytics - distinguishes users</td>
                    <td className="py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report
                usage statistics of the Service, deliver advertisements on and through the Service,
                and so on.
              </p>
              <p>These third-party services may include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Google Analytics</li>
                <li>Stripe (for payment processing)</li>
                <li>Intercom (for customer support)</li>
              </ul>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Most web browsers allow you to control cookies through their settings preferences.
                However, if you limit the ability of websites to set cookies, you may worsen your
                overall user experience.
              </p>
              <p>To manage cookies, you can:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Adjust your browser settings to refuse cookies</li>
                <li>Delete cookies that have already been set</li>
                <li>Set your browser to notify you before cookies are set</li>
              </ul>
              <p className="mt-4">
                For more information about managing cookies in specific browsers, visit the browser's
                help pages or visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.allaboutcookies.org</a>.
              </p>
            </div>
          </section>

          {/* Do Not Track */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Do Not Track Signals</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit
                that you do not want your online activity tracked. Our Service currently does not respond
                to DNT signals.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may update this Cookie Policy from time to time. We will notify you of any changes
                by posting the new Cookie Policy on this page and updating the "Effective date."
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about our use of cookies, please contact us at:<br />
              <strong>Email:</strong> <a href="mailto:hello@axolop.com" className="text-blue-600 hover:underline">hello@axolop.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
