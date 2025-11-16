import { Outlet } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  const { theme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - always stays with its own styling */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Topbar - should remain unchanged */}
        <Topbar />

        {/* Page Content - dashboard area that changes with theme */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
