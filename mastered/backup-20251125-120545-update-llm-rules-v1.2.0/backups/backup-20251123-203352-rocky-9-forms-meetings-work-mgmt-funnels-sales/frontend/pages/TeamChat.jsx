import { MessageSquare, Users, Hash, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeamChat() {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#791C14] to-[#a03a2e] flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
            </div>
            <p className="text-sm text-gray-600">Collaborate with your team in real-time</p>
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
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-[#791C14]/10 to-[#a03a2e]/10 flex items-center justify-center mb-6">
              <MessageSquare className="h-8 w-8 text-[#791C14]" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Team Chat</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Real-time messaging and collaboration for your team. Coming soon in an upcoming release.
            </p>
            
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200">
              <Hash className="h-4 w-4" />
              <span>Feature in Development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}