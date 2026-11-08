// Prépare les photos pour le web à partir des originaux de photos-sources/ :
// - redressées selon leur orientation, redimensionnées en 480 et 1600 px, converties en WebP ;
// - toutes les métadonnées (EXIF : date, appareil, position GPS…) sont supprimées, et c'est vérifié ;
// - photos libres → stockage public ; photos verrouillées → stockage privé.
//
//   npm run photos:preparer              → copies locales (public/medias et stockage-local/prive), pour le développement
//   npm run photos:envoyer               → envoi dans les buckets S3 de l'hébergeur (variables S3_* requises)
//
// Les originaux (photos-sources/) ne doivent jamais être mis dans Git : ils sont dans .gitignore.
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { load as lireYaml } from 'js-yaml';
import sharp from 'sharp';

const ENVOYER = process.argv.includes('--envoyer');
const TAILLES = [480, 1600];
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic'];

const sources = 'photos-sources';
if (!existsSync(sources)) {
  console.error('Dossier photos-sources/ absent : créez-le et déposez-y les fichiers originaux (il ne part jamais sur GitHub).');
  process.exit(1);
}

const photos = lireYaml(await readFile('src/content/photos/photos.yaml', 'utf8'));
const fichiers = await readdir(sources);

let s3 = null;
if (ENVOYER) {
  const { configS3 } = await import('../src/lib/s3.mjs');
  const { config, manquantes } = configS3();
  for (const v of ['S3_BUCKET_PUBLIC', 'S3_BUCKET_PRIVE']) if (!process.env[v]) manquantes.push(v);
  if (manquantes.length) throw new Error(`Variables manquantes (voir .env.example) : ${manquantes.join(', ')}`);
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const client = new S3Client(config);
  s3 = (bucket, cle, corps, cache) => client.send(new PutObjectCommand({ Bucket: bucket, Key: cle, Body: corps, ContentType: 'image/webp', CacheControl: cache }));
}

let n = 0;
for (const p of photos) {
  const original = fichiers.find((f) => path.parse(f).name === p.fichier && EXTENSIONS.includes(path.extname(f).toLowerCase()));
  if (!original) {
    console.error(`✗ ${p.id} : aucun fichier « ${p.fichier}.* » dans ${sources}/`);
    process.exitCode = 1;
    continue;
  }
  const prive = p.acces === 'verrouillee';
  for (const largeur of TAILLES) {
    const sortie = await sharp(path.join(sources, original))
      .rotate()
      .resize({ width: largeur, height: largeur, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const meta = await sharp(sortie).metadata();
    if (meta.exif || meta.xmp || meta.iptc) throw new Error(`${p.id} : des métadonnées subsistent, envoi annulé`);
    const cle = `${p.fichier}-${largeur}.webp`;
    if (ENVOYER) {
      await s3(prive ? process.env.S3_BUCKET_PRIVE : process.env.S3_BUCKET_PUBLIC, cle, sortie,
        prive ? 'private, no-store' : 'public, max-age=31536000, immutable');
    } else {
      const dossier = prive ? path.join(process.env.STOCKAGE_LOCAL ?? 'stockage-local', 'prive') : 'public/medias';
      await mkdir(dossier, { recursive: true });
      await writeFile(path.join(dossier, cle), sortie);
    }
  }
  n += 1;
  console.log(`✓ ${p.id} → ${prive ? 'privé (coffre-fort)' : 'public'}`);
}
console.log(`${n} photo(s) préparée(s)${ENVOYER ? ' et envoyée(s)' : ''}, métadonnées supprimées.`);
