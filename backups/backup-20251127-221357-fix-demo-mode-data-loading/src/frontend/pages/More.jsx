import React from 'react';

export default function More() {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            More
            <span className="ml-3 text-[#761B14]">●</span>
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Additional features and options
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">More Features Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              This section will contain additional features and options for your CRM.
            </p>
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-lg">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}