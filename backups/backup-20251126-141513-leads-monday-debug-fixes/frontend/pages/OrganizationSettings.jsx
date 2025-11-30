import { useState } from 'react';
import { Building, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function OrganizationSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const [organizationSettings, setOrganizationSettings] = useState({
    name: 'axolop',
    currency: 'USD',
    timezone: 'America/New_York',
    country: 'United States',
    address: '123 Main St, Tampa, FL 33601',
    phone: '+1 813-536-3540'
  });

  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;
    setOrganizationSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (tab) => {
    console.warn(`${tab} organization settings saved:`, tab === 'general' ? organizationSettings : {});
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
            <h1 className="text-2xl font-semibold text-crm-text-primary">Organization Settings</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage your organization preferences and settings
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
              <nav className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'general'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span>General</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'team'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Team Management</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'permissions'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Roles & Permissions</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Settings Form */}
            <div className="flex-1">
              <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">General Settings</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Organization Name*
                        </Label>
                        <Input
                          name="name"
                          value={organizationSettings.name}
                          onChange={handleOrganizationChange}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Currency
                        </Label>
                        <Select name="currency" value={organizationSettings.currency} onValueChange={(value) => setOrganizationSettings(prev => ({...prev, currency: value}))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Timezone
                        </Label>
                        <Select name="timezone" value={organizationSettings.timezone} onValueChange={(value) => setOrganizationSettings(prev => ({...prev, timezone: value}))}>
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
                          Country
                        </Label>
                        <Input
                          name="country"
                          value={organizationSettings.country}
                          onChange={handleOrganizationChange}
                          className="w-full"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Address
                        </Label>
                        <Input
                          name="address"
                          value={organizationSettings.address}
                          onChange={handleOrganizationChange}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-crm-text-secondary mb-2">
                          Phone
                        </Label>
                        <Input
                          name="phone"
                          value={organizationSettings.phone}
                          onChange={handleOrganizationChange}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button variant="default" onClick={() => handleSave('general')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Team Management */}
                {activeTab === 'team' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Team Management</h2>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-crm-text-primary">Users</h3>
                        <Button variant="default">+ New User</Button>
                      </div>

                      <div className="mb-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Filter Users..."
                            className="w-full pl-10 pr-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                          />
                          <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-crm-text-secondary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-crm-border">
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">User</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">Role</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">Email & Phone</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">2FA</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">Auto-Record Calls</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                                    JR
                                  </div>
                                  <span className="font-medium text-crm-text-primary">Juan Romero</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#761B14]/10 text-[#761B14]">
                                  Admin
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-crm-text-primary">juan@axolop.com</p>
                                  <p className="text-sm text-crm-text-secondary">+1 813-536-3540</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  2FA
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-crm-text-secondary">Auto-Record Calls</span>
                                <div className="flex items-center gap-1 text-crm-text-secondary text-sm">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Info
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="default" onClick={() => handleSave('team')}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Roles & Permissions */}
                {activeTab === 'permissions' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Roles & Permissions</h2>

                    <div className="mb-6">
                      <div className="bg-[#761B14]/5 border border-[#761B14]/20 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <svg className="h-5 w-5 text-[#761B14] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h3 className="font-medium text-[#761B14]">Custom Roles & Permissions</h3>
                            <p className="text-sm text-[#9A392D] mt-1">
                              Custom Roles & Permissions requires an upgraded plan
                            </p>
                            <Button variant="default" className="mt-2 btn-premium-red">
                              Upgrade Now
                            </Button>
                          </div>
                        </div>
                      </div>

                      <p className="text-crm-text-secondary mb-6">
                        Roles allow you to set which users are allowed to perform certain actions within Close...
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border border-crm-border">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-crm-text-primary">Admin</h3>
                                <p className="text-sm text-crm-text-secondary">SYSTEM</p>
                              </div>
                            </div>
                            <p className="text-sm text-crm-text-secondary">1 user</p>
                          </CardContent>
                        </Card>

                        <Card className="border border-crm-border">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-crm-text-primary">Super User</h3>
                                <p className="text-sm text-crm-text-secondary">SYSTEM</p>
                              </div>
                            </div>
                            <p className="text-sm text-crm-text-secondary">No users</p>
                          </CardContent>
                        </Card>

                        <Card className="border border-crm-border">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-crm-text-primary">User</h3>
                                <p className="text-sm text-crm-text-secondary">SYSTEM</p>
                              </div>
                            </div>
                            <p className="text-sm text-crm-text-secondary">No users</p>
                          </CardContent>
                        </Card>

                        <Card className="border border-crm-border">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-crm-text-primary">Restricted User</h3>
                                <p className="text-sm text-crm-text-secondary">SYSTEM</p>
                              </div>
                            </div>
                            <p className="text-sm text-crm-text-secondary">No users</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="default" onClick={() => handleSave('permissions')}>
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