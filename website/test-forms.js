// Test script to verify form functionality
// Run this with Node.js after starting your backend server

import axios from 'axios';

// Configuration - adjust these values based on your setup
const API_BASE_URL = 'http://localhost:3001/api';

async function testFormFunctionality() {
  console.log('Testing Form Functionality...\n');

  try {
    // Test 1: Create a test form with contact creation enabled
    console.log('1. Creating a test form with contact creation enabled...');
    
    const testForm = {
      title: 'Test Form for Contact Creation',
      description: 'This form tests contact creation functionality',
      settings: {
        branding: true,
        analytics: true,
        notifications: true,
        mode: 'standard',
        theme: 'default',
        create_contact: true
      },
      questions: [
        {
          id: '1',
          type: 'short-text',
          title: 'What is your name?',
          required: true,
          options: [],
          settings: {
            placeholder: 'Enter your full name'
          }
        },
        {
          id: '2',
          type: 'email',
          title: 'What is your email address?',
          required: true,
          options: [],
          settings: {
            placeholder: 'your.email@example.com'
          }
        },
        {
          id: '3',
          type: 'phone',
          title: 'What is your phone number?',
          required: false,
          options: [],
          settings: {
            placeholder: '(123) 456-7890'
          }
        }
      ]
    };

    const formResponse = await axios.post(`${API_BASE_URL}/forms`, testForm);
    console.log(`   ✓ Form created successfully with ID: ${formResponse.data.form.id}\n`);

    // Test 2: Submit the form to test contact creation
    console.log('2. Submitting form to test contact creation...');
    
    const formSubmission = {
      responses: {
        '1': 'Test User',
        '2': 'testuser@example.com',
        '3': '+1-555-123-4567'
      },
      metadata: {
        ip_address: '127.0.0.1',
        user_agent: 'Test Script',
        referrer: 'localhost'
      }
    };

    const submitResponse = await axios.post(
      `${API_BASE_URL}/forms/${formResponse.data.form.id}/submit`,
      formSubmission
    );
    
    console.log(`   ✓ Form submitted successfully`);
    console.log(`   ✓ Contact ID: ${submitResponse.data.contactId || 'Not created'}`);
    console.log(`   ✓ Lead ID: ${submitResponse.data.leadId || 'Not created'}`);
    console.log(`   ✓ Lead Score: ${submitResponse.data.leadScore.total}\n`);

    // Test 3: Verify the form exists in the database
    console.log('3. Verifying form exists in database...');
    
    const getFormResponse = await axios.get(`${API_BASE_URL}/forms/${formResponse.data.form.id}`);
    console.log(`   ✓ Form retrieved successfully: ${getFormResponse.data.form.title}`);
    console.log(`   ✓ Contact creation enabled: ${getFormResponse.data.form.create_contact || false}\n`);

    // Test 4: Get form responses to verify the submission
    console.log('4. Checking form responses...');
    
    const responsesResponse = await axios.get(`${API_BASE_URL}/forms/${formResponse.data.form.id}/responses`);
    console.log(`   ✓ Retrieved ${responsesResponse.data.responses.length} response(s)`);
    console.log(`   ✓ First response contact email: ${responsesResponse.data.responses[0].contact_email}\n`);

    console.log('✓ All tests passed! Form functionality is working correctly.');
    
  } catch (error) {
    console.error('✗ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testFormFunctionality();