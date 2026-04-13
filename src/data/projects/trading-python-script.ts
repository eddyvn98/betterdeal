import { Project } from '../../types';

export const tradingPythonScript: Project = {
  id: 20,
  slug: 'trading-python-script',
  title: 'ScriptTrade: Custom Finance Logic',
  titleEn: 'ScriptTrade: Custom Finance Logic',
  category: 'Trading',
  stack: ['Python', 'Pandas', 'Technical Analysis', 'Financial Automation'],
  stars: 0,
  image: '/mockups/scripttrade-python.webp',
  description: 'Bộ công cụ phân tích kỹ thuật và tự động hóa chiến lược giao dịch tùy biến cao.',
  descriptionEn: 'A toolkit for technical analysis and highly customizable trading strategy automation.',
  longDescription:
    'ScriptTrade được thiết kế dành cho những nhà giao dịch muốn tự tay cụ thể hóa ý tưởng của mình thành các kịch bản tự động. Tôi tập trung vào tính linh hoạt và khả năng tùy biến cao, giúp người dùng dễ dàng thử nghiệm các chiến lược mới một cách an toàn và nhanh chóng.',
  longDescriptionEn:
    'ScriptTrade is designed for traders who want to turn their ideas into automated scenarios. I focused on flexibility and high customizability, allowing users to safely and quickly test new strategies.',
  challenge:
    'Cung cấp một kiến trúc script đủ đơn giản để người dùng có thể tùy biến nhưng vẫn phải cực kỳ mạnh mẽ để xử lý các tính toán tài chính phức tạp và chính xác.',
  challengeEn:
    'Providing a script architecture simple enough for user customization yet powerful enough to handle complex, precise financial calculations.',
  solution:
    'Tận dụng sức mạnh của thư viện Pandas trong Python để xử lý dữ liệu lớn. Thiết kế hệ thống log chi tiết và báo cáo trực quan giúp người dùng dễ dàng theo dõi và tinh chỉnh chiến lược của mình.',
  solutionEn:
    'Leveraged Python\'s Pandas for big data processing. Designed detailed logging and visual reporting systems to help users easily track and refine their strategies.',
  results:
    'Nâng cao năng suất và độ chính xác cho nhà đầu tư cá nhân, giúp họ tiếp cận với những phương pháp giao dịch định lượng hiện đại một cách dễ dàng nhất.',
  resultsEn:
    'Enhanced productivity and precision for individual investors, providing the easiest access to modern quantitative trading methods.',
  year: '2026',
};
