// Stockage des photos verrouillées.
// - en développement : un dossier local (STOCKAGE=local, dossier STOCKAGE_LOCAL/prive) ;
// - en production : un bucket S3 privé chez l'hébergeur (STOCKAGE=s3) — Cellar chez Clever Cloud.
// Les photos libres ne passent pas par ici : elles sont servies directement depuis le bucket public (PUBLIC_MEDIA_URL).
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { configS3 } from './s3.mjs';

const CLE_VALIDE = /^[a-z0-9][a-z0-9._-]{0,150}\.(webp|jpe?g|png)$/i;

export function cleValide(cle) {
  return typeof cle === 'string' && CLE_VALIDE.test(cle) && !cle.includes('..');
}

function typeDe(cle) {
  return cle.endsWith('.webp') ? 'image/webp' : cle.endsWith('.png') ? 'image/png' : 'image/jpeg';
}

export function creerStockage(env = process.env) {
  if ((env.STOCKAGE ?? 'local') === 's3') return stockageS3(env);
  return stockageLocal(env);
}

function stockageLocal(env) {
  const racine = path.resolve(env.STOCKAGE_LOCAL ?? './stockage-local', 'prive');
  return {
    nom: 'local',
    async lirePrive(cle) {
      if (!cleValide(cle)) return null;
      const chemin = path.resolve(racine, cle);
      if (!chemin.startsWith(racine + path.sep)) return null;
      try {
        const s = await stat(chemin);
        return { corps: Readable.toWeb(createReadStream(chemin)), type: typeDe(cle), taille: s.size };
      } catch {
        return null;
      }
    },
  };
}

function stockageS3(env) {
  let client = null;
  async function s3() {
    if (!client) {
      const { S3Client } = await import('@aws-sdk/client-s3');
      const { config, manquantes } = configS3(env);
      if (manquantes.length) throw new Error(`Stockage S3 : variables manquantes : ${manquantes.join(', ')}`);
      client = new S3Client(config);
    }
    return client;
  }
  return {
    nom: 's3',
    async lirePrive(cle) {
      if (!cleValide(cle)) return null;
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      try {
        const r = await (await s3()).send(new GetObjectCommand({ Bucket: env.S3_BUCKET_PRIVE, Key: cle }));
        return { corps: r.Body.transformToWebStream(), type: r.ContentType ?? typeDe(cle), taille: r.ContentLength };
      } catch (e) {
        if (e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404) return null;
        throw e;
      }
    },
  };
}
