import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  showIcon?: boolean;
}

const riskConfig = {
  LOW: {
    bg: 'bg-success-bg',
    text: 'text-success-foreground',
    border: 'border-success',
    dot: 'bg-success',
    Icon: ShieldCheck,
    animClass: '',
  },
  MODERATE: {
    bg: 'bg-warning-bg',
    text: 'text-warning-foreground',
    border: 'border-warning',
    dot: 'bg-warning',
    Icon: Shield,
    animClass: 'risk-badge-moderate',
  },
  HIGH: {
    bg: 'bg-danger-bg',
    text: 'text-danger-foreground',
    border: 'border-danger',
    dot: 'bg-danger',
    Icon: ShieldAlert,
    animClass: 'risk-badge-high',
  },
};

export function RiskBadge({ level, score, size = 'md', className, animate = true, showIcon = false }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
    lg: 'px-5 py-2.5 text-base font-bold',
    xl: 'px-6 py-3 text-lg font-bold',
  };

  const iconSizes = { sm: 'h-3 w-3', md: 'h-3.5 w-3.5', lg: 'h-4 w-4', xl: 'h-5 w-5' };
  const dotSizes = { sm: 'h-1.5 w-1.5', md: 'h-2 w-2', lg: 'h-2.5 w-2.5', xl: 'h-3 w-3' };

  const config = riskConfig[level];
  const IconComp = config.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 font-semibold',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        animate && config.animClass,
        className
      )}
    >
      {showIcon ? (
        <IconComp className={iconSizes[size]} />
      ) : (
        <span className={cn('inline-block rounded-full', dotSizes[size], config.dot)} />
      )}
      {level}
      {score !== undefined && ` (${score})`}
    </span>
  );
}
