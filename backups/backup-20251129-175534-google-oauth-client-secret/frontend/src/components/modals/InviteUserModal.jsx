import { useState } from "react";
import {
  X,
  Mail,
  User,
  Shield,
  Loader2,
  CheckCircle,
  UserPlus,
  Crown,
  Eye,
} from "lucide-react";
import { useAgency } from "@/hooks/useAgency";
import { useSupabase } from "@/context/SupabaseContext";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

export default function InviteUserModal({ isOpen, onClose, agencyId }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { supabase } = useSupabase();
  const { currentAgency, refreshAgencies } = useAgency();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "/api"}/invites`,
        {
          agencyId: agencyId || currentAgency?.id,
          email,
          name,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.data.success) {
        setSuccess(true);
        toast({
          title: "Invitation Sent! ✅",
          description: `An invitation has been sent to ${email}`,
        });

        setTimeout(() => {
          setSuccess(false);
          setEmail("");
          setName("");
          setRole("member");
          refreshAgencies();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Invitation Failed",
        description:
          error.response?.data?.error ||
          "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Success State */}
        {success ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">
              Invitation Sent!
            </h3>
            <p className="text-gray-700 text-lg">
              {email} will receive an email with instructions to join your team.
            </p>
          </div>
        ) : (
          <>
            {/* Header - Clean white design */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-sm">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">
                    Invite Team Member
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Add someone to {currentAgency?.name || "your agency"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form - Clean like command palette */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Email Input - Clean white design */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 ml-1">
                    Email Address
                  </label>
                  <div
                    className={`relative group transition-all duration-200 ${
                      focusedField === "email"
                        ? "ring-2 ring-black/20"
                        : "ring-1 ring-gray-300"
                    } rounded-xl bg-white border border-gray-300`}
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail
                        className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === "email"
                            ? "text-black"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="colleague@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent text-black placeholder-gray-500 rounded-xl outline-none text-base"
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 ml-1">
                    Full Name (Optional)
                  </label>
                  <div
                    className={`relative group transition-all duration-200 ${
                      focusedField === "name"
                        ? "ring-2 ring-black/20"
                        : "ring-1 ring-gray-300"
                    } rounded-xl bg-white border border-gray-300`}
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User
                        className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === "name"
                            ? "text-black"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent text-black placeholder-gray-500 rounded-xl outline-none text-base"
                    />
                  </div>
                </div>

                {/* Role Selection - Clean white cards */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3 ml-1">
                    Role & Permissions
                  </label>
                  <div className="space-y-2">
                    {/* Admin Option */}
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                        role === "admin"
                          ? "border-black bg-gray-50 shadow-sm"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center mt-0.5 ${
                            role === "admin"
                              ? "border-black bg-black"
                              : "border-gray-400 group-hover:border-gray-500"
                          }`}
                        >
                          {role === "admin" && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Crown
                              className={`h-4 w-4 ${
                                role === "admin"
                                  ? "text-black"
                                  : "text-gray-500"
                              }`}
                            />
                            <span
                              className={`font-semibold ${
                                role === "admin"
                                  ? "text-black"
                                  : "text-gray-700"
                              }`}
                            >
                              Admin
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Full access to manage agency and settings
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Member Option */}
                    <button
                      type="button"
                      onClick={() => setRole("member")}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                        role === "member"
                          ? "border-black bg-gray-50 shadow-sm"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center mt-0.5 ${
                            role === "member"
                              ? "border-black bg-black"
                              : "border-gray-400 group-hover:border-gray-500"
                          }`}
                        >
                          {role === "member" && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield
                              className={`h-4 w-4 ${
                                role === "member"
                                  ? "text-black"
                                  : "text-gray-500"
                              }`}
                            />
                            <span
                              className={`font-semibold ${
                                role === "member"
                                  ? "text-black"
                                  : "text-gray-700"
                              }`}
                            >
                              Member
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Can view data, limited editing permissions
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Viewer Option */}
                    <button
                      type="button"
                      onClick={() => setRole("viewer")}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                        role === "viewer"
                          ? "border-black bg-gray-50 shadow-sm"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center mt-0.5 ${
                            role === "viewer"
                              ? "border-black bg-black"
                              : "border-gray-400 group-hover:border-gray-500"
                          }`}
                        >
                          {role === "viewer" && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye
                              className={`h-4 w-4 ${
                                role === "viewer"
                                  ? "text-black"
                                  : "text-gray-500"
                              }`}
                            />
                            <span
                              className={`font-semibold ${
                                role === "viewer"
                                  ? "text-black"
                                  : "text-gray-700"
                              }`}
                            >
                              Viewer
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Read-only access to view data
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Seat Usage Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      Seat Usage
                    </span>
                    <span className="font-bold text-black">
                      {currentAgency?.current_users_count || 0} /{" "}
                      {currentAgency?.max_users || 3}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-300"
                      style={{
                        width: `${Math.min(((currentAgency?.current_users_count || 0) / (currentAgency?.max_users || 3)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions - Clean white footer */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-300">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1 px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>sending...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Send Invite</span>
                    </>
                  )}
                </button>
              </div>

              {/* Keyboard hints - Clean style */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-gray-700">
                    Enter
                  </kbd>
                  <span>to send</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-gray-700">
                    Esc
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
