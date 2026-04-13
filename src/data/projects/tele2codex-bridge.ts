import { Project } from '../../types';

export const tele2codexBridge: Project = {
  id: 2,
  slug: 'tele2codex-bridge',
  title: 'CodexFlow: Agile Dev-Comms Bridge',
  titleEn: 'CodexFlow: Agile Dev-Comms Bridge',
  category: 'Automation',
  categoryEn: 'Automation',
  stack: ['Node.js', 'Telegram API', 'Automation', 'DevOps UX'],
  stars: 0,
  image: '/mockups/tele2codex-bridge.webp',
  description: 'Cầu nối tự động hóa giúp lập trình viên giảm bớt sự phân tâm và tối ưu hóa luồng giao tiếp kỹ thuật.',
  descriptionEn: 'An automation bridge helping developers reduce distraction and optimize technical communication flows.',
  longDescription:
    'CodexFlow ra đời từ mong muốn tối ưu hóa sự tập trung (Flow state) của lập trình viên. Tôi thiết kế giải pháp này để biến Telegram — một công cụ giao tiếp thông thường — thành một trợ lý kỹ thuật mạnh mẽ, giúp người dùng chuyển đổi các ý tưởng và thảo luận thành hành động thực tế mà không cần rời mắt khỏi luồng suy nghĩ hiện tại.',
  longDescriptionEn:
    'CodexFlow was born from the desire to optimize developer flow state. I designed this solution to turn Telegram—a standard communication tool—into a powerful technical assistant, helping users convert ideas and discussions into actual actions without breaking their current thought stream.',
  challenge:
    'Làm thế nào để phân loại và điều phối một lượng lớn dữ liệu phi cấu trúc (chat, ảnh, file) từ người dùng thành các cấu trúc làm việc khoa học và dễ quản lý.',
  challengeEn:
    'How to classify and coordinate large volumes of unstructured data (chat, images, files) from users into scientific and manageable work structures.',
  solution:
    'Xây dựng các bộ xử lý (Handlers) thông minh dựa trên ngữ cảnh, tự động trích xuất các thông tin quan trọng. Giao diện phản hồi của bot được thiết kế tinh tế, cung cấp đủ thông tin cần thiết mà không gây phiền hà cho người dùng.',
  solutionEn:
    'Built context-based intelligent handlers that automatically extract key information. The bot\'s response interface is subtly designed, providing necessary information without being intrusive.',
  results:
    'Loại bỏ hoàn toàn các thao tác thủ công gây lãng phí thời gian, giúp lập trình viên duy trì năng suất cao nhất và cảm nhận rõ nét giá trị của sự tự động hóa tinh tế.',
  resultsEn:
    'Completely eliminated time-wasting manual tasks, helping developers maintain peak productivity and clearly feel the value of subtle automation.',
  year: '2026',
  featured: true,
};
