import { getEmDashCollection, getEntryTerms } from "emdash";

export const prerender = false;

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET() {
  try {
    const { entries: projects } = await getEmDashCollection("projects");
    
    // optionally append taxonomies
    const projectsWithTags = await Promise.all(
        projects.map(async (project) => {
            const projectTags = await getEntryTerms("projects", project.data.id, "tag");
            const projectCategory = await getEntryTerms("projects", project.data.id, "category");
            return { 
                id: project.id,
                slug: project.slug,
                data: project.data,
                taxonomies: {
                    tag: projectTags.map(t => t.slug),
                    category: projectCategory.map(c => c.slug)
                }
            };
        })
    );

    return new Response(
      JSON.stringify(projectsWithTags),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Allow React app to fetch it via CORS
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
