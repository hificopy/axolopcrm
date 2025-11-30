import { useUserType } from '../hooks/useUserType';

/**
 * Debug component to display user type information
 * Use this to test the user type API integration
 */
export default function UserTypeDebug() {
  const { userType, loading, error, isAdmin, isSeatedUser, isGodMode, canEdit } = useUserType();

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-gray-200 rounded-lg">
        <p className="text-blue-700">Loading user type...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">Error loading user type</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900">User Type Debug Info</h2>

      {/* Quick Status Badges */}
      <div className="flex gap-2 mb-4">
        {isGodMode && (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
            👑 God Mode
          </span>
        )}
        {isAdmin && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            🔑 Agency Admin
          </span>
        )}
        {isSeatedUser && (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
            👤 Seated User (Read-Only)
          </span>
        )}
        {canEdit && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            ✏️ Can Edit
          </span>
        )}
      </div>

      {/* Full User Type Data */}
      <div className="space-y-3">
        <div>
          <span className="font-semibold text-gray-700">Type:</span>
          <span className="ml-2 text-gray-900">{userType?.type || 'Unknown'}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Tier:</span>
          <span className="ml-2 text-gray-900">{userType?.tier || 'N/A'}</span>
        </div>

        {userType?.agencies && userType.agencies.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Agencies:</span>
            <div className="mt-2 space-y-2">
              {userType.agencies.map((agency, index) => (
                <div key={index} className="pl-4 border-l-2 border-gray-300">
                  <p className="font-medium text-gray-900">{agency.name}</p>
                  <p className="text-sm text-gray-600">
                    Role: {agency.role} | Tier: {agency.tier}
                  </p>
                  {agency.maxUsers && (
                    <p className="text-sm text-gray-600">
                      Seats: {agency.currentUsers}/{agency.maxUsers}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {userType?.primaryAgency && (
          <div>
            <span className="font-semibold text-gray-700">Primary Agency:</span>
            <div className="mt-2 pl-4 border-l-2 border-blue-300">
              <p className="font-medium text-gray-900">{userType.primaryAgency.name}</p>
              <p className="text-sm text-gray-600">
                {userType.primaryAgency.tier} tier - {userType.primaryAgency.status}
              </p>
            </div>
          </div>
        )}

        {/* Permissions Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="font-semibold text-gray-700">Permissions:</span>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>
                {isAdmin ? '✓' : '✗'}
              </span>
              <span className="ml-2 text-gray-700">Admin Access</span>
            </div>
            <div className="flex items-center">
              <span className={canEdit ? 'text-green-600' : 'text-red-600'}>
                {canEdit ? '✓' : '✗'}
              </span>
              <span className="ml-2 text-gray-700">Can Edit</span>
            </div>
            <div className="flex items-center">
              <span className={userType?.canManageAgency ? 'text-green-600' : 'text-red-600'}>
                {userType?.canManageAgency ? '✓' : '✗'}
              </span>
              <span className="ml-2 text-gray-700">Manage Agency</span>
            </div>
            <div className="flex items-center">
              <span className={userType?.canManageBilling ? 'text-green-600' : 'text-red-600'}>
                {userType?.canManageBilling ? '✓' : '✗'}
              </span>
              <span className="ml-2 text-gray-700">Manage Billing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON (for debugging) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
          View Raw JSON
        </summary>
        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
          {JSON.stringify(userType, null, 2)}
        </pre>
      </details>
    </div>
  );
}
