import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import {
  Bot,
  RotateCcw,
  X,
  ImagePlus,
  Plus,
  Sparkles,
  Send,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Check,
  CheckCheck,
  User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AISkeleton } from './AISkeleton';
import { LeadQualification, Message } from '../types';
import { cn } from '../lib/utils';

const THINKING_STATUSES = [
  { text: 'Đã nhận yêu cầu', icon: Check, color: 'text-emerald-300' },
  { text: 'Đã xem nội dung', icon: CheckCheck, color: 'text-emerald-400' },
  { text: 'EmDash AI đang suy nghĩ...', icon: Sparkles, color: 'text-white' },
  { text: 'Đang phân tích yêu cầu...', icon: CircleDashed, color: 'text-white', animate: true },
  { text: 'Đang tra cứu tri thức...', icon: CircleDashed, color: 'text-white', animate: true },
  { text: 'Đang soạn phản hồi...', icon: Bot, color: 'text-white' },
];

const TypingMessage = React.memo(({ content }: { content: string }) => {
  const [displayedContent, setDisplayedContent] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const words = React.useMemo(() => content.split(' '), [content]);

  React.useEffect(() => {
    if (!content) {
      setDisplayedContent('Hệ thống đang tải phản hồi...');
      return;
    }

    if (index < words.length) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) => prev + (prev ? ' ' : '') + words[index]);
        setIndex(index + 1);
      }, 30 + Math.random() * 20); // Faster, more efficient typing
      return () => clearTimeout(timer);
    }
  }, [index, words, content]);

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({node, ...props}) => (
          <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
        th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-700 border-r border-slate-200 last:border-r-0" {...props} />,
        td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-slate-600 border-r border-slate-100 last:border-r-0" {...props} />,
        tr: ({node, ...props}) => <tr className="divide-x divide-slate-100 odd:bg-white even:bg-slate-50/50" {...props} />,
      }}
    >
      {displayedContent}
    </ReactMarkdown>
  );
});

interface ChatSectionProps {
  chatMessages: Message[];
  isAnalyzing: boolean;
  challengeInput: string;
  setChallengeInput: (val: string) => void;
  attachedImages: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (idx: number) => void;
  handleSendMessage: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  lead: LeadQualification;
  adminStatus: 'idle' | 'sending' | 'sent' | 'failed';
  onResetSession: () => void;
  onVisibilityChange?: (inView: boolean) => void;
}



export const ChatSection = ({
  chatMessages,
  isAnalyzing,
  challengeInput,
  setChallengeInput,
  attachedImages,
  handleImageUpload,
  removeImage,
  handleSendMessage,
  textareaRef,
  lead,
  adminStatus,
  onResetSession,
  onVisibilityChange,
}: ChatSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const lastScrollTop = useRef<number>(0);
  const isInView = useInView(sectionRef, { amount: 0.2 });

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isInView);
    }
  }, [isInView, onVisibilityChange]);

  const [statusIndex, setStatusIndex] = React.useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (isAnalyzing) {
      // Sequence: Start with "Received"
      setStatusIndex(0);
      
      // Move to "Seen" after 800ms
      timeout = setTimeout(() => {
        setStatusIndex(1);
        
        // Move to "Thinking" after another 1000ms
        timeout = setTimeout(() => {
          setStatusIndex(2);
          
          // Start looping from status 2 to the end with a longer interval
          interval = setInterval(() => {
            setStatusIndex((prev) => {
              if (prev < 2) return 2;
              const next = prev + 1;
              return next >= THINKING_STATUSES.length ? 2 : next;
            });
          }, 3500);
        }, 1000);
      }, 800);
      
    } else {
      setStatusIndex(0);
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isAnalyzing]);

  // Smart Auto-scroll: Only scroll if user is already at bottom
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const isAtBottom = () => {
      const threshold = 100; // pixels from bottom to be considered "at bottom"
      return scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight <= threshold;
    };

    const scroll = () => {
      const { scrollHeight, clientHeight } = scrollContainer;
      scrollContainer.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    };

    // We use requestAnimationFrame to ensure the DOM has updated
    const frameId = requestAnimationFrame(() => {
      if (isAtBottom() || (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user') || isAnalyzing) {
        scroll();
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [chatMessages, isAnalyzing]);

  return (
    <section 
      ref={sectionRef} 
      id="challenge" 
      className="relative overflow-hidden bg-slate-900 px-6 py-24 scroll-mt-24 contain-paint"
    >
      <div className="absolute right-0 top-0 h-96 w-96 -mr-32 -mt-32 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="mx-auto mb-16 max-w-4xl text-center">
        <h2 className="mb-6 font-display text-3xl font-extrabold text-white md:text-4xl">AI nhận brief và chốt lead</h2>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          EmDash AI hỏi ngắn, gom đúng thông tin cần thiết, ước tính báo giá và thời gian để admin nhận lead rõ ràng hơn.
        </p>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="flex h-[680px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900 md:text-3xl">Tư vấn và báo giá bởi EmDash AI</h2>
              <p className="mt-2 text-sm text-slate-500">
                Mỗi lượt chỉ hỏi ngắn gọn, ưu tiên làm rõ yêu cầu, ngân sách, timeline và thông tin liên hệ.
              </p>
            </div>
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={onResetSession}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              title="Tạo yêu cầu mới"
            >
              <RotateCcw size={20} />
            </motion.button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 space-y-6 overflow-y-auto bg-slate-50/30 p-6 md:p-8 scroll-smooth overscroll-contain"
            onScroll={(e) => {
              lastScrollTop.current = (e.currentTarget as HTMLDivElement).scrollTop;
            }}
          >
            {chatMessages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-slate-400">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Bot size={32} />
                </div>
                <div className="max-w-sm">
                  <p className="text-sm font-medium text-slate-700">EmDash AI đã sẵn sàng</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Bạn chỉ cần mô tả dự án, deadline, ngân sách hoặc gửi ảnh tham khảo. AI sẽ tự hỏi lại phần còn thiếu.
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence mode="popLayout" initial={false}>
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'relative max-w-[85%] rounded-2xl p-5 text-sm leading-relaxed shadow-sm md:max-w-[80%] min-w-[120px] min-h-[48px]',
                      msg.role === 'user'
                        ? 'rounded-tr-none bg-emerald-600 text-white shadow-emerald-200'
                        : 'rounded-tl-none border border-slate-200 bg-white text-slate-800',
                    )}
                  >
                    {msg.role === 'model' && (
                      <div className="absolute -left-2 -top-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-white">
                        EmDash Response
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none prose-emerald break-words prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-emerald-400">
                      {msg.role === 'model' && idx === chatMessages.length - 1 ? (
                        <TypingMessage content={msg.content} />
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({node, ...props}) => (
                              <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200" {...props} />
                              </div>
                            ),
                            thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                            th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-700 border-r border-slate-200 last:border-r-0" {...props} />,
                            td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-slate-600 border-r border-slate-100 last:border-r-0" {...props} />,
                            tr: ({node, ...props}) => <tr className="divide-x divide-slate-100 odd:bg-white even:bg-slate-50/50" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isAnalyzing && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="flex justify-start pt-2"
                >
                  <div className="relative w-full max-w-[80%] rounded-2xl rounded-tl-none border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute -left-2 -top-3 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[9px] font-bold uppercase tracking-tighter text-white shadow-lg">
                      <div className="flex items-center gap-1">
                        {React.createElement(THINKING_STATUSES[statusIndex].icon, { 
                          size: 10, 
                          className: cn(
                            THINKING_STATUSES[statusIndex].color,
                            THINKING_STATUSES[statusIndex].animate && "animate-spin-slow"
                          ) 
                        })}
                      </div>
                      {THINKING_STATUSES[statusIndex].text}
                    </div>
                    <AISkeleton />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-slate-100 bg-white p-4 md:p-6">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-inner transition-all hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <AnimatePresence>
                {attachedImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 p-3 pb-0"
                  >
                    {attachedImages.map((img, idx) => (
                      <div key={idx} className="group relative">
                        <img
                          src={img}
                          alt="Ảnh tham khảo"
                          className="h-20 w-20 rounded-xl border border-slate-200 object-cover shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

            <div className="flex flex-col">
              <textarea
                ref={textareaRef}
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Mô tả yêu cầu, deadline, ngân sách..."
                rows={1}
                className="min-h-[56px] w-full resize-none bg-transparent px-4 py-4 text-sm text-slate-900 focus:outline-none md:text-base"
              />

              <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3">
                <div className="flex items-center gap-2">
                  <a 
                    href="https://zalo.me/0932690949"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-blue-700"
                  >
                    Zalo hỗ trợ
                  </a>
                  <a 
                    href="https://t.me/htt711"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-sky-600"
                  >
                    Telegram
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-1">
                    <input type="file" id="chat-image-upload" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                    <label
                      htmlFor="chat-image-upload"
                      className="cursor-pointer rounded-xl p-2 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600"
                      title="Đính kèm ảnh"
                    >
                      <ImagePlus size={18} />
                    </label>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={isAnalyzing || (!challengeInput.trim() && attachedImages.length === 0)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nhấn Enter để gửi • Shift + Enter để xuống dòng</p>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl lg:sticky lg:top-32">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">Dự án của bạn</p>
              <h3 className="mt-2 text-xl font-bold">Tóm tắt yêu cầu</h3>
            </div>
            {lead.readyToHandoff ? <CheckCircle2 className="text-emerald-300" /> : <CircleDashed className="text-slate-500 animate-spin-slow" />}
          </div>

          <div className="space-y-4 text-sm">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Liên hệ trực tiếp</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a 
                  href="https://zalo.me/0932690949"
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-[11px] font-bold transition-all hover:bg-blue-700"
                >
                  Zalo
                </a>
                <a 
                  href="https://t.me/htt711"
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-[11px] font-bold transition-all hover:bg-sky-600"
                >
                  Telegram
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Phạm vi công việc</p>
              <p className="mt-2 leading-relaxed text-slate-100">{lead.projectSummary || 'Đang lắng nghe...'}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Dự toán sơ bộ</p>
                <p className="mt-2 font-semibold text-emerald-300">{lead.estimatedQuote || 'Đang ước tính...'}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Timeline dự kiến</p>
                <p className="mt-2 text-slate-100">
                  {[lead.demoTimeline, lead.deliveryTimeline].filter(Boolean).join(' / ') || 'Tùy theo yêu cầu'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Thông tin liên hệ</p>
              <p className="mt-2 text-slate-100">
                {lead.contactName || lead.contactValue
                  ? [lead.contactName, lead.contactChannel, lead.contactValue].filter(Boolean).join(' • ')
                  : 'Sẽ được cập nhật sau chat'}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Hạng mục còn thiếu</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lead.missingInfo.length > 0 ? (
                  lead.missingInfo.map((item) => (
                    <span key={item} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] text-slate-300">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    Đủ thông tin chốt deal
                  </span>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};
