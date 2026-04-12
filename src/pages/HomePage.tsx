import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { Capabilities } from '../components/Capabilities';
import { FeaturedProjects } from '../components/FeaturedProjects';
import { ChatSection } from '../components/ChatSection';
import { Project, Message, LeadQualification } from '../types';

interface HomePageProps {
  projects: Project[];
  setSelectedProject: (project: Project) => void;
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
}

export const HomePage = ({
  projects,
  setSelectedProject,
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
}: HomePageProps) => (
  <>
    <HeroSection />
    <Capabilities />
    <FeaturedProjects
      projects={projects}
      onSelect={setSelectedProject}
      onAiAnalysis={handleAiAnalysis}
      loadingProjects={loadingProjects}
      projectAiInfo={projectAiInfo}
    />
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
    />
  </>
);
