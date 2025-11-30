import { useState, useEffect } from 'react';
import { Shield, Lock, Bell, Mail, Globe, CreditCard, LayoutDashboard, Key } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { useToast } from '@components/ui/use-toast';

export default function AccountSettings() {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState('general');
  const { setTheme, setAutoTheme } = useTheme();

  useEffect(() => {
    // Handle query parameter-based navigation to specific tabs
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    // Exclude 'appearance' as it's locked for V1.0
    if (tab && ['general', 'security', 'notifications', 'membership', 'email'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Update settings when user data loads
  useEffect(() => {
    if (user) {
      const nameParts = user?.user_metadata?.full_name?.split(' ') || [];
      setGeneralSettings({
        firstName: nameParts[0] || user?.email?.split('@')[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user?.email || 'no-email@example.com',
        timezone: user?.user_metadata?.timezone || 'America/New_York',
        language: user?.user_metadata?.language || 'English',
        dateFormat: user?.user_metadata?.dateFormat || 'MM/DD/YYYY',
        timeFormat: user?.user_metadata?.timeFormat || '12 hour'
      });
    }
  }, [user]);

  const nameParts = user?.user_metadata?.full_name?.split(' ') || [];
  const [generalSettings, setGeneralSettings] = useState({
    firstName: nameParts[0] || user?.email?.split('@')[0] || 'User',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user?.email || 'no-email@example.com',
    timezone: user?.user_metadata?.timezone || 'America/New_York',
    language: user?.user_metadata?.language || 'English',
    dateFormat: user?.user_metadata?.dateFormat || 'MM/DD/YYYY',
    timeFormat: user?.user_metadata?.timeFormat || '12 hour'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    autoLogout: true,
    autoLogoutTime: 30,
    passwordChangeRequired: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    callReminders: true,
    meetingReminders: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'English'
  });

  const [membershipSettings, setMembershipSettings] = useState({
    role: 'Admin',
    permissions: ['All permissions'],
    groups: ['Administrators']
  });

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If theme is changed, update the global theme context
    if (name === 'theme') {
      try {
        if (value === 'auto') {
          setAutoTheme?.();
        } else {
          setTheme?.(value);
        }
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    }
  };

  const handleSave = (tab) => {
    // In a real app, we would send this data to the server
    console.warn(`${tab} settings saved:`,
                tab === 'general' ? generalSettings :
                tab === 'security' ? securitySettings :
                tab === 'notifications' ? notificationSettings :
                tab === 'appearance' ? appearanceSettings :
                tab === 'membership' ? membershipSettings :
                generalSettings);

    // Show success feedback
    toast({
      title: "Settings Saved",
      description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} settings have been saved successfully.`,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Account Settings</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage your account preferences and security settings
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
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'general'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    <span>General</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'security'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Security</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </button>
                  {/* Locked Appearance Tab */}
                  <div className="relative group">
                    <div
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Appearance</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        Coming in V1.1
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('membership')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'membership'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Key className="h-4 w-4" />
                    <span>Memberships</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'email'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Preferences</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Settings Form */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-crm-border p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">General Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          First Name
                        </Label>
                        <Input
                          name="firstName"
                          value={generalSettings.firstName}
                          onChange={handleGeneralChange}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Last Name
                        </Label>
                        <Input
                          name="lastName"
                          value={generalSettings.lastName}
                          onChange={handleGeneralChange}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Email
                        </Label>
                        <Input
                          name="email"
                          type="email"
                          value={generalSettings.email}
                          onChange={handleGeneralChange}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Timezone
                        </Label>
                        <Select name="timezone" value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({...prev, timezone: value}))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">America/New York</SelectItem>
                            <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                            <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Language
                        </Label>
                        <Select name="language" value={generalSettings.language} onValueChange={(value) => setGeneralSettings(prev => ({...prev, language: value}))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Date Format
                        </Label>
                        <Select name="dateFormat" value={generalSettings.dateFormat} onValueChange={(value) => setGeneralSettings(prev => ({...prev, dateFormat: value}))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('general')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Two-Factor Authentication</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="twoFactor"
                            checked={securitySettings.twoFactor}
                            onChange={handleSecurityChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Auto Logout</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Automatically log out after inactivity
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="autoLogout"
                            checked={securitySettings.autoLogout}
                            onChange={handleSecurityChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      {securitySettings.autoLogout && (
                        <div className="ml-7">
                          <label className="block text-sm font-medium text-crm-text-secondary mb-2">
                            Auto Logout Time (minutes)
                          </label>
                          <input
                            type="number"
                            name="autoLogoutTime"
                            value={securitySettings.autoLogoutTime}
                            onChange={handleSecurityChange}
                            min="5"
                            max="120"
                            className="w-24 px-3 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Require Password Change</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Force password change on next login
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="passwordChangeRequired"
                            checked={securitySettings.passwordChangeRequired}
                            onChange={handleSecurityChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('security')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Appearance Settings</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Theme
                        </Label>
                        <select
                          name="theme"
                          value={appearanceSettings.theme}
                          onChange={handleAppearanceChange}
                          className="w-full px-3 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">System</option>
                        </select>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Language
                        </Label>
                        <select
                          name="language"
                          value={appearanceSettings.language}
                          onChange={handleAppearanceChange}
                          className="w-full px-3 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('appearance')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Membership Settings */}
                {activeTab === 'membership' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Memberships</h2>

                    <div className="space-y-6">
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Current Role
                        </Label>
                        <p className="text-crm-text-primary font-medium">{membershipSettings.role}</p>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Permissions
                        </Label>
                        <div className="space-y-2">
                          {membershipSettings.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {permission}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Groups
                        </Label>
                        <div className="space-y-2">
                          {membershipSettings.groups.map((group, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {group}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('membership')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Notification Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Email Notifications</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Receive important updates via email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={notificationSettings.emailNotifications}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Push Notifications</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Receive real-time notifications in the browser
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="pushNotifications"
                            checked={notificationSettings.pushNotifications}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">SMS Notifications</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="smsNotifications"
                            checked={notificationSettings.smsNotifications}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Call Reminders</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Get reminders before scheduled calls
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="callReminders"
                            checked={notificationSettings.callReminders}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Meeting Reminders</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Get reminders before scheduled meetings
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="meetingReminders"
                            checked={notificationSettings.meetingReminders}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('notifications')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Email Preferences */}
                {activeTab === 'email' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Email Preferences</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Primary Email Address
                        </Label>
                        <Input
                          type="email"
                          value={generalSettings.email}
                          disabled
                          className="w-full bg-gray-100"
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Send Email Notifications From
                        </Label>
                        <Input
                          type="email"
                          value={generalSettings.email}
                          placeholder="Email address"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Send As Name
                        </Label>
                        <Input
                          type="text"
                          value={generalSettings.firstName + ' ' + generalSettings.lastName}
                          placeholder="Display name"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-crm-text-primary">Weekly Digest</h3>
                          <p className="text-sm text-crm-text-secondary">
                            Receive a weekly summary of activity
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-700 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('email')}>
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