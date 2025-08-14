interface LoadingSkeletonProps {
  type: 'card' | 'chart' | 'table' | 'stats';
  className?: string;
}

export function LoadingSkeleton({type, className = ''}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-700 rounded';

  switch (type) {
    case 'card':
      return (
        <div
          className={`bg-gray-800 border border-gray-600 rounded-xl p-8 ${className}`}
        >
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      );

    case 'chart':
      return (
        <div
          className={`bg-gray-800 border border-gray-600 rounded-xl p-8 ${className}`}
        >
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      );

    case 'table':
      return (
        <div
          className={`bg-gray-800 border border-gray-600 rounded-xl p-8 ${className}`}
        >
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      );

    case 'stats':
      return (
        <div
          className={`bg-gray-800 border border-gray-600 rounded-xl p-8 ${className}`}
        >
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="h-12 bg-gray-700 rounded w-24 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-20 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-12 bg-gray-700 rounded w-24 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-20 mx-auto"></div>
            </div>
          </div>
        </div>
      );

    default:
      return <div className={`${baseClasses} h-32 ${className}`}></div>;
  }
}

// Specific skeleton components for common patterns
export function CardSkeleton({className = ''}: {className?: string}) {
  return <LoadingSkeleton type="card" className={className} />;
}

export function ChartSkeleton({className = ''}: {className?: string}) {
  return <LoadingSkeleton type="chart" className={className} />;
}

export function TableSkeleton({className = ''}: {className?: string}) {
  return <LoadingSkeleton type="table" className={className} />;
}

export function StatsSkeleton({className = ''}: {className?: string}) {
  return <LoadingSkeleton type="stats" className={className} />;
}
