import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Clock, Sparkles } from 'lucide-react';

export interface QueueItem {
  position: number;
  projectSummary: string;
  status: string;
  paidAmount: number;
  createdAt: string;
  isUser?: boolean;
  isFake?: boolean;
}

interface UpsellSuggestion {
  targetPosition: number;
  requiredDeposit: number;
  message: string;
}

interface QueueViewerProps {
  queueItems: QueueItem[];
  fomoMessages: string[];
  upsellSuggestion?: UpsellSuggestion;
}

export const QueueViewer: React.FC<QueueViewerProps> = ({ 
  queueItems, 
  fomoMessages, 
  upsellSuggestion 
}) => {
  const [fomoIndex, setFomoIndex] = useState(0);

  useEffect(() => {
    if (fomoMessages.length <= 1) return;
    const interval = setInterval(() => {
      setFomoIndex((prev) => (prev + 1) % fomoMessages.length);
    }, 45000); // Đổi thông điệp mỗi 45s
    return () => clearInterval(interval);
  }, [fomoMessages]);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
      {/* Header & FOMO Badge */}
      <div className="p-6 bg-slate-950 text-white relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Hàng đợi ưu tiên
          </h3>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-black uppercase tracking-widest">
            Live
          </span>
        </div>

        {/* Rotating FOMO Badge */}
        <div className="h-10 bg-white/5 rounded-xl border border-white/10 flex items-center px-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={fomoIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium italic"
            >
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span>{fomoMessages[fomoIndex]}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Queue List */}
      <div className="p-2 flex-1">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 mb-1">
          Dự án đang xếp hàng
        </div>
        <AnimatePresence mode="popLayout">
          {queueItems.map((item) => {
            const isUser = item.isUser;
            return (
              <motion.div
                key={item.id || item.position}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl mb-1 transition-all ${
                  isUser 
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm ring-2 ring-emerald-500/10' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                  isUser ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  #{item.position}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold truncate text-sm ${isUser ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {item.projectSummary}
                    </p>
                    {isUser && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter shadow-sm">
                        CỦA BẠN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-black ${isUser ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {(item.paidAmount / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ĐÃ CỌC</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Upsell Widget */}
      {upsellSuggestion && (
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-t border-emerald-100">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100 animate-bounce">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-900 mb-1 uppercase tracking-tight">Cơ hội thăng hạng</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                {upsellSuggestion.message}
              </p>
            </div>
          </div>
          <button className="w-full mt-4 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all">
            NÂNG CẤP ƯU TIÊN NGAY
          </button>
        </div>
      )}

      {/* Footer Info */}
      {!upsellSuggestion && (
        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cập nhật lúc {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};
