import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import type { PersistedData } from '../types.js';

export const dataRouter = Router();

// GET /api/data?nickname=xxx — 获取用户全部数据
dataRouter.get('/data', (req: Request, res: Response) => {
  const nickname = req.query.nickname as string;

  if (!nickname) {
    res.status(400).json({ error: '缺少 nickname 参数' });
    return;
  }

  const db = getDb();

  const user = db.prepare('SELECT nickname FROM users WHERE nickname = ?').get(nickname.toLowerCase());
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  const dayRows = db.prepare(
    'SELECT date, entries_json, updated_at FROM day_records WHERE nickname = ?'
  ).all(nickname.toLowerCase()) as any[];

  const completionRows = db.prepare(
    'SELECT source_date, completions_json FROM review_completions WHERE nickname = ?'
  ).all(nickname.toLowerCase()) as any[];

  const dayRecords: PersistedData['dayRecords'] = {};
  for (const row of dayRows) {
    dayRecords[row.date] = {
      date: row.date,
      entries: JSON.parse(row.entries_json),
      updatedAt: row.updated_at,
    };
  }

  const completions: PersistedData['completions'] = {};
  for (const row of completionRows) {
    completions[row.source_date] = JSON.parse(row.completions_json);
  }

  res.json({ dayRecords, completions });
});

// PUT /api/data — 全量同步数据
dataRouter.put('/data', (req: Request, res: Response) => {
  const { nickname, dayRecords, completions } = req.body;

  if (!nickname || typeof nickname !== 'string') {
    res.status(400).json({ error: '缺少 nickname' });
    return;
  }

  const db = getDb();
  const normalized = nickname.toLowerCase();

  const user = db.prepare('SELECT nickname FROM users WHERE nickname = ?').get(normalized);
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  const now = new Date().toISOString();

  const upsertDayRecord = db.prepare(`
    INSERT INTO day_records (nickname, date, entries_json, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(nickname, date) DO UPDATE SET
      entries_json = excluded.entries_json,
      updated_at = excluded.updated_at
  `);

  const upsertCompletion = db.prepare(`
    INSERT INTO review_completions (nickname, source_date, completions_json)
    VALUES (?, ?, ?)
    ON CONFLICT(nickname, source_date) DO UPDATE SET
      completions_json = excluded.completions_json
  `);

  const transaction = db.transaction(() => {
    if (dayRecords) {
      for (const [date, record] of Object.entries(dayRecords)) {
        upsertDayRecord.run(
          normalized,
          date,
          JSON.stringify((record as any).entries ?? []),
          (record as any).updatedAt ?? now
        );
      }
    }

    if (completions) {
      for (const [sourceDate, comps] of Object.entries(completions)) {
        upsertCompletion.run(normalized, sourceDate, JSON.stringify(comps));
      }
    }
  });

  transaction();
  res.json({ ok: true });
});
