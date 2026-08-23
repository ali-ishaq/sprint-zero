import { Router } from 'express';
import { getRunsByUser, getRun } from '../lib/firestore.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const runs = await getRunsByUser(req.user.email);
  res.json(runs);
});

router.get('/:runId', requireAuth, async (req, res) => {
  const run = await getRun(req.params.runId);
  if (!run || run.userId !== req.user.email) {
    return res.status(404).json({ error: 'Run not found' });
  }
  res.json(run);
});

export default router;