import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingChat } from './components/FloatingChat';
import { FlappyBirdGame } from './components/FlappyBirdGame';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AdminPage } from './pages/AdminPage';
import { TrackingPage } from './pages/TrackingPage';

import { usePortfolioSession } from './lib/hooks/usePortfolioSession';
import { useProjects } from './lib/hooks/useProjects';

const App = () => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('All');
  const [challengeInput, setChallengeInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    chatMessages,
    setChatMessages,
    lead,
    adminStatus,
    order,
    isAnalyzing,
    isBootstrapping,
    handleSendMessage,
    handleResetSession
  } = usePortfolioSession();

  const {
    projects,
    isCMSLoading,
    projectAiInfo,
    loadingProjects,
    handleAiAnalysis
  } = useProjects();

  useEffect(() => {
    document.title = t('site_title');
  }, [i18n.language, t]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [challengeInput]);

  const handleFiles = async (files: File[]) => {
    const promises = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Read failed'));
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
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSendMessage = (forcedContent?: string, options: { silent?: boolean } = {}) => {
    const content = forcedContent || challengeInput.trim() || (attachedImages.length > 0 ? t('chat.image_attachment_label') : '');
    if (!content && !options.silent) return;

    handleSendMessage(content, attachedImages, options);
    if (!forcedContent) setChallengeInput('');
    setAttachedImages([]);
  };

  const scrollToChat = () => {
    const chatSection = document.getElementById('challenge');
    chatSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/30 font-sans">
        <Header />
        <Routes>
          <Route path="/" element={
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
              handleSendMessage={onSendMessage}
              textareaRef={textareaRef}
              lead={lead}
              adminStatus={adminStatus}
              onResetSession={handleResetSession}
              onChatVisibilityChange={setIsChatVisible}
              onOpenGame={() => setIsGameOpen(true)}
              onFilesAttached={handleFiles}
              order={order}
            />
          } />

          <Route path="/projects" element={
            <ProjectsPage
              projects={projects}
              filter={filter}
              setFilter={setFilter}
              onAiAnalysis={handleAiAnalysis}
              loadingProjects={loadingProjects}
              projectAiInfo={projectAiInfo}
            />
          } />

          <Route path="/projects/:slug" element={<ProjectDetailPage projects={projects} isLoading={isCMSLoading} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/tracking/:ticket" element={<TrackingPage />} />
        </Routes>

        <FloatingChat
          messages={chatMessages}
          isAnalyzing={isAnalyzing}
          isVisible={!isChatVisible && chatMessages.length > 0}
          inputValue={challengeInput}
          setInputValue={setChallengeInput}
          onSend={onSendMessage}
          onScrollToMain={scrollToChat}
          onFilesAttached={handleFiles}
        />

        {isGameOpen && (
          <ErrorBoundary fallback={<div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">...</div>}>
            <FlappyBirdGame
              onClose={() => setIsGameOpen(false)}
              onRedeem={(score, discount, voucherCode) => {
                setIsGameOpen(false);
                const userMsg = t('game.redeem_msg', { score, discount, voucherCode });
                setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }, { role: 'model', content: t('game.system_redeem_success') }]);
                onSendMessage(userMsg, { silent: true });
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
