import React from 'react';
import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const faqs = [
  {
    questionKey: 'faq.q1.q',
    answerKey: 'faq.q1.a',
  },
  {
    questionKey: 'faq.q2.q',
    answerKey: 'faq.q2.a',
  },
  {
    questionKey: 'faq.q3.q',
    answerKey: 'faq.q3.a',
  },
  {
    questionKey: 'faq.q4.q',
    answerKey: 'faq.q4.a',
  },
  {
    questionKey: 'faq.q5.q',
    answerKey: 'faq.q5.a',
  },
];

export const FAQSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
            {t('faq.title')}
          </h2>
          <p className="mt-4 text-slate-500">
            {t('faq.description')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-emerald-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold text-slate-900">
                  {t(faq.questionKey)}
                </span>
                {openIndex === index ? (
                  <Minus className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Plus className="h-5 w-5 text-slate-400" />
                )}
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="border-t border-slate-100 p-6 text-slate-600 leading-relaxed">
                  {t(faq.answerKey)}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
