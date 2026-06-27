import { getDb } from "./database";

export interface LocalPackage {
  id: string;
  packageName: string;
  description?: string;
  ownerId?: string;
  isOwner: boolean;
  synced: boolean;
}

export async function upsertPackage(pkg: LocalPackage): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO packages (id, packageName, description, ownerId, isOwner, synced)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       packageName = excluded.packageName,
       description = excluded.description,
       ownerId     = excluded.ownerId,
       isOwner     = excluded.isOwner,
       synced      = excluded.synced`,
    [pkg.id, pkg.packageName, pkg.description ?? null, pkg.ownerId ?? null, pkg.isOwner ? 1 : 0, pkg.synced ? 1 : 0]
  );
}

export async function getMyPackages(userId: string): Promise<LocalPackage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM packages WHERE ownerId = ? OR isOwner = 1 ORDER BY createdAt DESC`,
    [userId]
  );
  return rows.map(toLocalPackage);
}

export async function getUnsyncedOwnedPackages(): Promise<LocalPackage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM packages WHERE isOwner = 1 AND synced = 0 ORDER BY createdAt DESC`
  );
  return rows.map(toLocalPackage);
}

export async function getAllCachedPackages(): Promise<LocalPackage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM packages ORDER BY createdAt DESC`);
  return rows.map(toLocalPackage);
}

export async function updatePackage(id: string, packageName: string, description?: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE packages SET packageName = ?, description = ?, synced = 0 WHERE id = ?`,
    [packageName, description ?? null, id]
  );
}

export async function deletePackage(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM packages WHERE id = ?`, [id]);
}

export async function markPackageSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE packages SET synced = 1 WHERE id = ?`, [id]);
}

function toLocalPackage(row: any): LocalPackage {
  return {
    id:          row.id,
    packageName: row.packageName,
    description: row.description ?? undefined,
    ownerId:     row.ownerId ?? undefined,
    isOwner:     row.isOwner === 1,
    synced:      row.synced === 1,
  };
}
