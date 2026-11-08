/* Mode clair / sombre.
   Par défaut, le site suit la préférence du système. Le bouton jour/nuit force un mode et le mémorise
   dans ce navigateur (localStorage). L'attribut data-theme est posé sur <html>. */
import * as React from 'react';

export type Theme = 'light' | 'dark';
const CLE = 'aod-theme';

function lireChoix(): Theme | null {
  try {
    const v = window.localStorage.getItem(CLE);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function preferenceSysteme(): Theme {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** À appeler une fois, le plus tôt possible (voir le script anti-flash du README). */
export function appliquerThemeMemorise(): void {
  const choix = lireChoix();
  if (choix) document.documentElement.dataset.theme = choix;
}

export function useTheme(): { theme: Theme; basculer: () => void } {
  const [theme, setTheme] = React.useState<Theme>(() => (typeof window === 'undefined' ? 'light' : lireChoix() ?? preferenceSysteme()));

  React.useEffect(() => {
    if (lireChoix()) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const suivre = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', suivre);
    return () => mq.removeEventListener('change', suivre);
  }, []);

  const basculer = React.useCallback(() => {
    setTheme((t) => {
      const suivant: Theme = t === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = suivant;
      try { window.localStorage.setItem(CLE, suivant); } catch { /* navigation privée : le choix ne sera pas mémorisé */ }
      return suivant;
    });
  }, []);

  return { theme, basculer };
}

/** Repli des accents et de la casse, pour la recherche (« erysipele » trouve « Érysipèle »). */
export function replier(texte: string): string[] {
  return Array.from(texte).map((c) => {
    const base = c.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return (base.length === 1 ? base : c).toLowerCase();
  });
}

/** Découpe un libellé autour de la partie tapée, pour la surligner. */
export function decouper(libelle: string, requete: string): { avant: string; trouve: string; apres: string } | null {
  const q = replier(requete.trim()).join('');
  if (!q) return null;
  const lettres = Array.from(libelle);
  const i = replier(libelle).join('').indexOf(q);
  if (i < 0) return null;
  const n = Array.from(q).length;
  return { avant: lettres.slice(0, i).join(''), trouve: lettres.slice(i, i + n).join(''), apres: lettres.slice(i + n).join('') };
}
