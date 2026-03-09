import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const PatientListSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2, 3, 4].map(i => (
      <Card
        key={i}
        className="border-0 shadow-sm list-item-in"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-36" />
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
