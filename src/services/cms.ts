/**
 * CMS Service
 * Handles communication with Cloudflare EmDash CMS
 */

export interface CMSProject {
  id: string;
  slug: string;
  data: {
    title: string;
    client?: string;
    year?: string;
    summary?: string;
    featured_image: string;
    content: any[]; // PortableText
    url?: string;
  };
  taxonomies?: {
    category?: string[];
    tag?: string[];
  };
}

export interface CMSPage {
  id: string;
  slug: string;
  data: {
    title: string;
    content: any[]; // PortableText
  };
}

const CMS_API_URL = import.meta.env.VITE_CMS_API_URL || 'http://localhost:4321/api';
const CMS_API_TOKEN = import.meta.env.VITE_CMS_API_TOKEN || '';

/**
 * Fetch all projects from EmDash CMS
 */
export const fetchCMSProjects = async (): Promise<CMSProject[]> => {
  const response = await fetch(`${CMS_API_URL}/projects.json`, {
    headers: {
      ...(CMS_API_TOKEN ? { 'Authorization': `Bearer ${CMS_API_TOKEN}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects from CMS: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Fetch a single project by slug
 */
export const fetchCMSProjectBySlug = async (slug: string): Promise<CMSProject> => {
  const response = await fetch(`${CMS_API_URL}/projects/${slug}`, {
    headers: {
      ...(CMS_API_TOKEN ? { 'Authorization': `Bearer ${CMS_API_TOKEN}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch project ${slug} from CMS: ${response.status}`);
  }

  return response.json();
};

/**
 * Fetch a page by slug
 */
export const fetchCMSPage = async (slug: string): Promise<CMSPage> => {
  const response = await fetch(`${CMS_API_URL}/pages/${slug}`, {
    headers: {
      ...(CMS_API_TOKEN ? { 'Authorization': `Bearer ${CMS_API_TOKEN}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${slug} from CMS: ${response.status}`);
  }

  return response.json();
};
