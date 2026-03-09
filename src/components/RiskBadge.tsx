import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
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
    glow: '0 0 12px hsl(134, 61%, 41%, 0.4)',
    Icon: ShieldCheck,
  },
  MODERATE: {
    bg: 'bg-warning-bg',
    text: 'text-warning-foreground',
    border: 'border-warning',
    dot: 'bg-warning',
    glow: '0 0 14px hsl(45, 100%, 51%, 0.4)',
    Icon: Shield,
  },
  HIGH: {
    bg: 'bg-danger-bg',
    text: 'text-danger-foreground',
    border: 'border-danger',
    dot: 'bg-danger',
    glow: '0 0 20px hsl(354, 70%, 54%, 0.5)',
    Icon: ShieldAlert,
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

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 font-semibold',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        level === 'HIGH' && 'animate-pulse-risk risk-high-pulse',
        level === 'MODERATE' && 'risk-moderate-pulse',
        className
      )}
      style={(level === 'HIGH' && (size === 'lg' || size === 'xl')) ? { boxShadow: config.glow } : undefined}
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

  if (!animate) return content;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      key={level}
    >
      {content}
    </motion.span>
  );
}
