import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: 'patients' | 'alerts' | 'visits';
}

const illustrations = {
  patients: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <rect x="40" y="30" width="120" height="100" rx="16" className="fill-muted/50" />
      <circle cx="80" cy="65" r="16" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <circle cx="80" cy="58" r="6" className="fill-primary/30" />
      <path d="M68 74c0-6.627 5.373-12 12-12s12 5.373 12 12" className="stroke-primary/30" strokeWidth="2" fill="none" />
      <rect x="108" y="55" width="36" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="108" y="65" width="24" height="4" rx="2" className="fill-muted-foreground/15" />
      <rect x="108" y="75" width="30" height="4" rx="2" className="fill-muted-foreground/10" />
      <circle cx="130" cy="100" r="12" className="fill-primary/15 stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M126 100h8M130 96v8" className="stroke-primary/50" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <rect x="30" y="40" width="140" height="30" rx="10" className="fill-muted/30" />
      <rect x="30" y="78" width="140" height="30" rx="10" className="fill-muted/20" />
      <rect x="30" y="116" width="140" height="30" rx="10" className="fill-muted/10" />
      <circle cx="50" cy="55" r="6" className="fill-success/30" />
      <circle cx="50" cy="93" r="6" className="fill-success/20" />
      <circle cx="50" cy="131" r="6" className="fill-success/10" />
      <rect x="65" y="51" width="60" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="65" y="59" width="40" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <path d="M90 20l10 16H80l10-16z" className="fill-primary/20" />
      <text x="87" y="33" className="fill-primary/40" fontSize="10" fontWeight="bold">✓</text>
    </svg>
  ),
  visits: (
    <svg viewBox="0 0 200 160" fill="none" className="w-40 h-32 mx-auto">
      <rect x="50" y="20" width="100" height="120" rx="12" className="fill-muted/40" />
      <rect x="65" y="35" width="70" height="8" rx="4" className="fill-primary/20" />
      <line x1="65" y1="55" x2="135" y2="55" className="stroke-muted-foreground/15" strokeWidth="1" />
      {[65, 80, 95, 110].map((y, i) => (
        <g key={i}>
          <rect x="65" y={y} width="50" height="4" rx="2" className="fill-muted-foreground/15" style={{ opacity: 1 - i * 0.2 }} />
          <rect x="120" y={y} width="15" height="4" rx="2" className="fill-muted-foreground/10" style={{ opacity: 1 - i * 0.2 }} />
        </g>
      ))}
      <circle cx="150" cy="130" r="16" className="fill-primary/15" />
      <path d="M144 130h12M150 124v12" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export const EmptyState = ({ icon, title, description, actionLabel, onAction, illustration }: EmptyStateProps) => (
  <div className="text-center py-12 px-6 list-item-in">
    {illustration && <div className="mb-4 empty-icon-bounce">{illustrations[illustration]}</div>}
    {!illustration && <div className="mb-3 empty-icon-bounce">{icon}</div>}
    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} className="rounded-xl gradient-primary text-primary-foreground border-0 btn-press">
        {actionLabel}
      </Button>
    )}
  </div>
);
