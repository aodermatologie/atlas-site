/* Cartes, listes, sections repliables, encadrés et états. */
import * as React from 'react';
import { IconeChevronBas, IconeChevronDroite, IconeFleche } from './icones';
import { AvatarLupus } from './Lupus';

/* ---------- Cartes ---------- */

/** Accueil : tuile d'icône sarcelle clair, titre, une phrase. */
export function CarteModule({ titre, texte, icone, href }: { titre: string; texte: string; icone: React.ReactNode; href: string }) {
  return (
    <a className="aod-carte aod-carte--lien" href={href}>
      <span className="aod-tuile">{icone}</span>
      <span className="aod-carte__titre">{titre}</span>
      <p className="aod-carte__texte">{texte}</p>
    </a>
  );
}

/** Menu de la dermoscopie : schéma, titre, description, nombre de structures. */
export function CarteRubrique({ titre, texte, illustration, nombre, onClick }:
  { titre: string; texte: string; illustration: React.ReactNode; nombre: number; onClick?: () => void }) {
  return (
    <button type="button" className="aod-carte aod-carte--lien aod-rubrique" onClick={onClick}>
      {illustration}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="aod-carte__titre">{titre}</span>
        <span className="aod-carte__texte">{texte}</span>
        <span className="aod-carte__suite">{nombre} structures <IconeFleche taille={16} /></span>
      </span>
    </button>
  );
}

/** Dermoscopie : schéma dans le cercle du dermatoscope, définition, ligne « Évoque ». */
export function CarteStructure({ nom, definition, evoque, illustration }: { nom: string; definition: string; evoque: string; illustration: React.ReactNode }) {
  return (
    <article className="aod-carte aod-structure">
      {illustration}
      <div className="aod-structure__corps">
        <h3 className="aod-carte__titre" style={{ margin: 0, fontSize: 20 }}>{nom}</h3>
        <p className="aod-carte__texte">{definition}</p>
        <p className="aod-structure__evoque"><span>Évoque</span>{evoque}</p>
      </div>
    </article>
  );
}

/** Liste à chevrons (mobile) : modules de l'accueil, sommaire, résultats. */
export function Liste({ lignes }: { lignes: { titre: string; texte?: string; href: string; icone?: React.ReactNode }[] }) {
  return (
    <div className="aod-liste">
      {lignes.map((l) => (
        <a key={l.href + l.titre} className="aod-liste__ligne" href={l.href}>
          {l.icone && <span className="aod-tuile">{l.icone}</span>}
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span className={l.icone ? 'aod-liste__titre' : undefined}>{l.titre}</span>
            {l.texte && <span className="aod-liste__texte">{l.texte}</span>}
          </span>
          <IconeChevronDroite className="aod-liste__chevron" />
        </a>
      ))}
    </div>
  );
}

/** En tête de fiche : trois à cinq points à retenir. */
export function Essentiel({ points, titre = 'L’essentiel' }: { points: React.ReactNode[]; titre?: string }) {
  const id = React.useId();
  return (
    <section className="aod-carte aod-essentiel" aria-labelledby={id}>
      <h2 id={id} className="aod-carte__titre" style={{ margin: 0, fontSize: 20 }}>{titre}</h2>
      <ul>{points.map((p, i) => <li key={i}>{p}</li>)}</ul>
    </section>
  );
}

/* ---------- Section repliable (fiche) : fermée par défaut ---------- */

export function SectionRepliable({ titre, sousTitre, ouverte, onBasculer, ouverteParDefaut = false, children }:
  { titre: string; sousTitre?: string; ouverte?: boolean; onBasculer?: (o: boolean) => void; ouverteParDefaut?: boolean; children: React.ReactNode }) {
  const [interne, setInterne] = React.useState(ouverteParDefaut);
  const estOuverte = ouverte ?? interne;
  const id = React.useId();
  const basculer = () => { const o = !estOuverte; setInterne(o); onBasculer?.(o); };
  return (
    <div className="aod-section">
      <h2 style={{ margin: 0 }}>
        <button type="button" className="aod-section__bouton" aria-expanded={estOuverte} aria-controls={id} onClick={basculer}>
          <span className="aod-section__textes">
            <span className="aod-section__titre">{titre}</span>
            {sousTitre && <span className="aod-section__sous-titre">{sousTitre}</span>}
          </span>
          <IconeChevronBas taille={22} className="aod-section__chevron" />
        </button>
      </h2>
      <div id={id} className="aod-section__contenu" hidden={!estOuverte}>{children}</div>
    </div>
  );
}

/* ---------- Encadrés : trois niveaux ---------- */

const ETIQUETTES = { alerte: 'Signe d’alerte', precaution: 'Précaution', retenir: 'À retenir' } as const;

/** alerte : le plus fort (bandeau plein, bordure 2 px) · precaution : contre-indications, surveillance · retenir : important, rassurant, ou réussite. */
export function Encadre({ type, titre, children }: { type: keyof typeof ETIQUETTES; titre?: string; children: React.ReactNode }) {
  return (
    <div className={`aod-encadre aod-encadre--${type}`} role={type === 'alerte' ? 'note' : undefined}>
      <span className="aod-encadre__etiquette">{titre ?? ETIQUETTES[type]}</span>
      <div className="aod-encadre__corps">{children}</div>
    </div>
  );
}

/* ---------- États ---------- */

export function EtatVide({ titre, texte, action }: { titre: string; texte?: string; action?: React.ReactNode }) {
  return (
    <div className="aod-vide">
      <span className="aod-vide__titre">{titre}</span>
      {texte && <p className="aod-vide__texte">{texte}</p>}
      {action}
    </div>
  );
}

/** Trois points qui pulsent, toujours accompagnés d'un texte. */
export function Chargement({ texte, avecAvatar = false }: { texte: string; avecAvatar?: boolean }) {
  return (
    <div className="aod-chargement" role="status">
      {avecAvatar && <AvatarLupus />}
      <span className="aod-points" aria-hidden="true"><span className="aod-point" /><span className="aod-point" /><span className="aod-point" /></span>
      <span className="aod-compteur">{texte}</span>
    </div>
  );
}

/** Compteur de résultats annoncé aux lecteurs d'écran. */
export function Compteur({ n, singulier, pluriel, aucun }: { n: number; singulier: string; pluriel: string; aucun: string }) {
  return <span className="aod-compteur" aria-live="polite">{n === 0 ? aucun : n === 1 ? `1 ${singulier}` : `${n} ${pluriel}`}</span>;
}
