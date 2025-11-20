import { useState } from 'react';
import { Phone, Mail, MessageSquare, Bell, Settings, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function CommunicationSettings() {
  const [activeTab, setActiveTab] = useState('email');

  const [emailSettings, setEmailSettings] = useState({
    defaultEmail: 'juan@axolop.com',
    sendAsName: 'Juan D. Romero',
    signature: 'Best regards,\nJuan D. Romero\nAxolop CRM',
    autoReply: false,
    autoReplyMessage: 'Thank you for your email. I will get back to you as soon as possible.'
  });

  const [phoneSettings, setPhoneSettings] = useState({
    voicemailEnabled: true,
    voicemailGreeting: 'Please leave a message after the beep. I will get back to you as soon as possible.',
    callRecording: true,
    callRecordingConsent: true
  });

  const [templateSettings, setTemplateSettings] = useState({
    templates: [
      {
        id: 1,
        name: 'Welcome Email',
        subject: 'Welcome to Axolop CRM',
        content: 'Dear {{name}},\n\nWelcome to Axolop CRM! We\'re excited to have you on board.\n\nBest regards,\nThe Axolop Team'
      },
      {
        id: 2,
        name: 'Follow-up Email', 
        subject: 'Following up on our conversation',
        content: 'Hi {{name}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nLet me know if you have any questions.\n\nBest regards,\n{{sender}}'
      }
    ],
    snippets: [
      { id: 1, name: 'Quick Response', content: 'Thanks for reaching out! I\'ll get back to you soon.' },
      { id: 2, name: 'Meeting Reminder', content: 'Just a friendly reminder about our upcoming meeting.' }
    ]
  });

  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? checked : value
    }));
  };

  const handlePhoneChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPhoneSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? checked : value
    }));
  };

  const handleTemplateChange = (templateId, field, value) => {
    setTemplateSettings(prev => ({
      ...prev,
      templates: prev.templates.map(template => 
        template.id === templateId ? { ...template, [field]: value } : template
      )
    }));
  };

  const handleSave = (tab) => {
    console.log(`${tab} communication settings saved:`, 
      tab === 'email' ? emailSettings : 
      tab === 'phone' ? phoneSettings : 
      tab === 'templates' ? templateSettings : {});
    alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} settings saved successfully!`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Communication Settings</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage your communication preferences and templates
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <nav className="bg-white rounded-lg border border-crm-border p-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('phone')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'phone'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    <span>Phone & Voicemail</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('dialer')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'dialer'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    <span>Dialer</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('outcomes')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'outcomes'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Outcomes</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notetaker')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'notetaker'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notetaker BETA</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'email'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'templates'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Templates & Snippets</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sendas')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'sendas'
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send As</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Settings Form */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-crm-border p-6">
                {/* Email Settings */}
                {activeTab === 'email' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Email Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Default Email Address
                        </Label>
                        <Input
                          name="defaultEmail"
                          value={emailSettings.defaultEmail}
                          onChange={handleEmailChange}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Send As Name
                        </Label>
                        <Input
                          name="sendAsName"
                          value={emailSettings.sendAsName}
                          onChange={handleEmailChange}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Email Signature
                        </Label>
                        <Textarea
                          name="signature"
                          value={emailSettings.signature}
                          onChange={handleEmailChange}
                          rows={4}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Auto Reply</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Send an automatic reply for all incoming emails
                          </p>
                        </div>
                        <Switch
                          name="autoReply"
                          checked={emailSettings.autoReply}
                          onCheckedChange={(checked) => setEmailSettings(prev => ({...prev, autoReply: checked}))}
                        />
                      </div>

                      {emailSettings.autoReply && (
                        <div className="ml-7">
                          <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                            Auto Reply Message
                          </Label>
                          <Textarea
                            name="autoReplyMessage"
                            value={emailSettings.autoReplyMessage}
                            onChange={handleEmailChange}
                            rows={3}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('email')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Phone & Voicemail Settings */}
                {activeTab === 'phone' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Phone & Voicemail Settings</h2>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Voicemail Enabled</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Enable voicemail for your phone number
                          </p>
                        </div>
                        <Switch
                          name="voicemailEnabled"
                          checked={phoneSettings.voicemailEnabled}
                          onCheckedChange={(checked) => setPhoneSettings(prev => ({...prev, voicemailEnabled: checked}))}
                        />
                      </div>

                      {phoneSettings.voicemailEnabled && (
                        <div className="ml-7">
                          <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                            Voicemail Greeting
                          </Label>
                          <Textarea
                            name="voicemailGreeting"
                            value={phoneSettings.voicemailGreeting}
                            onChange={handlePhoneChange}
                            rows={3}
                            className="w-full"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Call Recording</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Record all calls for quality assurance
                          </p>
                        </div>
                        <Switch
                          name="callRecording"
                          checked={phoneSettings.callRecording}
                          onCheckedChange={(checked) => setPhoneSettings(prev => ({...prev, callRecording: checked}))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Call Recording Consent</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Inform callers that calls are being recorded
                          </p>
                        </div>
                        <Switch
                          name="callRecordingConsent"
                          checked={phoneSettings.callRecordingConsent}
                          onCheckedChange={(checked) => setPhoneSettings(prev => ({...prev, callRecordingConsent: checked}))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('phone')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Templates & Snippets */}
                {activeTab === 'templates' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Email Templates & Snippets</h2>

                    <div className="space-y-8">
                      {/* Email Templates */}
                      <div>
                        <h3 className="text-lg font-medium text-crm-text-primary mb-4">Email Templates</h3>
                        
                        <div className="space-y-4">
                          {templateSettings.templates.map((template) => (
                            <Card key={template.id} className="border border-crm-border">
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-crm-text-secondary">Template Name</Label>
                                    <Input
                                      value={template.name}
                                      onChange={(e) => handleTemplateChange(template.id, 'name', e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-crm-text-secondary">Subject</Label>
                                    <Input
                                      value={template.subject}
                                      onChange={(e) => handleTemplateChange(template.id, 'subject', e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="md:col-span-3">
                                    <Label className="text-sm font-medium text-crm-text-secondary">Content</Label>
                                    <Textarea
                                      value={template.content}
                                      onChange={(e) => handleTemplateChange(template.id, 'content', e.target.value)}
                                      rows={5}
                                      className="mt-1 font-mono text-sm"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Button variant="outline" className="mt-4">
                          + Add New Template
                        </Button>
                      </div>

                      {/* Quick Snippets */}
                      <div>
                        <h3 className="text-lg font-medium text-crm-text-primary mb-4">Quick Snippets</h3>
                        
                        <div className="space-y-4">
                          {templateSettings.snippets.map((snippet) => (
                            <Card key={snippet.id} className="border border-crm-border">
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-crm-text-secondary">Snippet Name</Label>
                                    <Input
                                      value={snippet.name}
                                      onChange={(e) => setTemplateSettings(prev => ({
                                        ...prev,
                                        snippets: prev.snippets.map(s => 
                                          s.id === snippet.id ? {...s, name: e.target.value} : s
                                        )
                                      }))}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-crm-text-secondary">Content</Label>
                                    <Textarea
                                      value={snippet.content}
                                      onChange={(e) => setTemplateSettings(prev => ({
                                        ...prev,
                                        snippets: prev.snippets.map(s => 
                                          s.id === snippet.id ? {...s, content: e.target.value} : s
                                        )
                                      }))}
                                      rows={3}
                                      className="mt-1 font-mono text-sm"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Button variant="outline" className="mt-4">
                          + Add New Snippet
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('templates')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Other tabs will be implemented similarly */}
                {activeTab === 'dialer' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Dialer Settings</h2>
                    <p className="text-crm-text-secondary">Dialer configuration options will be implemented here.</p>
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('dialer')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'outcomes' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Outcomes Settings</h2>
                    <p className="text-crm-text-secondary">Call outcomes configuration will be implemented here.</p>
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('outcomes')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'notetaker' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Notetaker BETA Settings</h2>
                    <p className="text-crm-text-secondary">Notetaker configuration will be implemented here.</p>
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('notetaker')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'sendas' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Send As Settings</h2>
                    <p className="text-crm-text-secondary">Send as configuration will be implemented here.</p>
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('sendas')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}