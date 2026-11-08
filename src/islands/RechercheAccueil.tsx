// Grande recherche de l'accueil : suggestions au fil de la frappe, sans tenir compte des accents.
// Flèches haut/bas pour choisir, Entrée pour ouvrir, Échap pour fermer.
import * as React from 'react';
import { ChampRecherche, Surligne } from '../kit/Champs';
import { replier } from '../kit/theme';
import type { ElementListe } from '../lib/site';

export default function RechercheAccueil({ elements }: { elements: ElementListe[] }) {
  const [q, setQ] = React.useState('');
  const [choix, setChoix] = React.useState(0);
  const qf = replier(q.trim()).join('');
  const resultats = qf ? elements.filter((e) => replier(e.titre).join('').includes(qf)) : [];
  const visibles = resultats.slice(0, 6);
  const listeId = React.useId();

  const ouvrir = (e: ElementListe) => { if (e.href) window.location.href = e.href; };
  const touche = (ev: React.KeyboardEvent) => {
    if (!visibles.length) return;
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setChoix((c) => (c + 1) % visibles.length); }
    if (ev.key === 'ArrowUp') { ev.preventDefault(); setChoix((c) => (c - 1 + visibles.length) % visibles.length); }
    if (ev.key === 'Enter') { ev.preventDefault(); ouvrir(visibles[choix]); }
    if (ev.key === 'Escape') setQ('');
  };

  return (
    <div className="aod-recherche-accueil">
      <ChampRecherche label="Rechercher une pathologie" labelVisible={false} grande placeholder="Rechercher une pathologie : psoriasis, zona…"
        value={q} onChange={(e) => { setQ(e.target.value); setChoix(0); }} onKeyDown={touche}
        role="combobox" aria-expanded={visibles.length > 0} aria-controls={listeId} aria-autocomplete="list" />
      {qf && (
        <div className="aod-suggestions" id={listeId} role="listbox" aria-label="Suggestions">
          <span className="aod-suggestions__compte" aria-live="polite">
            {resultats.length === 0 ? 'Aucune pathologie trouvée' : resultats.length === 1 ? '1 pathologie' : `${resultats.length} pathologies`}
          </span>
          {visibles.map((e, i) =>
            e.href ? (
              <a key={e.id} href={e.href} className="aod-suggestion" role="option" aria-selected={i === choix}>
                <span><Surligne texte={e.titre} requete={q} /></span>
              </a>
            ) : (
              <span key={e.id} className="aod-suggestion" role="option" aria-selected={i === choix} aria-disabled="true" style={{ color: 'var(--aod-inactif)' }}>
                <span><Surligne texte={e.titre} requete={q} /></span>
                <small style={{ marginLeft: 'auto', fontSize: 11 }}>fiche à venir</small>
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
