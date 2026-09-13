import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface OfflineEntry {
  id: string; // UUIDv7
  idempotencyKey: string;
  rabItemId: string;
  entryDate: string;
  qty: number;
  actualUnitPrice: number;
  vendor: string;
  invoiceNumber?: string;
  description?: string;
  createdAt: number;
  synced: boolean;
}

interface KarsaOfflineDB extends DBSchema {
  sync_queue: {
    key: string;
    value: OfflineEntry;
    indexes: { 'by-synced': number };
  };
}

let dbPromise: Promise<IDBPDatabase<KarsaOfflineDB>> | null = null;

export function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<KarsaOfflineDB>('karsa_offline_db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
        store.createIndex('by-synced', 'synced');
      },
    });
  }
  return dbPromise;
}

/**
 * Menghasilkan UUIDv7 sederhana berbasis timestamp untuk ID entri offline yang terurut waktu.
 */
export function generateUUIDv7(): string {
  const timestamp = Date.now();
  const hexTimestamp = timestamp.toString(16).padStart(12, '0');
  const randomChars = Array.from({ length: 20 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  return `${hexTimestamp.slice(0, 8)}-${hexTimestamp.slice(8, 12)}-7${randomChars.slice(0, 3)}-8${randomChars.slice(3, 6)}-${randomChars.slice(6, 18)}`;
}

export async function queueOfflineActualEntry(data: Omit<OfflineEntry, 'id' | 'createdAt' | 'synced' | 'idempotencyKey'>): Promise<OfflineEntry> {
  const db = await getDB();
  const id = generateUUIDv7();
  const entry: OfflineEntry = {
    ...data,
    id,
    idempotencyKey: id,
    createdAt: Date.now(),
    synced: false,
  };

  if (db) {
    await db.put('sync_queue', entry);
  }
  return entry;
}

export async function getPendingOfflineEntries(): Promise<OfflineEntry[]> {
  const db = await getDB();
  if (!db) return [];
  const entries = await db.getAll('sync_queue');
  return entries.filter((e) => !e.synced);
}

export async function markOfflineEntrySynced(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const entry = await db.get('sync_queue', id);
  if (entry) {
    entry.synced = true;
    await db.put('sync_queue', entry);
  }
}
