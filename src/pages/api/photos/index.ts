// GET /api/photos → légendes et descriptions des photos verrouillées, uniquement avec une session de coffre-fort valide.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { configCoffre, lireCookie, lireSession } from '../../../lib/coffre.mjs';
import { sourcePhoto } from '../../../lib/site';

export const prerender = false;

const PRIVE = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

export const GET: APIRoute = async ({ request }) => {
  const c = configCoffre();
  if (!lireSession(lireCookie(request.headers.get('cookie')), c.secret, c.version)) {
    return new Response(JSON.stringify({ erreur: 'ferme' }), { status: 401, headers: PRIVE });
  }
  const photos = await getCollection('photos', (p) => p.data.acces === 'verrouillee');
  const details = Object.fromEntries(photos.map((p) => [p.id, { legende: p.data.legende, alt: p.data.alt, source: sourcePhoto(p) }]));
  return new Response(JSON.stringify(details), { headers: PRIVE });
};
