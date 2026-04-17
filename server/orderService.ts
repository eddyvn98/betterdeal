import { db } from './db';
import crypto from 'node:crypto';

export interface Order {
  id: string; // Ticket ID
  sessionId: string;
  projectSummary: string;
  totalAmount: number;
  paidAmount: number;
  status: OrderStatus;
  progressStep: number;
  manualPriorityScore: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'     // Chờ xử lý
  | 'confirmed'   // Đã xác nhận
  | 'in_queue'    // Đang xếp hàng
  | 'processing'  // Đang thực hiện
  | 'designing'   // Đang thiết kế
  | 'developing'  // Đang lập trình
  | 'testing'     // Đang kiểm thử
  | 'revision'    // Đang chỉnh sửa
  | 'completed'   // Hoàn thành
  | 'cancelled';  // Đã hủy

export const generateTicketId = (prefix: string = 'PX'): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${dateStr}${timeStr}${random}`;
};

export const createOrder = (sessionId: string, projectSummary: string, totalAmount: number): Order => {
  const id = generateTicketId();
  const now = new Date().toISOString();

  const order: Order = {
    id,
    sessionId,
    projectSummary,
    totalAmount,
    paidAmount: 0,
    status: 'pending',
    progressStep: 0,
    manualPriorityScore: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO orders (id, session_id, project_summary, total_amount, paid_amount, status, progress_step, manual_priority_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.id,
    order.sessionId,
    order.projectSummary,
    order.totalAmount,
    order.paidAmount,
    order.status,
    order.progressStep,
    order.manualPriorityScore,
    order.createdAt,
    order.updatedAt
  );

  return order;
};

export const getOrder = (id: string): (Order & { queuePosition: number }) | null => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!row) return null;

  const order = {
    id: row.id,
    sessionId: row.session_id,
    projectSummary: row.project_summary,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    status: row.status as OrderStatus,
    progressStep: row.progress_step,
    manualPriorityScore: row.manual_priority_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  // Calculate queue position
  // Position is based on priority: deposit > manual score > date
  const queue = getQueue();
  const position = queue.findIndex(o => o.id === order.id) + 1;

  return { ...order, queuePosition: position };
};

export const getOrderBySession = (sessionId: string): Order | null => {
  const row = db.prepare('SELECT * FROM orders WHERE session_id = ?').get(sessionId) as any;
  if (!row) return null;

  return {
    id: row.id,
    sessionId: row.session_id,
    projectSummary: row.project_summary,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    status: row.status as OrderStatus,
    progressStep: row.progress_step,
    manualPriorityScore: row.manual_priority_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Logic xếp hàng:
 * - Đơn đã cọc (paidAmount > 0) ưu tiên hơn đơn chưa cọc.
 * - Giữa các đơn đã cọc: Số tiền cọc cao nhất ưu tiên hơn.
 * - Kết hợp thêm manualPriorityScore từ Admin.
 * - Nếu bằng nhau: Đơn cũ hơn (createdAt sớm hơn) ưu tiên hơn.
 */
export const getQueue = (): Order[] => {
  const rows = db.prepare(`
    SELECT * FROM orders 
    WHERE status NOT IN ('completed', 'cancelled')
    ORDER BY 
      (paid_amount > 0) DESC, 
      paid_amount DESC, 
      manual_priority_score DESC, 
      created_at ASC
  `).all() as any[];

  return rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    projectSummary: row.project_summary,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    status: row.status as OrderStatus,
    progressStep: row.progress_step,
    manualPriorityScore: row.manual_priority_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const updateOrderStatus = (id: string, status: OrderStatus, progressStep?: number) => {
  const now = new Date().toISOString();
  if (progressStep !== undefined) {
    db.prepare('UPDATE orders SET status = ?, progress_step = ?, updated_at = ? WHERE id = ?')
      .run(status, progressStep, now, id);
  } else {
    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, now, id);
  }
};

export const updateOrderPriority = (id: string, score: number) => {
  db.prepare('UPDATE orders SET manual_priority_score = ?, updated_at = ? WHERE id = ?')
    .run(score, new Date().toISOString(), id);
};

export const getAllOrders = (): Order[] => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
  return rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    projectSummary: row.project_summary,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    status: row.status as OrderStatus,
    progressStep: row.progress_step,
    manualPriorityScore: row.manual_priority_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

// --- VIRTUAL QUEUE SEEDING LOGIC ---

const PROJECT_TYPES = ['Website', 'App', 'Landing page', 'Hệ thống', 'Nền tảng'];
const SECTORS = ['BĐS', 'Spa', 'Tài chính', 'Thời trang', 'Giáo dục', 'Y tế', 'Logistics', 'Nội thất', 'Du lịch'];
const ADJECTIVES = ['cao cấp', 'chuyên nghiệp', 'nội bộ', 'đa nền tảng', 'tích hợp AI', 'tự động hóa'];

/**
 * Suy ra mầm (seed) ổn định theo cửa sổ thời gian (mỗi 30 phút)
 * Giúp hàng đợi thay đổi linh động hơn thay vì cố định cả ngày.
 */
const getSeedForTimeWindow = () => {
  const now = new Date();
  const window = Math.floor(now.getMinutes() / 10); // 10-minute blocks (0-5)
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${window}`;
};

/**
 * Hàm băm đơn giản để tạo số ngẫu nhiên có mầm (deterministic random)
 */
const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

export const generateFakeQueuePool = (count: number = 8) => {
  const pool: any[] = [];
  const baseSeed = getSeedForTimeWindow();
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Logic "Nhịp thở" của thị trường (Market Breathing):
  // - 0-20p: Nhiều đơn mới (Bị đẩy lùi)
  // - 20-40p: Nhiều đơn xong (Được thăng hạng tự nhiên)
  // - 40-60p: Cân bằng
  const stage = Math.floor(minutes / 20); // 0, 1, or 2
  
  let dynamicCount = count;
  if (hour >= 8 && hour <= 18) { // Giờ làm việc
    if (stage === 0) dynamicCount += 3; // New arrivals
    if (stage === 1) dynamicCount -= 2; // Simulated completions
    if (stage === 2) dynamicCount += 1; // Balanced
  } else {
    dynamicCount = Math.max(4, count - 2); // Giờ nghỉ ít biến động
  }

  // Đảm bảo số lượng tối thiểu
  dynamicCount = Math.max(4, dynamicCount);

  for (let i = 0; i < dynamicCount; i++) {
    const itemSeed = `${baseSeed}-item-${i}`;
    const rAmount = seededRandom(itemSeed + 'amount');

    const type = PROJECT_TYPES[Math.floor(seededRandom(itemSeed + 'r1') * PROJECT_TYPES.length)];
    const sector = SECTORS[Math.floor(seededRandom(itemSeed + 'r2') * SECTORS.length)];
    const adj = ADJECTIVES[Math.floor(seededRandom(itemSeed + 'r3') * ADJECTIVES.length)];

    const projectSummary = `${type} ${sector} ${adj}`;
    
    // Tiền cọc cơ bản: 300k - 2.3tr
    const basePaid = Math.floor(rAmount * 20) * 100000 + 300000;
    
    // Drift (Cọc thêm) nhẹ nhàng: 0 - 150k
    const drift = Math.floor(seededRandom(baseSeed + 'drift' + i) * 150000);
    
    // Làm tròn theo bước nhảy 50,000đ như yêu cầu
    const rawPaid = basePaid + drift;
    const paidAmount = Math.round(rawPaid / 50000) * 50000;

    pool.push({
      id: `FK${i.toString().padStart(4, '0')}`,
      projectSummary,
      paidAmount,
      status: 'processing',
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      isFake: true
    });
  }

  return pool.sort((a, b) => b.paidAmount - a.paidAmount);
};

export interface PublicQueueResponse {
  items: any[];
  userPosition: number;
  totalInQueue: number;
  fomoMessages: string[];
  upsellSuggestion?: {
    targetPosition: number;
    requiredDeposit: number;
    message: string;
  };
}

export const getRecommendedDepositTarget = (totalAmount: number): number => {
  if (totalAmount <= 0) return 0;
  if (totalAmount <= 3_000_000) return Math.round(totalAmount * 0.4);
  if (totalAmount <= 15_000_000) return Math.round(totalAmount * 0.35);
  return Math.round(totalAmount * 0.3);
};

const getMinTopUpIncrement = (totalAmount: number): number => {
  if (totalAmount <= 3_000_000) return 100_000;
  if (totalAmount <= 15_000_000) return 250_000;
  return 500_000;
};

export const getPublicQueue = (ticketId?: string): PublicQueueResponse => {
  const realQueue = getQueue();
  const fakePool = generateFakeQueuePool(8);

  // 1. Tìm vị trí thực tế của User
  const userOrder = ticketId ? realQueue.find(o => o.id === ticketId) : null;
  const userPaid = userOrder?.paidAmount || 0;

  // 2. Tính vị trí ảo (Dynamic Bias)
  // Vị trí ảo = Số đơn fake có tiền cọc cao hơn + Vị trí thực tế
  const tougherFakes = fakePool.filter(f => f.paidAmount > userPaid);
  const virtualPosition = tougherFakes.length + (userOrder ? realQueue.findIndex(o => o.id === ticketId) + 1 : realQueue.length + 1);

  // 3. Trộn dữ liệu
  // Lấy danh sách hiển thị quanh User (3 trên, 3 dưới)
  const displayList: any[] = [];

  const userDisplayItem = userOrder ? {
    id: userOrder.id,
    projectSummary: userOrder.projectSummary,
    paidAmount: userOrder.paidAmount,
    status: userOrder.status,
    createdAt: userOrder.createdAt,
    position: virtualPosition,
    isUser: true
  } : null;

  // Lấy các đơn "ngay trên" user trong pool ảo
  const fakesAbove = tougherFakes.slice(-3).map((f, i) => ({
    ...f,
    position: virtualPosition - (tougherFakes.slice(-3).length - i)
  }));

  // Lấy các đơn "ngay dưới" user trong pool ảo (những đơn có cọc thấp hơn user)
  const weakerFakes = fakePool.filter(f => f.paidAmount <= userPaid && f.id !== (userOrder?.id || ''));
  const fakesBelow = weakerFakes.slice(0, 3).map((f, i) => ({
    ...f,
    position: virtualPosition + 1 + i
  }));

  if (fakesAbove.length > 0) displayList.push(...fakesAbove);
  if (userDisplayItem) displayList.push(userDisplayItem);
  if (fakesBelow.length > 0) displayList.push(...fakesBelow);

  // 4. Upsell Suggestion
  let upsell = undefined;
  if (userDisplayItem && virtualPosition > 1) {
    // Gợi ý nhảy lên top 3 đơn hàng dẫn đầu hoặc nhảy lên 5 bậc
    const targetRank = Math.max(1, virtualPosition - 5);
    const competitor = fakePool[targetRank - 1];

    if (competitor && competitor.paidAmount > userPaid && userOrder) {
      const minIncrement = getMinTopUpIncrement(userOrder.totalAmount);
      const recommendedDeposit = getRecommendedDepositTarget(userOrder.totalAmount);
      const maxReasonableTopUp = Math.max(minIncrement, Math.round(userOrder.totalAmount * 0.2));

      const rawGap = competitor.paidAmount - userPaid + minIncrement;
      let gap = Math.min(Math.max(rawGap, minIncrement), maxReasonableTopUp);

      if (userPaid < recommendedDeposit) {
        const toRecommended = recommendedDeposit - userPaid;
        gap = Math.max(gap, Math.min(toRecommended, maxReasonableTopUp));
      }

      // Làm tròn tiền cọc gợi ý theo bước nhảy 50,000đ
      gap = Math.round(gap / 50000) * 50000;

      upsell = {
        targetPosition: targetRank,
        requiredDeposit: gap,
        message: `Tăng cọc thêm ${gap.toLocaleString()}đ để vượt lên vị trí #${targetRank} và được triển khai sớm hơn.`
      };
    }
  }

  const fomoMessages = [
    `🔥 Hệ thống vừa cập nhật một đơn hàng mới từ ${SECTORS[Math.floor(seededRandom(getSeedForTimeWindow() + 'f1') * SECTORS.length)]}`,
    `⚡ Đội ngũ kỹ thuật đang xử lý ${tougherFakes.length + realQueue.length} dự án trong hôm nay`,
    `✅ ${PROJECT_TYPES[Math.floor(seededRandom(getSeedForTimeWindow() + 'f2') * PROJECT_TYPES.length)]} vừa được bàn giao thành công`,
    `📢 Ưu tiên xử lý các đơn hàng có mức sẵn sàng (tiền cọc) cao hơn.`
  ];

  return {
    items: displayList.sort((a, b) => a.position - b.position),
    userPosition: virtualPosition,
    totalInQueue: fakePool.length + realQueue.length,
    fomoMessages,
    upsellSuggestion: upsell
  };
};
