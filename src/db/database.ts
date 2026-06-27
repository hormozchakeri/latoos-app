import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("latoos.db");
  await initSchema(_db);
  return _db;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS packages (
      id          TEXT PRIMARY KEY,
      packageName TEXT NOT NULL,
      description TEXT,
      ownerId     TEXT,
      isOwner     INTEGER DEFAULT 0,
      synced      INTEGER DEFAULT 0,
      createdAt   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vocabs (
      id               TEXT PRIMARY KEY,
      packageId        TEXT NOT NULL,
      vocabulary       TEXT NOT NULL,
      type             TEXT DEFAULT '',
      voice            TEXT DEFAULT '',
      ipaPronunciation TEXT,
      meaning          TEXT,
      example1         TEXT,
      example2         TEXT,
      example3         TEXT,
      synonyms         TEXT,
      antonyms         TEXT,
      wordFamily       TEXT,
      synced           INTEGER DEFAULT 0,
      createdAt        TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS practice_progress (
      id             TEXT PRIMARY KEY,
      userId         TEXT NOT NULL,
      vocabId        TEXT NOT NULL,
      packageId      TEXT NOT NULL,
      lastRating     TEXT,
      reviewCount    INTEGER DEFAULT 0,
      lastReviewedAt TEXT,
      interval_days  INTEGER DEFAULT 0,
      repetitions    INTEGER DEFAULT 0,
      easeFactor     REAL DEFAULT 2.5,
      nextReviewAt   TEXT,
      synced         INTEGER DEFAULT 0,
      UNIQUE(userId, vocabId)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      packageId   TEXT PRIMARY KEY,
      packageName TEXT NOT NULL,
      enrolledAt  TEXT NOT NULL,
      status      TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id          TEXT PRIMARY KEY,
      operation   TEXT NOT NULL,
      payload     TEXT NOT NULL,
      attempts    INTEGER DEFAULT 0,
      createdAt   TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
