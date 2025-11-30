import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from 'lucide-react';

/**
 * Footer navigation links
 */
const FOOTER_LINKS = {
  useCases: {
    title: 'Use Cases',
    links: [
      { name: 'Insurance Agencies', href: '/use-cases/insurance' },
      { name: 'Call Centers', href: '/use-cases/call-centers' },
      { name: 'Marketing Agencies', href: '/use-cases/marketing-agencies' },
      { name: 'Real Estate', href: '/use-cases/real-estate' },
      { name: 'B2B Sales', href: '/use-cases/b2b-sales' },
      { name: 'Consulting Firms', href: '/use-cases/consulting' },
    ],
  },
  product: {
    title: 'Product',
    links: [
      { name: 'Features', href: '/features/leads' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Integrations', href: '/integrations' },
      { name: 'Roadmap', href: '/roadmap' },
      { name: 'Status', href: '/status' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Academy', href: '/academy' },
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Blog', href: '/blog' },
      { name: 'Changelog', href: '/changelog' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Affiliate Program', href: '/affiliate-program' },
      { name: 'Careers', href: '/careers' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  },
};

/**
 * Social media links
 */
const SOCIAL_LINKS = [
  { name: 'Twitter', href: 'https://twitter.com/axolopcrm', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/axolop', icon: Linkedin },
  { name: 'YouTube', href: 'https://youtube.com/@axolop', icon: Youtube },
  { name: 'Instagram', href: 'https://instagram.com/axolopcrm', icon: Instagram },
  { name: 'Facebook', href: 'https://facebook.com/axolopcrm', icon: Facebook },
];

// Axolop Logo Image
const AxolopLogo = ({ className }) => (
  <img
    src="/LOGO/transparent-logo.png"
    alt="Axolop Logo"
    className={className}
  />
);

/**
 * FooterSection - Enhanced footer for landing pages
 */
const FooterSection = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'relative pt-20 pb-10 overflow-hidden',
        'bg-black',
        'border-t border-gray-800/50',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo and description */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <AxolopLogo className="w-10 h-10" />
              <span className="text-xl font-bold text-white">Axolop</span>
            </Link>
            <p className="text-sm text-gray-500 mb-4">
              The New Age CRM with Local AI Second Brain for agency owners.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label={social.name}
                  >
                    <SocialIcon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation columns */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-500">
              {currentYear} Axolop. All rights reserved.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                GDPR Ready
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
                SOC 2
              </div>
            </div>

            {/* Language / Region - placeholder */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>English</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
