import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats skeleton */}
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map(i => (
        <Card key={i} className="text-center border-0 shadow-sm list-item-in" style={{ animationDelay: `${i * 80}ms` }}>
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-7 w-10" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Chart skeleton */}
    <Card className="border-0 shadow-sm list-item-in" style={{ animationDelay: '250ms' }}>
      <CardHeader className="pb-0">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quick actions skeleton */}
    <div className="grid gap-3 grid-cols-3 list-item-in" style={{ animationDelay: '350ms' }}>
      {[0, 1, 2].map(i => (
        <Skeleton key={i} className="h-12 rounded-xl" />
      ))}
    </div>

    {/* Alerts skeleton */}
    <div className="list-item-in" style={{ animationDelay: '450ms' }}>
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="space-y-2">
        {[0, 1, 2].map(i => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-4 w-4 shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);
