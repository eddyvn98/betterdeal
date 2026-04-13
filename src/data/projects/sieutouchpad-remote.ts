import { Project } from '../../types';

export const sieutouchpadRemote: Project = {
  id: 7,
  slug: 'sieutouchpad-remote',
  title: 'SieuTouchpad: Low-Latency Remote Surface',
  titleEn: 'SieuTouchpad: Low-Latency Remote Surface',
  category: 'Mobile',
  categoryEn: 'Mobile',
  stack: ['Kotlin', 'Android SDK', 'Low-level Networking', 'Mobile Interaction'],
  stars: 0,
  image: '/mockups/sieutouchpad-mobile-remote.webp',
  description: 'Ứng dụng Android tối ưu hóa sự kết nối giữa con người và máy tính thông qua các tương tác chạm tinh tế.',
  descriptionEn: 'An Android app optimizing human-compute connectivity through refined touch interactions.',
  longDescription:
    'SieuTouchpad là dự án về sự tự do. Tôi muốn người dùng có thể điều khiển cả một hệ thống máy tính khổng lồ ngay trong lòng bàn tay mà không cảm thấy bất kỳ rào cản nào về độ trễ. Sự chính xác trong từng cú click hay lướt ngón tay là ưu tiên hàng đầu để tạo ra cảm giác điều khiển tự nhiên như một thiết bị vật lý cao cấp.',
  longDescriptionEn:
    'SieuTouchpad is a project about freedom. I wanted users to control a massive computer system from the palm of their hand without any latency barriers. Precision in every click or swipe was the top priority to create a control experience as natural as a high-end physical device.',
  challenge:
    'Loại bỏ hoàn toàn độ trễ cảm nhận được khi truyền tải dữ liệu cảm ứng qua Wi-Fi, một bài toán kỹ thuật đòi hỏi sự tối ưu hóa sâu sắc ở mức độ hệ thống.',
  challengeEn:
    'Completely eliminating perceptible latency when transmitting touch data over Wi-Fi, a technical challenge requiring deep system-level optimization.',
  solution:
    'Tối ưu hóa các gói tin UDP siêu nhẹ và can thiệp sâu vào kernel Android để bắt các sự kiện chạm nhanh nhất có thể. Giao diện được thiết kế tối giản, tập trung vào không gian tương tác trống để người dùng không cần nhìn vẫn có thể điều khiển chính xác.',
  solutionEn:
    'Optimized ultra-lightweight UDP packets and deep-hooked the Android kernel to capture touch events at maximum speed. The UI is minimalist, focusing on empty interactive space so users can control precisely without looking.',
  results:
    'Trở thành một công cụ utility tin cậy hàng ngày cho người dùng, chứng minh năng lực mang lại những trải nghiệm mượt mà vượt trên giới hạn phần cứng thông thường.',
  resultsEn:
    'Became a reliable daily utility tool, demonstrating the ability to deliver smooth experiences beyond standard hardware limitations.',
  year: '2026',
  featured: true,
};
