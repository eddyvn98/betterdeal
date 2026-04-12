import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Project, Message, LeadQualification } from './types';
import { projects } from './data/projects';
import { ai, getSystemPrompt } from './services/gemini';
import { createSession, fetchSessionState, sendChatMessage } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { FeaturedProjects } from './components/FeaturedProjects';
import { Capabilities } from './components/Capabilities';
import { ChatSection } from './components/ChatSection';
import { ProjectModal } from './components/ProjectModal';
import { FloatingChat } from './components/FloatingChat';
import { ProjectsPage } from './pages/ProjectsPage';
import { HomePage } from './pages/HomePage';

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
};

const storageKey = 'emdash-portfolio-session-id';

const App = () => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
  const [isChatVisible, setIsChatVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generateAiContent = async (
    prompt: string,
    type: 'challenge' | 'stack',
    projectId: number | null = null,
  ) => {
    if (!prompt) return;

    if (type === 'challenge') {
      setIsAnalyzing(true);
    } else if (projectId !== null) {
      setLoadingProjects((prev) => new Set(prev).add(projectId));
    }

    const startTime = Date.now();

    try {
      if (type === 'challenge') {
        if (!sessionId) {
          throw new Error('Missing session id');
        }

        const response = await sendChatMessage({
          sessionId,
          message: prompt,
          attachments: attachedImages,
        });

        // Add a small delay if the response is too fast to prevent flickering
        const elapsed = Date.now() - startTime;
        if (elapsed < 400) {
          await new Promise(resolve => setTimeout(resolve, 400 - elapsed));
        }

        setChatMessages((prev) => [...prev, response.message]);
        setLead(response.lead);
        setAdminStatus(response.adminStatus);
        setAttachedImages([]);
      } else if (projectId !== null) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: getSystemPrompt('stack'),
          },
        });

        setProjectAiInfo((prev) => ({
          ...prev,
          [projectId]: response.text || 'Chưa có phản hồi từ AI.',
        }));
      }
    } catch (error) {
      console.error('AI Error:', error);

      if (type === 'challenge') {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: 'Xin lỗi, hệ thống đang bận. Bạn để lại số điện thoại, Zalo hoặc Telegram để admin liên hệ trực tiếp.',
          },
        ]);
        setAdminStatus('failed');
      }
    } finally {
      if (type === 'challenge') setIsAnalyzing(false);
      if (projectId !== null) {
        setLoadingProjects((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      }
    }
  };
  
  const handleSendMessage = () => {
    if ((!challengeInput.trim() && attachedImages.length === 0) || isBootstrapping) return;

    const content = challengeInput.trim() || 'Khách gửi thêm ảnh tham khảo.';
    
    requestAnimationFrame(() => {
      setChatMessages((prev) => [...prev, { role: 'user', content }]);
      setChallengeInput('');
    });

    generateAiContent(content, 'challenge');
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
                setSelectedProject={setSelectedProject}
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
                onSelect={setSelectedProject}
                onAiAnalysis={handleAiAnalysis}
                loadingProjects={loadingProjects}
                projectAiInfo={projectAiInfo}
              />
            }
          />
        </Routes>

        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          loading={selectedProject ? loadingProjects.has(selectedProject.id) : false}
          aiInfo={selectedProject ? projectAiInfo[selectedProject.id] : undefined}
        />

        <FloatingChat
          messages={chatMessages}
          isAnalyzing={isAnalyzing}
          isVisible={!isChatVisible && chatMessages.length > 0}
          inputValue={challengeInput}
          setInputValue={setChallengeInput}
          onSend={handleSendMessage}
          onScrollToMain={scrollToChat}
        />

        <Footer />
      </div>
    </Router>
  );
};

export default App;
