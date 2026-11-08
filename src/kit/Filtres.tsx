/* Filtres : filtre déroulant à cases (ordinateur), volet par le bas (mobile), pastilles des filtres actifs, case à cocher.
   Logique de l'Atlas : « ou » dans un même filtre, « et » entre les filtres. */
import * as React from 'react';
import { IconeChevronBas, IconeCoche, IconeFermer } from './icones';
import { Bouton } from './Boutons';

export type Option = { valeur: string; libelle: string; compte?: number };

export function CaseACocher({ cochee }: { cochee: boolean }) {
  return <span className={`aod-case${cochee ? ' aod-case--cochee' : ''}`} aria-hidden="true">{cochee && <IconeCoche taille={12} />}</span>;
}

function Options({ options, selection, basculer }: { options: Option[]; selection: string[]; basculer: (v: string) => void }) {
  return (
    <>
      {options.map((o) => {
        const on = selection.includes(o.valeur);
        return (
          <button key={o.valeur} type="button" role="menuitemcheckbox" aria-checked={on} className="aod-option" onClick={() => basculer(o.valeur)}>
            <CaseACocher cochee={on} />
            <span>{o.libelle}</span>
            {o.compte !== undefined && <span className="aod-option__compte">{o.compte}</span>}
          </button>
        );
      })}
    </>
  );
}

type FiltreProps = { titre: string; options: Option[]; selection: string[]; onChange: (selection: string[]) => void };

export function FiltreDeroulant({ titre, options, selection, onChange }: FiltreProps) {
  const [ouvert, setOuvert] = React.useState(false);
  const racine = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: MouseEvent) => { if (racine.current && !racine.current.contains(e.target as Node)) setOuvert(false); };
    const echap = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    document.addEventListener('mousedown', dehors);
    document.addEventListener('keydown', echap);
    return () => { document.removeEventListener('mousedown', dehors); document.removeEventListener('keydown', echap); };
  }, [ouvert]);

  const basculer = (v: string) => onChange(selection.includes(v) ? selection.filter((x) => x !== v) : [...selection, v]);
  const n = selection.length;
  return (
    <div className="aod-filtre-wrap" ref={racine}>
      <button type="button" className={`aod-filtre${n ? ' aod-filtre--actif' : ''}`} aria-expanded={ouvert} aria-haspopup="true" aria-controls={menuId} onClick={() => setOuvert((o) => !o)}>
        {n ? `${titre} · ${n}` : titre}
        <IconeChevronBas taille={16} className="aod-filtre__chevron" />
      </button>
      {ouvert && (
        <div className="aod-menu" role="menu" id={menuId} aria-label={titre}>
          <Options options={options} selection={selection} basculer={basculer} />
        </div>
      )}
    </div>
  );
}

/** Volet mobile : mêmes options, en 48 px, avec « Effacer » et un bouton principal qui annonce le nombre de résultats. */
export function VoletFiltre({ titre, options, selection, onChange, ouvert, onFermer, libelleAction }:
  FiltreProps & { ouvert: boolean; onFermer: () => void; libelleAction: string }) {
  React.useEffect(() => {
    if (!ouvert) return;
    const echap = (e: KeyboardEvent) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', echap);
    return () => document.removeEventListener('keydown', echap);
  }, [ouvert, onFermer]);
  if (!ouvert) return null;
  const basculer = (v: string) => onChange(selection.includes(v) ? selection.filter((x) => x !== v) : [...selection, v]);
  return (
    <>
      <div className="aod-volet-fond" onClick={onFermer} />
      <div className="aod-volet" role="dialog" aria-modal="true" aria-label={titre}>
        <span className="aod-volet__poignee" aria-hidden="true" />
        <div className="aod-volet__entete">
          <span className="aod-volet__titre">{titre}</span>
          <Bouton variante="discret" compact style={{ marginLeft: 'auto', textDecoration: 'none' }} onClick={() => onChange([])}>Effacer</Bouton>
        </div>
        <div className="aod-volet__corps"><Options options={options} selection={selection} basculer={basculer} /></div>
        <div className="aod-volet__pied"><Bouton pleineLargeur onClick={onFermer}>{libelleAction}</Bouton></div>
      </div>
    </>
  );
}

/** Pastille d'un filtre actif : se retire d'un clic. */
export function Pastille({ libelle, onRetirer }: { libelle: string; onRetirer: () => void }) {
  return (
    <button type="button" className="aod-pastille" onClick={onRetirer} aria-label={`Retirer le filtre ${libelle}`}>
      {libelle}<IconeFermer taille={14} />
    </button>
  );
}
