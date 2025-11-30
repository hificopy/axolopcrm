import { Square, Grid3X3, Columns3, Kanban, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Boards() {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Grid3X3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
            </div>
            <p className="text-sm text-gray-600">Visual project management with boards</p>
          </div>
          
          <Link 
            to="/app/home" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500/10 to-orange-600/10 flex items-center justify-center mb-6">
              <Grid3X3 className="h-8 w-8 text-yellow-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Project Boards</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Kanban-style boards for visual project management. Coming soon with integration to popular tools.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col items-center">
                <Kanban className="h-6 w-6 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Kanban</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col items-center">
                <Columns3 className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Columns</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col items-center">
                <Square className="h-6 w-6 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Custom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}