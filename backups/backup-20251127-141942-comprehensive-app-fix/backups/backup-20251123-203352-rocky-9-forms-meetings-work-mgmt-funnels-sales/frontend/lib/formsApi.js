import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Forms API
export const formsApi = {
  // Get all forms
  getForms: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/forms`);
    return response.data;
  },

  // Get single form
  getForm: async (formId) => {
    const response = await axios.get(`${API_BASE_URL}/api/forms/${formId}`);
    return response.data;
  },

  // Create form
  createForm: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/api/forms`, formData);
    return response.data;
  },

  // Update form
  updateForm: async (formId, formData) => {
    const response = await axios.put(`${API_BASE_URL}/api/forms/${formId}`, formData);
    return response.data;
  },

  // Delete form
  deleteForm: async (formId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/forms/${formId}`);
    return response.data;
  },

  // Get form submissions
  getFormSubmissions: async (formId) => {
    const response = await axios.get(`${API_BASE_URL}/api/forms/${formId}/submissions`);
    return response.data;
  },

  // Get form analytics
  getFormAnalytics: async (formId) => {
    const response = await axios.get(`${API_BASE_URL}/api/forms/${formId}/analytics`);
    return response.data;
  },

  // Submit form
  submitForm: async (formId, submissionData) => {
    const response = await axios.post(`${API_BASE_URL}/api/forms/${formId}/submit`, submissionData);
    return response.data;
  }
};

export default formsApi;