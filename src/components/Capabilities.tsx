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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <section id="capabilities" className="relative scroll-mt-24 bg-slate-50/50 px-6 py-24 overflow-hidden">
      <CapabilitiesBackground />
      
      <div className="mx-auto max-w-6xl relative">
        <div className="mb-16 text-center md:text-left">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.4em] text-emerald-600">
            {t('capabilities.badge')}
          </h2>
          <h3 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            {t('capabilities.title_main')} <span className="text-emerald-600">{t('capabilities.title_senior')}</span> & <br className="hidden md:block" />
            {t('capabilities.title_creative')} <span className="text-teal-500 underline decoration-teal-200 decoration-4 underline-offset-8">{t('capabilities.title_pragmatic')}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-4">
          <CapabilityCard
            title={t('capabilities.cards.automation.title')}
            description={t('capabilities.cards.automation.desc')}
            icon={<Bot />}
            tags={['Telegram', 'Discord', 'Automation']}
            className="md:col-span-2 md:row-span-2"
            visual={<AutomationVisual />}
            image="/images/capabilities/automation.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.trading.title')}
            description={t('capabilities.cards.trading.desc')}
            icon={<TrendingUp />}
            tags={['WebSockets', 'Finance']}
            className="md:col-span-2 md:row-span-1"
            visual={<TradingVisual />}
            image="/images/capabilities/trading.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.media.title')}
            description={t('capabilities.cards.media.desc')}
            icon={<PlayCircle />}
            tags={['HLS', 'Streaming']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={PlayCircle} />}
            image="/images/capabilities/streaming.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.ai.title')}
            description={t('capabilities.cards.ai.desc')}
            icon={<BrainCircuit />}
            tags={['AI Studio', 'LLMs']}
            className="md:col-span-1 md:row-span-2"
            visual={<AIVisual />}
            image="/images/capabilities/ai.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.mobile.title')}
            description={t('capabilities.cards.mobile.desc')}
            icon={<Smartphone />}
            tags={['Kotlin', 'System']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={Smartphone} />}
            image="/images/capabilities/mobile.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.iot.title')}
            description={t('capabilities.cards.iot.desc')}
            icon={<Cast />}
            tags={['PWA', 'Hardware']}
            className="md:col-span-2 md:row-span-1"
            visual={<IoTVisual />}
            image="/images/capabilities/iot.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.pos.title')}
            description={t('capabilities.cards.pos.desc')}
            icon={<ShoppingBag />}
            tags={['Enterprise', 'Retail']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={ShoppingBag} />}
            image="/images/capabilities/pos.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.edtech.title')}
            description={t('capabilities.cards.edtech.desc')}
            icon={<GraduationCap />}
            tags={['UI/UX', 'Education']}
            className="md:col-span-1 md:row-span-1"
            visual={<CommonVisual icon={GraduationCap} />}
            image="/images/capabilities/edtech.png"
          />

          <CapabilityCard
            title={t('capabilities.cards.performance.title')}
            description={t('capabilities.cards.performance.desc')}
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
