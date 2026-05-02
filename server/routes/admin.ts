import express from 'express';
import { getAllLeads, ensureSession, getLead, getMessages } from '../leadStore';
import { leadToMarkdown } from '../utils/formatter';
import { adminAuthMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(adminAuthMiddleware);

router.get('/verify', (req, res) => {
  res.json({ ok: true });
});

router.get('/leads', (req, res) => {
  // If master token, getAllLeads returns all. 
  // The middleware already verified the token against the requested sessionId if any.
  // Actually, for global leads view, we need master token.
  res.json(getAllLeads());
});

router.get('/leads/:id', (req, res) => {
  const { id } = req.params;
  if (!ensureSession(id)) return res.status(404).json({ error: 'Lead not found' });

  const lead = getLead(id);
  const messages = getMessages(id);
  const markdown = leadToMarkdown(lead, id);

  return res.json({ lead, messages, markdown });
});

export default router;
