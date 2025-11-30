import { Helmet } from 'react-helmet-async';
import UserTypeDebug from '../components/UserTypeDebug';

export default function TestUserType() {
  return (
    <>
      <Helmet>
        <title>User Type Test - Axolop CRM</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">User Type API Test</h1>
            <p className="mt-2 text-gray-600">
              Testing the user type detection and permissions system
            </p>
          </div>

          <UserTypeDebug />

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Check that your user type is correctly identified</li>
              <li>Verify your tier and permissions are accurate</li>
              <li>If you're an admin, you should see "Can Edit" = true</li>
              <li>If you're a seated user, you should see "Read-Only" badge</li>
              <li>Check the Raw JSON at the bottom for complete data</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
