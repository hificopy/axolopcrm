import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Mail, Phone, Calendar, Globe, X, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { useSupabase } from '../context/SupabaseContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { supabase } from '../config/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function Profile() {
  const { user: supabaseUser } = useSupabase();
  const { isDemoMode, disableDemoMode } = useDemoMode();

  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    id: supabaseUser?.id || '1',
    name: supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || 'Juan D. Romero',
    email: supabaseUser?.email || 'axolopcrm@gmail.com',
    title: supabaseUser?.user_metadata?.title || 'CEO',
    company: supabaseUser?.user_metadata?.company || 'Axolop LLC',
    phone: supabaseUser?.user_metadata?.phone || supabaseUser?.phone || '+1 813-536-3540',
    location: supabaseUser?.user_metadata?.location || 'Tampa, FL',
    timezone: supabaseUser?.user_metadata?.timezone || 'America/New_York',
    role: 'Admin',
    joinDate: supabaseUser?.created_at ? new Date(supabaseUser.created_at).toISOString().split('T')[0] : '2024-01-15',
    bio: supabaseUser?.user_metadata?.bio || 'Passionate entrepreneur focused on building innovative CRM solutions and AI-powered systems for businesses.',
    avatar: supabaseUser?.user_metadata?.avatar_url || supabaseUser?.user_metadata?.picture || null,
    website: supabaseUser?.user_metadata?.website || 'https://axolop.com',
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Update user state when supabaseUser changes
  useEffect(() => {
    if (supabaseUser) {
      setUser({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        email: supabaseUser.email,
        title: supabaseUser.user_metadata?.title || 'CEO',
        company: supabaseUser.user_metadata?.company || 'Axolop LLC',
        phone: supabaseUser.user_metadata?.phone || supabaseUser.phone || '+1 813-536-3540',
        location: supabaseUser.user_metadata?.location || 'Tampa, FL',
        timezone: supabaseUser.user_metadata?.timezone || 'America/New_York',
        role: 'Admin',
        joinDate: supabaseUser.created_at ? new Date(supabaseUser.created_at).toISOString().split('T')[0] : '2024-01-15',
        bio: supabaseUser.user_metadata?.bio || 'Passionate entrepreneur focused on building innovative CRM solutions and AI-powered systems for businesses.',
        avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
        website: supabaseUser.user_metadata?.website || 'https://axolop.com',
      });
    }
  }, [supabaseUser]);

  const [formData, setFormData] = useState({ ...user });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
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

    try {
      setUploadingAvatar(true);
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

          // Upload avatar via API
          const response = await fetch(`${API_BASE_URL}/api/v1/users/me/avatar`, {
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
            throw new Error(errorData.message || 'Failed to upload avatar');
          }

          const result = await response.json();

          // Update local user state with new avatar
          setUser(prev => ({
            ...prev,
            avatar: result.data.profile_picture
          }));

          setFormData(prev => ({
            ...prev,
            avatar: result.data.profile_picture
          }));

          // Refresh the page to update avatar in header
          window.location.reload();
        } catch (error) {
          console.error('Avatar upload error:', error);
          setUploadError(error.message);
        } finally {
          setUploadingAvatar(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read file');
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      setUploadError(error.message);
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Update profile via API
      const response = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          first_name: formData.name.split(' ')[0],
          last_name: formData.name.split(' ').slice(1).join(' '),
          phone: formData.phone,
          company: formData.company,
          job_title: formData.title,
          timezone: formData.timezone,
          bio: formData.bio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Profile</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage your personal account information
            </p>
          </div>

          {/* Biz Tester Mode Exit Button - Only for axolopcrm@gmail.com */}
          {supabaseUser?.email === 'axolopcrm@gmail.com' && isDemoMode && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                <span>Biz Tester Mode</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disableDemoMode}
                className="text-xs py-1.5 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <X className="h-4 w-4 mr-1" />
                Exit Mode
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-6 mb-6">
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            <div className="flex items-start gap-6">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary">
                      {isEditing ? (
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="text-xl font-semibold text-crm-text-primary bg-transparent border-b border-gray-300 focus:border-primary focus:ring-0 -ml-2 -mr-2 -mt-1 -mb-1"
                        />
                      ) : (
                        user.name
                      )}
                    </h2>
                    <p className="text-crm-text-secondary">
                      {isEditing ? (
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="text-crm-text-secondary bg-transparent border-b border-gray-300 focus:border-primary focus:ring-0 -ml-2 -mr-2 -mt-1 -mb-1"
                        />
                      ) : (
                        user.title
                      )}
                    </p>
                  </div>
                  
                  {!isEditing ? (
                    <Button 
                      variant="default" 
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button variant="default" onClick={handleSubmit}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-crm-text-secondary">
                    <Mail className="h-4 w-4" />
                    {isEditing ? (
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-none bg-transparent border-b border-gray-300 focus:border-primary focus:ring-0"
                      />
                    ) : (
                      user.email
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-crm-text-secondary">
                    <Phone className="h-4 w-4" />
                    {isEditing ? (
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="border-none bg-transparent border-b border-gray-300 focus:border-primary focus:ring-0"
                      />
                    ) : (
                      user.phone
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-crm-text-secondary">
                    <MapPin className="h-4 w-4" />
                    {isEditing ? (
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="border-none bg-transparent border-b border-gray-300 focus:border-primary focus:ring-0"
                      />
                    ) : (
                      user.location
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-crm-text-secondary">
                    <Globe className="h-4 w-4" />
                    {isEditing ? (
                      <Input
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="border-none bg-transparent border-b border-gray-300 focus:border-primary focus:ring-0"
                      />
                    ) : (
                      user.timezone
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-6">
              <h3 className="text-lg font-semibold text-crm-text-primary mb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-crm-text-secondary mb-1">
                    Bio
                  </Label>
                  {isEditing ? (
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-crm-text-primary">
                      {user.bio}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-crm-text-secondary mb-1">
                      Company
                    </Label>
                    {isEditing ? (
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-crm-text-primary">{user.company}</p>
                    )}
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-crm-text-secondary mb-1">
                      Join Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        name="joinDate"
                        value={formData.joinDate}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-crm-text-primary">{new Date(user.joinDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-6">
              <h3 className="text-lg font-semibold text-crm-text-primary mb-4">Account Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                    Role
                  </label>
                  <p className="text-crm-text-primary">{user.role}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-crm-text-secondary mb-1">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                    />
                  ) : (
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {user.website}
                    </a>
                  )}
                </div>

                <div className="pt-4">
                  <h4 className="text-md font-medium text-crm-text-primary mb-2">Account Status</h4>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary-green"></div>
                    <span className="text-sm text-crm-text-secondary">Active</span>
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