import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  QrCode,
  Code,
  Check,
  Rocket,
  Globe,
  Clock,
  Edit2,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import formsApi from '@/services/formsApi';

export default function ShareTab({ form, setForm }) {
  const [copied, setCopied] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishHistory, setPublishHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [editingSlug, setEditingSlug] = useState(false);
  const [publishError, setPublishError] = useState(null);

  // Determine if form is published
  const isPublished = form.is_published && form.published_slug;

  // Generate URLs
  const publishedUrl = isPublished && form.published_slug
    ? `${window.location.origin}/${form.user_agency_alias || 'agency'}/${form.published_slug}`
    : null;

  const previewUrl = form.id && form.id !== 'new-form'
    ? `${window.location.origin}/forms/preview/${form.id}`
    : 'Save the form first to get a shareable link';

  const embedCode = form.id && form.id !== 'new-form'
    ? `<iframe src="${previewUrl}" width="100%" height="600" frameborder="0"></iframe>`
    : '';

  const popupCode = form.id && form.id !== 'new-form'
    ? `<script src="${window.location.origin}/embed.js" data-form-id="${form.id}" data-type="popup"></script>`
    : '';

  // Initialize share settings from form.settings or use defaults
  const initialShareSettings = {
    showTitle: form.settings?.share?.showTitle ?? true,
    showProgressBar: form.settings?.share?.showProgressBar ?? true,
    hideBranding: form.settings?.share?.hideBranding ?? false,
    enableAutoResize: form.settings?.share?.enableAutoResize ?? false,
    allowPublicAccess: form.settings?.share?.allowPublicAccess ?? true,
    requirePassword: form.settings?.share?.requirePassword ?? false,
    closeAfterDate: form.settings?.share?.closeAfterDate ?? false,
    limitSubmissions: form.settings?.share?.limitSubmissions ?? false,
    customDomain: form.settings?.share?.customDomain ?? '',
  };

  const [shareSettings, setShareSettings] = useState(initialShareSettings);

  useEffect(() => {
    setShareSettings({
      showTitle: form.settings?.share?.showTitle ?? true,
      showProgressBar: form.settings?.share?.showProgressBar ?? true,
      hideBranding: form.settings?.share?.hideBranding ?? false,
      enableAutoResize: form.settings?.share?.enableAutoResize ?? false,
      allowPublicAccess: form.settings?.share?.allowPublicAccess ?? true,
      requirePassword: form.settings?.share?.requirePassword ?? false,
      closeAfterDate: form.settings?.share?.closeAfterDate ?? false,
      limitSubmissions: form.settings?.share?.limitSubmissions ?? false,
      customDomain: form.settings?.share?.customDomain ?? '',
    });
  }, [form.settings]);

  // Load publish history when form changes
  useEffect(() => {
    if (form.id && form.id !== 'new-form' && isPublished) {
      loadPublishHistory();
    }
  }, [form.id, isPublished]);

  const loadPublishHistory = async () => {
    if (!form.id || form.id === 'new-form') return;

    setLoadingHistory(true);
    try {
      const response = await formsApi.getPublishHistory(form.id);
      if (response.success) {
        setPublishHistory(response.history || []);
      }
    } catch (error) {
      console.error('Error loading publish history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const updateFormShareSettings = (key, value) => {
    setForm(prevForm => ({
      ...prevForm,
      settings: {
        ...prevForm.settings,
        share: {
          ...prevForm.settings?.share,
          [key]: value
        }
      }
    }));
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpenForm = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handlePublish = async () => {
    if (form.id === 'new-form') {
      alert('Please save the form first before publishing.');
      return;
    }

    if (!form.questions || form.questions.length === 0) {
      setPublishError('Cannot publish form without questions.');
      return;
    }

    setPublishing(true);
    setPublishError(null);

    try {
      const options = customSlug ? { customSlug } : {};
      const response = await formsApi.publishForm(form.id, options);

      if (response.success) {
        // Update form with published data
        setForm(prev => ({
          ...prev,
          ...response.form,
          user_agency_alias: response.form.user_agency_alias
        }));

        // Reload publish history
        await loadPublishHistory();

        alert(`Form published successfully! Version ${response.version}\n\nPublic URL: ${response.publicUrl}`);
      }
    } catch (error) {
      console.error('Error publishing form:', error);
      setPublishError(error.message || 'Failed to publish form');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to unpublish this form? It will no longer be accessible to the public.')) {
      return;
    }

    try {
      const response = await formsApi.unpublishForm(form.id);
      if (response.success) {
        setForm(prev => ({ ...prev, ...response.form }));
        alert('Form unpublished successfully');
      }
    } catch (error) {
      console.error('Error unpublishing form:', error);
      alert('Failed to unpublish form: ' + error.message);
    }
  };

  const handleUpdateSlug = async () => {
    if (!customSlug || !customSlug.trim()) {
      alert('Please enter a valid slug');
      return;
    }

    try {
      const response = await formsApi.updateFormSlug(form.id, customSlug.trim());
      if (response.success) {
        setForm(prev => ({ ...prev, ...response.form }));
        setEditingSlug(false);
        alert('Slug updated successfully!');
      }
    } catch (error) {
      console.error('Error updating slug:', error);
      alert('Failed to update slug: ' + error.message);
    }
  };

  const handleSocialShare = (platform) => {
    const shareUrl = publishedUrl || previewUrl;
    let shareLink = '';
    const text = encodeURIComponent(`Check out my new form: ${form.title}`);
    const url = encodeURIComponent(shareUrl);

    if (form.id === 'new-form') {
      alert('Please save the form first before sharing.');
      return;
    }

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${encodeURIComponent(form.title)}&summary=${text}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(`Check out my form: ${form.title}`)}&body=${text}%0A${url}`;
        break;
      default:
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-crm-text-primary mb-2">Share & Publish</h2>
          <p className="text-crm-text-secondary">
            Publish your form and share it with your audience
          </p>
        </div>

        {/* Publishing Section */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Rocket className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Publish Form</CardTitle>
                  <CardDescription>
                    {isPublished
                      ? `Published as version ${form.published_version || 1}`
                      : 'Publish your form to make it accessible to the public'}
                  </CardDescription>
                </div>
              </div>
              {isPublished && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Published
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {publishError && (
              <div className="flex items-center gap-2 p-3 bg-[#761B14]/5 border border-[#761B14]/20 rounded-lg text-[#761B14] text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            {/* Published URL */}
            {isPublished && publishedUrl && (
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  Public URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={publishedUrl}
                    readOnly
                    className="flex-1 font-mono text-sm bg-white"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(publishedUrl, 'published-url')}
                  >
                    {copied === 'published-url' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenForm(publishedUrl)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Custom Slug */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Edit2 className="h-4 w-4" />
                Form Slug {isPublished && '(URL path)'}
              </Label>
              {editingSlug || !isPublished ? (
                <div className="flex gap-2">
                  <Input
                    value={customSlug || form.published_slug || ''}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="my-awesome-form"
                    className="flex-1 font-mono text-sm"
                  />
                  {editingSlug && (
                    <>
                      <Button variant="outline" onClick={handleUpdateSlug}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingSlug(false)}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={form.published_slug || ''}
                    readOnly
                    className="flex-1 font-mono text-sm bg-gray-100"
                  />
                  <Button variant="outline" onClick={() => {
                    setCustomSlug(form.published_slug);
                    setEditingSlug(true);
                  }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-crm-text-secondary mt-1">
                Lowercase letters, numbers, and hyphens only. This will be part of your public URL.
              </p>
            </div>

            {/* Publish/Unpublish Buttons */}
            <div className="flex gap-2 pt-2">
              {isPublished ? (
                <>
                  <Button
                    onClick={handlePublish}
                    disabled={publishing || form.id === 'new-form'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {publishing ? 'Publishing...' : `Republish (v${(form.published_version || 0) + 1})`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUnpublish}
                  >
                    Unpublish
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={publishing || form.id === 'new-form'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {publishing ? 'Publishing...' : 'Publish Form'}
                </Button>
              )}
            </div>

            {/* Last Published Info */}
            {isPublished && form.published_at && (
              <div className="flex items-center gap-2 text-sm text-crm-text-secondary pt-2 border-t">
                <Clock className="h-4 w-4" />
                <span>Last published: {formatDate(form.published_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publish History */}
        {isPublished && publishHistory.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Publish History</CardTitle>
                  <CardDescription>All published versions of this form</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-4 text-crm-text-secondary">Loading history...</div>
              ) : (
                <div className="space-y-2">
                  {publishHistory.slice().reverse().map((entry) => (
                    <div
                      key={entry.version}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-semibold text-sm">
                          v{entry.version}
                        </div>
                        <div>
                          <div className="font-medium text-sm">Version {entry.version}</div>
                          <div className="text-xs text-crm-text-secondary">
                            {formatDate(entry.published_at)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Could implement version preview/restore here
                          alert('Version preview coming soon!');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview Link (for testing before publishing) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Preview Link</CardTitle>
                <CardDescription>Test your form before publishing (requires login)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Preview URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={previewUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => handleCopy(previewUrl, 'preview-url')}
                  disabled={form.id === 'new-form'}
                >
                  {copied === 'preview-url' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {form.id !== 'new-form' && (
              <Button variant="outline" onClick={() => handleOpenForm(previewUrl)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Preview
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Embed Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Code className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Embed on Website</CardTitle>
                <CardDescription>Add this form to your website</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Inline Embed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Inline Embed</Label>
                <span className="text-xs text-crm-text-secondary">Full iframe embed</span>
              </div>
              <div className="relative">
                <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                  {embedCode || 'Save the form first to get embed code'}
                </pre>
                {embedCode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(embedCode, 'embed')}
                  >
                    {copied === 'embed' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Popup Embed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Popup Embed</Label>
                <span className="text-xs text-crm-text-secondary">Opens in a modal</span>
              </div>
              <div className="relative">
                <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                  {popupCode || 'Save the form first to get popup code'}
                </pre>
                {popupCode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(popupCode, 'popup')}
                  >
                    {copied === 'popup' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Embed Settings */}
            <div className="pt-4 border-t border-gray-200">
              <Label className="mb-3 block">Embed Settings</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={shareSettings.showTitle}
                    onChange={(e) => updateFormShareSettings('showTitle', e.target.checked)}
                  />
                  <span className="text-sm">Show form title</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={shareSettings.showProgressBar}
                    onChange={(e) => updateFormShareSettings('showProgressBar', e.target.checked)}
                  />
                  <span className="text-sm">Show progress bar</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={shareSettings.hideBranding}
                    onChange={(e) => updateFormShareSettings('hideBranding', e.target.checked)}
                  />
                  <span className="text-sm">Hide branding</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={shareSettings.enableAutoResize}
                    onChange={(e) => updateFormShareSettings('enableAutoResize', e.target.checked)}
                  />
                  <span className="text-sm">Enable auto-resize</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Sharing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Share {isPublished ? 'your published form' : 'the preview link'} on social platforms
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start"
                disabled={form.id === 'new-form'}
                onClick={() => handleSocialShare('twitter')}
              >
                <svg className="h-4 w-4 mr-2" fill="#1DA1F2" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Share on Twitter
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                disabled={form.id === 'new-form'}
                onClick={() => handleSocialShare('linkedin')}
              >
                <svg className="h-4 w-4 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Share on LinkedIn
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                disabled={form.id === 'new-form'}
                onClick={() => handleSocialShare('facebook')}
              >
                <svg className="h-4 w-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                disabled={form.id === 'new-form'}
                onClick={() => handleSocialShare('email')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Customize how your form is shared</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={shareSettings.allowPublicAccess}
                  onChange={(e) => updateFormShareSettings('allowPublicAccess', e.target.checked)}
                />
                <span className="text-sm font-medium">Allow public access</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={shareSettings.requirePassword}
                  onChange={(e) => updateFormShareSettings('requirePassword', e.target.checked)}
                />
                <span className="text-sm font-medium">Require password to access</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={shareSettings.closeAfterDate}
                  onChange={(e) => updateFormShareSettings('closeAfterDate', e.target.checked)}
                />
                <span className="text-sm font-medium">Close form after specific date</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={shareSettings.limitSubmissions}
                  onChange={(e) => updateFormShareSettings('limitSubmissions', e.target.checked)}
                />
                <span className="text-sm font-medium">Limit total submissions</span>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Label>Custom Domain (Pro)</Label>
              <Input
                placeholder="forms.yourdomain.com"
                className="mt-1"
                disabled
                value={shareSettings.customDomain}
                onChange={(e) => updateFormShareSettings('customDomain', e.target.value)}
              />
              <p className="text-xs text-crm-text-secondary mt-1">
                Use your own domain for form links
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
