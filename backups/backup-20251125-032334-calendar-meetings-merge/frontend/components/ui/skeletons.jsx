// Lead Table Skeleton
export const LeadTableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg border border-gray-300">
          <div className="flex items-center h-full px-4 gap-4">
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Form Card Skeleton
export const FormCardSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
            <div className="space-y-2 ml-2">
              <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 bg-gray-300 rounded ml-auto"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Dashboard Widget Skeleton
export const DashboardWidgetSkeleton = ({ height = 200 }) => (
  <div className="animate-pulse">
    <div 
      className="bg-white rounded-xl border border-gray-200 shadow-md p-6"
      style={{ height: `${height}px` }}
    >
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-4/5"></div>
          <div className="h-3 bg-gray-300 rounded w-3/5"></div>
        </div>
      </div>
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-300">
          <div className="h-5 w-5 bg-gray-400 rounded"></div>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

// Contact Card Skeleton (Mobile)
export const ContactCardSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-40"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Calendar Skeleton
export const CalendarSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-300 rounded w-48"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
          <div className="h-8 w-8 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="h-8 bg-gray-300 rounded flex items-center justify-center text-xs font-semibold">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded border border-gray-300"></div>
        ))}
      </div>
    </div>
  </div>
);

// Pipeline Skeleton
export const PipelineSkeleton = ({ columns = 4 }) => (
  <div className="animate-pulse">
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {[...Array(columns)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80">
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
          </div>
          
          <div className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Full Page Loading Skeleton
export const FullPageSkeleton = ({ title = "Loading..." }) => (
  <div className="h-full min-h-screen flex items-center justify-center pt-[150px] p-6 bg-white">
    <div className="text-center max-w-md w-full">
      <div className="relative mb-8">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#761B14] mx-auto"></div>
        <div className="absolute inset-0 animate-pulse">
          <div className="rounded-full h-16 w-16 border-4 border-[#761B14]/20 mx-auto"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-[#761B14] to-[#9A392D] h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Almost there...</p>
      </div>
    </div>
  </div>
);

// Progress Bar Component
export const ProgressBar = ({ progress = 0, stage = "Processing...", showPercentage = true }) => (
  <div className="w-full bg-white p-4 rounded-lg shadow-lg border border-gray-200">
    <div className="flex justify-between items-center mb-3">
      <span className="text-sm font-medium text-gray-700">{stage}</span>
      {showPercentage && (
        <span className="text-sm font-semibold text-[#761B14]">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-[#761B14] to-[#9A392D] h-3 rounded-full transition-all duration-500 ease-out relative"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
      </div>
    </div>
    {progress < 100 && (
      <p className="text-xs text-gray-500 mt-2">
        {progress < 30 ? "Initializing..." : 
         progress < 60 ? "Processing data..." : 
         progress < 90 ? "Almost done..." : "Finalizing..."}
      </p>
    )}
  </div>
);

// Loading States for different contexts
export const LoadingStates = {
  // Table loading
  table: LeadTableSkeleton,
  
  // Card grid loading
  cards: FormCardSkeleton,
  
  // Dashboard loading
  dashboard: DashboardWidgetSkeleton,
  
  // Stats loading
  stats: StatsCardSkeleton,
  
  // Mobile list loading
  mobileList: ContactCardSkeleton,
  
  // Calendar loading
  calendar: CalendarSkeleton,
  
  // Pipeline loading
  pipeline: PipelineSkeleton,
  
  // Full page loading
  fullPage: FullPageSkeleton,
};

// Contextual loading component
export const ContextualLoader = ({ type = 'fullPage', ...props }) => {
  const LoaderComponent = LoadingStates[type] || FullPageSkeleton;
  return <LoaderComponent {...props} />;
};

export default {
  LeadTableSkeleton,
  FormCardSkeleton,
  DashboardWidgetSkeleton,
  StatsCardSkeleton,
  ContactCardSkeleton,
  CalendarSkeleton,
  PipelineSkeleton,
  FullPageSkeleton,
  ProgressBar,
  LoadingStates,
  ContextualLoader,
};