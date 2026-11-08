/* Champs : recherche (44 px, ou 56 px pour la grande recherche de l'accueil), champ de texte avec erreur, suggestions. */
import * as React from 'react';
import { IconeAlerte, IconeLoupe } from './icones';
import { decouper } from './theme';

type ChampRechercheProps = {
  label: string;               // toujours présent ; masqué visuellement si labelVisible=false
  labelVisible?: boolean;
  grande?: boolean;            // accueil uniquement
  surPage?: boolean;           // fond « Lecture » quand le champ est posé sur le fond de page
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function ChampRecherche({ label, labelVisible = true, grande = false, surPage = false, id, className, ...props }: ChampRechercheProps) {
  const autoId = React.useId();
  const champId = id ?? autoId;
  return (
    <div className={`aod-champ${className ? ' ' + className : ''}`}>
      <label htmlFor={champId} className={labelVisible ? 'aod-label' : 'aod-sr-only'}>{label}</label>
      <div className={`aod-recherche${grande ? ' aod-recherche--grande' : ''}`}>
        <span className="aod-recherche__icone"><IconeLoupe taille={grande ? 20 : 18} /></span>
        <input id={champId} type="search" autoComplete="off" className={`aod-input${surPage || grande ? ' aod-input--page' : ''}`} {...props} />
      </div>
    </div>
  );
}

type ChampTexteProps = { label: string; erreur?: string; surPage?: boolean; suffixe?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>;

/** Champ avec message d'erreur annoncé aux lecteurs d'écran (bordure 2 px Signe d'alerte). */
export function ChampTexte({ label, erreur, surPage, suffixe, id, ...props }: ChampTexteProps) {
  const autoId = React.useId();
  const champId = id ?? autoId;
  const erreurId = `${champId}-erreur`;
  return (
    <div className="aod-champ">
      <label htmlFor={champId} className="aod-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input id={champId} className={`aod-input${surPage ? ' aod-input--page' : ''}`} aria-invalid={erreur ? true : undefined}
          aria-describedby={erreurId} style={suffixe ? { paddingRight: 96 } : undefined} {...props} />
        {suffixe && <div style={{ position: 'absolute', right: 0, top: 0 }}>{suffixe}</div>}
      </div>
      <div id={erreurId} aria-live="assertive">
        {erreur && <p className="aod-erreur"><IconeAlerte style={{ flex: '0 0 auto', marginTop: 1 }} />{erreur}</p>}
      </div>
    </div>
  );
}

export function Surligne({ texte, requete }: { texte: string; requete: string }) {
  const p = decouper(texte, requete);
  if (!p) return <>{texte}</>;
  return <>{p.avant}<strong className="aod-surlignage">{p.trouve}</strong>{p.apres}</>;
}

/** Liste de suggestions sous une recherche : nombre de résultats annoncé, partie tapée surlignée. */
export function Suggestions({ requete, resultats, max = 6 }: { requete: string; resultats: { libelle: string; href: string }[]; max?: number }) {
  const n = resultats.length;
  return (
    <div className="aod-suggestions">
      <span className="aod-suggestions__compte" aria-live="polite">{n === 0 ? 'Aucun résultat' : n === 1 ? '1 résultat' : `${n} résultats`}</span>
      {resultats.slice(0, max).map((r) => (
        <a key={r.href + r.libelle} href={r.href} className="aod-suggestion"><span><Surligne texte={r.libelle} requete={requete} /></span></a>
      ))}
    </div>
  );
}
