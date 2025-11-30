import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneOff, Mic, MicOff, Voicemail, Clock, User,
  MessageSquare, AlertCircle, CheckCircle, XCircle, RotateCcw,
  ChevronDown, ChevronUp, Play, Pause, Volume2
} from 'lucide-react';

/**
 * CallDialer Component
 * Full-featured call dialer with all insurance agent support features:
 * - Live calling with WebRTC
 * - Real-time call timer
 * - Voicemail drop
 * - Quick disposition
 * - Call queue integration
 * - Sales script display
 * - AI assistance
 */

const CallDialer = ({
  lead,
  contact,
  queueItem,
  scriptTemplate,
  onCallEnd,
  onDisposition,
  className = ''
}) => {
  // Call state
  const [callStatus, setCallStatus] = useState('idle'); // idle, dialing, ringing, active, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHoldingForVoicemail, setIsHoldingForVoicemail] = useState(false);

  // UI state
  const [showScript, setShowScript] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showDispositionPanel, setShowDispositionPanel] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState(null);

  // AI assistance
  const [aiSuggestions, setAISuggestions] = useState(null);
  const [transcriptPreview, setTranscriptPreview] = useState('');

  // Refs
  const callTimerRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const currentCallRef = useRef(null);

  // Phone number to display
  const phoneNumber = contact?.phone || lead?.phone || 'No number';
  const displayName = contact
    ? `${contact.first_name} ${contact.last_name}`
    : lead?.name || 'Unknown';

  // Dispositions
  const dispositions = [
    { value: 'interested', label: 'Interested', color: 'text-green-600', icon: CheckCircle },
    { value: 'not_interested', label: 'Not Interested', color: 'text-red-600', icon: XCircle },
    { value: 'callback', label: 'Callback', color: 'text-blue-600', icon: Clock },
    { value: 'voicemail', label: 'Voicemail', color: 'text-yellow-600', icon: Voicemail },
    { value: 'no_answer', label: 'No Answer', color: 'text-gray-600', icon: AlertCircle },
    { value: 'busy', label: 'Busy', color: 'text-orange-600', icon: AlertCircle },
    { value: 'do_not_call', label: 'Do Not Call', color: 'text-red-800', icon: XCircle }
  ];

  // Start call timer
  useEffect(() => {
    if (callStatus === 'active' && !callTimerRef.current) {
      callStartTimeRef.current = Date.now();
      callTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [callStatus]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle call initiation
  const handleStartCall = async () => {
    try {
      setCallStatus('dialing');

      const response = await fetch('/api/calls/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          contactId: contact?.id,
          phoneNumber,
          queueItemId: queueItem?.id,
          scriptTemplateId: scriptTemplate?.id
        })
      });

      const data = await response.json();
      currentCallRef.current = data.call;

      // Simulate call progression (in real implementation, this comes from Twilio webhooks)
      setTimeout(() => setCallStatus('ringing'), 1000);
      setTimeout(() => setCallStatus('active'), 3000);

      // Start AI assistance if enabled
      if (showAIAssistant) {
        startAIAssistance();
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('idle');
      alert('Failed to initiate call');
    }
  };

  // Handle call end
  const handleEndCall = async () => {
    try {
      // Stop timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      setCallStatus('ended');
      setShowDispositionPanel(true);

      // Update call record
      if (currentCallRef.current) {
        await fetch(`/api/calls/${currentCallRef.current.id}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: callDuration,
            talkTime: callDuration
          })
        });
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  // Handle disposition submission
  const handleSubmitDisposition = async () => {
    if (!selectedDisposition) {
      alert('Please select a disposition');
      return;
    }

    try {
      await fetch(`/api/calls/${currentCallRef.current.id}/disposition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disposition: selectedDisposition,
          notes: callNotes
        })
      });

      // Callback to parent
      if (onDisposition) {
        onDisposition(selectedDisposition, callNotes);
      }

      // Reset state
      resetDialer();
    } catch (error) {
      console.error('Error submitting disposition:', error);
      alert('Failed to save disposition');
    }
  };

  // Handle voicemail drop
  const handleVoicemailDrop = async () => {
    setIsHoldingForVoicemail(true);

    try {
      // Get voicemail template (you could show a selector here)
      const response = await fetch('/api/voicemail-templates');
      const templates = await response.json();

      if (templates.length > 0) {
        await fetch(`/api/calls/${currentCallRef.current.id}/voicemail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: templates[0].id
          })
        });

        // Auto-set disposition to voicemail
        setSelectedDisposition('voicemail');
        setShowDispositionPanel(true);
      }
    } catch (error) {
      console.error('Error dropping voicemail:', error);
    } finally {
      setIsHoldingForVoicemail(false);
      handleEndCall();
    }
  };

  // Start AI assistance
  const startAIAssistance = () => {
    // Simulate AI suggestions (in real implementation, this would connect to AI service)
    const mockSuggestions = {
      talkingPoints: [
        'Ask about their current coverage',
        'Emphasize the benefits of our policy',
        'Address any budget concerns'
      ],
      recommendedQuestions: [
        'What is your biggest concern about insurance?',
        'When was the last time you reviewed your coverage?'
      ],
      callStatus: 'on_track',
      suggestion: 'Great start! Try to build rapport before discussing prices.'
    };

    setAISuggestions(mockSuggestions);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In real implementation, this would control the microphone
  };

  // Reset dialer to initial state
  const resetDialer = () => {
    setCallStatus('idle');
    setCallDuration(0);
    setIsMuted(false);
    setShowDispositionPanel(false);
    setCallNotes('');
    setSelectedDisposition(null);
    setTranscriptPreview('');
    setAISuggestions(null);
    currentCallRef.current = null;

    if (onCallEnd) {
      onCallEnd();
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#101010] to-[#2d2d2d] text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#761B14] rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{displayName}</h3>
              <p className="text-sm text-gray-300">{phoneNumber}</p>
            </div>
          </div>

          {/* Call status indicator */}
          <div className="text-right">
            {callStatus !== 'idle' && (
              <div className="flex items-center space-x-2">
                {callStatus === 'active' && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-2xl font-mono">{formatDuration(callDuration)}</span>
                  </>
                )}
                {callStatus === 'dialing' && <span className="text-sm">Dialing...</span>}
                {callStatus === 'ringing' && <span className="text-sm">Ringing...</span>}
                {callStatus === 'ended' && <span className="text-sm">Call Ended</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dialer Controls */}
      <div className="p-6">
        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {callStatus === 'idle' && (
            <button
              onClick={handleStartCall}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
            >
              <Phone size={28} />
            </button>
          )}

          {(callStatus === 'dialing' || callStatus === 'ringing' || callStatus === 'active') && (
            <>
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 ${isMuted ? 'bg-yellow-500' : 'bg-gray-700'} hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* End call button */}
              <button
                onClick={handleEndCall}
                className="btn-premium-red w-16 h-16 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110"
              >
                <PhoneOff size={28} />
              </button>

              {/* Voicemail drop button */}
              {callStatus === 'active' && (
                <button
                  onClick={handleVoicemailDrop}
                  disabled={isHoldingForVoicemail}
                  className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <Voicemail size={20} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        {callStatus === 'active' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setShowScript(!showScript)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <MessageSquare size={16} />
              <span className="text-sm">Script</span>
              {showScript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="px-4 py-2 border border-[#761B14] text-[#761B14] rounded-lg hover:bg-red-50 flex items-center justify-center space-x-2"
            >
              <span className="text-sm">AI Help</span>
              {showAIAssistant ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        )}

        {/* Sales Script Panel */}
        {showScript && scriptTemplate && callStatus === 'active' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">
              Script: {scriptTemplate.name}
            </h4>
            <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {scriptTemplate.content}
            </div>
          </div>
        )}

        {/* AI Assistant Panel */}
        {showAIAssistant && aiSuggestions && callStatus === 'active' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
              AI Sales Assistant
            </h4>

            <div className="space-y-3">
              {aiSuggestions.suggestion && (
                <div className="text-sm text-blue-800 bg-blue-100 p-2 rounded">
                  💡 {aiSuggestions.suggestion}
                </div>
              )}

              {aiSuggestions.talkingPoints && aiSuggestions.talkingPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">Key Points:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {aiSuggestions.talkingPoints.map((point, i) => (
                      <li key={i}>• {point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSuggestions.recommendedQuestions && aiSuggestions.recommendedQuestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">Suggested Questions:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {aiSuggestions.recommendedQuestions.map((q, i) => (
                      <li key={i}>❓ {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disposition Panel */}
        {showDispositionPanel && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Call Disposition</h4>

            {/* Disposition buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {dispositions.map((disp) => {
                const Icon = disp.icon;
                return (
                  <button
                    key={disp.value}
                    onClick={() => setSelectedDisposition(disp.value)}
                    className={`px-3 py-2 border rounded-lg flex items-center space-x-2 transition-all ${
                      selectedDisposition === disp.value
                        ? 'border-[#761B14] bg-red-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className={disp.color} />
                    <span className="text-sm">{disp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Call notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Notes
              </label>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#761B14] focus:border-transparent"
                placeholder="Add notes about this call..."
              />
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitDisposition}
                disabled={!selectedDisposition}
                className="btn-premium-red flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Next
              </button>
              <button
                onClick={resetDialer}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Lead/Contact Info Summary */}
        {callStatus === 'idle' && lead && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Lead Information</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Company:</span> {lead.name}</p>
              {lead.email && <p><span className="font-medium">Email:</span> {lead.email}</p>}
              {lead.status && <p><span className="font-medium">Status:</span> {lead.status}</p>}
              {queueItem && (
                <p><span className="font-medium">Attempts:</span> {queueItem.attempts}/{queueItem.max_attempts}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallDialer;
