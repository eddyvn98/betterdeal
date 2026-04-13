import { Project } from '../../types';

export const duaxewebGpt: Project = {
  id: 22,
  slug: 'duaxeweb-gpt',
  title: 'WebRacer: Browser-Based GPT Game',
  titleEn: 'WebRacer: Browser-Based GPT Game',
  category: 'Game',
  stack: ['JavaScript', 'Canvas API', 'Game Loop', 'Web Performance'],
  stars: 0,
  image: '/mockups/webracer-gpt.webp',
  description: 'Trò chơi đua xe nhẹ nhàng trên trình duyệt với cơ chế điều khiển tối giản và tốc độ tải cực nhanh.',
  descriptionEn: 'A lightweight browser racing game with minimal controls and ultra-fast loading speed.',
  longDescription:
    'WebRacer được thiết kế cho sự tiện lợi tối đa: click và chơi ngay. Tôi gạt bỏ mọi rào cản về cài đặt hay cấu hình, tập trung vào việc tối ưu dung lượng và tốc độ để người dùng có thể giải trí ngay tức thì trên bất kỳ trình duyệt nào, bất kỳ lúc nào.',
  longDescriptionEn:
    'WebRacer is designed for ultimate convenience: click and play. I removed all barriers of installation or configuration, focusing on size and speed optimization so users can have instant fun on any browser, anytime.',
  challenge:
    'Tạo ra một vòng lặp game (Game Loop) ổn định và đồ họa mượt mà chỉ với HTML5 Canvas truyền thống mà không cần đến các thư viện đồ họa nặng nề.',
  challengeEn:
    'Creating a stable game loop and smooth graphics using traditional HTML5 Canvas without heavy graphics libraries.',
  solution:
    'Viết toàn bộ code bằng Vanilla JavaScript tối giản và tối ưu hóa các asset đồ họa vector. Sử dụng `requestAnimationFrame` để đảm bảo 60 FPS ổn định trên hầu hết các cấu hình máy tính văn phòng.',
  solutionEn:
    'Wrote all code in minimal Vanilla JavaScript and optimized vector graphic assets. Used `requestAnimationFrame` to ensure a steady 60 FPS on most office computer configurations.',
  results:
    'Mang lại sự hài lòng cho người dùng nhờ sự đơn giản và tốc độ, chứng minh khả năng tối ưu hóa Web hiệu năng cao ngay cả trong lĩnh vực giải trí.',
  resultsEn:
    'Delivered user satisfaction through simplicity and speed, demonstrating high-performance web optimization even in the entertainment sector.',
  year: '2026',
};
