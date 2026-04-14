import { Project } from '../../types';

export const vetoanhinhPrototype: Project = {
  id: 19,
  slug: 'vetoanhinh-prototype',
  title: 'MathVisual: Geometry Concept Tool',
  titleEn: 'MathVisual: Geometry Concept Tool',
  category: 'Education',
  stack: ['SVG', 'Math algorithms', 'Interactive UI', 'Visualization'],
  stars: 0,
  image: '/mockups/mathvisual-geometry.png',
  description: 'Nguyên mẫu công cụ mô phỏng hình học giúp trực quan hóa các định lý và không gian ba chiều.',
  descriptionEn: 'A geometry simulation prototype visualizing theorems and 3D space.',
  longDescription:
    'MathVisual tập trung vào việc giải phóng trí tưởng tượng không gian của người học. Tôi muốn tạo ra một công cụ mà tại đó, người dùng có thể "chạm" vào các định lý, xoay chuyển các khối hình để nhận ra vẻ đẹp sự logic của toán học một cách trực tiếp nhất.',
  longDescriptionEn:
    'MathVisual focuses on unleashing the spatial imagination of learners. I wanted to create a tool where users can "touch" theorems and rotate objects to directly witness the beauty and logic of mathematics.',
  challenge:
    'Xây dựng các thuật toán vẽ hình học chính xác tuyệt đối nhưng vẫn phải đảm bảo tốc độ phản hồi cực nhanh khi người dùng thực hiện các thao tác biến đổi phức tạp.',
  challengeEn:
    'Building absolutely precise geometric algorithms while ensuring ultra-fast response times when users perform complex transformations.',
  solution:
    'Sử dụng công nghệ SVG để đảm bảo hình ảnh luôn sắc nét ở mọi độ phân giải. Áp dụng các giải thuật toán học tối ưu để tính toán tọa độ và góc nhìn thời gian thực, mang lại trải nghiệm tương tác không có độ trễ.',
  solutionEn:
    'Used SVG technology to ensure sharp visuals at any resolution. Applied optimized mathematical algorithms for real-time coordinate and viewpoint calculations, providing a zero-latency interactive experience.',
  results:
    'Mở ra một phương thức học tập trực quan sinh động, giúp học sinh nắm vững các kiến thức hình học khó nhằn một cách dễ dàng và đầy cảm hứng.',
  resultsEn:
    'Opened up a vivid visual learning method, helping students master difficult geometry concepts easily and inspiringly.',
  year: '2026',
};
