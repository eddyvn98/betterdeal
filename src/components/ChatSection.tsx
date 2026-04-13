import React, { useEffect, useLayoutEffect, useRef } from 'react';
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
  Gamepad2,
  Languages,
  MessageSquare,
  Clock,
  Images,
  ChevronRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { AISkeleton } from './AISkeleton';
import { LeadQualification, Message } from '../types';
import { cn } from '../lib/utils';


/** Shared ReactMarkdown table renderer config */
const markdownComponents = {
  table: ({ node, ...props }: any) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => <thead className="bg-slate-50" {...props} />,
  th: ({ node, ...props }: any) => (
    <th
      className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-700 border-r border-slate-200 last:border-r-0"
      {...props}
    />
  ),
  td: ({ node, ...props }: any) => (
    <td
      className="px-3 py-2 text-sm text-slate-600 border-r border-slate-100 last:border-r-0"
      {...props}
    />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="divide-x divide-slate-100 odd:bg-white even:bg-slate-50/50" {...props} />
  ),
};

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
  onOpenGame: () => void;
  onFilesAttached: (files: File[]) => void;
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
  onOpenGame,
  onFilesAttached,
}: ChatSectionProps) => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stickToBottomRef = useRef(true);
  const isInView = useInView(sectionRef, { amount: 0.2 });

  const THINKING_STATUSES = [
    { text: i18n.language.startsWith('vi') ? 'Đã nhận yêu cầu' : 'Request received', icon: Check, color: 'text-emerald-300' },
    { text: i18n.language.startsWith('vi') ? 'Đã xem nội dung' : 'Content viewed', icon: CheckCheck, color: 'text-emerald-400' },
    { text: i18n.language.startsWith('vi') ? 'Emdash đang suy nghĩ...' : 'Emdash is thinking...', icon: Sparkles, color: 'text-white' },
    { text: t('chat.analyzing'), icon: CircleDashed, color: 'text-white', animate: true },
    { text: i18n.language.startsWith('vi') ? 'Đang tra cứu tri thức...' : 'Looking up knowledge...', icon: CircleDashed, color: 'text-white', animate: true },
    { text: i18n.language.startsWith('vi') ? 'Đang soạn phản hồi...' : 'Drafting response...', icon: Bot, color: 'text-white' },
  ];

  const [statusIndex, setStatusIndex] = React.useState(0);

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isInView);
    }
  }, [isInView, onVisibilityChange]);

  // Cycle through thinking status labels while AI is loading
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (isAnalyzing) {
      setStatusIndex(0);

      timeout = setTimeout(() => {
        setStatusIndex(1);

        timeout = setTimeout(() => {
          setStatusIndex(2);

          interval = setInterval(() => {
            setStatusIndex((prev) => {
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

  // Handle pasting images from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    const { items, files: clipboardFiles } = e.clipboardData;
    const foundFiles: File[] = [];

    // 1. Check for files (standard for copied files from explorer)
    if (clipboardFiles && clipboardFiles.length > 0) {
      for (let i = 0; i < clipboardFiles.length; i++) {
        if (clipboardFiles[i].type.startsWith('image/')) {
          foundFiles.push(clipboardFiles[i]);
        }
      }
    }

    // 2. Check items if no files found or for screenshots
    if (foundFiles.length === 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) foundFiles.push(file);
        }
      }
    }

    // If we found any images, handle them and STOP the default paste (which inserts garbage text)
    if (foundFiles.length > 0) {
      e.preventDefault();
      onFilesAttached(foundFiles);
    }
  };

  // Keep chat pinned to the bottom during active conversation
  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !stickToBottomRef.current) return;

    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    const scroll = () => {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    };

    const raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [chatMessages, isAnalyzing]); // Re-run when messages or loading state changes

  return (
    <section
      ref={sectionRef}
      id="challenge"
      className="relative overflow-hidden bg-slate-900 px-6 py-24 scroll-mt-24 contain-paint"
    >
      <div className="absolute right-0 top-0 h-96 w-96 -mr-32 -mt-32 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="mx-auto mb-16 max-w-4xl text-center">
        <h2 className="mb-6 font-display text-3xl font-extrabold text-white md:text-4xl">
          {i18n.language.startsWith('vi') ? 'AI nhận brief và chốt lead' : 'AI brief intake & lead generation'}
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          {i18n.language.startsWith('vi')
            ? 'Emdash hỏi ngắn, gom đúng thông tin cần thiết, ước tính báo giá và thời gian để admin nhận lead rõ ràng hơn.'
            : 'Emdash asks focused questions, gathers essential info, estimates quotes and timelines for clear lead handoff.'}
        </p>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="flex h-[680px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
                {i18n.language.startsWith('vi') ? 'Tư vấn và báo giá bởi Emdash' : 'Consulting & Quoting by Emdash'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {i18n.language.startsWith('vi')
                  ? 'Mỗi lượt chỉ hỏi ngắn gọn, ưu tiên làm rõ yêu cầu, ngân sách, timeline và thông tin liên hệ.'
                  : 'Brief interactions prioritized on clarifying requirements, budget, timeline, and contact info.'}
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenGame}
                className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100"
                title={t('game.cta_title')}
              >
                <Gamepad2 size={16} className="animate-pulse" />
                <span>{t('game.cta_title')}</span>
              </motion.button>
              <motion.button
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={onResetSession}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                title={t('chat.reset')}
              >
                <RotateCcw size={20} />
              </motion.button>
            </div>
          </div>

          {/* Message list */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-6 overflow-y-auto bg-slate-50/30 p-6 md:p-8 overscroll-contain"
            onScroll={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
              stickToBottomRef.current = distanceFromBottom <= 120;
            }}
          >
            {/* Empty state */}
            {chatMessages.length === 0 && (
              <div className="flex h-full flex-col overflow-y-auto px-6 py-10 md:px-12 overscroll-contain">
                <div className="mx-auto w-full max-w-2xl space-y-12">
                  {/* Hero Brand Section */}
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, type: 'spring' }}
                      className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/10"
                    >
                      <Bot size={48} />
                    </motion.div>
                    <motion.h3 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="font-display text-3xl font-extrabold text-slate-900 md:text-4xl"
                    >
                      {t('chat.welcome_title')}
                    </motion.h3>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 text-balance text-lg text-slate-500"
                    >
                      {t('chat.welcome_desc')}
                    </motion.p>
                  </div>

                  {/* Language Switcher */}
                  <div className="flex flex-col items-center space-y-4">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      <Languages size={14} />
                      {t('chat.lang_switch')}
                    </p>
                    <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
                      <button
                        onClick={() => i18n.changeLanguage('vi')}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                          i18n.language.startsWith('vi')
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                            : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <span className="text-lg">🇻🇳</span>
                        Tiếng Việt
                      </button>
                      <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                          i18n.language.startsWith('en')
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                            : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <span className="text-lg">🇺🇸</span>
                        English
                      </button>
                    </div>
                  </div>

                  {/* Instructions Guide */}
                  <div className="space-y-6">
                    <h4 className="text-center font-display text-xl font-bold text-slate-800">
                      {t('chat.guide_title')}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        { icon: MessageSquare, text: t('chat.guide_step1'), color: 'bg-blue-50 text-blue-600' },
                        { icon: Clock, text: t('chat.guide_step2'), color: 'bg-amber-50 text-amber-600' },
                        { icon: Images, text: t('chat.guide_step3'), color: 'bg-purple-50 text-purple-600' },
                      ].map((step, idx) => (
                        <div 
                          key={idx}
                          className="flex flex-col items-center rounded-3xl border border-slate-50 bg-white p-6 text-center shadow-sm transition-all hover:border-emerald-100 hover:shadow-md"
                        >
                          <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl", step.color)}>
                            <step.icon size={24} />
                          </div>
                          <p className="text-sm font-medium leading-relaxed text-slate-600">
                            {step.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Tip */}
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-6 py-4 text-emerald-700">
                    <Sparkles size={18} className="shrink-0" />
                    <p className="text-sm font-semibold">
                      {isVi 
                        ? 'Tip: Bạn có thể nhấn Enter để gửi tin nhắn ngay bây giờ.' 
                        : 'Tip: You can press Enter to send your message now.'}
                    </p>
                    <ChevronRight size={16} className="ml-auto opacity-40" />
                  </div>
                </div>
              </div>
            )}

            {chatMessages.map((msg, idx) => {
              const isLoadingPlaceholder = msg.role === 'model' && (!msg.content || msg.content.trim() === '');

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
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
                      <div className="absolute -left-2 -top-3 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[9px] font-bold uppercase tracking-tighter text-white shadow-lg z-10">
                        {isLoadingPlaceholder ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center">
                              {React.createElement(THINKING_STATUSES[statusIndex].icon, {
                                size: 10,
                                className: cn(
                                  "text-white", // Always white on emerald background
                                  THINKING_STATUSES[statusIndex].animate && 'animate-spin-slow',
                                ),
                              })}
                            </div>
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={statusIndex}
                                initial={{ opacity: 0, x: 5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {THINKING_STATUSES[statusIndex].text}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                        ) : (
                          <span>Emdash Response</span>
                        )}
                      </div>
                    )}

                    <div className={cn(
                      "prose prose-sm max-w-none prose-emerald break-words prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-emerald-400",
                      msg.role === 'user' && "prose-invert",
                      isLoadingPlaceholder && "min-h-[80px] flex items-center" // Prevent collapse during loading
                    )}>
                      {isLoadingPlaceholder ? (
                        <div className="w-full">
                          <AISkeleton />
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              ...markdownComponents,
                              p: ({ children }: any) => {
                                // Check if children contains the game tag
                                const text = React.Children.toArray(children).join('');
                                if (text.includes('[FLAPPY_DISCOUNT_GAME]')) {
                                  const parts = text.split('[FLAPPY_DISCOUNT_GAME]');
                                  return (
                                    <div className="space-y-4">
                                      <p className="leading-relaxed">{parts[0]}</p>
                                      <motion.button
                                        whileHover={{ scale: 1.02, translateY: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onOpenGame}
                                        className="flex items-center gap-3 w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-200"
                                      >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                          <Gamepad2 size={24} />
                                        </div>
                                        <div className="text-left">
                                          <p className="text-sm font-bold uppercase tracking-wider">{t('game.cta_title')}</p>
                                          <p className="text-[10px] opacity-90">{t('game.cta_desc')}</p>
                                        </div>
                                        <div className="ml-auto rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold">
                                          PLAY NOW
                                        </div>
                                      </motion.button>
                                      {parts[1] && <p className="leading-relaxed">{parts[1]}</p>}
                                    </div>
                                  );
                                }
                                return <p className="leading-relaxed">{children}</p>;
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {msg.attachments.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="Attachment"
                                  className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover border border-white/20 shadow-sm"
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Input area */}
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
                          alt={t('chat.upload')}
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
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t('chat.input_placeholder')}
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
                      {isVi ? 'Zalo hỗ trợ' : 'Zalo Support'}
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
                    <div className="flex items-center gap-1">
                      <input type="file" id="chat-image-upload" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                      <label
                        htmlFor="chat-image-upload"
                        className="cursor-pointer rounded-xl p-2 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600"
                        title={t('chat.upload')}
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isVi ? 'Nhấn Enter để gửi • Shift + Enter để xuống dòng' : 'Press Enter to send • Shift + Enter for new line'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl lg:sticky lg:top-32">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
                {isVi ? 'Dự án của bạn' : 'Your Project'}
              </p>
              <h3 className="mt-2 text-xl font-bold">
                {isVi ? 'Tóm tắt yêu cầu' : 'Requirement Summary'}
              </h3>
            </div>
            {lead.readyToHandoff ? <CheckCircle2 className="text-emerald-300" /> : <CircleDashed className="text-slate-500 animate-spin-slow" />}
          </div>

          <div className="space-y-4 text-sm">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                {isVi ? 'Liên hệ trực tiếp' : 'Direct Contact'}
              </p>
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
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {isVi ? 'Phạm vi công việc' : 'Project Scope'}
              </p>
              <p className="mt-2 leading-relaxed text-slate-100">
                {lead.projectSummary || (isVi ? 'Đang lắng nghe...' : 'Listening...')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  {t('chat.pricing_hint')}
                </p>
                <p className="mt-2 font-semibold text-emerald-300">
                  {lead.estimatedQuote || (isVi ? 'Đang ước tính...' : 'Estimating...')}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  {isVi ? 'Timeline dự kiến' : 'Estimated Timeline'}
                </p>
                <p className="mt-2 text-slate-100">
                  {[lead.demoTimeline, lead.deliveryTimeline].filter(Boolean).join(' / ') || (isVi ? 'Tùy theo yêu cầu' : 'TBD')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {isVi ? 'Thông tin liên hệ' : 'Contact Info'}
              </p>
              <p className="mt-2 text-slate-100">
                {lead.contactName || lead.contactValue
                  ? [lead.contactName, lead.contactChannel, lead.contactValue].filter(Boolean).join(' • ')
                  : (isVi ? 'Sẽ được cập nhật sau chat' : 'To be updated after chat')}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {isVi ? 'Hạng mục còn thiếu' : 'Missing Info'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lead.missingInfo.length > 0 ? (
                  lead.missingInfo.map((item) => (
                    <span key={item} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] text-slate-300">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    {isVi ? 'Đủ thông tin chốt deal' : 'Ready for handoff'}
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
