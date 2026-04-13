import { Project } from '../../types';

export const androidKeyboardRemote: Project = {
  id: 13,
  slug: 'android-keyboard-remote',
  title: 'DroidInput: Precision Mobile Keyboard',
  titleEn: 'DroidInput: Precision Mobile Keyboard',
  category: 'Mobile',
  stack: ['Kotlin', 'Android SDK', 'Input Management', 'System hooks'],
  stars: 0,
  image: '/mockups/droidinput-keyboard.webp',
  description: 'Công cụ điều khiển và nhập liệu thông minh trên Android tập trung vào sự chính xác và tốc độ phản hồi.',
  descriptionEn: 'A smart Android input and control tool focusing on precision and response speed.',
  longDescription:
    'DroidInput được thiết kế để giải quyết sự bất tiện khi người dùng phải thao tác trên các phím nhỏ của thiết bị di động. Tôi tập trung vào cảm giác gõ và tốc độ phản hồi (latency), giúp việc nhập liệu trở nên tự nhiên và chính xác như đang sử dụng một bàn phím vật lý chuyên dụng.',
  longDescriptionEn:
    'DroidInput is designed to solve the inconvenience of small mobile keycaps. I focused on typing feel and response latency, making input as natural and precise as using a dedicated physical keyboard.',
  challenge:
    'Can thiệp sâu vào hệ thống Android để bắt kịp các sự kiện nhập liệu phức tạp mà không gây tốn pin hay làm chậm các ứng dụng khác của người dùng.',
  challengeEn:
    'Deep-level Android system hooking to capture complex input events without draining battery or slowing down other user applications.',
  solution:
    'Tối ưu hóa mã nguồn Native bằng Kotlin và xử lý đa luồng thông minh. Giao diện được thiết kế tối giản, tập trung hoàn toàn vào vùng tương tác của ngón tay người dùng để tăng tỷ lệ gõ đúng.',
  solutionEn:
    'Optimized native Kotlin code and smart multi-threading. The UI is designed with minimalism, focusing entirely on user finger interaction zones to increase accuracy.',
  results:
    'Một công cụ hữu ích giúp người dùng nâng cao năng suất làm việc trên di động, mang lại trải nghiệm nhập liệu mượt mà và tin cậy nhất.',
  resultsEn:
    'A useful tool helping users boost mobile productivity, deliver the smoothest and most reliable input experience.',
  year: '2026',
};
