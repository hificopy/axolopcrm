import { useState, useEffect } from 'react';
import { useAgency } from '@/context/AgencyContext';
import { useSupabase } from '@/context/SupabaseContext';
import { Building2, Users, Settings, Upload, Save } from 'lucide-react';

export default function AgencySettings() {
  const { currentAgency, isAdmin, refreshAgency } = useAgency();
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('general');

  // Form state
  const [agencyData, setAgencyData] = useState({
    name: '',
    logo_url: '',
    website: '',
    description: '',
  });

  const [settingsData, setSettingsData] = useState({
    sections_enabled: {},
    features_enabled: {},
  });

  // Load agency data
  useEffect(() => {
    if (currentAgency) {
      setAgencyData({
        name: currentAgency.name || '',
        logo_url: currentAgency.logo_url || '',
        website: currentAgency.website || '',
        description: currentAgency.description || '',
      });

      const settings = currentAgency.settings || {};
      setSettingsData({
        sections_enabled: settings.sections_enabled || {},
        features_enabled: settings.features_enabled || {},
      });

      loadMembers();
    }
  }, [currentAgency]);

  const loadMembers = async () => {
    if (!currentAgency) return;

    try {
      const { data, error } = await supabase
        .from('agency_members')
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('agency_id', currentAgency.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading members:', error);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleSaveGeneral = async () => {
    if (!currentAgency || !isAdmin()) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('agencies')
        .update({
          name: agencyData.name,
          logo_url: agencyData.logo_url,
          website: agencyData.website,
          description: agencyData.description,
        })
        .eq('id', currentAgency.id);

      if (error) {
        console.error('Error saving agency:', error);
        alert('Failed to save changes');
        return;
      }

      await refreshAgency();
      alert('Agency settings saved successfully!');
    } catch (error) {
      console.error('Error saving agency:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!currentAgency || !isAdmin()) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('agencies')
        .update({
          settings: {
            sections_enabled: settingsData.sections_enabled,
            features_enabled: settingsData.features_enabled,
          },
        })
        .eq('id', currentAgency.id);

      if (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save changes');
        return;
      }

      await refreshAgency();
      alert('Permissions saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin()) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const { error } = await supabase
        .from('agency_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member');
        return;
      }

      await loadMembers();
      alert('Member removed successfully!');
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  if (!currentAgency) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">No agency selected</p>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">You do not have permission to access agency settings</p>
      </div>
    );
  }

  const sections = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'leads', label: 'Leads' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'activities', label: 'Activities' },
    { key: 'meetings', label: 'Meetings' },
    { key: 'forms', label: 'Forms' },
    { key: 'email_campaigns', label: 'Email Campaigns' },
    { key: 'workflows', label: 'Workflows' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'second_brain', label: 'Second Brain' },
    { key: 'mind_maps', label: 'Mind Maps' },
    { key: 'team_chat', label: 'Team Chat' },
  ];

  const features = [
    { key: 'ai_scoring', label: 'AI Lead Scoring' },
    { key: 'ai_transcription', label: 'AI Call Transcription' },
    { key: 'email_integration', label: 'Email Integration' },
    { key: 'calendar_integration', label: 'Calendar Integration' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Agency Settings</h1>
        <p className="text-gray-400">Manage your agency information and team members</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-yellow-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="inline h-4 w-4 mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-yellow-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-yellow-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="inline h-4 w-4 mr-2" />
            Permissions
          </button>
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Agency Name
            </label>
            <input
              type="text"
              value={agencyData.name}
              onChange={(e) => setAgencyData({ ...agencyData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo URL
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={agencyData.logo_url}
                onChange={(e) => setAgencyData({ ...agencyData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {agencyData.logo_url && (
                <img
                  src={agencyData.logo_url}
                  alt="Agency logo"
                  className="h-10 w-10 rounded object-cover"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={agencyData.website}
              onChange={(e) => setAgencyData({ ...agencyData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={agencyData.description}
              onChange={(e) => setAgencyData({ ...agencyData, description: e.target.value })}
              rows={4}
              placeholder="Tell us about your agency..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveGeneral}
              disabled={saving}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded transition-colors disabled:opacity-50"
            >
              <Save className="inline h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Team Members</h3>
              <p className="text-sm text-gray-400">
                {members.length} / {currentAgency.max_users} members
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-semibold">
                    {member.user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.user?.email}</p>
                    <p className="text-sm text-gray-400 capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      member.invitation_status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {member.invitation_status}
                  </span>
                  {member.role !== 'admin' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-1 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enabled Sections</h3>
            <div className="grid grid-cols-2 gap-4">
              {sections.map((section) => (
                <label key={section.key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsData.sections_enabled[section.key] || false}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        sections_enabled: {
                          ...settingsData.sections_enabled,
                          [section.key]: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-gray-300">{section.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enabled Features</h3>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <label key={feature.key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsData.features_enabled[feature.key] || false}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        features_enabled: {
                          ...settingsData.features_enabled,
                          [feature.key]: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-gray-300">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSavePermissions}
              disabled={saving}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded transition-colors disabled:opacity-50"
            >
              <Save className="inline h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
