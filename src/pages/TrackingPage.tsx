import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, CheckCircle2, Clock, CreditCard, 
  ChevronRight, ArrowLeft, RefreshCw, Copy,
  AlertCircle, ShieldCheck, Zap
} from 'lucide-react';
import { QueueViewer } from '../components/QueueViewer';

interface OrderDetail {
  id: string;
  projectSummary: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  progressStep: number;
  queuePosition: number;
  createdAt: string;
  updatedAt: string;
  publicQueue: any[];
  fomoMessages: string[];
  upsellSuggestion?: any;
  totalInQueue: number;
}

const formatVnd = (amount: number) => `${Math.max(0, Math.round(amount)).toLocaleString('en-US')} VND`;

const STEPS = [
  { id: 'pending', label: 'Chờ duyệt', icon: Clock },
  { id: 'confirmed', label: 'Xác nhận', icon: CheckCircle2 },
  { id: 'in_queue', label: 'Xếp hàng', icon: Package },
  { id: 'processing', label: 'Thực hiện', icon: Zap },
  { id: 'designing', label: 'Thiết kế', icon: ShieldCheck },
  { id: 'developing', label: 'Lập trình', icon: ShieldCheck },
  { id: 'testing', label: 'Kiểm thử', icon: ShieldCheck },
  { id: 'revision', label: 'Chỉnh sửa', icon: ShieldCheck },
  { id: 'completed', label: 'Hoàn thành', icon: CheckCircle2 }
];

export const TrackingPage = () => {
  const { ticket } = useParams<{ ticket: string }>();
  const navigate = useNavigate();
  const [ticketInput, setTicketInput] = useState('');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!ticket) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${ticket}`);
      if (!res.ok) throw new Error('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã ticket.');
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Poll every 10s for status updates
    return () => clearInterval(interval);
  }, [ticket]);

  const copyTicket = () => {
    if (ticket) {
      navigator.clipboard.writeText(ticket);
      // Optional: show toast
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Tra cứu đơn hàng</h1>
          <p className="text-slate-500 mb-6">Dán mã ticket để theo dõi tiến độ và thanh toán đặt cọc.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              placeholder="Ví dụ: PX20260417074480B343"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
            />
            <button
              onClick={() => {
                const normalized = ticketInput.trim();
                if (!normalized) return;
                navigate(`/tracking/${normalized}`);
              }}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              Theo dõi
            </button>
          </div>
          <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors mt-5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-rose-50 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Lỗi truy cập</h2>
        <p className="text-slate-500 mb-6 max-w-sm">{error || 'Đơn hàng không tồn tại.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === order.status);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;
  const recommendedDepositTarget = order.totalAmount <= 3000000
    ? Math.round(order.totalAmount * 0.4)
    : order.totalAmount <= 15000000
      ? Math.round(order.totalAmount * 0.35)
      : Math.round(order.totalAmount * 0.3);
  const remainingAmount = Math.max(0, order.totalAmount - order.paidAmount);

  // Generate SePay QR URL
  // Format: https://qr.sepay.vn/img?acc=ACCOUNT_NUMBER&bank=BANK_NAME&amount=AMOUNT&des=TICKET_ID
  const qrUrl = `https://qr.sepay.vn/img?acc=0338871927&bank=MBBank&amount=${Math.max(0, recommendedDepositTarget - order.paidAmount)}&des=${order.id}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors mb-4 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Bảng điều khiển
            </Link>
            <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-2">
              Theo dõi tiến độ <span className="text-emerald-500">đơn hàng</span>
            </h1>
            <div className="flex items-center gap-3">
              <code className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-emerald-600 font-bold shadow-sm">
                {order.id}
              </code>
              <button 
                onClick={copyTicket}
                className="p-2 hover:bg-white hover:border-slate-200 border border-transparent rounded-lg text-slate-400 transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Vị trí</p>
              <p className="text-3xl font-black text-emerald-500">#{order.queuePosition}</p>
            </div>
            <div className="w-px h-10 bg-slate-100" />
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Xếp hàng</p>
              <p className="text-lg font-bold text-slate-900">{order.totalInQueue} Dự án</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Bar */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
              <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                Lịch trình triển khai
              </h3>
              
              <div className="relative pb-12">
                {/* Connector line */}
                <div className="absolute top-6 left-6 bottom-6 w-0.5 bg-slate-100 hidden md:block" />
                
                <div className="space-y-6">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex || order.status === 'completed';
                    const isCurrent = idx === currentStepIndex && order.status !== 'completed';
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.id} className="flex items-start gap-6 relative">
                        <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                          isCurrent ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 animate-pulse' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pt-2">
                          <p className={`font-bold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-blue-500 font-medium mt-1"
                            >
                              Đang thực hiện...
                            </motion.p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Project Summary */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
              <h3 className="font-bold text-slate-900 mb-6">Chi tiết dự án</h3>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-700 leading-relaxed font-medium">
                  {order.projectSummary || 'Đang cập nhật tóm tắt dự án...'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar: Payment & Queue */}
          <div className="space-y-8">
            {/* Payment Card */}
            <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-emerald-200/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard className="w-24 h-24 rotate-12" />
              </div>
              
              <h3 className="font-bold mb-6 flex items-center gap-2 relative z-10">
                <CreditCard className="w-5 h-5" />
                Thanh toán
              </h3>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-emerald-100">
                  <span className="text-sm">Tổng dự án:</span>
                  <span className="font-bold text-white">{(order.totalAmount / 1000000).toFixed(1)}M VNĐ</span>
                </div>
                <div className="flex justify-between items-center text-emerald-100">
                  <span className="text-sm">Đã thanh toán:</span>
                  <span className="font-black text-white">{(order.paidAmount / 1000000).toFixed(1)}M VNĐ</span>
                </div>
                <div className="h-px bg-white/20 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Còn lại:</span>
                  <span className="text-2xl font-black">
                    {(remainingAmount / 1000000).toFixed(1)}M <span className="text-xs">VNĐ</span>
                  </span>
                </div>
              </div>

              {order.paidAmount < order.totalAmount && (
                <div className="mt-8 bg-white rounded-3xl p-4 text-slate-900 border-4 border-emerald-500/50">
                  <p className="text-[10px] uppercase font-black text-center text-slate-400 mb-3 tracking-widest">Quet ma dat coc (Khuyen nghi)</p>
                  <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                    <img src={qrUrl} alt="SePay QR" className="w-full h-full object-contain" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">Nội dung chuyển khoản chuẩn:</p>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-black text-emerald-600">{order.id}</code>
                  </div>
                </div>
              )}
              
              {order.paidAmount >= order.totalAmount && (
                <div className="mt-8 bg-white/10 rounded-2xl p-4 text-center border border-white/20">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-white" />
                  <p className="text-sm font-bold">Thanh toán hoàn tất</p>
                  <p className="text-[10px] text-emerald-100">Cảm ơn bạn đã tin tưởng dịch vụ!</p>
                </div>
              )}
            </div>

            {/* Virtual Queue Sidebar Component */}
            <QueueViewer 
              queueItems={order.publicQueue} 
              fomoMessages={order.fomoMessages}
              upsellSuggestion={order.upsellSuggestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
