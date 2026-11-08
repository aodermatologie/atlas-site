// Plan du site pour les moteurs de recherche : pages fixes, fiches publiées, rubriques de dermoscopie.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { estPubliee } from '../lib/site';

export const GET: APIRoute = async ({ site }) => {
  const fiches = await getCollection('fiches', estPubliee);
  const rubriques = await getCollection('rubriques');
  const chemins = [
    '/', '/pathologies/', '/atlas/', '/dermoscopie/', '/lupus/', '/mentions-legales/', '/confidentialite/',
    ...fiches.map((f) => `/pathologies/${f.id}/`),
    ...rubriques.map((r) => `/dermoscopie/${r.id}/`),
  ];
  const corps = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chemins
    .map((c) => `  <url><loc>${new URL(c, site)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(corps, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
