import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { dataRouter } from './routes/data.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

// 健康检查需要在路由注册前，避免 body 解析影响
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use('/api', dataRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
