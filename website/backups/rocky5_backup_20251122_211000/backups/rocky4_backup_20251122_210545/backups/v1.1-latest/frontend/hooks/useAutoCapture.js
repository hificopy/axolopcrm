import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

/**
 * Custom hook for auto-capturing lead data as users type in forms
 * Debounces requests to avoid excessive API calls
 *
 * @param {string} formId - The form ID to capture data for
 * @param {object} responses - Current form responses
 * @param {boolean} enabled - Whether auto-capture is enabled
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 2000)
 * @returns {object} - { draftLeadId, isCapturing, error }
 */
export const useAutoCapture = (formId, responses, enabled = true, debounceMs = 2000) => {
  const [draftLeadId, setDraftLeadId] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const timeoutRef = useRef(null);
  const lastResponsesRef = useRef(null);

  useEffect(() => {
    // Don't auto-capture if disabled or no formId
    if (!enabled || !formId) return;

    // Don't capture if responses haven't changed
    const responsesStr = JSON.stringify(responses);
    if (responsesStr === lastResponsesRef.current) return;
    lastResponsesRef.current = responsesStr;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced capture
    timeoutRef.current = setTimeout(async () => {
      // Only capture if we have at least one meaningful response
      const hasData = Object.keys(responses).some(key => {
        const value = responses[key];
        return value && (
          (typeof value === 'string' && value.trim().length > 0) ||
          (Array.isArray(value) && value.length > 0) ||
          (typeof value === 'number')
        );
      });

      if (!hasData) return;

      setIsCapturing(true);
      setError(null);

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';
        const response = await axios.post(
          `${API_URL}/forms/${formId}/auto-capture`,
          {
            responses,
            draftLeadId,
            sessionId
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success && response.data.draftLeadId) {
          setDraftLeadId(response.data.draftLeadId);
          console.log('Auto-captured lead:', response.data.draftLeadId);
        }
      } catch (err) {
        console.error('Auto-capture error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to auto-capture');
      } finally {
        setIsCapturing(false);
      }
    }, debounceMs);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formId, responses, enabled, debounceMs, draftLeadId, sessionId]);

  return {
    draftLeadId,
    isCapturing,
    error,
    sessionId
  };
};

export default useAutoCapture;
