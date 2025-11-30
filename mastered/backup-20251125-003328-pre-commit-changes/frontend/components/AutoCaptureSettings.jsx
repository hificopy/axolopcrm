import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { Badge } from './components/ui/badge';
import { Zap, TrendingUp, Shield, Info } from 'lucide-react';

/**
 * Auto-Capture Settings Component
 * Can be used in both Form Builder and Meeting Settings
 */
export default function AutoCaptureSettings({
  enabled = true,
  onToggle,
  showPrivacyNotice = true,
  onPrivacyNoticeToggle,
  type = 'form' // 'form' or 'meeting'
}) {
  return (
    <Card className="border-2 border-green-100 bg-green-50/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Auto-Capture Leads</CardTitle>
                <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              </div>
              <CardDescription>
                Capture leads automatically as users type - no submit required
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Benefits */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <TrendingUp className="h-4 w-4" />
              Why use auto-capture?
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>50%+ higher conversion rates</strong> - Capture leads even if they don't submit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Zero friction</strong> - No submit button pressure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Real-time insights</strong> - See who's filling out your {type}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Draft leads</strong> - Verify and qualify leads before follow-up</span>
              </li>
            </ul>
          </div>

          {/* Privacy Notice Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-blue-600" />
                <div>
                  <Label htmlFor="privacy-notice" className="text-sm font-medium">
                    Show Privacy Notice
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Display auto-capture disclaimer to users
                  </p>
                </div>
              </div>
              <Switch
                id="privacy-notice"
                checked={showPrivacyNotice}
                onCheckedChange={onPrivacyNoticeToggle}
              />
            </div>

            {/* Privacy Policy Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Privacy & Data Security:</strong> We respect your privacy and data security.
                Auto-captured data is encrypted, stored securely, and only accessible to you.
                Users can request data deletion at any time. All data handling complies with GDPR and privacy regulations.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Info className="h-4 w-4" />
              How it works
            </div>
            <p className="text-xs text-blue-600">
              When enabled, lead information (name, email, etc.) is automatically saved as users
              type. Draft leads appear in your CRM with a grey indicator until you verify them.
              {showPrivacyNotice && ' A small privacy notice will be shown to users.'}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
