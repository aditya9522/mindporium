import { Skeleton } from './Skeleton';

export function AnnouncementSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-3 w-24 mt-2" />
            </div>
            <div className="flex gap-2 ml-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
