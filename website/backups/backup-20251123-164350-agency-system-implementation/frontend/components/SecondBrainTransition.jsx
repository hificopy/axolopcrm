import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

const SecondBrainTransition = ({ isActive, onComplete }) => {
  const [stage, setStage] = useState('hidden'); // hidden -> expanding -> complete

  useEffect(() => {
    if (isActive) {
      setStage('expanding');
      const timer = setTimeout(() => {
        setStage('complete');
        onComplete();
      }, 1200); // Total transition time
      return () => clearTimeout(timer);
    } else {
      setStage('hidden');
    }
  }, [isActive, onComplete]);

  if (stage === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-1000 ${
        stage === 'expanding' ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: stage === 'expanding'
          ? 'linear-gradient(135deg, rgba(61, 15, 11, 0.98) 0%, rgba(123, 28, 20, 0.95) 50%, rgba(61, 15, 11, 0.98) 100%)'
          : 'transparent',
        transform: stage === 'expanding' ? 'scaleY(1)' : 'scaleY(0)',
        transformOrigin: 'bottom',
      }}
    >
      {/* Brain icon with orbiting particles */}
      <div className="relative">
        {/* Glow behind icon */}
        <div className="absolute inset-0 -m-20 bg-[#7b1c14]/40 rounded-full blur-3xl animate-pulse" />

        {/* Brain Icon */}
        <Brain className="w-32 h-32 text-white relative z-10 drop-shadow-[0_4px_16px_rgba(255,255,255,0.5)] animate-pulse" strokeWidth={2} />

        {/* Orbiting particles */}
        <div className="absolute inset-0 -m-16">
          <div
            className="absolute w-4 h-4 bg-white rounded-full animate-orbit-fast-1 shadow-[0_0_16px_rgba(255,255,255,1)]"
            style={{ top: '50%', left: '50%', transformOrigin: '0 0' }}
          />
          <div
            className="absolute w-4 h-4 bg-white/90 rounded-full animate-orbit-fast-2 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            style={{ top: '50%', left: '50%', transformOrigin: '0 0' }}
          />
          <div
            className="absolute w-4 h-4 bg-white/80 rounded-full animate-orbit-fast-3 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
            style={{ top: '50%', left: '50%', transformOrigin: '0 0' }}
          />
        </div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-32 text-white text-xl font-bold tracking-wider animate-pulse">
        Opening Second Brain...
      </div>

      {/* Animations */}
      <style>{`
        @keyframes orbit-fast-1 {
          from { transform: rotate(0deg) translateX(64px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(64px) rotate(-360deg); }
        }
        @keyframes orbit-fast-2 {
          from { transform: rotate(120deg) translateX(64px) rotate(-120deg); }
          to { transform: rotate(480deg) translateX(64px) rotate(-480deg); }
        }
        @keyframes orbit-fast-3 {
          from { transform: rotate(240deg) translateX(64px) rotate(-240deg); }
          to { transform: rotate(600deg) translateX(64px) rotate(-600deg); }
        }
        .animate-orbit-fast-1 { animation: orbit-fast-1 1.5s linear infinite; }
        .animate-orbit-fast-2 { animation: orbit-fast-2 1.5s linear infinite; }
        .animate-orbit-fast-3 { animation: orbit-fast-3 1.5s linear infinite; }
      `}</style>
    </div>
  );
};

export default SecondBrainTransition;
