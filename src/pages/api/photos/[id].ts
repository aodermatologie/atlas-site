// GET /api/photos/:id?taille=480|1600 → photo verrouillée, uniquement avec une session de coffre-fort valide.
// La photo est relayée par le serveur : le bucket privé n'est jamais exposé, et aucune adresse ne peut être partagée.
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { configCoffre, lireCookie, lireSession } from '../../../lib/coffre.mjs';
import { creerStockage } from '../../../lib/stockage.mjs';

export const prerender = false;

const stockage = creerStockage();
const PRIVE = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, noimageindex', 'Content-Disposition': 'inline' };

export const GET: APIRoute = async ({ params, request, url }) => {
  const c = configCoffre();
  if (!lireSession(lireCookie(request.headers.get('cookie')), c.secret, c.version)) {
    return new Response('Coffre-fort fermé', { status: 401, headers: PRIVE });
  }
  const photo = params.id ? await getEntry('photos', params.id) : undefined;
  if (!photo || photo.data.acces !== 'verrouillee') return new Response('Introuvable', { status: 404, headers: PRIVE });

  const taille = url.searchParams.get('taille') === '1600' ? 1600 : 480;
  const fichier = await stockage.lirePrive(`${photo.data.fichier}-${taille}.webp`);
  if (!fichier) return new Response('Introuvable', { status: 404, headers: PRIVE });

  return new Response(fichier.corps, {
    headers: { 'Content-Type': fichier.type, ...(fichier.taille ? { 'Content-Length': String(fichier.taille) } : {}), ...PRIVE },
  });
};
