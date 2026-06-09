import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      nickname TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS day_records (
      id SERIAL PRIMARY KEY,
      nickname TEXT NOT NULL REFERENCES users(nickname),
      date TEXT NOT NULL,
      entries_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL,
      UNIQUE(nickname, date)
    );

    CREATE TABLE IF NOT EXISTS review_completions (
      id SERIAL PRIMARY KEY,
      nickname TEXT NOT NULL REFERENCES users(nickname),
      source_date TEXT NOT NULL,
      completions_json TEXT NOT NULL DEFAULT '[]',
      UNIQUE(nickname, source_date)
    );
  `);
}

export default pool;
