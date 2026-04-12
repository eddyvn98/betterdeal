import { LeadQualification, Message } from '../src/types';

const escapeTelegram = (value: string) => value.replace(/[_*\[\]()~\x60>#+\-=|{}.!]/g, '\\$&');

const buildLeadText = (lead: LeadQualification, transcript: Message[], sessionId: string) => {
  const lines = [
    '🔔 *Lead mới từ Portfolio*',
    '--------------------------',
    'ID: ' + sessionId,
    'Tóm tắt: ' + (lead.projectSummary || 'Chưa rõ'),
    'Loại dự án: ' + (lead.projectType || 'Chưa rõ'),
    'Báo giá dự kiến: ' + (lead.estimatedQuote || 'Chưa rõ'),
    'Demo: ' + (lead.demoTimeline || 'Chưa rõ'),
    'Hoàn thành: ' + (lead.deliveryTimeline || 'Chưa rõ'),
    'Ngân sách: ' + (lead.budget || 'Chưa rõ'),
    'Liên hệ: ' + ([lead.contactName, lead.contactChannel, lead.contactValue].filter(Boolean).join(' • ') || 'Chưa có'),
    'Tóm tắt admin: ' + (lead.adminSummary || 'Chưa có'),
    'Tin nhắn gần nhất: ' + (transcript.at(-1)?.content || 'Không có'),
  ];

  return lines.join('\n');
};

export const notifyAdmin = async (sessionId: string, lead: LeadQualification, transcript: Message[]) => {
  const text = buildLeadText(lead, transcript, sessionId);
  console.log('\n--- ADMIN NOTIFICATION ---\n' + text + '\n--------------------------\n');

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const zaloWebhookUrl = process.env.ZALO_WEBHOOK_URL;

  let reported = false;

  if (telegramBotToken && telegramChatId) {
    const telegramResponse = await fetch('https://api.telegram.org/bot' + telegramBotToken + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: escapeTelegram(text),
        parse_mode: 'MarkdownV2',
      }),
    });

    if (telegramResponse.ok) {
      reported = true;
    } else {
      console.error('Telegram notify failed:', telegramResponse.status);
    }
  }

  if (zaloWebhookUrl) {
    const zaloResponse = await fetch(zaloWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'portfolio-chat', sessionId, lead, transcript, text }),
    });

    if (zaloResponse.ok) {
      reported = true;
    } else {
      console.error('Zalo relay failed:', zaloResponse.status);
    }
  }

  // If no external notification worked, we still count it as success in local testing
  // if console log was successful.
  if (!reported) {
    console.log('Note: No Telegram/Zalo configured. Notification logged to console only.');
  }
};
