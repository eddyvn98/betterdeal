import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Project, Message, LeadQualification } from './types';
import { projects as staticProjects } from './data/projects';
import { fetchCMSProjects } from './services/cms';
import { ai, getSystemPrompt } from './services/gemini';
import { createSession, fetchSessionState, sendChatMessage } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { FeaturedProjects } from './components/FeaturedProjects';
import { Capabilities } from './components/Capabilities';
import { ChatSection } from './components/ChatSection';
import { useTranslation } from 'react-i18next';
import { FloatingChat } from './components/FloatingChat';
import { FlappyBirdGame } from './components/FlappyBirdGame';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { TrackingPage } from './pages/TrackingPage';

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

const storageKey = 'Emdash-portfolio-session-id';

const App = () => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [challengeInput, setChallengeInput] = useState('');
  const [projectAiInfo, setProjectAiInfo] = useState<Record<number, string>>({});
  const [loadingProjects, setLoadingProjects] = useState<Set<number>>(new Set());
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [lead, setLead] = useState<LeadQualification>(emptyLead);
  const [adminStatus, setAdminStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [sessionId, setSessionId] = useState('');
  const [order, setOrder] = useState<{ id: string; status: string } | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(staticProjects);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeChallengeRequestsRef = useRef(0);
  const sendLockRef = useRef(false);

  useEffect(() => {
    document.title = t('site_title');
  }, [i18n.language, t]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [challengeInput]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedSessionId = window.localStorage.getItem(storageKey);

        if (storedSessionId) {
          try {
            const sessionState = await fetchSessionState(storedSessionId);
            setSessionId(sessionState.sessionId);
            setChatMessages(sessionState.messages);
            setLead(sessionState.lead);
            setAdminStatus(sessionState.adminStatus);
            if ((sessionState as any).order) setOrder((sessionState as any).order);
          } catch (error) {
            console.warn('Invalid session, creating new one:', error);
            const session = await createSession();
            window.localStorage.setItem(storageKey, session.sessionId);
            setSessionId(session.sessionId);
          }
        } else {
          const session = await createSession();
          window.localStorage.setItem(storageKey, session.sessionId);
          setSessionId(session.sessionId);
        }
      } catch (error) {
        console.error('Session bootstrap error:', error);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();

    // Fetch dynamic projects from CMS
    const loadCMSProjects = async () => {
      try {
        const cmsData = await fetchCMSProjects();
        if (cmsData && cmsData.length > 0) {
          const mappedProjects: Project[] = cmsData.map((p, index) => ({
            id: 1000 + index, // Generate numerical IDs for CMS projects to avoid collisions
            slug: p.slug || p.id,
            title: p.data?.title || 'Untitled',
            category: p.taxonomies?.category?.[0] || 'Uncategorized',
            stack: p.taxonomies?.tag || [],
            stars: 0,
            image: p.data?.featured_image || '',
            description: p.data?.summary || '',
            longDescription: p.data?.summary || '',
            liveUrl: p.data?.url,
            year: p.data?.year,
            featured: true, // Auto-feature CMS items
          }));
          
          setProjects((prev) => {
            // Merge CMS projects uniquely
            const existingNames = new Set(prev.map(pr => pr.title));
            const newFiltered = mappedProjects.filter(mp => !existingNames.has(mp.title));
            return [...newFiltered, ...prev];
          });
        }
      } catch (error) {
        console.error('Failed to load CMS projects:', error);
      }
    };

    loadCMSProjects();
  }, []);

  const handleFiles = async (files: File[]) => {
    const promises = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as data URL'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(promises);
      setAttachedImages((prev) => [...prev, ...results]);
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generateAiContent = async (
    prompt: string,
    type: 'challenge' | 'stack',
    projectId: number | null = null,
    options: { silent?: boolean } = {}
  ) => {
    if (!prompt) return;

    if (type === 'challenge') {
      if (!options.silent) {
        activeChallengeRequestsRef.current += 1;
      }
    } else if (projectId !== null) {
      setLoadingProjects((prev) => new Set(prev).add(projectId));
    }

    try {
      if (type === 'challenge') {
        if (!sessionId) {
          throw new Error('Missing session id');
        }

        const response = await sendChatMessage({
          sessionId,
          message: prompt,
          attachments: attachedImages,
          lang: i18n.language,
        });

        // If silent, just update lead data and don't touch chat messages
        if (options.silent) {
          setLead(response.lead);
          setAdminStatus(response.adminStatus);
          if (response.order) setOrder(response.order);
          return;
        }

        // Replace the optimistic placeholder bubble with the real response
        setChatMessages((prev) => {
          const placeholderIndex = [...prev]
            .map((msg, idx) => ({ msg, idx }))
            .reverse()
            .find(({ msg }) => msg.role === 'model' && (!msg.content || msg.content.trim() === ''))
            ?.idx;

          if (placeholderIndex === undefined) {
            return [...prev, response.message];
          }

          const next = [...prev];
          next[placeholderIndex] = response.message;
          return next;
        });
        setLead(response.lead);
        setAdminStatus(response.adminStatus);
        if (response.order) setOrder(response.order);
        setAttachedImages([]);
      } else if (projectId !== null) {
        const response = await ai.models.generateContent({
          model: 'gemma-4-26b-a4b-it',
          contents: prompt,
          config: {
            systemInstruction: getSystemPrompt('stack', i18n.language),
          },
        });

        setProjectAiInfo((prev) => ({
          ...prev,
          [projectId]: response.text || t('chat.no_ai_response'),
        }));
      }
    } catch (error) {
      console.error('AI Error:', error);

      if (type === 'challenge' && !options.silent) {
        // Replace the optimistic placeholder with the error message
        setChatMessages((prev) => {
          const placeholderIndex = [...prev]
            .map((msg, idx) => ({ msg, idx }))
            .reverse()
            .find(({ msg }) => msg.role === 'model' && (!msg.content || msg.content.trim() === ''))
            ?.idx;

          const errorMessage: Message = {
            role: 'model',
            content: t('chat.error'),
          };

          if (placeholderIndex === undefined) {
            return [...prev, errorMessage];
          }

          const next = [...prev];
          next[placeholderIndex] = errorMessage;
          return next;
        });
        setAdminStatus('failed');
      } else if (type === 'challenge' && options.silent) {
        console.warn('Silent voucher sync failed. User may need to manually confirm later.');
      }
    } finally {
      if (type === 'challenge' && !options.silent) {
        activeChallengeRequestsRef.current = Math.max(0, activeChallengeRequestsRef.current - 1);
        const hasPending = activeChallengeRequestsRef.current > 0;
        setIsAnalyzing(hasPending);
        if (!hasPending) {
          sendLockRef.current = false;
        }
      }
      if (projectId !== null) {
        setLoadingProjects((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      }
    }
  };

  const handleSendMessage = (forcedContent?: string, options: { silent?: boolean } = {}) => {
    const isForced = typeof forcedContent === 'string' && forcedContent.length > 0;
    if (!options.silent && (isAnalyzing || sendLockRef.current)) return;
    if (!isForced && (!challengeInput.trim() && attachedImages.length === 0) || isBootstrapping) return;

    const content = isForced ? forcedContent : (challengeInput.trim() || t('chat.image_attachment_label'));

    // 1. Update state (React 18+ will batch these automatically)
    if (!options.silent) {
      sendLockRef.current = true;
      setChatMessages((prev) => [
        ...prev,
        { role: 'user', content, attachments: attachedImages },
        { role: 'model', content: '' },
      ]);
      setIsAnalyzing(true);
    }

    if (!isForced) {
      setChallengeInput('');
    }
    setAttachedImages([]);

    // 2. Execute AI call
    generateAiContent(content, 'challenge', null, options);
  };

  const handleResetSession = async () => {
    setIsAnalyzing(true);
    try {
      const session = await createSession();
      window.localStorage.setItem(storageKey, session.sessionId);
      setSessionId(session.sessionId);
      setChatMessages([]);
      setLead(emptyLead);
      setAdminStatus('idle');
      setOrder(null);
      setAttachedImages([]);
      setChallengeInput('');
    } catch (error) {
      console.error('Reset session error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAiAnalysis = (project: Project) => {
    generateAiContent(`Dự án: ${project.title}, loại: ${project.category}`, 'stack', project.id);
  };

  const scrollToChat = () => {
    const chatSection = document.getElementById('challenge');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/30 font-sans">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                projects={projects}
                handleAiAnalysis={handleAiAnalysis}
                loadingProjects={loadingProjects}
                projectAiInfo={projectAiInfo}
                chatMessages={chatMessages}
                isAnalyzing={isAnalyzing || isBootstrapping}
                challengeInput={challengeInput}
                setChallengeInput={setChallengeInput}
                attachedImages={attachedImages}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                handleSendMessage={handleSendMessage}
                textareaRef={textareaRef}
                lead={lead}
                adminStatus={adminStatus}
                onResetSession={handleResetSession}
                onChatVisibilityChange={setIsChatVisible}
                onOpenGame={() => setIsGameOpen(true)}
                onFilesAttached={handleFiles}
                order={order}
              />
            }
          />

          <Route
            path="/projects"
            element={
              <ProjectsPage
                projects={projects}
                filter={filter}
                setFilter={setFilter}
                onAiAnalysis={handleAiAnalysis}
                loadingProjects={loadingProjects}
                projectAiInfo={projectAiInfo}
              />
            }
          />

          <Route
            path="/projects/:slug"
            element={<ProjectDetailPage projects={projects} />}
          />

          <Route
            path="/admin"
            element={<AdminPage />}
          />

          <Route
            path="/tracking/:ticket"
            element={<TrackingPage />}
          />
        </Routes>

        <FloatingChat
          messages={chatMessages}
          isAnalyzing={isAnalyzing}
          isVisible={!isChatVisible && chatMessages.length > 0}
          inputValue={challengeInput}
          setInputValue={setChallengeInput}
          onSend={handleSendMessage}
          onScrollToMain={scrollToChat}
          onFilesAttached={handleFiles}
        />

        {isGameOpen && (
          <ErrorBoundary
            fallback={
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
                <div className="text-center p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-sm">
                  <h2 className="text-2xl font-bold text-rose-500 mb-4">Game Error</h2>
                  <p className="text-slate-400 mb-6 text-sm">Trình duyệt của bạn có thể không hỗ trợ tính năng đồ họa này hoặc có lỗi xảy ra.</p>
                  <button onClick={() => setIsGameOpen(false)} className="bg-emerald-600 px-6 py-3 rounded-xl font-bold text-white">Quay lại Chat</button>
                </div>
              </div>
            }
          >
            <FlappyBirdGame
              onClose={() => setIsGameOpen(false)}
              onRedeem={(score, discount, voucherCode) => {
                setIsGameOpen(false);

                // 1. Construct messages
                const userMsg = t('game.redeem_msg', { score, discount, voucherCode });
                const systemConfirmation = t('game.system_redeem_success');

                // 2. Instant UI update with hardcoded bubbles (No AI wait)
                setChatMessages((prev) => [
                  ...prev,
                  { role: 'user', content: userMsg },
                  { role: 'model', content: systemConfirmation }
                ]);

                // 3. Silent background sync to update Lead state on server
                handleSendMessage(userMsg, { silent: true });
                scrollToChat();
              }}
            />
          </ErrorBoundary>
        )}

        <Footer />
      </div>
    </Router>
  );
};

export default App;

