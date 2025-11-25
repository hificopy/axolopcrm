import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import SecondBrainTransition from './SecondBrainTransition';

const SecondBrainTab = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const windowHeight = window.innerHeight;
      const cursorY = e.clientY;
      const threshold = 20; // Trigger full tab when VERY close to bottom
      const glowThreshold = 80; // Show glow when getting close

      // Show tab instantly when cursor is at the very bottom
      if (windowHeight - cursorY < threshold) {
        setIsVisible(true);
        setShowGlow(false);
      } else if (windowHeight - cursorY < glowThreshold) {
        // Show glow when close but not close enough
        setIsVisible(false);
        setShowGlow(true);
      } else {
        setIsVisible(false);
        setShowGlow(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleClick = () => {
    // Trigger full-screen transition
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    // Navigate after transition completes
    navigate('/app/second-brain/logic');
    setShowTransition(false);
  };

  return (
    <>
      {/* Bottom glow indicator - shows when cursor is close but not close enough */}
      {showGlow && !isVisible && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 animate-in fade-in"
          style={{
            width: 'min(85%, 520px)',
            marginLeft: '140px',
            height: '4px',
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#7b1c14] to-transparent blur-sm" />
          <div className="w-2/3 mx-auto h-[2px] bg-gradient-to-r from-transparent via-[#ff6b5a] to-transparent" />
        </div>
      )}

      {/* Main tab */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          width: 'min(85%, 520px)',
          marginLeft: '140px' // Offset more to the right
        }}
      >
      <button
        onClick={handleClick}
        className="group relative w-full h-16 overflow-hidden rounded-t-3xl backdrop-blur-2xl bg-[#3d0f0b] border-2 border-[#7b1c14]/40 border-b-0 shadow-[0_-8px_32px_rgba(123,28,20,0.6)] hover:shadow-[0_-12px_48px_rgba(123,28,20,0.8)] transition-all duration-500 hover:h-[70px] hover:border-[#7b1c14]/60"
        style={{
          background: 'linear-gradient(135deg, rgba(61, 15, 11, 0.98) 0%, rgba(123, 28, 20, 0.95) 50%, rgba(61, 15, 11, 0.98) 100%)',
        }}
      >
        {/* Glassmorphic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] via-white/[0.08] to-white/[0.12] opacity-60" />

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-t-3xl" style={{
          boxShadow: 'inset 0 2px 12px rgba(255, 255, 255, 0.08), inset 0 -2px 8px rgba(0, 0, 0, 0.3)'
        }} />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-in-out" />

        {/* Content */}
        <div className="relative flex items-center justify-center gap-4 h-full px-8">
          {/* Brain Icon with rotating sharks */}
          <div className="relative flex-shrink-0">
            {/* Glow behind icon */}
            <div className="absolute inset-0 -m-3 bg-[#7b1c14]/30 rounded-full blur-xl" />

            {/* Brain Icon */}
            <Brain className="w-7 h-7 text-white relative z-10 drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" strokeWidth={2.5} />

            {/* Rotating Sharks (circles) */}
            <div className="absolute inset-0 -m-3">
              {/* Shark 1 */}
              <div
                className="absolute w-2 h-2 bg-white rounded-full animate-orbit-1 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                }}
              />
              {/* Shark 2 */}
              <div
                className="absolute w-2 h-2 bg-white/90 rounded-full animate-orbit-2 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                }}
              />
              {/* Shark 3 */}
              <div
                className="absolute w-2 h-2 bg-white/75 rounded-full animate-orbit-3 shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                }}
              />
            </div>
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          {/* Text */}
          <span className="text-white font-bold text-base tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Second Brain
          </span>

          {/* Badge */}
          <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-bold tracking-wider border border-white/20 shadow-lg">
            BETA
          </span>

          {/* Arrow indicator */}
          <svg
            className="w-5 h-5 text-white/50 group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-300 ml-auto drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>

        {/* Top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b5a]/60 to-transparent" />

        {/* Bottom accent glow */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-[#7b1c14] blur-sm" />
      </button>

      {/* Custom animations for orbiting sharks */}
      <style>{`
        @keyframes orbit-1 {
          from {
            transform: rotate(0deg) translateX(20px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(20px) rotate(-360deg);
          }
        }

        @keyframes orbit-2 {
          from {
            transform: rotate(120deg) translateX(20px) rotate(-120deg);
          }
          to {
            transform: rotate(480deg) translateX(20px) rotate(-480deg);
          }
        }

        @keyframes orbit-3 {
          from {
            transform: rotate(240deg) translateX(20px) rotate(-240deg);
          }
          to {
            transform: rotate(600deg) translateX(20px) rotate(-600deg);
          }
        }

        .animate-orbit-1 {
          animation: orbit-1 4s linear infinite;
        }

        .animate-orbit-2 {
          animation: orbit-2 4s linear infinite;
        }

        .animate-orbit-3 {
          animation: orbit-3 4s linear infinite;
        }
      `}</style>
    </div>

    {/* Full-screen transition */}
    <SecondBrainTransition
      isActive={showTransition}
      onComplete={handleTransitionComplete}
    />
    </>
  );
};

export default SecondBrainTab;
