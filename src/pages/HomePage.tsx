import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { Capabilities } from '../components/Capabilities';
import { FeaturedProjects } from '../components/FeaturedProjects';
import { FAQSection } from '../components/FAQSection';
import { ChatSection } from '../components/ChatSection';
import { Project, Message, LeadQualification } from '../types';

interface HomePageProps {
  projects: Project[];
  handleAiAnalysis: (project: Project) => void;
  loadingProjects: Set<number>;
  projectAiInfo: Record<number, string>;
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
  onChatVisibilityChange: (inView: boolean) => void;
  onOpenGame: () => void;
  onFilesAttached: (files: File[]) => void;
}

export const HomePage = ({
  projects,
  handleAiAnalysis,
  loadingProjects,
  projectAiInfo,
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
  onChatVisibilityChange,
  onOpenGame,
  onFilesAttached,
}: HomePageProps) => (
  <main>
    <HeroSection />
    <Capabilities />
    <FeaturedProjects
      projects={projects}
      onAiAnalysis={handleAiAnalysis}
      loadingProjects={loadingProjects}
      projectAiInfo={projectAiInfo}
    />
    <FAQSection />
    <ChatSection
      chatMessages={chatMessages}
      isAnalyzing={isAnalyzing}
      challengeInput={challengeInput}
      setChallengeInput={setChallengeInput}
      attachedImages={attachedImages}
      handleImageUpload={handleImageUpload}
      removeImage={removeImage}
      handleSendMessage={handleSendMessage}
      textareaRef={textareaRef}
      lead={lead}
      adminStatus={adminStatus}
      onResetSession={onResetSession}
      onVisibilityChange={onChatVisibilityChange}
      onOpenGame={onOpenGame}
      onFilesAttached={onFilesAttached}
    />
  </main>
);
