/**
 * Bulk Role Assignment Component
 * Allows assigning roles to multiple members at once
 */

import { useState, useEffect } from 'react';
import { useRoles } from '../../context/RolesContext';
import { useAgency } from '../../context/AgencyContext';
import { supabase } from '../../config/supabaseClient';
import {
  Users,
  Shield,
  Check,
  X,
  ChevronDown,
  Search,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BulkRoleAssignment({ onComplete }) {
  const { agencyRoles, assignRoleToMember } = useRoles();
  const { currentAgency } = useAgency();

  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ success: [], failed: [] });
  const [showResults, setShowResults] = useState(false);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentAgency?.id) return;

      try {
        const { data, error } = await supabase
          .from('agency_members')
          .select(`
            id,
            user_id,
            role,
            member_type,
            user_profiles:user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('agency_id', currentAgency.id)
          .eq('invitation_status', 'active')
          .neq('member_type', 'owner'); // Exclude owners

        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        console.error('Error fetching members:', err);
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentAgency?.id]);

  // Filter members by search
  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = member.user_profiles?.full_name?.toLowerCase() || '';
    const email = member.user_profiles?.email?.toLowerCase() || '';
    return name.includes(query) || email.includes(query);
  });

  // Toggle member selection
  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Select all filtered members
  const selectAll = () => {
    const allIds = filteredMembers.map(m => m.id);
    setSelectedMembers(prev => {
      const newSelection = [...prev];
      allIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedMembers([]);
  };

  // Assign role to selected members
  const handleBulkAssign = async () => {
    if (!selectedRole || selectedMembers.length === 0) {
      toast.error('Please select a role and at least one member');
      return;
    }

    setAssigning(true);
    setResults({ success: [], failed: [] });

    const successList = [];
    const failedList = [];

    for (const memberId of selectedMembers) {
      try {
        await assignRoleToMember(memberId, selectedRole.id);
        const member = members.find(m => m.id === memberId);
        successList.push({
          memberId,
          name: member?.user_profiles?.full_name || member?.user_profiles?.email
        });
      } catch (err) {
        const member = members.find(m => m.id === memberId);
        failedList.push({
          memberId,
          name: member?.user_profiles?.full_name || member?.user_profiles?.email,
          error: err.message
        });
      }
    }

    setResults({ success: successList, failed: failedList });
    setShowResults(true);

    if (successList.length > 0) {
      toast.success(`Role assigned to ${successList.length} member(s)`);
    }
    if (failedList.length > 0) {
      toast.error(`Failed to assign role to ${failedList.length} member(s)`);
    }

    setAssigning(false);
    setSelectedMembers([]);

    if (onComplete) {
      onComplete({ success: successList, failed: failedList });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bulk Role Assignment</h3>
          <p className="text-sm text-gray-600">
            Assign a role to multiple team members at once
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{selectedMembers.length} selected</span>
        </div>
      </div>

      {/* Role Selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Role to Assign
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {agencyRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                selectedRole?.id === role.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-white'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: role.color || '#6b7280' }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {role.display_name || role.name}
                </div>
              </div>
              {selectedRole?.id === role.id && (
                <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        {agencyRoles.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No custom roles available. Create roles first in the Roles settings.
          </p>
        )}
      </div>

      {/* Member Selection */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search and Actions */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={deselectAll}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No members found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMembers.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                const profile = member.user_profiles;

                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {profile?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {profile?.email}
                      </div>
                    </div>

                    {/* Current Role */}
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Current:</span>
                      <div className="text-sm font-medium text-gray-600">
                        {member.role || member.member_type || 'No role'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {selectedMembers.length > 0 && selectedRole && (
            <span>
              Assign <strong>{selectedRole.display_name || selectedRole.name}</strong> to{' '}
              <strong>{selectedMembers.length}</strong> member(s)
            </span>
          )}
        </div>
        <button
          onClick={handleBulkAssign}
          disabled={!selectedRole || selectedMembers.length === 0 || assigning}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedRole && selectedMembers.length > 0 && !assigning
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {assigning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Assigning...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Assign Role
            </>
          )}
        </button>
      </div>

      {/* Results Modal */}
      {showResults && (results.success.length > 0 || results.failed.length > 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Assignment Results</h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {results.success.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Successfully assigned ({results.success.length})</span>
                  </div>
                  <ul className="space-y-1 ml-7">
                    {results.success.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">{item.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.failed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Failed ({results.failed.length})</span>
                  </div>
                  <ul className="space-y-1 ml-7">
                    {results.failed.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {item.name} - {item.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
