import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? 'https://me.axiavo.com';

  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
