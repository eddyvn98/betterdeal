import { Project } from '../../types';

export const telefilmDeliveryPipeline: Project = {
  id: 5,
  slug: 'telefilm-delivery-pipeline',
  title: 'FilmFlow: Automated Content Orchestration',
  titleEn: 'FilmFlow: Automated Content Orchestration',
  category: 'Automation',
  categoryEn: 'Automation',
  stack: ['Python', 'Telethon', 'Pipeline Architecture', 'Content UX'],
  stars: 0,
  image: '/mockups/telefilm-telegram-pipeline.webp',
  description: 'Hệ thống tự động hóa khép kín giúp quản trị viên điều hành kho nội dung số một cách thảnh thơi và chính xác.',
  descriptionEn: 'An end-to-end automation system helping admins manage digital content repositories effortlessly and accurately.',
  longDescription:
    'FilmFlow được thiết kế với triết lý "Tự động hóa vì sự tự do". Tôi muốn giải giải phóng những người quản trị nội dung khỏi hàng giờ làm việc tay chân lặp lại. Với FilmFlow, quy trình từ khâu tiếp nhận đến khâu phân phối được tối ưu hóa để người dùng chỉ cần ra quyết định cấp cao, phần còn lại hãy để công nghệ xử lý.',
  longDescriptionEn:
    'FilmFlow was designed with the philosophy "Automation for Freedom." I wanted to liberate content administrators from hours of repetitive manual labor. With FilmFlow, the flow from ingestion to distribution is optimized so users only need to make high-level decisions; the rest is handled by technology.',
  challenge:
    'Xây dựng một hệ thống xử lý song song với độ tin cậy cao, đảm bảo không một tệp dữ liệu nào bị thất lạc hay sai lệch trong quá trình di chuyển qua các hạ tầng mạng phức tạp.',
  challengeEn:
    'Building a high-reliability parallel processing system, ensuring not a single data file is lost or corrupted during transit across complex network infrastructures.',
  solution:
    'Triển khai kiến trúc hàng đợi ưu tiên và cơ chế kiểm soát lỗi (Error handling) thông minh. Giao diện bảng điều khiển được thiết kế tối giản, tập trung vào việc hiển thị trạng thái của pipeline rõ ràng, giúp người dùng luôn nắm bắt được công việc chỉ trong một ánh nhìn.',
  solutionEn:
    'Implemented priority queue architecture and intelligent error handling. The dashboard interface was designed for minimalism, focusing on clear pipeline state visualization for "at-a-glance" management.',
  results:
    'Tối ưu hóa năng suất vận hành lên một tầm cao mới, mang lại sự thảnh thơi cho con người và sự ổn định tuyệt đối cho hệ thống nội dung số.',
  resultsEn:
    'Optimized operational productivity to a new level, delivering peace of mind for humans and absolute stability for digital content systems.',
  year: '2026',
  featured: true,
};
