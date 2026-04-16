import { db } from './db';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const transactionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  transaction_id: z.union([z.string(), z.number()]).optional(),
  amount: z.coerce.number().optional(),
  transferAmount: z.coerce.number().optional(),
  content: z.string().optional(),
  transferContent: z.string().optional(),
  description: z.string().optional(),
  referenceCode: z.string().optional(),
  accountName: z.string().optional(),
});

export interface NormalizedPayment {
  transactionId: string;
  amount: number;
  transferContent: string;
  bankRef: string | null;
  payerName: string | null;
  raw: any;
}

export const verifySepaySignature = (rawBody: string, secret: string, signature: string | null): boolean => {
  if (!secret) return true;
  if (!signature) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
};

export const normalizeSepayPayload = (payload: any): NormalizedPayment => {
  const envelope = payload.data ?? payload;
  const normalized = transactionSchema.parse(envelope);

  const transactionId = String(normalized.id ?? normalized.transaction_id ?? payload.id);
  const amount = normalized.amount ?? normalized.transferAmount ?? 0;
  const transferContent = normalized.content ?? normalized.transferContent ?? normalized.description ?? '';

  return {
    transactionId,
    amount,
    transferContent,
    bankRef: normalized.referenceCode || null,
    payerName: normalized.accountName || null,
    raw: payload
  };
};

/**
 * Khớp thanh toán với đơn hàng dựa trên nội dung chuyển khoản (chứa mã Ticket)
 */
export const processPaymentWebhook = async (payload: any) => {
  const normalized = normalizeSepayPayload(payload);
  
  // Tìm mã Ticket ID trong nội dung chuyển khoản
  // Ví dụ: "PX202604171234AB chuyen tien" -> Ticket là PX202604171234AB
  const ticketRegex = /PX\d{12}[A-Z0-9]{6}/i; 
  const match = normalized.transferContent.match(ticketRegex);
  const ticketId = match ? match[0].toUpperCase() : null;

  if (!ticketId) {
    console.warn('[Payment] Không tìm thấy Ticket ID trong nội dung:', normalized.transferContent);
    savePayment(normalized, null, 'pending_review');
    return { status: 'no_ticket_matched' };
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(ticketId) as any;
  if (!order) {
    console.warn('[Payment] Ticket ID không tồn tại:', ticketId);
    savePayment(normalized, ticketId, 'pending_review');
    return { status: 'ticket_not_found' };
  }

  // Lưu thanh toán và cập nhật số tiền đã trả cho Order
  savePayment(normalized, ticketId, 'matched');
  
  const newPaidAmount = order.paid_amount + normalized.amount;
  db.prepare('UPDATE orders SET paid_amount = ?, updated_at = ? WHERE id = ?')
    .run(newPaidAmount, new Date().toISOString(), ticketId);

  // Nếu đã cọc đủ hoặc cọc lần đầu, có thể tự động chuyển trạng thái đơn hàng
  if (order.status === 'pending' && newPaidAmount > 0) {
    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
      .run('confirmed', new Date().toISOString(), ticketId);
  }

  return { status: 'success', ticketId, amount: normalized.amount };
};

const savePayment = (p: NormalizedPayment, orderId: string | null, status: string) => {
  db.prepare(`
    INSERT INTO payments (order_id, amount, provider_transaction_id, status, bank_ref, payer_name, created_at, raw_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId || 'UNKNOWN',
    p.amount,
    p.transactionId,
    status,
    p.bankRef,
    p.payerName,
    new Date().toISOString(),
    JSON.stringify(p.raw)
  );
};

export const getPaymentHistoryByOrder = (orderId: string) => {
  return db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC').all(orderId);
};

export const getAllPayments = () => {
  return db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
};
