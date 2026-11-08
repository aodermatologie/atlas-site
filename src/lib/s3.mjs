// Paramètres S3 communs au serveur et au script d'envoi des photos.
// Variables S3_* explicites, ou à défaut celles qu'ajoute l'add-on Cellar de Clever Cloud quand il est relié à l'application.
export function configS3(env = process.env) {
  const hoteCellar = env.CELLAR_ADDON_HOST;
  const c = {
    endpoint: env.S3_ENDPOINT || (hoteCellar ? `https://${hoteCellar}` : undefined),
    region: env.S3_REGION || 'us-east-1',
    forcePathStyle: env.S3_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY || env.CELLAR_ADDON_KEY_ID,
      secretAccessKey: env.S3_SECRET_KEY || env.CELLAR_ADDON_KEY_SECRET,
    },
  };
  const manquantes = [
    !c.endpoint && 'S3_ENDPOINT (ou CELLAR_ADDON_HOST)',
    !c.credentials.accessKeyId && 'S3_ACCESS_KEY (ou CELLAR_ADDON_KEY_ID)',
    !c.credentials.secretAccessKey && 'S3_SECRET_KEY (ou CELLAR_ADDON_KEY_SECRET)',
  ].filter(Boolean);
  return { config: c, manquantes };
}
