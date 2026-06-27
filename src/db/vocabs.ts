import { getDb } from "./database";

export interface LocalVocab {
  id: string;
  packageId: string;
  vocabulary: string;
  type: string;
  voice: string;
  ipaPronunciation?: string;
  meaning?: string;
  example1?: string;
  example2?: string;
  example3?: string;
  synonyms?: string;
  antonyms?: string;
  wordFamily?: string;
  synced: boolean;
}

export async function upsertVocab(vocab: LocalVocab): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO vocabs
       (id, packageId, vocabulary, type, voice, ipaPronunciation, meaning,
        example1, example2, example3, synonyms, antonyms, wordFamily, synced)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       vocabulary       = excluded.vocabulary,
       ipaPronunciation = excluded.ipaPronunciation,
       meaning          = excluded.meaning,
       example1         = excluded.example1,
       example2         = excluded.example2,
       example3         = excluded.example3,
       synonyms         = excluded.synonyms,
       antonyms         = excluded.antonyms,
       wordFamily       = excluded.wordFamily,
       synced           = excluded.synced`,
    [
      vocab.id, vocab.packageId, vocab.vocabulary, vocab.type, vocab.voice,
      vocab.ipaPronunciation ?? null, vocab.meaning ?? null,
      vocab.example1 ?? null, vocab.example2 ?? null, vocab.example3 ?? null,
      vocab.synonyms ?? null, vocab.antonyms ?? null, vocab.wordFamily ?? null,
      vocab.synced ? 1 : 0,
    ]
  );
}

export async function getVocabsByPackage(packageId: string): Promise<LocalVocab[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM vocabs WHERE packageId = ? ORDER BY createdAt ASC`,
    [packageId]
  );
  return rows.map(toLocalVocab);
}

export async function deleteVocab(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM vocabs WHERE id = ?`, [id]);
}

export async function markVocabSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE vocabs SET synced = 1 WHERE id = ?`, [id]);
}

function toLocalVocab(row: any): LocalVocab {
  return {
    id:              row.id,
    packageId:       row.packageId,
    vocabulary:      row.vocabulary,
    type:            row.type ?? "",
    voice:           row.voice ?? "",
    ipaPronunciation: row.ipaPronunciation ?? undefined,
    meaning:         row.meaning ?? undefined,
    example1:        row.example1 ?? undefined,
    example2:        row.example2 ?? undefined,
    example3:        row.example3 ?? undefined,
    synonyms:        row.synonyms ?? undefined,
    antonyms:        row.antonyms ?? undefined,
    wordFamily:      row.wordFamily ?? undefined,
    synced:          row.synced === 1,
  };
}
