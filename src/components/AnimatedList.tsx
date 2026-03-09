import { ReactNode } from 'react';

export function AnimatedListItem({ children, index, className }: { children: ReactNode; index: number; className?: string }) {
  return (
    <div
      className={`list-item-in ${className ?? ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {children}
    </div>
  );
}

export function AnimatedEmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <div className="mb-3 empty-icon-bounce">{icon}</div>
      <p className="font-medium splash-subtitle" style={{ animationDelay: '0.3s' }}>{title}</p>
      {description && <p className="text-sm mt-1 splash-subtitle" style={{ animationDelay: '0.4s' }}>{description}</p>}
      {action && <div className="mt-4 splash-subtitle" style={{ animationDelay: '0.5s' }}>{action}</div>}
    </div>
  );
}
