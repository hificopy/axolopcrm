import { useState } from 'react';
import { X, UserPlus, Mail, Shield, Loader2 } from 'lucide-react';
import { useAgency } from '@/hooks/useAgency';
import { supabase } from './config/supabaseClient';

export default function InviteMemberModal({ isOpen, onClose, onSuccess }) {
  const { currentAgency, refreshAgency } = useAgency();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!currentAgency?.id) {
      setError('No agency selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Invite member via API
      const response = await fetch(`/api/v1/agencies/${currentAgency.id}/seats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          role: role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to invite member');
      }

      const result = await response.json();

      // Reset form
      setEmail('');
      setRole('member');

      // Refresh agency data
      await refreshAgency();

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Invite member error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#1a1d24] border border-gray-700 rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Invite Team Member</h2>
              <p className="text-sm text-gray-400">Add a new member to your agency</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              disabled={loading}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Shield className="inline h-4 w-4 mr-1" />
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              disabled={loading}
            >
              <option value="member">Member (Read-only)</option>
              <option value="admin">Admin (Full access)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1.5">
              {role === 'member'
                ? 'Members can view data but cannot edit or delete.'
                : 'Admins have full access to manage the agency.'}
            </p>
          </div>

          {/* Seat Info */}
          {currentAgency && (
            <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Seats</span>
                <span className="text-white font-medium">
                  {currentAgency.current_users || 0} / {currentAgency.max_users || 3}
                </span>
              </div>
              {currentAgency.current_users >= currentAgency.max_users && (
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠️ You're at max capacity. Upgrade seats to invite more members.
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inviting...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
