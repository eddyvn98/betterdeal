export interface Project {
  id: number;
  title: string;
  category: string;
  stack: string[];
  stars: number;
  image: string;
  description: string;
  longDescription: string;
  repoUrl?: string;
  liveUrl?: string;
  year?: string;
  featured?: boolean;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
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
