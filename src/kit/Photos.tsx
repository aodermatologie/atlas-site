/* Photos : vignette (libre, verrouillée, floutée) et visionneuse.
   Sécurité : une photo verrouillée ne doit jamais être envoyée au navigateur avant que le serveur ait validé le code.
   Le flou, lui, n'est qu'un écran de pudeur : la photo floutée est bien chargée. */
import * as React from 'react';
import { IconeCadenas, IconeChevronDroite, IconeChevronGauche, IconeFermer, IconeOeil } from './icones';
import { BoutonIcone, BoutonLien } from './Boutons';

export type Photo = {
  id: string;
  src?: string;              // absent pour une photo verrouillée
  alt: string;               // description de la photo
  pathologie: string;
  localisation: string;
  lesions?: string[];
  legende?: string;
  source?: string;           // référence de la publication d'origine, à citer
  hrefFiche?: string;
  etat: 'libre' | 'verrouillee' | 'floutee';
};

export function Vignette({ photo, onOuvrir, hrefCoffre, devoilee, onDevoiler }:
  { photo: Photo; onOuvrir?: () => void; hrefCoffre: string; devoilee?: boolean; onDevoiler?: () => void }) {
  if (photo.etat === 'verrouillee') {
    // Rien d'écrit sous une photo verrouillée : seulement le cadenas, qui mène au coffre-fort.
    return (
      <a className="aod-vignette aod-vignette--verrouillee" href={hrefCoffre} aria-label="Photo verrouillée, ouvrir le coffre-fort">
        <span className="aod-vignette__verrou"><span className="aod-vignette__cadenas"><IconeCadenas taille={20} /></span></span>
      </a>
    );
  }
  const legende = (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span className="aod-vignette__nom">{photo.pathologie}</span>
      <span className="aod-vignette__lieu">{photo.localisation}</span>
    </span>
  );
  if (photo.etat === 'floutee' && !devoilee) {
    return (
      <div className="aod-vignette aod-vignette--floutee">
        <span className="aod-vignette__image">
          {photo.src && <img src={photo.src} alt="" />}
          <button type="button" className="aod-vignette__afficher" onClick={onDevoiler} aria-label={`Afficher la photo : ${photo.pathologie}, ${photo.localisation.toLowerCase()}`}>
            <IconeOeil taille={16} />Afficher
          </button>
        </span>
        {legende}
      </div>
    );
  }
  return (
    <button type="button" className="aod-vignette" onClick={onOuvrir} aria-label={`Agrandir : ${photo.pathologie}, ${photo.localisation.toLowerCase()}`}>
      <span className="aod-vignette__image">{photo.src && <img src={photo.src} alt={photo.alt} />}</span>
      {legende}
    </button>
  );
}

/** Visionneuse plein écran : fond neutre, zoom, flèches (et touches ← →), Échap pour fermer.
    `photos` ne contient que les photos visibles (libres, ou déverrouillées). */
export function Visionneuse({ photos, index, onChanger, onFermer, devoilees = [], onDevoiler }:
  { photos: Photo[]; index: number; onChanger: (i: number) => void; onFermer: () => void; devoilees?: string[]; onDevoiler?: (id: string) => void }) {
  const [zoom, setZoom] = React.useState(1);
  const fermer = React.useRef<HTMLButtonElement>(null);
  const p = photos[index];
  const voilee = p?.etat === 'floutee' && !devoilees.includes(p.id);
  const aller = React.useCallback((pas: number) => { setZoom(1); onChanger((index + pas + photos.length) % photos.length); }, [index, photos.length, onChanger]);

  React.useEffect(() => { fermer.current?.focus(); }, []);
  React.useEffect(() => {
    const touches = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
      if (e.key === 'ArrowLeft') aller(-1);
      if (e.key === 'ArrowRight') aller(1);
    };
    document.addEventListener('keydown', touches);
    return () => document.removeEventListener('keydown', touches);
  }, [aller, onFermer]);

  if (!p) return null;
  return (
    <div className="aod-visionneuse" role="dialog" aria-modal="true" aria-label="Visionneuse photo">
      <div className="aod-visionneuse__scene">
        <div className="aod-visionneuse__barre">
          <span className="aod-visionneuse__position" aria-live="polite">{index + 1} / {photos.length}</span>
          <div className="aod-visionneuse__zoom">
            <button type="button" aria-label="Dézoomer" onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>−</button>
            <span>{Math.round(zoom * 100)} %</span>
            <button type="button" aria-label="Zoomer" onClick={() => setZoom((z) => Math.min(3, z + 0.5))}>+</button>
          </div>
          <button ref={fermer} type="button" className="aod-icon-btn aod-icon-btn--sur-sombre" aria-label="Fermer la visionneuse" onClick={onFermer}><IconeFermer taille={22} /></button>
        </div>
        <div className="aod-visionneuse__cadre">
          {p.src && <img className="aod-visionneuse__photo" src={p.src} alt={p.alt} style={{ transform: `scale(${zoom})`, filter: voilee ? 'blur(28px)' : undefined }} />}
          {voilee && (
            <button type="button" className="aod-vignette__afficher" style={{ height: 48, fontSize: 15, background: 'rgba(255,255,255,.16)' }} onClick={() => onDevoiler?.(p.id)}>
              <IconeOeil taille={16} />Afficher la photo
            </button>
          )}
          {photos.length > 1 && (
            <>
              <BoutonIcone etiquette="Photo précédente" variante="sur-sombre" className="aod-visionneuse__fleche aod-visionneuse__fleche--prec" onClick={() => aller(-1)}><IconeChevronGauche taille={24} /></BoutonIcone>
              <BoutonIcone etiquette="Photo suivante" variante="sur-sombre" className="aod-visionneuse__fleche aod-visionneuse__fleche--suiv" onClick={() => aller(1)}><IconeChevronDroite taille={24} /></BoutonIcone>
            </>
          )}
        </div>
      </div>
      <aside className="aod-visionneuse__panneau">
        <h2 className="aod-titre-3" style={{ fontSize: 26 }}>{p.pathologie}</h2>
        {p.legende && <p>{p.legende}</p>}
        <dl>
          <dt>Localisation</dt><dd>{p.localisation}</dd>
          <dt>Lésions</dt><dd>{p.lesions?.length ? p.lesions.join(', ') : '—'}</dd>
          {p.source && <><dt>Source</dt><dd>{p.source}</dd></>}
        </dl>
        {p.hrefFiche && <BoutonLien variante="sur-sombre" href={p.hrefFiche} style={{ marginTop: 'auto' }}>Voir la fiche</BoutonLien>}
      </aside>
    </div>
  );
}
