import React, { useState, useEffect } from 'react';
import { X, Copy, Check, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import { localStorageGet, localStorageSet } from '../utils/safeStorage';
import axios from 'axios';

const AffiliatePopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { session, user } = useSupabase();
  const [affiliateCode, setAffiliateCode] = useState(null);
  const [userFirstName, setUserFirstName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Get user profile and check for existing affiliate account when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();

      // Check localStorage first for cached affiliate code
      if (user?.id) {
        const cachedCode = localStorageGet(`affiliate_code_${user.id}`);
        if (cachedCode) {
          console.log('✅ Loaded cached affiliate code:', cachedCode);
          setAffiliateCode(cachedCode);
        }
      }

      // Then check server for latest
      if (session) {
        checkExistingAffiliate();
      }
    }
  }, [isOpen, session, user?.id]);

  // Helper function to capitalize first letter, lowercase rest
  const formatFirstName = (name) => {
    if (!name || name === 'User') return name;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const fetchUserProfile = async () => {
    try {
      console.log('📋 User object:', user);
      console.log('📋 User metadata:', user?.user_metadata);

      // Try to get first name from user metadata first (most reliable for Supabase)
      let firstName = user?.user_metadata?.first_name ||
                     user?.user_metadata?.name?.split(' ')[0] ||
                     user?.user_metadata?.full_name?.split(' ')[0];

      // If we have a first name from metadata, use it
      if (firstName) {
        const formatted = formatFirstName(firstName);
        console.log('✅ Got first name from user metadata:', formatted);
        setUserFirstName(formatted);
        return;
      }

      // Otherwise try to fetch from profile API
      if (!session?.access_token) {
        console.log('No session token, cannot fetch profile');
        // Last resort: use email username
        if (user?.email) {
          const emailName = user.email.split('@')[0];
          setUserFirstName(formatFirstName(emailName));
        }
        return;
      }

      console.log('Fetching user profile from API...');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/profile`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      );

      console.log('📋 Profile response:', response.data);

      firstName = response.data.first_name ||
                 response.data.name?.split(' ')[0] ||
                 response.data.full_name?.split(' ')[0] ||
                 user?.user_metadata?.first_name ||
                 user?.user_metadata?.name?.split(' ')[0];

      const formatted = formatFirstName(firstName || 'User');
      console.log('✅ First name set to:', formatted);
      setUserFirstName(formatted);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback to user metadata
      const firstName = user?.user_metadata?.first_name ||
                       user?.user_metadata?.name?.split(' ')[0] ||
                       user?.user_metadata?.full_name?.split(' ')[0];

      const formatted = formatFirstName(firstName || 'User');
      console.log('Using fallback first name:', formatted);
      setUserFirstName(formatted);
    }
  };

  const checkExistingAffiliate = async () => {
    try {
      setIsLoading(true);
      if (!session?.access_token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/affiliate/profile`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      );

      if (response.data?.success && response.data?.data?.referral_code) {
        const code = response.data.data.referral_code;
        setAffiliateCode(code);

        // Save to localStorage for persistence across sessions
        if (user?.id) {
          localStorageSet(`affiliate_code_${user.id}`, code);
          console.log('💾 Saved affiliate code to localStorage');
        }
      }
    } catch (err) {
      // If 404, user doesn't have affiliate account yet - this is fine
      if (err.response?.status !== 404) {
        console.error('Error checking affiliate:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinAffiliate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      if (!session?.access_token) {
        setError('Please sign in to join the affiliate program');
        setIsGenerating(false);
        return;
      }

      console.log('Joining affiliate program...');

      // Add timeout to prevent indefinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/affiliate/join`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          signal: controller.signal, // Add the abort signal for timeout
        }
      );

      clearTimeout(timeoutId); // Clear timeout since request completed

      console.log('Affiliate response:', response.data);

      // Handle successful response
      if (response.data?.success && response.data?.data?.referral_code) {
        const code = response.data.data.referral_code;
        setAffiliateCode(code);
        console.log('Affiliate code set:', code);

        // Save to localStorage for persistence
        if (user?.id) {
          localStorageSet(`affiliate_code_${user.id}`, code);
          console.log('💾 Saved affiliate code to localStorage');
        }
      } else if (response.data?.data?.referral_code) {
        // Handle case where success flag might not be present
        const code = response.data.data.referral_code;
        setAffiliateCode(code);
        console.log('Affiliate code set (no success flag):', code);

        // Save to localStorage
        if (user?.id) {
          localStorageSet(`affiliate_code_${user.id}`, code);
        }
      } else {
        console.error('Unexpected response structure:', response.data);
        setError('Received unexpected response. Please try again or contact support.');
      }
    } catch (err) {
      console.error('Error joining affiliate program:', err);

      // Handle timeout specifically
      if (err.code === 'ERR_CANCELED' || err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again. The affiliate database may not be set up yet.');
        setIsGenerating(false);
        return;
      }

      // Handle network errors
      if (!err.response) {
        setError('Network error. Please check your connection and try again. The affiliate database may not be set up yet.');
        setIsGenerating(false);
        return;
      }

      console.error('Error response:', err.response?.data);

      // Provide helpful error messages
      if (err.response?.status === 401) {
        setError('Please sign in to join the affiliate program');
      } else if (err.response?.data?.message?.includes('Affiliate tables are not set up') ||
                 err.response?.data?.message?.includes('database is not set up') ||
                 err.response?.data?.message?.includes('does not exist')) {
        setError('Database not set up yet. Please run the affiliate database migration first. Check TO-DOS.md for instructions. Hint: ' + (err.response?.data?.hint || ''));
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to join affiliate program. Please try again.');
      }
    } finally {
      // Set generating to false in the finally block to ensure it always resets
      // This covers the success case; error cases handle it in catch
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (affiliateCode) {
      // Create personalized affiliate link with user's first name
      const affiliateLink = userFirstName && userFirstName !== 'User'
        ? `https://axolop.com/?ref=${affiliateCode}&fname=${encodeURIComponent(userFirstName)}`
        : `https://axolop.com/?ref=${affiliateCode}`;

      console.log('Copying affiliate link:', affiliateLink);
      console.log('User first name:', userFirstName);

      navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoginClick = () => {
    onClose();
    navigate('/app/affiliate');
  };

  const handleRegenerateCode = async () => {
    if (!confirm('⚠️ Are you sure? This will invalidate your current referral link and create a new one. All existing links you\'ve shared will stop working.')) {
      return;
    }

    setIsRegenerating(true);
    setError(null);

    try {
      if (!session?.access_token) {
        setError('Please sign in to regenerate your code');
        return;
      }

      // Call backend to regenerate (you'll need to add this endpoint)
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/affiliate/regenerate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.data?.success && response.data?.data?.referral_code) {
        const newCode = response.data.data.referral_code;
        setAffiliateCode(newCode);

        // Update localStorage
        if (user?.id) {
          localStorageSet(`affiliate_code_${user.id}`, newCode);
        }

        console.log('✅ Code regenerated:', newCode);
      }
    } catch (err) {
      console.error('Error regenerating code:', err);
      setError(err.response?.data?.message || 'Failed to regenerate code. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl shadow-black/30">
        {/* Premium gradient background */}
        <div className="btn-premium-red rounded-xl border border-white/20">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all duration-200 border border-white/20 shadow-lg"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3 border border-white/30">
                <svg className="w-6 h-6 text-[#ff6b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Earn a passive 7+ figure income
              </h2>
              <p className="text-base text-white/90">
                by sharing Axolop with your network
              </p>
            </div>

            {/* Video Section - Compact */}
            <div className="mb-4 rounded-lg overflow-hidden bg-black/50 aspect-video relative group border border-white/20">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#ff6b4a]/20 to-[#3F0D28]/20">
                <div className="text-center text-white">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <svg className="w-6 h-6 text-[#ff6b4a]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-xs text-white/70 font-medium">Watch how it works</p>
                </div>
              </div>
            </div>

            {/* How it works section */}
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white mb-3 text-center">How it works?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8566] flex items-center justify-center text-white font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Copy your personalized link</h4>
                    <p className="text-white/80 text-xs">Your unique referral link includes your name for a personal touch.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8566] flex items-center justify-center text-white font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Share with your network</h4>
                    <p className="text-white/80 text-xs">Share on social media, with clients, or your email list. We'll close them on the phone.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8566] flex items-center justify-center text-white font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Earn 40% recurring commission</h4>
                    <p className="text-white/80 text-xs">You get a 40% recurring commission for every paying customer you refer.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral link section */}
            {!affiliateCode ? (
              <div className="space-y-3">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleJoinAffiliate}
                  disabled={isGenerating}
                  className="w-full py-3 px-5 rounded-lg bg-gradient-to-r from-[#ff6b4a] to-[#ff8566] hover:from-[#ff8566] hover:to-[#ffa088] text-white font-semibold text-base shadow-lg shadow-[#ff6b4a]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-[#ff6b4a]/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">
                    {isGenerating ? 'Generating your link...' : 'Join Affiliate Program'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/10 border border-white/30">
                  <input
                    type="text"
                    value={userFirstName && userFirstName !== 'User'
                      ? `https://axolop.com/?ref=${affiliateCode}&fname=${encodeURIComponent(userFirstName)}`
                      : `https://axolop.com/?ref=${affiliateCode}`
                    }
                    readOnly
                    className="flex-1 bg-transparent text-white outline-none placeholder-white/60 font-mono text-xs py-1.5"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-[#ff6b4a] to-[#ff8566] hover:from-[#ff8566] hover:to-[#ffa088] text-white font-semibold text-sm transition-all duration-200 flex-shrink-0 border border-[#ff6b4a]/30 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 flex items-center">
                      {copied ? (
                        <>
                          <Check className="mr-1" size={14} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1" size={14} /> Copy
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={handleRegenerateCode}
                    disabled={isRegenerating}
                    className="flex items-center gap-1 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-all duration-200 flex-shrink-0 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Regenerate code (invalidates current link)"
                  >
                    <RefreshCw className={isRegenerating ? 'animate-spin' : ''} size={14} />
                  </button>
                </div>
                {userFirstName && userFirstName !== 'User' ? (
                  <p className="text-xs text-white/70 text-center">
                    Your personalized link will show "<span className="font-semibold text-white">{formatFirstName(userFirstName)}</span> invited you to try Axolop" on the landing page
                  </p>
                ) : (
                  <p className="text-xs text-white/70 text-center">
                    Share this link to earn 40% recurring commission on all referrals
                  </p>
                )}
              </div>
            )}

            {/* Login link */}
            <div className="mt-4 text-center pt-3 border-t border-white/20">
              <button
                onClick={handleLoginClick}
                className="text-[#ff6b4a] hover:text-[#ff8566] font-medium transition-colors text-xs"
              >
                Login to your affiliate dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePopup;
