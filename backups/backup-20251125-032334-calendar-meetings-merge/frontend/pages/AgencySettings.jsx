import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgency } from '@/hooks/useAgency';
import { useSupabase } from '@/context/SupabaseContext';
import { supabase } from '@/config/supabaseClient';
import { Building2, Users, Settings, Upload, Save, Loader2, UserPlus, AlertTriangle, Trash2, Palette, Check, Lock } from 'lucide-react';
import InviteMemberModal from '@/components/InviteMemberModal';
import DeleteAgencyModal from '@/components/DeleteAgencyModal';
import THEME_PRESETS, { getPreset } from '@/config/agencyThemes';

export default function AgencySettings() {
  const { currentAgency, isAdmin, refreshAgency, deleteAgency } = useAgency();
  const navigate = useNavigate();
  const logoInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [savingTheme, setSavingTheme] = useState(false);

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

      // Load current theme from agency settings
      setSelectedTheme(settings.theme || 'default');

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

  const handleDeleteAgency = async () => {
    if (!currentAgency || !isAdmin()) return;

    try {
      setIsDeleting(true);
      await deleteAgency(currentAgency.id);
      setShowDeleteModal(false);
      // Navigate to dashboard after successful deletion
      navigate('/app/home');
    } catch (error) {
      console.error('Error deleting agency:', error);
      alert(error.message || 'Failed to delete agency. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveTheme = async (themeId) => {
    if (!currentAgency || !isAdmin()) return;

    try {
      setSavingTheme(true);
      setSelectedTheme(themeId);

      // Get current settings and update with new theme
      const currentSettings = currentAgency.settings || {};
      const newSettings = {
        ...currentSettings,
        theme: themeId,
      };

      const { error } = await supabase
        .from('agencies')
        .update({ settings: newSettings })
        .eq('id', currentAgency.id);

      if (error) {
        console.error('Error saving theme:', error);
        alert('Failed to save theme');
        return;
      }

      await refreshAgency();
      alert('Theme saved successfully! The sidebar color will update.');
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Failed to save theme');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    if (!currentAgency?.id) {
      setUploadError('No agency selected');
      return;
    }

    try {
      setUploadingLogo(true);
      setUploadError(null);

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;

          // Get session token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Not authenticated');
          }

          // Upload logo via API
          const response = await fetch(`/api/v1/agencies/${currentAgency.id}/logo`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_data: base64Data,
              file_name: file.name,
              content_type: file.type,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload logo');
          }

          const result = await response.json();

          // Update local state with new logo
          setAgencyData(prev => ({
            ...prev,
            logo_url: result.data.logo_url
          }));

          // Refresh agency context
          await refreshAgency();

          alert('Agency logo uploaded successfully!');
        } catch (error) {
          console.error('Logo upload error:', error);
          setUploadError(error.message);
        } finally {
          setUploadingLogo(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read file');
        setUploadingLogo(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Logo upload error:', error);
      setUploadError(error.message);
      setUploadingLogo(false);
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

  return (<>
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
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'branding'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-purple-400'
            }`}
          >
            <Palette className="inline h-4 w-4 mr-2" />
            Branding
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
          <button
            onClick={() => setActiveTab('danger')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'danger'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-red-400'
            }`}
          >
            <AlertTriangle className="inline h-4 w-4 mr-2" />
            Danger Zone
          </button>
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6 space-y-6">
          {uploadError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
              {uploadError}
            </div>
          )}

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
              Agency Logo
            </label>
            <div className="flex items-center space-x-4">
              {/* Logo Preview */}
              <div className="relative">
                {agencyData.logo_url ? (
                  <img
                    src={agencyData.logo_url}
                    alt="Agency logo"
                    className="h-20 w-20 rounded-lg object-cover border-2 border-gray-600"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                    <Building2 className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 5MB. Recommended: 200x200px
                </p>
              </div>
            </div>

            {/* URL Input (optional) */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Or paste logo URL
              </label>
              <input
                type="text"
                value={agencyData.logo_url}
                onChange={(e) => setAgencyData({ ...agencyData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
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
        <div className="space-y-6">
          {/* Seat Usage Card */}
          <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Seats
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Manage your team members and seat allocation
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </button>
            </div>

            {/* Seat Progress Bar */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Seat Usage</span>
                <span className="text-lg font-semibold text-white">
                  {members.length} / {currentAgency.max_users}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    members.length >= currentAgency.max_users
                      ? 'bg-red-500'
                      : members.length / currentAgency.max_users > 0.8
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((members.length / currentAgency.max_users) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Free seats: </span>
                  <span className="text-white font-medium">3</span>
                </div>
                <div>
                  <span className="text-gray-400">Additional seats: </span>
                  <span className="text-white font-medium">
                    {Math.max(currentAgency.max_users - 3, 0)} × $12/mo
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Available: </span>
                  <span className={`font-medium ${
                    currentAgency.max_users - members.length > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {Math.max(currentAgency.max_users - members.length, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Monthly cost: </span>
                  <span className="text-yellow-400 font-semibold">
                    ${Math.max((currentAgency.max_users - 3) * 12, 0)}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Current Members</h4>
            <div className="space-y-3">
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
      </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 ring-2 ring-purple-500/30">
                <Palette className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Sidebar Theme</h2>
                <p className="text-gray-400">
                  Choose a color theme for this agency's sidebar. This theme only affects this agency and will be visible to all team members.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Presets Grid */}
          <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Available Themes</h3>
            <p className="text-sm text-gray-400 mb-6">
              Select a theme and click "Apply Theme" to save. Each agency can have one active theme.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.values(THEME_PRESETS).map((preset) => {
                const isSelected = selectedTheme === preset.id;
                const isDefault = preset.id === 'default';

                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedTheme(preset.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    {/* Color Preview */}
                    <div
                      className="w-full h-12 rounded-lg mb-3 shadow-inner overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg,
                          hsl(${preset.colors.gradientStart}) 0%,
                          hsl(${preset.colors.gradientMid}) 50%,
                          hsl(${preset.colors.gradientEnd}) 100%)`
                      }}
                    >
                      {/* Accent color indicator */}
                      <div
                        className="w-3 h-full float-right"
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                    </div>

                    {/* Theme Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm flex items-center gap-2">
                          {preset.name}
                          {isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-medium">
                              DEFAULT
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
                      </div>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-purple-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Lock icon for default */}
                    {isDefault && (
                      <div className="absolute top-2 right-2 p-1 bg-gray-800/80 rounded-full">
                        <Lock className="h-3 w-3 text-gray-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Current Selection Info */}
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg shadow-lg"
                    style={{
                      background: `linear-gradient(135deg,
                        hsl(${getPreset(selectedTheme).colors.gradientStart}) 0%,
                        hsl(${getPreset(selectedTheme).colors.gradientEnd}) 100%)`
                    }}
                  />
                  <div>
                    <p className="font-medium text-white">
                      Selected: {getPreset(selectedTheme).name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedTheme === (currentAgency?.settings?.theme || 'default')
                        ? 'Currently active'
                        : 'Click "Apply Theme" to activate'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSaveTheme(selectedTheme)}
                  disabled={savingTheme || selectedTheme === (currentAgency?.settings?.theme || 'default')}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    selectedTheme === (currentAgency?.settings?.theme || 'default')
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg hover:shadow-purple-500/30'
                  }`}
                >
                  {savingTheme ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Palette className="h-4 w-4" />
                      Apply Theme
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="p-1 bg-blue-500/20 rounded">
                <Palette className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-300 font-medium">Theme Scope</p>
                <p className="text-xs text-blue-400/80 mt-1">
                  This theme only applies to this agency. Other agencies will use their own selected themes.
                  All team members in this agency will see the same sidebar color.
                </p>
              </div>
            </div>
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

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="space-y-6">
          {/* Danger Zone Header */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-500/20 ring-2 ring-red-500/30">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
                <p className="text-gray-400">
                  These actions are permanent and cannot be undone. Please proceed with caution.
                </p>
              </div>
            </div>
          </div>

          {/* Delete Agency Section */}
          <div className="bg-[#1a1d24] border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  Delete Agency
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Permanently delete this agency and all of its data. This will remove:
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    All team members and their access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    All agency settings and customizations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Associated subscription and billing
                  </li>
                </ul>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">
                    This action cannot be undone. Please be certain.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-red-500/30 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Agency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Invite Member Modal */}
    <InviteMemberModal
      isOpen={showInviteModal}
      onClose={() => setShowInviteModal(false)}
      onSuccess={() => {
        loadMembers();
        console.log('Member invited successfully from Agency Settings');
      }}
    />

    {/* Delete Agency Modal */}
    <DeleteAgencyModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={handleDeleteAgency}
      agencyName={currentAgency?.name}
      agencyLogo={currentAgency?.logo_url}
      isDeleting={isDeleting}
    />
  </>);
}
