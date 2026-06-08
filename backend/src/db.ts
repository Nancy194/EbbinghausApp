import Database from 'better-sqlite3';
import path from 'path';

const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? import.meta.dirname;
const DB_PATH = path.join(DATA_DIR, 'data.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      nickname TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS day_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL REFERENCES users(nickname),
      date TEXT NOT NULL,
      entries_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL,
      UNIQUE(nickname, date)
    );

    CREATE TABLE IF NOT EXISTS review_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL REFERENCES users(nickname),
      source_date TEXT NOT NULL,
      completions_json TEXT NOT NULL DEFAULT '[]',
      UNIQUE(nickname, source_date)
    );
  `);
}
