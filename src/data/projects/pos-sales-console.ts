import { Project } from '../../types';

export const posSalesConsole: Project = {
  id: 6,
  slug: 'pos-sales-console',
  title: 'Pragmatic Retail: High-Efficiency POS',
  titleEn: 'Pragmatic Retail: High-Efficiency POS',
  category: 'Commerce',
  categoryEn: 'Commerce',
  stack: ['JavaScript', 'IndexedDB', 'Service Workers', 'Retail UX'],
  stars: 0,
  image: '/mockups/posweb-sales-console.webp',
  description: 'Hệ thống bán hàng tập trung vào sự liền mạch trong thao tác của nhân viên và niềm tin của khách hàng.',
  descriptionEn: 'A sales system focusing on staff workflow continuity and customer trust.',
  longDescription:
    'Pragmatic Retail được tạo ra để đồng hành cùng những người bán hàng tại quầy. Trong những giờ cao điểm, tôi tin rằng công nghệ phải là người trợ lý thầm lặng nhất — không bao giờ "treo", không bao giờ "chậm". Giao diện được thiết kế để mỗi giây nhân viên tiết kiệm được là một giây khách hàng cảm thấy hạnh phúc và hài lòng hơn.',
  longDescriptionEn:
    'Pragmatic Retail was created to accompany retail staff. During peak hours, I believe technology must be the silent assistant—never lagging, never freezing. The interface was designed so that every second a staff member saves is a second the customer feel happier and more satisfied.',
  challenge:
    'Đảm bảo hệ thống vận hành liên tục 24/7 ngay cả khi mất kết nối mạng, đồng thời thông tin khuyến mãi và tồn kho phải luôn được cập nhật chính xác nhất cho người dùng.',
  challengeEn:
    'Ensuring 24/7 continuous operation even without network connectivity, while keeping promotions and inventory information accurate for the user.',
  solution:
    'Sử dụng kiến trúc Offline-first mạnh mẽ với IndexedDB và Service Workers. Giao diện được tối ưu hóa cho tương tác cảm ứng cực nhanh, giúp quá trình thanh toán diễn ra chỉ trong vài lượt chạm.',
  solutionEn:
    'Used a robust Offline-first architecture with IndexedDB and Service Workers. The UI was optimized for ultra-fast touch interaction, making checkout possible in just a few taps.',
  results:
    'Mang lại niềm tự hào cho nhân viên khi làm việc với một công cụ hiện đại, tăng tốc độ phục vụ và khẳng định uy tín của cửa hàng trong mắt khách hàng.',
  resultsEn:
    'Delivered pride to staff working with a modern tool, increased service speed, and solidified store reputation in the eyes of customers.',
  year: '2026',
  featured: true,
};
