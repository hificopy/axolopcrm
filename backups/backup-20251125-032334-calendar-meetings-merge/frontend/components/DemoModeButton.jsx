import { UserCircle2 } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useSupabase } from '../context/SupabaseContext';

export default function DemoModeButton() {
  const { user } = useSupabase();
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  // Only show button for axolopcrm@gmail.com
  if (user?.email !== 'axolopcrm@gmail.com') {
    return null;
  }

  return (
    <div className="fixed top-3 z-50" style={{ right: '130px' }}>
      <button
        onClick={toggleDemoMode}
        className={`relative h-10 w-10 flex items-center justify-center rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group overflow-hidden ${
          isDemoMode
            ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            : 'bg-[#761B14] hover:bg-[#6b1a12] active:bg-[#5a1810] hover:shadow-red-900/40'
        }`}
      >
        <UserCircle2 className="h-5 w-5 text-white group-hover:text-white transition-colors relative z-10" />

        {isDemoMode && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-emerald-800 rounded-full shadow-lg z-20 flex items-center justify-center text-xs text-white font-bold">
            ✓
          </span>
        )}

        {/* Tooltip - Opaque */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-gray-700">
          {isDemoMode ? 'Exit Demo Mode' : 'Demo Mode'}
        </div>
      </button>
    </div>
  );
}
