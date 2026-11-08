/* Conversation avec Lupus. Lupus tutoie ; le reste du site vouvoie.
   Aucune conversation n'est conservée par le site. */
import * as React from 'react';
import { IconeEnvoyer } from './icones';
import { AvatarLupus } from './Lupus';

export function BulleQuestion({ children }: { children: React.ReactNode }) {
  return <p className="aod-bulle">{children}</p>;
}

export type Source = { titre: string; organisme: string; href: string };

export function CarteSource({ numero, source }: { numero: number; source: Source }) {
  return (
    <a className="aod-source" href={source.href} target="_blank" rel="noreferrer">
      <span className="aod-source__num">{numero}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span className="aod-source__titre">{source.titre}</span>
        <span className="aod-source__org">{source.organisme}</span>
      </span>
    </a>
  );
}

/** Réponse de Lupus : texte structuré (titres h3, paragraphes, listes), renvois [1] [2] vers les sources, actions. */
export function ReponseLupus({ children, sources = [], actions }: { children: React.ReactNode; sources?: Source[]; actions?: React.ReactNode }) {
  return (
    <article className="aod-reponse" aria-label="Réponse de Lupus">
      <AvatarLupus />
      <div className="aod-reponse__corps">
        <span className="aod-reponse__nom">Lupus</span>
        {children}
        {sources.length > 0 && (
          <div className="aod-sources">
            <span className="aod-etiquette">Sources</span>
            {sources.map((s, i) => <CarteSource key={s.href + i} numero={i + 1} source={s} />)}
          </div>
        )}
        {actions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{actions}</div>}
      </div>
    </article>
  );
}

/** Zone de saisie : Entrée envoie, Maj + Entrée passe à la ligne ; le champ s'agrandit jusqu'à 160 px. */
export function ZoneDeSaisie({ valeur, onChange, onEnvoyer, occupe = false }:
  { valeur: string; onChange: (v: string) => void; onEnvoyer: () => void; occupe?: boolean }) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const id = React.useId();
  const possible = valeur.trim().length > 0 && !occupe;
  React.useLayoutEffect(() => {
    const t = ref.current;
    if (!t) return;
    t.style.height = 'auto';
    t.style.height = Math.min(160, t.scrollHeight) + 'px';
  }, [valeur]);
  const envoyer = () => { if (possible) onEnvoyer(); };
  return (
    <div>
      <div className="aod-saisie">
        <label htmlFor={id} className="aod-sr-only">Ta question pour Lupus</label>
        <textarea id={id} ref={ref} rows={1} placeholder="Pose ta question…" value={valeur}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(); } }} />
        <button type="button" className="aod-icon-btn aod-icon-btn--plein" aria-label="Envoyer la question" aria-disabled={!possible} onClick={envoyer}>
          <IconeEnvoyer taille={20} />
        </button>
      </div>
      <p className="aod-saisie__note">Lupus peut se tromper : vérifie les sources. N’indique aucune donnée permettant d’identifier un patient.</p>
    </div>
  );
}
