/* Logo d'Atlas : le livre ouvert en coloration HES (cornée, épiderme, derme, hypoderme).
   Les couleurs passent par les variables CSS : la version sombre est automatique. */
import * as React from 'react';

const C = {
  cornee: 'var(--aod-logo-cornee)',
  epiderme: 'var(--aod-logo-epiderme)',
  derme: 'var(--aod-logo-derme)',
  hypoderme: 'var(--aod-logo-hypoderme)',
};

/** Version compacte (en-tête, favicon) : quatre couches simples. */
export function LivreCompact({ largeur = 42, ...props }: React.SVGProps<SVGSVGElement> & { largeur?: number }) {
  return (
    <svg width={largeur} height={(largeur * 64) / 96} viewBox="2 24 96 64" aria-hidden="true" focusable="false" {...props}>
      <path d="M6 28 Q32 27 49 36 L49 82 Q32 73 6 74 Z" fill={C.hypoderme} />
      <path d="M6 28 Q32 27 49 36 L49 62 Q32 53 6 54 Z" fill={C.derme} />
      <path d="M6 28 Q32 27 49 36 L49 46 Q32 37 6 38 Z" fill={C.epiderme} />
      <path d="M6 28 Q32 27 49 36 L49 39.5 Q32 30.5 6 31.5 Z" fill={C.cornee} />
      <path d="M94 28 Q68 27 51 36 L51 82 Q68 73 94 74 Z" fill={C.hypoderme} />
      <path d="M94 28 Q68 27 51 36 L51 62 Q68 53 94 54 Z" fill={C.derme} />
      <path d="M94 28 Q68 27 51 36 L51 46 Q68 37 94 38 Z" fill={C.epiderme} />
      <path d="M94 28 Q68 27 51 36 L51 39.5 Q68 30.5 94 31.5 Z" fill={C.cornee} />
    </svg>
  );
}

/** Version détaillée (accueil) : crêtes de l'épiderme, animable. */
export function LivreDetaille({ largeur = 200, anime = false }: { largeur?: number; anime?: boolean }) {
  const g = anime ? 'aod-livre-g' : undefined;
  const d = anime ? 'aod-livre-d' : undefined;
  const k = (couche: string) => (anime ? `aod-couche aod-couche--${couche}` : undefined);
  return (
    <svg width={largeur} height={(largeur * 60) / 100} viewBox="0 24 100 60" aria-hidden="true" focusable="false">
      <g className={g}>
        <path className={k('hypoderme')} d="M6 28 Q32 27 49 36 L49 80 Q32 71 6 72 Z" fill={C.hypoderme} />
        <path className={k('derme')} d="M6 28 Q32 27 49 36 L49 62 Q32 53 6 54 Z" fill={C.derme} />
        <path className={k('epiderme')} d="M6 28 Q32 27 49 36 L49 43 Q44.4 46 39.9 39.1 Q34.8 42.8 29.8 36.5 Q24.1 40.8 18.4 35.1 Q12.2 40 6 35 Z" fill={C.epiderme} />
        <path className={k('cornee')} d="M6 28 Q32 27 49 36 L49 38.4 Q32 29.4 6 30.4 Z" fill={C.cornee} />
      </g>
      <g className={d}>
        <path className={k('hypoderme')} d="M94 28 Q68 27 51 36 L51 80 Q68 71 94 72 Z" fill={C.hypoderme} />
        <path className={k('derme')} d="M94 28 Q68 27 51 36 L51 62 Q68 53 94 54 Z" fill={C.derme} />
        <path className={k('epiderme')} d="M94 28 Q68 27 51 36 L51 43 Q55.6 46 60.1 39.1 Q65.2 42.8 70.2 36.5 Q75.9 40.8 81.6 35.1 Q87.8 40 94 35 Z" fill={C.epiderme} />
        <path className={k('cornee')} d="M94 28 Q68 27 51 36 L51 38.4 Q68 29.4 94 30.4 Z" fill={C.cornee} />
      </g>
    </svg>
  );
}

const CLE_SESSION = 'aod-arrivee-jouee';

/** L'animation d'arrivée ne se joue qu'une fois par visite (session du navigateur). */
export function useArriveeUneFois(mode: 'session' | 'toujours' | 'jamais' = 'session'): boolean {
  const [jouer] = React.useState(() => {
    if (mode !== 'session') return mode === 'toujours';
    try {
      if (window.sessionStorage.getItem(CLE_SESSION)) return false;
      window.sessionStorage.setItem(CLE_SESSION, '1');
      return true;
    } catch {
      return true;
    }
  });
  return jouer;
}

/** Bloc d'accueil : livre, « Atlas ouvert », « de dermatologie ». Les éléments suivants peuvent prendre
    la classe aod-apres-logo avec un animation-delay (2,0 s ; 2,1 s ; 2,25 s…) pour apparaître ensuite. */
export function HeroAtlas({ animation = 'session', largeurLivre = 200 }: { animation?: 'session' | 'toujours' | 'jamais'; largeurLivre?: number }) {
  const jouer = useArriveeUneFois(animation);
  return (
    <h1 className={`aod-hero${jouer ? '' : ' aod-sans-animation'}`} style={{ margin: 0, fontWeight: 400 }}>
      <LivreDetaille largeur={largeurLivre} anime />
      <span className="aod-hero__nom aod-nom-anime">Atlas <em>ouvert</em></span>
      <span className="aod-hero__sous-titre aod-sous-titre-anime">de dermatologie</span>
    </h1>
  );
}
