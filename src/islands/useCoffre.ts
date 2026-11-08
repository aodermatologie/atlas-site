// Demande au serveur si le coffre-fort est ouvert pour ce navigateur et, si oui, récupère les légendes
// des photos verrouillées. Le navigateur ne voit jamais le cookie (HttpOnly) : seule la réponse du serveur fait foi.
import * as React from 'react';

export type DetailsVerrouillees = Record<string, { legende: string; alt: string; source?: string }>;

export function useCoffre(): { ouvert: boolean; details: DetailsVerrouillees } {
  const [etat, setEtat] = React.useState<{ ouvert: boolean; details: DetailsVerrouillees }>({ ouvert: false, details: {} });
  React.useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const r = await fetch('/api/coffre', { credentials: 'same-origin', cache: 'no-store' });
        const d = r.ok ? await r.json() : { deverrouille: false };
        if (!d.deverrouille) return;
        const r2 = await fetch('/api/photos', { credentials: 'same-origin', cache: 'no-store' });
        const details: DetailsVerrouillees = r2.ok ? await r2.json() : {};
        if (actif) setEtat({ ouvert: true, details });
      } catch {
        /* réseau indisponible : les photos restent verrouillées */
      }
    })();
    return () => { actif = false; };
  }, []);
  return etat;
}
