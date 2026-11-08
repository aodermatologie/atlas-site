/* Lupus, l'assistant : le loup en icône (sarcelle ou neutre), en avatar et en grand format 3D. */
import * as React from 'react';
import { LOUP_CHEMINS, LOUP_NEUTRE, LOUP_SARCELLE, LOUP_VIEWBOX } from './loupChemins';

type Variante = 'sarcelle' | 'neutre';

export function IconeLupus({ taille = 24, variante = 'sarcelle' }: { taille?: number; variante?: Variante }) {
  const pal = variante === 'sarcelle' ? LOUP_SARCELLE : LOUP_NEUTRE;
  return (
    <svg width={taille} height={Math.round((taille * 693) / 669)} viewBox={LOUP_VIEWBOX} aria-hidden="true" focusable="false">
      {LOUP_CHEMINS.map((c) => <path key={c.partie} d={c.d} fill={pal[c.partie]} />)}
    </svg>
  );
}

export function AvatarLupus({ taille = 34 }: { taille?: number }) {
  return (
    <span className="aod-avatar" style={{ width: taille, height: taille }} aria-hidden="true">
      <IconeLupus taille={Math.round(taille * 0.65)} />
    </span>
  );
}

/** Le grand loup de l'écran d'accueil de Lupus : facettes en relief, épaisseur, ombre au sol.
    Sur ordinateur, il tourne la tête vers la souris ; au repos, il flotte. Immobile si les animations sont désactivées. */
export function Lupus3D({ largeur = 230, suitLaSouris = true }: { largeur?: number; suitLaSouris?: boolean }) {
  const pivot = React.useRef<HTMLDivElement>(null);
  const ombre = React.useRef<HTMLDivElement>(null);
  const hauteur = Math.round((largeur * 693) / 669);
  const k = largeur / 230;

  React.useEffect(() => {
    if (!suitLaSouris) return;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
    let image = 0;
    const bouger = (e: MouseEvent) => {
      if (reduit.matches || !pivot.current) return;
      cancelAnimationFrame(image);
      image = requestAnimationFrame(() => {
        const el = pivot.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
        el.style.transform = `rotateX(${(-dy * 24).toFixed(1)}deg) rotateY(${(dx * 34).toFixed(1)}deg)`;
        if (ombre.current) ombre.current.style.transform = `translateX(${(-dx * 16).toFixed(1)}px) scaleX(${(1 - Math.abs(dx) * 0.15).toFixed(2)})`;
      });
    };
    window.addEventListener('mousemove', bouger);
    return () => { window.removeEventListener('mousemove', bouger); cancelAnimationFrame(image); };
  }, [suitLaSouris]);

  const couche = (d: string, fill: string, z: number, cle: string) => (
    <svg key={cle} width={largeur} height={hauteur} viewBox={LOUP_VIEWBOX} style={{ transform: `translateZ(${(z * k).toFixed(1)}px)` }}>
      <path d={d} fill={fill} />
    </svg>
  );
  const silhouette = LOUP_CHEMINS[0].d;
  const epaisseur = [-16, -12.8, -9.6, -6.4, -3.2].map((z, i) => couche(silhouette, i < 2 ? '#0F3236' : '#163F44', z, `e${i}`));
  const relief = [0, 5, 11, 17, 24];

  return (
    <div className="aod-lupus3d" aria-hidden="true">
      <div className="aod-lupus3d__scene" style={{ width: largeur, height: hauteur }}>
        <div className="aod-lupus3d__pivot" ref={pivot}>
          <div className="aod-lupus3d__flotte">
            {epaisseur}
            {LOUP_CHEMINS.map((c, i) => couche(c.d, LOUP_SARCELLE[c.partie], relief[i], c.partie))}
          </div>
        </div>
      </div>
      <div className="aod-lupus3d__ombre" ref={ombre} style={{ width: largeur * 0.62, height: largeur * 0.09, marginTop: largeur * 0.04 }} />
    </div>
  );
}
