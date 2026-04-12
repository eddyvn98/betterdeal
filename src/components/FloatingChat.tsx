import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, MessageSquare, Sparkles, Maximize2 } from 'lucide-react';
import { Message } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FloatingChatProps {
  messages: Message[];
  isAnalyzing: boolean;
  isVisible: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: () => void;
  onScrollToMain: () => void;
}

export const FloatingChat = ({
  messages,
  isAnalyzing,
  isVisible,
  inputValue,
  setInputValue,
  onSend,
  onScrollToMain,
}: FloatingChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'model');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4"
        >
          {/* Notification Bubble for Last Response (when closed) */}
          <AnimatePresence>
            {!isOpen && lastAiMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="group relative max-w-[280px] cursor-pointer rounded-2xl border border-emerald-500/20 bg-white/90 p-3 shadow-xl backdrop-blur-xl transition-all hover:bg-white"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    <Sparkles size={10} />
                    EmDash AI phản hồi
                  </span>
                  <X size={12} className="text-slate-400 group-hover:text-slate-600" onClick={(e) => {
                    e.stopPropagation();
                    // maybe hide this particular message
                  }} />
                </div>
                <div className="line-clamp-2 text-xs leading-relaxed text-slate-700">
                  {lastAiMessage.content}
                </div>
                <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 border-b border-r border-emerald-500/20 bg-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Mini Chatbox */}
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="flex h-[500px] w-80 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:w-[380px]"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-600 px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">EmDash Consultant</h4>
                      <p className="text-[10px] opacity-80">Đang trực tuyến</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onScrollToMain}
                      className="rounded-lg p-2 transition-colors hover:bg-white/10"
                      title="Mở rộng chat"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 scroll-smooth"
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex w-full",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm",
                          msg.role === 'user'
                            ? "rounded-tr-none bg-emerald-600 text-white"
                            : "rounded-tl-none border border-slate-200 bg-white text-slate-800"
                        )}
                      >
                        <div className="prose prose-xs prose-p:my-0 break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content || ''}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm will-change-opacity">
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Bot size={14} className="text-emerald-500" />
                        </motion.div>
                        AI đang phản hồi...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-100 bg-white p-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 pl-3 focus-within:border-emerald-500">
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSend();
                      }}
                      placeholder="Hỏi AI thêm..."
                      className="flex-1 bg-transparent py-2 text-xs text-slate-900 focus:outline-none"
                    />
                    <button
                      onClick={onSend}
                      disabled={!inputValue.trim()}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white transition-opacity disabled:opacity-40"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Floating Bubble Button */
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-200 transition-colors hover:bg-emerald-700 will-change-transform"
              >
                <MessageSquare size={24} />
                <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white ring-1 ring-red-500/20" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
