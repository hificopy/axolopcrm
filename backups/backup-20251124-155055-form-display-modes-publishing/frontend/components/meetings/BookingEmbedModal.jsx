import { useState } from 'react';
import { Copy, Check, Code, ExternalLink, Maximize2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';

/**
 * BookingEmbedModal - Show different ways to embed/share booking link
 * Features:
 * - Direct link
 * - Iframe embed code
 * - Pop-up widget code
 * - Preview of each method
 */
export default function BookingEmbedModal({ open, onOpenChange, bookingLink }) {
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState(null);
  const [iframeWidth, setIframeWidth] = useState('100%');
  const [iframeHeight, setIframeHeight] = useState('800px');

  if (!bookingLink) return null;

  const baseUrl = window.location.origin;
  const bookingUrl = `${baseUrl}/book/${bookingLink.slug}`;

  // Generate iframe embed code
  const iframeCode = `<iframe
  src="${bookingUrl}"
  width="${iframeWidth}"
  height="${iframeHeight}"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`;

  // Generate popup widget code
  const popupCode = `<!-- Axolop Booking Widget -->
<script>
  (function() {
    window.AxolopBooking = window.AxolopBooking || {};
    window.AxolopBooking.init = function(config) {
      const btn = document.querySelector(config.selector || '#axolop-booking-btn');
      if (!btn) return;

      btn.addEventListener('click', function(e) {
        e.preventDefault();

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'axolop-booking-overlay';
        overlay.style.cssText = \`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        \`;

        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = \`
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          height: 90%;
          max-height: 800px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        \`;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = \`
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          font-size: 28px;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        \`;
        closeBtn.onmouseover = () => closeBtn.style.background = '#e5e7eb';
        closeBtn.onmouseout = () => closeBtn.style.background = '#f3f4f6';
        closeBtn.onclick = () => document.body.removeChild(overlay);

        // Iframe
        const iframe = document.createElement('iframe');
        iframe.src = '${bookingUrl}';
        iframe.style.cssText = \`
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 12px;
        \`;

        modal.appendChild(closeBtn);
        modal.appendChild(iframe);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) {
            document.body.removeChild(overlay);
          }
        });

        // Add animations
        const style = document.createElement('style');
        style.textContent = \`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        \`;
        document.head.appendChild(style);
      });
    };
  })();

  // Auto-init if button exists
  window.AxolopBooking.init({ selector: '#axolop-booking-btn' });
</script>

<!-- Add this button where you want it to appear -->
<button id="axolop-booking-btn" style="
  background: linear-gradient(135deg, #791C14 0%, #a03a2e 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
"
onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 16px rgba(123, 28, 20, 0.3)';"
onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
>
  Schedule a Meeting
</button>`;

  const copyToClipboard = async (text, itemName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      toast({
        title: 'Copied!',
        description: `${itemName} copied to clipboard`,
      });
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-[#791C14]" />
            Share & Embed: {bookingLink.name}
          </DialogTitle>
          <DialogDescription>
            Choose how you want to share your booking link
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Direct Link
            </TabsTrigger>
            <TabsTrigger value="iframe" className="gap-2">
              <Code className="h-4 w-4" />
              Iframe Embed
            </TabsTrigger>
            <TabsTrigger value="popup" className="gap-2">
              <Maximize2 className="h-4 w-4" />
              Pop-up Widget
            </TabsTrigger>
          </TabsList>

          {/* Direct Link */}
          <TabsContent value="link" className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Direct Booking Link
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Share this link directly with your customers via email, social media, or any platform.
              </p>
              <div className="flex gap-2">
                <Input
                  value={bookingUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(bookingUrl, 'Direct link')}
                  className="gap-2 shrink-0"
                >
                  {copiedItem === 'Direct link' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Best for:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-5 list-disc">
                <li>Email signatures</li>
                <li>Social media profiles</li>
                <li>Direct messaging</li>
                <li>SMS campaigns</li>
              </ul>
            </div>
          </TabsContent>

          {/* Iframe Embed */}
          <TabsContent value="iframe" className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Customize Iframe Size
              </Label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-600">Width</Label>
                  <Input
                    value={iframeWidth}
                    onChange={(e) => setIframeWidth(e.target.value)}
                    placeholder="100%"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Height</Label>
                  <Input
                    value={iframeHeight}
                    onChange={(e) => setIframeHeight(e.target.value)}
                    placeholder="800px"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Embed Code
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Copy and paste this code into your website's HTML where you want the booking form to appear.
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                  {iframeCode}
                </pre>
                <Button
                  onClick={() => copyToClipboard(iframeCode, 'Iframe code')}
                  size="sm"
                  className="absolute top-2 right-2 gap-2"
                >
                  {copiedItem === 'Iframe code' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Best for:
              </h4>
              <ul className="text-sm text-green-800 space-y-1 ml-5 list-disc">
                <li>Landing pages</li>
                <li>Dedicated booking pages</li>
                <li>Website sections</li>
                <li>Full-width integration</li>
              </ul>
            </div>
          </TabsContent>

          {/* Pop-up Widget */}
          <TabsContent value="popup" className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Pop-up Widget Code
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Add this code before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag.
                The booking form will open in a beautiful modal when users click the button.
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96">
                  {popupCode}
                </pre>
                <Button
                  onClick={() => copyToClipboard(popupCode, 'Popup code')}
                  size="sm"
                  className="absolute top-2 right-2 gap-2"
                >
                  {copiedItem === 'Popup code' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                Best for:
              </h4>
              <ul className="text-sm text-purple-800 space-y-1 ml-5 list-disc">
                <li>Call-to-action buttons</li>
                <li>Navigation menus</li>
                <li>Sidebar widgets</li>
                <li>Non-intrusive integration</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <p className="text-xs text-purple-700">
                  <strong>Customization:</strong> You can customize the button text, colors, and selector in the code above.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={bookingLink.is_active ? 'default' : 'secondary'}>
                {bookingLink.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-gray-600">
                {bookingLink.total_bookings || 0} bookings
              </span>
            </div>
            <Button variant="outline" onClick={() => window.open(bookingUrl, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
