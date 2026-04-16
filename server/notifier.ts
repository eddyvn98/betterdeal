import crypto from 'node:crypto';
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
        text: escapeTelegram(text + '\n\n💡 Mẹo: Mở bằng Chrome/Safari để có trải nghiệm tốt nhất.'),
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📜 Mở Hồ Sơ Triển Khai',
                url: `${process.env.APP_URL}/admin?auth=${crypto.createHmac('sha256', process.env.ADMIN_SECRET || 'fallback').update(sessionId).digest('hex')}&sessionId=${sessionId}`
              }
            ]
          ]
        }
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

/**
 * Cấu hình nút Menu (Menu Button) cho Bot Telegram
 * Giúp Admin có nút truy cập nhanh vào Dashboard tổng
 */
export const setupBotMenu = async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminSecret = process.env.ADMIN_SECRET;
  const appUrl = process.env.APP_URL;

  if (!token || !adminSecret || !appUrl) {
    console.warn('[TELEGRAM] Thiếu cấu hình để setup nút Menu Bot.');
    return;
  }

  const masterToken = crypto.createHmac('sha256', adminSecret).update('MASTER_ADMIN').digest('hex');
  const dashboardUrl = `${appUrl}/admin?auth=${masterToken}`;

  try {
    // Cài đặt Menu Button của bot để mở link Dashboard
    const response = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'default' // Chuyển về mặc định để hiện nút Menu thường/Commands
        }
      })
    });

    // Thiết lập lệnh /admin cho bot
    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'admin', description: 'Lấy link truy cập Admin Dashboard tổng' }
        ]
      })
    });

    const result = await response.json();
    if (result.ok) {
      console.log('[TELEGRAM] Đã chuyển Menu Bot sang chế độ Commands thành công.');
      
      // Gửi một tin nhắn hướng dẫn cho Admin vào chat (nếu chat_id có sẵn)
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (chatId) {
         await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             chat_id: chatId,
             text: `👋 Chào Admin! Để truy cập Dashboard Quản trị một cách tốt nhất, anh hãy sử dụng link sau và mở bằng *Chrome* hoặc *Safari* trên điện thoại:\n\n🔗 [Mở Admin Dashboard Tổng](${dashboardUrl})\n\n_Anh có thể ghim tin nhắn này để truy cập bất cứ lúc nào!_`,
             parse_mode: 'Markdown'
           })
         });
      }
    } else {
      console.warn('[TELEGRAM] Không thể set Menu Button:', result.description);
    }
  } catch (err) {
    console.error('[TELEGRAM] Lỗi khi cài đặt Menu Bot:', err);
  }
};
