import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Sparkles, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAgency } from '@/hooks/useAgency';

/**
 * Mandatory Agency Creation Modal
 *
 * This modal is shown to users who don't have any agency yet.
 * It CANNOT be closed - users MUST create an agency to use the app.
 * All user data (leads, contacts, forms, etc.) is stored within agencies.
 */
export default function MandatoryAgencyModal({ isOpen }) {
  const { createAgency } = useAgency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const formatWebsiteUrl = (url) => {
    if (!url || url.trim() === '') return '';
    let formatted = url.trim();
    if (formatted.startsWith('www.')) {
      formatted = 'https://' + formatted;
    } else if (!formatted.match(/^https?:\/\//i)) {
      formatted = 'https://' + formatted;
    }
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      website: formatWebsiteUrl(formData.get('website')),
      description: formData.get('description'),
      logoFile: logoFile
    };

    try {
      console.log('[MandatoryAgencyModal] Starting agency creation with data:', {
        name: data.name,
        website: data.website,
        description: data.description,
        hasLogo: !!data.logoFile
      });

      const result = await createAgency(data);
      console.log('[MandatoryAgencyModal] Agency creation result:', result);

      // If we get here without error, agency was created
      // The modal should auto-close when agencies list updates via AgencyContext
      // But if it doesn't close in 2 seconds, something went wrong with state update
      setTimeout(() => {
        if (isOpen) {
          console.warn('[MandatoryAgencyModal] Modal still open after 2s - forcing page reload');
          window.location.reload();
        }
      }, 2000);

    } catch (err) {
      console.error('[MandatoryAgencyModal] Error creating agency:', err);
      setError(err.message || 'Failed to create agency. Please try again.');
      setLoading(false);
    }
    // Note: We don't set loading to false on success because the modal should close
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-gradient-to-br from-black/95 via-gray-900/90 to-gray-800/90 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-white/10 relative overflow-hidden">
        {/* Subtle Animated Gradient Overlay - Header-style */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-gray-900/20 to-gray-800/20 pointer-events-none"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <img
                src="/axolop-logo.png"
                alt="Axolop Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome to Axolop CRM
            </h1>
            <p className="text-gray-300 text-base mb-3">
              Let's set up your agency to get started
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-800/50 border border-white/10 rounded-lg p-2.5 mt-3">
              <AlertCircle className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <p>
                All your data (leads, contacts, forms, etc.) is stored within your agency.
                You need an agency to start using Axolop CRM.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Create Agency Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Agency Logo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className={`cursor-pointer h-16 w-16 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-1 ring-white/10 hover:ring-white/30 transition-all group relative overflow-hidden ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {logoPreview ? (
                    <>
                      <img
                        src={logoPreview}
                        alt="Agency logo preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-4 w-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-1.5">
                      <ImageIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="text-xs text-gray-500 group-hover:text-gray-300 mt-0.5">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    Click to upload your agency logo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB • PNG, JPG, or SVG
                  </p>
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 mt-1"
                      disabled={loading}
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Agency Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Agency Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                disabled={loading}
                className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                placeholder="Enter your agency name"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Website (Optional)
              </label>
              <input
                type="text"
                name="website"
                disabled={loading}
                className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                placeholder="www.yourwebsite.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                https:// is optional - we'll add it automatically
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={2}
                disabled={loading}
                className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                placeholder="Brief description of your agency"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg text-sm"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-gray-800 border-t-white rounded-full animate-spin"></div>
                    Creating Agency...
                  </>
                ) : (
                  <>
                    Create Agency & Get Started
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Footer */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Your agency will be your workspace where all your data is organized and managed.
              <br />
              You can invite team members later from agency settings.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
