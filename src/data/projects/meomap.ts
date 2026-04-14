import { Project } from '../../types';

export const meomap: Project = {
  id: 29,
  slug: 'meomap',
  title: 'MeoMap: Geo-Spatial Data Viewer',
  titleEn: 'MeoMap: Geo-Spatial Data Viewer',
  category: 'Map',
  stack: ['JavaScript', 'Leaflet', 'GeoJSON', 'Data Visualization'],
  stars: 0,
  image: '/mockups/meomap.png',
  description: 'Công cụ trực quan hóa dữ liệu bản đồ thông báo với khả năng tìm kiếm và lọc dữ liệu thông minh.',
  descriptionEn: 'A map data visualization tool with smart search and data filtering capabilities.',
  longDescription:
    'MeoMap giúp những dữ liệu tọa độ khô khan trở nên có ý nghĩa. Tôi tập trung vào việc làm thế nào để người dùng có thể "đọc" được bản đồ một cách nhanh nhất, tìm thấy thông tin điểm đến hoặc khu vực quan tâm chỉ trong vài cú click chuột với độ chính xác tuyệt đối.',
  longDescriptionEn:
    'MeoMap gives meaning to dry coordinate data. I focused on how users can "read" the map as quickly as possible, finding destinations or areas of interest in just a few clicks with absolute precision.',
  challenge:
    'Xử lý hàng vạn điểm dữ liệu (Markers) trên bản đồ mà không gây giật lag (stuttering) khi người dùng thực hiện các thao tác zoom hoặc pan.',
  challengeEn:
    'Handling tens of thousands of data points (markers) on the map without causing stuttering during user zoom or pan actions.',
  solution:
    'Triển khai kỹ thuật Marker Clustering và tối ưu hóa việc load dữ liệu GeoJSON theo vùng nhìn thấy (Viewport). Giao diện được tối ưu hóa để hiển thị thông tin chi tiết một cách trang nhã khi người dùng tương tác với marker.',
  solutionEn:
    'Implemented Marker Clustering and optimized GeoJSON data loading based on the viewport. The UI was refined to elegantly display details when users interact with markers.',
  results:
    'Cung cấp một giải pháp quản lý dữ liệu vị trí hiệu quả, mang lại trải nghiệm khám phá bản đồ mượt mà và trực quan cho người dùng cuối.',
  resultsEn:
    'Provided an effective location data management solution, delivering a smooth and intuitive map exploration experience for end-users.',
  year: '2026',
};
