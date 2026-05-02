import { useState, useEffect } from 'react';
import { Project } from '../../types';
import { projects as staticProjects } from '../../data/projects';
import { fetchCMSProjects } from '../../services/cms';
import { ai, getSystemPrompt } from '../../services/gemini';
import { useTranslation } from 'react-i18next';

export const useProjects = () => {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>(staticProjects);
  const [isCMSLoading, setIsCMSLoading] = useState(true);
  const [projectAiInfo, setProjectAiInfo] = useState<Record<number, string>>({});
  const [loadingProjects, setLoadingProjects] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadCMSProjects = async () => {
      try {
        const cmsData = await fetchCMSProjects();
        if (cmsData && cmsData.length > 0) {
          const mappedProjects: Project[] = cmsData.map((p, index) => ({
            id: 1000 + index,
            slug: p.slug || p.id,
            title: p.data?.title || 'Untitled',
            titleEn: p.data?.titleEn,
            category: p.taxonomies?.category?.[0] || 'Uncategorized',
            stack: p.taxonomies?.tag || [],
            stars: 0,
            image: p.data?.featured_image || '',
            description: p.data?.summary || '',
            descriptionEn: p.data?.summaryEn,
            longDescription: p.data?.summary || '',
            longDescriptionEn: p.data?.summaryEn,
            challenge: p.data?.challenge,
            challengeEn: p.data?.challengeEn,
            solution: p.data?.solution,
            solutionEn: p.data?.solutionEn,
            results: p.data?.results,
            resultsEn: p.data?.resultsEn,
            liveUrl: p.data?.url,
            repoUrl: p.data?.repoUrl,
            year: p.data?.year,
            featured: true,
            deepDive: p.data?.deepDive ? {
              architecture: p.data.deepDive.architecture,
              architectureEn: p.data.deepDiveEn?.architectureEn,
              coreChallenges: p.data.deepDive.coreChallenges,
              coreChallengesEn: p.data.deepDiveEn?.coreChallengesEn,
              optimization: p.data.deepDive.optimization,
              optimizationEn: p.data.deepDiveEn?.optimizationEn,
            } : undefined,
          }));
          
          setProjects((prev) => {
            const existingNames = new Set(prev.map(pr => pr.title));
            const newFiltered = mappedProjects.filter(mp => !existingNames.has(mp.title));
            return [...newFiltered, ...prev];
          });
        }
      } finally {
        setIsCMSLoading(false);
      }
    };
    loadCMSProjects();
  }, []);

  const handleAiAnalysis = async (project: Project) => {
    const prompt = `Dự án: ${project.title}, loại: ${project.category}`;
    setLoadingProjects((prev) => new Set(prev).add(project.id));
    try {
      const response = await ai.models.generateContent({
        model: 'gemma-4-26b-a4b-it',
        contents: prompt,
        config: { systemInstruction: getSystemPrompt('stack', i18n.language) },
      });
      setProjectAiInfo((prev) => ({
        ...prev,
        [project.id]: response.text || t('chat.no_ai_response'),
      }));
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setLoadingProjects((prev) => {
        const next = new Set(prev);
        next.delete(project.id);
        return next;
      });
    }
  };

  return { projects, isCMSLoading, projectAiInfo, loadingProjects, handleAiAnalysis };
};
