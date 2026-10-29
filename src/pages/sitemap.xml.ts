import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin ?? 'https://me.axiavo.com';
  const projects = await getCollection('projects');
  const notes = await getCollection('notes');

  const urls = [
    '/',
    '/projects/',
    ...projects.map((p) => `/projects/${p.id}/`),
    '/notes/',
    ...notes.map((n) => `/notes/${n.id}/`),
    '/about/',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
