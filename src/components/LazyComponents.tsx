import { lazy, Suspense } from 'react';
import { OptimizedGlass } from './ui/OptimizedGlass';

// Lazy load heavy components for better initial page load
export const LazyAdminPanel = lazy(() => 
  import('./admin/AdminDashboard').then(module => ({ default: module.AdminDashboard }))
);

export const LazyPDFDemo = lazy(() => 
  import('./PDFDemo').then(module => ({ default: module.PDFDemo }))
);

export const LazyExploreModal = lazy(() => 
  import('./explore/ExploreLadakh').then(module => ({ default: module.ExploreLadakh }))
);

export const LazyBookingModal = lazy(() => 
  import('./booking/UniversalBookingModal').then(module => ({ default: module.UniversalBookingModal }))
);

export const LazyYourTrips = lazy(() => 
  import('./trips/YourTrips').then(module => ({ default: module.YourTrips }))
);

// Enhanced loading component
const EnhancedLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <OptimizedGlass intensity="medium" className="p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-white font-medium">Loading...</div>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </OptimizedGlass>
  </div>
);

// Wrapper component with optimized loading state
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({ 
  children, 
  fallback 
}) => (
  <Suspense fallback={fallback || <EnhancedLoader />}>
    {children}
  </Suspense>
);
