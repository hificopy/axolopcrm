/**
 * Activity Log Page
 * Full page view for agency activity audit trail
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ActivityLog from '../components/agency/ActivityLog';

export default function ActivityLogPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">Complete audit trail of all agency activities</p>
        </div>

        {/* Activity Log Component */}
        <ActivityLog limit={100} showFilters={true} />
      </div>
    </div>
  );
}
