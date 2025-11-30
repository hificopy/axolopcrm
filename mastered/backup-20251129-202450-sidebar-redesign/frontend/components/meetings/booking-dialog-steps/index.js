// Booking Dialog Step Components
// These components break down the large CreateBookingDialog into manageable pieces

export { default as EventDetailsStep } from "./EventDetailsStep.jsx";
export { default as TimingStep } from "./TimingStep.jsx";
export { default as LocationStep } from "./LocationStep.jsx";
export { default as QuestionsStep } from "./QuestionsStep.jsx";
export { default as TeamStep } from "./TeamStep.jsx";
export { default as LimitationsStep } from "./LimitationsStep.jsx";

// Step configuration for the main dialog
export const bookingSteps = [
  {
    id: "event-details",
    title: "Event Details",
    description: "Basic information about your booking link",
    component: "EventDetailsStep",
  },
  {
    id: "timing",
    title: "Timing & Availability",
    description: "Set duration, schedule, and time preferences",
    component: "TimingStep",
  },
  {
    id: "location",
    title: "Location",
    description: "Configure where meetings will take place",
    component: "LocationStep",
  },
  {
    id: "questions",
    title: "Booking Questions",
    description: "Customize questions for attendees",
    component: "QuestionsStep",
  },
  {
    id: "team",
    title: "Team & Assignment",
    description: "Configure team members and assignment rules",
    component: "TeamStep",
  },
  {
    id: "limitations",
    title: "Booking Limitations",
    description: "Set restrictions and booking rules",
    component: "LimitationsStep",
  },
];
