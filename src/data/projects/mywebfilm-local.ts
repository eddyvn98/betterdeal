import { Project } from '../../types';

export const mywebfilmLocal: Project = {
  id: 12,
  slug: 'mywebfilm-local',
  title: 'LocalStream: Personal Media Repository',
  titleEn: 'LocalStream: Personal Media Repository',
  category: 'Media',
  stack: ['HTML5', 'CSS3', 'JavaScript', 'Media API'],
  stars: 0,
  image: '/mockups/localstream-media.webp',
  description: 'Trình quản lý và phát phim cá nhân ưu tiên sự riêng tư và trải nghiệm duyệt phim tinh tế.',
  descriptionEn: 'A personal media manager prioritizing privacy and refined content discovery.',
  longDescription:
    'LocalStream biến ổ cứng lưu trữ của bạn thành một rạp phim tại gia đích thực. Tôi tập trung vào cảm giác "sở hữu" và sự thoải mái của người dùng khi duyệt qua kho phim cá nhân của mình, với các poster đẹp mắt và thông tin chi tiết được trình bày như một dịch vụ streaming chuyên nghiệp.',
  longDescriptionEn:
    'LocalStream transforms your hard drive into a true home theater. I focused on the sense of "ownership" and user comfort while browsing their personal collection, featuring beautiful posters and detailed info presented like a professional streaming service.',
  challenge:
    'Duyệt hàng nghìn tệp video local với dung lượng lớn mà giao diện vẫn phải phản hồi tức thì, hiển thị đầy đủ preview mà không gây hiện tượng "chờ tải" ảnh hưởng đến cảm xúc của người xem.',
  challengeEn:
    'Browsing thousands of heavy local video files while keeping the UI responsive and providing full previews without "loading" stutters that disrupt the viewer experience.',
  solution:
    'Phát triển cơ chế Lazy-loading thông minh kết hợp với bộ engine quét metadata hiệu suất cao. Giao diện được tối ưu hóa bằng CSS Grid và các hiệu ứng chuyển cảnh mượt mà để tạo cảm giác sang trọng và cao cấp.',
  solutionEn:
    'Developed smart lazy-loading combined with a high-performance metadata scanning engine. The UI was optimized using CSS Grid and smooth transitions to create a luxurious and premium feel.',
  results:
    'Một thư viện phim cá nhân đẳng cấp, nơi người dùng có thể đắm chìm vào không gian điện ảnh của riêng mình với sự hài lòng tuyệt đối về thẩm mỹ và tốc độ xử lý.',
  resultsEn:
    'A premium personal media library where users can immerse themselves in their cinematic space with absolute satisfaction in aesthetics and processing speed.',
  year: '2026',
};
