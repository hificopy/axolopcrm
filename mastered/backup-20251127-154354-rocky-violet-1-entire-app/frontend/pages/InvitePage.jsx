import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useSupabase } from "../context/SupabaseContext";
import { useAgency } from "@/hooks/useAgency";

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
        setError("No invite code provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // If user is logged in, validate with auth
        if (user) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            const response = await fetch(
              `/api/v1/agencies/invites/${inviteCode}`,
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
              setError(result.message || "Invalid or expired invite link");
              setLoading(false);
              return;
            }

            setAgencyInfo(result.data);
          }
        } else {
          // For unauthenticated users, we can't validate but show a login prompt
          setAgencyInfo({
            agency_name: "Agency Invite",
            agency_slug: agencySlug,
            role: "member",
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error validating invite:", err);
        setError("Failed to validate invite link");
        setLoading(false);
      }
    };

    validateInvite();
  }, [inviteCode, user, supabase]);

  // Handle join action
  const handleJoin = async () => {
    if (!user) {
      // Redirect to sign-in with return URL
      const returnUrl = encodeURIComponent(
        `/invite/${agencySlug}/${inviteCode}`,
      );
      navigate(`/signin?redirect=${returnUrl}`);
      return;
    }

    try {
      setJoining(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Please sign in to join this agency");
        return;
      }

      const response = await fetch(
        `/api/v1/agencies/invites/${inviteCode}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to join agency");
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
        navigate("/app/home");
      }, 2000);
    } catch (err) {
      console.error("Error joining agency:", err);
      setError("Failed to join agency");
    } finally {
      setJoining(false);
    }
  };

  // Handle sign in redirect
  const handleSignIn = () => {
    const returnUrl = encodeURIComponent(`/invite/${agencySlug}/${inviteCode}`);
    navigate(`/signin?redirect=${returnUrl}`);
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
            You've successfully joined{" "}
            <span className="text-white font-medium">
              {agencyInfo?.agency_name}
            </span>
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Axolop
            </h1>
          </div>
          <p className="text-gray-400 text-lg">You've been invited!</p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>

          <div className="relative z-10">
            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-[#3F0D28]/20 border border-[#3F0D28]/30 rounded-lg flex items-center gap-3 text-[#CA4238]">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Unable to join</p>
                  <p className="text-sm text-[#CA4238]/80">{error}</p>
                </div>
              </div>
            )}

            {/* Agency Info */}
            {agencyInfo && !error && (
              <>
                <div className="text-center mb-8">
                  <div className="relative inline-block mb-6">
                    {agencyInfo.agency_logo_url ? (
                      <img
                        src={agencyInfo.agency_logo_url}
                        alt={agencyInfo.agency_name}
                        className="h-24 w-24 rounded-2xl object-cover mx-auto ring-4 ring-white/20 shadow-2xl"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center mx-auto ring-4 ring-purple-500/30 shadow-2xl">
                        <Building2 className="h-12 w-12 text-purple-400" />
                      </div>
                    )}
                    {/* Success ring animation */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-green-500/50 animate-pulse"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {agencyInfo.agency_name}
                  </h2>
                  <p className="text-gray-300 text-lg mb-1">
                    You have been invited to join
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
                    <UserPlus className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400 font-medium capitalize">{agencyInfo.role}</span>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="mb-8 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-green-400 font-medium">Welcome aboard!</p>
                      <p className="text-green-400/80 text-sm mt-1">
                        Join {agencyInfo.agency_name} to collaborate with your team and manage projects together.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {user ? (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold transition-all shadow-2xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Joining Agency...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-6 w-6" />
                        Join Agency Now
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleSignIn}
                      className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold transition-all shadow-2xl hover:shadow-purple-500/40 flex items-center justify-center gap-3 text-lg"
                    >
                      <LogIn className="h-6 w-6" />
                      Sign In to Join
                    </button>
                    <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-white/10">
                      <p className="text-gray-300 text-sm mb-2">
                        🎉 New to Axolop?
                      </p>
                      <p className="text-gray-400 text-xs">
                        You'll need to create an account or sign in to accept this invitation and join your team.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
