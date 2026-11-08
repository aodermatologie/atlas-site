// Calcule l'empreinte du code du coffre-fort, à mettre dans la variable COFFRE_CODE_EMPREINTE.
//   npm run coffre:hacher -- "MON CODE"
// Le code lui-même n'est jamais enregistré. Après un changement de code, augmentez COFFRE_VERSION
// pour fermer toutes les sessions ouvertes avec l'ancien.
import { randomBytes } from 'node:crypto';
import { hacherCode, normaliserCode } from '../src/lib/coffre.mjs';

const code = process.argv.slice(2).join(' ');
if (!code) {
  console.error('Usage : npm run coffre:hacher -- "VOTRE CODE"');
  process.exit(1);
}
if (normaliserCode(code).length < 8) {
  console.warn('⚠ Code court : 8 caractères ou plus sont recommandés (les espaces et la casse sont ignorés).');
}
console.log('\nCOFFRE_CODE_EMPREINTE=' + hacherCode(code));
console.log('\nSi vous n’avez pas encore de secret de session :');
console.log('SESSION_SECRET=' + randomBytes(32).toString('base64url') + '\n');
