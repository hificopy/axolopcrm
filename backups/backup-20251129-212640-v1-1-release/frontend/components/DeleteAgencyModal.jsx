import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X, Loader2, Building2 } from "lucide-react";

/**
 * DeleteAgencyModal - Confirmation modal for deleting an agency
 * Requires user to type the agency name to confirm deletion
 */
const DeleteAgencyModal = ({
  isOpen,
  onClose,
  onConfirm,
  agencyName,
  agencyLogo,
  isDeleting = false,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setError("");
    }
  }, [isOpen]);

  const isMatch =
    confirmText.trim().toLowerCase() === agencyName?.trim().toLowerCase();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isMatch) {
      setError("Agency name does not match. Please type it exactly as shown.");
      return;
    }

    onConfirm();
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with subtle orange tint for danger */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
        <div
          className="rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
          }}
        >
          {/* Subtle danger gradient at top */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all duration-200 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>

          <div className="p-6">
            {/* Warning Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 ring-2 ring-orange-500/30">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Delete Agency</h2>
                <p className="text-sm text-gray-400 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Agency being deleted */}
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                {agencyLogo ? (
                  <img
                    src={agencyLogo}
                    alt={agencyName}
                    className="h-12 w-12 rounded-lg object-cover ring-2 ring-orange-500/30"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-2 ring-orange-500/30">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{agencyName}</p>
                  <p className="text-xs text-orange-400">
                    Will be permanently deleted
                  </p>
                </div>
              </div>
            </div>

            {/* Warning message */}
            <div className="mb-6 space-y-3 text-sm text-gray-300">
              <p>Deleting this agency will:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
                <li>Remove all team members from the agency</li>
                <li>Delete all agency data and settings</li>
                <li>Cancel any active subscriptions</li>
                <li>This cannot be reversed</li>
              </ul>
            </div>

            {/* Confirmation Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type{" "}
                  <span className="font-bold text-orange-400">
                    "{agencyName}"
                  </span>{" "}
                  to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError("");
                  }}
                  disabled={isDeleting}
                  placeholder="Enter agency name"
                  className={`w-full bg-gray-800/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    error
                      ? "border-orange-500 focus:ring-orange-500/50 focus:border-orange-500"
                      : isMatch
                        ? "border-green-500 focus:ring-green-500/50 focus:border-green-500"
                        : "border-white/10 focus:ring-orange-500/50 focus:border-orange-500"
                  }`}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-orange-400">{error}</p>
                )}
                {isMatch && !error && (
                  <p className="mt-2 text-sm text-green-400">
                    Agency name matches. You can now delete.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isMatch || isDeleting}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    isMatch && !isDeleting
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg hover:shadow-orange-500/30"
                      : "bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30"
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Agency
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteAgencyModal;
