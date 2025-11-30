import { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Tour steps configuration
const TOUR_STEPS = {
  dashboard: [
    {
      id: 'welcome',
      target: '.dashboard-welcome',
      title: 'Welcome to Axolop! 🎉',
      content: 'Let\'s get you set up in 60 seconds. This is your command center where you can see everything at a glance.',
      position: 'bottom',
      action: 'next'
    },
    {
      id: 'quick-stats',
      target: '.crm-stats-grid',
      title: 'Your Business at a Glance',
      content: 'These cards show your key metrics. Watch them update in real-time as you grow your business!',
      position: 'top',
      action: 'next'
    },
    {
      id: 'create-lead',
      target: '.create-lead-button',
      title: 'Add Your First Lead',
      content: 'Start by adding a lead or importing existing contacts. This is your sales pipeline foundation.',
      position: 'left',
      action: 'next'
    },
    {
      id: 'navigation',
      target: '.sidebar-navigation',
      title: 'Navigate with Ease',
      content: 'Access all your features from the sidebar. Core features are always visible, advanced features are just a click away.',
      position: 'right',
      action: 'next'
    },
    {
      id: 'search',
      target: '.universal-search',
      title: 'Universal Search (⌘K)',
      content: 'Find anything instantly - leads, contacts, forms, and more. Just press Cmd+K anywhere in the app!',
      position: 'bottom',
      action: 'complete'
    }
  ],
  leads: [
    {
      id: 'leads-overview',
      target: '.leads-header',
      title: 'Manage Your Sales Pipeline',
      content: 'Here you can view, edit, and manage all your leads in one powerful interface.',
      position: 'bottom',
      action: 'next'
    },
    {
      id: 'add-lead',
      target: '.add-lead-button',
      title: 'Add New Leads',
      content: 'Click here to add individual leads or import hundreds at once from a CSV file.',
      position: 'left',
      action: 'next'
    },
    {
      id: 'filters',
      target: '.lead-filters',
      title: 'Smart Filtering',
      content: 'Filter your leads by status, value, date range, and more to find exactly what you need.',
      position: 'bottom',
      action: 'complete'
    }
  ],
  forms: [
    {
      id: 'forms-overview',
      target: '.forms-header',
      title: 'Create Powerful Forms',
      content: 'Build beautiful, conversational forms that convert visitors into leads.',
      position: 'bottom',
      action: 'next'
    },
    {
      id: 'create-form',
      target: '.create-form-button',
      title: 'Build Your First Form',
      content: 'Start with a template or create from scratch. Our drag-and-drop builder makes it easy!',
      position: 'left',
      action: 'complete'
    }
  ]
};

// Tour positioning component
const TourTooltip = ({ step, onNext, onPrevious, onComplete, isFirst, isLast }) => {
  const getPositionClasses = (position) => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-3';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-3';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-3';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-3';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-3';
    }
  };

  const getArrowIcon = (position) => {
    switch (position) {
      case 'top':
        return <ArrowDown className="h-4 w-4" />;
      case 'bottom':
        return <ArrowUp className="h-4 w-4" />;
      case 'left':
        return <ArrowRight className="h-4 w-4" />;
      case 'right':
        return <ArrowLeft className="h-4 w-4" />;
      default:
        return <ArrowUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed z-[9999] pointer-events-none">
      {/* Highlight overlay */}
      <div
        className="absolute bg-blue-500/20 border-2 border-blue-500 rounded-lg pointer-events-none transition-all duration-300"
        style={{
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />
      
      {/* Tooltip */}
      <div className={`absolute ${getPositionClasses(step.position)} pointer-events-auto`}>
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm relative">
          {/* Arrow indicator */}
          <div className={`absolute ${step.position === 'top' ? 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full' :
            step.position === 'bottom' ? 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full' :
            step.position === 'left' ? 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full' :
            'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full'
          } text-gray-400`}>
            {getArrowIcon(step.position)}
          </div>
          
          {/* Close button */}
          <button
            onClick={onComplete}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Content */}
          <div className="pr-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {step.content}
            </p>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((step.id.charCodeAt(0) - 97) / 25) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Step {step.id.charCodeAt(0) - 96}</span>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  className="gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </Button>
              )}
              
              {isLast ? (
                <Button
                  onClick={onComplete}
                  className="gap-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Start Free Trial!
                  <ArrowRight className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  className="gap-1"
                  size="sm"
                >
                  Next
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main tour component
export const InteractiveTour = ({ 
  tourKey = 'dashboard', 
  isOpen = false, 
  onClose, 
  onComplete,
  autoStart = false 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const steps = TOUR_STEPS[tourKey] || [];

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  // Position the highlight overlay
  const positionHighlight = useCallback(() => {
    if (!currentStep || !isOpen) return;

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const highlight = document.querySelector('.tour-highlight');
    
    if (highlight) {
      highlight.style.position = 'fixed';
      highlight.style.left = `${rect.left - 8}px`;
      highlight.style.top = `${rect.top - 8}px`;
      highlight.style.width = `${rect.width + 16}px`;
      highlight.style.height = `${rect.height + 16}px`;
      highlight.style.zIndex = '9998';
      highlight.style.borderRadius = '8px';
      highlight.style.pointerEvents = 'none';
    }

    setIsHighlighted(true);
  }, [currentStep, isOpen]);

  // Update position when step changes
  useEffect(() => {
    if (isOpen && currentStep) {
      setTimeout(positionHighlight, 100);
    }
  }, [currentStep, isOpen, positionHighlight]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          if (!isLast) handleNext();
          else handleComplete();
          break;
        case 'ArrowLeft':
          if (!isFirst) handlePrevious();
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isFirst, isLast]);

  const handleNext = () => {
    if (!isLast) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Mark tour as completed
    localStorage.setItem(`tour-completed-${tourKey}`, 'true');
    onComplete?.();
    onClose?.();
  };

  const handleClose = () => {
    // Allow skipping but don't mark as completed
    onClose?.();
  };

  const handleSkip = () => {
    // Mark as skipped
    localStorage.setItem(`tour-skipped-${tourKey}`, 'true');
    onClose?.();
  };

  // Check if tour should auto-start
  useEffect(() => {
    if (autoStart && !localStorage.getItem(`tour-completed-${tourKey}`) && !localStorage.getItem(`tour-skipped-${tourKey}`)) {
      // Auto-start tour after a short delay
      setTimeout(() => {
        // This would be handled by parent component
      }, 2000);
    }
  }, [autoStart, tourKey]);

  if (!isOpen || !currentStep) return null;

  return (
    <>
      {/* Highlight overlay */}
      <div className="tour-highlight fixed bg-blue-500/10 border-2 border-blue-500 rounded-lg transition-all duration-300" />
      
      {/* Tour tooltip */}
      <TourTooltip
        step={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        isFirst={isFirst}
        isLast={isLast}
      />
      
      {/* Skip tour button */}
      <button
        onClick={handleSkip}
        className="fixed bottom-4 right-4 text-gray-500 hover:text-gray-700 text-sm underline z-[9999]"
      >
        Skip tour
      </button>
    </>
  );
};

// Tour controller hook
export const useTour = (tourKey = 'dashboard') => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  const startTour = () => {
    setIsTourOpen(true);
  };
  
  const closeTour = () => {
    setIsTourOpen(false);
  };
  
  const completeTour = () => {
    localStorage.setItem(`tour-completed-${tourKey}`, 'true');
    setIsTourOpen(false);
  };
  
  const resetTour = () => {
    localStorage.removeItem(`tour-completed-${tourKey}`);
    localStorage.removeItem(`tour-skipped-${tourKey}`);
  };
  
  const hasCompletedTour = () => {
    return localStorage.getItem(`tour-completed-${tourKey}`) === 'true';
  };
  
  const hasSkippedTour = () => {
    return localStorage.getItem(`tour-skipped-${tourKey}`) === 'true';
  };
  
  return {
    isTourOpen,
    startTour,
    closeTour,
    completeTour,
    resetTour,
    hasCompletedTour,
    hasSkippedTour
  };
};

export default InteractiveTour;