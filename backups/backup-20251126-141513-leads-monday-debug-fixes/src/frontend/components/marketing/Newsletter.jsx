import React, { useState } from 'react';
import { 
  Mail, 
  User, 
  Target, 
  Calendar, 
  Settings,
  Save,
  Send,
  Eye,
  Edit3,
  Plus,
  BarChart3
} from 'lucide-react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Label } from '@components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';

const Newsletter = () => {
  const [newsletterData, setNewsletterData] = useState({
    title: '',
    subject: '',
    previewText: '',
    content: '<p>Hello,</p><p>This is your newsletter content.</p>',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    sendTo: 'all-subscribers',
    scheduleDate: '',
    scheduleTime: ''
  });

  const [isScheduled, setIsScheduled] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(1245);

  const handleInputChange = (field, value) => {
    setNewsletterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSend = () => {
    if (isScheduled) {
      alert('Newsletter scheduled successfully!');
    } else {
      alert('Newsletter sent successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-crm-text-primary">Newsletter</h1>
          <p className="text-crm-text-secondary mt-1">
            Create and send beautiful newsletters to your subscribers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Templates
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Newsletter Title</Label>
                <Input
                  id="title"
                  value={newsletterData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter newsletter title"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={newsletterData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Newsletter subject line"
                />
              </div>

              <div>
                <Label htmlFor="previewText">Preview Text</Label>
                <Input
                  id="previewText"
                  value={newsletterData.previewText}
                  onChange={(e) => handleInputChange('previewText', e.target.value)}
                  placeholder="Preview text appears in inbox"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
                  <div 
                    contentEditable
                    className="min-h-[350px] p-2 bg-white dark:bg-[#15171d] border rounded dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onBlur={(e) => handleInputChange('content', e.target.innerHTML)}
                  >
                    {newsletterData.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Send Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Send To</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="all-subscribers"
                      name="sendTo"
                      checked={newsletterData.sendTo === 'all-subscribers'}
                      onChange={() => handleInputChange('sendTo', 'all-subscribers')}
                      className="mr-2"
                    />
                    <Label htmlFor="all-subscribers">All Subscribers ({subscribersCount})</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="custom-segment"
                      name="sendTo"
                      checked={newsletterData.sendTo === 'custom-segment'}
                      onChange={() => handleInputChange('sendTo', 'custom-segment')}
                      className="mr-2"
                    />
                    <Label htmlFor="custom-segment">Custom Segment</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="specific-emails"
                      name="sendTo"
                      checked={newsletterData.sendTo === 'specific-emails'}
                      onChange={() => handleInputChange('sendTo', 'specific-emails')}
                      className="mr-2"
                    />
                    <Label htmlFor="specific-emails">Specific Emails</Label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Scheduling</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="mr-2"
                  />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>

                {isScheduled && (
                  <div className="mt-3 space-y-3">
                    <Input
                      type="date"
                      value={newsletterData.scheduleDate}
                      onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                    />
                    <Input
                      type="time"
                      value={newsletterData.scheduleTime}
                      onChange={(e) => handleInputChange('scheduleTime', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <Label>From Name</Label>
                <Input
                  value={newsletterData.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="Sender name"
                />
                
                <Label className="mt-3 block">From Email</Label>
                <Input
                  value={newsletterData.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="sender@company.com"
                />
              </div>

              <Button 
                onClick={handleSend}
                className="w-full mt-4 flex items-center justify-center gap-2"
              >
                {isScheduled ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {isScheduled ? 'Schedule Newsletter' : 'Send Newsletter'}
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subscribers</span>
                  <span className="font-medium">{subscribersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Rate</span>
                  <span className="font-medium">24.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Click Rate</span>
                  <span className="font-medium">3.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Unsubscribes</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;