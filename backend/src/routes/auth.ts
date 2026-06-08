import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';

export const authRouter = Router();

// POST /api/auth — 注册或登录
authRouter.post('/auth', (req: Request, res: Response) => {
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

  const db = getDb();

  const existing = db.prepare('SELECT nickname, created_at FROM users WHERE nickname = ?').get(trimmed) as any;

  if (existing) {
    // 已存在 → 直接登录
    res.json({ nickname: existing.nickname, created_at: existing.created_at, isNew: false });
    return;
  }

  // 新用户 → 注册
  const now = new Date().toISOString();
  db.prepare('INSERT INTO users (nickname, created_at) VALUES (?, ?)').run(trimmed, now);

  res.status(201).json({ nickname: trimmed, created_at: now, isNew: true });
});
