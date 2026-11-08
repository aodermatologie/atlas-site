// Photos d'une fiche : vignettes avec légende, visionneuse au clic.
// Verrouillées : cadenas vers le coffre-fort, puis chargées depuis /api/photos une fois le coffre ouvert.
// Organes génitaux : floutées, affichables d'un clic.
import * as React from 'react';
import { Vignette, Visionneuse, type Photo } from '../kit/Photos';
import type { PhotoAffichee } from '../lib/site';
import { useCoffre } from './useCoffre';

export default function PhotosFiche({ photos }: { photos: PhotoAffichee[] }) {
  const { ouvert, details } = useCoffre();
  const [devoilees, setDevoilees] = React.useState<string[]>([]);
  const [vue, setVue] = React.useState<number | null>(null);

  const enPhoto = (p: PhotoAffichee, grande = false): Photo => {
    const deverrouillee = p.etat === 'verrouillee' && ouvert;
    return {
      id: p.id, alt: details[p.id]?.alt ?? p.alt, pathologie: p.pathologie, localisation: p.localisation, lesions: p.lesions, legende: details[p.id]?.legende ?? p.legende, source: details[p.id]?.source ?? p.source,
      etat: deverrouillee ? 'libre' : p.etat,
      src: deverrouillee ? `/api/photos/${p.id}?taille=${grande ? 1600 : 480}` : grande ? p.srcGrande : p.src,
    };
  };
  const ouvrables = photos.filter((p) => p.etat !== 'verrouillee' || ouvert);
  const devoiler = (id: string) => setDevoilees((d) => [...d, id]);

  return (
    <>
      <div className="aod-photos-fiche">
        {photos.map((p) => (
          <figure key={p.id}>
            <Vignette photo={enPhoto(p)} hrefCoffre="/coffre-fort" devoilee={devoilees.includes(p.id)} onDevoiler={() => devoiler(p.id)}
              onOuvrir={() => setVue(ouvrables.findIndex((o) => o.id === p.id))} />
            {(p.etat !== 'verrouillee' || ouvert) && (
              <figcaption>
                {details[p.id]?.legende ?? p.legende}
                {(details[p.id]?.source ?? p.source) && <small>Source : {details[p.id]?.source ?? p.source}</small>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {vue !== null && vue >= 0 && (
        <Visionneuse photos={ouvrables.map((p) => enPhoto(p, true))} index={vue} onChanger={setVue} onFermer={() => setVue(null)}
          devoilees={devoilees} onDevoiler={devoiler} />
      )}
    </>
  );
}
