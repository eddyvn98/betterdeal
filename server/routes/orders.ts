import express from 'express';
import { getQueue, getOrder, getPublicQueue, getAllOrders, getOrderBySession, updateOrderStatus, updateOrderPriority } from '../orderService';
import { processPaymentWebhook, verifySepaySignature, getAllPayments, getPaymentHistoryByOrder } from '../paymentService';
import { adminAuthMiddleware } from '../middleware/auth';
import { OrderStatus } from '../orderService';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/queue', (req, res) => {
  const queue = getQueue();
  const publicQueue = queue.map((o, idx) => ({
    position: idx + 1,
    projectSummary: o.projectSummary,
    status: o.status,
    paidAmount: o.paidAmount,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt
  }));
  res.json(publicQueue);
});

router.get('/:ticket', (req, res) => {
  const { ticket } = req.params;
  const order = getOrder(ticket);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  const publicQueueData = getPublicQueue(ticket);
  res.json({
    ...order,
    queuePosition: publicQueueData.userPosition,
    publicQueue: publicQueueData.items,
    fomoMessages: publicQueueData.fomoMessages,
    upsellSuggestion: publicQueueData.upsellSuggestion,
    totalInQueue: publicQueueData.totalInQueue
  });
});

// --- ADMIN ROUTES (Protected) ---
router.use('/admin', adminAuthMiddleware); // Note: we'll mount this at /api/orders in main index

router.get('/admin/list', (req, res) => {
  res.json(getAllOrders());
});

router.get('/admin/by-session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const order = getOrderBySession(sessionId);
  if (!order) return res.json({ order: null, payments: [] });

  const payments = getPaymentHistoryByOrder(order.id);
  return res.json({ order, payments });
});

router.patch('/admin/:id', (req, res) => {
  const { id } = req.params;
  const { status, progressStep, manualPriorityScore } = req.body;

  if (status) updateOrderStatus(id, status as OrderStatus, progressStep);
  if (manualPriorityScore !== undefined) updateOrderPriority(id, Number(manualPriorityScore));
  
  res.json({ ok: true });
});

export default router;
