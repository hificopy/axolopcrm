import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Loader2, CheckCircle, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { useAgency } from './hooks/useAgency';

export default function InvitePage() {
  const { agencySlug, inviteCode } = useParams();
  const navigate = useNavigate();
  const { user, supabase } = useSupabase();
  const { refreshAgencies, selectAgency } = useAgency();

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Validate invite code on mount
  useEffect(() => {
    const validateInvite = async () => {
      if (!inviteCode) {
        setError('No invite code provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // If user is logged in, validate with auth
        if (user) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const response = await fetch(`/api/v1/agencies/invites/${inviteCode}`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
              setError(result.message || 'Invalid or expired invite link');
              setLoading(false);
              return;
            }

            setAgencyInfo(result.data);
          }
        } else {
          // For unauthenticated users, we can't validate but show a login prompt
          setAgencyInfo({
            agency_name: 'Agency Invite',
            agency_slug: agencySlug,
            role: 'member'
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error validating invite:', err);
        setError('Failed to validate invite link');
        setLoading(false);
      }
    };

    validateInvite();
  }, [inviteCode, user, supabase]);

  // Handle join action
  const handleJoin = async () => {
    if (!user) {
      // Redirect to sign-in with return URL
      const returnUrl = encodeURIComponent(`/invite/${agencySlug}/${inviteCode}`);
      navigate(`/sign-in?redirect=${returnUrl}`);
      return;
    }

    try {
      setJoining(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to join this agency');
        return;
      }

      const response = await fetch(`/api/v1/agencies/invites/${inviteCode}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to join agency');
        return;
      }

      setJoinSuccess(true);

      // Refresh agencies and select the new one
      await refreshAgencies();
      if (result.data?.agency_id) {
        await selectAgency(result.data.agency_id);
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error joining agency:', err);
      setError('Failed to join agency');
    } finally {
      setJoining(false);
    }
  };

  // Handle sign in redirect
  const handleSignIn = () => {
    const returnUrl = encodeURIComponent(`/invite/${agencySlug}/${inviteCode}`);
    navigate(`/sign-in?redirect=${returnUrl}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Validating invite...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (joinSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl border border-green-500/30 p-8 text-center shadow-2xl">
          <div className="p-4 rounded-full bg-green-500/20 w-fit mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-gray-400 mb-6">
            You've successfully joined <span className="text-white font-medium">{agencyInfo?.agency_name}</span>
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Axolop
          </h1>
          <p className="text-gray-400 mt-1">Agency Invite</p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

          <div className="relative z-10">
            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Unable to join</p>
                  <p className="text-sm text-red-400/80">{error}</p>
                </div>
              </div>
            )}

            {/* Agency Info */}
            {agencyInfo && !error && (
              <>
                <div className="text-center mb-6">
                  {agencyInfo.agency_logo_url ? (
                    <img
                      src={agencyInfo.agency_logo_url}
                      alt={agencyInfo.agency_name}
                      className="h-20 w-20 rounded-2xl object-cover mx-auto ring-2 ring-white/20 mb-4"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto ring-2 ring-purple-500/30 mb-4">
                      <Building2 className="h-10 w-10 text-purple-400" />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-white">
                    {agencyInfo.agency_name}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    You've been invited to join this agency
                  </p>
                </div>

                {/* Role Badge */}
                <div className="mb-6 p-3 bg-gray-700/30 rounded-lg text-center">
                  <p className="text-sm text-gray-400">
                    You'll join as: <span className="text-purple-400 font-medium capitalize">{agencyInfo.role}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                {user ? (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-bold transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        Join Agency
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleSignIn}
                      className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-bold transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-5 w-5" />
                      Sign in to Join
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      You need to sign in or create an account to join this agency
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
