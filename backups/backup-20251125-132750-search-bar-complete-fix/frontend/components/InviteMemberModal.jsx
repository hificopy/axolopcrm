import { useState } from "react";
import { X, UserPlus, Mail, Shield, Loader2 } from "lucide-react";
import { useAgency } from "@/hooks/useAgency";
import { supabase } from "@/config/supabaseClient";

export default function InviteMemberModal({ isOpen, onClose, onSuccess }) {
  const { currentAgency, refreshAgency } = useAgency();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!currentAgency?.id) {
      setError("No agency selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Invite member via API
      const response = await fetch(
        `/api/v1/agencies/${currentAgency.id}/seats`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            role: role,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to invite member");
      }

      const result = await response.json();

      // Reset form
      setEmail("");
      setRole("member");

      // Refresh agency data
      await refreshAgency();

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error("Invite member error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("member");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center ring-2 ring-yellow-500/30">
              <UserPlus className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Invite Team Member
              </h2>
              <p className="text-sm text-gray-400">
                Add a new member to {currentAgency?.name || "your agency"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all duration-200 border border-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <div className="p-1 bg-red-500/20 rounded">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Invitation Failed</p>
                <p className="text-red-400/80 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              <Mail className="inline h-4 w-4 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full bg-gray-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
              disabled={loading}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              <Shield className="inline h-4 w-4 mr-2" />
              Role & Permissions
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-gray-800/30 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={role === "member"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-3"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="font-medium text-white">Member</p>
                  <p className="text-xs text-gray-400">
                    Can view data, limited editing permissions
                  </p>
                </div>
              </label>
              <label className="flex items-center p-3 bg-gray-800/30 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-3"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="font-medium text-white">Admin</p>
                  <p className="text-xs text-gray-400">
                    Full access to manage agency and settings
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Seat Info */}
          {currentAgency && (
            <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">
                  Seat Usage
                </span>
                <span className="text-lg font-bold text-white">
                  {currentAgency.current_users || 0} /{" "}
                  {currentAgency.max_users || 3}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (currentAgency.current_users || 0) >=
                    (currentAgency.max_users || 3)
                      ? "bg-red-500"
                      : (currentAgency.current_users || 0) /
                            (currentAgency.max_users || 3) >
                          0.8
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(((currentAgency.current_users || 0) / (currentAgency.max_users || 3)) * 100, 100)}%`,
                  }}
                />
              </div>
              {(currentAgency.current_users || 0) >=
                (currentAgency.max_users || 3) && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-400 font-medium">
                    ⚠️ You're at max capacity. Upgrade your plan to invite more
                    members.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold rounded-xl transition-all border border-white/10"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (currentAgency?.current_users || 0) >=
                  (currentAgency?.max_users || 3)
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
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
