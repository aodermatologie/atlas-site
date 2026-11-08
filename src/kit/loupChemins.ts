/* Tracé du loup de Lupus (logo de Thomas, simplifié en cinq teintes). viewBox : 178 143 669 693. */

export const LOUP_VIEWBOX = '178 143 669 693';

export const LOUP_CHEMINS: { partie: 'silhouette' | 'oreilles' | 'reflets' | 'museau' | 'yeux'; d: string }[] = [
  { partie: 'silhouette', d: 'M240 147 L215 359 L255 470 L257 483 L182 586 L256 608 L258 614 L211 697 L355 724 L461 832 L564 832 L670 724 L814 697 L767 614 L769 608 L843 586 L768 483 L770 470 L810 359 L785 147 L663 260 L619 317 L406 317 L362 260Z' },
  { partie: 'oreilles', d: 'M784 152 L777 160 L686 316 L690 319 L731 324 L707 391 L752 398 L742 444 L765 478 L768 476 L809 360ZM241 152 L216 360 L257 476 L260 478 L283 444 L273 398 L318 391 L294 324 L335 319 L339 316 L248 160Z' },
  { partie: 'reflets', d: 'M648 646 L644 648 L576 738 L552 787 L564 829 L567 829 L669 725ZM377 646 L356 725 L458 829 L461 829 L473 787 L449 738 L381 648ZM558 569 L573 727 L575 727 L588 579ZM467 569 L437 579 L450 727 L452 727ZM719 510 L690 546 L688 552 L761 605 L723 513ZM306 510 L302 513 L264 605 L337 552 L335 546Z' },
  { partie: 'museau', d: 'M762 608 L687 552 L642 582 L590 579 L575 736 L578 735 L649 641 L759 611ZM263 608 L266 611 L376 641 L447 735 L450 736 L435 579 L383 582 L338 552Z' },
  { partie: 'yeux', d: 'M453 741 L475 788 L550 788 L572 744 L570 740 L518 730 L507 730ZM683 549 L648 528 L641 526 L592 577 L642 580 L681 553ZM342 549 L344 553 L383 580 L433 577 L384 526 L377 528Z' },
];

/** Couleurs sarcelle (Lupus actif, avatar, cartes). */
export const LOUP_SARCELLE = { silhouette: '#438087', oreilles: '#144147', reflets: '#8EB8BB', museau: '#BCD8DA', yeux: '#2A211C' } as const;

/** Couleurs neutres (navigation, Lupus inactif) : suivent le mode clair ou sombre via les variables CSS. */
export const LOUP_NEUTRE = { silhouette: 'var(--aod-loup-n1)', oreilles: 'var(--aod-loup-n2)', reflets: 'var(--aod-loup-n3)', museau: 'var(--aod-loup-n4)', yeux: 'var(--aod-loup-n5)' } as const;
