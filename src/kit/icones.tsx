/* Icônes d'Atlas. Modules : pleines, coins adoucis. Interface : contour 2 px. Toutes prennent la couleur du texte (currentColor). */
import * as React from 'react';

export type IconeProps = React.SVGProps<SVGSVGElement> & { taille?: number };

function svgProps(taille: number, props: React.SVGProps<SVGSVGElement>) {
  return { width: taille, height: taille, viewBox: '0 0 24 24', 'aria-hidden': true as const, focusable: false as const, ...props };
}

export function IconePathologies({ taille = 24, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="currentColor"><path d="M19.58 3.00Q18.26 2.99 18.01 3.08Q17.76 3.17 17.55 3.36Q17.34 3.54 17.23 3.73Q17.13 3.91 17.07 4.17Q17.02 4.44 17.03 12.12Q17.05 19.80 17.18 20.10Q17.31 20.41 17.64 20.66Q17.97 20.91 18.22 20.96Q18.47 21.01 19.52 21.01Q20.58 21.01 20.79 20.97Q21.00 20.93 21.24 20.80Q21.47 20.67 21.66 20.45Q21.84 20.22 21.92 19.98Q22.00 19.75 22.00 11.99Q22.00 4.23 21.84 3.87Q21.68 3.52 21.50 3.36Q21.31 3.20 21.10 3.11Q20.89 3.01 19.58 3.00ZM13.61 3.01Q12.25 2.99 12.00 3.08Q11.75 3.17 11.58 3.30Q11.41 3.44 11.26 3.66Q11.12 3.88 11.06 4.09Q11.01 4.31 11.01 12.00Q11.01 19.69 11.18 20.09Q11.35 20.48 11.66 20.70Q11.96 20.91 12.20 20.96Q12.43 21.01 13.61 21.00Q14.78 20.99 14.98 20.92Q15.18 20.85 15.39 20.70Q15.60 20.54 15.74 20.31Q15.89 20.09 15.94 19.88Q15.99 19.67 15.99 11.99Q15.99 4.31 15.94 4.09Q15.89 3.88 15.74 3.66Q15.60 3.44 15.28 3.24Q14.96 3.04 13.61 3.01ZM8.86 3.36Q7.61 2.99 7.36 2.99Q7.11 2.99 6.86 3.08Q6.61 3.17 6.39 3.37Q6.16 3.57 6.06 3.77Q5.95 3.96 3.98 11.34Q2.00 18.72 2.05 19.17Q2.11 19.62 2.36 19.92Q2.61 20.22 2.82 20.33Q3.03 20.43 4.15 20.72Q5.27 21.01 5.49 21.00Q5.72 20.99 5.93 20.91Q6.14 20.83 6.33 20.67Q6.53 20.51 6.68 20.26Q6.82 20.01 8.80 12.63Q10.77 5.25 10.74 4.85Q10.70 4.44 10.60 4.27Q10.51 4.09 10.31 3.91Q10.12 3.73 8.86 3.36Z" /></svg>;
}

export function IconeAtlas({ taille = 24, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="currentColor"><path fillRule="evenodd" d="M2.90 7.41Q2.66 7.65 2.43 8.08Q2.19 8.51 2.10 8.95Q2.00 9.39 2.00 13.47Q2.00 17.55 2.09 17.99Q2.17 18.42 2.31 18.75Q2.45 19.07 2.66 19.38Q2.88 19.69 3.30 20.05Q3.71 20.42 4.11 20.61Q4.51 20.80 4.94 20.90Q5.38 20.99 11.99 20.99Q18.60 20.99 18.94 20.93Q19.28 20.87 19.71 20.68Q20.14 20.50 20.47 20.25Q20.80 20.01 21.11 19.63Q21.42 19.26 21.63 18.82Q21.83 18.38 21.91 17.87Q22.00 17.35 22.00 13.47Q22.00 9.58 21.93 9.12Q21.85 8.66 21.60 8.18Q21.36 7.70 21.08 7.41Q20.80 7.12 20.43 6.89Q20.05 6.67 19.46 6.51Q18.87 6.35 18.64 6.21Q18.40 6.07 18.22 5.87Q18.04 5.66 17.64 5.03Q17.25 4.40 16.81 4.00Q16.37 3.61 15.89 3.38Q15.40 3.16 14.98 3.08Q14.55 3.01 11.98 3.01Q9.41 3.01 9.03 3.07Q8.66 3.13 8.19 3.34Q7.72 3.54 7.37 3.81Q7.03 4.08 6.79 4.38Q6.54 4.68 6.21 5.22Q5.88 5.77 5.70 5.94Q5.53 6.11 5.30 6.24Q5.06 6.37 4.63 6.46Q4.21 6.56 3.92 6.69Q3.63 6.82 3.38 6.99Q3.13 7.16 2.90 7.41ZM8.75 12.29Q8.90 12.24 9.04 12.25Q9.19 12.26 9.33 12.33Q9.47 12.41 9.76 12.91Q10.05 13.41 10.51 13.66Q10.97 13.91 11.11 14.13Q11.25 14.36 11.25 14.51Q11.25 14.66 11.18 14.82Q11.10 14.98 10.99 15.07Q10.89 15.17 10.48 15.37Q10.07 15.58 9.84 16.03Q9.60 16.48 9.49 16.57Q9.39 16.67 9.24 16.72Q9.09 16.78 8.94 16.76Q8.79 16.75 8.66 16.69Q8.53 16.63 8.43 16.52Q8.34 16.41 8.13 16.00Q7.93 15.60 7.48 15.36Q7.03 15.13 6.88 14.90Q6.73 14.68 6.73 14.51Q6.73 14.33 6.80 14.19Q6.86 14.06 6.98 13.95Q7.10 13.84 7.50 13.64Q7.91 13.43 8.15 12.99Q8.38 12.54 8.49 12.44Q8.60 12.34 8.75 12.29ZM13.17 8.36Q13.41 8.23 13.67 8.30Q13.93 8.36 14.04 8.49Q14.16 8.62 14.44 9.17Q14.72 9.73 15.33 10.05Q15.94 10.37 16.04 10.47Q16.13 10.57 16.20 10.72Q16.26 10.87 16.26 10.99Q16.26 11.12 16.19 11.29Q16.11 11.46 16.00 11.56Q15.90 11.66 15.33 11.95Q14.76 12.24 14.44 12.85Q14.12 13.46 13.90 13.61Q13.67 13.76 13.50 13.76Q13.33 13.76 13.19 13.69Q13.05 13.63 12.94 13.51Q12.84 13.39 12.55 12.82Q12.26 12.26 11.66 11.95Q11.06 11.64 10.90 11.40Q10.74 11.16 10.75 10.96Q10.76 10.76 10.83 10.63Q10.91 10.50 11.58 10.13Q12.26 9.75 12.59 9.12Q12.92 8.49 13.17 8.36Z" /></svg>;
}

export function IconeDermoscopie({ taille = 24, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="currentColor"><path fillRule="evenodd" d="M12 1.2A6.8 6.8 0 1 1 12 14.8A6.8 6.8 0 1 1 12 1.2ZM12 3.4A4.6 4.6 0 1 1 12 12.6A4.6 4.6 0 1 1 12 3.4ZM12 4.9A3.1 3.1 0 1 1 12 11.1A3.1 3.1 0 1 1 12 4.9Z" /><path fillRule="evenodd" d="M9.2 13H14.8V20A2.8 2.8 0 0 1 9.2 20ZM12 16.2A0.7 0.7 0 0 1 12.7 16.9V18.1A0.7 0.7 0 0 1 11.3 18.1V16.9A0.7 0.7 0 0 1 12 16.2ZM12 19.7A0.8 0.8 0 1 1 12 21.3A0.8 0.8 0 1 1 12 19.7Z" /></svg>;
}

export function IconeCoffreFort({ taille = 24, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="currentColor"><path fillRule="evenodd" d="M12.38 8.19Q11.90 8.13 11.61 8.18Q11.32 8.22 11.05 8.32Q10.78 8.42 10.55 8.57Q10.32 8.71 10.10 8.91Q9.89 9.11 9.73 9.35Q9.56 9.58 9.44 9.87Q9.31 10.16 9.26 10.68Q9.20 11.21 9.35 11.73Q9.49 12.26 9.81 12.68Q10.14 13.10 10.60 13.38Q11.05 13.66 11.58 13.75Q12.10 13.84 12.38 13.81Q12.66 13.77 12.98 13.66Q13.30 13.55 13.58 13.37Q13.86 13.19 14.05 13.00Q14.24 12.81 14.42 12.55Q14.60 12.28 14.70 12.02Q14.80 11.77 14.84 11.21Q14.89 10.65 14.73 10.15Q14.58 9.65 14.22 9.21Q13.86 8.78 13.67 8.64Q13.48 8.51 13.17 8.38Q12.86 8.24 12.38 8.19ZM11.36 10.08Q11.57 9.94 11.91 9.92Q12.26 9.89 12.45 9.98Q12.64 10.07 12.76 10.21Q12.88 10.34 12.95 10.52Q13.01 10.70 13.00 10.90Q12.99 11.10 12.88 11.30Q12.77 11.50 12.62 11.61Q12.48 11.72 12.33 11.77Q12.19 11.81 11.93 11.80Q11.68 11.79 11.51 11.71Q11.34 11.63 11.21 11.49Q11.07 11.34 11.01 11.14Q10.94 10.94 10.97 10.72Q11.01 10.49 11.09 10.36Q11.16 10.23 11.36 10.08ZM3.27 2.46Q2.87 2.74 2.65 3.08Q2.42 3.43 2.35 3.73Q2.27 4.03 2.27 10.97Q2.27 17.92 2.40 18.34Q2.54 18.77 2.81 19.10Q3.09 19.44 3.34 19.59Q3.58 19.75 3.86 19.84Q4.14 19.93 5.15 19.94Q6.17 19.95 6.23 20.70Q6.28 21.44 6.44 21.63Q6.59 21.82 6.82 21.91Q7.04 22.00 7.34 21.93Q7.64 21.87 7.82 21.68Q8.00 21.49 8.04 21.34Q8.09 21.20 8.10 20.57Q8.11 19.95 12.11 19.95Q16.11 19.95 16.14 20.60Q16.16 21.24 16.23 21.41Q16.29 21.58 16.50 21.75Q16.72 21.93 16.96 21.97Q17.21 22.00 17.43 21.91Q17.65 21.82 17.81 21.62Q17.96 21.42 18.01 20.68Q18.05 19.95 19.05 19.92Q20.04 19.88 20.28 19.78Q20.53 19.68 20.81 19.47Q21.09 19.26 21.32 18.90Q21.55 18.54 21.64 18.10Q21.73 17.65 21.73 10.96Q21.73 4.27 21.64 3.85Q21.55 3.43 21.26 3.01Q20.97 2.60 20.62 2.38Q20.26 2.16 19.88 2.08Q19.50 2.00 11.98 2.00Q4.45 2.00 4.06 2.09Q3.67 2.18 3.27 2.46ZM7.06 6.24Q7.22 5.97 7.48 5.85Q7.75 5.72 7.99 5.76Q8.22 5.79 8.49 6.00Q8.76 6.21 9.20 6.67Q9.65 7.13 10.19 6.89Q10.74 6.66 11.20 6.57Q11.65 6.48 12.33 6.53Q13.01 6.57 13.74 6.85Q14.46 7.13 14.95 6.64Q15.44 6.15 15.60 6.05Q15.76 5.95 15.90 5.91Q16.05 5.88 16.23 5.90Q16.40 5.92 16.65 6.10Q16.89 6.28 16.98 6.49Q17.07 6.70 17.03 6.99Q16.98 7.28 16.43 7.88Q15.87 8.47 16.14 9.12Q16.40 9.78 16.48 10.26Q16.56 10.74 16.50 11.38Q16.45 12.01 16.18 12.70Q15.91 13.39 16.54 14.05Q17.16 14.71 17.20 15.00Q17.23 15.29 17.06 15.57Q16.89 15.85 16.66 15.96Q16.43 16.07 16.14 16.02Q15.85 15.98 15.21 15.38Q14.58 14.78 14.00 15.03Q13.42 15.29 12.88 15.39Q12.35 15.49 11.68 15.43Q11.01 15.38 10.27 15.09Q9.54 14.80 8.81 15.48Q8.09 16.16 7.76 16.18Q7.44 16.20 7.17 16.01Q6.91 15.82 6.82 15.58Q6.73 15.33 6.79 15.05Q6.86 14.78 7.53 14.08Q8.20 13.39 7.92 12.68Q7.64 11.97 7.60 11.28Q7.55 10.58 7.69 9.99Q7.82 9.40 8.04 8.93Q8.27 8.47 7.69 7.89Q7.11 7.31 7.03 7.17Q6.95 7.04 6.93 6.77Q6.91 6.50 7.06 6.24Z" /></svg>;
}

export function IconeLune({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>;
}

export function IconeSoleil({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
}

export function IconeLoupe({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4.3-4.3" /></svg>;
}

export function IconeChevronBas({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
}

export function IconeChevronDroite({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>;
}

export function IconeChevronGauche({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>;
}

export function IconeFleche({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

export function IconeFermer({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>;
}

export function IconeCadenas({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
}

export function IconeOeil({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

export function IconeEnvoyer({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>;
}

export function IconePlus({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>;
}

export function IconeCopier({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>;
}

export function IconeAlerte({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" /></svg>;
}

export function IconeCoche({ taille = 18, ...props }: IconeProps) {
  return <svg {...svgProps(taille, props)} fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>;
}
