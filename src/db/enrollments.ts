import { getDb } from "./database";

export interface LocalEnrollment {
  packageId: string;
  packageName: string;
  enrolledAt: string;
  status: string;
}

export async function upsertEnrollment(e: LocalEnrollment): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO enrollments (packageId, packageName, enrolledAt, status)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(packageId) DO UPDATE SET
       packageName = excluded.packageName,
       status      = excluded.status`,
    [e.packageId, e.packageName, e.enrolledAt, e.status]
  );
}

export async function getEnrollments(): Promise<LocalEnrollment[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LocalEnrollment>(`SELECT * FROM enrollments`);
  return rows;
}

export async function isEnrolledLocally(packageId: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ packageId: string }>(
    `SELECT packageId FROM enrollments WHERE packageId = ?`,
    [packageId]
  );
  return !!row;
}
