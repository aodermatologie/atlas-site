// Serveur de production : Express + en-têtes de sécurité + pages statiques + routes /api d'Astro.
// Lancer après `npm run build` : `npm start` (ou l'image Docker).
import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { handler as astro } from './dist/server/entry.mjs';
import { sautsProxy } from './src/lib/coffre.mjs';

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';
const MEDIA = process.env.PUBLIC_MEDIA_URL && /^https?:\/\//.test(process.env.PUBLIC_MEDIA_URL)
  ? new URL(process.env.PUBLIC_MEDIA_URL).origin
  : null;

const app = express();
app.disable('x-powered-by');
if (sautsProxy() > 0) app.set('trust proxy', sautsProxy());

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"], // scripts d'amorçage des îlots Astro (à durcir avec des empreintes plus tard)
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', ...(MEDIA ? [MEDIA] : [])],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      // En local (http), pas de passage forcé en https.
      'upgrade-insecure-requests': process.env.COOKIE_SECURE === 'false' ? null : [],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: process.env.COOKIE_SECURE === 'false' ? false : { maxAge: 31536000, includeSubDomains: true },
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  next();
});

app.get('/api/sante', (req, res) => res.json({ ok: true }));

// Fichiers générés avec une empreinte dans leur nom : cache long.
app.use('/_astro', express.static('dist/client/_astro', { immutable: true, maxAge: '1y', fallthrough: false }));
// Pages et fichiers publics.
app.use(express.static('dist/client', { maxAge: '10m', extensions: ['html'] }));
// Routes dynamiques (/api/coffre, /api/photos/…).
app.use(astro);
// Tout le reste : page 404 d'Atlas.
const PAGE_404 = fileURLToPath(new URL('./dist/client/404.html', import.meta.url));
app.use((req, res) => res.status(404).sendFile(PAGE_404, { headers: { 'Cache-Control': 'no-store' } }));
// Erreur imprévue : on ne renvoie aucun détail technique au navigateur.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).type('text/plain').send('Erreur du serveur');
});

app.listen(PORT, HOST, () => console.log(`Atlas en ligne sur http://${HOST}:${PORT}`));
