// npm test : la mise en forme des fiches (sections repliables, encadrés).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import rehypeFiche from '../src/plugins/rehype-fiche.mjs';

const el = (tagName, children = [], properties = {}) => ({ type: 'element', tagName, properties, children });
const t = (value) => ({ type: 'text', value });

test('« ## Titre | sous-titre » devient une section repliable fermée', () => {
  const arbre = { type: 'root', children: [el('p', [t('intro')]), el('h2', [t('Clinique | Lésions')], { id: 'clinique' }), el('p', [t('a')]), el('h2', [t('Traitement')]), el('p', [t('b')])] };
  rehypeFiche()(arbre);
  assert.equal(arbre.children.length, 3);
  const [intro, s1, s2] = arbre.children;
  assert.equal(intro.tagName, 'p');
  assert.equal(s1.tagName, 'details');
  assert.equal(s1.properties.open, undefined, 'fermée par défaut');
  const resume = s1.children[0];
  assert.equal(resume.tagName, 'summary');
  const textes = resume.children[0].children;
  assert.equal(textes[0].tagName, 'h2');
  assert.equal(textes[0].children[0].value, 'Clinique');
  assert.equal(textes[0].properties.id, 'clinique');
  assert.equal(textes[1].children[0].value, 'Lésions');
  assert.equal(s1.children[1].children[0].children[0].value, 'a');
  assert.equal(s2.children[0].children[0].children.length, 1, 'pas de sous-titre');
});

test('« > [!ALERTE] » devient un encadré d’alerte', () => {
  const arbre = { type: 'root', children: [el('blockquote', [t('\n'), el('p', [t('[!ALERTE]\nAcné fulminans.')]), t('\n')])] };
  rehypeFiche()(arbre);
  const e = arbre.children[0];
  assert.equal(e.tagName, 'div');
  assert.deepEqual(e.properties.className, ['aod-encadre', 'aod-encadre--alerte']);
  assert.equal(e.children[0].children[0].value, 'Signe d’alerte');
  assert.equal(e.children[1].children[0].children[0].value, 'Acné fulminans.');
});

test('une citation ordinaire reste une citation', () => {
  const arbre = { type: 'root', children: [el('blockquote', [el('p', [t('Citation.')])])] };
  rehypeFiche()(arbre);
  assert.equal(arbre.children[0].tagName, 'blockquote');
});

test('« [[photos]] » marque l’emplacement des photos et le sous-titre de la section', () => {
  const arbre = { type: 'root', children: [el('h2', [t('Clinique | Lésions')]), el('p', [t('a')]), el('p', [t(' [[photos]] ')]), el('p', [t('b')])] };
  rehypeFiche()(arbre);
  const section = arbre.children[0];
  const contenu = section.children[1].children;
  assert.equal(contenu.length, 3);
  assert.equal(contenu[1].tagName, 'div');
  assert.equal(contenu[1].properties.dataAodPhotos, '');
  const sousTitre = section.children[0].children[0].children[1];
  assert.equal(sousTitre.children[1].properties.dataAodNbPhotos, '');
});
