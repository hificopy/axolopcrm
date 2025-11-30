import { useEffect } from 'react';
import { Link } from 'react-router-dom';

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
            <Link to="/" className="text-[#3F0D28] hover:underline text-sm mb-4 inline-block">&larr; Back to Home</Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Revised:</strong> November 26, 2025</p>
              <p><strong>Effective date:</strong> November 26, 2025</p>
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

          {/* Third-Party Form Submissions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Form Submissions and Data Controller Roles</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop provides a platform that allows businesses and organizations ("Platform Users") to create forms, surveys,
                booking pages, and other data collection tools. When you submit information through a form, survey, or booking page
                created by a Platform User, please be aware of the following:
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
                <h3 className="font-semibold text-amber-800 mb-2">Important: Data Controller Distinction</h3>
                <ul className="list-disc list-inside space-y-2 text-amber-900">
                  <li>
                    <strong>The Platform User (the business or organization that created the form)</strong> is the Data Controller
                    for information you submit. They determine how your data will be used and are responsible for their own privacy practices.
                  </li>
                  <li>
                    <strong>Axolop acts as a Data Processor</strong> - we process and store data on behalf of Platform Users but do not
                    control how that data is ultimately used by them.
                  </li>
                </ul>
              </div>

              <p>
                When you interact with forms, booking pages, or other data collection tools powered by Axolop, your data is shared
                with the Platform User who created that tool. We encourage you to review the Platform User's privacy policy to
                understand how they will use your information.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Auto-Capture of Form Data</h3>
              <p>
                <strong>By interacting with any form, survey, or booking page powered by Axolop, you consent to the collection and
                processing of your data.</strong> Data may be captured as you type and interact with form fields, even before you
                click "Submit" or complete the form. This auto-capture functionality:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Prevents data loss if you accidentally close your browser or navigate away</li>
                <li>Allows Platform Users to follow up with visitors who showed interest but didn't complete submission</li>
                <li>Enables a seamless booking and scheduling experience</li>
                <li>Helps improve form completion rates and user experience</li>
              </ul>
            </div>
          </section>

          {/* Platform User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform User Responsibilities</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you are a Platform User (a business or organization using Axolop to collect data from your customers, leads,
                or visitors), you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are the Data Controller for all data collected through forms, surveys, and booking pages you create</li>
                <li>You are responsible for obtaining appropriate consent from individuals whose data you collect</li>
                <li>You must comply with all applicable data protection laws, including GDPR, CCPA, and other relevant regulations</li>
                <li>You must provide your own privacy notice to individuals whose data you collect</li>
                <li>You must have a valid legal basis for collecting and processing personal data</li>
                <li>You must not use Axolop to collect sensitive personal data without appropriate safeguards</li>
                <li>You are responsible for responding to data subject requests (access, deletion, etc.) from individuals whose data you collect</li>
              </ul>
            </div>
          </section>

          {/* Form Respondent Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rights for Form Respondents</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you have submitted information through a form, survey, or booking page powered by Axolop, you have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Right to access:</strong> You may request information about what data has been collected about you
                </li>
                <li>
                  <strong>Right to rectification:</strong> You may request correction of inaccurate data
                </li>
                <li>
                  <strong>Right to deletion:</strong> You may request deletion of your data (subject to legal retention requirements)
                </li>
                <li>
                  <strong>Right to object:</strong> You may object to certain processing of your data
                </li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="text-blue-800">
                  <strong>How to exercise your rights:</strong> For data collected through a specific form or booking page,
                  please contact the Platform User (the business or organization that created the form) directly. They are
                  responsible for handling your data rights requests. If you are unable to identify or reach the Platform User,
                  you may contact us at <a href="mailto:hello@axolop.com" className="text-[#3F0D28] hover:underline">hello@axolop.com</a> and
                  we will assist in facilitating your request.
                </p>
              </div>
            </div>
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

          {/* Email Marketing and Communications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Marketing and Communications</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service includes email marketing features that allow Platform Users to send emails, newsletters, and marketing
                campaigns to their contacts. When you receive an email sent through our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The Platform User who sent the email is responsible for obtaining your consent and complying with applicable anti-spam laws</li>
                <li>You may opt out of receiving further emails by using the unsubscribe link included in each email</li>
                <li>We may track email opens, clicks, and other engagement metrics on behalf of Platform Users</li>
                <li>Your email address and engagement data is shared with the Platform User who sent the email</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Compliance with Anti-Spam Laws</h3>
              <p>
                Platform Users are required to comply with all applicable anti-spam laws including CAN-SPAM (US), CASL (Canada),
                GDPR (EU), and other relevant regulations. Axolop provides tools to help with compliance but is not responsible for
                Platform Users' failure to comply with these laws.
              </p>
            </div>
          </section>

          {/* Call Recording and AI Transcription */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Call Recording and AI Features</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service includes calling features that may involve call recording and AI-powered transcription. When participating
                in calls made through our platform:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Call Recording</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Calls may be recorded for quality assurance, training, or record-keeping purposes</li>
                <li>Platform Users are responsible for obtaining consent from all parties before recording calls</li>
                <li>Recording laws vary by jurisdiction; Platform Users must comply with applicable laws</li>
                <li>Call recordings are stored securely and accessible only to authorized parties</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">AI Transcription and Analysis</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Calls may be transcribed using AI technology</li>
                <li>AI may analyze call content to generate summaries, action items, and insights</li>
                <li>AI-generated content is provided "as is" and may contain errors or inaccuracies</li>
                <li>Transcriptions and AI-generated content are shared with the Platform User who initiated the call</li>
              </ul>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <p className="text-amber-800">
                  <strong>Important:</strong> AI transcription may not capture all nuances of conversation, may misinterpret
                  accents or technical terminology, and should not be relied upon as the sole record of a conversation.
                  Users should review and verify AI-generated content before acting on it.
                </p>
              </div>
            </div>
          </section>

          {/* AI and Local Second Brain */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Features and Local Second Brain</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service incorporates artificial intelligence features including a "Local AI Second Brain" for knowledge management,
                lead scoring, and intelligent assistance. Regarding these AI features:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Data Processing:</strong> AI features may process your data to provide personalized insights and recommendations</li>
                <li><strong>Privacy-Focused Design:</strong> Our Local AI Second Brain is designed with privacy in mind, processing data locally where possible</li>
                <li><strong>Lead Scoring:</strong> AI-powered lead scoring analyzes data to prioritize prospects; results are estimates and not guarantees</li>
                <li><strong>Content Generation:</strong> AI may generate content suggestions, summaries, or recommendations</li>
                <li><strong>No Warranty:</strong> AI-generated outputs are provided "as is" without warranty of accuracy or fitness for purpose</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">AI Training and Improvement</h3>
              <p>
                We may use anonymized and aggregated data to improve our AI models and Service. We do not use your identifiable
                personal data to train AI models without your explicit consent.
              </p>
            </div>
          </section>

          {/* Third-Party Integrations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Integrations</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service integrates with various third-party services to provide enhanced functionality. When you connect
                third-party services to your Axolop account:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Data may be shared between Axolop and the third-party service according to your integration settings</li>
                <li>Third-party services are governed by their own privacy policies and terms of service</li>
                <li>We are not responsible for the privacy practices of third-party services</li>
                <li>You may disconnect integrations at any time through your account settings</li>
              </ul>

              <p className="mt-4">Common integrations include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Google Calendar:</strong> For scheduling and meeting management</li>
                <li><strong>Gmail:</strong> For email sending and synchronization</li>
                <li><strong>Stripe:</strong> For payment processing</li>
                <li><strong>SendGrid:</strong> For email delivery</li>
                <li><strong>Twilio:</strong> For calling and SMS features</li>
              </ul>
            </div>
          </section>

          {/* SMS and Text Messaging */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SMS and Text Messaging</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service may include SMS and text messaging capabilities. When using these features:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Platform Users are responsible for obtaining proper consent before sending text messages</li>
                <li>Message and data rates may apply to recipients</li>
                <li>Recipients may opt out of text messages by replying STOP</li>
                <li>Platform Users must comply with TCPA, CTIA guidelines, and other applicable messaging regulations</li>
                <li>We may retain text message content and metadata for compliance and service provision purposes</li>
              </ul>
            </div>
          </section>

          {/* Proprietary Technology and Data Processing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proprietary Technology and Data Processing</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We use a variety of proprietary technologies, algorithms, and methodologies to process data and deliver our Service.
                The specific technical implementations, including AI models, scoring algorithms, automation engines, and data processing
                methods, constitute confidential trade secrets of Axolop.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Data Processing Methods</h3>
              <p>
                We employ various administrative, technical, and physical safeguards to protect your information. The specific
                mechanisms, encryption methods, and security protocols we use are proprietary and not subject to public disclosure.
                For more information about our security practices, you may contact us, though we reserve the right to limit
                disclosure of security details to protect our systems.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Algorithmic Processing</h3>
              <p>
                Your data may be processed by automated systems, AI models, and machine learning algorithms to provide
                personalized features, recommendations, and insights. We do not disclose the specific logic, weighting, or
                methodology of these systems, as such information is proprietary.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Device Trust and Fraud Prevention</h3>
              <p>
                We may collect device information and generate trust scores or signals to prevent fraud, abuse, and unauthorized
                access. The factors used to generate these scores and the algorithmic methodology are proprietary.
              </p>
            </div>
          </section>

          {/* Data Retention Practices */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention Practices</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We retain your personal data only for the shortest period permissible under applicable law and consistent with
                our legitimate business purposes. Retention periods vary based on the type of data, the purposes for which it
                was collected, and legal requirements.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Retention Criteria</h3>
              <p>In determining appropriate retention periods, we consider:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The nature and sensitivity of the data</li>
                <li>The purposes for which we process the data</li>
                <li>Applicable legal, regulatory, tax, accounting, or reporting requirements</li>
                <li>Whether we can achieve the purposes through other means</li>
                <li>The risk of harm from unauthorized use or disclosure</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Aggregated and Anonymized Data</h3>
              <p>
                We may retain aggregated or anonymized data that cannot reasonably identify you for longer periods for
                research, analytics, and service improvement purposes. Such data is not subject to the same retention
                limitations as personal data.
              </p>
            </div>
          </section>

          {/* Platform Integration and Data Sharing Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Integration and Data Sharing Limitations</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop is designed as an integrated, unified platform. Data sharing with external platforms and services is
                limited to protect your information and maintain the integrity of our ecosystem.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Integration Restrictions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>External API access and data exports are limited based on your subscription tier</li>
                <li>Bulk data exports may be restricted or require enterprise agreements</li>
                <li>Real-time data synchronization with external platforms requires approved integrations</li>
                <li>We may limit the frequency, volume, or format of data exports to protect system integrity</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">No Sale of Personal Data</h3>
              <p>
                Axolop does not sell your personal data. We also do not "share" your personal data as that term is defined
                under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), except as
                necessary to provide the Service with your approved integrations.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Service Provider Access</h3>
              <p>
                We may share data with service providers who act on our behalf to deliver the Service. These providers
                have limited access necessary to perform their functions and are contractually prohibited from using
                your data for other purposes.
              </p>
            </div>
          </section>

          {/* Operational Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Operational Data Collection</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                In addition to the information described elsewhere in this policy, we may collect a variety of operational
                data to maintain, secure, and improve the Service.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Technical and Diagnostic Data</h3>
              <p>This may include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>System performance and diagnostic information</li>
                <li>Error logs and crash reports</li>
                <li>Feature usage patterns and interaction data</li>
                <li>Network and connection information</li>
                <li>Browser and device configuration data</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Internal Analysis</h3>
              <p>
                We use data for internal purposes such as auditing, data analysis, and research to improve the Service.
                These internal processes are proprietary, and we do not disclose the specific analytical methods or
                findings except as required by law.
              </p>
            </div>
          </section>

          {/* Legal Basis for Processing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Basis for Processing</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Axolop uses personal data only when we have a valid legal basis to do so. We rely on the following
                legal bases for processing:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Consent:</strong> Where you have given clear consent for us to process your personal data for
                  a specific purpose
                </li>
                <li>
                  <strong>Contract:</strong> Where processing is necessary for the performance of a contract with you
                  or to take steps at your request before entering into a contract
                </li>
                <li>
                  <strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate interests or
                  the legitimate interests of a third party, unless there is a good reason to protect your personal data
                  which overrides those legitimate interests
                </li>
                <li>
                  <strong>Legal Obligation:</strong> Where processing is necessary for compliance with a legal obligation
                </li>
              </ul>
              <p className="mt-4">
                Our legitimate interests include operating and improving the Service, protecting against fraud and abuse,
                ensuring security, marketing and communications, and conducting research and analytics.
              </p>
            </div>
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

          {/* California Privacy Rights - CCPA/CPRA */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">California Privacy Rights (CCPA/CPRA)</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA)
                as amended by the California Privacy Rights Act (CPRA).
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Your California Rights</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right to Know:</strong> You can request disclosure of the categories and specific pieces of personal information we have collected about you</li>
                <li><strong>Right to Delete:</strong> You can request deletion of your personal information, subject to certain exceptions</li>
                <li><strong>Right to Correct:</strong> You can request correction of inaccurate personal information</li>
                <li><strong>Right to Opt-Out of Sale/Sharing:</strong> You can opt out of the sale or sharing of your personal information for cross-context behavioral advertising</li>
                <li><strong>Right to Limit Use of Sensitive Information:</strong> You can limit how we use and disclose your sensitive personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Do Not Sell or Share My Personal Information</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-2">
                <p className="text-blue-800">
                  <strong>Axolop does not sell your personal information.</strong> We also do not "share" your personal information
                  for cross-context behavioral advertising as defined under CPRA.
                </p>
              </div>
              <p className="mt-4">
                To opt out of any future sale or sharing, you can:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Click the "Do Not Sell or Share My Personal Information" link in our website footer</li>
                <li>Enable Global Privacy Control (GPC) in your browser - we honor GPC signals</li>
                <li>Email us at <a href="mailto:privacy@axolop.com" className="text-[#3F0D28] hover:underline">privacy@axolop.com</a></li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Sensitive Personal Information</h3>
              <p>
                Under CPRA, "sensitive personal information" includes social security numbers, financial account information,
                precise geolocation, racial or ethnic origin, and other categories. We may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account login credentials (for authentication purposes only)</li>
                <li>Precise geolocation (only with your explicit consent for location-based features)</li>
              </ul>
              <p className="mt-2">
                You can request that we limit the use of your sensitive personal information to what is necessary for providing the services.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Categories of Information Collected</h3>
              <p>In the past 12 months, we have collected the following categories of personal information:</p>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold border-b">Category</th>
                      <th className="px-4 py-2 text-left font-semibold border-b">Collected</th>
                      <th className="px-4 py-2 text-left font-semibold border-b">Sold/Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">Identifiers (name, email, phone)</td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">No</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Commercial information</td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">No</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Internet/network activity</td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">No</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Geolocation data</td>
                      <td className="px-4 py-2">With consent</td>
                      <td className="px-4 py-2">No</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Professional/employment info</td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">No</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Inferences drawn</td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Sensitive personal information</td>
                      <td className="px-4 py-2">Limited</td>
                      <td className="px-4 py-2">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Financial Incentives</h3>
              <p>
                We do not offer financial incentives or price/service differences in exchange for the retention or sale
                of your personal information.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Authorized Agents</h3>
              <p>
                You may designate an authorized agent to make requests on your behalf. Authorized agents must provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Written permission signed by you</li>
                <li>Proof of the agent's identity</li>
                <li>Verification of your identity</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Response Timing</h3>
              <p>
                We will respond to verifiable consumer requests within 45 days. If we need additional time (up to 90 days total),
                we will notify you of the extension and explain the reason.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">"Shine the Light" Law</h3>
              <p>
                California Civil Code Section 1798.83 permits California residents to request information about disclosure
                of personal information to third parties for direct marketing. As we do not disclose personal information
                to third parties for their direct marketing purposes, this does not apply.
              </p>
            </div>
          </section>

          {/* US State Privacy Laws */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Other US State Privacy Laws</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                In addition to California, several other states have enacted comprehensive privacy laws. If you are a
                resident of the following states, you may have additional rights:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Virginia (VCDPA)</h3>
              <p>Virginia residents have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and obtain a copy of your personal data</li>
                <li>Delete your personal data</li>
                <li>Correct inaccuracies in your personal data</li>
                <li>Opt out of targeted advertising, sale of personal data, and profiling</li>
                <li>Appeal our decision regarding your request</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Colorado (CPA)</h3>
              <p>Colorado residents have similar rights including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to access, correct, and delete personal data</li>
                <li>Right to data portability</li>
                <li>Right to opt out of targeted advertising and sale of personal data</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Connecticut (CTDPA)</h3>
              <p>Connecticut residents have rights including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access, correction, and deletion rights</li>
                <li>Data portability</li>
                <li>Opt-out of sale, targeted advertising, and profiling</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Utah (UCPA)</h3>
              <p>Utah residents have rights including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and deletion of personal data</li>
                <li>Data portability</li>
                <li>Opt-out of sale and targeted advertising</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Texas (TDPSA - Effective July 2024)</h3>
              <p>Texas residents have rights including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access, correct, delete, and obtain a copy of personal data</li>
                <li>Opt out of sale, targeted advertising, and profiling</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Oregon (OCPA - Effective July 2024)</h3>
              <p>Oregon residents have rights including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access, correction, deletion, and portability rights</li>
                <li>Opt-out of sale, targeted advertising, and profiling</li>
                <li>Right to know the specific third parties to whom data was disclosed</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Montana (MCDPA - Effective October 2024)</h3>
              <p>Montana residents have similar rights to other state laws.</p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Delaware (DPDPA - Effective January 2025)</h3>
              <p>Delaware residents have similar rights to other state laws.</p>

              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mt-4">
                <p className="text-gray-700">
                  <strong>How to Exercise Your Rights:</strong> Regardless of your state, you can exercise your privacy
                  rights by emailing <a href="mailto:privacy@axolop.com" className="text-[#3F0D28] hover:underline">privacy@axolop.com</a> or
                  using the privacy controls in your account settings. We honor the same high standards for all users.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Appeals Process</h3>
              <p>
                If we decline to take action on your request, you have the right to appeal. To appeal, email us at
                privacy@axolop.com with "Privacy Appeal" in the subject line. We will respond within 60 days. If your
                appeal is denied, you may contact your state's Attorney General.
              </p>
            </div>
          </section>

          {/* Data Access Request Procedures */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Access Request Procedures</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you wish to exercise your data protection rights, please follow these procedures:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Verification Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We may require verification of your identity before processing data access requests</li>
                <li>Requests must be submitted through official channels (email to hello@axolop.com or account settings)</li>
                <li>We may request additional information to verify you are authorized to make the request</li>
                <li>Requests made on behalf of another person require proof of authorization</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Response Timeframes</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We will acknowledge receipt of your request within 5 business days</li>
                <li>We will respond to valid requests within 30 days (or as required by applicable law)</li>
                <li>Complex requests may require up to 90 days with notice to you</li>
                <li>Manifestly unfounded or excessive requests may be refused or charged a reasonable fee</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Limitations on Data Access</h3>
              <p>
                We may be unable to comply with certain requests if doing so would:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate the privacy rights of another person</li>
                <li>Require disclosure of confidential business information or trade secrets</li>
                <li>Conflict with legal obligations or ongoing legal proceedings</li>
                <li>Interfere with fraud detection or prevention efforts</li>
              </ul>
            </div>
          </section>

          {/* Communication Monitoring */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication Monitoring and Recording</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                To maintain quality and security, we may monitor or record communications through our Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Customer support interactions may be recorded for quality assurance and training purposes</li>
                <li>We may monitor usage patterns to detect fraud, abuse, or violations of our Terms</li>
                <li>Automated systems may scan content to detect spam, malware, or prohibited content</li>
                <li>We may retain communication metadata for analytics and service improvement</li>
              </ul>

              <p className="mt-4">
                By using the Service, you consent to such monitoring and recording to the extent permitted by applicable law.
                If you do not consent, do not use the Service.
              </p>
            </div>
          </section>

          {/* Cross-Border Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cross-Border Data Transfers</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Your data may be transferred to and processed in countries other than your country of residence.
                These countries may have different data protection laws than your jurisdiction.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Transfer Mechanisms</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We use Standard Contractual Clauses (SCCs) approved by the European Commission for transfers from the EEA</li>
                <li>We may rely on adequacy decisions where applicable</li>
                <li>Data may be transferred to service providers in the United States and other countries</li>
                <li>We implement appropriate safeguards to protect transferred data</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Data Location</h3>
              <p>
                We may migrate your account and data across cloud facilities and data centers based on geographic mapping,
                operational requirements, or service optimization. Such migration may occur without specific notice to you,
                though we maintain appropriate safeguards regardless of data location.
              </p>
            </div>
          </section>

          {/* Marketing Preferences */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketing Preferences and Opt-Out</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You have control over the marketing communications you receive from us:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Types of Communications</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Transactional:</strong> Service-related messages (account alerts, billing, security) - these cannot be opted out</li>
                <li><strong>Product Updates:</strong> New feature announcements and product news</li>
                <li><strong>Marketing:</strong> Promotional content, offers, and newsletters</li>
                <li><strong>Research:</strong> Surveys, feedback requests, and user research</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Managing Preferences</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Update preferences in your account settings</li>
                <li>Click "unsubscribe" in any marketing email</li>
                <li>Contact us at hello@axolop.com</li>
                <li>Opt-out requests are processed within 10 business days</li>
              </ul>

              <p className="mt-4">
                Please note that even if you opt out of marketing communications, you will continue to receive
                transactional and service-related communications necessary for your use of the Service.
              </p>
            </div>
          </section>

          {/* Data Portability and Migration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Portability and Migration Limitations</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                You may request a copy of your data in a portable format, subject to certain limitations:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Available Export Formats</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact and lead data: CSV, JSON</li>
                <li>Activity history: CSV</li>
                <li>Email templates and content: HTML</li>
                <li>Form submissions: CSV, JSON</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Export Limitations</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Some data formats are proprietary and may not be fully portable</li>
                <li>Workflow configurations, automations, and custom integrations may not be exportable</li>
                <li>Historical analytics and reporting data may have limited export options</li>
                <li>Export frequency and volume may be limited based on your subscription tier</li>
                <li>API access for bulk exports requires Enterprise plan or written authorization</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Migration Assistance</h3>
              <p>
                We do not provide migration assistance to competing platforms. Data exports are provided in
                standard formats, but we are not responsible for compatibility with third-party services.
              </p>
            </div>
          </section>

          {/* Automated Decision Making */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Automated Decision Making</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our Service uses automated systems to make certain decisions that may affect you:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Types of Automated Decisions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Lead Scoring:</strong> AI algorithms analyze lead data to predict conversion likelihood</li>
                <li><strong>Spam Detection:</strong> Automated systems filter spam and malicious content</li>
                <li><strong>Fraud Prevention:</strong> Automated risk scoring to detect suspicious activity</li>
                <li><strong>Content Recommendations:</strong> AI suggests relevant content and actions</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Your Rights</h3>
              <p>
                Where required by applicable law (such as GDPR), you may have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Request information about the logic involved in automated decisions</li>
                <li>Request human review of significant automated decisions</li>
                <li>Express your point of view and contest decisions</li>
              </ul>

              <p className="mt-4">
                Note that certain automated decisions are necessary for the provision of the Service and may not
                be subject to the same rights (e.g., fraud detection that protects all users).
              </p>
            </div>
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

          {/* Data Processors and Sub-Processors */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Processors and Sub-Processors</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We engage external service providers (data processors) to help deliver the Service. These processors
                operate under data processing agreements that require them to protect your data and limit its use.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Current Sub-Processors</h3>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold border-b">Service</th>
                      <th className="px-4 py-2 text-left font-semibold border-b">Location</th>
                      <th className="px-4 py-2 text-left font-semibold border-b">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">Supabase</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Database and Authentication</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">SendGrid (Twilio)</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Email Delivery</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Twilio</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">SMS and Voice Communications</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Stripe</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Payment Processing</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Google Cloud</td>
                      <td className="px-4 py-2">USA/EU</td>
                      <td className="px-4 py-2">Calendar Integration, Analytics</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">OpenAI</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">AI Features</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Vercel</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Website Hosting</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Redis</td>
                      <td className="px-4 py-2">USA</td>
                      <td className="px-4 py-2">Caching and Sessions</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                This list may be updated as we add or change service providers. We maintain data processing agreements
                with all processors and implement appropriate safeguards for international data transfers.
              </p>
            </div>
          </section>

          {/* Funnel and Form Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Funnel and Form Data Collection Specifics</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                When you interact with forms, funnels, or landing pages created by Axolop users, specific data
                collection practices apply:
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Real-Time Data Capture</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Form field data is captured as you type, before form submission</li>
                <li>Email addresses and phone numbers are saved when you interact with those fields</li>
                <li>Partial form data is retained even if you do not complete or submit the form</li>
                <li>This enables form owners to follow up with interested visitors</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Session Tracking</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We use session-based tracking to monitor your progress through funnels</li>
                <li>Session data is temporary and linked to your current browser session</li>
                <li>Without additional consent, session data is not linked to persistent user profiles</li>
                <li>Analytics data may be aggregated and anonymized for reporting purposes</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">Lead Segregation</h3>
              <p>
                Contact information collected through forms is stored separately from general website analytics.
                This data is managed in dedicated CRM infrastructure accessible only to the form owner (Platform User)
                and Axolop as the data processor.
              </p>
            </div>
          </section>

          {/* Data Retention Schedule */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention Schedule</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We retain different types of data for different periods based on their purpose:
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold border-b">Data Type</th>
                      <th className="px-4 py-2 text-left font-semibold border-b">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">Server Log Files</td>
                      <td className="px-4 py-2">7 days</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Session Data</td>
                      <td className="px-4 py-2">24 hours after session end</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Analytics Data</td>
                      <td className="px-4 py-2">26 months</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Account Data</td>
                      <td className="px-4 py-2">Duration of account + 12 months</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Lead/Contact Data</td>
                      <td className="px-4 py-2">Until deleted by user or account termination + 6 months</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Email Campaign Data</td>
                      <td className="px-4 py-2">Duration of account + 6 months</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Call Recordings</td>
                      <td className="px-4 py-2">90 days (unless extended by user)</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-2">Billing Records</td>
                      <td className="px-4 py-2">7 years (legal requirement)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">Support Tickets</td>
                      <td className="px-4 py-2">3 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Data is deleted automatically after the retention period expires, unless legal obligations require
                longer retention or you have requested earlier deletion.
              </p>
            </div>
          </section>

          {/* Supervisory Authority */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Supervisory Authority and Complaints</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you believe we have violated your data protection rights, you have the right to lodge a complaint
                with a supervisory authority.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">For EU/EEA Residents</h3>
              <p>
                You may contact your local data protection authority. A list of EU data protection authorities is
                available at: <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" className="text-[#3F0D28] hover:underline" target="_blank" rel="noopener noreferrer">https://edpb.europa.eu/about-edpb/about-edpb/members_en</a>
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">For UK Residents</h3>
              <p>
                You may contact the Information Commissioner's Office (ICO) at: <a href="https://ico.org.uk" className="text-[#3F0D28] hover:underline" target="_blank" rel="noopener noreferrer">https://ico.org.uk</a>
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">For US Residents</h3>
              <p>
                You may contact your state's Attorney General office or, for California residents, the California
                Attorney General at: <a href="https://oag.ca.gov/privacy" className="text-[#3F0D28] hover:underline" target="_blank" rel="noopener noreferrer">https://oag.ca.gov/privacy</a>
              </p>

              <p className="mt-4">
                We encourage you to contact us first at hello@axolop.com so we can address your concerns directly.
              </p>
            </div>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:<br />
              <strong>Email:</strong> <a href="mailto:hello@axolop.com" className="text-[#3F0D28] hover:underline">hello@axolop.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
