export interface Project {
  id: number;
  slug: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  stack: string[];
  stars: number;
  image: string;
  description: string;
  descriptionEn?: string;
  longDescription: string;
  longDescriptionEn?: string;
  challenge?: string;
  challengeEn?: string;
  solution?: string;
  solutionEn?: string;
  results?: string;
  resultsEn?: string;
  repoUrl?: string;
  liveUrl?: string;
  year?: string;
  featured?: boolean;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  attachments?: string[];
}

export interface ChatSession {
  sessionId: string;
}

export interface LeadQualification {
  projectSummary: string;
  projectType: string;
  goals: string[];
  requiredFeatures: string[];
  targetUsers: string;
  platforms: string[];
  references: string[];
  budget: string;
  estimatedQuote: string;
  demoTimeline: string;
  deliveryTimeline: string;
  contactName: string;
  contactChannel: string;
  contactValue: string;
  missingInfo: string[];
  nextQuestions: string[];
  confidence: 'low' | 'medium' | 'high';
  dealStage: 'discovery' | 'qualified' | 'quoted' | 'won';
  readyToHandoff: boolean;
  adminSummary: string;
  redeemedVoucherCode?: string;
  appliedDiscount?: number;
}

export interface ChallengeAIResponse {
  reply: string;
  lead: LeadQualification;
}

export interface ChatApiResponse {
  sessionId: string;
  message: Message;
  lead: LeadQualification;
  adminStatus: 'idle' | 'sending' | 'sent' | 'failed';
}
