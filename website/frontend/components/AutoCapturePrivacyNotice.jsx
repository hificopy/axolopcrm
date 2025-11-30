import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Privacy Notice for Auto-Capture
 * Shows users that their information is being saved as they type
 * and provides links to legal documents for consent
 *
 * @param {string} variant - 'form' | 'booking' | 'meeting' - context-specific styling
 * @param {string} className - additional CSS classes
 * @param {boolean} compact - show minimal text version
 */
export default function AutoCapturePrivacyNotice({
  className = '',
  variant = 'form',
  compact = false
}) {
  // Context-specific messaging
  const getMessage = () => {
    switch (variant) {
      case 'booking':
        return 'Your information is saved automatically to ensure your booking is not lost.';
      case 'meeting':
        return 'Your responses are saved automatically to streamline the scheduling process.';
      default:
        return 'Your responses are saved automatically as you type to improve your experience.';
    }
  };

  if (compact) {
    return (
      <p className={`text-xs text-gray-500 ${className}`}>
        By continuing, you agree to our{' '}
        <Link
          to="/privacy-policy"
          className="text-gray-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>
        {' '}and{' '}
        <Link
          to="/terms"
          className="text-gray-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms
        </Link>
        .
      </p>
    );
  }

  return (
    <div className={`flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 ${className}`}>
      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div>
        <p>
          <strong>Auto-save enabled:</strong> {getMessage()}
        </p>
        <p className="mt-1 text-[#3F0D28]">
          By continuing, you agree to our{' '}
          <Link
            to="/privacy-policy"
            className="underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          {' '}and{' '}
          <Link
            to="/terms"
            className="underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
