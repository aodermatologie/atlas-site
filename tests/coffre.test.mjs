// npm test : vérifie le code, la session, le cookie et la limite d'essais du coffre-fort.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  Limiteur, adresseClient, configCoffre, enteteCookie, enteteCookieEfface, hacherCode, lireCookie, lireSession, normaliserCode,
  signerSession, verifierCode,
} from '../src/lib/coffre.mjs';

const RAPIDE = { N: 2 ** 10, r: 8, p: 1 }; // paramètres allégés pour les tests uniquement
const SECRET = 'x'.repeat(40);

test('le code est normalisé : espaces et casse ignorés', () => {
  assert.equal(normaliserCode(' aod 2026 '), 'AOD2026');
  assert.equal(normaliserCode('Ａｏｄ２０２６'), 'AOD2026'); // caractères pleine chasse
});

test('empreinte : bon code accepté, mauvais refusé, code jamais en clair', async () => {
  const e = hacherCode('Peau Lisse 42', RAPIDE);
  assert.ok(e.startsWith('scrypt$'));
  assert.ok(!e.toUpperCase().includes('PEAULISSE'));
  assert.equal(await verifierCode('peaulisse42', e), true);
  assert.equal(await verifierCode('peaulisse43', e), false);
  assert.equal(await verifierCode('', e), false);
});

test('deux empreintes du même code diffèrent (sel aléatoire)', () => {
  assert.notEqual(hacherCode('ABC', RAPIDE), hacherCode('ABC', RAPIDE));
});

test('empreinte absente ou mal formée : refus, sans plantage', async () => {
  assert.equal(await verifierCode('x', ''), false);
  assert.equal(await verifierCode('x', 'n’importe quoi'), false);
  assert.equal(await verifierCode('x', 'scrypt$3$8$1$AAAA$BBBB'), false); // N invalide
});

test('session signée : valide, falsifiée, expirée, version changée', () => {
  const maintenant = 1_800_000_000_000;
  const s = signerSession(SECRET, '1', maintenant);
  assert.equal(lireSession(s, SECRET, '1', { maintenant: maintenant + 1000 }), true);
  assert.equal(lireSession(s, 'y'.repeat(40), '1', { maintenant }), false, 'autre secret');
  assert.equal(lireSession(s.replace(/^./, (c) => (c === 'e' ? 'f' : 'e')), SECRET, '1', { maintenant }), false, 'charge modifiée');
  assert.equal(lireSession(s, SECRET, '2', { maintenant }), false, 'COFFRE_VERSION augmentée');
  assert.equal(lireSession(s, SECRET, '1', { maintenant: maintenant + 12 * 3600 * 1000 }), false, 'plus de 12 h');
  assert.equal(lireSession(s, SECRET, '1', { maintenant: maintenant - 1 }), false, 'date dans le futur');
  assert.equal(lireSession('', SECRET, '1'), false);
  assert.equal(lireSession('abc', SECRET, '1'), false);
});

test('cookie de session : HttpOnly, SameSite=Strict, Secure, sans date d’expiration', () => {
  const c = enteteCookie('valeur');
  assert.match(c, /HttpOnly/);
  assert.match(c, /SameSite=Strict/);
  assert.match(c, /Secure/);
  assert.doesNotMatch(c, /Max-Age|Expires/i);
  assert.doesNotMatch(enteteCookie('v', { secure: false }), /Secure/);
  assert.match(enteteCookieEfface(), /Max-Age=0/);
  assert.equal(lireCookie('a=1; aod_coffre=abc.def; b=2'), 'abc.def');
  assert.equal(lireCookie('a=1'), null);
});

test('limite : 5 essais par adresse sur 15 minutes', () => {
  const l = new Limiteur({ essais: 5, fenetre: 15 * 60 * 1000 });
  const t0 = 1_000_000;
  for (let i = 0; i < 5; i++) {
    assert.equal(l.etat('1.1.1.1', t0).bloque, false);
    l.echec('1.1.1.1', t0);
  }
  const e = l.etat('1.1.1.1', t0 + 1000);
  assert.equal(e.bloque, true);
  assert.ok(e.reessayerDans > 0 && e.reessayerDans <= 15 * 60 * 1000);
  assert.equal(l.etat('2.2.2.2', t0).bloque, false, 'une autre adresse n’est pas bloquée');
  assert.equal(l.etat('1.1.1.1', t0 + 15 * 60 * 1000).bloque, false, 'débloquée après 15 minutes');
});

test('limite globale contre les essais répartis sur beaucoup d’adresses', () => {
  const l = new Limiteur({ essais: 5, globalMax: 10 });
  for (let i = 0; i < 10; i++) l.echec(`10.0.0.${i}`, 1000);
  assert.equal(l.etat('99.9.9.9', 1001).bloque, true);
});

test('un code juste efface les essais de l’adresse', () => {
  const l = new Limiteur({ essais: 5 });
  for (let i = 0; i < 4; i++) l.echec('1.1.1.1', 1000);
  const jeton = l.echec('1.1.1.1', 1000);
  l.reussite('1.1.1.1', jeton);
  assert.equal(l.etat('1.1.1.1', 1001).restants, 5);
  assert.equal(l.global.length, 4);
});

test('adresse du visiteur : X-Forwarded-For lu depuis la droite, seulement derrière un proxy déclaré', () => {
  const req = new Request('http://x', { headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.7' } });
  assert.equal(adresseClient(req, '10.0.0.1', {}), '10.0.0.1', 'sans TRUST_PROXY, en-tête ignoré');
  assert.equal(adresseClient(req, '10.0.0.1', { TRUST_PROXY: '1' }), '203.0.113.7', 'l’entrée falsifiable de gauche est ignorée');
  assert.equal(adresseClient(req, '10.0.0.1', { TRUST_PROXY: 'true' }), '203.0.113.7');
  assert.equal(adresseClient(req, '10.0.0.1', { TRUST_PROXY: '2' }), '6.6.6.6');
});

test('configuration : le coffre reste fermé tant que la configuration est incomplète', () => {
  assert.equal(configCoffre({}).pret, false);
  assert.equal(configCoffre({ COFFRE_CODE_EMPREINTE: 'scrypt$…', SESSION_SECRET: 'court' }).pret, false);
  assert.equal(configCoffre({ COFFRE_CODE_EMPREINTE: 'scrypt$…', SESSION_SECRET: SECRET }).pret, true);
  assert.equal(configCoffre({}).secure, true, 'cookie Secure par défaut');
});
