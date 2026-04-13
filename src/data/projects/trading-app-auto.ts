import { Project } from '../../types';

export const tradingAppAuto: Project = {
  id: 21,
  slug: 'trading-app-auto',
  title: 'AutoTrade: Quantitative Engine',
  titleEn: 'AutoTrade: Quantitative Engine',
  category: 'Trading',
  stack: ['C#', '.NET', 'Quant Logic', 'Automation'],
  stars: 0,
  image: '/mockups/autotrade-quant.webp',
  description: 'Hệ thống giao dịch tự động hóa quy trình quản lý rủi ro và thực thi lệnh chính xác.',
  descriptionEn: 'An automated trading system for precise risk management and order execution.',
  longDescription:
    'AutoTrade là giải pháp giúp nhà đầu tư loại bỏ yếu tố cảm xúc trong giao dịch. Tôi tập trung vào việc tạo ra một hệ thống vận hành bền bỉ, mang lại sự an tâm tuyệt đối cho người dùng thông qua các cơ chế kiểm soát rủi ro chặt chẽ và giao diện báo cáo minh bạch.',
  longDescriptionEn:
    'AutoTrade helps investors eliminate emotional bias in trading. I focused on creating a resilient operational system, providing absolute peace of mind through strict risk control mechanisms and transparent reporting interfaces.',
  challenge:
    'Đảm bảo hệ thống có thể phản ứng tức thì với các biến động cực mạnh của thị trường mà không gặp lỗi logic hay trễ lệnh (slippage) vượt mức cho phép.',
  challengeEn:
    'Ensuring the system responds instantly to extreme market volatility without logic errors or excessive order slippage.',
  solution:
    'Xây dựng core xử lý bằng .NET tối ưu hóa hiệu năng cao. Triển khai các lớp bảo vệ đa tầng (Fail-safe) để tự động ngắt kết nối hoặc bảo toàn vốn khi điều kiện thị trường không thuận lợi.',
  solutionEn:
    'Built a high-performance core using optimized .NET. Implemented multi-layer fail-safe protections to automatically disconnect or preserve capital during unfavorable market conditions.',
  results:
    'Giúp người dùng tối ưu hóa lợi nhuận một cách bền vững dựa trên kỷ luật thép của thuật toán, mang lại sự cân bằng giữa cuộc sống và công việc đầu tư.',
  resultsEn:
    'Helped users optimize returns sustainably based on strict algorithmic discipline, providing balance between personal life and investment work.',
  year: '2026',
};
