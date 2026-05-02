import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Message, LeadQualification } from '../../types';
import { createSession, fetchSessionState, sendChatMessage } from '../../services/api';

const storageKey = 'Emdash-portfolio-session-id';
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

const emptyLead: LeadQualification = {
  projectSummary: '',
  projectType: '',
  goals: [],
  requiredFeatures: [],
  targetUsers: '',
  platforms: [],
  references: [],
  budget: '',
  estimatedQuote: '',
  demoTimeline: '',
  deliveryTimeline: '',
  contactName: '',
  contactChannel: '',
  contactValue: '',
  missingInfo: [],
  nextQuestions: [],
  confidence: 'low',
  dealStage: 'discovery',
  readyToHandoff: false,
  adminSummary: '',
  isSharedExperience: false,
  redeemedVoucherCode: '',
  appliedDiscount: 0,
};

const getTurnstileToken = (): Promise<string | undefined> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('[Turnstile] Verification timeout');
      resolve(undefined);
    }, 10000);

    const container = document.getElementById('turnstile-container');
    if (!TURNSTILE_SITE_KEY || !(window as any).turnstile || !container) {
      clearTimeout(timeout);
      return resolve(undefined);
    }
    (window as any).turnstile.ready(() => {
      (window as any).turnstile.execute('#turnstile-container', {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          clearTimeout(timeout);
          resolve(token);
        },
        'error-callback': () => {
          clearTimeout(timeout);
          resolve(undefined);
        },
      });
    });
  });
};

export const usePortfolioSession = () => {
  const { t, i18n } = useTranslation();
  const [sessionId, setSessionId] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [lead, setLead] = useState<LeadQualification>(emptyLead);
  const [adminStatus, setAdminStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [order, setOrder] = useState<{ id: string; status: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  
  const activeChallengeRequestsRef = useRef(0);
  const sendLockRef = useRef(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedSessionId = window.localStorage.getItem(storageKey);
        if (storedSessionId) {
          try {
            const state = await fetchSessionState(storedSessionId);
            setSessionId(state.sessionId);
            setChatMessages(state.messages);
            setLead(state.lead);
            setAdminStatus(state.adminStatus);
            if ((state as any).order) setOrder((state as any).order);
          } catch {
            window.localStorage.removeItem(storageKey);
            setSessionId('');
          }
        } else {
          setSessionId('');
        }
      } catch (error) {
        console.error('Session bootstrap error:', error);
      } finally {
        setIsBootstrapping(false);
      }
    };
    bootstrap();
  }, []);

  const handleSendMessage = async (content: string, images: string[] = [], options: { silent?: boolean } = {}) => {
    if (!options.silent && (isAnalyzing || sendLockRef.current)) return;
    if (!options.silent) {
      sendLockRef.current = true;
      setIsAnalyzing(true);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content, attachments: images },
        { role: 'model', content: '' }
      ]);
      activeChallengeRequestsRef.current += 1;
    }

    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const session = await createSession(await getTurnstileToken());
        activeSessionId = session.sessionId;
        window.localStorage.setItem(storageKey, activeSessionId);
        setSessionId(activeSessionId);
      }

      const response = await sendChatMessage({
        sessionId: activeSessionId,
        message: content,
        attachments: images,
        lang: i18n.language,
      });

      setLead(response.lead);
      setAdminStatus(response.adminStatus);
      if (response.order) setOrder(response.order);

      if (!options.silent) {
        setChatMessages(prev => {
          const next = [...prev];
          const lastEmpty = [...next].reverse().findIndex(m => m.role === 'model' && !m.content);
          if (lastEmpty !== -1) {
            next[next.length - 1 - lastEmpty] = response.message;
          } else {
            next.push(response.message);
          }
          return next;
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      if (!options.silent) {
        setChatMessages(prev => [...prev.slice(0, -1), { role: 'model', content: t('chat.error') }]);
        setAdminStatus('failed');
      }
    } finally {
      if (!options.silent) {
        activeChallengeRequestsRef.current = Math.max(0, activeChallengeRequestsRef.current - 1);
        const pending = activeChallengeRequestsRef.current > 0;
        setIsAnalyzing(pending);
        if (!pending) sendLockRef.current = false;
      }
    }
  };

  const handleResetSession = async () => {
    // Xóa ngay lập tức để tránh F5 quay lại hội thoại cũ
    window.localStorage.removeItem(storageKey);
    setSessionId('');
    setChatMessages([]);
    setLead(emptyLead);
    setAdminStatus('idle');
    setOrder(null);
    setIsAnalyzing(false);
  };

  return {
    sessionId,
    chatMessages,
    setChatMessages,
    lead,
    adminStatus,
    order,
    isAnalyzing,
    isBootstrapping,
    handleSendMessage,
    handleResetSession
  };
};
