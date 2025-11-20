import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { theme, setTheme, setAutoTheme } = useTheme();

  const toggleThemeHandler = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setAutoTheme();
    } else { // auto
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'auto':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark theme';
      case 'dark':
        return 'Switch to auto theme';
      case 'auto':
      default:
        return 'Switch to light theme';
    }
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleThemeHandler}
        className="relative h-10 w-10 p-0 rounded-lg backdrop-blur-xl bg-[#2a2d35] dark:bg-[#1a1d24] hover:bg-[#333640] dark:hover:bg-[#252831] border-2 border-gray-700 dark:border-gray-600 overflow-hidden focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
        aria-label={getThemeLabel()}
      >
        {/* Glassmorphic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />

        <div className="relative z-10 text-gray-300 dark:text-gray-400 group-hover:text-white dark:group-hover:text-gray-200 transition-colors">
          {getThemeIcon()}
        </div>
      </Button>

      {/* Tooltip - Glassmorphic */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 backdrop-blur-xl bg-gray-900/90 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
        {getThemeLabel()}
      </div>
    </div>
  );
}