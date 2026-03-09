import { ReactNode } from 'react';

export function AnimatedListItem({ children, index, className }: { children: ReactNode; index: number; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function AnimatedEmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <div className="mb-3 opacity-30">{icon}</div>
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
