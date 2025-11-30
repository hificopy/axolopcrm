# Sequential Questions Feature

## Overview
Sequential Questions is Axolop's default form builder technology that displays one question at a time in a Typeform-style progressive interface. This feature **increases conversions by 30%** by reducing cognitive load and form abandonment.

## Technology Sync
**IMPORTANT:** Sequential Questions uses the SAME backend technology and UI patterns as the main Form Builder (`pages/FormBuilder.jsx` and `pages/BookingEmbed.jsx`). Any changes to the form builder's sequential question implementation should be synced with the Meetings module.

### Shared Technology
- **Framer Motion animations** - Same slide transitions and progress indicators
- **Progressive disclosure** - One question at a time with "Next" button
- **Progress tracking** - Visual progress bar showing completion percentage
- **Auto-save** - Responses saved on every change (no submit button needed)
- **Validation** - Required field validation before advancing

## Implementation

### Meetings Integration
Located in: `/frontend/components/meetings/`
- **CreateBookingDialog.jsx** - Toggle UI and configuration
- **BookingLinkPreview.jsx** - Live preview with sequential questions

### Form Data Structure
```javascript
{
  useSequentialQuestions: true, // Default: true for better conversions
  primaryQuestions: [...],
  secondaryQuestions: [...]
}
```

## User Interface

### When Enabled (Sequential Mode)
1. **Progress Indicator**
   - Shows "Question X of Y"
   - Percentage complete
   - Animated progress bar using brand colors

2. **Single Question Display**
   - Large, bold question text (text-2xl)
   - Full-width input field
   - Clear focus on one task at a time

3. **Navigation**
   - "Back" button (if not first question)
   - "Next" button (disabled until current question answered)
   - "Continue to Calendar" button (on last question)

4. **Smooth Animations**
   - Slide transitions between questions
   - Fade in/out effects
   - Progress bar animation

### When Disabled (Standard Mode)
- All questions displayed at once
- Traditional form layout
- Single "Continue to Select Time" button at bottom
- Similar to standard Calendly/booking forms

## Marketing Copy

### Feature Highlights
- **30% More Conversions** - Proven to increase form completion rates
- **Reduced Cognitive Load** - Focus on one question at a time
- **Better Mobile Experience** - Optimized for small screens
- **Professional Animations** - Smooth, modern Typeform-style transitions

### Toggle Description (in UI)
```
Enable Typeform-style one-question-at-a-time flow for better engagement
and higher completion rates. Questions appear progressively with smooth
animations, reducing cognitive load and form abandonment.

When disabled: All questions appear at once (standard form layout)
```

## Syncing with Form Builder

### When Form Builder Updates
If you make changes to sequential questions in the Form Builder module, sync these files:

1. **Animation Patterns**
   - Copy `questionVariants` from BookingEmbed.jsx
   - Update motion transition timings

2. **Progress Indicators**
   - Sync progress bar styling
   - Update percentage calculations

3. **Validation Logic**
   - Copy field validation functions
   - Update required field checking

4. **Input Components**
   - Sync renderQuestionInput() function
   - Update input styling and placeholders

### Code Locations to Sync

**Form Builder:**
- `/frontend/pages/BookingEmbed.jsx` (lines 28-35, progressive form logic)
- `/frontend/pages/FormBuilder.jsx` (form question rendering)

**Meetings:**
- `/frontend/components/meetings/BookingLinkPreview.jsx` (lines 288-372, sequential mode)
- `/frontend/components/meetings/CreateBookingDialog.jsx` (lines 912-932, toggle UI)

## Best Practices

### When to Enable
- **Enable by default** - 30% conversion boost
- Mobile-first booking flows
- Lead generation forms
- High-value conversions

### When to Disable
- Very short forms (1-2 questions only)
- Internal team booking links
- User explicitly requests standard layout

## Technical Details

### Dependencies
- `framer-motion` - Animation library
- `AnimatePresence` - Component mount/unmount animations
- `motion.div` - Animated containers

### State Management
```javascript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [formResponses, setFormResponses] = useState({});
```

### Key Functions
- `handleNextQuestion()` - Advances to next question or calendar
- `handlePreviousQuestion()` - Returns to previous question
- `isCurrentQuestionAnswered()` - Validates current question before advancing

## Future Enhancements
- [ ] Conditional logic (show/hide questions based on answers)
- [ ] Skip patterns for pre-qualified leads
- [ ] Custom animations per question type
- [ ] A/B testing toggle for conversion optimization
- [ ] Answer preview/summary before calendar

## Related Features
- **Form Builder** - Parent technology
- **Booking Links** - Uses sequential questions
- **Lead Capture** - Auto-saves responses
- **Workflow Integration** - Can trigger on question answers

---

**Last Updated:** 2025-01-19
**Maintained By:** Axolop CRM Team
