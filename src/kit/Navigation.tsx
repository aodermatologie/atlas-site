/* Navigation : en-tête (ordinateur), barre du bas (mobile), fil d'Ariane, bouton jour/nuit.
   Les liens sont de simples <a href>. Avec un routeur (Next, React Router…), passez son composant de lien dans `Lien`. */
import * as React from 'react';
import { IconeAtlas, IconeCoffreFort, IconeDermoscopie, IconeLune, IconePathologies, IconeSoleil } from './icones';
import { IconeLupus } from './Lupus';
import { LivreCompact } from './Logo';
import { useTheme } from './theme';

export type IdModule = 'pathologies' | 'atlas' | 'lupus' | 'dermoscopie' | 'coffre-fort';

export type Module = { id: IdModule; libelle: string; etiquette?: string; href: string };

export const MODULES: Module[] = [
  { id: 'pathologies', libelle: 'Pathologies', href: '/pathologies' },
  { id: 'atlas', libelle: 'Atlas', href: '/atlas' },
  { id: 'lupus', libelle: 'Lupus', etiquette: "Lupus, l'assistant", href: '/lupus' },
  { id: 'dermoscopie', libelle: 'Dermoscopie', href: '/dermoscopie' },
  { id: 'coffre-fort', libelle: 'Coffre-fort', href: '/coffre-fort' },
];

type LienProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ComposantLien = React.ComponentType<LienProps>;
const LienParDefaut: ComposantLien = (p) => <a {...p} />;

function IconeModule({ id, actif, taille }: { id: IdModule; actif: boolean; taille: number }) {
  switch (id) {
    case 'pathologies': return <IconePathologies taille={taille} />;
    case 'atlas': return <IconeAtlas taille={taille} />;
    // Le loup n'a pas d'enveloppe : il est neutre au repos, sarcelle quand Lupus est ouvert.
    case 'lupus': return <IconeLupus taille={taille} variante={actif ? 'sarcelle' : 'neutre'} />;
    case 'dermoscopie': return <IconeDermoscopie taille={taille} />;
    case 'coffre-fort': return <IconeCoffreFort taille={taille} />;
  }
}

export function BoutonTheme({ className }: { className?: string }) {
  const { theme, basculer } = useTheme();
  const sombre = theme === 'dark';
  const etiquette = sombre ? 'Passer en mode clair' : 'Passer en mode sombre';
  return (
    <button type="button" className={`aod-icon-btn${className ? ' ' + className : ''}`} onClick={basculer} aria-label={etiquette} title={etiquette}>
      {sombre ? <IconeSoleil /> : <IconeLune />}
    </button>
  );
}

/** En-tête ordinateur : logo et « Atlas ouvert de dermatologie » à gauche, sections à droite, puis jour/nuit.
    Sous 760 px : « Atlas » seul, sections masquées (la barre du bas prend le relais). Sur l'accueil : avecLogo={false}. */
export function Entete({ actif, modules = MODULES, avecLogo = true, hrefAccueil = '/', Lien = LienParDefaut }:
  { actif?: IdModule; modules?: Module[]; avecLogo?: boolean; hrefAccueil?: string; Lien?: ComposantLien }) {
  return (
    <header className="aod-entete">
      {avecLogo && (
        <Lien href={hrefAccueil} className="aod-entete__marque" aria-label="Atlas ouvert de dermatologie, retour à l'accueil">
          <LivreCompact largeur={42} />
          <span className="aod-entete__nom">Atlas<span className="aod-entete__long"> <em>ouvert</em> de dermatologie</span></span>
        </Lien>
      )}
      <nav className="aod-entete__nav" aria-label="Modules">
        {modules.map((m) => {
          const estActif = m.id === actif;
          return (
            <Lien key={m.id} href={m.href} className={`aod-nav-lien${m.id === 'lupus' ? ' aod-nav-lien--lupus' : ''}`} aria-current={estActif ? 'page' : undefined}>
              <IconeModule id={m.id} actif={estActif} taille={18} />
              {m.libelle}
            </Lien>
          );
        })}
      </nav>
      <BoutonTheme className="aod-entete__theme" />
    </header>
  );
}

/** Barre du bas (mobile) : rectangle flottant, icônes seules, module actif dans un carré arrondi.
    Visible sous 760 px ; `toujours` pour une application uniquement mobile. */
export function BarreDuBas({ actif, modules = MODULES, toujours = false, Lien = LienParDefaut }:
  { actif?: IdModule; modules?: Module[]; toujours?: boolean; Lien?: ComposantLien }) {
  return (
    <nav className={`aod-barre${toujours ? ' aod-barre--toujours' : ''}`} aria-label="Modules">
      {modules.map((m) => {
        const estActif = m.id === actif;
        return (
          <Lien key={m.id} href={m.href} aria-label={m.etiquette ?? m.libelle} aria-current={estActif ? 'page' : undefined}
            className={`aod-barre__lien${m.id === 'lupus' ? ' aod-barre__lien--lupus' : ''}`}>
            <span className="aod-barre__selecteur"><IconeModule id={m.id} actif={estActif} taille={24} /></span>
          </Lien>
        );
      })}
    </nav>
  );
}

export function FilAriane({ niveaux, Lien = LienParDefaut }: { niveaux: { libelle: string; href?: string }[]; Lien?: ComposantLien }) {
  return (
    <nav className="aod-ariane" aria-label="Fil d'Ariane">
      {niveaux.map((n, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {n.href ? <Lien href={n.href}>{n.libelle}</Lien> : <span aria-current="page">{n.libelle}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}
