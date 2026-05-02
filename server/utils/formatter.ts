import { LeadQualification } from '../../src/types';

/**
 * Chuyển đổi Lead sang định dạng Markdown chuẩn Microsoft MarkItDown style
 * Tối ưu cho AI đọc hiểu và Admin xem hồ sơ triển khai.
 */
export const leadToMarkdown = (lead: LeadQualification, sessionId: string): string => {
  const now = new Date().toLocaleString('vi-VN');
  
  return `# HỒ SƠ TRIỂN KHAI DỰ ÁN: ${lead.projectSummary || 'DỰ ÁN MỚI'}
> **Mã phiên chat:** \`${sessionId}\` | **Cập nhật:** ${now}

## 📊 THÔNG TIN CƠ BẢN
| Hạng mục | Chi tiết |
| :--- | :--- |
| **Khách hàng** | ${lead.contactName || 'Chưa cung cấp'} |
| **Liên hệ** | ${lead.contactValue || 'Chưa có'} (${lead.contactChannel || 'N/A'}) |
| **Loại hình** | ${lead.projectType || 'Chưa rõ'} |
| **Trạng thái Deal** | ${lead.dealStage.toUpperCase()} |
| **Độ tin cậy** | ${lead.confidence.toUpperCase()} |
| **Voucher** | ${lead.redeemedVoucherCode || 'Không'} (Giảm ${lead.appliedDiscount}%) |

## 🛠 ĐẶC TẢ KỸ THUẬT & YÊU CẦU
### 1. Mục tiêu dự án
${lead.goals.map(g => `- ${g}`).join('\n') || '*Chưa có thông tin cụ thể*'}

### 2. Tính năng bắt buộc (Core Features)
${lead.requiredFeatures.map(f => `- **${f}**`).join('\n') || '*Chưa có thông tin cụ thể*'}

### 3. Nền tảng triển khai (Platforms)
${lead.platforms.map(p => `- ${p}`).join('\n') || '*Chưa rõ*'}

### 4. Tài liệu tham khảo (References)
${lead.references.map(r => `- ${r}`).join('\n') || '*Không có*'}

## 💰 KẾ HOẠCH TÀI CHÍNH & TIẾN ĐỘ
- **Ngân sách dự kiến:** \`${lead.budget || 'Thỏa thuận'}\`
- **Báo giá đã tư vấn:** **${lead.estimatedQuote || 'Chưa báo giá'}**
- **Thời hạn Demo:** ${lead.demoTimeline || 'Chưa rõ'}
- **Thời hạn hoàn thành:** ${lead.deliveryTimeline || 'Càng sớm càng tốt'}

## 🧠 TÓM TẮT TRIỂN KHAI (AI ANALYSIS)
> ${lead.adminSummary || 'AI chưa tạo tóm tắt cụ thể cho hồ sơ này. Admin có thể xem lịch sử chat để nắm bắt thêm.'}

---
*Hồ sơ này được tự động hóa bởi PixelPro AI theo tiêu chuẩn Microsoft MarkItDown.*
`;
};
