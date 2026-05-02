import express from 'express';
import { processPaymentWebhook, verifySepaySignature, getAllPayments } from '../paymentService';
import { adminAuthMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/webhook/sepay', async (req, res) => {
  const signature = req.header('x-sepay-signature') || req.header('x-signature') || null;
  const secret = process.env.SEPAY_WEBHOOK_SECRET || '';
  
  if (secret && !verifySepaySignature(JSON.stringify(req.body), secret, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const result = await processPaymentWebhook(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Webhook failed' });
  }
});

// Admin payment routes
router.get('/admin/list', adminAuthMiddleware, (req, res) => {
  res.json(getAllPayments());
});

export default router;
