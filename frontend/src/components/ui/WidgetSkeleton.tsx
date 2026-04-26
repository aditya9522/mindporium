import { Skeleton } from './Skeleton';

interface WidgetSkeletonProps {
  count?: number;
  className?: string;
}

export function WidgetSkeleton({ 
    count = 2,
    className = "grid grid-cols-1 lg:grid-cols-2 gap-8"
}: WidgetSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col h-full min-h-[300px]">
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-40" />
            </div>
            <div className="space-y-6 flex-1">
                {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                        <div className="space-y-2 flex-1 pt-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      ))}
    </div>
  );
}
