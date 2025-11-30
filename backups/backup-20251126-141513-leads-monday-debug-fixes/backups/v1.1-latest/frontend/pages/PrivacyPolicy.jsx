import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Revised:</strong> January 19, 2025</p>
              <p><strong>Effective date:</strong> January 19, 2025</p>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Welcome to Axolop.</p>
              <p>
                Axolop, which refers to us as "us," "we," or "our," is the operator of https://axolop.com,
                which we will refer to as the "Service" from here on.
              </p>
              <p>
                Our Privacy Policy is in place to govern your visit to the Service, and it outlines how we collect,
                protect, and disclose information that is a result of your use of our Service.
              </p>
              <p>
                To provide and enhance our Service, we use the data you provide us. By utilizing our Service,
                you agree to the collection and use of your information in accordance with our Privacy Policy.
                The terms used in this policy have the same meanings as those in our Terms and Conditions,
                unless defined otherwise in the Privacy Policy.
              </p>
              <p>
                Our Terms and Conditions (referred to as "Terms") are responsible for governing all use of our Service.
                Together with our Privacy Policy, these documents form your agreement with us.
              </p>
            </div>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Definitions</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>SERVICE</strong> refers to the website https://axolop.com, which is operated by Axolop.
              </p>
              <p>
                <strong>PERSONAL DATA</strong> refers to any information that pertains to an identified or identifiable
                living individual. This includes data that we already possess or that we may obtain in the future.
              </p>
              <p>
                <strong>COOKIES</strong> are small files that are stored on your computer or mobile device.
              </p>
              <p>
                <strong>DATA CONTROLLER</strong> refers to the natural or legal person who determines the purposes and
                methods of processing Personal Data. In this Privacy Policy, we serve as the Data Controller of your data.
              </p>
              <p>
                <strong>DATA PROCESSORS (OR SERVICE PROVIDERS)</strong> refers to any natural or legal person who processes
                data on behalf of the Data Controller. We may utilize various Service Providers to more efficiently process your data.
              </p>
              <p>
                <strong>DATA SUBJECT</strong> refers to any living individual who is the subject of Personal Data.
              </p>
              <p>
                <strong>THE USER</strong> refers to the individual who uses our Service. The User is equivalent to the Data Subject
                who is the subject of Personal Data.
              </p>
            </div>
          </section>

          {/* Information Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Collection and Use</h2>
            <p className="text-gray-700 mb-4">To enhance our services, we gather various forms of information for different objectives.</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Data</h3>
            <p className="text-gray-700 mb-4">
              While using our Service, we may collect personally identifiable information ("Personal Data") to contact or
              identify you, such as your email address and phone number. Specifically, when you enter your email address or
              phone number into the input field on our Service (including booking forms, lead capture forms, and meeting schedulers),
              we capture it immediately as you interact with the field. We may use this Personal Data to send newsletters,
              marketing materials, or other communications, which you can opt out of by emailing hello@axolop.com.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">How We Collect Personal Information</h3>
            <p className="text-gray-700 mb-2">We gather information you provide when you:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Visit our website or use our Service</li>
              <li>Register for an account or a membership</li>
              <li>Communicate with us via form interactions</li>
              <li>Enter your email or phone number in our scheduler, booking, or lead capture forms</li>
              <li>Interact with any input fields on our forms or surveys</li>
            </ul>

            <p className="text-gray-700 mb-2 mt-4">We obtain information from:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Business customers implementing our Service</li>
              <li>Data analytics, marketing, advertising, or fraud prevention providers</li>
              <li>Vendors offering security, onboarding, or other services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
              Legitimate Interest in Capturing Contact Information
            </h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Important:</strong> In certain cases, we store information such as your email address or phone number
                when you enter it into a form field and interact with that field, <strong>even before you click submit or complete
                the form</strong>. This means your data is captured and saved as you type and move between form fields, not requiring
                form submission. This allows us to preserve your information in case of accidental page closure, browser crashes,
                or navigation away from the form, ensuring you don't lose your progress. We process this information under our
                legitimate interest to ensure scheduling continuity, reduce data loss, enhance the user experience, and allow our
                users to follow up with potential leads who showed interest but didn't complete the submission.
              </p>
              <p className="text-gray-700 mt-3">
                The information is securely stored and used solely for the purpose of continuing or completing the intended
                interaction, and to enable our users to reach out to interested parties. You may request deletion of any saved
                information at any time by contacting us through the channels provided in this policy.
              </p>
            </div>
          </section>

          {/* Cookies and Usage Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Usage Data</h2>
            <p className="text-gray-700 mb-4">
              We may use your Personal Data to provide you with information that may be of interest to you, including newsletters,
              marketing or promotional materials, and other communications. If you no longer wish to receive these communications,
              you may unsubscribe by following the link provided in the communication or by contacting us at hello@axolop.com.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Usage Data</h3>
            <p className="text-gray-700 mb-2">
              In addition, we may collect Usage Data, which is automatically generated by your use of our Service or from our
              infrastructure. This Usage Data may include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Your computer's IP address, browser type, browser version</li>
              <li>Pages visited on our Service</li>
              <li>Time and date of your visit</li>
              <li>Time spent on each page</li>
              <li>Unique device identifiers and other diagnostic data</li>
            </ul>

            <p className="text-gray-700 mb-2">
              If you access our Service through a mobile device, the Usage Data collected may also include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>The type of mobile device you use</li>
              <li>Your mobile device's unique ID</li>
              <li>Your mobile device's IP address</li>
              <li>Your mobile operating system</li>
              <li>The type of mobile Internet browser you use</li>
              <li>Unique device identifiers and other diagnostic data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Tracking Cookies Data</h3>
            <p className="text-gray-700 mb-4">
              We use cookies and other tracking technologies to monitor the activity on our Service and to store certain information.
              Cookies are small files with a unique identifier that are sent to your browser from a website and stored on your device.
              Other tracking technologies, such as beacons, tags, and scripts, are also used to collect and analyze information and
              improve our Service.
            </p>
            <p className="text-gray-700 mb-4">
              You can choose to disable cookies or be notified when a cookie is being sent through your browser settings. However,
              some parts of our Service may not function properly if you choose to disable cookies.
            </p>

            <p className="text-gray-700 mb-2">Examples of Cookies we use include:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Session Cookies:</strong> Used to operate our Service</li>
              <li><strong>Preference Cookies:</strong> Used to remember your preferences and settings</li>
              <li><strong>Security Cookies:</strong> Used for security purposes</li>
              <li><strong>Advertising Cookies:</strong> Used to provide advertisements that may be relevant to your interests</li>
            </ul>
          </section>

          {/* Use of Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Use of Data</h2>
            <p className="text-gray-700 mb-2">Axolop uses the data collected for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To provide and maintain our Service</li>
              <li>To notify you about any changes to our Service</li>
              <li>To enable you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To analyze and gather valuable information that helps us improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To fulfill any other purpose for which you have provided the data</li>
              <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including billing and collection</li>
              <li>To provide you with notices related to your account and/or subscription, including expiration and renewal notices, email-instructions, etc.</li>
              <li>To provide you with news, special offers, and general information about other goods, services, and events that we offer and that are similar to those that you have already purchased or enquired about, unless you have opted not to receive such information</li>
              <li>To enable our users to follow up with leads who showed interest by entering information in forms, even if they didn't submit</li>
              <li>To use the data in any other way described when you provided the information</li>
              <li>To use the data for any other purpose with your consent</li>
            </ul>
          </section>

          {/* Retention and Transfer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Retention and Transfer of Data</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We will keep your Personal Data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy.
              </p>
              <p>
                We will hold and use your Personal Data only to the extent required to comply with our legal obligations, resolve disputes,
                and enforce our legal agreements and policies.
              </p>
              <p>
                We may retain Usage Data for internal analysis purposes. This data is generally held for a shorter period, except when it
                is necessary to improve the functionality or strengthen the security of our Service, or we are legally obligated to keep
                this data for a longer time.
              </p>
              <p>
                Your information, including Personal Data, may be transferred to and stored on computers located outside your state, province,
                country, or other governmental jurisdiction. The data protection laws in these locations may differ from those in your jurisdiction.
              </p>
              <p>
                If you are located outside of the United States and provide us with information, please be aware that we will transfer and
                process the data, including Personal Data, in the United States.
              </p>
              <p>
                By consenting to this Privacy Policy and submitting your information, you agree to this transfer.
              </p>
              <p>
                Axolop will take all reasonable steps necessary to ensure your data is treated securely and in accordance with this Privacy Policy.
                We will not transfer your Personal Data to any organization or country unless adequate controls are in place, including the
                security of your data and other personal information.
              </p>
            </div>
          </section>

          {/* Disclosure of Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclosure of Data</h2>
            <p className="text-gray-700 mb-4">We may disclose the personal information we collect or you provide:</p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Disclosure for Law Enforcement</h3>
            <p className="text-gray-700 mb-4">
              In certain circumstances, we may be required to disclose your Personal Data if required to do so by law or in response to
              valid requests by public authorities.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Transaction</h3>
            <p className="text-gray-700 mb-4">
              In the event of a merger, acquisition or asset sale, your Personal Data may be transferred.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Other Cases</h3>
            <p className="text-gray-700 mb-2">We may also disclose your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Our subsidiaries and affiliates</li>
              <li>Contractors, service providers, and other third parties we use to support our business</li>
              <li>Fulfill the purpose for which you provide it</li>
              <li>Include your company's logo on our website</li>
              <li>Any other purpose disclosed by us when you provide the information</li>
              <li>With your consent in any other cases</li>
              <li>If we believe disclosure is necessary or appropriate to protect the rights, property, or safety of the Company, our customers, or others</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700">
              We value the security of your data. However, it is important to note that no method of transmission over the internet
              or electronic storage is completely secure. We make every effort to use commercially acceptable methods to protect your
              personal data, but we cannot guarantee its absolute security.
            </p>
          </section>

          {/* Data Protection Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection Rights</h2>
            <p className="text-gray-700 mb-4">
              If you are a resident of the European Union (EU) or European Economic Area (EEA), you are entitled to data protection
              rights covered by the General Data Protection Regulation (GDPR). We take reasonable steps to allow you to correct, amend,
              delete, or limit the use of your personal data. If you wish to know what personal data we hold about you or request its
              removal, please email us at hello@axolop.com.
            </p>

            <p className="text-gray-700 mb-2">In certain circumstances, you have the following data protection rights:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>Right to access, update or delete</strong> the information we have on you</li>
              <li><strong>Right of rectification:</strong> You have the right to have your information rectified if it is inaccurate or incomplete</li>
              <li><strong>Right to object:</strong> You have the right to object to our processing of your personal data</li>
              <li><strong>Right of restriction:</strong> You have the right to request that we restrict the processing of your personal information</li>
              <li><strong>Right to data portability:</strong> You have the right to receive a copy of your personal data in a structured, machine-readable, and commonly used format</li>
              <li><strong>Right to withdraw consent:</strong> You have the right to withdraw your consent at any time where we rely on your consent to process your personal information</li>
            </ul>

            <p className="text-gray-700 mb-4">
              Please note that we may require verification of your identity before responding to such requests. Also, some necessary
              data may be required to provide our service.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">California Consumer Privacy Act (CCPA)</h3>
            <p className="text-gray-700 mb-4">
              If you are a California resident, you have the right to learn about the data we collect about you, ask us to delete your data,
              and prevent us from selling (sharing) your data under the California Consumer Privacy Act (CCPA).
            </p>

            <p className="text-gray-700 mb-2">To exercise these rights, you can request the following:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Personal information we have about you</li>
              <li>Deletion of your personal information</li>
              <li>Stop selling your personal information</li>
            </ul>

            <p className="text-gray-700">
              You can exercise your California data protection rights by sending your request to us. Please note that we will not
              discriminate against you for exercising your rights.
            </p>
          </section>

          {/* Service Providers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Providers</h2>
            <p className="text-gray-700 mb-4">
              We may use third-party companies and individuals as service providers to facilitate our Service, perform Service-related
              tasks on our behalf, or analyze how our Service is used.
            </p>
            <p className="text-gray-700 mb-4">
              These third-party service providers only have access to your Personal Data to perform their duties and are required not
              to disclose or use it for any other purposes.
            </p>
            <p className="text-gray-700">
              We use Google API Services for our Services. You can view their User Data Policy at:
              https://developers.google.com/terms/api-services-user-data-policy
            </p>
          </section>

          {/* Analytics */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
            <p className="text-gray-700">
              We may use third-party Service Providers to monitor and analyze the use of our Service.
            </p>
          </section>

          {/* Payments */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments</h2>
            <p className="text-gray-700 mb-4">
              We may offer paid products and/or services through our Service. In such cases, we use third-party payment processing
              services (e.g., payment processors).
            </p>
            <p className="text-gray-700 mb-4">
              We do not store or collect your payment card details. The information is directly provided to our third-party payment
              processors whose use of your personal information is governed by their Privacy Policy. These payment processors comply
              with the standards established by the PCI Security Standards Council's Payment Card Industry Data Security Standard (PCI-DSS).
              PCI-DSS requirements help ensure the secure handling of payment information.
            </p>
            <p className="text-gray-700 mb-2">The payment processors we work with are:</p>
            <div className="ml-4">
              <p className="text-gray-700 font-semibold">Stripe:</p>
              <p className="text-gray-700">You can view Stripe's Privacy Policy at: https://stripe.com/us/privacy</p>
            </div>
          </section>

          {/* Google Gmail API */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Gmail API Usage</h2>
            <p className="text-gray-700 mb-4">
              We utilize the Google Gmail API solely for the purpose of sending emails from the accounts of our users to individuals
              who book a call with our user. The information accessed through the Google Gmail API is used strictly for email communication
              related to scheduling calls.
            </p>
            <p className="text-gray-700">
              We do not store or use Gmail data for any other purposes, and access is limited to the specific functionality required to
              facilitate email communication as described above.
            </p>
          </section>

          {/* Links to Other Sites */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Links to Other Sites</h2>
            <p className="text-gray-700 mb-4">
              Our Service may contain links to third-party sites that are not operated by us. If you click on a third-party link, you
              will be directed to that site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>
            <p className="text-gray-700">
              We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party
              sites or services.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our Services are not intended for use by individuals under the age of 18 ("Child" or "Children").
            </p>
            <p className="text-gray-700">
              We do not knowingly collect personally identifiable information from children under 18. If you become aware that a Child
              has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from Children
              without verification of parental consent, we take steps to remove that information from our servers.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
            <p className="text-gray-700 mb-4">
              We will inform you via email and/or a prominent notice on our Service before the changes take effect and update the "effective date"
              at the top of this Privacy Policy.
            </p>
            <p className="text-gray-700">
              We recommend that you review this Privacy Policy periodically for any changes. Changes to this Privacy Policy will take effect
              when posted on this page.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:<br />
              <strong>Email:</strong> <a href="mailto:hello@axolop.com" className="text-blue-600 hover:underline">hello@axolop.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
