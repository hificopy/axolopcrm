import { Info } from 'lucide-react';

/**
 * Privacy Notice for Auto-Capture
 * Shows users that their information is being saved as they type
 */
export default function AutoCapturePrivacyNotice({ className = '' }) {
  return (
    <div className={`flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 ${className}`}>
      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <p>
        <strong>Auto-save enabled:</strong> Your responses are saved automatically as you type to improve your experience.
        We respect your privacy and data security.
      </p>
    </div>
  );
}
