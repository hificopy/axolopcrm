import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Link2,
  Building2,
  Loader2,
  CheckCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { useAgency } from "../hooks/useAgency";
import { supabase } from "@/config/supabaseClient";

export default function JoinAgencyModal({ isOpen, onClose, onSuccess }) {
  const { refreshAgencies, selectAgency } = useAgency();
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [agencyPreview, setAgencyPreview] = useState(null);

  // Parse and validate the invite URL/code
  const handleValidate = async () => {
    if (!inviteUrl.trim()) {
      setError("Please enter an invite link or code");
      return;
    }

    try {
      setValidating(true);
      setError(null);
      setAgencyPreview(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Please sign in to join an agency");
        return;
      }

      const response = await fetch("/api/v1/agencies/invites/parse-url", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: inviteUrl.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Invalid invite link");
        return;
      }

      setAgencyPreview(result.data);
    } catch (err) {
      console.error("Validation error:", err);
      setError("Failed to validate invite link");
    } finally {
      setValidating(false);
    }
  };

  // Join the agency using the invite code
  const handleJoin = async () => {
    if (!agencyPreview?.invite_code) {
      setError("Please validate the invite link first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Please sign in to join an agency");
        return;
      }

      const response = await fetch(
        `/api/v1/agencies/invites/${agencyPreview.invite_code}/join`,
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

      // Refresh agencies list
      await refreshAgencies();

      // Select the new agency
      if (result.data?.agency_id) {
        await selectAgency(result.data.agency_id);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Reset and close
      handleClose();
    } catch (err) {
      console.error("Join error:", err);
      setError("Failed to join agency");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInviteUrl("");
    setError(null);
    setAgencyPreview(null);
    setLoading(false);
    setValidating(false);
    onClose();
  };

  // Handle input change and auto-validate
  const handleInputChange = (e) => {
    setInviteUrl(e.target.value);
    setError(null);
    setAgencyPreview(null);
  };

  // Handle paste event for auto-validation
  const handlePaste = async (e) => {
    const pastedText = e.clipboardData.getData("text");
    setInviteUrl(pastedText);
    setError(null);
    setAgencyPreview(null);

    // Auto-validate after a short delay
    setTimeout(async () => {
      if (pastedText.trim()) {
        setValidating(true);
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch("/api/v1/agencies/invites/parse-url", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: pastedText.trim() }),
          });

          const result = await response.json();
          if (response.ok && result.success) {
            setAgencyPreview(result.data);
          }
        } catch (err) {
          console.error("Auto-validate error:", err);
        } finally {
          setValidating(false);
        }
      }
    }, 300);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28]/5 via-transparent to-[#5a1a3a]/5 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#3F0D28]/20 to-[#5a1a3a]/20 ring-1 ring-[#3F0D28]/30">
                <UserPlus className="h-5 w-5 text-[#3F0D28]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Join Agency</h2>
                <p className="text-sm text-gray-400">
                  Enter an invite link to join
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Invite URL input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Link2 className="inline h-4 w-4 mr-1.5" />
                Invite Link or Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inviteUrl}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  placeholder="axolop.com/invite/agency/CODE or just CODE"
                  className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3F0D28]/50 focus:border-[#3F0D28]/50 transition-all pr-24"
                  disabled={loading}
                />
                <button
                  onClick={handleValidate}
                  disabled={validating || loading || !inviteUrl.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-[#3F0D28]/20 hover:bg-[#3F0D28]/30 text-[#3F0D28] text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Paste the invite link shared with you or just the 8-character
                code
              </p>
            </div>

            {/* Agency Preview */}
            {agencyPreview && (
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-green-400 font-medium">
                    Valid Invite
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {agencyPreview.agency_logo_url ? (
                    <img
                      src={agencyPreview.agency_logo_url}
                      alt={agencyPreview.agency_name}
                      className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-2 ring-white/10">
                      <Building2 className="h-7 w-7 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {agencyPreview.agency_name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      You'll join as:{" "}
                      <span className="text-[#3F0D28] font-medium capitalize">
                        {agencyPreview.role}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Help text */}
            <div className="p-3 bg-gray-800/30 border border-white/5 rounded-lg">
              <p className="text-xs text-gray-400">
                <span className="text-gray-300 font-medium">
                  How to get an invite:
                </span>{" "}
                Ask the agency admin to generate an invite link from their
                Agency Settings and share it with you.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold transition-all border border-white/10"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={loading || !agencyPreview}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#3F0D28] to-[#5a1a3a] hover:from-[#5a1a3a] hover:to-[#a13328] text-white font-bold transition-all shadow-lg hover:shadow-[#3F0D28]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Join Agency
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
