import { getDb } from "./database";
import { v4 as uuidv4 } from "uuid";

export interface LocalProgress {
  id: string;
  userId: string;
  vocabId: string;
  packageId: string;
  lastRating?: string;
  reviewCount: number;
  lastReviewedAt?: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  nextReviewAt?: string;
  synced: boolean;
}

export async function upsertProgress(p: Omit<LocalProgress, "id"> & { id?: string }): Promise<void> {
  const db = await getDb();
  const id = p.id ?? uuidv4();
  await db.runAsync(
    `INSERT INTO practice_progress
       (id, userId, vocabId, packageId, lastRating, reviewCount, lastReviewedAt,
        interval_days, repetitions, easeFactor, nextReviewAt, synced)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(userId, vocabId) DO UPDATE SET
       lastRating     = excluded.lastRating,
       reviewCount    = excluded.reviewCount,
       lastReviewedAt = excluded.lastReviewedAt,
       interval_days  = excluded.interval_days,
       repetitions    = excluded.repetitions,
       easeFactor     = excluded.easeFactor,
       nextReviewAt   = excluded.nextReviewAt,
       synced         = excluded.synced`,
    [
      id, p.userId, p.vocabId, p.packageId,
      p.lastRating ?? null, p.reviewCount,
      p.lastReviewedAt ?? null, p.intervalDays, p.repetitions, p.easeFactor,
      p.nextReviewAt ?? null, p.synced ? 1 : 0,
    ]
  );
}

export async function getDueCards(
  userId: string,
  packageId: string,
  limit = 20
): Promise<LocalProgress[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const rows = await db.getAllAsync<any>(
    `SELECT pp.* FROM practice_progress pp
     WHERE pp.userId = ?
       AND pp.packageId = ?
       AND (pp.nextReviewAt IS NULL OR pp.nextReviewAt <= ?)
     ORDER BY pp.nextReviewAt ASC NULLS FIRST
     LIMIT ?`,
    [userId, packageId, now, limit]
  );
  return rows.map(toLocalProgress);
}

export async function markProgressSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE practice_progress SET synced = 1 WHERE id = ?`, [id]);
}

function toLocalProgress(row: any): LocalProgress {
  return {
    id:            row.id,
    userId:        row.userId,
    vocabId:       row.vocabId,
    packageId:     row.packageId,
    lastRating:    row.lastRating ?? undefined,
    reviewCount:   row.reviewCount,
    lastReviewedAt: row.lastReviewedAt ?? undefined,
    intervalDays:  row.interval_days,
    repetitions:   row.repetitions,
    easeFactor:    row.easeFactor,
    nextReviewAt:  row.nextReviewAt ?? undefined,
    synced:        row.synced === 1,
  };
}
