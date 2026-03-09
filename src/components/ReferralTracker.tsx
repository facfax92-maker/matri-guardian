import { useState, useEffect } from 'react';
import { getReferralsForPatient, updateReferralStatus } from '@/lib/storage';
import { Referral, ReferralStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Truck, Stethoscope, Home, AlertTriangle, MessageSquare } from 'lucide-react';


const statusConfig: Record<ReferralStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  'pending': { label: 'Pending', icon: Clock, color: 'text-warning-foreground', bg: 'bg-warning-bg' },
  'patient-arrived': { label: 'Patient Arrived', icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
  'treatment-started': { label: 'Treatment Started', icon: Stethoscope, color: 'text-success-foreground', bg: 'bg-success-bg' },
  'discharged': { label: 'Discharged', icon: Home, color: 'text-muted-foreground', bg: 'bg-muted' },
};

const allStatuses: ReferralStatus[] = ['pending', 'patient-arrived', 'treatment-started', 'discharged'];

interface ReferralTrackerProps {
  patientId: string;
}

export function ReferralTracker({ patientId }: ReferralTrackerProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [simulating, setSimulating] = useState<string | null>(null);

  useEffect(() => {
    setReferrals(getReferralsForPatient(patientId));
  }, [patientId]);

  const sentReferrals = referrals.filter(r => r.status === 'sent');
  if (sentReferrals.length === 0) return null;

  const simulateNextStatus = (referral: Referral) => {
    const currentIdx = allStatuses.indexOf(referral.trackingStatus);
    if (currentIdx >= allStatuses.length - 1) return;

    setSimulating(referral.id);
    const nextStatus = allStatuses[currentIdx + 1];
    const messages: Record<ReferralStatus, string> = {
      'pending': '',
      'patient-arrived': `SMS from ${referral.facility}: Patient ${referral.id} has arrived at facility. Intake in progress.`,
      'treatment-started': `SMS from ${referral.facility}: Treatment initiated. Patient under observation. Will update on status.`,
      'discharged': `SMS from ${referral.facility}: Patient discharged with instructions. Follow-up in 1 week recommended.`,
    };

    setTimeout(() => {
      updateReferralStatus(referral.id, nextStatus, messages[nextStatus]);
      setReferrals(getReferralsForPatient(patientId));
      setSimulating(null);
    }, 1500);
  };

  const getHoursSinceLastUpdate = (referral: Referral): number => {
    const lastUpdate = referral.updates[referral.updates.length - 1];
    if (!lastUpdate) return 0;
    return Math.floor((Date.now() - new Date(lastUpdate.timestamp).getTime()) / (1000 * 60 * 60));
  };

  return (
    <div className="space-y-3">
      {sentReferrals.map((referral) => {
        const currentConfig = statusConfig[referral.trackingStatus || 'pending'];
        const CurrentIcon = currentConfig.icon;
        const hoursSince = getHoursSinceLastUpdate(referral);
        const noResponse = referral.trackingStatus === 'pending' && hoursSince >= 24;

        return (
          <Card key={referral.id} className={`border-2 ${noResponse ? 'border-danger/40' : 'border-primary/20'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-xl ${currentConfig.bg} flex items-center justify-center`}>
                    <CurrentIcon className={`h-4 w-4 ${currentConfig.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Referral Status</CardTitle>
                    <p className="text-xs text-muted-foreground">{referral.facility}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`${currentConfig.bg} ${currentConfig.color} border-0`}>
                  {currentConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* No response alert */}
              {noResponse && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-danger-bg border border-danger/30">
                  <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
                  <p className="text-xs font-semibold text-danger-foreground">
                    No hospital response in 24+ hours — follow up immediately!
                  </p>
                </div>
              )}

              {/* Status Timeline */}
              <div className="relative pl-6 space-y-0">
                {allStatuses.map((status, i) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  const currentIdx = allStatuses.indexOf(referral.trackingStatus || 'pending');
                  const isCompleted = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  const update = (referral.updates || []).find(u => u.status === status);

                  return (
                    <div key={status} className="relative">
                      {/* Vertical line */}
                      {i < allStatuses.length - 1 && (
                        <div className={`absolute left-[-16px] top-6 w-0.5 h-full ${isCompleted && i < currentIdx ? 'bg-success' : 'bg-border'}`} />
                      )}
                      {/* Dot */}
                      <div className={`absolute left-[-20px] top-1 h-3 w-3 rounded-full border-2 ${
                        isCompleted ? 'bg-success border-success' : 'bg-background border-border'
                      } ${isCurrent ? 'ring-2 ring-success/30' : ''}`} />

                      <motion.div
                        className={`pb-4 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}
                        initial={isCurrent ? { opacity: 0, x: -5 } : {}}
                        animate={{ opacity: isCompleted ? 1 : 0.4, x: 0 }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3 w-3 ${isCompleted ? config.color : 'text-muted-foreground'}`} />
                          <span className={`text-xs font-semibold ${isCompleted ? '' : 'text-muted-foreground'}`}>
                            {config.label}
                          </span>
                        </div>
                        {update && (
                          <div className="mt-1">
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(update.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{update.message}</p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* Simulate button */}
              {referral.trackingStatus !== 'discharged' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  disabled={simulating === referral.id}
                  onClick={() => simulateNextStatus(referral)}
                >
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  {simulating === referral.id ? 'Receiving SMS update...' : 'Simulate Hospital SMS Response'}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
