import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MatriCareDB extends DBSchema {
  patients: {
    key: string;
    value: {
      id: string;
      data: any;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-synced': boolean };
  };
  visits: {
    key: string;
    value: {
      id: string;
      patientId: string;
      data: any;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-patient': string; 'by-synced': boolean };
  };
  referrals: {
    key: string;
    value: {
      id: string;
      patientId: string;
      data: any;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-patient': string; 'by-synced': boolean };
  };
  postpartumVisits: {
    key: string;
    value: {
      id: string;
      patientId: string;
      data: any;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-patient': string };
  };
  images: {
    key: string;
    value: {
      id: string;
      patientId: string;
      category: string;
      visitId?: string;
      blob: Blob;
      thumbnail: Blob;
      metadata: any;
      annotations: any[];
      consentGiven: boolean;
      consentTimestamp?: number;
      faceBlurred: boolean;
      notes: string;
      createdAt: number;
      synced: boolean;
      syncStatus: 'pending' | 'synced' | 'failed';
    };
    indexes: { 'by-patient': string; 'by-category': string; 'by-synced': boolean };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      entityType: string;
      entityId: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      priority: 'high' | 'medium' | 'low';
      status: 'pending' | 'syncing' | 'synced' | 'failed';
      retryCount: number;
      errorMessage?: string;
      createdAt: number;
      syncedAt?: number;
    };
    indexes: { 'by-status': string; 'by-priority': string };
  };
  alerts: {
    key: string;
    value: {
      id: string;
      data: any;
      updatedAt: number;
    };
  };
  meta: {
    key: string;
    value: {
      key: string;
      value: any;
    };
  };
}

let dbInstance: IDBPDatabase<MatriCareDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<MatriCareDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<MatriCareDB>('matricare-db', 1, {
    upgrade(db) {
      // Patients
      const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
      patientStore.createIndex('by-synced', 'synced');

      // Visits
      const visitStore = db.createObjectStore('visits', { keyPath: 'id' });
      visitStore.createIndex('by-patient', 'patientId');
      visitStore.createIndex('by-synced', 'synced');

      // Referrals
      const refStore = db.createObjectStore('referrals', { keyPath: 'id' });
      refStore.createIndex('by-patient', 'patientId');
      refStore.createIndex('by-synced', 'synced');

      // Postpartum Visits
      const ppStore = db.createObjectStore('postpartumVisits', { keyPath: 'id' });
      ppStore.createIndex('by-patient', 'patientId');

      // Images
      const imgStore = db.createObjectStore('images', { keyPath: 'id' });
      imgStore.createIndex('by-patient', 'patientId');
      imgStore.createIndex('by-category', 'category');
      imgStore.createIndex('by-synced', 'synced');

      // Sync queue
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('by-status', 'status');
      syncStore.createIndex('by-priority', 'priority');

      // Alerts
      db.createObjectStore('alerts', { keyPath: 'id' });

      // Meta (for storing last sync time, etc.)
      db.createObjectStore('meta', { keyPath: 'key' });
    },
  });

  return dbInstance;
}

// Migration: import localStorage data into IndexedDB on first run
export async function migrateFromLocalStorage(): Promise<void> {
  const db = await getDB();
  const migrated = await db.get('meta', 'migrated');
  if (migrated?.value) return;

  // Migrate patients
  const patientsRaw = localStorage.getItem('matricare_patients');
  if (patientsRaw) {
    const patients = JSON.parse(patientsRaw);
    const tx = db.transaction('patients', 'readwrite');
    for (const p of patients) {
      await tx.store.put({ id: p.id, data: p, updatedAt: Date.now(), synced: false });
    }
    await tx.done;
  }

  // Migrate referrals
  const refRaw = localStorage.getItem('matricare_referrals');
  if (refRaw) {
    const refs = JSON.parse(refRaw);
    const tx = db.transaction('referrals', 'readwrite');
    for (const r of refs) {
      await tx.store.put({ id: r.id, patientId: r.patientId, data: r, updatedAt: Date.now(), synced: false });
    }
    await tx.done;
  }

  // Migrate alerts
  const alertsRaw = localStorage.getItem('matricare_alerts');
  if (alertsRaw) {
    const alerts = JSON.parse(alertsRaw);
    const tx = db.transaction('alerts', 'readwrite');
    for (const a of alerts) {
      await tx.store.put({ id: a.id, data: a, updatedAt: Date.now() });
    }
    await tx.done;
  }

  // Migrate postpartum
  const ppRaw = localStorage.getItem('matricare_postpartum');
  if (ppRaw) {
    const pps = JSON.parse(ppRaw);
    const tx = db.transaction('postpartumVisits', 'readwrite');
    for (const pp of pps) {
      await tx.store.put({ id: pp.id, patientId: pp.patientId, data: pp, updatedAt: Date.now(), synced: false });
    }
    await tx.done;
  }

  await db.put('meta', { key: 'migrated', value: true });
  await db.put('meta', { key: 'lastSyncTime', value: 0 });
}

// Sync queue operations
export async function addToSyncQueue(
  entityType: string,
  entityId: string,
  action: 'create' | 'update' | 'delete',
  data: any,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void> {
  const db = await getDB();
  await db.put('syncQueue', {
    id: `sq-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    entityType,
    entityId,
    action,
    data,
    priority,
    status: 'pending',
    retryCount: 0,
    createdAt: Date.now(),
  });
}

export async function getSyncQueueItems(): Promise<MatriCareDB['syncQueue']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'by-status', 'pending');
}

export async function getSyncQueueCounts(): Promise<{ pending: number; syncing: number; failed: number; synced: number }> {
  const db = await getDB();
  const all = await db.getAll('syncQueue');
  return {
    pending: all.filter(i => i.status === 'pending').length,
    syncing: all.filter(i => i.status === 'syncing').length,
    failed: all.filter(i => i.status === 'failed').length,
    synced: all.filter(i => i.status === 'synced').length,
  };
}

export async function updateSyncQueueItem(id: string, updates: Partial<MatriCareDB['syncQueue']['value']>): Promise<void> {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    await db.put('syncQueue', { ...item, ...updates });
  }
}

export async function getLastSyncTime(): Promise<number> {
  const db = await getDB();
  const meta = await db.get('meta', 'lastSyncTime');
  return meta?.value || 0;
}

export async function setLastSyncTime(time: number): Promise<void> {
  const db = await getDB();
  await db.put('meta', { key: 'lastSyncTime', value: time });
}

// Image operations
export async function saveImageToIDB(image: MatriCareDB['images']['value']): Promise<void> {
  const db = await getDB();
  await db.put('images', image);
}

export async function getPatientImages(patientId: string): Promise<MatriCareDB['images']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('images', 'by-patient', patientId);
}

export async function getImageById(id: string): Promise<MatriCareDB['images']['value'] | undefined> {
  const db = await getDB();
  return db.get('images', id);
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('images', id);
}
