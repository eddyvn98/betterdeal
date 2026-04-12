import React from 'react';
import { motion } from 'motion/react';

interface FeatureCardProps {
  title: string;
  description: string;
  label: string;
  variant: 'dark' | 'light' | 'accent';
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, label, variant, delay = 0 }) => {
  const themes = {
    dark: 'bg-slate-950 text-white border-slate-800',
    light: 'bg-sky-50 text-slate-900 border-sky-100',
    accent: 'bg-emerald-600 text-white border-emerald-500',
  };

  const labelColors = {
    dark: 'text-emerald-300',
    light: 'text-sky-700',
    accent: 'text-emerald-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-[22px] border p-5 shadow-lg transition-shadow hover:shadow-xl ${themes[variant]}`}
    >
      <div className={`mb-2 text-[11px] font-bold uppercase tracking-[0.2em] ${labelColors[variant]}`}>
        {title}
      </div>
      <div className="mb-1 text-base font-bold">{label}</div>
      <p className={`text-sm leading-relaxed ${variant === 'light' ? 'text-slate-600' : 'text-slate-200'}`}>
        {description}
      </p>
    </motion.div>
  );
};

export const HeroFeatureCards = () => {
  const features: FeatureCardProps[] = [
    {
      title: 'Input',
      label: 'Gửi gì cũng được',
      description: 'Chat, ảnh chụp, link hay ghi chú lộn xộn... cứ đưa đây cho tôi xử lý.',
      variant: 'dark',
      delay: 0.3,
    },
    {
      title: 'AI Support',
      label: 'Cùng làm rõ',
      description: 'Tự động phát hiện chỗ thiếu, gợi ý câu hỏi để chắc chắn chúng mình hiểu nhau.',
      variant: 'light',
      delay: 0.4,
    },
    {
      title: 'Output',
      label: 'Xong việc luôn',
      description: 'Nhận báo giá tối ưu, minh bạch và bắt tay vào làm ngay không sợ sai hướng.',
      variant: 'accent',
      delay: 0.5,
    },
  ];

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};
