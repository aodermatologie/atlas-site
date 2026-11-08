// Barre latérale des pathologies : recherche + liste alphabétique, partie tapée surlignée.
// Sur mobile, la liste est repliée derrière un bouton tant qu'on ne cherche pas.
import * as React from 'react';
import { ChampRecherche, Surligne } from '../kit/Champs';
import { IconeChevronBas } from '../kit/icones';
import { replier } from '../kit/theme';
import type { ElementListe } from '../lib/site';

export default function ListePathologies({ elements, courant }: { elements: ElementListe[]; courant?: string }) {
  const [q, setQ] = React.useState('');
  const [deplie, setDeplie] = React.useState(false);
  const qf = replier(q.trim()).join('');
  const correspond = (e: ElementListe) => !qf || replier(e.titre).join('').includes(qf);
  const n = elements.filter(correspond).length;
  const listeId = React.useId();

  return (
    <>
      <ChampRecherche label="Rechercher une pathologie" placeholder="Psoriasis, zona…" value={q} onChange={(e) => setQ(e.target.value)} />
      <span className="aod-compteur" aria-live="polite" style={{ fontSize: 13 }}>
        {qf ? (n === 0 ? 'Aucun résultat' : n === 1 ? '1 résultat' : `${n} résultats`) : `${elements.length} pathologies`}
      </span>
      <button type="button" className="aod-btn aod-btn--discret aod-btn--compact aod-bouton-liste" aria-expanded={deplie} aria-controls={listeId}
        onClick={() => setDeplie((d) => !d)} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
        {deplie ? 'Masquer la liste' : `Toutes les pathologies (${elements.length})`}
        <IconeChevronBas taille={16} style={{ transform: deplie ? 'rotate(180deg)' : undefined }} />
      </button>
      <ul id={listeId} className={`aod-liste-patho${!qf && !deplie ? ' aod-liste-patho--repliee' : ''}`}>
        {elements.map((e) => (
          <li key={e.id} className={correspond(e) ? undefined : 'aod-liste-patho__masque'}>
            {e.href ? (
              <a href={e.href} aria-current={e.id === courant ? 'page' : undefined}><span style={{ padding: 0, minHeight: 0 }}><Surligne texte={e.titre} requete={q} /></span></a>
            ) : (
              <span className="aod-a-venir"><Surligne texte={e.titre} requete={q} /><small>à venir</small></span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
