import { Router, Request, Response } from 'express';
import pool from '../db.js';
import type { PersistedData } from '../types.js';

export const dataRouter = Router();

dataRouter.get('/data', async (req: Request, res: Response) => {
  const nickname = req.query.nickname as string;

  if (!nickname) {
    res.status(400).json({ error: '缺少 nickname 参数' });
    return;
  }

  const normalized = nickname.toLowerCase();

  const userResult = await pool.query('SELECT nickname FROM users WHERE nickname = $1', [normalized]);
  if (userResult.rows.length === 0) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  const dayResult = await pool.query(
    'SELECT date, entries_json, updated_at FROM day_records WHERE nickname = $1',
    [normalized]
  );

  const completionResult = await pool.query(
    'SELECT source_date, completions_json FROM review_completions WHERE nickname = $1',
    [normalized]
  );

  const dayRecords: PersistedData['dayRecords'] = {};
  for (const row of dayResult.rows) {
    dayRecords[row.date] = {
      date: row.date,
      entries: JSON.parse(row.entries_json),
      updatedAt: row.updated_at,
    };
  }

  const completions: PersistedData['completions'] = {};
  for (const row of completionResult.rows) {
    completions[row.source_date] = JSON.parse(row.completions_json);
  }

  res.json({ dayRecords, completions });
});

dataRouter.put('/data', async (req: Request, res: Response) => {
  const { nickname, dayRecords, completions } = req.body;

  if (!nickname || typeof nickname !== 'string') {
    res.status(400).json({ error: '缺少 nickname' });
    return;
  }

  const normalized = nickname.toLowerCase();

  const userResult = await pool.query('SELECT nickname FROM users WHERE nickname = $1', [normalized]);
  if (userResult.rows.length === 0) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  const now = new Date().toISOString();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (dayRecords) {
      for (const [date, record] of Object.entries(dayRecords)) {
        await client.query(
          `INSERT INTO day_records (nickname, date, entries_json, updated_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT(nickname, date) DO UPDATE SET
             entries_json = EXCLUDED.entries_json,
             updated_at = EXCLUDED.updated_at`,
          [normalized, date, JSON.stringify((record as any).entries ?? []), (record as any).updatedAt ?? now]
        );
      }
    }

    if (completions) {
      for (const [sourceDate, comps] of Object.entries(completions)) {
        await client.query(
          `INSERT INTO review_completions (nickname, source_date, completions_json)
           VALUES ($1, $2, $3)
           ON CONFLICT(nickname, source_date) DO UPDATE SET
             completions_json = EXCLUDED.completions_json`,
          [normalized, sourceDate, JSON.stringify(comps)]
        );
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  res.json({ ok: true });
});
