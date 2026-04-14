import { Project } from '../../types';

export const giaphaso: Project = {
  id: 11,
  slug: 'giaphaso',
  title: 'GiaPhả Số: Digital Heritage Platform',
  titleEn: 'GiaPhả Số: Digital Heritage Platform',
  category: 'Web App',
  stack: ['TypeScript', 'React', 'D3.js', 'Heritage Tech'],
  stars: 0,
  image: '/mockups/giaphaso-heritage.png',
  description: 'Nền tảng số hóa cây gia phả với giao diện trực quan và trải nghiệm kết nối thế hệ.',
  descriptionEn: 'A digital lineage platform with intuitive visualization and generational connection experience.',
  longDescription:
    'GiaPhả Số được xây dựng với mục tiêu gìn giữ những giá trị truyền thống qua lăng kính công nghệ hiện đại. Tôi đặc biệt chú trọng vào việc làm sao để ngay cả những người dùng lớn tuổi cũng có thể dễ dàng duyệt tìm, xem thông tin tổ tiên và cảm nhận được sự gắn kết gia đình qua một giao diện mượt mà, đầy cảm hứng.',
  longDescriptionEn:
    'GiaPhả Số was built to preserve traditional values through the lens of modern technology. I prioritized ensuring that even older users can easily browse, view ancestor information, and feel family connection through a smooth, inspiring interface.',
  challenge:
    'Việc hiển thị một cây gia phả khổng lồ với hàng trăm thành viên trên các thiết bị di động mà vẫn đảm bảo tính tương tác, không gây rối mắt và thao tác "chạm" dễ dàng là một bài toán UX cực kỳ hóc búa.',
  challengeEn:
    'Visualizing a massive family tree with hundreds of members on mobile devices while maintaining interactivity, avoiding visual clutter, and ensuring easy touch interactions was a complex UX challenge.',
  solution:
    'Sử dụng thư viện D3.js để xây dựng thuật toán vẽ cây tự động, linh hoạt co giãn. Áp dụng kỹ thuật Level-of-Detail (LoD) để chỉ hiển thị thông tin chi tiết khi người dùng tương tác gần, giúp giao diện luôn thoáng đãng và dễ hiểu.',
  solutionEn:
    'Used D3.js to build an automated, flexible tree-drawing algorithm. Applied Level-of-Detail (LoD) techniques to display information only during close interaction, keeping the UI airy and comprehensible.',
  results:
    'Một công cụ kết nối gia đình thực thụ, nơi mọi thành viên từ trẻ đến già đều có thể tham gia đóng góp và tìm hiểu về cội nguồn một cách tự nhiên, góp phần bảo tồn di sản văn hóa dòng họ.',
  resultsEn:
    'A true family connection tool where members of all ages can contribute and explore their roots naturally, helping to preserve lineage cultural heritage.',
  year: '2026',
};
