import { Router, Request, Response } from 'express';
import pool from '../db.js';

export const authRouter = Router();

authRouter.post('/auth', async (req: Request, res: Response) => {
  const { nickname } = req.body;

  if (!nickname || typeof nickname !== 'string') {
    res.status(400).json({ error: '请输入昵称' });
    return;
  }

  const trimmed = nickname.trim().toLowerCase();

  if (trimmed.length < 2 || trimmed.length > 20) {
    res.status(400).json({ error: '昵称长度需在 2-20 个字符之间' });
    return;
  }

  if (!/^[a-z0-9_一-鿿]+$/.test(trimmed)) {
    res.status(400).json({ error: '昵称只能包含中英文、数字和下划线' });
    return;
  }

  const { rows } = await pool.query(
    'SELECT nickname, created_at FROM users WHERE nickname = $1',
    [trimmed]
  );

  if (rows.length > 0) {
    res.json({ nickname: rows[0].nickname, created_at: rows[0].created_at, isNew: false });
    return;
  }

  const now = new Date().toISOString();
  await pool.query('INSERT INTO users (nickname, created_at) VALUES ($1, $2)', [trimmed, now]);

  res.status(201).json({ nickname: trimmed, created_at: now, isNew: true });
});
