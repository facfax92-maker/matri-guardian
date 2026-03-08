import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const riskConfig = {
  LOW: {
    bg: 'bg-success-bg',
    text: 'text-success-foreground',
    border: 'border-success',
    dot: 'bg-success',
    glow: '0 0 12px hsl(134, 61%, 41%, 0.4)',
  },
  MODERATE: {
    bg: 'bg-warning-bg',
    text: 'text-warning-foreground',
    border: 'border-warning',
    dot: 'bg-warning',
    glow: '0 0 12px hsl(45, 100%, 51%, 0.4)',
  },
  HIGH: {
    bg: 'bg-danger-bg',
    text: 'text-danger-foreground',
    border: 'border-danger',
    dot: 'bg-danger',
    glow: '0 0 16px hsl(354, 70%, 54%, 0.5)',
  },
};

export function RiskBadge({ level, score, size = 'md', className, animate = true }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-5 py-2.5 text-base font-bold',
  };

  const config = riskConfig[level];

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        level === 'HIGH' && 'animate-pulse-risk',
        className
      )}
      style={level === 'HIGH' && size === 'lg' ? { boxShadow: config.glow } : undefined}
    >
      <span className={cn(
        'inline-block rounded-full',
        size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5',
        config.dot,
      )} />
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
