// Coffre-fort : un seul code débloque toutes les photos verrouillées.
// - le code n'est jamais stocké en clair : seulement son empreinte scrypt (variable COFFRE_CODE_EMPREINTE) ;
// - un code juste ouvre une session signée (cookie HttpOnly, sans date d'expiration : il disparaît à la fermeture du navigateur) ;
// - les essais sont limités par adresse IP, avec en plus une limite globale contre les attaques réparties.
import { createHmac, randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export const NOM_COOKIE = 'aod_coffre';

/** « aod 2026 » et « AOD2026 » sont le même code : espaces ignorés, majuscules. */
export function normaliserCode(code) {
  return String(code ?? '').normalize('NFKC').replace(/\s+/g, '').toUpperCase();
}

const PARAMS = { N: 2 ** 15, r: 8, p: 1 };

export function hacherCode(code, params = PARAMS) {
  const sel = randomBytes(16);
  const h = scryptSync(normaliserCode(code), sel, 32, { ...params, maxmem: 128 * 1024 * 1024 });
  return ['scrypt', params.N, params.r, params.p, sel.toString('base64url'), h.toString('base64url')].join('$');
}

/** Asynchrone : le calcul (≈ 0,1 s, 32 Mo) ne bloque pas le serveur. Une empreinte mal formée donne « faux ». */
export async function verifierCode(code, empreinte) {
  if (!empreinte || typeof empreinte !== 'string') return false;
  const morceaux = empreinte.split('$');
  if (morceaux.length !== 6 || morceaux[0] !== 'scrypt') return false;
  const [, N, r, p, sel, h] = morceaux;
  try {
    const attendu = Buffer.from(h, 'base64url');
    const calcule = await scryptAsync(normaliserCode(code), Buffer.from(sel, 'base64url'), attendu.length,
      { N: Number(N), r: Number(r), p: Number(p), maxmem: 128 * 1024 * 1024 });
    return attendu.length > 0 && calcule.length === attendu.length && timingSafeEqual(calcule, attendu);
  } catch {
    return false;
  }
}

/* ---------- session signée ---------- */

function mac(secret, valeur) {
  return createHmac('sha256', secret).update(valeur).digest('base64url');
}

/** version : incrémenter COFFRE_VERSION invalide toutes les sessions (par exemple après un changement de code). */
export function signerSession(secret, version, maintenant = Date.now()) {
  const charge = Buffer.from(JSON.stringify({ v: String(version), t: maintenant })).toString('base64url');
  return `${charge}.${mac(secret, charge)}`;
}

/** Durée maximale côté serveur (12 h), au cas où le navigateur restaure ses cookies de session. */
export function lireSession(valeur, secret, version, { dureeMax = 12 * 3600 * 1000, maintenant = Date.now() } = {}) {
  if (!valeur || !secret || typeof valeur !== 'string') return false;
  const [charge, signature] = valeur.split('.');
  if (!charge || !signature) return false;
  const a = Buffer.from(signature);
  const b = Buffer.from(mac(secret, charge));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { v, t } = JSON.parse(Buffer.from(charge, 'base64url').toString('utf8'));
    return v === String(version) && typeof t === 'number' && maintenant - t >= 0 && maintenant - t < dureeMax;
  } catch {
    return false;
  }
}

export function enteteCookie(valeur, { secure = true } = {}) {
  // Pas de Max-Age ni d'Expires : cookie de session, effacé à la fermeture du navigateur.
  return `${NOM_COOKIE}=${valeur}; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
}

export function enteteCookieEfface({ secure = true } = {}) {
  return `${NOM_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

export function lireCookie(enteteCookies, nom = NOM_COOKIE) {
  if (!enteteCookies) return null;
  for (const morceau of enteteCookies.split(';')) {
    const i = morceau.indexOf('=');
    if (i > 0 && morceau.slice(0, i).trim() === nom) return morceau.slice(i + 1).trim();
  }
  return null;
}

/* ---------- limitation des essais ---------- */

export class Limiteur {
  constructor({ essais = 5, fenetre = 15 * 60 * 1000, globalMax = 200, globalFenetre = 60 * 60 * 1000 } = {}) {
    Object.assign(this, { essais, fenetre, globalMax, globalFenetre });
    this.parIp = new Map();
    this.global = [];
  }

  #nettoyer(maintenant) {
    this.global = this.global.filter((t) => maintenant - t < this.globalFenetre);
    for (const [ip, liste] of this.parIp) {
      const reste = liste.filter((t) => maintenant - t < this.fenetre);
      if (reste.length) this.parIp.set(ip, reste); else this.parIp.delete(ip);
    }
  }

  /** { bloque, reessayerDans (ms), restants } */
  etat(ip, maintenant = Date.now()) {
    this.#nettoyer(maintenant);
    if (this.global.length >= this.globalMax) {
      return { bloque: true, reessayerDans: this.globalFenetre - (maintenant - this.global[0]), restants: 0 };
    }
    const liste = this.parIp.get(ip) ?? [];
    if (liste.length >= this.essais) {
      return { bloque: true, reessayerDans: this.fenetre - (maintenant - liste[0]), restants: 0 };
    }
    return { bloque: false, reessayerDans: 0, restants: this.essais - liste.length };
  }

  /** Compte un essai. À appeler AVANT de vérifier le code : des requêtes simultanées ne peuvent pas dépasser la limite. */
  echec(ip, maintenant = Date.now()) {
    const liste = this.parIp.get(ip) ?? [];
    liste.push(maintenant);
    this.parIp.set(ip, liste);
    this.global.push(maintenant);
    return maintenant;
  }

  /** Code juste : on efface les essais de cette adresse et on retire l'essai du compteur global. */
  reussite(ip, jeton) {
    this.parIp.delete(ip);
    const i = jeton === undefined ? -1 : this.global.lastIndexOf(jeton);
    if (i >= 0) this.global.splice(i, 1);
  }
}

/* ---------- configuration ---------- */

export function configCoffre(env = process.env) {
  const secret = env.SESSION_SECRET ?? '';
  return {
    empreinte: env.COFFRE_CODE_EMPREINTE ?? '',
    secret,
    version: env.COFFRE_VERSION ?? '1',
    secure: env.COOKIE_SECURE !== 'false',
    pret: Boolean(env.COFFRE_CODE_EMPREINTE) && secret.length >= 32,
  };
}

/** Nombre de proxys de l'hébergeur devant le serveur (TRUST_PROXY=1 le plus souvent ; « true » vaut 1). */
export function sautsProxy(env = process.env) {
  const v = env.TRUST_PROXY;
  if (v === 'true') return 1;
  const n = Number.parseInt(v ?? '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Adresse du visiteur. Derrière un proxy, on lit X-Forwarded-For en partant de la droite :
    les entrées de gauche sont fournies par le navigateur et peuvent être falsifiées. */
export function adresseClient(request, clientAddress, env = process.env) {
  const sauts = sautsProxy(env);
  if (sauts > 0) {
    const liste = (request.headers.get('x-forwarded-for') ?? '').split(',').map((x) => x.trim()).filter(Boolean);
    if (liste.length >= sauts) return liste[liste.length - sauts];
  }
  return clientAddress ?? 'inconnue';
}
