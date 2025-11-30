import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Target,
  Calendar,
  Settings,
  Save,
  Play,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentEditableRef = useRef(null);
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    previewText: '',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    type: 'ONE_TIME',
    scheduledAt: '',
    targetSegment: {
      tags: [],
      stages: [],
      dateRange: null
    },
    htmlContent: '<p>Hello {{firstName}},</p><p>This is your personalized email content.</p>',
    textContent: 'Hello, this is your email content.',
    testRecipients: []
  });

  // Set initial content to the contentEditable div
  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = campaignData.htmlContent;
    }
  }, [campaignData.htmlContent]);

  const handleInputChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      targetSegment: {
        ...prev.targetSegment,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/email-marketing/campaigns', {
        ...campaignData,
        status: 'DRAFT'
      });

      toast({
        title: "Campaign Saved",
        description: "Your campaign has been saved as a draft.",
      });

      navigate('/app/email-marketing');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!campaignData.testRecipients || campaignData.testRecipients.length === 0) {
      toast({
        title: "No Test Recipients",
        description: "Please add test recipients before sending a test email.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      await api.post('/email-marketing/campaigns/test', {
        ...campaignData,
        recipients: campaignData.testRecipients
      });

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${campaignData.testRecipients.length} recipient(s).`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Test Send Failed",
        description: "Failed to send test email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendNow = async () => {
    if (!campaignData.name || !campaignData.subject || !campaignData.htmlContent) {
      toast({
        title: "Incomplete Campaign",
        description: "Please fill in all required fields before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await api.post('/email-marketing/campaigns/send', {
        ...campaignData,
        status: 'SENT',
        sentAt: new Date().toISOString()
      });

      toast({
        title: "Campaign Sent",
        description: "Your campaign has been sent successfully!",
      });

      navigate('/app/email-marketing');
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-crm-text-primary">Create Email Campaign</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/app/email-marketing')} disabled={isSaving || isSending}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2" disabled={isSaving}>
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={handleSendTest} variant="outline" className="flex items-center gap-2" disabled={isSendingTest}>
            <Mail className="w-4 h-4" />
            {isSendingTest ? 'Sending...' : 'Send Test'}
          </Button>
          <Button onClick={handleSendNow} className="flex items-center gap-2" disabled={isSending}>
            <Play className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Now'}
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            step === 1 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => setStep(1)}
        >
          <span className="font-medium">1</span>
          <span>Basic Info</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            step === 2 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => setStep(2)}
        >
          <span className="font-medium">2</span>
          <span>Audience</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            step === 3 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => setStep(3)}
        >
          <span className="font-medium">3</span>
          <span>Content</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            step === 4 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          }`}
          onClick={() => setStep(4)}
        >
          <span className="font-medium">4</span>
          <span>Settings</span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Campaign Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={campaignData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Campaign Type</Label>
                <Select value={campaignData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_TIME">One-time</SelectItem>
                    <SelectItem value="DRIP">Drip Campaign</SelectItem>
                    <SelectItem value="SEQUENCE">Email Sequence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={campaignData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Email subject line"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="previewText">Preview Text</Label>
              <Input
                id="previewText"
                value={campaignData.previewText}
                onChange={(e) => handleInputChange('previewText', e.target.value)}
                placeholder="Preview text appears in inbox"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Audience */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Segmentation Criteria</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label>Tags</Label>
                  <Input
                    value={campaignData.targetSegment.tags.join(', ')}
                    onChange={(e) => handleTargetChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                
                <div>
                  <Label>Lead Stages</Label>
                  <Input
                    placeholder="Enter lead stages (e.g., qualified, demo scheduled)"
                  />
                </div>
                
                <div>
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="From" />
                    <Input type="date" placeholder="To" />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Test Recipients</Label>
              <Textarea
                value={campaignData.testRecipients.join(', ')}
                onChange={(e) => handleInputChange('testRecipients', e.target.value.split(',').map(email => email.trim()))}
                placeholder="Enter test email addresses separated by commas"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Content */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="htmlContent">Email Content</Label>
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
                <div 
                  ref={contentEditableRef}
                  contentEditable
                  className="min-h-[250px] p-2 bg-white dark:bg-[#15171d] border rounded dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onBlur={(e) => handleInputChange('htmlContent', e.target.innerHTML)}
                >
                </div>
                <p className="text-sm text-gray-500 mt-2">Tip: Use {{firstName}} for personalization</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="textContent">Plain Text Version</Label>
              <Textarea
                id="textContent"
                value={campaignData.textContent}
                onChange={(e) => handleInputChange('textContent', e.target.value)}
                rows={6}
                placeholder="Plain text version of your email for clients that don't support HTML"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Settings */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Sending Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={campaignData.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="Sender's name"
                />
              </div>
              
              <div>
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={campaignData.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="sender@company.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="replyToEmail">Reply-To Email (Optional)</Label>
              <Input
                id="replyToEmail"
                type="email"
                value={campaignData.replyToEmail}
                onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
                placeholder="reply@company.com"
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Scheduling</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="schedule-toggle" />
                  <Label htmlFor="schedule-toggle">Schedule for later</Label>
                </div>
                
                {campaignData.scheduledAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <Input
                      type="datetime-local"
                      value={campaignData.scheduledAt}
                      onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Advanced Options</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openTracking">Track Opens</Label>
                  <Switch id="openTracking" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="clickTracking">Track Clicks</Label>
                  <Switch id="clickTracking" defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Previous
        </Button>
        <Button 
          onClick={() => setStep(Math.min(4, step + 1))}
          disabled={step === 4}
        >
          {step === 4 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default CreateCampaign;