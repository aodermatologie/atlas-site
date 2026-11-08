// Données partagées par les pages : modules, fiches publiées, photos prêtes pour l'affichage.
import { getCollection, type CollectionEntry } from 'astro:content';
import { FAMILLES } from '../content.config';

export const MODULES = [
  { id: 'pathologies', libelle: 'Pathologies', etiquette: 'Pathologies', href: '/pathologies' },
  { id: 'atlas', libelle: 'Atlas', etiquette: 'Atlas', href: '/atlas' },
  { id: 'lupus', libelle: 'Lupus', etiquette: "Lupus, l'assistant", href: '/lupus' },
  { id: 'dermoscopie', libelle: 'Dermoscopie', etiquette: 'Dermoscopie', href: '/dermoscopie' },
  { id: 'coffre-fort', libelle: 'Coffre-fort', etiquette: 'Coffre-fort', href: '/coffre-fort' },
] as const;
export type IdModule = (typeof MODULES)[number]['id'];

/** Adresse des photos libres : le bucket public en production, public/medias en développement. */
export const MEDIA = String(import.meta.env.PUBLIC_MEDIA_URL ?? '/medias').replace(/\/$/, '');

export const estPubliee = (f: CollectionEntry<'fiches'>) => f.data.statut !== 'a-rediger';

const parTitre = (a: { titre: string }, b: { titre: string }) => a.titre.localeCompare(b.titre, 'fr');

export type ElementListe = { id: string; titre: string; href: string | null; famille: string };

export async function listePathologies(): Promise<ElementListe[]> {
  const fiches = await getCollection('fiches');
  return fiches
    .map((f) => ({ id: f.id, titre: f.data.titre, href: estPubliee(f) ? `/pathologies/${f.id}` : null, famille: f.data.famille }))
    .sort(parTitre);
}

export function famillesOrdonnees() {
  return Object.entries(FAMILLES).map(([id, titre]) => ({ id, titre }));
}

export type PhotoAffichee = {
  id: string;
  pathologie: string;
  pathologieId: string;
  hrefFiche?: string;
  localisation: string;
  lesions: string[];
  legende: string;
  alt: string;
  /** Pour une photo issue d'une publication : la référence à citer (et la licence). */
  source?: string;
  etat: 'libre' | 'verrouillee' | 'floutee';
  src?: string;
  srcGrande?: string;
};

/** Les photos verrouillées n'ont ni adresse, ni légende, ni description ici : seules la pathologie et la localisation
    restent, pour les filtres. Le reste est demandé à /api/photos une fois le coffre ouvert. */
export function sourcePhoto(p: CollectionEntry<'photos'>): string | undefined {
  const pub = p.data.publication;
  if (p.data.origine !== 'publication' || !pub) return undefined;
  return [pub.citation, pub.doi ? `doi:${pub.doi}` : null, pub.licence ?? null].filter(Boolean).join(' · ');
}

export async function photosAffichees(filtre?: (p: CollectionEntry<'photos'>) => boolean): Promise<PhotoAffichee[]> {
  const [photos, fiches] = await Promise.all([getCollection('photos'), getCollection('fiches')]);
  const fichesParId = new Map(fiches.map((f) => [f.id, f]));
  return photos.filter((p) => (filtre ? filtre(p) : true)).map((p) => {
    const fiche = fichesParId.get(p.data.pathologie.id);
    const verrouillee = p.data.acces === 'verrouillee';
    const etat = verrouillee ? 'verrouillee' : p.data.localisation === 'Organes génitaux' ? 'floutee' : 'libre';
    return {
      id: p.id,
      pathologie: fiche?.data.titre ?? p.data.pathologie.id,
      pathologieId: p.data.pathologie.id,
      hrefFiche: fiche && estPubliee(fiche) ? `/pathologies/${fiche.id}` : undefined,
      localisation: p.data.localisation,
      lesions: p.data.lesions,
      legende: verrouillee ? '' : p.data.legende,
      alt: verrouillee ? '' : p.data.alt,
      ...(verrouillee ? {} : { source: sourcePhoto(p) }),
      etat,
      ...(verrouillee ? {} : { src: `${MEDIA}/${p.data.fichier}-480.webp`, srcGrande: `${MEDIA}/${p.data.fichier}-1600.webp` }),
    };
  });
}
