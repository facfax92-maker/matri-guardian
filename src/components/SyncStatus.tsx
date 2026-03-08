import { useSyncStatus, SyncState } from '@/hooks/use-sync-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, Check, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stateConfig: Record<SyncState, { label: string; color: string; bg: string; icon: typeof Check }> = {
  synced: { label: 'All synced', color: 'text-success', bg: 'bg-success/10', icon: Check },
  pending: { label: 'Sync pending', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  syncing: { label: 'Syncing...', color: 'text-primary', bg: 'bg-primary/10', icon: Loader2 },
  failed: { label: 'Sync failed', color: 'text-danger', bg: 'bg-danger/10', icon: AlertTriangle },
  offline: { label: 'Offline mode', color: 'text-muted-foreground', bg: 'bg-muted', icon: WifiOff },
};

export function SyncStatusBar() {
  const { isOnline, syncState, lastSync, counts, daysSinceSync, syncNow } = useSyncStatus();
  const config = stateConfig[syncState];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {(syncState !== 'synced' || !isOnline) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className={`${config.bg} border-b px-4 py-2`}>
            <div className="container max-w-lg mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${config.color} ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
                <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                {counts.pending > 0 && (
                  <span className="text-[10px] text-muted-foreground">({counts.pending} pending)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {lastSync > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    Last: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {isOnline && syncState !== 'syncing' && counts.pending > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={syncNow}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync Now
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 7-day warning */}
          {daysSinceSync > 7 && (
            <div className="bg-danger-bg border-b border-danger/30 px-4 py-1.5">
              <div className="container max-w-lg mx-auto flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-danger" />
                <span className="text-[10px] font-semibold text-danger-foreground">
                  Warning: Last sync was {daysSinceSync} days ago. Data may be out of date.
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SyncStatusIndicator() {
  const { isOnline, syncState } = useSyncStatus();
  const config = stateConfig[syncState];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${config.bg} ${config.color}`}>
      {isOnline ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
      <Icon className={`h-2.5 w-2.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
    </div>
  );
}
