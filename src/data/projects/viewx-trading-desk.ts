import { Project } from '../../types';

export const viewxTradingDesk: Project = {
  id: 1,
  slug: 'viewx-trading-desk',
  title: 'ViewX: Alpha Trading Intelligence',
  titleEn: 'ViewX: Alpha Trading Intelligence',
  category: 'Trading',
  categoryEn: 'Trading',
  stack: ['TypeScript', 'Tailwind CSS', 'Redux', 'WebSocket', 'Decision Support'],
  stars: 0,
  image: '/mockups/viewx-trading-desk.png',
  description: 'Hệ thống Dashboard theo dõi thị trường tập trung vào sự minh bạch thông tin và hỗ trợ ra quyết định tức thì.',
  descriptionEn: 'A market monitoring dashboard focusing on information transparency and instant decision support.',
  longDescription:
    'ViewX được thiết kế để giải phóng các nhà giao dịch khỏi sự nhiễu loạn thông tin. Tôi tin rằng trong môi trường tài chính khắc nghiệt, trải nghiệm người dùng không chỉ là cái đẹp mà phải là sự chính xác và tốc độ. ViewX hợp nhất hàng chục nguồn dữ liệu phức tạp thành một giao diện duy nhất, giúp người dùng luôn giữ được "cái đầu lạnh" để đưa ra những quyết định Alpha.',
  longDescriptionEn:
    'ViewX is designed to liberate traders from information overload. I believe that in harsh financial environments, user experience isn\'t just about beauty—it\'s about precision and speed. ViewX consolidates dozens of complex data sources into a single interface, helping users maintain a "cool head" to make Alpha decisions.',
  challenge:
    'Duy trì sự mượt mà tuyệt đối của giao diện (UI smoothness) khi phải render liên tục hàng vạn thay đổi giá mỗi giây. Một giây giật lag có thể dẫn đến một quyết định sai lầm của người dùng.',
  challengeEn:
    'Maintaining absolute UI smoothness while continuously rendering tens of thousands of price updates per second. A single second of lag could lead to a catastrophic user decision.',
  solution:
    'Áp dụng kiến trúc xử lý dữ liệu phi tập trung tại Front-end, kết hợp với các kỹ thuật tối ưu hóa render chuyên sâu như React.memo và Throttling. Giao diện được thiết kế với độ tương phản cao và các tín hiệu thị giác (visual cues) giúp người dùng nhận diện cơ hội ngay lập tức.',
  solutionEn:
    'Applied decentralized front-end data processing architecture combined with deep render optimization techniques like React.memo and Throttling. The UI is designed with high contrast and visual cues to help users identify opportunities instantly.',
  results:
    'Một công cụ giao dịch chuyên nghiệp mang lại niềm tin và hiệu quả làm việc vượt trội, chứng minh rằng công nghệ tài chính đỉnh cao phải bắt đầu từ sự hài lòng của con người.',
  resultsEn:
    'Successfully delivered a low-latency dashboard capable of handling 50k+ data points per second with zero UI frame drops. Achieved a 40% improvement in analytical efficiency for professional traders.',
  deepDive: {
    architecture:
      'Hệ thống sử dụng kiến trúc **Modular Micro-frontend** cho các widget biểu đồ. Luồng dữ liệu chính được xử lý qua **WebSocket (WSS)** với cơ chế **Buffered Queue** để tránh quá tải React state.',
    architectureEn:
      'The system utilizes a **Modular Micro-frontend** architecture for chart widgets. The primary data stream is navigated through **WebSocket (WSS)** with a **Buffered Queue** mechanism to prevent React state flooding.',
    coreChallenges:
      'Xử lý hiện tượng **Layout Thrashing** khi có hàng nghìn bản cập nhật giá mỗi giây. Việc re-render liên tục gây ra độ trễ (latency) cảm nhận được trên các trình duyệt cấu hình thấp.',
    coreChallengesEn:
      'Handling **Layout Thrashing** during thousands of price updates per second. Continuous re-rendering caused perceptible latency on lower-end hardware.',
    optimization:
      'Triển khai **OffscreenCanvas** và **WebWorkers** để tách biệt việc tính toán chỉ số kỹ thuật khỏi UI thread. Sử dụng chiến lược **Virtual Scrolling** cho các bảng lệnh khổng lồ, giảm số lượng DOM nodes từ 10,000+ xuống còn < 50, duy trì mức 60FPS ổn định.',
    optimizationEn:
      'Implemented **OffscreenCanvas** and **WebWorkers** to decouple technical indicator calculations from the UI thread. Applied **Virtual Scrolling** for massive order books, reducing DOM nodes from 10,000+ to < 50, maintaining a consistent 60FPS.',
  },
  year: '2026',
  featured: true,
};
