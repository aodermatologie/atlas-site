// npm test : le stockage local ne sort jamais de son dossier et renvoie bien les photos.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { cleValide, creerStockage } from '../src/lib/stockage.mjs';

let dossier;
before(async () => {
  dossier = await mkdtemp(path.join(tmpdir(), 'aod-'));
  await mkdir(path.join(dossier, 'prive'));
  await writeFile(path.join(dossier, 'prive', 'photo-480.webp'), Buffer.from('RIFF....WEBP'));
  await writeFile(path.join(dossier, 'secret.txt'), 'ne doit pas sortir');
});
after(() => rm(dossier, { recursive: true, force: true }));

test('noms de fichiers acceptés et refusés', () => {
  assert.equal(cleValide('acne-front-01-480.webp'), true);
  for (const k of ['../secret.txt', '..%2fsecret.webp', '/etc/passwd', 'a/b.webp', 'photo.svg', '', '.cache.webp', 'x..webp']) {
    assert.equal(cleValide(k), false, k);
  }
});

test('lecture d’une photo privée', async () => {
  const s = creerStockage({ STOCKAGE: 'local', STOCKAGE_LOCAL: dossier });
  const f = await s.lirePrive('photo-480.webp');
  assert.ok(f);
  assert.equal(f.type, 'image/webp');
  const corps = Buffer.from(await new Response(f.corps).arrayBuffer());
  assert.equal(corps.toString(), 'RIFF....WEBP');
});

test('photo absente ou chemin détourné : rien', async () => {
  const s = creerStockage({ STOCKAGE: 'local', STOCKAGE_LOCAL: dossier });
  assert.equal(await s.lirePrive('absente-480.webp'), null);
  assert.equal(await s.lirePrive('../secret.txt'), null);
});

test('S3 : variables explicites, ou celles de l’add-on Cellar de Clever Cloud', async () => {
  const { configS3 } = await import('../src/lib/s3.mjs');
  const cellar = configS3({ CELLAR_ADDON_HOST: 'cellar-c2.services.clever-cloud.com', CELLAR_ADDON_KEY_ID: 'id', CELLAR_ADDON_KEY_SECRET: 'secret' });
  assert.equal(cellar.manquantes.length, 0);
  assert.equal(cellar.config.endpoint, 'https://cellar-c2.services.clever-cloud.com');
  assert.equal(cellar.config.credentials.accessKeyId, 'id');
  assert.equal(cellar.config.region, 'default', 'région littérale « default » pour Cellar');
  const avecSchema = configS3({ CELLAR_ADDON_HOST: 'https://cellar-c2.services.clever-cloud.com', CELLAR_ADDON_KEY_ID: 'i', CELLAR_ADDON_KEY_SECRET: 's' });
  assert.equal(avecSchema.config.endpoint, 'https://cellar-c2.services.clever-cloud.com');
  const explicite = configS3({ S3_ENDPOINT: 'https://s3.exemple', S3_ACCESS_KEY: 'a', S3_SECRET_KEY: 'b', CELLAR_ADDON_HOST: 'autre' });
  assert.equal(explicite.config.endpoint, 'https://s3.exemple');
  assert.equal(configS3({}).manquantes.length, 3);
});
