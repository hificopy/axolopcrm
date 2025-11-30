import { Bell, HelpCircle, Info } from 'lucide-react';
import { Tooltip } from './components/ui/tooltip';
import { InfoTooltip, InfoTooltipInline } from './components/ui/info-tooltip';
import { Button } from './components/ui/button';

export default function TooltipTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tooltip Test Page</h1>
          <p className="text-gray-600">Hover over elements for 500ms to see tooltips</p>
        </div>

        {/* Basic Icon Tooltips */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Icon Button Tooltips (500ms delay)</h2>
          <div className="flex items-center gap-6">
            <Tooltip content="Notifications" position="bottom" delay={500}>
              <button className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <Bell className="h-6 w-6 text-gray-700" />
              </button>
            </Tooltip>

            <Tooltip content="Help & Support" position="bottom" delay={500}>
              <button className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <HelpCircle className="h-6 w-6 text-gray-700" />
              </button>
            </Tooltip>

            <Tooltip content="Information Center" position="bottom" delay={500}>
              <button className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors">
                <Info className="h-6 w-6 text-blue-700" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Different Positions */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Tooltip Positions (500ms delay)</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <Tooltip content="Top tooltip" position="top" delay={500}>
                <Button variant="outline">Hover for Top</Button>
              </Tooltip>

              <Tooltip content="Bottom tooltip" position="bottom" delay={500}>
                <Button variant="outline">Hover for Bottom</Button>
              </Tooltip>
            </div>
            <div className="space-y-4">
              <Tooltip content="Left tooltip" position="left" delay={500}>
                <Button variant="outline">Hover for Left</Button>
              </Tooltip>

              <Tooltip content="Right tooltip" position="right" delay={500}>
                <Button variant="outline">Hover for Right</Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Info Icon Tooltips */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Info Icon Tooltips</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Total Forms</span>
              <InfoTooltipInline content="Total number of forms you've created" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-700">Conversion Rate</span>
              <InfoTooltipInline content="Percentage of visitors who submit the form" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-700">Advanced Feature</span>
              <InfoTooltip content="This is a more detailed explanation of a complex feature" />
            </div>
          </div>
        </div>

        {/* Instant Tooltip for Testing */}
        <div className="bg-green-50 rounded-xl p-8 shadow-lg border-2 border-green-200">
          <h2 className="text-xl font-semibold mb-6 text-green-800">Instant Tooltip (0ms - for debugging)</h2>
          <div className="flex items-center gap-4">
            <Tooltip content="Shows immediately!" position="bottom" delay={0}>
              <Button variant="default">Instant Tooltip</Button>
            </Tooltip>

            <Tooltip content="This appears right away too!" position="top" delay={0}>
              <Button variant="accent">Another Instant</Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
