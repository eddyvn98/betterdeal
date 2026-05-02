import { LeadQualification } from '../../src/types/index.ts';

const OPTION_QUOTE_MAP: Array<{ pattern: RegExp; amount: number; label: string }> = [
  { pattern: /\b(option\s*1|opt\s*1|lite|gói\s*1)\b/i, amount: 7000000, label: 'Option 1 (Lite)' },
  { pattern: /\b(option\s*2|opt\s*2|standard|gói\s*2)\b/i, amount: 12000000, label: 'Option 2 (Standard)' },
  { pattern: /\b(option\s*3|opt\s*3|elite|gói\s*3)\b/i, amount: 40000000, label: 'Option 3 (Elite)' },
];

const detectSelectedOption = (text: string) => OPTION_QUOTE_MAP.find((item) => item.pattern.test(text));

const USD_TO_VND_RATE = 26500;

export const parseNumericAmount = (raw: string): number => {
  const cleaned = String(raw || '').replace(/[^0-9.,]/g, '');
  if (!cleaned) return 0;

  const normalized = cleaned.includes('.') && cleaned.includes(',')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(/,/g, '.');

  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

export const parseAmountFromText = (text: string): number => {
  const normalizedText = String(text || '');
  if (!normalizedText.trim()) return 0;

  const containsUsd = /\$|\busd\b/i.test(normalizedText);
  const amount = parseNumericAmount(normalizedText);
  if (amount <= 0) return 0;

  if (containsUsd) return Math.round(amount * USD_TO_VND_RATE);
  return Math.round(amount);
};

export const inferLeadForClosing = (lead: LeadQualification, userMessage: string): LeadQualification => {
  const option = detectSelectedOption(userMessage);
  const hasContact = Boolean(lead.contactValue || lead.contactName);

  if (!option || !hasContact) return lead;

  if (!lead.estimatedQuote || String(lead.estimatedQuote).trim() === '') {
    lead.estimatedQuote = `${option.amount.toLocaleString('vi-VN')} VND`;
  }

  lead.readyToHandoff = true;
  if (lead.dealStage === 'discovery' || lead.dealStage === 'qualified') {
    lead.dealStage = 'quoted';
  }
  if (!lead.projectSummary || String(lead.projectSummary).trim() === '') {
    lead.projectSummary = `Khách đã chọn ${option.label} và để lại thông tin liên hệ`;
  }
  if (!lead.adminSummary || String(lead.adminSummary).trim() === '') {
    lead.adminSummary = `Khách chọn ${option.label}. Cần liên hệ ngay để xác nhận triển khai và đặt cọc.`;
  }

  return lead;
};

export const parseOrderAmount = (estimatedQuote: string, userMessage: string, budget: string): number => {
  const selected = detectSelectedOption(userMessage) || detectSelectedOption(estimatedQuote || '');
  if (selected) return selected.amount;

  const quoteAmount = parseAmountFromText(estimatedQuote);
  if (quoteAmount >= 100000) return quoteAmount;

  const messageAmount = parseAmountFromText(userMessage);
  if (messageAmount >= 100000) return messageAmount;

  const budgetAmount = parseAmountFromText(budget);
  return budgetAmount >= 100000 ? budgetAmount : 0;
};
