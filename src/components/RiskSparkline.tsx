import { Visit } from '@/lib/types';

interface RiskSparklineProps {
  visits: Visit[];
  className?: string;
}

export function RiskSparkline({ visits, className = '' }: RiskSparklineProps) {
  if (visits.length < 2) return null;

  const prev = visits[visits.length - 2];
  const curr = visits[visits.length - 1];
  const diff = curr.riskScore - prev.riskScore;
  const isUp = diff > 0;
  const isFlat = diff === 0;

  // SVG dimensions
  const w = 64;
  const h = 32;
  const pad = 4;

  // Normalize points within the SVG
  const minScore = Math.min(prev.riskScore, curr.riskScore);
  const maxScore = Math.max(prev.riskScore, curr.riskScore);
  const range = maxScore - minScore || 1;

  const y1 = isFlat ? h / 2 : pad + ((maxScore - prev.riskScore) / range) * (h - pad * 2);
  const y2 = isFlat ? h / 2 : pad + ((maxScore - curr.riskScore) / range) * (h - pad * 2);

  const strokeColor = isUp
    ? 'hsl(354, 70%, 54%)'
    : isFlat
    ? 'hsl(var(--muted-foreground))'
    : 'hsl(134, 61%, 41%)';

  const dotColor = isUp
    ? 'hsl(354, 70%, 54%)'
    : 'hsl(134, 61%, 41%)';

  return (
    <div className={`flex flex-col items-end gap-0.5 ${className}`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <line
          x1={pad}
          y1={y1}
          x2={w - pad}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          className="sparkline-draw"
        />
        <circle cx={pad} cy={y1} r={3} fill={strokeColor} opacity={0.4} />
        <circle cx={w - pad} cy={y2} r={3.5} fill={dotColor} />
      </svg>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">Risk: {curr.riskScore}/100</span>
        {!isFlat && (
          <span className={`text-[10px] font-bold ${isUp ? 'text-danger' : 'text-success'}`}>
            {isUp ? '↑' : '→'}
          </span>
        )}
      </div>
    </div>
  );
}
