import { Project } from '../../types';

export const webRemoteTv: Project = {
  id: 8,
  slug: 'web-remote-tv',
  title: 'AnyRemote: Universal Web-to-TV Controller',
  titleEn: 'AnyRemote: Universal Web-to-TV Controller',
  category: 'IoT',
  categoryEn: 'IoT',
  stack: ['HTML5', 'Modern JavaScript', 'IP Protocols', 'Cross-device UX'],
  stars: 0,
  image: '/mockups/webremotetv-remote-panel.webp',
  description: 'Giải pháp điều khiển Smart TV dựa trên trình duyệt, đặt sự tiện lợi và đơn giản lên hàng đầu.',
  descriptionEn: 'A browser-based Smart TV control solution putting convenience and simplicity first.',
  longDescription:
    'AnyRemote là câu trả lời cho sự lãng phí dung lượng khi phải cài đặt các ứng dụng điều khiển cồng kềnh. Tôi tập trung vào trải nghiệm "Nhanh - Gọn - Nhẹ": mở trình duyệt lên là có thể điều khiển TV ngay lập tức. Đây là một minh chứng cho việc dùng công nghệ Web hiện đại để giải quyết những nhu cầu thực tế hàng ngày một cách thông minh.',
  longDescriptionEn:
    'AnyRemote is the answer to wasted storage from installing bulky control apps. I focused on a "Fast - Lean - Light" experience: open the browser and control your TV immediately. It demonstrates using modern web tech to solve real daily needs intelligently.',
  challenge:
    'Phát triển một giao diện điều khiển (Remote Layout) thích ứng hoàn hảo với mọi kích thước màn hình điện thoại mà vẫn đảm bảo độ lớn của nút bấm để người dùng tương tác dễ dàng trong bóng tối.',
  challengeEn:
    'Developing a remote layout that adapts perfectly to all mobile screen sizes while ensuring button sizes are large enough for easy interaction in the dark.',
  solution:
    'Sử dụng kiến trúc Mobile-first và tối ưu hóa CSS để giao diện load gần như tức thì. Các lệnh điều khiển được gửi qua giao diện IP với độ trễ tối thiểu, mang lại phản hồi ngay lập tức trên màn hình TV.',
  solutionEn:
    'Used a mobile-first architecture and CSS optimization for near-instant loading. Commands are sent via IP interfaces with minimal latency, providing immediate response on the TV screen.',
  results:
    'Mang lại sự tiện lợi bất ngờ cho người dùng gia đình, củng cố triết lý "Công nghệ vì con người" trong từng dòng code của tôi.',
  resultsEn:
    'Brought unexpected convenience to home users, reinforcing the "Technology for People" philosophy in every line of my code.',
  year: '2026',
  featured: true,
};
