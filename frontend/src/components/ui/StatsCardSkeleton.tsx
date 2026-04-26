import { Skeleton } from './Skeleton';

interface StatsCardSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsCardSkeleton({ 
    count = 4, 
    className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
}: StatsCardSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
