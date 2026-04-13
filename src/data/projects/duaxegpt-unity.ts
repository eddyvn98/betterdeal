import { Project } from '../../types';

export const duaxegptUnity: Project = {
  id: 23,
  slug: 'duaxegpt-unity',
  title: 'GPTRacer: Unity Intelligence Demo',
  titleEn: 'GPTRacer: Unity Intelligence Demo',
  category: 'Game',
  stack: ['Unity', 'C#', 'AI Integration', 'Game Simulation'],
  stars: 0,
  image: '/mockups/gptracer-unity.webp',
  description: 'Bản demo mô phỏng đua xe tích hợp AI trên nền tảng Unity, thử nghiệm sự tương tác thông minh.',
  descriptionEn: 'A racing simulation demo integrated with AI on Unity, testing intelligent interaction.',
  longDescription:
    'GPTRacer là cuộc thử nghiệm về khả năng dự đoán và phản hồi của AI trong môi trường 3D. Tôi tập trung vào việc làm thế nào để đối thủ AI không chỉ "biết đua", mà còn có thể đưa ra những hành vi đầy bất ngờ, tạo ra sự kịch tính và thử thách không bao giờ lặp lại cho người chơi.',
  longDescriptionEn:
    'GPTRacer is an experiment in AI prediction and responsiveness in a 3D environment. I focused on making AI opponents not just "know how to race", but exhibit unexpected behaviors, creating drama and ever-changing challenges for the player.',
  challenge:
    'Đồng bộ hóa các quyết định phức tạp của AI với môi trường vật lý 3D trong Unity mà không gây hiện tượng giật lag hay hành vi thiếu tự nhiên (uncanny).',
  challengeEn:
    'Synchronizing complex AI decisions with Unity\'s 3D physics environment without causing lag or unnatural (uncanny) behaviors.',
  solution:
    'Sử dụng các kỹ thuật NavMesh tiên tiến kết hợp với các layer logic AI được phân tách rõ ràng. Quy trình xử lý dữ liệu được tối ưu hóa để AI có thể ra quyết định trong vài mil giây, mang lại trải nghiệm tương tác liền mạch.',
  solutionEn:
    'Used advanced NavMesh techniques combined with clearly separated AI logic layers. Data processing was optimized so the AI can make decisions in milliseconds, ensuring a seamless interactive experience.',
  results:
    'Khẳng định khả năng làm chủ các nền tảng game engine hiện đại và tư duy tích hợp AI Agent vào các môi trường mô phỏng phức tạp.',
  resultsEn:
    'Confirmed mastery of modern game engines and the ability to integrate AI agents into complex simulation environments.',
  year: '2026',
};
