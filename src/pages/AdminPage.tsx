import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, MessageSquare, Clock, 
  ChevronRight, Phone, Layout, Cpu, 
  Zap, AlertCircle, ArrowLeft,
  Calendar, CreditCard, Sparkles, User, FileText, RefreshCw, Package
} from 'lucide-react';
import { fetchAdminLeads, fetchAdminLeadDetail, fetchAdminOrders, updateAdminOrder, fetchAdminPayments } from '../services/api';
import { Message, LeadQualification } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LeadSummary {
  sessionId: string;
  projectSummary: string;
  contactName: string;
  contactValue: string;
  dealStage: string;
  updatedAt: string;
  adminStatus: string;
}

export const AdminPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = searchParams.get('auth');
  const pathSessionId = searchParams.get('sessionId');
  const [activeTab, setActiveTab] = useState<'all' | 'won' | 'discovery'>('all');
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(pathSessionId);
  const [leadDetail, setLeadDetail] = useState<{ lead: LeadQualification; messages: Message[]; markdown: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'leads' | 'orders'>('leads');
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Ưu tiên lấy auth từ URL, nếu không có thì lấy từ sessionStorage
    const currentAuth = auth || window.sessionStorage.getItem('pixelpro_admin_auth');
    
    if (!currentAuth) {
      setError('Thiếu mã xác thực Admin. Vui lòng truy cập từ link Telegram.');
      setIsLoading(false);
      return;
    }

    // Nếu có auth mới từ URL, cập nhật vào sessionStorage
    if (auth) {
      window.sessionStorage.setItem('pixelpro_admin_auth', auth);
    }

    const loadLeads = async () => {
      try {
        const data = await fetchAdminLeads(currentAuth);
        setLeads(data);
        
        // Auto-load if sessionId in URL
        if (pathSessionId) {
          loadDetail(pathSessionId, currentAuth);
        }
      } catch (err: any) {
        setError(err.message === 'Unauthorized' ? 'Mã xác thực không hợp lệ hoặc đã hết hạn.' : 'Lỗi kết nối server.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeads();
  }, [auth, pathSessionId]);

  const loadDetail = async (id: string, customAuth?: string) => {
    const activeAuth = customAuth || auth || window.sessionStorage.getItem('pixelpro_admin_auth');
    console.log('[ADMIN] Clicked lead:', id, 'Using auth:', activeAuth ? 'Yes' : 'No');
    
    if (!activeAuth) {
      console.error('[ADMIN] No auth token found for detail fetch');
      return;
    }
    
    setIsDetailLoading(true);
    try {
      const data = await fetchAdminLeadDetail(id, activeAuth);
      console.log('[ADMIN] Fetch detail success:', id);
      setLeadDetail(data);
      setSelectedLeadId(id);
    } catch (err) {
      console.error('[ADMIN] Failed to load lead detail:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const loadOrders = async () => {
    const activeAuth = auth || window.sessionStorage.getItem('pixelpro_admin_auth');
    if (!activeAuth) return;
    setIsDetailLoading(true);
    try {
      const [ordData, payData] = await Promise.all([
        fetchAdminOrders(activeAuth),
        fetchAdminPayments(activeAuth)
      ]);
      setOrders(ordData);
      setPayments(payData);
    } catch (err) {
      console.error('Failed to load orders/payments:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleUpdateOrder = async (id: string, payload: any) => {
    const activeAuth = auth || window.sessionStorage.getItem('pixelpro_admin_auth');
    if (!activeAuth) return;
    try {
      await updateAdminOrder(id, activeAuth, payload);
      loadOrders(); // Refresh
    } catch (err) {
      alert('Failed to update order');
    }
  };

  const filteredLeads = leads.filter(l => {
    if (activeTab === 'all') return true;
    if (activeTab === 'won') return l.dealStage === 'won' || l.dealStage === 'quoted' || l.dealStage === 'negotiation';
    return l.dealStage !== 'won' && l.dealStage !== 'quoted' && l.dealStage !== 'negotiation';
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="font-medium text-slate-600">Đang khởi động Dashboard Quản trị...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Truy cập bị từ chối</h2>
          <p className="mb-8 text-slate-500 leading-relaxed">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800"
          >
            Quay lại Trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Lead List */}
      <div className="flex w-full max-w-sm flex-col border-r border-slate-200 bg-white md:max-w-[400px]">
        <div className="border-b border-slate-100 p-6">
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setViewMode('leads')}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                viewMode === 'leads' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <Users size={18} />
              Quản lý Lead
            </button>
            <button 
              onClick={() => {
                setViewMode('orders');
                loadOrders();
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                viewMode === 'orders' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <CreditCard size={18} />
              Đơn hàng & Thanh toán
            </button>
          </div>
        </div>

        {viewMode === 'leads' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex gap-1 rounded-xl bg-slate-200 p-1">
                {(['all', 'won', 'discovery'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-xs font-bold transition-all uppercase tracking-wider",
                      activeTab === tab ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {tab === 'all' ? 'Tất cả' : tab === 'won' ? 'Chốt deal' : 'Đang xử lý'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredLeads.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium italic">Không có dữ liệu trong nhóm này.</div>
              ) : (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.sessionId}
                    onClick={() => loadDetail(lead.sessionId)}
                    className={cn(
                      "group w-full rounded-2xl p-4 text-left transition-all border border-transparent capitalize cursor-pointer mb-2",
                      selectedLeadId === lead.sessionId 
                        ? "bg-emerald-50 border-emerald-100 shadow-sm ring-1 ring-emerald-100" 
                        : "hover:bg-slate-50 border-transparent"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between pointer-events-none">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
                        ['won', 'quoted', 'closed'].includes(lead.dealStage)
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {lead.dealStage}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(lead.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 className="mb-1 text-sm font-bold text-slate-900 line-clamp-1 pointer-events-none">{lead.projectSummary || 'Dự án mới'}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pointer-events-none">
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-slate-400" />
                        {lead.contactName || 'Ẩn danh'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-20">
        {viewMode === 'leads' ? (
          <AnimatePresence mode="wait">
            {selectedLeadId && leadDetail ? (
              <motion.div
                key={selectedLeadId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8"
              >
              {/* Header */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Hồ sơ khách hàng</h2>
                  <p className="text-sm font-medium text-slate-500">Mã phiên: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{selectedLeadId}</code></p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                        <FileText size={18} className="text-slate-400" />
                        Xuất báo cáo
                    </button>
                    <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                        Liên hệ khách ngay
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left: Project Dossier (Markdown) */}
                <div className="xl:col-span-7 space-y-8">
                    <section className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-black uppercase tracking-tight text-slate-400 text-xs">
                                <Layout size={16} />
                                Đặc tả triển khai (Markdown Standard)
                            </h3>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 uppercase">Microsoft MarkItDown Style</span>
                        </div>
                        
                        <div className="prose prose-slate prose-emerald max-w-none prose-headings:tracking-tighter prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12 prose-table:border prose-table:rounded-xl prose-table:overflow-hidden">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {leadDetail.markdown}
                            </ReactMarkdown>
                        </div>
                    </section>
                </div>

                {/* Right: Chat History */}
                <div className="xl:col-span-5">
                    <div className="sticky top-8 rounded-3xl bg-slate-900 shadow-2xl overflow-hidden border border-slate-800 h-[800px] flex flex-col">
                        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={16} className="text-emerald-400" />
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Lịch sử tư vấn AI</h4>
                            </div>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-900/50">
                            {leadDetail.messages.map((msg, idx) => (
                                <div key={idx} className={cn(
                                    "flex w-full",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}>
                                    <div className={cn(
                                        "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed",
                                        msg.role === 'user' 
                                            ? "bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-500/10" 
                                            : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                                    )}>
                                        <div className="prose prose-sm prose-invert leading-relaxed break-words">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                {msg.attachments.map((img, i) => (
                                                    <img 
                                                        key={i} 
                                                        src={img} 
                                                        alt="Attachment" 
                                                        className="rounded-xl border border-white/10 hover:scale-105 transition-transform cursor-pointer" 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 italic font-medium">
              Chọn một khách hàng ở danh sách bên trái để xem chi tiết tư vấn.
            </div>
          )}
        </AnimatePresence>
      ) : (
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Quản lý Đơn hàng & Thanh toán</h2>
            <button 
              onClick={loadOrders}
              className="p-3 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <RefreshCw size={24} className={isDetailLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
               <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
                 <h3 className="font-bold flex items-center gap-2">
                   <Package className="text-emerald-400" /> Danh sách đơn hàng
                 </h3>
                 <span className="text-xs font-bold text-emerald-400">{orders.length} ACTIVE</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                     <tr>
                       <th className="px-6 py-4">Mã đơn / Dự án</th>
                       <th className="px-6 py-4">Trạng thái</th>
                       <th className="px-6 py-4">Tài chính</th>
                       <th className="px-6 py-4">Thao tác</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {orders.map(o => (
                       <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                               {o.id.slice(-2)}
                             </div>
                             <div>
                               <p className="font-bold text-slate-900">{o.id}</p>
                               <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{o.projectSummary}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <select 
                              value={o.status}
                              onChange={(e) => handleUpdateOrder(o.id, { status: e.target.value })}
                              className="bg-slate-100 border-none rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              {['pending', 'confirmed', 'in_queue', 'processing', 'designing', 'developing', 'testing', 'revision', 'completed', 'cancelled'].map(s => (
                                <option key={s} value={s}>{s.toUpperCase()}</option>
                              ))}
                            </select>
                         </td>
                         <td className="px-6 py-4">
                           <p className="text-xs font-bold text-slate-900">{(o.paidAmount/1000000).toFixed(1)}M / {(o.totalAmount/1000000).toFixed(1)}M</p>
                           <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                             <div 
                               className="h-full bg-emerald-500 rounded-full" 
                               style={{ width: `${Math.min(100, (o.paidAmount/o.totalAmount)*100)}%` }} 
                             />
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <input 
                               type="number"
                               defaultValue={o.manualPriorityScore}
                               onBlur={(e) => handleUpdateOrder(o.id, { manualPriorityScore: Number(e.target.value) })}
                               className="w-12 bg-slate-50 border border-slate-200 rounded px-1 py-1 text-xs text-center font-bold"
                               title="Priority Score"
                             />
                             <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                               <ChevronRight size={16} />
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            <div className="bg-slate-950 rounded-3xl p-6 text-white shadow-xl h-fit">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-emerald-400 text-sm italic">
                <Sparkles size={16} /> Lịch sử thanh toán SePay
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                {payments.map(p => (
                  <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-400">+{p.amount.toLocaleString()} VND</p>
                      <p className="text-[10px] text-slate-400 mt-1">{p.order_id}</p>
                      <p className="text-[10px] text-slate-500 italic mt-0.5">{p.payer_name || 'MBBank'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 uppercase">{p.status}</span>
                      <p className="text-[9px] text-slate-500 mt-2">{new Date(p.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && <p className="text-center text-slate-500 text-xs py-8">Chưa có giao dịch nào.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      <button 
        onClick={() => navigate('/')}
        className="fixed bottom-6 left-6 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-slate-600 shadow-xl border border-slate-100 hover:bg-slate-50 z-50 capitalize"
      >
        <ArrowLeft size={16} />
        Về Trang chủ
      </button>
    </div>
  );
};
