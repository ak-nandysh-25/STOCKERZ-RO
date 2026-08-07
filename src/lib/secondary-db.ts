import { writeToMongoCollection } from "./mongodb";

export interface AuditLogEntry {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

/**
 * Log system events and user actions to the secondary MongoDB database.
 */
export async function logToSecondaryDb(entry: AuditLogEntry): Promise<boolean> {
  const payload = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  return await writeToMongoCollection("audit_logs", payload);
}

/**
 * Backup or mirror database records (e.g. sales, services) to the secondary MongoDB database.
 */
export async function syncRecordToSecondaryDb(
  entityName: string,
  record: Record<string, any>
): Promise<boolean> {
  const collectionName = `${entityName.toLowerCase()}_secondary`;
  return await writeToMongoCollection(collectionName, {
    ...record,
    syncedAt: new Date().toISOString(),
  });
}
