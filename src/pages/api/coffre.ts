// POST /api/coffre  { code }  → ouvre la session du coffre-fort
// GET  /api/coffre            → { deverrouille }
// DELETE /api/coffre          → referme
import type { APIRoute } from 'astro';
import {
  Limiteur, adresseClient, configCoffre, enteteCookie, enteteCookieEfface, lireCookie, lireSession, signerSession, verifierCode,
} from '../../lib/coffre.mjs';

export const prerender = false;

// Une instance par serveur. Avec plusieurs instances, déplacer le compteur dans Redis ou Postgres.
const limiteur = new Limiteur({ essais: 5, fenetre: 15 * 60 * 1000 });

const json = (corps: unknown, statut = 200, entetes: Record<string, string> = {}) =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...entetes },
  });

const bloque = (ms: number) => {
  const secondes = Math.max(1, Math.ceil(ms / 1000));
  return json({ erreur: 'bloque', reessayerDans: secondes }, 429, { 'Retry-After': String(secondes) });
};

export const GET: APIRoute = ({ request }) => {
  const c = configCoffre();
  return json({ deverrouille: lireSession(lireCookie(request.headers.get('cookie')), c.secret, c.version) });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const c = configCoffre();
  if (!c.pret) return json({ erreur: 'indisponible' }, 503);

  const ip = adresseClient(request, clientAddress);
  let code = '';
  try {
    const corps = await request.json();
    code = typeof corps?.code === 'string' ? corps.code.slice(0, 200) : '';
  } catch {
    return json({ erreur: 'requete' }, 400);
  }

  // Vérification de la limite et comptage de l'essai sans « await » entre les deux, puis seulement le calcul :
  // des requêtes envoyées en même temps ne peuvent pas dépasser la limite.
  const etat = limiteur.etat(ip);
  if (etat.bloque) return bloque(etat.reessayerDans);
  const jeton = limiteur.echec(ip);
  if (!code || !(await verifierCode(code, c.empreinte))) {
    const apres = limiteur.etat(ip);
    if (apres.bloque) return bloque(apres.reessayerDans);
    return json({ erreur: 'code', restants: apres.restants }, 401);
  }

  limiteur.reussite(ip, jeton);
  return json({ deverrouille: true }, 200, { 'Set-Cookie': enteteCookie(signerSession(c.secret, c.version), { secure: c.secure }) });
};

export const DELETE: APIRoute = () => {
  const c = configCoffre();
  return json({ deverrouille: false }, 200, { 'Set-Cookie': enteteCookieEfface({ secure: c.secure }) });
};
