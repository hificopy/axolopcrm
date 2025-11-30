import React, { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

const AuthTest = () => {
  const { user, session, supabase, loading } = useSupabase();
  const [testResults, setTestResults] = useState({
    supabaseClient: null,
    envVars: null,
    session: null,
    user: null,
    backendConnection: null,
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    runTests();
  }, [user, session, supabase]);

  const runTests = async () => {
    setTesting(true);
    const results = {};

    // Test 1: Supabase Client
    results.supabaseClient = supabase ? 'pass' : 'fail';

    // Test 2: Environment Variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    results.envVars = (supabaseUrl && supabaseKey) ? 'pass' : 'fail';

    // Test 3: Session
    results.session = session ? 'pass' : 'warn';

    // Test 4: User
    results.user = user ? 'pass' : 'warn';

    // Test 5: Backend Connection
    try {
      if (session?.access_token) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        results.backendConnection = response.ok ? 'pass' : 'fail';
      } else {
        results.backendConnection = 'warn';
      }
    } catch (error) {
      results.backendConnection = 'fail';
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-[#761B14]" />;
    if (status === 'warn') return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
  };

  const getStatusText = (status) => {
    if (status === 'pass') return 'Pass';
    if (status === 'fail') return 'Fail';
    if (status === 'warn') return 'Warning';
    return 'Testing...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Authentication System Test</h1>
          <p className="text-gray-400 mb-8">Verify your Supabase authentication setup</p>

          {/* Test Results */}
          <div className="space-y-4 mb-8">
            {/* Supabase Client Test */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.supabaseClient)}
                <div>
                  <h3 className="text-white font-medium">Supabase Client Initialized</h3>
                  <p className="text-sm text-gray-400">
                    {testResults.supabaseClient === 'pass'
                      ? 'Supabase client is properly initialized'
                      : 'Supabase client failed to initialize'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-300">
                {getStatusText(testResults.supabaseClient)}
              </span>
            </div>

            {/* Environment Variables Test */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.envVars)}
                <div>
                  <h3 className="text-white font-medium">Environment Variables</h3>
                  <p className="text-sm text-gray-400">
                    {testResults.envVars === 'pass'
                      ? 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set'
                      : 'Environment variables are missing'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-300">
                {getStatusText(testResults.envVars)}
              </span>
            </div>

            {/* Session Test */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.session)}
                <div>
                  <h3 className="text-white font-medium">Active Session</h3>
                  <p className="text-sm text-gray-400">
                    {testResults.session === 'pass'
                      ? 'User has an active session'
                      : 'No active session (user not signed in)'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-300">
                {getStatusText(testResults.session)}
              </span>
            </div>

            {/* User Test */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.user)}
                <div>
                  <h3 className="text-white font-medium">User Object</h3>
                  <p className="text-sm text-gray-400">
                    {testResults.user === 'pass'
                      ? `Logged in as: ${user?.email}`
                      : 'No user object (user not signed in)'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-300">
                {getStatusText(testResults.user)}
              </span>
            </div>

            {/* Backend Connection Test */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.backendConnection)}
                <div>
                  <h3 className="text-white font-medium">Backend Connection</h3>
                  <p className="text-sm text-gray-400">
                    {testResults.backendConnection === 'pass'
                      ? 'Successfully connected to backend with auth token'
                      : testResults.backendConnection === 'warn'
                      ? 'No session token to test backend connection'
                      : 'Failed to connect to backend'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-300">
                {getStatusText(testResults.backendConnection)}
              </span>
            </div>
          </div>

          {/* Session Details */}
          {session && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Session Details</h2>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <pre className="text-sm text-gray-300 overflow-auto max-h-64">
                  {JSON.stringify({
                    user: {
                      id: user?.id,
                      email: user?.email,
                      created_at: user?.created_at,
                      user_metadata: user?.user_metadata,
                    },
                    session: {
                      access_token: session?.access_token ? '***' + session.access_token.slice(-10) : null,
                      expires_at: session?.expires_at,
                    }
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Environment Configuration</h2>
            <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Supabase URL:</span>
                <span className="text-white font-mono text-sm">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Supabase Anon Key:</span>
                <span className="text-white font-mono text-sm">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-10) : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">API URL:</span>
                <span className="text-white font-mono text-sm">
                  {import.meta.env.VITE_API_URL || 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={runTests}
              disabled={testing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Rerun Tests'
              )}
            </button>
            <a
              href="/signin"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all text-center"
            >
              Go to Sign In
            </a>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <h3 className="text-blue-400 font-semibold mb-2">Troubleshooting</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• If environment variables fail: Check your .env file and restart the dev server</li>
              <li>• If session/user shows warning: Sign in at /signin to test authentication</li>
              <li>• If backend connection fails: Ensure backend server is running on port 3002</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
