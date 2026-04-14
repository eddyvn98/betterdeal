import { Project } from '../../types';

export const rutgonlinkEngine: Project = {
  id: 10,
  slug: 'rutgonlink-engine',
  title: 'LinkSharp: Performance URL Engine',
  titleEn: 'LinkSharp: Performance URL Engine',
  category: 'Utility',
  stack: ['JavaScript', 'Node.js', 'Redis', 'Performance'],
  stars: 0,
  image: '/mockups/rutgonlink-engine.png',
  description: 'Hệ thống rút gọn liên kết tập trung vào tốc độ chuyển hướng và trải nghiệm người dùng không gián đoạn.',
  descriptionEn: 'A URL shortener focused on redirection speed and seamless user experience.',
  longDescription:
    'LinkSharp không chỉ đơn thuần là một công cụ rút gọn link. Dự án được thiết kế để giải quyết "nỗi đau" của người dùng khi phải chờ đợi các trang chuyển hướng trung gian chậm chạp. Tôi tập trung vào việc tối thiểu hóa thời gian từ lúc người dùng click đến khi nội dung thực xuất hiện, tạo ra một cảm giác tức thì và đáng tin cậy.',
  longDescriptionEn:
    'LinkSharp is more than just a URL shortener. The project is designed to address the user "pain point" of waiting through slow intermediate redirection pages. I focused on minimizing the time from click to actual content appearance, creating a sense of immediacy and trust.',
  challenge:
    'Thách thức lớn nhất là xử lý hàng ngàn lượt truy cập đồng thời mà vẫn đảm bảo độ trễ chuyển hướng dưới 50ms, ngay cả khi cơ sở dữ liệu liên kết trở nên khổng lồ theo thời gian.',
  challengeEn:
    'The primary challenge was handling thousands of concurrent requests while keeping redirection latency under 50ms, even as the link database grows massive over time.',
  solution:
    'Triển khai cơ chế Cache đa lớp với Redis để lưu trữ các liên kết thường xuyên truy cập. Cấu trúc mã nguồn được tối ưu hóa để loại bỏ các bước xử lý thừa, kết hợp với hạ tầng mạng được tinh chỉnh để phục vụ yêu cầu gần với người dùng nhất.',
  solutionEn:
    'Implemented multi-layer caching with Redis for frequently accessed links. Optimized source code to eliminate redundant processing steps, paired with network infrastructure tuned to serve requests as close to the user as possible.',
  results:
    'Người dùng cuối có trải nghiệm duyệt web mượt mà, tỷ lệ rơi rớt (bounce rate) tại các trang chuyển hướng giảm xuống mức tối thiểu, đồng thời cung cấp hệ thống phân tích dữ liệu hiệu quả cho người quản lý.',
  resultsEn:
    'End-users enjoy a smooth browsing experience, with bounce rates on redirection pages dropping to a minimum, while providing highly effective analytics for administrators.',
  year: '2026',
};
