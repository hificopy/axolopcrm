import { Link } from 'react-router-dom';

/**
 * LegalFooter - Reusable legal footer component for public pages
 * Used in forms, booking pages, and other public-facing content
 *
 * @param {string} variant - 'form' | 'booking' | 'default' - context-specific text
 * @param {boolean} showBranding - whether to show "Powered by Axolop"
 * @param {string} className - additional CSS classes
 * @param {boolean} showConsentText - whether to show the consent statement
 */
export default function LegalFooter({
  variant = 'default',
  showBranding = true,
  className = '',
  showConsentText = true
}) {
  // Context-specific consent text
  const getConsentText = () => {
    switch (variant) {
      case 'form':
        return 'By submitting this form, you agree to our';
      case 'booking':
        return 'By providing your information, you agree to our';
      case 'preview':
        return 'Preview mode - data will not be saved. View our';
      default:
        return 'By using this service, you agree to our';
    }
  };

  return (
    <div className={`text-center py-4 ${className}`}>
      {/* Consent and Legal Links */}
      {showConsentText && (
        <p className="text-xs text-gray-500 mb-2">
          {getConsentText()}{' '}
          <Link
            to="/privacy-policy"
            className="text-gray-600 hover:text-gray-800 hover:underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          {' '}and{' '}
          <Link
            to="/terms"
            className="text-gray-600 hover:text-gray-800 hover:underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>
          .
        </p>
      )}

      {/* Quick Links Row */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Link
          to="/privacy-policy"
          className="hover:text-gray-600 hover:underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy
        </Link>
        <span>|</span>
        <Link
          to="/terms"
          className="hover:text-gray-600 hover:underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms
        </Link>
        <span>|</span>
        <Link
          to="/cookies"
          className="hover:text-gray-600 hover:underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cookies
        </Link>
      </div>

      {/* Branding */}
      {showBranding && (
        <p className="text-xs text-gray-400 mt-3">
          Powered by{' '}
          <a
            href="https://axolop.com"
            className="font-medium text-gray-500 hover:text-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Axolop
          </a>
        </p>
      )}
    </div>
  );
}
