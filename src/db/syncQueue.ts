import { getDb } from "./database";
import { v4 as uuidv4 } from "uuid";

function generateId(): string {
  try {
    return uuidv4();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export type SyncOperation =
  | "CREATE_PACKAGE"
  | "CREATE_VOCAB"
  | "RATE_CARD"
  | "ENROLL_PACKAGE"
  | "UPDATE_VOCAB"
  | "DELETE_VOCAB"
  | "UPDATE_PACKAGE"
  | "DELETE_PACKAGE";

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  attempts: number;
  createdAt: string;
}

export async function enqueue(
  operation: SyncOperation,
  payload: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO sync_queue (id, operation, payload) VALUES (?, ?, ?)`,
    [generateId(), operation, JSON.stringify(payload)]
  );
}

export async function getPendingItems(): Promise<SyncQueueItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM sync_queue WHERE attempts < 5 ORDER BY createdAt ASC`
  );
  return rows.map((r) => ({
    id:        r.id,
    operation: r.operation as SyncOperation,
    payload:   JSON.parse(r.payload),
    attempts:  r.attempts,
    createdAt: r.createdAt,
  }));
}

export async function removeItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
}

export async function incrementAttempts(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`, [id]);
}

export async function getPendingCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sync_queue WHERE attempts < 5`
  );
  return row?.count ?? 0;
}
