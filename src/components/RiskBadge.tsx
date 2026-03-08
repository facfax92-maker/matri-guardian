import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RiskBadge({ level, score, size = 'md', className }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base font-bold',
  };

  const colorClasses = {
    LOW: 'bg-success-bg text-success-foreground border-success',
    MODERATE: 'bg-warning-bg text-warning-foreground border-warning',
    HIGH: 'bg-danger-bg text-danger-foreground border-danger animate-pulse-risk',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        sizeClasses[size],
        colorClasses[level],
        className
      )}
    >
      <span className={cn(
        'inline-block rounded-full',
        size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5',
        level === 'LOW' && 'bg-success',
        level === 'MODERATE' && 'bg-warning',
        level === 'HIGH' && 'bg-danger',
      )} />
      {level}
      {score !== undefined && ` (${score})`}
    </span>
  );
}
