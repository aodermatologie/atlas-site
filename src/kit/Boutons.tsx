/* Boutons : principal (une seule action principale par vue), secondaire, discret, sur fond sombre.
   48 px, ou 44 px en compact. Jamais en dessous de 44 px. */
import * as React from 'react';

type Variante = 'principal' | 'secondaire' | 'discret' | 'sur-sombre';

type CommunBouton = { variante?: Variante; compact?: boolean; pleineLargeur?: boolean; icone?: React.ReactNode };

function classes(variante: Variante, compact?: boolean, pleineLargeur?: boolean, extra?: string) {
  return ['aod-btn', `aod-btn--${variante}`, compact && 'aod-btn--compact', pleineLargeur && 'aod-btn--pleine-largeur', extra].filter(Boolean).join(' ');
}

export function Bouton({ variante = 'principal', compact, pleineLargeur, icone, className, children, type = 'button', ...props }:
  CommunBouton & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes(variante, compact, pleineLargeur, className)} {...props}>
      {icone}{children}
    </button>
  );
}

/** Même apparence qu'un bouton, mais c'est un lien (navigation). */
export function BoutonLien({ variante = 'principal', compact, pleineLargeur, icone, className, children, ...props }:
  CommunBouton & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={classes(variante, compact, pleineLargeur, className)} {...props}>
      {icone}{children}
    </a>
  );
}

type VarianteIcone = 'contour' | 'plein' | 'rond' | 'sur-sombre';

/** Bouton icône 44 × 44 px. L'étiquette est obligatoire : elle est lue par les lecteurs d'écran. */
export function BoutonIcone({ etiquette, variante = 'contour', className, children, type = 'button', ...props }:
  { etiquette: string; variante?: VarianteIcone } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = variante === 'contour' ? '' : variante === 'rond' ? ' aod-icon-btn--rond' : ` aod-icon-btn--${variante}`;
  return (
    <button type={type} aria-label={etiquette} title={etiquette} className={`aod-icon-btn${v}${className ? ' ' + className : ''}`} {...props}>
      {children}
    </button>
  );
}
