import React from 'react';
import { 
  Bot, 
  TrendingUp, 
  PlayCircle, 
  BrainCircuit, 
  Smartphone, 
  Cast, 
  ShoppingBag, 
  GraduationCap, 
  ShieldCheck
} from 'lucide-react';
import { CapabilityCard } from './CapabilityCard';
import { CapabilitiesBackground } from './CapabilitiesBackground';
import { 
  AutomationVisual, 
  TradingVisual, 
  AIVisual, 
  IoTVisual, 
  CommonVisual 
} from './VisualSimulations';

export const Capabilities = () => {
  return (
    <section id="capabilities" className="relative scroll-mt-24 bg-slate-50/50 px-6 py-24 overflow-hidden">
      <CapabilitiesBackground />
      
      <div className="mx-auto max-w-6xl relative">
        <div className="mb-16 text-center md:text-left">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.4em] text-emerald-600">Năng lực cốt lõi</h2>
          <h3 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Kỹ thuật <span className="text-emerald-600">Senior</span> & <br className="hidden md:block" />
            Sáng tạo <span className="text-teal-500 underline decoration-teal-200 decoration-4 underline-offset-8">Thực dụng.</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-4">
          <CapabilityCard
            title="Automation & Bots"
            description="Phát triển hệ sinh thái bot tự động hóa quy trình và quản lý cộng đồng VIP quy mô lớn."
            icon={<Bot />}
            tags={['Telegram', 'Discord', 'Automation']}
            className="md:col-span-2 md:row-span-2"
            visual={<AutomationVisual />}
            image="/images/capabilities/automation.png"
          />

          <CapabilityCard
            title="Real-time Trading"
            description="Xây dựng Dashboard tài chính và xử lý luồng dữ liệu chứng khoán thời gian thực."
            icon={<TrendingUp />}
            tags={['WebSockets', 'Finance']}
            className="md:col-span-2 md:row-span-1"
            visual={<TradingVisual />}
            image="/images/capabilities/trading.png"
          />

          <CapabilityCard
            title="Media Streaming"
            description="Kiến trúc phân phối video và quản lý thư viện nội dung số năng suất cao."
            icon={<PlayCircle />}
            tags={['HLS', 'Streaming']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={PlayCircle} />}
            image="/images/capabilities/streaming.png"
          />

          <CapabilityCard
            title="AI Workflows"
            description="Tích hợp AI giúp tự động hóa quyết định và tối ưu quy trình doanh nghiệp."
            icon={<BrainCircuit />}
            tags={['AI Studio', 'LLMs']}
            className="md:col-span-1 md:row-span-2"
            visual={<AIVisual />}
            image="/images/capabilities/ai.png"
          />

          <CapabilityCard
            title="Native Mobile"
            description="App Android can thiệp hệ thống để điều khiển từ xa và tối ưu hiệu năng."
            icon={<Smartphone />}
            tags={['Kotlin', 'System']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={Smartphone} />}
            image="/images/capabilities/mobile.png"
          />

          <CapabilityCard
            title="IoT Interfaces"
            description="Giải pháp điều khiển phần cứng qua giao diện Web/Mobile mượt mà."
            icon={<Cast />}
            tags={['PWA', 'Hardware']}
            className="md:col-span-2 md:row-span-1"
            visual={<IoTVisual />}
            image="/images/capabilities/iot.png"
          />

          <CapabilityCard
            title="POS Systems"
            description="Thiết kế hệ thống quản lý bán hàng thực dụng, tinh gọn cho doanh nghiệp."
            icon={<ShoppingBag />}
            tags={['Enterprise', 'Retail']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={ShoppingBag} />}
            image="/images/capabilities/pos.png"
          />

          <CapabilityCard
            title="EdTech Platforms"
            description="Nền tảng học trực tuyến tương tác cao với trải nghiệm người dùng tối ưu."
            icon={<GraduationCap />}
            tags={['UI/UX', 'Education']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={GraduationCap} />}
            image="/images/capabilities/edtech.png"
          />

          <CapabilityCard
            title="High Performance"
            description="Công cụ chuyên biệt tập trung vào tốc độ, khả năng mở rộng và bảo mật tuyệt đối."
            icon={<ShieldCheck />}
            tags={['Security', 'Optimization']}
            className="md:col-span-2 md:row-span-1"
            accent={true}
            image="/images/capabilities/performance.png"
          />
        </div>
      </div>
    </section>
  );
};
