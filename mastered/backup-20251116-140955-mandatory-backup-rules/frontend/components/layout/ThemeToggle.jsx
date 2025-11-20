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
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleThemeHandler}
      className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
      aria-label={getThemeLabel()}
    >
      {getThemeIcon()}
    </Button>
  );
}