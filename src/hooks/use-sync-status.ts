import { useState, useEffect, useCallback } from 'react';
import { getSyncQueueCounts, getLastSyncTime, setLastSyncTime, getSyncQueueItems, updateSyncQueueItem } from '@/lib/indexed-db';

export type SyncState = 'synced' | 'pending' | 'syncing' | 'failed' | 'offline';

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSync, setLastSync] = useState<number>(0);
  const [counts, setCounts] = useState({ pending: 0, syncing: 0, failed: 0, synced: 0 });

  const refresh = useCallback(async () => {
    try {
      const c = await getSyncQueueCounts();
      setCounts(c);
      const ls = await getLastSyncTime();
      setLastSync(ls);

      if (!navigator.onLine) setSyncState('offline');
      else if (c.syncing > 0) setSyncState('syncing');
      else if (c.failed > 0) setSyncState('failed');
      else if (c.pending > 0) setSyncState('pending');
      else setSyncState('synced');
    } catch {
      // IndexedDB not ready yet
    }
  }, []);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); refresh(); };
    const onOffline = () => { setIsOnline(false); setSyncState('offline'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(interval);
    };
  }, [refresh]);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncState('syncing');
    try {
      const items = await getSyncQueueItems();
      for (const item of items) {
        await updateSyncQueueItem(item.id, { status: 'syncing' });
        // In a real implementation, this would push to Supabase
        // For now, mark as synced after a brief delay
        await new Promise(r => setTimeout(r, 300));
        await updateSyncQueueItem(item.id, { status: 'synced', syncedAt: Date.now() });
      }
      await setLastSyncTime(Date.now());
      await refresh();
    } catch {
      setSyncState('failed');
    }
  }, [refresh]);

  const daysSinceSync = lastSync > 0
    ? Math.floor((Date.now() - lastSync) / (1000 * 60 * 60 * 24))
    : -1;

  return { isOnline, syncState, lastSync, counts, daysSinceSync, syncNow, refresh };
}
