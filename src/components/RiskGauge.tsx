import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiskLevel } from '@/lib/types';
import { getRiskLevel } from '@/lib/risk-scoring';

interface RiskGaugeProps {
  score: number;
  size?: number;
  duration?: number;
}

export function RiskGauge({ score, size = 180, duration = 1.5 }: RiskGaugeProps) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const riskLevel = getRiskLevel(score);

  // Animate counter
  useEffect(() => {
    if (score === 0) { setDisplayedScore(0); return; }
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(eased * score));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score, duration]);

  // Arc math
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size / 2 - 16;
  const startAngle = 180;
  const endAngle = 0;
  const totalArc = 180; // semi-circle in degrees

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const sweep = start - end > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${sweep} 1 ${e.x} ${e.y}`;
  };

  const scoreAngle = startAngle - (score / 100) * totalArc;
  const bgPath = describeArc(startAngle, endAngle);

  const chipConfig: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
    LOW: { bg: 'bg-success-bg', text: 'text-success-foreground', border: 'border-success', label: 'LOW RISK' },
    MODERATE: { bg: 'bg-warning-bg', text: 'text-warning-foreground', border: 'border-warning', label: 'MODERATE RISK' },
    HIGH: { bg: 'bg-danger-bg', text: 'text-danger-foreground', border: 'border-danger', label: 'HIGH RISK' },
  };

  const chip = chipConfig[riskLevel];
  const isHigh = riskLevel === 'HIGH';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(134, 61%, 41%)" />
            <stop offset="40%" stopColor="hsl(45, 100%, 51%)" />
            <stop offset="75%" stopColor="hsl(25, 95%, 53%)" />
            <stop offset="100%" stopColor="hsl(354, 70%, 54%)" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <path
          d={bgPath}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Gradient arc */}
        <motion.path
          d={bgPath}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={14}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: `${size * 0.22}px`, fontWeight: 800 }}
        >
          {displayedScore}
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: `${size * 0.075}px`, fontWeight: 500 }}
        >
          out of 100
        </text>
      </svg>
      {/* Risk chip */}
      <span
        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border-2 ${chip.bg} ${chip.text} ${chip.border} ${
          isHigh ? 'risk-chip-pulse' : ''
        }`}
      >
        {chip.label}
      </span>
    </div>
  );
}
