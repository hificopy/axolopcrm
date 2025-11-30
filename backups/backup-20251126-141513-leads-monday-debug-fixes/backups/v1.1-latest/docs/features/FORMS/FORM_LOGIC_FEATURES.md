# Form Logic & Qualification Features

## Overview
The Axolop CRM form builder now includes powerful Typeform-like conditional logic, lead qualification, and disqualification features. This document explains how to use these features.

## Features Implemented

### 1. Conditional Logic Engine (`/frontend/utils/formLogicEngine.js`)

The logic engine provides:
- **Conditional routing**: Jump to specific questions based on user answers
- **Lead scoring**: Automatically calculate lead scores based on responses
- **Disqualification**: Automatically disqualify leads who don't meet criteria
- **Flow validation**: Validate form logic for errors

#### Available Operators

```javascript
- equals              // Answer equals specific value
- not_equals          // Answer does not equal value
- contains            // Answer contains text (works with arrays)
- not_contains        // Answer does not contain text
- greater_than        // Numeric comparison >
- less_than           // Numeric comparison <
- greater_than_or_equal  // Numeric comparison >=
- less_than_or_equal     // Numeric comparison <=
- is_empty            // Field is empty/null
- is_not_empty        // Field has value
- starts_with         // Text starts with value
- ends_with           // Text ends with value
```

### 2. Conditional Logic Configuration

#### Rule Structure
```javascript
{
  condition: {
    field: "question-id",      // Question ID to check
    operator: "equals",         // Comparison operator
    value: "Option A"           // Value to compare against
  },
  thenGoTo: "question-id-2",   // Target question ID (for 'jump' action)
  action: "jump"                // Action: 'jump', 'submit', 'disqualify'
}
```

#### Actions
- **jump**: Jump to a specific question
- **submit**: Submit form immediately (qualified lead)
- **disqualify**: Show disqualification screen

#### Example: Lead Qualification Form
```javascript
{
  id: 'q1',
  type: 'multiple-choice',
  title: 'What is your budget?',
  options: ['Under $1000', '$1000-$5000', 'Over $5000'],
  conditional_logic: [
    {
      condition: {
        field: 'q1',
        operator: 'equals',
        value: 'Under $1000'
      },
      action: 'disqualify'  // Budget too low
    },
    {
      condition: {
        field: 'q1',
        operator: 'equals',
        value: 'Over $5000'
      },
      action: 'submit'  // Qualified lead, skip remaining questions
    }
  ],
  disqualificationMessage: 'Thank you for your interest. Unfortunately, our minimum project budget is $1000.'
}
```

### 3. Lead Scoring

#### Configuration
Each question can have lead scoring enabled with points assigned to each answer option:

```javascript
{
  id: 'q2',
  type: 'multiple-choice',
  title: 'What industry are you in?',
  options: ['E-commerce', 'SaaS', 'Real Estate', 'Other'],
  lead_scoring_enabled: true,
  lead_scoring: {
    'E-commerce': 10,
    'SaaS': 15,
    'Real Estate': 12,
    'Other': 5
  }
}
```

#### Score Calculation
The logic engine automatically calculates total score:
- Single selection questions: Score from selected option
- Multiple selection (checkboxes): Sum of all selected options
- Rating questions: Score based on rating value (use format `rating-1`, `rating-2`, etc.)

#### Score Display
Lead scores are shown on the thank you screen with breakdown:
```
Lead Score: 35 points

Breakdown:
- Industry selection: +15
- Company size: +10
- Budget range: +10
```

### 4. Form Navigation

#### History Tracking
The form maintains navigation history, allowing users to:
- Go back to previous questions (even after conditional jumps)
- See accurate progress bar
- Navigate through branching paths

#### Progress Indication
- Progress bar shows percentage complete
- Current question number displayed
- Visual indicators for:
  - Required fields (*)
  - Lead scoring enabled (green target icon)
  - Conditional logic enabled (blue branch icon)

### 5. Form Builder UI

#### Question Settings Panel
For each question, you can configure:
1. **Basic Settings**
   - Question title
   - Required/optional
   - Placeholder text
   - Validation rules

2. **Options** (for multiple choice/checkboxes)
   - Add/remove/edit options
   - Reorder options
   - Each option can have lead score assigned

3. **Lead Scoring**
   - Enable/disable per question
   - Assign points to each option
   - View total possible points

4. **Conditional Logic**
   - Add multiple rules per question
   - Configure condition (operator + value)
   - Choose action (jump/submit/disqualify)
   - Select target question for jumps
   - Set disqualification message

#### Visual Indicators
In the form outline:
- 🌿 **Blue branch icon**: Question has conditional logic
- 🎯 **Green target icon**: Question has lead scoring
- **• Logic**: Text indicator for conditional rules
- **• Scored**: Text indicator for scoring enabled

## Usage Guide

### Creating a Lead Qualification Form

1. **Start with standard questions**
   ```
   Q1: Name (required)
   Q2: Email (required)
   Q3: Company name (required)
   ```

2. **Add qualification questions**
   ```
   Q4: What is your company size?
   - Options: 1-10, 11-50, 51-200, 200+
   - Lead Scoring:
     * 1-10: 5 points
     * 11-50: 10 points
     * 51-200: 15 points
     * 200+: 20 points
   ```

3. **Add disqualification logic**
   ```
   Q5: What is your budget?
   - Options: Under $1k, $1k-$5k, $5k-$10k, $10k+
   - Conditional Logic:
     * If answer equals "Under $1k" → Disqualify
     * Message: "Our minimum project size is $1,000"
   ```

4. **Add conditional routing**
   ```
   Q6: Are you ready to start within 30 days?
   - Options: Yes, No, Not sure
   - Conditional Logic:
     * If answer equals "Yes" → Jump to Q10 (skip timeline questions)
     * If answer equals "No" → Continue to Q7 (ask about timeline)
   ```

5. **Configure thank you screen**
   - Lead score automatically displayed
   - Show score breakdown
   - Option to restart form

### Testing Your Form

1. **Use Preview Mode**
   - Click "Preview" button in form builder
   - Test all conditional paths
   - Verify lead scoring calculations
   - Test disqualification triggers

2. **Check Validation**
   - Form logic is validated automatically
   - Errors shown for:
     - Non-existent target questions
     - Circular references
     - Invalid field references

3. **Test Different Paths**
   - Try different answer combinations
   - Verify correct questions are shown/skipped
   - Check lead score accuracy
   - Confirm disqualification messages

## API Integration

### Saving Forms
```javascript
const formData = {
  id: 'form-123',
  title: 'Lead Qualification Form',
  description: 'Help us understand your needs',
  questions: [...],  // Array of question objects
  settings: {
    branding: true,
    analytics: true,
    notifications: true
  }
};

// Save to backend
await formsApi.createForm(formData);
```

### Submitting Form Responses
```javascript
const submission = {
  formId: 'form-123',
  responses: {
    'q1': 'John Doe',
    'q2': 'john@example.com',
    'q3': '51-200',
    // ... more responses
  },
  leadScore: {
    total: 45,
    breakdown: {
      'q3': { title: 'Company size', score: 15, response: '51-200' },
      'q4': { title: 'Budget', score: 20, response: '$10k+' },
      'q5': { title: 'Timeline', score: 10, response: 'Within 30 days' }
    },
    qualified: true
  },
  completedAt: new Date().toISOString(),
  disqualified: false
};

await formsApi.submitForm(submission);
```

## Advanced Features

### 1. Multi-Condition Rules
You can add multiple rules to the same question. Rules are evaluated in order, and the first matching rule wins:

```javascript
conditional_logic: [
  {
    condition: { field: 'q1', operator: 'equals', value: 'Enterprise' },
    action: 'jump',
    thenGoTo: 'enterprise-section'
  },
  {
    condition: { field: 'q1', operator: 'equals', value: 'SMB' },
    action: 'jump',
    thenGoTo: 'smb-section'
  },
  {
    condition: { field: 'q1', operator: 'equals', value: 'Individual' },
    action: 'disqualify'
  }
]
```

### 2. Complex Scoring Logic
Combine multiple scored questions to create sophisticated qualification:

```javascript
// Question 1: Industry (max 20 points)
// Question 2: Company size (max 15 points)
// Question 3: Budget (max 25 points)
// Question 4: Timeline (max 10 points)
// Total possible: 70 points

// Qualification thresholds:
// 50+ points = Hot lead
// 30-49 points = Warm lead
// 20-29 points = Cold lead
// <20 points = Disqualified
```

### 3. Branching Paths
Create complex form flows with multiple paths:

```
Q1: What are you interested in?
├─ Product A → Q2-Q5 (Product A questions)
├─ Product B → Q6-Q9 (Product B questions)
└─ Not sure → Q10 (General questions)
```

## Best Practices

### 1. Keep Logic Simple
- Limit conditional rules to 2-3 per question
- Use clear, specific conditions
- Test all possible paths

### 2. Provide Clear Messages
- Write helpful disqualification messages
- Explain why lead was disqualified
- Offer alternatives when possible

### 3. Balance Scoring
- Don't over-weight any single question
- Use consistent point scales
- Test scoring with real data

### 4. User Experience
- Keep forms concise (5-10 questions max)
- Use conditional logic to reduce form length
- Show progress clearly
- Allow users to go back

### 5. Testing
- Test all conditional paths
- Verify scoring calculations
- Check disqualification triggers
- Validate form logic before publishing

## Troubleshooting

### Common Issues

**1. Conditional logic not working**
- Check that target question IDs are correct
- Verify operator matches data type
- Ensure values match exactly (case-sensitive for some operators)

**2. Lead scoring incorrect**
- Verify scoring values are numbers
- Check for duplicate option names
- Ensure scoring is enabled on question

**3. Disqualification not showing**
- Confirm action is set to 'disqualify'
- Check disqualificationMessage is set
- Verify condition is met

**4. Navigation errors**
- Validate form logic using built-in validator
- Check for circular references
- Ensure target questions exist

## Future Enhancements

Planned features:
- [ ] Multi-question conditions (AND/OR logic)
- [ ] Score-based routing (if score > X, then...)
- [ ] Time-based logic
- [ ] Integration with CRM workflows
- [ ] A/B testing for form variants
- [ ] Advanced analytics for conversion paths
- [ ] Custom JavaScript expressions
- [ ] Form templates with pre-built logic

## Support

For issues or questions:
1. Check this documentation
2. Review code examples in `/frontend/utils/formLogicEngine.js`
3. Test in FormBuilder preview mode
4. Contact development team

---

Last Updated: November 16, 2025
Version: 1.0.0
