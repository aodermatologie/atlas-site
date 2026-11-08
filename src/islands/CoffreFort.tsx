// Formulaire du coffre-fort. Le code est vérifié par le serveur ; ce composant n'en connaît rien.
import * as React from 'react';
import { Bouton, BoutonLien } from '../kit/Boutons';
import { ChampTexte } from '../kit/Champs';
import { IconeCadenas } from '../kit/icones';

type Etat = 'chargement' | 'ferme' | 'ouvert';

export default function CoffreFort() {
  const [etat, setEtat] = React.useState<Etat>('chargement');
  const [code, setCode] = React.useState('');
  const [montrer, setMontrer] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [bloqueJusqua, setBloqueJusqua] = React.useState(0);
  const [envoi, setEnvoi] = React.useState(false);
  const [, rafraichir] = React.useState(0);

  React.useEffect(() => {
    fetch('/api/coffre', { credentials: 'same-origin' })
      .then((r) => r.json()).then((d) => setEtat(d.deverrouille ? 'ouvert' : 'ferme')).catch(() => setEtat('ferme'));
  }, []);

  const restant = Math.max(0, Math.ceil((bloqueJusqua - Date.now()) / 1000));
  React.useEffect(() => {
    if (!restant) return;
    const t = setInterval(() => rafraichir((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [restant]);
  const bloque = restant > 0;

  const envoyer = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bloque || envoi || !code.trim()) return;
    setEnvoi(true);
    try {
      const r = await fetch('/api/coffre', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setEtat('ouvert'); setCode(''); setErreur(null); setMontrer(false); return; }
      if (r.status === 429) {
        setBloqueJusqua(Date.now() + (d.reessayerDans ?? 900) * 1000);
        setErreur('Trop d’essais. Patientez quelques minutes avant de réessayer.');
      } else if (r.status === 401) {
        setErreur('Code incorrect. Vérifiez la saisie et réessayez.');
      } else {
        setErreur('Le coffre-fort est momentanément indisponible. Réessayez plus tard.');
      }
    } catch {
      setErreur('Connexion impossible. Vérifiez votre réseau et réessayez.');
    } finally {
      setEnvoi(false);
    }
  };

  const reverrouiller = async () => {
    await fetch('/api/coffre', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    setEtat('ferme');
  };

  if (etat === 'chargement') return <div className="aod-carte aod-coffre__carte" aria-busy="true" style={{ minHeight: 180 }} />;

  if (etat === 'ouvert') {
    return (
      <div className="aod-carte aod-coffre__carte" role="status" style={{ borderColor: 'var(--aod-retenir)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="aod-tuile" style={{ width: 40, height: 40, borderRadius: 20 }}><IconeCadenas taille={20} /></span>
          <span className="aod-carte__titre">Photos débloquées</span>
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>Toutes les photos à accès restreint sont visibles dans les fiches et dans l’atlas jusqu’à la fermeture du navigateur.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <BoutonLien href="/pathologies" style={{ flex: '1 1 180px' }}>Voir les pathologies</BoutonLien>
          <Bouton variante="secondaire" onClick={reverrouiller} style={{ flex: '1 1 180px' }}>Verrouiller à nouveau</Bouton>
        </div>
      </div>
    );
  }

  return (
    <form className="aod-carte aod-coffre__carte" onSubmit={envoyer} noValidate>
      <ChampTexte label="Code d’accès" type={montrer ? 'text' : 'password'} autoComplete="off" autoCapitalize="characters" spellCheck={false}
        value={code} onChange={(e) => { setCode(e.target.value); if (!bloque) setErreur(null); }} erreur={erreur ?? undefined}
        suffixe={
          <button type="button" className="aod-btn aod-btn--discret aod-btn--compact" aria-pressed={montrer} onClick={() => setMontrer((m) => !m)} style={{ textDecoration: 'none' }}>
            {montrer ? 'Masquer' : 'Afficher'}
          </button>
        } />
      <Bouton type="submit" pleineLargeur aria-disabled={bloque || envoi}>{bloque ? `Réessayer dans ${Math.ceil(restant / 60)} min` : 'Déverrouiller les photos'}</Bouton>
    </form>
  );
}
