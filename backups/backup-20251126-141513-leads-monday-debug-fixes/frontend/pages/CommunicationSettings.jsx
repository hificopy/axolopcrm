import { useState } from 'react';
import { Phone, Mail, MessageSquare, Bell, Settings, Edit3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function CommunicationSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('email');

  const [emailSettings, setEmailSettings] = useState({
    defaultEmail: 'juan@axolop.com',
    sendAsName: 'Juan D. Romero',
    signature: 'Best regards,\nJuan D. Romero\nAxolop',
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
        subject: 'Welcome to Axolop',
        content: 'Dear {{name}},\n\nWelcome to Axolop! We\'re excited to have you on board.\n\nBest regards,\nThe Axolop Team'
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
    console.warn(`${tab} communication settings saved:`,
      tab === 'email' ? emailSettings :
      tab === 'phone' ? phoneSettings :
      tab === 'templates' ? templateSettings : {});
    toast({
      title: "Settings Saved",
      description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} settings have been saved successfully.`,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border px-6 py-4">
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
            {/* Sidebar Navigation - ALL LOCKED FOR V1.0 */}
            <div className="w-64 flex-shrink-0 relative z-10">
              <nav className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-4 overflow-visible">
                <div className="space-y-1">
                  {/* Locked Phone & Voicemail */}
                  <div className="relative group overflow-visible">
                    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Phone & Voicemail</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                        Coming in V1.1
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Locked Dialer */}
                  <div className="relative group overflow-visible">
                    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Dialer</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                        Coming in V1.1
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Locked Outcomes */}
                  <div className="relative group overflow-visible">
                    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Outcomes</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                        Coming in V1.1
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Locked Notetaker BETA */}
                  <div className="relative group overflow-visible">
                    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Notetaker BETA</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                        Coming in V1.1
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Locked Email */}
                  <div className="relative group overflow-visible">
                    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Email</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                        Coming in V1.1
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Locked Templates & Snippets */}
                  <div className="relative group overflow-visible">
                    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
                      <Edit3 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Templates & Snippets</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                        Coming in V1.1
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Locked Send As */}
                  <div className="relative group overflow-visible">
                    <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Send As</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                        Coming in V1.1
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Settings Form - Locked Content */}
            <div className="flex-1">
              <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-6">
                {/* Locked Communication Features */}
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="bg-gray-100 dark:bg-gray-800/30 rounded-full p-6 mb-4">
                    <Lock className="h-12 w-12 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-crm-text-primary mb-2">Communication Features</h2>
                  <p className="text-crm-text-secondary text-center max-w-md mb-6">
                    All communication features including phone, email, dialer, and templates are currently locked and will be available in V1.1.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                      <span className="font-semibold">Coming in V1.1:</span> Full email integration, call recording, dialer, templates, and more!
                    </p>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}